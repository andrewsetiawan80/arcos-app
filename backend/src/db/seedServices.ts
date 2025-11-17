import pool from './client';

// Services data converted from PublicServices.tsx
const SERVICES = [
  // Seamless Applied Finishes
  {
    title: "Seamless Microcement",
    description: "Featherweight overlays that wrap floors, walls, and furniture with monolithic tactility. Applied directly to substrates for seamless, joint-free surfaces. Ideal for hospitality, retail, and residences needing a continuous aesthetic.",
    points: ["2–3 mm applied thickness on existing substrates", "60+ curated palettes + custom pigmentation", "Moisture and UV-resistant sealants", "Seamless application - no joints"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/inspiration/microcement-01.png",
    category: "Seamless Applied Finishes",
    displayOrder: 1,
  },
  {
    title: "Polished Concrete Overlay",
    description: "Brings the depth of polished concrete into spaces where traditional slabs aren't feasible. Applied as a seamless overlay with high abrasion resistance.",
    points: ["10 mm applied overlay on sound substrates", "High mechanical strength for heavy traffic", "Custom swirls, metal powders, and veining", "Seamless finish"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/workshop-closeup.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 2,
  },
  {
    title: "Terrazzo Overlay System",
    description: "Terrazzo systems with natural marble, quartz, or metal aggregates. Applied as thin seamless overlays directly on-site for continuous surfaces.",
    points: ["Applied overlay system - seamless finish", "Hand-seeded aggregates", "CNC templates & detailed edging", "Custom aggregate combinations"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/landmark-installation.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 3,
  },
  {
    title: "Optical Effect Finishes",
    description: "Decorative applied finish for walls and floors with optical effects. Creates depth and movement through light reflection - applied seamlessly on-site.",
    points: ["Unique optical effects", "Seamless application", "Customizable patterns and colors", "Applied finish - no joints"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/concrete-texture-2.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 4,
  },
  {
    title: "Acid-Stain Finishes",
    description: "Hybrid applied finish combining cement and acid staining techniques. Creates unique, organic patterns with rich color variations directly on substrates.",
    points: ["Organic, natural patterns", "Rich color variations", "Applied directly to surfaces", "Seamless finish"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/concrete-finish.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 5,
  },
  {
    title: "High-Performance Overlay",
    description: "Ultra-resistant continuous surface system applied on-site. Ideal for high-traffic commercial areas requiring seamless, durable finishes.",
    points: ["Seamless applied system", "Ultra-resistant formulation", "Commercial-grade performance", "Joint-free surfaces"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/structural-panels.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 6,
  },
  {
    title: "Seamless Wall Coating",
    description: "Transform walls with seamless microcement finishes applied directly on-site. Perfect for bathrooms, kitchens, and feature walls with custom textures and colors.",
    points: ["Seamless application on vertical surfaces", "Applied directly to walls", "Water-resistant for wet areas", "Custom textures: smooth, brushed, or textured"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/inspiration/microcement-02.png",
    category: "Seamless Applied Finishes",
    displayOrder: 7,
  },
  {
    title: "Natural Lime Wall Finish",
    description: "Natural lime-based finish applied directly to walls with earthy, textured surfaces. Inspired by traditional craftsmanship, creates breathable, seamless surfaces.",
    points: ["Applied directly to walls", "Natural lime-based finish", "Earthy textures", "Breathable surface"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/mosaic-interior.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 8,
  },
  {
    title: "Warm Terracotta Finish",
    description: "Lime-based wall finish applied on-site with warm, terracotta-inspired tones. Creates a Mediterranean aesthetic with natural texture and seamless application.",
    points: ["Applied finish", "Warm terracotta tones", "Natural texture", "Breathable finish"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/concrete-finish.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 9,
  },
  {
    title: "Premium Lime Finish",
    description: "Premium lime-based finish applied seamlessly on walls with refined texture and elegant appearance. Perfect for sophisticated interior wall applications.",
    points: ["Seamless application", "Refined texture", "Elegant appearance", "Premium finish"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/concrete-texture-2.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 10,
  },
  {
    title: "Metallic Effect Coating",
    description: "Hybrid wall finish applied on-site combining cementitious materials with metallic effects. Creates contemporary, industrial aesthetics with seamless finish.",
    points: ["Applied coating system", "Metallic effects", "Contemporary design", "Industrial aesthetics"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/inspiration/textured-microcement-01.png",
    category: "Seamless Applied Finishes",
    displayOrder: 11,
  },
  {
    title: "Marble Effect Finish",
    description: "Decorative finish applied directly to walls that recreates the look of natural marble with cementitious materials. Perfect for feature walls and luxury interiors.",
    points: ["Applied finish", "Marble-like appearance", "Custom veining patterns", "Suitable for walls and columns"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/concrete-texture-2.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 12,
  },
  {
    title: "Venetian Plaster Effect",
    description: "Traditional Venetian plaster finish applied on-site with modern cementitious base. Creates elegant, textured surfaces with depth and character.",
    points: ["Applied finish", "Venetian plaster aesthetic", "Breathable finish", "Multiple texture options"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/concrete-finish.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 13,
  },
  {
    title: "Commercial Grade Overlay",
    description: "Enhanced seamless overlay system with increased thickness and durability for high-traffic commercial applications. Applied directly on-site.",
    points: ["Applied overlay system", "3-5mm thickness", "Enhanced durability", "Commercial-grade performance"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 14,
  },
  {
    title: "Advanced Optical Finish",
    description: "Advanced optical concrete finish applied on-site with enhanced light-reflecting properties and customizable patterns for dramatic visual effects.",
    points: ["Applied finish", "Enhanced optical effects", "Custom pattern options", "Premium finish quality"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/concrete-texture-2.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 15,
  },
  {
    title: "Rustic Lime Finish",
    description: "Rustic lime-based finish applied on-site with textured, aged appearance. Perfect for creating authentic, weathered surfaces with seamless application.",
    points: ["Applied finish", "Rustic texture", "Aged appearance", "Natural lime base"],
    accent: "Applied Finishes",
    imageUrl: "/assets/images/mosaic-interior.jpg",
    category: "Seamless Applied Finishes",
    displayOrder: 16,
  },
  // Outdoor Applied Finishes
  {
    title: "Weather-Resistant Floor Coating",
    description: "Cement-based outdoor floor system applied directly on-site. Designed for durability and aesthetic appeal in exterior environments. Perfect for terraces, patios, and outdoor spaces.",
    points: ["Applied directly to outdoor substrates", "Weather-resistant formulation", "UV and freeze-thaw resistant", "Non-slip surface options"],
    accent: "Outdoor Applied",
    imageUrl: "/assets/images/landmark-installation.jpg",
    category: "Outdoor Applied Finishes",
    displayOrder: 17,
  },
  {
    title: "Natural Stone Effect Flooring",
    description: "Premium outdoor flooring system with natural stone aesthetics. Applied seamlessly on-site, combining durability with sophisticated design for exterior applications.",
    points: ["Seamless applied finish", "Natural stone appearance", "High durability", "Suitable for driveways and walkways"],
    accent: "Outdoor Applied",
    imageUrl: "/assets/images/inspiration/3d-tile-01.png",
    category: "Outdoor Applied Finishes",
    displayOrder: 18,
  },
  {
    title: "Patterned Concrete Floors",
    description: "Decorative concrete system applied on-site that mimics natural materials like stone, brick, or wood. Perfect for outdoor patios, driveways, and walkways.",
    points: ["Applied finish system", "Multiple pattern options", "Cost-effective solution", "Durable outdoor finish"],
    accent: "Outdoor Applied",
    imageUrl: "/assets/images/concrete-installation.jpg",
    category: "Outdoor Applied Finishes",
    displayOrder: 19,
  },
  {
    title: "Custom Stenciled Floors",
    description: "Custom stenciled concrete floor system applied on-site for outdoor applications. Allows for intricate designs and patterns with seamless finish.",
    points: ["Applied on-site", "Custom stencil designs", "Outdoor durability", "Versatile pattern options"],
    accent: "Outdoor Applied",
    imageUrl: "/assets/images/mosaic-facade-detail.jpg",
    category: "Outdoor Applied Finishes",
    displayOrder: 20,
  },
  {
    title: "Outdoor Seamless Coating",
    description: "Weather-resistant seamless coating formulation applied on-site for exterior applications including terraces, balconies, and outdoor spaces.",
    points: ["Applied finish", "UV and weather resistant", "Non-slip options", "Seamless outdoor surfaces"],
    accent: "Outdoor Applied",
    imageUrl: "/assets/images/modern-concrete-interior-design-with-stone-sculptures-steps.jpg",
    category: "Outdoor Applied Finishes",
    displayOrder: 21,
  },
  // Precast Panels & Tiles
  {
    title: "3D Textured Tiles",
    description: "Innovative three-dimensional precast concrete tiles that add depth, texture, and visual interest to interior and exterior walls. Prefabricated for easy installation.",
    points: ["Precast tiles - ready to install", "Multiple 3D patterns and textures", "Lightweight and easy to install", "Custom designs available"],
    accent: "Precast Tiles",
    imageUrl: "/assets/images/inspiration/3d-tile-01.png",
    category: "Precast Panels & Tiles",
    displayOrder: 22,
  },
  {
    title: "Precast Wall Panels",
    description: "High-performance precast concrete wall panels engineered for durability and aesthetic appeal. Fabricated off-site, ready for installation on facades and interior feature walls.",
    points: ["Precast precision manufacturing", "Custom sizes and finishes", "Weather-resistant formulations", "Ready-to-install panels"],
    accent: "Precast Panels",
    imageUrl: "/assets/images/inspiration/3d-tile-02.png",
    category: "Precast Panels & Tiles",
    displayOrder: 23,
  },
  {
    title: "Textured Precast Panels",
    description: "Architectural precast concrete panels with custom textures, patterns, and surface finishes. Fabricated off-site, create unique facades and interior surfaces.",
    points: ["Precast panels", "Custom texture options", "Large format panels", "Ready for installation"],
    accent: "Precast Panels",
    imageUrl: "/assets/images/inspiration/3d-tile-03.png",
    category: "Precast Panels & Tiles",
    displayOrder: 24,
  },
  {
    title: "Modular Tile Systems",
    description: "Modular precast concrete tile systems for walls and floors. Interlocking design allows for quick installation and versatile pattern configurations.",
    points: ["Precast modular system", "Interlocking design", "Quick installation", "Pattern flexibility"],
    accent: "Precast Tiles",
    imageUrl: "/assets/images/mosaic-facade-detail.jpg",
    category: "Precast Panels & Tiles",
    displayOrder: 25,
  },
  {
    title: "Lightweight Thin Panels",
    description: "Ultra-thin lightweight precast concrete panels for interior and exterior applications. Perfect for renovations and projects requiring minimal structural load.",
    points: ["Precast thin panels", "Lightweight construction", "Thin profile", "Versatile applications"],
    accent: "Precast Panels",
    imageUrl: "/assets/images/inspiration/3d-tile-01.png",
    category: "Precast Panels & Tiles",
    displayOrder: 26,
  },
  {
    title: "Custom Fabricated Panels",
    description: "Bespoke precast concrete panels fabricated to your exact specifications. From complex geometries to custom textures, fabricated off-site and delivered ready for installation.",
    points: ["Custom precast fabrication", "Complex geometries", "Off-site manufacturing", "Design-to-installation service"],
    accent: "Precast Panels",
    imageUrl: "/assets/images/structural-panels.jpg",
    category: "Precast Panels & Tiles",
    displayOrder: 27,
  },
];

export async function seedServices() {
  const client = await pool.connect();
  try {
    // Clear existing data (outside transaction to avoid abort issues)
    try {
      await client.query('DELETE FROM services');
    } catch (e: any) {
      if (e.code !== '42P01') { // 42P01 = table does not exist
        console.warn('Warning clearing services:', e.message);
      }
    }

    await client.query('BEGIN');

    // Insert services
    console.log('🌱 Seeding services...');
    for (const service of SERVICES) {
      await client.query(
        `INSERT INTO services (title, description, category, accent, image_url, points, display_order, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          service.title,
          service.description,
          service.category,
          service.accent,
          service.imageUrl,
          service.points,
          service.displayOrder,
          true,
        ]
      );
    }
    console.log(`✅ Seeded ${SERVICES.length} services`);

    await client.query('COMMIT');
    console.log('🎉 Services data seeding completed!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Services seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

