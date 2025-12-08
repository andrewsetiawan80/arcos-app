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
import mixDesign from '../assets/images/mix-design.jpg';

// Brand colors only
const COLORS = {
  black: '#232323',
  gray: '#353535',
  white: '#ffffff',
  muted: '#999999',
};

const styles = StyleSheet.create({
  // Base page
  page: {
    backgroundColor: COLORS.black,
    color: COLORS.white,
    fontFamily: 'Helvetica',
    padding: 40,
  },
  
  // Cover page (no padding)
  coverPage: {
    backgroundColor: COLORS.black,
    padding: 0,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.muted,
  },
  
  // Typography - with proper line heights to prevent overlap
  label: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
    marginBottom: 16,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
    marginBottom: 12,
    lineHeight: 1.3,
  },
  heading: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  body: {
    fontSize: 10,
    color: COLORS.muted,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  bodySmall: {
    fontSize: 9,
    color: COLORS.muted,
    lineHeight: 1.5,
    marginBottom: 6,
  },
  
  // Layout
  row: {
    flexDirection: 'row',
  },
  col50: {
    width: '48%',
  },
  spacer: {
    width: '4%',
  },
  
  // Box
  box: {
    backgroundColor: COLORS.gray,
    padding: 16,
    marginBottom: 12,
  },
  
  // Image
  image: {
    width: '100%',
    height: 120,
    objectFit: 'cover',
    marginBottom: 16,
  },
  imageSmall: {
    width: '100%',
    height: 80,
    objectFit: 'cover',
    marginBottom: 8,
  },
  
  // Accent
  accent: {
    width: 30,
    height: 3,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  
  // Stats
  stat: {
    alignItems: 'center',
    width: '25%',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  
  // Metric
  metric: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  metricValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: 'uppercase',
  },
  
  // List
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    width: 4,
    height: 4,
    backgroundColor: COLORS.muted,
    borderRadius: 2,
    marginRight: 8,
    marginTop: 4,
  },
  listText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.muted,
    lineHeight: 1.4,
  },
});

// Cover Page Component
const CoverPage = () => (
  <Page size="A4" style={styles.coverPage}>
    {/* Hero Image - Top Half */}
    <View style={{ height: '45%', position: 'relative' }}>
      <Image src={heroFacade} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(35,35,35,0.5)' }} />
      {/* Logo */}
      <View style={{ position: 'absolute', top: 30, left: 30 }}>
        <View style={{ width: 30, height: 3, backgroundColor: COLORS.white, marginBottom: 6 }} />
        <Text style={{ fontSize: 24, fontFamily: 'Helvetica-Bold', color: COLORS.white }}>arcos</Text>
      </View>
    </View>
    
    {/* Content - Bottom Half */}
    <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>
      <Text style={{ fontSize: 8, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
        Company Profile 2025
      </Text>
      <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: COLORS.white, textTransform: 'uppercase', lineHeight: 1.15, marginBottom: 16 }}>
        ENGINEERED{'\n'}CONCRETE{'\n'}ARTISTRY
      </Text>
      <Text style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.6, maxWidth: 350 }}>
        From seamless microcement finishes to parametric facade systems — Arcos delivers Southeast Asia's most advanced architectural concrete solutions.
      </Text>
    </View>
    
    {/* Stats Footer */}
    <View style={{ backgroundColor: COLORS.gray, padding: 20, flexDirection: 'row' }}>
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
    
    <Image src={landmarkInstallation} style={styles.image} />
    
    <View style={styles.accent} />
    <Text style={styles.label}>Who We Are</Text>
    <Text style={styles.title}>Collapsing the gap between design and reality</Text>
    
    <View style={styles.row}>
      <View style={styles.col50}>
        <Text style={styles.body}>
          Arcos formed in 2025 when a collective of materials scientists, architects, and fabrication engineers set out to collapse the gap between avant-garde design intent and construction reality.
        </Text>
        <Text style={styles.body}>
          We specialise in seamless microcement finishes, polished concrete overlays, terrazzo systems, architectural panels, and 3D tiles.
        </Text>
      </View>
      <View style={styles.spacer} />
      <View style={styles.col50}>
        <View style={styles.box}>
          <Text style={styles.heading}>Material Lab</Text>
          <Text style={styles.bodySmall}>
            UHPC, GFRC, and microtopping formulations tuned for climate, performance, and finish.
          </Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.heading}>Digital Fabrication</Text>
          <Text style={styles.bodySmall}>
            Parametric modelling flows into robotic casting and modular mold production.
          </Text>
        </View>
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
    
    <View style={[styles.row, { marginTop: 12 }]}>
      <View style={styles.col50}>
        <View style={styles.box}>
          <Text style={styles.heading}>Seamless Microcement</Text>
          <Text style={styles.bodySmall}>2-3mm coatings for seamless surfaces across floors, walls, and furniture. Available in 60+ colors.</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.heading}>3D Concrete Tiles</Text>
          <Text style={styles.bodySmall}>Innovative dimensional tiles adding depth and texture to any architectural surface.</Text>
        </View>
      </View>
      <View style={styles.spacer} />
      <View style={styles.col50}>
        <View style={styles.box}>
          <Text style={styles.heading}>Architectural Panels</Text>
          <Text style={styles.bodySmall}>UHPC and GFRC panels for facades, feature walls, and interior applications.</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.heading}>Polished Concrete</Text>
          <Text style={styles.bodySmall}>High-performance polished overlays delivering durability and aesthetic precision.</Text>
        </View>
      </View>
    </View>
    
    <View style={[styles.box, { marginTop: 16 }]}>
      <Text style={styles.heading}>Additional Services</Text>
      <View style={[styles.row, { marginTop: 8 }]}>
        <View style={styles.col50}>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>Custom terrazzo systems</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>Bespoke mold design</Text>
          </View>
        </View>
        <View style={styles.spacer} />
        <View style={styles.col50}>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>Installation services</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>Material consulting</Text>
          </View>
        </View>
      </View>
    </View>
    
    <View style={styles.footer}>
      <Text style={styles.footerText}>arcos</Text>
      <Text style={styles.footerText}>Architectural Concrete Solutions</Text>
      <Text style={styles.footerText}>03</Text>
    </View>
  </Page>
);

// Process Page
const ProcessPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Our Process</Text>
      <Text style={styles.headerText}>04</Text>
    </View>
    
    <View style={styles.row}>
      <View style={styles.col50}>
        <Image src={workshopCloseup} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
      </View>
      <View style={styles.spacer} />
      <View style={styles.col50}>
        <View style={styles.accent} />
        <Text style={styles.label}>How We Work</Text>
        <Text style={styles.subtitle}>From concept to completion</Text>
        <Text style={styles.body}>
          Every engagement follows an integrated workflow, aligning concept, engineering, fabrication, and delivery.
        </Text>
      </View>
    </View>
    
    <View style={[styles.row, { marginTop: 20 }]}>
      <View style={{ flex: 1, marginRight: 6 }}>
        <View style={styles.box}>
          <Text style={styles.label}>01</Text>
          <Text style={styles.heading}>Design</Text>
          <Text style={styles.bodySmall}>Workshops to decode vision and establish criteria.</Text>
        </View>
      </View>
      <View style={{ flex: 1, marginRight: 6 }}>
        <View style={styles.box}>
          <Text style={styles.label}>02</Text>
          <Text style={styles.heading}>Engineering</Text>
          <Text style={styles.bodySmall}>Parametric modelling and structural simulations.</Text>
        </View>
      </View>
      <View style={{ flex: 1, marginRight: 6 }}>
        <View style={styles.box}>
          <Text style={styles.label}>03</Text>
          <Text style={styles.heading}>Fabrication</Text>
          <Text style={styles.bodySmall}>Robotics and CNC-driven production.</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.box}>
          <Text style={styles.label}>04</Text>
          <Text style={styles.heading}>Install</Text>
          <Text style={styles.bodySmall}>White-glove delivery and support.</Text>
        </View>
      </View>
    </View>
    
    <View style={[styles.box, { marginTop: 16 }]}>
      <Text style={styles.heading}>Why Choose Arcos</Text>
      <View style={[styles.row, { marginTop: 8 }]}>
        <View style={styles.col50}>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>Single partner from concept to handover</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>In-house material science expertise</Text>
          </View>
        </View>
        <View style={styles.spacer} />
        <View style={styles.col50}>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>Certified installation teams</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.listText}>BIM-ready digital workflows</Text>
          </View>
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

// Technical Page
const TechnicalPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Technical Specs</Text>
      <Text style={styles.headerText}>05</Text>
    </View>
    
    <Image src={mixDesign} style={styles.image} />
    
    <View style={styles.accent} />
    <Text style={styles.label}>Material Performance</Text>
    <Text style={styles.subtitle}>Built to endure</Text>
    
    <View style={[styles.row, { marginTop: 12 }]}>
      <View style={styles.col50}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>120+ MPa</Text>
          <Text style={styles.metricLabel}>Compressive Strength</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>25+ MPa</Text>
          <Text style={styles.metricLabel}>Flexural Strength</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>3% max</Text>
          <Text style={styles.metricLabel}>Water Absorption</Text>
        </View>
      </View>
      <View style={styles.spacer} />
      <View style={styles.col50}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>-30 to +80C</Text>
          <Text style={styles.metricLabel}>Thermal Tolerance</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>50+ options</Text>
          <Text style={styles.metricLabel}>Surface Finishes</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>Class A1</Text>
          <Text style={styles.metricLabel}>Fire Rating</Text>
        </View>
      </View>
    </View>
    
    <View style={styles.box}>
      <Text style={styles.heading}>Quality Standards</Text>
      <View style={[styles.row, { marginTop: 8 }]}>
        <View style={styles.col50}>
          <Text style={styles.bodySmall}>Tolerance: +/- 1mm</Text>
          <Text style={styles.bodySmall}>Flatness: 2mm/3m max</Text>
        </View>
        <View style={styles.spacer} />
        <View style={styles.col50}>
          <Text style={styles.bodySmall}>Color Delta E: 2 max</Text>
          <Text style={styles.bodySmall}>Surface defects: 0.1% max</Text>
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

// Contact Page
const ContactPage = () => (
  <Page size="A4" style={styles.coverPage}>
    {/* Image - Top Half */}
    <View style={{ height: '45%', position: 'relative' }}>
      <Image src={microcementInterior} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(35,35,35,0.5)' }} />
      <View style={{ position: 'absolute', top: 30, left: 30 }}>
        <View style={{ width: 30, height: 3, backgroundColor: COLORS.white, marginBottom: 6 }} />
        <Text style={{ fontSize: 24, fontFamily: 'Helvetica-Bold', color: COLORS.white }}>arcos</Text>
      </View>
    </View>
    
    {/* CTA */}
    <View style={{ flex: 1, padding: 30, justifyContent: 'center' }}>
      <Text style={{ fontSize: 8, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
        Get In Touch
      </Text>
      <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: COLORS.white, textTransform: 'uppercase', lineHeight: 1.15, marginBottom: 16 }}>
        READY TO{'\n'}START YOUR{'\n'}PROJECT?
      </Text>
      <Text style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.6, maxWidth: 350 }}>
        Whether you're an architect seeking material guidance or a developer ready to break ground, our team is here to turn your vision into reality.
      </Text>
    </View>
    
    {/* Contact Info */}
    <View style={{ backgroundColor: COLORS.black, padding: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
      <View>
        <Text style={{ fontSize: 8, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 4 }}>Email</Text>
        <Text style={{ fontSize: 11, color: COLORS.white }}>hello@arcosworks.com</Text>
      </View>
      <View>
        <Text style={{ fontSize: 8, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 4 }}>Website</Text>
        <Text style={{ fontSize: 11, color: COLORS.white }}>arcosworks.com</Text>
      </View>
      <View>
        <Text style={{ fontSize: 8, color: COLORS.muted, textTransform: 'uppercase', marginBottom: 4 }}>Location</Text>
        <Text style={{ fontSize: 11, color: COLORS.white }}>Southeast Asia</Text>
      </View>
    </View>
  </Page>
);

// Main Document
const CompanyProfileDocument = () => (
  <Document
    title="Arcos Company Profile"
    author="Arcos"
    subject="Architectural Concrete Solutions"
  >
    <CoverPage />
    <AboutPage />
    <ServicesPage />
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
