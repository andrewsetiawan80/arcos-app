import React, { useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
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

// Brand colors
const COLORS = {
  black: '#232323',
  gray: '#353535',
  white: '#ffffff',
  muted: '#999999',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.black,
    color: COLORS.white,
    fontFamily: 'Helvetica',
    padding: 35,
  },
  coverPage: {
    backgroundColor: COLORS.black,
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    paddingBottom: 8,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 35,
    right: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.muted,
  },
  label: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
    marginBottom: 12,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
    marginBottom: 8,
    lineHeight: 1.3,
  },
  heading: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  body: {
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.5,
    marginBottom: 6,
  },
  bodySmall: {
    fontSize: 7,
    color: COLORS.muted,
    lineHeight: 1.4,
  },
  row: {
    flexDirection: 'row',
  },
  box: {
    backgroundColor: COLORS.gray,
    padding: 12,
    marginBottom: 8,
  },
  accent: {
    width: 25,
    height: 2,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  stat: {
    alignItems: 'center',
    width: '25%',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 6,
    color: COLORS.muted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 3,
    height: 3,
    backgroundColor: COLORS.muted,
    borderRadius: 1,
    marginRight: 5,
    marginTop: 3,
  },
  listText: {
    flex: 1,
    fontSize: 7,
    color: COLORS.muted,
    lineHeight: 1.3,
  },
});

// Cover Page
const CoverPage = () => (
  <Page size="A4" style={styles.coverPage}>
    <View style={{ height: '55%' }}>
      <Image src={heroFacade} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </View>
    <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 20, left: 30 }}>
        <View style={{ width: 25, height: 2, backgroundColor: COLORS.white, marginBottom: 4 }} />
        <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.white }}>arcos</Text>
      </View>
      <Text style={{ fontSize: 6, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
        Company Profile 2025
      </Text>
      <Text style={{ fontSize: 26, fontFamily: 'Helvetica-Bold', color: COLORS.white, textTransform: 'uppercase', lineHeight: 1.15, marginBottom: 12 }}>
        ENGINEERED{'\n'}CONCRETE{'\n'}ARTISTRY
      </Text>
      <Text style={{ fontSize: 9, color: COLORS.muted, lineHeight: 1.5, maxWidth: 300 }}>
        From seamless microcement finishes to parametric facade systems — Arcos delivers Southeast Asia's most advanced architectural concrete solutions.
      </Text>
    </View>
    <View style={{ backgroundColor: COLORS.gray, padding: 15, flexDirection: 'row' }}>
      <View style={styles.stat}>
        <Text style={styles.statValue}>2025</Text>
        <Text style={styles.statLabel}>Founded</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>22+</Text>
        <Text style={styles.statLabel}>Experts</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>14</Text>
        <Text style={styles.statLabel}>Projects</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>50+</Text>
        <Text style={styles.statLabel}>Finishes</Text>
      </View>
    </View>
  </Page>
);

// About Page
const AboutPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>About Arcos</Text>
      <Text style={styles.headerText}>02</Text>
    </View>
    
    <Image src={landmarkInstallation} style={{ width: '100%', height: 140, objectFit: 'cover', marginBottom: 12 }} />
    
    <View style={styles.accent} />
    <Text style={styles.label}>Who We Are</Text>
    <Text style={styles.title}>Collapsing the gap between design and reality</Text>
    
    <View style={styles.row}>
      <View style={{ width: '55%', paddingRight: 12 }}>
        <Text style={styles.body}>
          Arcos formed in 2025 when a collective of materials scientists, architects, and fabrication engineers set out to collapse the gap between avant-garde design intent and construction reality.
        </Text>
        <Text style={styles.body}>
          We specialise in seamless microcement finishes, polished concrete overlays, terrazzo systems, architectural panels, and 3D tiles — all engineered and delivered through one accountable partner.
        </Text>
        <View style={styles.box}>
          <Text style={styles.heading}>Material Lab</Text>
          <Text style={styles.bodySmall}>UHPC, GFRC, and microtopping formulations tuned for climate and performance.</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.heading}>Digital Fabrication</Text>
          <Text style={styles.bodySmall}>Parametric modelling flows into robotic casting and modular mold production.</Text>
        </View>
      </View>
      <View style={{ width: '45%' }}>
        <Image src={modernInterior} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
      </View>
    </View>
    
    <View style={styles.footer}>
      <Text style={styles.footerText}>arcos</Text>
      <Text style={styles.footerText}>Architectural Concrete Solutions</Text>
      <Text style={styles.footerText}>02</Text>
    </View>
  </Page>
);

// Services Page
const ServicesPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Our Services</Text>
      <Text style={styles.headerText}>03</Text>
    </View>
    
    <View style={styles.accent} />
    <Text style={styles.label}>Ecosystem of Expertise</Text>
    <Text style={styles.subtitle}>Full-spectrum concrete innovation</Text>
    
    <View style={[styles.row, { marginTop: 10 }]}>
      <View style={{ width: '60%', paddingRight: 8 }}>
        <Image src={microcementInterior} style={{ width: '100%', height: 120, objectFit: 'cover', marginBottom: 6 }} />
        <Text style={styles.heading}>Seamless Microcement</Text>
        <Text style={styles.bodySmall}>2-3mm coatings for floors, walls, and furniture. 60+ colors available.</Text>
      </View>
      <View style={{ width: '40%' }}>
        <Image src={concretePanelDetail} style={{ width: '100%', height: 120, objectFit: 'cover', marginBottom: 6 }} />
        <Text style={styles.heading}>Architectural Panels</Text>
        <Text style={styles.bodySmall}>UHPC and GFRC panels for facades.</Text>
      </View>
    </View>
    
    <View style={[styles.row, { marginTop: 12 }]}>
      <View style={{ width: '40%', paddingRight: 8 }}>
        <Image src={mosaicFacade} style={{ width: '100%', height: 100, objectFit: 'cover', marginBottom: 6 }} />
        <Text style={styles.heading}>3D Concrete Tiles</Text>
        <Text style={styles.bodySmall}>Dimensional tiles with depth.</Text>
      </View>
      <View style={{ width: '60%' }}>
        <Image src={microcementWalls} style={{ width: '100%', height: 100, objectFit: 'cover', marginBottom: 6 }} />
        <Text style={styles.heading}>Polished Concrete</Text>
        <Text style={styles.bodySmall}>High-performance polished overlays with aesthetic precision and durability.</Text>
      </View>
    </View>
    
    <View style={styles.footer}>
      <Text style={styles.footerText}>arcos</Text>
      <Text style={styles.footerText}>Architectural Concrete Solutions</Text>
      <Text style={styles.footerText}>03</Text>
    </View>
  </Page>
);

// Gallery Page 1 - 3D Tiles
const GalleryPage1 = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Design Inspiration</Text>
      <Text style={styles.headerText}>04</Text>
    </View>
    
    <View style={styles.accent} />
    <Text style={styles.label}>3D Tile Collection</Text>
    <Text style={styles.subtitle}>Dimensional surfaces</Text>
    
    {/* Masonry layout */}
    <View style={[styles.row, { marginTop: 8 }]}>
      <View style={{ width: '32%', paddingRight: 6 }}>
        <Image src={tile01} style={{ width: '100%', height: 130, objectFit: 'contain', marginBottom: 6 }} />
        <Image src={tile02} style={{ width: '100%', height: 90, objectFit: 'contain', marginBottom: 6 }} />
        <Image src={tile03} style={{ width: '100%', height: 110, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '36%', paddingRight: 6 }}>
        <Image src={tile04} style={{ width: '100%', height: 100, objectFit: 'contain', marginBottom: 6 }} />
        <Image src={tile05} style={{ width: '100%', height: 140, objectFit: 'contain', marginBottom: 6 }} />
        <Image src={tile06} style={{ width: '100%', height: 90, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '32%' }}>
        <Image src={tile07} style={{ width: '100%', height: 110, objectFit: 'contain', marginBottom: 6 }} />
        <Image src={tile08} style={{ width: '100%', height: 120, objectFit: 'contain', marginBottom: 6 }} />
        <View style={[styles.box, { height: 100, justifyContent: 'center' }]}>
          <Text style={styles.heading}>Custom Patterns</Text>
          <Text style={styles.bodySmall}>Each design customizable for scale, depth, and finish.</Text>
        </View>
      </View>
    </View>
    
    <View style={styles.footer}>
      <Text style={styles.footerText}>arcos</Text>
      <Text style={styles.footerText}>Architectural Concrete Solutions</Text>
      <Text style={styles.footerText}>04</Text>
    </View>
  </Page>
);

// Gallery Page 2 - Bespoke
const GalleryPage2 = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Design Inspiration</Text>
      <Text style={styles.headerText}>05</Text>
    </View>
    
    <View style={styles.accent} />
    <Text style={styles.label}>Bespoke Solutions</Text>
    <Text style={styles.subtitle}>Custom applications</Text>
    
    {/* Hero image */}
    <Image src={bespoke01} style={{ width: '100%', height: 130, objectFit: 'contain', marginTop: 8, marginBottom: 10 }} />
    
    {/* Grid */}
    <View style={styles.row}>
      <View style={{ width: '32%', paddingRight: 6 }}>
        <Image src={bespoke02} style={{ width: '100%', height: 95, objectFit: 'contain', marginBottom: 6 }} />
        <Image src={microcement02} style={{ width: '100%', height: 95, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '36%', paddingRight: 6 }}>
        <Image src={bespoke03} style={{ width: '100%', height: 196, objectFit: 'contain' }} />
      </View>
      <View style={{ width: '32%' }}>
        <Image src={microcement03} style={{ width: '100%', height: 95, objectFit: 'contain', marginBottom: 6 }} />
        <Image src={workshopCloseup} style={{ width: '100%', height: 95, objectFit: 'cover' }} />
      </View>
    </View>
    
    <View style={[styles.box, { marginTop: 10 }]}>
      <Text style={styles.heading}>From Concept to Reality</Text>
      <View style={[styles.row, { marginTop: 4 }]}>
        <View style={{ width: '50%' }}>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>Custom furniture and fixtures</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>Sculptural elements</Text>
          </View>
        </View>
        <View style={{ width: '50%' }}>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>Facade cladding systems</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>Landscape features</Text>
          </View>
        </View>
      </View>
    </View>
    
    <View style={styles.footer}>
      <Text style={styles.footerText}>arcos</Text>
      <Text style={styles.footerText}>Architectural Concrete Solutions</Text>
      <Text style={styles.footerText}>05</Text>
    </View>
  </Page>
);

// Process Page
const ProcessPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Our Process</Text>
      <Text style={styles.headerText}>06</Text>
    </View>
    
    {/* Hero section with full-width image */}
    <Image src={concreteInstallation} style={{ width: '100%', height: 160, objectFit: 'cover', marginBottom: 14 }} />
    
    {/* Title and intro */}
    <View style={styles.row}>
      <View style={{ width: '40%', paddingRight: 12 }}>
        <View style={styles.accent} />
        <Text style={styles.label}>How We Work</Text>
        <Text style={styles.title}>From concept to completion</Text>
      </View>
      <View style={{ width: '60%' }}>
        <Text style={styles.body}>
          Every engagement follows an integrated workflow, aligning concept, engineering, fabrication, and delivery under one roof. Our process ensures quality at every stage.
        </Text>
      </View>
    </View>
    
    {/* Process steps - 2x2 grid */}
    <View style={[styles.row, { marginTop: 14 }]}>
      <View style={{ width: '50%', paddingRight: 6 }}>
        <View style={styles.box}>
          <Text style={styles.label}>01 — Design</Text>
          <Text style={styles.bodySmall}>Collaborative workshops decode vision and establish criteria for success.</Text>
        </View>
      </View>
      <View style={{ width: '50%' }}>
        <View style={styles.box}>
          <Text style={styles.label}>02 — Engineering</Text>
          <Text style={styles.bodySmall}>Parametric modelling and structural simulations refine every detail.</Text>
        </View>
      </View>
    </View>
    
    <View style={[styles.row, { marginTop: 6 }]}>
      <View style={{ width: '50%', paddingRight: 6 }}>
        <View style={styles.box}>
          <Text style={styles.label}>03 — Fabrication</Text>
          <Text style={styles.bodySmall}>Robotics and CNC production ensure precision manufacturing.</Text>
        </View>
      </View>
      <View style={{ width: '50%' }}>
        <View style={styles.box}>
          <Text style={styles.label}>04 — Install</Text>
          <Text style={styles.bodySmall}>White-glove delivery and expert on-site installation.</Text>
        </View>
      </View>
    </View>
    
    {/* Bottom images row */}
    <View style={[styles.row, { marginTop: 14 }]}>
      <View style={{ width: '50%', paddingRight: 6 }}>
        <Image src={mixDesign} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
      </View>
      <View style={{ width: '50%' }}>
        <Image src={workshopCloseup} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
      </View>
    </View>
    
    <View style={styles.footer}>
      <Text style={styles.footerText}>arcos</Text>
      <Text style={styles.footerText}>Architectural Concrete Solutions</Text>
      <Text style={styles.footerText}>06</Text>
    </View>
  </Page>
);

// Technical Page
const TechnicalPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Technical Specs</Text>
      <Text style={styles.headerText}>07</Text>
    </View>
    
    <View style={styles.row}>
      <View style={{ width: '50%', paddingRight: 10 }}>
        <View style={styles.accent} />
        <Text style={styles.label}>Material Performance</Text>
        <Text style={styles.title}>Built to endure</Text>
        
        <View style={{ marginTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.white }}>120+ MPa</Text>
          <Text style={{ fontSize: 7, color: COLORS.muted, textTransform: 'uppercase' }}>Compressive Strength</Text>
        </View>
        <View style={{ paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.white }}>25+ MPa</Text>
          <Text style={{ fontSize: 7, color: COLORS.muted, textTransform: 'uppercase' }}>Flexural Strength</Text>
        </View>
        <View style={{ paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.white }}>3% max</Text>
          <Text style={{ fontSize: 7, color: COLORS.muted, textTransform: 'uppercase' }}>Water Absorption</Text>
        </View>
        <View style={{ paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.white }}>-30 to +80C</Text>
          <Text style={{ fontSize: 7, color: COLORS.muted, textTransform: 'uppercase' }}>Thermal Tolerance</Text>
        </View>
        <View style={{ paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.white }}>Class A1</Text>
          <Text style={{ fontSize: 7, color: COLORS.muted, textTransform: 'uppercase' }}>Fire Rating</Text>
        </View>
      </View>
      <View style={{ width: '50%' }}>
        <Image src={mixDesign} style={{ width: '100%', height: 180, objectFit: 'cover', marginBottom: 10 }} />
        <View style={styles.box}>
          <Text style={styles.heading}>Quality Standards</Text>
          <Text style={styles.bodySmall}>Tolerance: +/- 1mm</Text>
          <Text style={styles.bodySmall}>Flatness: 2mm/3m max</Text>
          <Text style={styles.bodySmall}>Color Delta E: 2 max</Text>
          <Text style={styles.bodySmall}>Surface defects: 0.1% max</Text>
        </View>
      </View>
    </View>
    
    <View style={styles.footer}>
      <Text style={styles.footerText}>arcos</Text>
      <Text style={styles.footerText}>Architectural Concrete Solutions</Text>
      <Text style={styles.footerText}>07</Text>
    </View>
  </Page>
);

// Contact Page
const ContactPage = () => (
  <Page size="A4" style={styles.coverPage}>
    <View style={{ height: '50%' }}>
      <Image src={microcementInterior} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </View>
    <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 20, left: 30 }}>
        <View style={{ width: 25, height: 2, backgroundColor: COLORS.white, marginBottom: 4 }} />
        <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.white }}>arcos</Text>
      </View>
      <Text style={{ fontSize: 6, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
        Get In Touch
      </Text>
      <Text style={{ fontSize: 26, fontFamily: 'Helvetica-Bold', color: COLORS.white, textTransform: 'uppercase', lineHeight: 1.15, marginBottom: 12 }}>
        READY TO{'\n'}START YOUR{'\n'}PROJECT?
      </Text>
      <Text style={{ fontSize: 9, color: COLORS.muted, lineHeight: 1.5, maxWidth: 300 }}>
        Whether you're an architect seeking material guidance or a developer ready to break ground, our team is here to turn your vision into reality.
      </Text>
    </View>
    <View style={{ backgroundColor: COLORS.black, padding: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
      <View>
        <Text style={{ fontSize: 6, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 2 }}>Email</Text>
        <Text style={{ fontSize: 9, color: COLORS.white }}>hello@arcosworks.com</Text>
      </View>
      <View>
        <Text style={{ fontSize: 6, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 2 }}>Website</Text>
        <Text style={{ fontSize: 9, color: COLORS.white }}>arcosworks.com</Text>
      </View>
      <View>
        <Text style={{ fontSize: 6, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 2 }}>Location</Text>
        <Text style={{ fontSize: 9, color: COLORS.white }}>Southeast Asia</Text>
      </View>
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
