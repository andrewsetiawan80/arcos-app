import SeriesDetailPage, { SeriesData } from "./SeriesDetailPage";

// Import images
import microcementInterior1 from "../assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.webp";
import microcementWalls from "../assets/images/minimalist-interior-design-with-concrete-walls-modern-furniture.webp";
import microcementInterior2 from "../assets/images/modern-concrete-interior-design-with-stone-sculptures-steps.webp";
import microcementStairs from "../assets/images/grey-microcement-stairs-stairs-viewed-from-modern-design-innovative-material-metal-railing.webp";
import concreteTexture2 from "../assets/images/concrete-texture-2.webp";
import workshopCloseup from "../assets/images/workshop-closeup.webp";

const MICROCEMENT_SERIES: SeriesData = {
  name: "Microcement Systems",
  tagline:
    "Seamless, tactile finishes for interiors that feel grounded yet minimal.",
  materialType: "Microcement",

  // Hero
  heroImage: microcementStairs,

  // Overview
  overviewText:
    "Microcement is a thin, continuous finishing system that transforms walls, floors, and furniture into seamless surfaces. Applied in layers over existing substrates, it creates a unified, tactile environment ideal for contemporary interiors. The system combines durability with visual softness — modern yet warm.",
  overviewBullets: {
    material: "Polymer-modified cementitious overlay",
    idealFor: "Bathrooms, living areas, counters, furniture, feature walls",
    surfaceCharacter: "Seamless, tactile, softly matte with natural variation",
  },

  // Applications
  applications: [
    { title: "Bathroom walls and floors" },
    { title: "Living areas and circulation spaces" },
    { title: "Counters and built-in furniture" },
    { title: "Feature niches and cabinetry fronts" },
  ],

  // Technical
  technicalSpecs: [
    { label: "Base Material", value: "Polymer-modified microcement" },
    { label: "Thickness Range", value: "2mm – 3mm total system" },
    { label: "Suitable Substrates", value: "Concrete, plaster, tiles, MDF, plywood" },
    { label: "Finish Options", value: "Matte, satin, polished" },
    { label: "Water Resistance", value: "Sealed system suitable for wet areas" },
  ],
  technicalNote:
    "This technical snapshot is meant as a starting point. For project-specific engineering, we prepare detailed specifications tailored to your conditions and installation method.",

  // Textures & Tones
  textureDescription:
    "Microcement surfaces feature subtle tonal variations and a hand-applied character that brings warmth to minimal spaces. Our palette ranges from cool concrete tones to warmer earth-inspired hues.",
  colorSwatches: [
    { name: "Bone White", color: "#F8F6F3" },
    { name: "Linen", color: "#EBE6DF" },
    { name: "Dove Grey", color: "#D0CCC6" },
    { name: "Cement", color: "#A9A9A9" },
    { name: "Fossil", color: "#7D7D7D" },
    { name: "Charcoal", color: "#4A4A4A" },
  ],

  // Gallery
  galleryImages: [
    { src: microcementStairs, alt: "Microcement stairs" },
    { src: microcementInterior1, alt: "Minimalist interior" },
    { src: microcementWalls, alt: "Seamless wall finish" },
    { src: microcementInterior2, alt: "Living space application" },
    { src: concreteTexture2, alt: "Surface texture detail" },
    { src: workshopCloseup, alt: "Application technique" },
  ],
};

export default function SeriesMicrocement() {
  return <SeriesDetailPage series={MICROCEMENT_SERIES} />;
}
