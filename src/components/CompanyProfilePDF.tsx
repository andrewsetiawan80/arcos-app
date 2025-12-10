import React, { useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
  Svg,
  Path,
} from '@react-pdf/renderer';

// Import JPG images
import heroFacade from '../assets/images/hero-facade.jpg';
import landmarkInstallation from '../assets/images/landmark-installation.jpg';
import workshopCloseup from '../assets/images/workshop-closeup.jpg';
import microcementInterior from '../assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.jpg';
import microcementWalls from '../assets/images/minimalist-interior-design-with-concrete-walls-modern-furniture.jpg';
import mosaicFacade from '../assets/images/mosaic-facade-detail.jpg';
import concretePanelDetail from '../assets/images/concrete-panel-detail.jpg';
import mixDesign from '../assets/images/mix-design.jpg';
import concreteInstallation from '../assets/images/concrete-installation.jpg';
import modernInterior from '../assets/images/modern-concrete-interior-design-with-stone-sculptures-steps.jpg';

// Import PNG inspiration images
import tile01 from '../assets/images/inspiration/3d-tile-45.png';
import tile02 from '../assets/images/inspiration/3d-tile-52.png';
import tile03 from '../assets/images/inspiration/3d-tile-68.png';
import tile04 from '../assets/images/inspiration/3d-tile-79.png';
import tile05 from '../assets/images/inspiration/3d-tile-85.png';
import tile06 from '../assets/images/inspiration/3d-tile-91.png';
import tile07 from '../assets/images/inspiration/3d-tile-97.png';
import tile08 from '../assets/images/inspiration/3d-tile-103.png';
import bespoke01 from '../assets/images/inspiration/bespoke-01.png';
import bespoke02 from '../assets/images/inspiration/bespoke-02.png';
import bespoke03 from '../assets/images/inspiration/bespoke-03.png';
import microcement02 from '../assets/images/inspiration/microcement-02.png';
import microcement03 from '../assets/images/inspiration/microcement-03.png';

// Brand colors (strict from guidelines)
const COLORS = {
  black: '#232323',
  gray: '#353535',
  white: '#ffffff',
  muted: '#999999',
};

// Supergraphic component - quarter circle pattern matching brand guidelines
const Supergraphic = ({ size = 80, color = COLORS.white, rows = 3, cols = 3 }: { size?: number; color?: string; rows?: number; cols?: number }) => {
  const cellSize = size / cols;
  return (
    <View style={{ width: size, height: (size / cols) * rows, flexDirection: 'row', flexWrap: 'wrap' }}>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <Svg key={i} width={cellSize} height={cellSize} viewBox="0 0 100 100">
          <Path d="M 0 100 A 100 100 0 0 1 100 0 L 100 100 Z" fill={color} />
        </Svg>
      ))}
    </View>
  );
};

// Logo component with underline - exact match to brand guidelines
const Logo = ({ color = COLORS.white, size = 'medium' }: { color?: string; size?: 'small' | 'medium' | 'large' }) => {
  const fontSize = size === 'large' ? 28 : size === 'medium' ? 18 : 12;
  const lineWidth = size === 'large' ? 35 : size === 'medium' ? 25 : 15;
  return (
    <View>
      <View style={{ width: lineWidth, height: 2, backgroundColor: color, marginBottom: 4 }} />
      <Text style={{ fontSize, fontFamily: 'Helvetica-Bold', color }}>arcos</Text>
    </View>
  );
};

// Tagline component
const Tagline = ({ color = COLORS.muted }: { color?: string }) => (
  <Text style={{ fontSize: 8, color, letterSpacing: 1 }}>surfaces, reimagined</Text>
);

const styles = StyleSheet.create({
  pageDark: {
    backgroundColor: COLORS.black,
    padding: 0,
  },
  pageLight: {
    backgroundColor: COLORS.white,
    padding: 0,
  },
  headline: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.1,
    marginBottom: 8,
  },
  subHeadline: {
    fontSize: 16,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
    marginBottom: 12,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  label: {
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
});

// ============================================
// PAGE 1: COVER - 3 Element (Image + 2 Boxes)
// Following exact brand guideline layout
// ============================================
const CoverPage = () => (
  <Page size="A4" style={styles.pageDark}>
    {/* Top: Image with headline overlay */}
    <View style={{ height: 480, position: 'relative' }}>
      <Image src={heroFacade} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <View style={{ position: 'absolute', top: 40, left: 40 }}>
        <Text style={[styles.headline, { color: COLORS.white }]}>Engineered</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white }]}>Concrete Artistry</Text>
      </View>
    </View>
    
    {/* Bottom: Split into 2 boxes - Logo/Content + Supergraphic */}
    <View style={{ flexDirection: 'row', height: 362 }}>
      {/* Left: Logo + Body text */}
      <View style={{ width: '50%', backgroundColor: COLORS.black, padding: 40, justifyContent: 'space-between' }}>
        <Logo color={COLORS.white} size="medium" />
        <View>
          <Text style={[styles.body, { color: COLORS.muted }]}>
            From seamless microcement finishes to parametric facade systems — Arcos delivers Southeast Asia's most advanced architectural concrete solutions.
          </Text>
        </View>
      </View>
      
      {/* Right: Supergraphic pattern */}
      <View style={{ width: '50%', backgroundColor: COLORS.gray, padding: 40, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
        <Supergraphic size={140} color={COLORS.white} rows={3} cols={3} />
      </View>
    </View>
  </Page>
);

// ============================================
// PAGE 2: ABOUT - 2 Element (Image + 1 Box)
// Following exact brand guideline layout
// ============================================
const AboutPage = () => (
  <Page size="A4" style={styles.pageDark}>
    {/* Top header bar with logo */}
    <View style={{ backgroundColor: COLORS.black, padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Logo color={COLORS.white} size="small" />
      <Tagline color={COLORS.muted} />
    </View>
    
    {/* Main image section */}
    <View style={{ height: 360, position: 'relative' }}>
      <Image src={landmarkInstallation} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(35,35,35,0.95)', padding: 30 }}>
        <Text style={[styles.headline, { color: COLORS.white, fontSize: 28 }]}>Who We Are</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white }]}>Collapsing the gap between design and reality</Text>
        <Text style={[styles.body, { color: COLORS.muted }]}>
          Arcos formed in 2025 when a collective of materials scientists, architects, and fabrication engineers set out to transform architectural concrete. We specialise in seamless microcement finishes, polished concrete overlays, terrazzo systems, architectural panels, and 3D tiles.
        </Text>
      </View>
    </View>
    
    {/* Bottom: Content box with supergraphic */}
    <View style={{ flexDirection: 'row', flex: 1 }}>
      <View style={{ width: '70%', backgroundColor: COLORS.gray, padding: 30 }}>
        <Text style={[styles.label, { color: COLORS.muted }]}>Capabilities</Text>
        <Text style={[styles.body, { color: COLORS.white }]}>• Material Lab: UHPC, GFRC, and microtopping formulations</Text>
        <Text style={[styles.body, { color: COLORS.white }]}>• Digital Fabrication: Parametric modelling and robotic casting</Text>
        <Text style={[styles.body, { color: COLORS.white, marginBottom: 0 }]}>• Integrated workflow from concept to installation</Text>
      </View>
      <View style={{ width: '30%', backgroundColor: COLORS.black, padding: 30, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
        <Supergraphic size={100} color={COLORS.gray} rows={4} cols={3} />
      </View>
    </View>
  </Page>
);

// ============================================
// PAGE 3: SERVICES - 3 Element (Image + 2 Boxes)
// Following exact brand guideline layout
// ============================================
const ServicesPage = () => (
  <Page size="A4" style={styles.pageDark}>
    {/* Top header bar */}
    <View style={{ backgroundColor: COLORS.black, padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Logo color={COLORS.white} size="small" />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Tagline color={COLORS.muted} />
        <View style={{ marginLeft: 20 }}>
          <Supergraphic size={60} color={COLORS.white} rows={2} cols={3} />
        </View>
      </View>
    </View>
    
    {/* Main: Image with overlay + Supergraphic sidebar */}
    <View style={{ flexDirection: 'row', height: 400 }}>
      {/* Left: Image with text overlay */}
      <View style={{ width: '70%', position: 'relative' }}>
        <Image src={microcementInterior} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(35,35,35,0.95)', padding: 30 }}>
          <Text style={[styles.headline, { color: COLORS.white, fontSize: 26 }]}>Our Services</Text>
          <Text style={[styles.subHeadline, { color: COLORS.white }]}>Full-spectrum concrete innovation</Text>
          <Text style={[styles.body, { color: COLORS.muted }]}>
            From seamless microcement to UHPC facade panels, we engineer solutions that collapse the gap between avant-garde design and construction reality.
          </Text>
        </View>
      </View>
      
      {/* Right: Supergraphic column */}
      <View style={{ width: '30%', backgroundColor: COLORS.gray, justifyContent: 'center', alignItems: 'center' }}>
        <Supergraphic size={120} color={COLORS.white} rows={5} cols={3} />
      </View>
    </View>
    
    {/* Bottom: Service grid in 2x2 */}
    <View style={{ flexDirection: 'row', flex: 1 }}>
      <View style={{ width: '50%', backgroundColor: COLORS.black, padding: 25 }}>
        <Text style={[styles.label, { color: COLORS.muted }]}>01</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white, fontFamily: 'Helvetica-Bold', fontSize: 14 }]}>Microcement</Text>
        <Text style={[styles.body, { color: COLORS.muted, fontSize: 9 }]}>Seamless 2-3mm coatings for floors, walls, and furniture. 60+ colors available.</Text>
      </View>
      <View style={{ width: '50%', backgroundColor: COLORS.gray, padding: 25 }}>
        <Text style={[styles.label, { color: COLORS.muted }]}>02</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white, fontFamily: 'Helvetica-Bold', fontSize: 14 }]}>Architectural Panels</Text>
        <Text style={[styles.body, { color: COLORS.muted, fontSize: 9 }]}>UHPC and GFRC panels for lightweight facade cladding systems.</Text>
      </View>
    </View>
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: '50%', backgroundColor: COLORS.gray, padding: 25 }}>
        <Text style={[styles.label, { color: COLORS.muted }]}>03</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white, fontFamily: 'Helvetica-Bold', fontSize: 14 }]}>3D Concrete Tiles</Text>
        <Text style={[styles.body, { color: COLORS.muted, fontSize: 9 }]}>Dimensional tiles with intricate geometric patterns and shadows.</Text>
      </View>
      <View style={{ width: '50%', backgroundColor: COLORS.black, padding: 25 }}>
        <Text style={[styles.label, { color: COLORS.muted }]}>04</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white, fontFamily: 'Helvetica-Bold', fontSize: 14 }]}>Polished Concrete</Text>
        <Text style={[styles.body, { color: COLORS.muted, fontSize: 9 }]}>High-performance polished overlays with aesthetic precision and durability.</Text>
      </View>
    </View>
  </Page>
);

// ============================================
// PAGE 4: GALLERY 1 - 3D Tiles
// ============================================
const GalleryPage1 = () => (
  <Page size="A4" style={styles.pageDark}>
    {/* Header with logo and supergraphic */}
    <View style={{ backgroundColor: COLORS.gray, padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View>
        <Text style={[styles.headline, { color: COLORS.white, fontSize: 28 }]}>3D Tile Collection</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white, marginBottom: 0 }]}>Dimensional Surfaces</Text>
      </View>
      <Supergraphic size={70} color={COLORS.white} rows={2} cols={3} />
    </View>
    
    {/* Tile grid - 3 columns */}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 20 }}>
      <View style={{ width: '33.33%', padding: 8 }}>
        <Image src={tile01} style={{ width: '100%', height: 130, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '33.33%', padding: 8 }}>
        <Image src={tile02} style={{ width: '100%', height: 130, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '33.33%', padding: 8 }}>
        <Image src={tile03} style={{ width: '100%', height: 130, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '33.33%', padding: 8 }}>
        <Image src={tile04} style={{ width: '100%', height: 130, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '33.33%', padding: 8 }}>
        <Image src={tile05} style={{ width: '100%', height: 130, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '33.33%', padding: 8 }}>
        <Image src={tile06} style={{ width: '100%', height: 130, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '33.33%', padding: 8 }}>
        <Image src={tile07} style={{ width: '100%', height: 130, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '33.33%', padding: 8 }}>
        <Image src={tile08} style={{ width: '100%', height: 130, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '33.33%', padding: 8, justifyContent: 'center' }}>
        <View style={{ backgroundColor: COLORS.gray, padding: 20, height: 130, justifyContent: 'center' }}>
          <Text style={[styles.label, { color: COLORS.muted }]}>Custom Patterns</Text>
          <Text style={[styles.body, { color: COLORS.white, marginBottom: 0, fontSize: 9 }]}>Each design customizable for scale, depth, and finish.</Text>
        </View>
      </View>
    </View>
    
    {/* Footer */}
    <View style={{ backgroundColor: COLORS.black, padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Logo color={COLORS.white} size="small" />
      <Tagline color={COLORS.muted} />
    </View>
  </Page>
);

// ============================================
// PAGE 5: GALLERY 2 - Bespoke
// ============================================
const GalleryPage2 = () => (
  <Page size="A4" style={styles.pageDark}>
    {/* Header */}
    <View style={{ backgroundColor: COLORS.black, padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Logo color={COLORS.white} size="small" />
      <Tagline color={COLORS.muted} />
    </View>
    
    {/* Main content: Image + Content box */}
    <View style={{ flexDirection: 'row', height: 320 }}>
      <View style={{ width: '60%' }}>
        <Image src={bespoke01} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </View>
      <View style={{ width: '40%', backgroundColor: COLORS.gray, padding: 30, justifyContent: 'center' }}>
        <Text style={[styles.headline, { color: COLORS.white, fontSize: 24 }]}>Bespoke</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white }]}>Custom Fabrication</Text>
        <Text style={[styles.body, { color: COLORS.muted }]}>
          From sculptural elements to integrated furniture, we bring complex geometry to life through precision casting and fabrication.
        </Text>
      </View>
    </View>
    
    {/* Image grid */}
    <View style={{ flexDirection: 'row', height: 200, padding: 15 }}>
      <View style={{ width: '33.33%', padding: 8 }}>
        <Image src={bespoke02} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </View>
      <View style={{ width: '33.33%', padding: 8 }}>
        <Image src={bespoke03} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </View>
      <View style={{ width: '33.33%', padding: 8 }}>
        <Image src={microcement02} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </View>
    </View>
    
    {/* Bottom: Content + Supergraphic */}
    <View style={{ flexDirection: 'row', flex: 1 }}>
      <View style={{ width: '60%', backgroundColor: COLORS.gray, padding: 30 }}>
        <Text style={[styles.label, { color: COLORS.muted }]}>Capabilities</Text>
        <Text style={[styles.body, { color: COLORS.white }]}>• Custom furniture and fixtures</Text>
        <Text style={[styles.body, { color: COLORS.white }]}>• Sculptural elements</Text>
        <Text style={[styles.body, { color: COLORS.white }]}>• Facade cladding systems</Text>
        <Text style={[styles.body, { color: COLORS.white, marginBottom: 0 }]}>• Landscape features</Text>
      </View>
      <View style={{ width: '40%', backgroundColor: COLORS.black, padding: 30, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
        <Supergraphic size={110} color={COLORS.gray} rows={3} cols={3} />
      </View>
    </View>
  </Page>
);

// ============================================
// PAGE 6: PROCESS - 2 Element (Image + 1 Box)
// Following exact brand guideline layout
// ============================================
const ProcessPage = () => (
  <Page size="A4" style={styles.pageLight}>
    {/* Top header on white */}
    <View style={{ padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Logo color={COLORS.black} size="small" />
      <Tagline color={COLORS.muted} />
    </View>
    
    {/* Content box */}
    <View style={{ padding: 30 }}>
      <Text style={[styles.headline, { color: COLORS.black }]}>Our Process</Text>
      <Text style={[styles.subHeadline, { color: COLORS.black }]}>From concept to completion</Text>
    </View>
    
    {/* Image */}
    <View style={{ height: 220 }}>
      <Image src={concreteInstallation} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </View>
    
    {/* Process steps - 4 columns */}
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: '25%', backgroundColor: COLORS.black, padding: 25 }}>
        <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: COLORS.gray, marginBottom: 8 }}>01</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white, fontFamily: 'Helvetica-Bold', fontSize: 12 }]}>Design</Text>
        <Text style={[styles.body, { color: COLORS.muted, fontSize: 8 }]}>Workshops to decode vision and establish criteria.</Text>
      </View>
      <View style={{ width: '25%', backgroundColor: COLORS.gray, padding: 25 }}>
        <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: COLORS.black, marginBottom: 8 }}>02</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white, fontFamily: 'Helvetica-Bold', fontSize: 12 }]}>Engineer</Text>
        <Text style={[styles.body, { color: COLORS.muted, fontSize: 8 }]}>Parametric modelling and simulations.</Text>
      </View>
      <View style={{ width: '25%', backgroundColor: COLORS.black, padding: 25 }}>
        <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: COLORS.gray, marginBottom: 8 }}>03</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white, fontFamily: 'Helvetica-Bold', fontSize: 12 }]}>Fabricate</Text>
        <Text style={[styles.body, { color: COLORS.muted, fontSize: 8 }]}>Robotics and CNC production.</Text>
      </View>
      <View style={{ width: '25%', backgroundColor: COLORS.gray, padding: 25 }}>
        <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: COLORS.black, marginBottom: 8 }}>04</Text>
        <Text style={[styles.subHeadline, { color: COLORS.white, fontFamily: 'Helvetica-Bold', fontSize: 12 }]}>Install</Text>
        <Text style={[styles.body, { color: COLORS.muted, fontSize: 8 }]}>White-glove delivery.</Text>
      </View>
    </View>
    
    {/* Bottom images */}
    <View style={{ flexDirection: 'row', flex: 1 }}>
      <View style={{ width: '50%' }}>
        <Image src={mixDesign} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </View>
      <View style={{ width: '50%' }}>
        <Image src={workshopCloseup} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </View>
    </View>
    
    {/* Supergraphic footer */}
    <View style={{ backgroundColor: COLORS.white, padding: 20, flexDirection: 'row', justifyContent: 'flex-end' }}>
      <Supergraphic size={70} color={COLORS.black} rows={2} cols={4} />
    </View>
  </Page>
);

// ============================================
// PAGE 7: TECHNICAL - 1 Element (1 Box)
// Following exact brand guideline layout
// ============================================
const TechnicalPage = () => (
  <Page size="A4" style={styles.pageDark}>
    {/* Header */}
    <View style={{ backgroundColor: COLORS.black, padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Logo color={COLORS.white} size="small" />
      <Tagline color={COLORS.muted} />
    </View>
    
    {/* Main content box */}
    <View style={{ backgroundColor: COLORS.gray, padding: 40, flex: 1 }}>
      <Text style={[styles.headline, { color: COLORS.white }]}>Technical Data</Text>
      <Text style={[styles.subHeadline, { color: COLORS.white }]}>Material Performance Metrics</Text>
      
      <View style={{ marginTop: 25 }}>
        <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.black, paddingBottom: 15, marginBottom: 15 }}>
          <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold', color: COLORS.white, marginBottom: 5 }}>120+ MPa</Text>
          <Text style={[styles.label, { color: COLORS.muted }]}>Compressive Strength</Text>
        </View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.black, paddingBottom: 15, marginBottom: 15 }}>
          <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold', color: COLORS.white, marginBottom: 5 }}>25+ MPa</Text>
          <Text style={[styles.label, { color: COLORS.muted }]}>Flexural Strength</Text>
        </View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.black, paddingBottom: 15, marginBottom: 15 }}>
          <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold', color: COLORS.white, marginBottom: 5 }}>Class A1</Text>
          <Text style={[styles.label, { color: COLORS.muted }]}>Fire Rating</Text>
        </View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: COLORS.black, paddingBottom: 15, marginBottom: 15 }}>
          <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold', color: COLORS.white, marginBottom: 5 }}>3% max</Text>
          <Text style={[styles.label, { color: COLORS.muted }]}>Water Absorption</Text>
        </View>
        <View style={{ paddingBottom: 15 }}>
          <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold', color: COLORS.white, marginBottom: 5 }}>±1mm</Text>
          <Text style={[styles.label, { color: COLORS.muted }]}>Tolerance</Text>
        </View>
      </View>
    </View>
    
    {/* Bottom with supergraphic */}
    <View style={{ backgroundColor: COLORS.black, padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <Text style={[styles.body, { color: COLORS.muted, maxWidth: 250 }]}>
        All materials tested to international standards. Custom formulations available.
      </Text>
      <Supergraphic size={90} color={COLORS.white} rows={2} cols={4} />
    </View>
  </Page>
);

// ============================================
// PAGE 8: CONTACT - 1 Element (1 Box)
// Following exact brand guideline layout
// ============================================
const ContactPage = () => (
  <Page size="A4" style={styles.pageDark}>
    {/* Top image */}
    <View style={{ height: 380 }}>
      <Image src={modernInterior} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </View>
    
    {/* Content box */}
    <View style={{ backgroundColor: COLORS.gray, padding: 40, flex: 1 }}>
      <Text style={[styles.headline, { color: COLORS.white }]}>Ready to Start?</Text>
      <Text style={[styles.subHeadline, { color: COLORS.white }]}>Let's build something extraordinary</Text>
      <Text style={[styles.body, { color: COLORS.muted }]}>
        Whether you're an architect seeking material guidance or a developer ready to break ground, our team is here to turn your vision into reality.
      </Text>
      
      <View style={{ marginTop: 30 }}>
        <Text style={[styles.label, { color: COLORS.muted }]}>Email</Text>
        <Text style={{ fontSize: 16, color: COLORS.white, marginBottom: 20 }}>hello@arcosworks.com</Text>
        
        <Text style={[styles.label, { color: COLORS.muted }]}>Website</Text>
        <Text style={{ fontSize: 16, color: COLORS.white, marginBottom: 20 }}>arcosworks.com</Text>
        
        <Text style={[styles.label, { color: COLORS.muted }]}>Location</Text>
        <Text style={{ fontSize: 16, color: COLORS.white }}>Southeast Asia</Text>
      </View>
    </View>
    
    {/* Footer with logo and supergraphic */}
    <View style={{ backgroundColor: COLORS.black, padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View>
        <Logo color={COLORS.white} size="medium" />
        <Text style={{ fontSize: 8, color: COLORS.muted, marginTop: 6 }}>surfaces, reimagined</Text>
      </View>
      <Supergraphic size={90} color={COLORS.white} rows={2} cols={4} />
    </View>
  </Page>
);

// Main Document
const CompanyProfileDocument = () => (
  <Document title="Arcos Company Profile" author="Arcos" subject="Architectural Concrete Solutions">
    <CoverPage />
    <AboutPage />
    <ServicesPage />
    <GalleryPage1 />
    <GalleryPage2 />
    <ProcessPage />
    <TechnicalPage />
    <ContactPage />
  </Document>
);

// Download button
export function CompanyProfileDownloadButton({ className = '' }: { className?: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const blob = await pdf(<CompanyProfileDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Arcos-Company-Profile-2025.pdf';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={(e) => handleDownload(e)}
      disabled={isGenerating}
      style={{ pointerEvents: 'auto' }}
      className={`cursor-pointer disabled:opacity-50 disabled:cursor-wait ${className}`}
    >
      <span className="inline-flex items-center gap-2">
        {isGenerating ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Company Profile
          </>
        )}
      </span>
    </button>
  );
}

export { CompanyProfileDocument };
export default CompanyProfileDownloadButton;
