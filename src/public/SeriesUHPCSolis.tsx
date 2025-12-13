import SeriesDetailPage, { SeriesData } from "./SeriesDetailPage";

// Import images
import workshopCloseup from "../assets/images/workshop-closeup.webp";
import concretePanelDetail from "../assets/images/concrete-panel-detail.webp";
import structuralPanels from "../assets/images/structural-panels.webp";
import concreteTexture2 from "../assets/images/concrete-texture-2.webp";
import landmarkInstallation from "../assets/images/landmark-installation.webp";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.webp";

const SOLIS_SERIES: SeriesData = {
  name: "UHPC Solis Series",
  tagline:
    "UHPC surface series that expresses permanence, clarity, and structural calm.",
  materialType: "UHPC",

  // Hero
  heroImage: workshopCloseup,

  // Overview
  overviewText:
    "Solis is built on Ultra High Performance Concrete, designed for applications where slender thickness meets long-term durability. The series emphasizes quiet strength, refined texture, and a calm architectural presence. Each surface is engineered to perform under demanding conditions while maintaining visual elegance.",
  overviewBullets: {
    material: "Ultra High Performance Concrete (UHPC)",
    idealFor: "Feature walls, sculptural elements, benches, exterior details",
    surfaceCharacter: "Matte, refined, softly textured with subtle variation",
  },

  // Applications
  applications: [
    { title: "Feature walls with structural presence" },
    { title: "Benches and sculptural elements" },
    { title: "Exterior details and thin architectural planes" },
    { title: "Custom pieces requiring high strength" },
  ],

  // Technical
  technicalSpecs: [
    { label: "Base Material", value: "Ultra High Performance Concrete" },
    { label: "Thickness Range", value: "12mm – 40mm typical" },
    { label: "Compressive Strength", value: ">120 MPa" },
    { label: "Weight", value: "~30 kg/m² at 12mm" },
    { label: "Finish Options", value: "Smooth, sandblasted, acid-etched, textured" },
  ],
  technicalNote:
    "This technical snapshot is meant as a starting point. For project-specific engineering, we prepare detailed specifications tailored to your conditions and installation method.",

  // Textures & Tones
  textureDescription:
    "The Solis series focuses on subtle texture and tonal variation that complements modern interiors and architecture. Colors are curated to feel grounded, neutral, and timeless — from warm greys to deep charcoal.",
  colorSwatches: [
    { name: "Pure White", color: "#F5F5F5" },
    { name: "Soft Stone", color: "#E8E4DF" },
    { name: "Warm Grey", color: "#C4C0BA" },
    { name: "Natural Cement", color: "#A8A8A8" },
    { name: "Deep Charcoal", color: "#4A4A4A" },
    { name: "Anthracite", color: "#2D2D2D" },
  ],

  // Gallery
  galleryImages: [
    { src: workshopCloseup, alt: "UHPC surface detail" },
    { src: concretePanelDetail, alt: "Panel texture closeup" },
    { src: structuralPanels, alt: "Structural panels installation" },
    { src: concreteTexture2, alt: "Surface texture variation" },
    { src: landmarkInstallation, alt: "Landmark installation" },
    { src: mosaicFacadeDetail, alt: "Facade detail" },
  ],
};

export default function SeriesUHPCSolis() {
  return <SeriesDetailPage series={SOLIS_SERIES} />;
}

