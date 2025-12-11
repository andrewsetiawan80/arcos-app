import SeriesDetailPage, { SeriesData } from "./SeriesDetailPage";

// Import images
import landmarkInstallation from "../assets/images/landmark-installation.webp";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.webp";
import structuralPanels from "../assets/images/structural-panels.webp";
import concretePanelDetail from "../assets/images/concrete-panel-detail.webp";
import concreteInstallation from "../assets/images/concrete-installation.webp";
import workshopCloseup from "../assets/images/workshop-closeup.webp";

const AERIS_SERIES: SeriesData = {
  name: "GFRC Aeris Series",
  tagline:
    "Light, versatile, and expressive — designed for sculptural panels and refined geometry.",
  materialType: "GFRC",

  // Hero
  heroImage: landmarkInstallation,

  // Overview
  overviewText:
    "Aeris is built on Glass Fiber Reinforced Concrete, offering the visual weight of concrete with significantly reduced mass. The series enables larger panels, curved forms, and complex geometries that would be impractical with traditional concrete. Aeris brings lightness without sacrificing architectural presence.",
  overviewBullets: {
    material: "Glass Fiber Reinforced Concrete (GFRC)",
    idealFor: "Large panels, façade cladding, curved forms, decorative screens",
    surfaceCharacter: "Smooth to textured, adaptable to mold detail",
  },

  // Applications
  applications: [
    { title: "Large wall panels and cladding" },
    { title: "Curved or complex forms" },
    { title: "Lightweight façade elements" },
    { title: "Decorative panels and screens" },
  ],

  // Technical
  technicalSpecs: [
    { label: "Base Material", value: "Glass Fiber Reinforced Concrete" },
    { label: "Thickness Range", value: "10mm – 25mm typical" },
    { label: "Flexural Strength", value: ">20 MPa" },
    { label: "Weight", value: "~20 kg/m² at 12mm" },
    { label: "Finish Options", value: "Smooth, brushed, veined, custom texture" },
  ],
  technicalNote:
    "This technical snapshot is meant as a starting point. For project-specific engineering, we prepare detailed specifications tailored to your conditions and installation method.",

  // Textures & Tones
  textureDescription:
    "The Aeris series offers a range of finishes from glass-smooth to subtly veined surfaces. Colors lean toward natural concrete tones with options for warm and cool variations that integrate with contemporary façades.",
  colorSwatches: [
    { name: "Cloud White", color: "#F0F0F0" },
    { name: "Sand Beige", color: "#E3DFD9" },
    { name: "Silver Grey", color: "#B8B8B8" },
    { name: "Slate", color: "#8A8A8A" },
    { name: "Graphite", color: "#5A5A5A" },
    { name: "Obsidian", color: "#333333" },
  ],

  // Gallery
  galleryImages: [
    { src: landmarkInstallation, alt: "GFRC façade installation" },
    { src: mosaicFacadeDetail, alt: "Panel detail" },
    { src: structuralPanels, alt: "Lightweight panels" },
    { src: concretePanelDetail, alt: "Surface texture" },
    { src: concreteInstallation, alt: "Installation process" },
    { src: workshopCloseup, alt: "Workshop craftsmanship" },
  ],
};

export default function SeriesGFRCAeris() {
  return <SeriesDetailPage series={AERIS_SERIES} />;
}
