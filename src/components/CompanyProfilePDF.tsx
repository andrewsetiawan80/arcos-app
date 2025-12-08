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
  darkGray: '#2a2a2a',
  gray: '#353535',
  lightGray: '#555555',
  white: '#ffffff',
  muted: '#999999',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.black,
    color: COLORS.white,
    fontFamily: 'Helvetica',
    padding: 40,
    flexDirection: 'column',
  },
  coverPage: {
    backgroundColor: COLORS.black,
    padding: 0,
    flexDirection: 'column',
  },
  // Typography
  headerText: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  displayTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
    lineHeight: 1.1,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
    marginBottom: 10,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.white,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 1,
    fontFamily: 'Helvetica-Bold',
  },
  label: {
    fontSize: 6,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  body: {
    fontSize: 9,
    color: COLORS.muted,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  bodySmall: {
    fontSize: 7,
    color: COLORS.muted,
    lineHeight: 1.5,
  },
  // Layout Helpers
  row: {
    flexDirection: 'row',
  },
  col: {
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray,
    paddingBottom: 10,
    marginBottom: 25,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: COLORS.gray,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 6,
    color: COLORS.lightGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  accentLine: {
    width: 20,
    height: 1,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray,
    marginVertical: 10,
    width: '100%',
  },
});

// 01 COVER PAGE
const CoverPage = () => (
  <Page size="A4" style={styles.coverPage}>
    <View style={{ height: '65%' }}>
      <Image src={heroFacade} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </View>
    <View style={{ height: '35%', padding: 40, justifyContent: 'space-between' }}>
      <View>
        <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.white, marginBottom: 4 }}>arcos</Text>
        <Text style={{ fontSize: 6, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 3 }}>
          Company Profile
        </Text>
      </View>
      
      <View>
        <Text style={styles.displayTitle}>Engineered</Text>
        <Text style={styles.displayTitle}>Concrete</Text>
        <Text style={styles.displayTitle}>Artistry</Text>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 40 }}>
        <View>
           <Text style={styles.label}>EST</Text>
           <Text style={styles.bodySmall}>2025</Text>
        </View>
        <View>
           <Text style={styles.label}>HQ</Text>
           <Text style={styles.bodySmall}>Singapore</Text>
        </View>
        <View>
           <Text style={styles.label}>Focus</Text>
           <Text style={styles.bodySmall}>Innovation</Text>
        </View>
      </View>
    </View>
  </Page>
);

// 02 ABOUT PAGE
const AboutPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>About</Text>
      <Text style={styles.headerText}>02</Text>
    </View>
    
    <View style={{ flexDirection: 'row', height: '100%' }}>
      {/* Left Column: Title & Intro */}
      <View style={{ width: '40%', paddingRight: 20 }}>
        <View style={styles.accentLine} />
        <Text style={styles.title}>Bridging Design & Reality</Text>
        <Text style={styles.body}>
          Arcos is a collective of material scientists and fabrication engineers dedicated to advanced architectural concrete.
        </Text>
        <Text style={[styles.body, { marginTop: 10 }]}>
          We don't just supply material; we engineer solutions that collapse the gap between avant-garde intent and construction feasibility.
        </Text>
        
        <View style={{ marginTop: 30 }}>
            <View style={{ marginBottom: 15 }}>
                <Text style={styles.subtitle}>Material Lab</Text>
                <Text style={styles.bodySmall}>Proprietary UHPC & Microtopping formulations.</Text>
            </View>
            <View>
                <Text style={styles.subtitle}>Digital Fab</Text>
                <Text style={styles.bodySmall}>Robotic casting & parametric molds.</Text>
            </View>
        </View>
      </View>
      
      {/* Right Column: Imagery */}
      <View style={{ width: '60%' }}>
        <Image src={landmarkInstallation} style={{ width: '100%', height: 220, objectFit: 'cover', marginBottom: 10 }} />
        <Image src={modernInterior} style={{ width: '100%', height: 220, objectFit: 'cover' }} />
      </View>
    </View>

    <View style={styles.footer}>
      <Text style={styles.footerText}>arcosworks.com</Text>
      <Text style={styles.footerText}>About Us</Text>
    </View>
  </Page>
);

// 03 SERVICES PAGE
const ServicesPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Expertise</Text>
      <Text style={styles.headerText}>03</Text>
    </View>

    <Text style={styles.title}>Ecosystem of Expertise</Text>
    
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {/* Item 1 */}
        <View style={{ width: '50%', paddingRight: 10, paddingBottom: 20 }}>
            <Image src={microcementInterior} style={{ width: '100%', height: 140, objectFit: 'cover', marginBottom: 8 }} />
            <Text style={styles.subtitle}>01 / Microcement</Text>
            <Text style={styles.bodySmall}>Seamless 2-3mm overlays for floors and walls. High flexibility and crack resistance.</Text>
        </View>

        {/* Item 2 */}
        <View style={{ width: '50%', paddingLeft: 10, paddingBottom: 20 }}>
            <Image src={concretePanelDetail} style={{ width: '100%', height: 140, objectFit: 'cover', marginBottom: 8 }} />
            <Text style={styles.subtitle}>02 / Arch. Panels</Text>
            <Text style={styles.bodySmall}>Ultra-High Performance Concrete (UHPC) panels for lightweight facade cladding.</Text>
        </View>

        {/* Item 3 */}
        <View style={{ width: '50%', paddingRight: 10 }}>
            <Image src={mosaicFacade} style={{ width: '100%', height: 140, objectFit: 'cover', marginBottom: 8 }} />
            <Text style={styles.subtitle}>03 / 3D Tiles</Text>
            <Text style={styles.bodySmall}>Dimensional concrete tiles with intricate geometric patterns and shadows.</Text>
        </View>

        {/* Item 4 */}
        <View style={{ width: '50%', paddingLeft: 10 }}>
            <Image src={microcementWalls} style={{ width: '100%', height: 140, objectFit: 'cover', marginBottom: 8 }} />
            <Text style={styles.subtitle}>04 / Polished Overlays</Text>
            <Text style={styles.bodySmall}>Exposed aggregate finishes honed to a mirror or matte sheen.</Text>
        </View>
    </View>

    <View style={styles.footer}>
      <Text style={styles.footerText}>arcosworks.com</Text>
      <Text style={styles.footerText}>Services</Text>
    </View>
  </Page>
);

// 04 GALLERY 1 - TILES
const GalleryPage1 = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Inspiration</Text>
      <Text style={styles.headerText}>04</Text>
    </View>

    <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 15 }}>
        <View style={{ flex: 1 }}>
            <Text style={styles.title}>Dimensional Surfaces</Text>
        </View>
        <Text style={styles.label}>Collection 2025</Text>
    </View>

    {/* Featured Image */}
    <View style={{ height: 200, marginBottom: 15, backgroundColor: COLORS.darkGray }}>
        <Image src={tile05} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </View>

    {/* Grid of smaller tiles */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
        <View style={{ width: '24%', height: 80, backgroundColor: COLORS.darkGray }}>
            <Image src={tile01} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </View>
        <View style={{ width: '24%', height: 80, backgroundColor: COLORS.darkGray }}>
            <Image src={tile02} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </View>
        <View style={{ width: '24%', height: 80, backgroundColor: COLORS.darkGray }}>
            <Image src={tile03} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </View>
        <View style={{ width: '24%', height: 80, backgroundColor: COLORS.darkGray }}>
            <Image src={tile04} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </View>
    </View>
    
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '24%', height: 80, backgroundColor: COLORS.darkGray }}>
            <Image src={tile06} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </View>
        <View style={{ width: '24%', height: 80, backgroundColor: COLORS.darkGray }}>
            <Image src={tile07} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </View>
        <View style={{ width: '24%', height: 80, backgroundColor: COLORS.darkGray }}>
            <Image src={tile08} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </View>
        <View style={{ width: '24%', height: 80, padding: 10, justifyContent: 'center' }}>
            <Text style={styles.label}>More on Web</Text>
            <Text style={styles.bodySmall}>View full catalog at arcosworks.com</Text>
        </View>
    </View>

    <View style={styles.footer}>
      <Text style={styles.footerText}>arcosworks.com</Text>
      <Text style={styles.footerText}>Gallery</Text>
    </View>
  </Page>
);

// 05 GALLERY 2 - BESPOKE
const GalleryPage2 = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Bespoke</Text>
      <Text style={styles.headerText}>05</Text>
    </View>
    
    <Text style={styles.title}>Custom Fabrication</Text>

    <View style={{ flexDirection: 'row', marginTop: 10, height: 280 }}>
        {/* Left tall image */}
        <View style={{ width: '40%', paddingRight: 10 }}>
             <Image src={bespoke03} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </View>
        
        {/* Right column */}
        <View style={{ width: '60%', flexDirection: 'column' }}>
            <View style={{ height: '50%', paddingBottom: 5 }}>
                 <Image src={bespoke01} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </View>
            <View style={{ height: '50%', paddingTop: 5 }}>
                 <Image src={microcement02} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </View>
        </View>
    </View>
    
    <View style={{ marginTop: 20, flexDirection: 'row' }}>
        <View style={{ width: '33%' }}>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>Sculptural</Text>
            <Text style={styles.bodySmall}>Complex geometry casting.</Text>
        </View>
        <View style={{ width: '33%' }}>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>Furniture</Text>
            <Text style={styles.bodySmall}>Integrated monolithic pieces.</Text>
        </View>
        <View style={{ width: '33%' }}>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>Landscape</Text>
            <Text style={styles.bodySmall}>Durable outdoor elements.</Text>
        </View>
    </View>

    <View style={styles.footer}>
      <Text style={styles.footerText}>arcosworks.com</Text>
      <Text style={styles.footerText}>Bespoke</Text>
    </View>
  </Page>
);

// 06 PROCESS PAGE
const ProcessPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Workflow</Text>
      <Text style={styles.headerText}>06</Text>
    </View>

    {/* Hero */}
    <Image src={concreteInstallation} style={{ width: '100%', height: 160, objectFit: 'cover', marginBottom: 20 }} />

    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <View style={{ width: '30%' }}>
            <Text style={styles.title}>Method</Text>
        </View>
        <View style={{ width: '70%' }}>
            <Text style={styles.body}>
                Our integrated workflow ensures accountability from the first sketch to the final seal. We combine computational design with master craftsmanship.
            </Text>
        </View>
    </View>

    {/* 4 Steps Row */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ width: '23%' }}>
             <Text style={[styles.displayTitle, { fontSize: 24, marginBottom: 5, color: COLORS.lightGray }]}>01</Text>
             <Text style={styles.subtitle}>Design</Text>
             <Text style={styles.bodySmall}>Feasibility & Vision.</Text>
        </View>
        <View style={{ width: '23%' }}>
             <Text style={[styles.displayTitle, { fontSize: 24, marginBottom: 5, color: COLORS.lightGray }]}>02</Text>
             <Text style={styles.subtitle}>Engineer</Text>
             <Text style={styles.bodySmall}>Simulation & Mold.</Text>
        </View>
        <View style={{ width: '23%' }}>
             <Text style={[styles.displayTitle, { fontSize: 24, marginBottom: 5, color: COLORS.lightGray }]}>03</Text>
             <Text style={styles.subtitle}>Fabricate</Text>
             <Text style={styles.bodySmall}>Cast & Cure.</Text>
        </View>
        <View style={{ width: '23%' }}>
             <Text style={[styles.displayTitle, { fontSize: 24, marginBottom: 5, color: COLORS.lightGray }]}>04</Text>
             <Text style={styles.subtitle}>Install</Text>
             <Text style={styles.bodySmall}>Deliver & Finish.</Text>
        </View>
    </View>
    
    {/* Bottom Imagery */}
    <View style={{ flexDirection: 'row', marginTop: 25, gap: 10 }}>
        <Image src={mixDesign} style={{ width: '50%', height: 100, objectFit: 'contain' }} />
        <Image src={workshopCloseup} style={{ width: '50%', height: 100, objectFit: 'contain' }} />
    </View>

    <View style={styles.footer}>
      <Text style={styles.footerText}>arcosworks.com</Text>
      <Text style={styles.footerText}>Process</Text>
    </View>
  </Page>
);

// 07 TECHNICAL PAGE
const TechnicalPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerText}>Data</Text>
      <Text style={styles.headerText}>07</Text>
    </View>

    <Text style={styles.title}>Performance Metrics</Text>
    
    {/* Tech Grid */}
    <View style={{ marginTop: 20 }}>
        {/* Row 1 */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.gray, paddingBottom: 15, marginBottom: 15 }}>
            <View style={{ width: '50%' }}>
                <Text style={styles.displayTitle}>120<Text style={{ fontSize: 16 }}> MPa</Text></Text>
                <Text style={styles.label}>Compressive Strength</Text>
            </View>
            <View style={{ width: '50%' }}>
                <Text style={styles.displayTitle}>25<Text style={{ fontSize: 16 }}> MPa</Text></Text>
                <Text style={styles.label}>Flexural Strength</Text>
            </View>
        </View>
        
        {/* Row 2 */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.gray, paddingBottom: 15, marginBottom: 15 }}>
             <View style={{ width: '50%' }}>
                <Text style={styles.displayTitle}>A1</Text>
                <Text style={styles.label}>Fire Classification</Text>
            </View>
            <View style={{ width: '50%' }}>
                <Text style={styles.displayTitle}>&lt;3%</Text>
                <Text style={styles.label}>Water Absorption</Text>
            </View>
        </View>

         {/* Row 3 */}
         <View style={{ flexDirection: 'row', marginBottom: 20 }}>
             <View style={{ width: '50%' }}>
                <Text style={styles.displayTitle}>2<Text style={{ fontSize: 16 }}> mm</Text></Text>
                <Text style={styles.label}>Tolerance / 3m</Text>
            </View>
            <View style={{ width: '50%' }}>
                <Text style={styles.displayTitle}>100<Text style={{ fontSize: 16 }}>+</Text></Text>
                <Text style={styles.label}>Years Durability</Text>
            </View>
        </View>
    </View>

    <View style={{ marginTop: 'auto', marginBottom: 40 }}>
         <Image src={mixDesign} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
    </View>

    <View style={styles.footer}>
      <Text style={styles.footerText}>arcosworks.com</Text>
      <Text style={styles.footerText}>Technical</Text>
    </View>
  </Page>
);

// 08 CONTACT PAGE
const ContactPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 32, fontFamily: 'Helvetica-Bold', color: COLORS.white, textTransform: 'uppercase', marginBottom: 20 }}>
        Arcos
      </Text>
      
      <View style={{ width: 40, height: 2, backgroundColor: COLORS.white, marginBottom: 40 }} />
      
      <Text style={{ fontSize: 14, color: COLORS.muted, marginBottom: 5 }}>START A PROJECT</Text>
      <Text style={{ fontSize: 18, color: COLORS.white, marginBottom: 40 }}>hello@arcosworks.com</Text>
      
      <Text style={{ fontSize: 14, color: COLORS.muted, marginBottom: 5 }}>VISIT US</Text>
      <Text style={{ fontSize: 18, color: COLORS.white, marginBottom: 40 }}>arcosworks.com</Text>
      
      <Text style={{ fontSize: 14, color: COLORS.muted, marginBottom: 5 }}>BASE</Text>
      <Text style={{ fontSize: 18, color: COLORS.white }}>Southeast Asia</Text>
    </View>
    
    <Text style={{ position: 'absolute', bottom: 40, alignSelf: 'center', fontSize: 8, color: COLORS.darkGray }}>
        © 2025 Arcos Works. All Rights Reserved.
    </Text>
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
      console.log('Starting PDF generation...');
      const blob = await pdf(<CompanyProfileDocument />).toBlob();
      console.log('PDF blob created, triggering download...');
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