export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  category: "Panels" | "Tiles" | "Microcement";
  finish?: string;
  color?: string;
  tags: string[];
  image: string;
  description: string;
};

export const products: PublicProduct[] = [
  {
    id: "p1",
    slug: "uhpc-facade-panel",
    name: "UHPC Facade Panel",
    category: "Panels",
    finish: "Smooth",
    color: "Natural",
    tags: ["UHPC", "Exterior", "Lightweight"],
    image: "/images/panel-uhpc.jpg", // replace with actual
    description:
      "Ultra-High Performance Concrete panel engineered for exterior facades. Thin, strong, and weather resistant.",
  },
  {
    id: "p2",
    slug: "gfrc-interior-tile",
    name: "GFRC Interior Tile",
    category: "Tiles",
    finish: "Matte",
    color: "Charcoal",
    tags: ["GFRC", "Interior", "Modular"],
    image: "/images/tile-gfrc.jpg",
    description:
      "Modular GFRC tile system for walls and floors. Crisp edges with rich mineral texture.",
  },
  {
    id: "p3",
    slug: "microcement-finish",
    name: "Microcement Finish",
    category: "Microcement",
    finish: "Silk",
    color: "Warm Grey",
    tags: ["Microcement", "Thin coat", "Seamless"],
    image: "/images/microcement.jpg",
    description:
      "Seamless microcement finish for walls and furniture. Thin application with high durability.",
  },
];
