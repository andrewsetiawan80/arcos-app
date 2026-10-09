import React, { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, MeshReflectorMaterial } from "@react-three/drei";
// postprocessing imports removed for performance
import * as THREE from "three";
import type { Product, ProductVariant } from "../../types";
import type {
  WallSegment,
  FloorConfig,
  CeilingConfig,
  WallPaintConfig,
  TileFinish,
} from "./visualizerTypes";
import { TILE_FINISH_PBR } from "./visualizerTypes";
import {
  computeSegmentPositions,
  computeFloorPolygon,
  getLayoutBounds,
  computeEnclosingWalls,
} from "./visualizerUtils";
import { createBakedTileCanvas } from "./tileBaking";

export type RoomSceneProps = {
  segments: WallSegment[];
  floor: FloorConfig;
  ceiling: CeilingConfig;
  wallPaint: WallPaintConfig;
  wallHeight: number;
  groutWidthMm?: number;
  groutColor?: string;
  mirrorH?: boolean;
  mirrorV?: boolean;
  selectedSegmentId: string | "floor" | "ceiling" | null;
  onSegmentClick?: (id: string | "floor" | "ceiling") => void;
};

function getTextureUrl(p: Product): string | undefined {
  return p.textureUrl || p.coverImageUrl;
}

function createGroutNormalMap(
  cellW: number,
  cellH: number,
  groutPx: number
): THREE.DataTexture {
  const data = new Uint8Array(cellW * cellH * 4);
  const tileInnerX0 = groutPx / 2;
  const tileInnerY0 = groutPx / 2;
  const tileInnerX1 = cellW - groutPx / 2;
  const tileInnerY1 = cellH - groutPx / 2;
  const bevelPx = Math.max(1, Math.floor(groutPx * 0.3));

  for (let y = 0; y < cellH; y++) {
    for (let x = 0; x < cellW; x++) {
      const i = (y * cellW + x) * 4;
      let nz = 1;
      const inGroutX = x < tileInnerX0 || x >= tileInnerX1;
      const inGroutY = y < tileInnerY0 || y >= tileInnerY1;
      const inTile = !inGroutX && !inGroutY;
      if (!inTile) {
        const distX = inGroutX
          ? Math.min(
              Math.abs(x - tileInnerX0),
              Math.abs(x - (tileInnerX1 - 1))
            )
          : 999;
        const distY = inGroutY
          ? Math.min(
              Math.abs(y - tileInnerY0),
              Math.abs(y - (tileInnerY1 - 1))
            )
          : 999;
        const distToEdge = Math.min(distX, distY);
        const t = Math.min(1, distToEdge / bevelPx);
        nz = 0.3 + 0.7 * t;
      }
      data[i] = 128;
      data[i + 1] = 128;
      data[i + 2] = Math.round(nz * 255);
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, cellW, cellH, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function createPaintNormalMap(size: number): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const nx = Math.sin(x * 0.15) * Math.cos(y * 0.12) * 0.04;
      const ny = Math.sin(y * 0.18) * Math.cos(x * 0.1) * 0.04;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      data[i] = Math.round((nx + 1) * 127.5);
      data[i + 1] = Math.round((ny + 1) * 127.5);
      data[i + 2] = Math.round((nz + 1) * 127.5);
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function createRoughnessMap(
  cellW: number,
  cellH: number,
  groutPx: number
): THREE.DataTexture {
  const data = new Uint8Array(cellW * cellH);
  const tileInnerX0 = groutPx / 2;
  const tileInnerY0 = groutPx / 2;
  const tileInnerX1 = cellW - groutPx / 2;
  const tileInnerY1 = cellH - groutPx / 2;
  for (let y = 0; y < cellH; y++) {
    for (let x = 0; x < cellW; x++) {
      const inGroutX = x < tileInnerX0 || x >= tileInnerX1;
      const inGroutY = y < tileInnerY0 || y >= tileInnerY1;
      const inGrout = inGroutX || inGroutY;
      data[y * cellW + x] = Math.round((inGrout ? 0.85 : 0.25) * 255);
    }
  }
  const tex = new THREE.DataTexture(data, cellW, cellH, THREE.RedFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function createBakedGroutTexture(
  tileImgUrl: string | undefined,
  tileWmm: number,
  tileHmm: number,
  groutWmm: number,
  groutColor: string,
  mirrorH: boolean,
  mirrorV: boolean
): Promise<{
  texture: THREE.CanvasTexture;
  cellW: number;
  cellH: number;
  groutPx: number;
}> {
  return new Promise((resolve) => {
    const pxPerMm = 1; // Reduced from 2 to further cut texture memory
    const cellW = Math.ceil((tileWmm + groutWmm) * pxPerMm);
    const cellH = Math.ceil((tileHmm + groutWmm) * pxPerMm);
    const groutPx = groutWmm * pxPerMm;
    const finish = (canvas: HTMLCanvasElement, actualCellW?: number, actualCellH?: number) => {
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      const cw = actualCellW ?? cellW;
      const ch = actualCellH ?? cellH;
      resolve({ texture: tex, cellW: cw, cellH: ch, groutPx });
    };
    if (tileImgUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = createBakedTileCanvas(
          img,
          tileWmm,
          tileHmm,
          groutWmm,
          groutColor,
          { preserveAlpha: false, mirrorH, mirrorV }
        );
        finish(canvas, canvas.width, canvas.height);
      };
      img.onerror = () => {
        const canvas = document.createElement("canvas");
        canvas.width = cellW;
        canvas.height = cellH;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ddd";
          ctx.fillRect(0, 0, cellW, cellH);
        }
        finish(canvas, cellW, cellH);
      };
      img.src = tileImgUrl;
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = cellW;
      canvas.height = cellH;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ddd";
        ctx.fillRect(0, 0, cellW, cellH);
      }
      finish(canvas, cellW, cellH);
    }
  });
}

function TiledWall({
  width,
  height,
  product,
  variant,
  finish,
  groutWidthMm,
  groutColor,
  mirrorH,
  mirrorV,
  isSelected,
  onClick,
}: {
  width: number;
  height: number;
  product: Product | null;
  variant: ProductVariant | null;
  finish: TileFinish;
  groutWidthMm: number;
  groutColor: string;
  mirrorH?: boolean;
  mirrorV?: boolean;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const tileWmm = product?.size?.w_mm ?? 600;
  const tileHmm = product?.size?.h_mm ?? 600;
  const groutW = groutWidthMm / 1000;
  const baseCellW = tileWmm / 1000 + groutW;
  const baseCellH = tileHmm / 1000 + groutW;
  const cellW = (mirrorH ? 2 : 1) * baseCellW;
  const cellH = (mirrorV ? 2 : 1) * baseCellH;

  const [texture, setTexture] = React.useState<THREE.CanvasTexture | null>(null);
  const [normalMap, setNormalMap] = React.useState<THREE.DataTexture | null>(null);
  const [roughnessMap, setRoughnessMap] = React.useState<THREE.DataTexture | null>(null);

  React.useEffect(() => {
    const imgUrl = product ? getTextureUrl(product) : undefined;
    createBakedGroutTexture(
      imgUrl,
      tileWmm,
      tileHmm,
      groutWidthMm,
      groutColor,
      mirrorH ?? false,
      mirrorV ?? false
    ).then(({ texture: tex, cellW: cw, cellH: ch, groutPx }) => {
      tex.repeat.set(width / cellW, height / cellH);
      tex.needsUpdate = true;
      setTexture(tex);
      const nMap = createGroutNormalMap(cw, ch, groutPx);
      nMap.repeat.copy(tex.repeat);
      nMap.offset.copy(tex.offset);
      setNormalMap(nMap);
      const rMap = createRoughnessMap(cw, ch, groutPx);
      rMap.repeat.copy(tex.repeat);
      rMap.offset.copy(tex.offset);
      setRoughnessMap(rMap);
    });
  }, [product, groutWidthMm, groutColor, mirrorH, mirrorV, width, height, cellW, cellH, tileWmm, tileHmm]);

  React.useEffect(() => {
    if (!texture) return;
    const caps = (gl as THREE.WebGLRenderer).capabilities;
    if (caps?.getMaxAnisotropy) {
      texture.anisotropy = Math.min(16, caps.getMaxAnisotropy());
    }
  }, [texture, gl]);

  useFrame(() => {
    if (!meshRef.current || !isSelected) return;
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    if (!mat.emissive) return;
    const t = performance.now() * 0.002;
    mat.emissiveIntensity = 0.02 + 0.015 * Math.sin(t);
  });

  const pbr = TILE_FINISH_PBR[finish];
  const color = variant?.color
    ? new THREE.Color(variant.color)
    : new THREE.Color("#ffffff");

  return (
    <mesh
      ref={meshRef}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <planeGeometry args={[width, height]} />
      <meshPhysicalMaterial
        map={texture || undefined}
        normalMap={normalMap || undefined}
        normalScale={new THREE.Vector2(0.8, 0.8)}
        roughnessMap={roughnessMap || undefined}
        roughness={pbr.roughness}
        metalness={0}
        clearcoat={pbr.clearcoat}
        clearcoatRoughness={0.4}
        envMapIntensity={pbr.envMapIntensity}
        color={color}
        emissive={isSelected ? new THREE.Color("#ffffff") : undefined}
        emissiveIntensity={isSelected ? 0.02 : 0}
      />
    </mesh>
  );
}

const BASEBOARD_HEIGHT = 0.08;
const BASEBOARD_DEPTH = 0.015;

function darkenHex(hex: string, amount: number): string {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) - amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) - amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) - amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function Baseboard({
  position,
  rotation,
  width,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  color: string;
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <boxGeometry args={[width, BASEBOARD_HEIGHT, BASEBOARD_DEPTH]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.85}
        metalness={0}
        envMapIntensity={0.25}
      />
    </mesh>
  );
}

const paintNormalMap = createPaintNormalMap(128);

function PaintWall({
  width,
  height,
  color,
  roughness,
  isSelected,
  onClick,
}: {
  width: number;
  height: number;
  color: string;
  roughness: number;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!meshRef.current || !isSelected) return;
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    if (!mat.emissive) return;
    const t = performance.now() * 0.002;
    mat.emissiveIntensity = 0.02 + 0.015 * Math.sin(t);
  });
  return (
    <mesh
      ref={meshRef}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <planeGeometry args={[width, height]} />
      <meshPhysicalMaterial
        color={color}
        roughness={roughness}
        metalness={0}
        envMapIntensity={0.3}
        normalMap={paintNormalMap}
        normalScale={new THREE.Vector2(0.3, 0.3)}
        emissive={isSelected ? new THREE.Color("#ffffff") : undefined}
        emissiveIntensity={isSelected ? 0.02 : 0}
      />
    </mesh>
  );
}

function TiledFloor({
  width,
  height,
  product,
  variant,
  finish,
  groutWidthMm,
  groutColor,
  mirrorH,
  mirrorV,
  isSelected,
  onClick,
}: {
  width: number;
  height: number;
  product: Product | null;
  variant: ProductVariant | null;
  finish: TileFinish;
  groutWidthMm: number;
  groutColor: string;
  mirrorH?: boolean;
  mirrorV?: boolean;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const tileWmm = product?.size?.w_mm ?? 600;
  const tileHmm = product?.size?.h_mm ?? 600;
  const groutW = groutWidthMm / 1000;
  const baseCellW = tileWmm / 1000 + groutW;
  const baseCellH = tileHmm / 1000 + groutW;
  const cellW = (mirrorH ? 2 : 1) * baseCellW;
  const cellH = (mirrorV ? 2 : 1) * baseCellH;

  const [texture, setTexture] = React.useState<THREE.CanvasTexture | null>(null);
  const [normalMap, setNormalMap] = React.useState<THREE.DataTexture | null>(null);
  const [roughnessMap, setRoughnessMap] = React.useState<THREE.DataTexture | null>(null);

  React.useEffect(() => {
    const imgUrl = product ? getTextureUrl(product) : undefined;
    createBakedGroutTexture(
      imgUrl,
      tileWmm,
      tileHmm,
      groutWidthMm,
      groutColor,
      mirrorH ?? false,
      mirrorV ?? false
    ).then(({ texture: tex, cellW: cw, cellH: ch, groutPx }) => {
      tex.repeat.set(width / cellW, height / cellH);
      tex.needsUpdate = true;
      setTexture(tex);
      const nMap = createGroutNormalMap(cw, ch, groutPx);
      nMap.repeat.copy(tex.repeat);
      nMap.offset.copy(tex.offset);
      setNormalMap(nMap);
      const rMap = createRoughnessMap(cw, ch, groutPx);
      rMap.repeat.copy(tex.repeat);
      rMap.offset.copy(tex.offset);
      setRoughnessMap(rMap);
    });
  }, [product, groutWidthMm, groutColor, mirrorH, mirrorV, width, height, cellW, cellH, tileWmm, tileHmm]);

  React.useEffect(() => {
    if (!texture) return;
    const caps = (gl as THREE.WebGLRenderer).capabilities;
    if (caps?.getMaxAnisotropy) {
      texture.anisotropy = Math.min(16, caps.getMaxAnisotropy());
    }
  }, [texture, gl]);

  useFrame(() => {
    if (!meshRef.current || !isSelected) return;
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    if (!mat.emissive) return;
    const t = performance.now() * 0.002;
    mat.emissiveIntensity = 0.02 + 0.015 * Math.sin(t);
  });

  const pbr = TILE_FINISH_PBR[finish];
  const color = variant?.color
    ? new THREE.Color(variant.color)
    : new THREE.Color("#ffffff");

  return (
    <mesh
      ref={meshRef}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "default")}
    >
      <planeGeometry args={[width, height]} />
      <MeshReflectorMaterial
        map={texture || undefined}
        normalMap={normalMap || undefined}
        normalScale={new THREE.Vector2(0.8, 0.8)}
        roughnessMap={roughnessMap || undefined}
        roughness={pbr.roughness}
        metalness={0}
        color={color}
        emissive={isSelected ? new THREE.Color("#ffffff") : undefined}
        emissiveIntensity={isSelected ? 0.02 : 0}
        blur={[256, 256]}
        resolution={1024}
        mixBlur={0.8}
        mixStrength={0.4}
        mirror={0.5}
        depthScale={1.2}
        minDepthThreshold={0.9}
        maxDepthThreshold={1}
        envMapIntensity={pbr.envMapIntensity}
      />
    </mesh>
  );
}

function RoomContent(props: RoomSceneProps) {
  const {
    segments,
    floor,
    ceiling,
    wallPaint,
    wallHeight,
    groutWidthMm = 2,
    groutColor = "#888888",
    mirrorH = false,
    mirrorV = false,
    selectedSegmentId,
    onSegmentClick,
  } = props;

  const positions = useMemo(
    () => computeSegmentPositions(segments, wallHeight),
    [segments, wallHeight]
  );

  const floorPoly = useMemo(
    () => computeFloorPolygon(segments, wallHeight),
    [segments, wallHeight]
  );

  const floorBounds = useMemo(() => {
    if (floorPoly.length === 0) return { width: 1, height: 1, cx: 0, cz: 0 };
    let minX = floorPoly[0][0], maxX = floorPoly[0][0];
    let minZ = floorPoly[0][1], maxZ = floorPoly[0][1];
    for (const [x, z] of floorPoly) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
    return {
      width: maxX - minX || 1,
      height: maxZ - minZ || 1,
      cx: (minX + maxX) / 2,
      cz: (minZ + maxZ) / 2,
    };
  }, [floorPoly]);

  const enclosingWalls = useMemo(
    () => computeEnclosingWalls(segments, wallHeight, floor.enabled),
    [segments, wallHeight, floor.enabled]
  );

  const baseboardColor = darkenHex(wallPaint.color, 25);

  const floorNormalMap = useMemo(() => {
    const tex = paintNormalMap.clone();
    tex.repeat.set(floorBounds.width / 2, floorBounds.height / 2);
    return tex;
  }, [floorBounds.width, floorBounds.height]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 3]}
        intensity={0.6}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />
      <directionalLight
        position={[4, 5, 6]}
        intensity={0.4}
        color="#fff5e6"
      />
      <hemisphereLight
        color="#ffffff"
        groundColor="#e8e4dc"
        intensity={0.4}
      />

      {positions.map((pos) => {
        const seg = segments.find((s) => s.id === pos.id);
        if (!seg) return null;
        const hasTiles = !!seg.material.product?.product;
        return (
          <group
            key={pos.id}
            position={pos.position}
            rotation={pos.rotation}
          >
            {floor.enabled && (
              <Baseboard
                position={[0, -pos.height / 2 + BASEBOARD_HEIGHT / 2, BASEBOARD_DEPTH / 2]}
                rotation={[0, 0, 0]}
                width={pos.width}
                color={baseboardColor}
              />
            )}
            {hasTiles ? (
              <TiledWall
                width={pos.width}
                height={pos.height}
                product={seg.material.product?.product ?? null}
                variant={seg.material.product?.variant ?? null}
                finish={seg.material.finish}
                groutWidthMm={groutWidthMm}
                groutColor={groutColor}
                mirrorH={mirrorH}
                mirrorV={mirrorV}
                isSelected={selectedSegmentId === pos.id}
                onClick={() => onSegmentClick?.(pos.id)}
              />
            ) : (
              <PaintWall
                width={pos.width}
                height={pos.height}
                color={wallPaint.color}
                roughness={wallPaint.roughness}
                isSelected={selectedSegmentId === pos.id}
                onClick={() => onSegmentClick?.(pos.id)}
              />
            )}
          </group>
        );
      })}

      {enclosingWalls.map((wall, i) => (
        <group
          key={`encl-${i}`}
          position={wall.position}
          rotation={wall.rotation}
        >
          <Baseboard
            position={[0, -wall.height / 2 + BASEBOARD_HEIGHT / 2, BASEBOARD_DEPTH / 2]}
            rotation={[0, 0, 0]}
            width={wall.width}
            color={baseboardColor}
          />
          <PaintWall
            width={wall.width}
            height={wall.height}
            color={wallPaint.color}
            roughness={wallPaint.roughness}
            isSelected={false}
          />
        </group>
      ))}

      {floor.enabled && (
        <group
          position={[floorBounds.cx, 0, floorBounds.cz]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {floor.material.product?.product ? (
            <TiledFloor
              width={floorBounds.width}
              height={floorBounds.height}
              product={floor.material.product.product}
              variant={floor.material.product.variant}
              finish={floor.material.finish}
              groutWidthMm={groutWidthMm}
              groutColor={groutColor}
              mirrorH={mirrorH}
              mirrorV={mirrorV}
              isSelected={selectedSegmentId === "floor"}
              onClick={() => onSegmentClick?.("floor")}
            />
          ) : (
            <mesh
              onClick={() => onSegmentClick?.("floor")}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => (document.body.style.cursor = "default")}
            >
              <planeGeometry args={[floorBounds.width, floorBounds.height]} />
              <meshPhysicalMaterial
                color="#e5e2d8"
                roughness={0.92}
                metalness={0}
                envMapIntensity={0.3}
                normalMap={floorNormalMap}
                normalScale={new THREE.Vector2(0.25, 0.25)}
                emissive={selectedSegmentId === "floor" ? new THREE.Color("#ffffff") : undefined}
                emissiveIntensity={selectedSegmentId === "floor" ? 0.02 : 0}
              />
            </mesh>
          )}
        </group>
      )}

      {ceiling.enabled && floor.enabled && (
        <mesh
          position={[floorBounds.cx, wallHeight, floorBounds.cz]}
          rotation={[Math.PI / 2, 0, 0]}
          onClick={() => onSegmentClick?.("ceiling")}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => (document.body.style.cursor = "default")}
        >
          <planeGeometry args={[floorBounds.width, floorBounds.height]} />
          <meshPhysicalMaterial
            color={ceiling.style.color}
            roughness={ceiling.style.roughness}
            metalness={0}
            envMapIntensity={0.3}
            normalMap={floorNormalMap}
            normalScale={new THREE.Vector2(0.15, 0.15)}
            emissive={selectedSegmentId === "ceiling" ? new THREE.Color("#ffffff") : undefined}
            emissiveIntensity={selectedSegmentId === "ceiling" ? 0.02 : 0}
          />
        </mesh>
      )}

      {/* ContactShadows removed for performance -- the directional light shadow is sufficient */}

      <mesh position={[floorBounds.cx, -0.02, floorBounds.cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[floorBounds.width + 4, floorBounds.height + 4]} />
        <meshPhysicalMaterial color="#151515" roughness={1} metalness={0} />
      </mesh>
    </>
  );
}

// Post-processing removed entirely for performance.
// The Canvas already has toneMapping={THREE.ACESFilmicToneMapping} set.

function AnisotropySetter() {
  const { gl } = useThree();
  useEffect(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy?.();
    if (maxAniso) {
      THREE.Texture.DEFAULT_ANISOTROPY = Math.min(16, maxAniso);
    }
  }, [gl]);
  return null;
}

function SceneBackground() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color("#242019");
  }, [scene]);
  return null;
}

export default function RoomScene(props: RoomSceneProps) {
  const { segments, wallHeight } = props;
  const { center, size } = useMemo(
    () => getLayoutBounds(segments, wallHeight),
    [segments, wallHeight]
  );

  const target = useMemo(
    () => [center[0], center[1], center[2]] as const,
    [center]
  );

  const camDist = size * 1.1;

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-gradient-to-b from-[#2a2520] to-[#1a1815]">
      <Canvas
        camera={{
          position: [
            center[0] + camDist * 0.5,
            center[1] + camDist * 0.35,
            center[2] + camDist * 0.5,
          ],
          fov: 45,
        }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
        }}
        dpr={1}
      >
        <AnisotropySetter />
        <SceneBackground />
        <Suspense fallback={null}>
          <RoomContent {...props} />
          <OrbitControls
            target={target}
            enablePan
            minDistance={1}
            maxDistance={20}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
