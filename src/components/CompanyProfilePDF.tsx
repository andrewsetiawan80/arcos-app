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

// Import images for PDF
import heroFacade from '../assets/images/hero-facade.webp';
import microcementInterior1 from '../assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.webp';
import structuralPanels from '../assets/images/structural-panels.webp';
import workshopCloseup from '../assets/images/workshop-closeup.webp';
import landmarkInstallation from '../assets/images/landmark-installation.webp';
import tile01 from '../assets/images/inspiration/3d-tile-01.webp';
import tile02 from '../assets/images/inspiration/3d-tile-02.webp';
import microcementInsp01 from '../assets/images/inspiration/microcement-01.webp';
import microcementInsp02 from '../assets/images/inspiration/microcement-02.webp';
import concretePanelInsp01 from '../assets/images/inspiration/concrete-panel-01.webp';
import bespokeInsp01 from '../assets/images/inspiration/bespoke-01.webp';

/**
 * Arcos Company Profile PDF
 * 
 * Following Arcos Brand Guidelines:
 * - Colors: #232323 (black), #353535 (gray), #ffffff (white)
 * - Typography: Helvetica (built-in, similar to brand fonts)
 * - Layout: Clean, minimalist, brutalist aesthetic
 * - Images: High-quality project and inspiration imagery
 */

// Brand colors
const COLORS = {
  black: '#232323',
  gray: '#353535',
  white: '#ffffff',
  textMuted: '#a0a0a0',
};

// Create styles following brand guidelines
const styles = StyleSheet.create({
  // Page styles
  page: {
    backgroundColor: COLORS.black,
    color: COLORS.white,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.6,
  },
  
  // Cover page
  coverPage: {
    backgroundColor: COLORS.black,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  coverImageContainer: {
    position: 'relative',
    height: '55%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(35, 35, 35, 0.7)',
  },
  coverLogoOverlay: {
    position: 'absolute',
    top: 40,
    left: 40,
  },
  coverHeader: {
    padding: 40,
  },
  coverLogo: {
    marginBottom: 16,
  },
  logoLine: {
    width: 36,
    height: 3,
    backgroundColor: COLORS.white,
    marginBottom: 6,
  },
  logoText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 32,
    letterSpacing: 1,
    color: COLORS.white,
  },
  coverMain: {
    flex: 1,
    padding: 40,
    paddingTop: 20,
  },
  coverTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 36,
    textTransform: 'uppercase',
    lineHeight: 1.1,
    marginBottom: 16,
    color: COLORS.white,
  },
  coverSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    maxWidth: 350,
    lineHeight: 1.6,
  },
  coverFooter: {
    backgroundColor: COLORS.gray,
    padding: 24,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coverStat: {
    textAlign: 'center',
  },
  coverStatValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: COLORS.white,
  },
  coverStatLabel: {
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  // Content pages
  contentPage: {
    padding: 40,
  },
  pageHeader: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageNumber: {
    fontSize: 8,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  
  // Typography
  sectionLabel: {
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  heading1: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    textTransform: 'uppercase',
    lineHeight: 1.2,
    marginBottom: 12,
    color: COLORS.white,
  },
  heading2: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    lineHeight: 1.3,
    marginBottom: 10,
    color: COLORS.white,
  },
  heading3: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 6,
    color: COLORS.white,
  },
  bodyText: {
    fontSize: 9,
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  bodyTextSmall: {
    fontSize: 8,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.7)',
  },

  // Layout components
  twoColumn: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },
  box: {
    backgroundColor: COLORS.gray,
    padding: 16,
    marginBottom: 12,
  },
  boxLight: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  // Image styles
  sectionImage: {
    width: '100%',
    height: 140,
    objectFit: 'cover',
    marginBottom: 16,
  },
  gridImage: {
    width: '100%',
    height: 80,
    objectFit: 'cover',
    marginBottom: 8,
  },
  featureImage: {
    width: '100%',
    height: 120,
    objectFit: 'cover',
  },

  // Grid layouts
  grid2: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem2: {
    width: '48%',
  },
  grid3: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  gridItem3: {
    flex: 1,
  },

  // Lists
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 6,
  },
  listBullet: {
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    marginRight: 8,
    marginTop: 4,
  },
  listText: {
    flex: 1,
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
  },

  // Metrics/stats
  metric: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  metricValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: COLORS.white,
  },
  metricLabel: {
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  footerLogo: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted,
  },

  // Gallery styles
  galleryGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryItem: {
    width: '32%',
    height: 100,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

// Logo component for PDF
const ArcosLogoPDF = ({ size = 'normal' }: { size?: 'normal' | 'small' }) => (
  <View style={size === 'small' ? { marginBottom: 0 } : styles.coverLogo}>
    <View style={[styles.logoLine, size === 'small' && { width: 20, height: 2 }]} />
    <Text style={[styles.logoText, size === 'small' && { fontSize: 14 }]}>arcos</Text>
  </View>
);

// Page footer component
const PageFooter = ({ pageNum }: { pageNum: number }) => (
  <View style={styles.footer}>
    <Text style={styles.footerLogo}>arcos</Text>
    <Text style={styles.footerText}>Architectural Concrete Solutions</Text>
    <Text style={styles.footerText}>{String(pageNum).padStart(2, '0')}</Text>
  </View>
);

// The PDF Document
const CompanyProfileDocument = () => (
  <Document
    title="Arcos Company Profile"
    author="Arcos"
    subject="Architectural Concrete Solutions"
    keywords="concrete, architecture, microcement, UHPC, GFRC"
  >
    {/* Cover Page with Hero Image */}
    <Page size="A4" style={styles.page}>
      <View style={styles.coverPage}>
        {/* Hero Image Section */}
        <View style={styles.coverImageContainer}>
          <Image src={heroFacade} style={styles.coverImage} />
          <View style={styles.coverImageOverlay} />
          <View style={styles.coverLogoOverlay}>
            <ArcosLogoPDF />
          </View>
        </View>
        
        {/* Title Section */}
        <View style={styles.coverMain}>
          <Text style={styles.sectionLabel}>Company Profile 2025</Text>
          <Text style={styles.coverTitle}>
            Engineered{'\n'}Concrete{'\n'}Artistry
          </Text>
          <Text style={styles.coverSubtitle}>
            From seamless microcement finishes to parametric facade systems—
            Arcos delivers Southeast Asia's most advanced architectural concrete solutions.
          </Text>
        </View>
        
        {/* Stats Footer */}
        <View style={styles.coverFooter}>
          <View style={styles.coverStat}>
            <Text style={styles.coverStatValue}>2025</Text>
            <Text style={styles.coverStatLabel}>Founded</Text>
          </View>
          <View style={styles.coverStat}>
            <Text style={styles.coverStatValue}>22+</Text>
            <Text style={styles.coverStatLabel}>Experts</Text>
          </View>
          <View style={styles.coverStat}>
            <Text style={styles.coverStatValue}>14</Text>
            <Text style={styles.coverStatLabel}>Active Projects</Text>
          </View>
          <View style={styles.coverStat}>
            <Text style={styles.coverStatValue}>50+</Text>
            <Text style={styles.coverStatLabel}>Surface Finishes</Text>
          </View>
        </View>
      </View>
    </Page>

    {/* Page 2: About Us with Image */}
    <Page size="A4" style={[styles.page, styles.contentPage]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageNumber}>About Arcos</Text>
        <Text style={styles.pageNumber}>02</Text>
      </View>
      
      <Image src={landmarkInstallation} style={styles.sectionImage} />
      
      <Text style={styles.sectionLabel}>Who We Are</Text>
      <Text style={styles.heading1}>Collapsing the gap between design and reality</Text>
      
      <View style={styles.twoColumn}>
        <View style={styles.column}>
          <Text style={styles.bodyText}>
            Arcos formed in 2025 when a collective of materials scientists, architects, 
            and fabrication engineers set out to collapse the gap between avant-garde 
            design intent and construction reality.
          </Text>
          <Text style={styles.bodyText}>
            We specialise in seamless microcement finishes, polished concrete overlays, 
            terrazzo systems, architectural panels, and 3D tiles—all engineered, fabricated, 
            and delivered through one accountable partner.
          </Text>
        </View>
        <View style={styles.column}>
          <View style={styles.box}>
            <Text style={styles.heading3}>Material Lab</Text>
            <Text style={styles.bodyTextSmall}>
              UHPC, GFRC, and microtopping formulations tuned for climate, 
              performance, and finish.
            </Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.heading3}>Digital Fabrication</Text>
            <Text style={styles.bodyTextSmall}>
              Parametric modelling flows into robotic casting, modular molds, 
              logistics, and install supervision.
            </Text>
          </View>
        </View>
      </View>
      
      <PageFooter pageNum={2} />
    </Page>

    {/* Page 3: Services with Images */}
    <Page size="A4" style={[styles.page, styles.contentPage]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageNumber}>Our Services</Text>
        <Text style={styles.pageNumber}>03</Text>
      </View>
      
      <Text style={styles.sectionLabel}>Ecosystem of Expertise</Text>
      <Text style={styles.heading1}>Full-spectrum concrete innovation</Text>
      
      <View style={[styles.grid2, { marginTop: 16 }]}>
        <View style={styles.gridItem2}>
          <Image src={microcementInsp01} style={styles.gridImage} />
          <View style={styles.boxLight}>
            <Text style={styles.heading3}>Seamless Microcement</Text>
            <Text style={styles.bodyTextSmall}>
              Thin-layer coatings (2-3mm) for seamless, joint-free surfaces. 60+ colors.
            </Text>
          </View>
        </View>
        
        <View style={styles.gridItem2}>
          <Image src={concretePanelInsp01} style={styles.gridImage} />
          <View style={styles.boxLight}>
            <Text style={styles.heading3}>Architectural Panels</Text>
            <Text style={styles.bodyTextSmall}>
              Prefabricated UHPC and GFRC panels for facades and feature walls.
            </Text>
          </View>
        </View>
        
        <View style={styles.gridItem2}>
          <Image src={tile01} style={styles.gridImage} />
          <View style={styles.boxLight}>
            <Text style={styles.heading3}>3D Concrete Tiles</Text>
            <Text style={styles.bodyTextSmall}>
              Innovative 3D tiles adding depth and dimension to any surface.
            </Text>
          </View>
        </View>
        
        <View style={styles.gridItem2}>
          <Image src={bespokeInsp01} style={styles.gridImage} />
          <View style={styles.boxLight}>
            <Text style={styles.heading3}>Bespoke Solutions</Text>
            <Text style={styles.bodyTextSmall}>
              Custom fabrication for unique architectural requirements.
            </Text>
          </View>
        </View>
      </View>
      
      <PageFooter pageNum={3} />
    </Page>

    {/* Page 4: Process with Images */}
    <Page size="A4" style={[styles.page, styles.contentPage]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageNumber}>Our Process</Text>
        <Text style={styles.pageNumber}>04</Text>
      </View>
      
      <Text style={styles.sectionLabel}>How We Work</Text>
      <Text style={styles.heading1}>From concept to completion</Text>
      
      <View style={styles.twoColumn}>
        <View style={styles.column}>
          <Image src={workshopCloseup} style={[styles.sectionImage, { height: 180 }]} />
        </View>
        <View style={styles.column}>
          <Text style={styles.bodyText}>
            Every engagement follows an integrated workflow, aligning concept, 
            material engineering, digital fabrication, and delivery into one continuous rhythm.
          </Text>
          
          <View style={styles.box}>
            <Text style={styles.sectionLabel}>01</Text>
            <Text style={styles.heading3}>Design & Planning</Text>
            <Text style={styles.bodyTextSmall}>
              Strategic workshops to decode vision and performance criteria.
            </Text>
          </View>
          
          <View style={styles.box}>
            <Text style={styles.sectionLabel}>02</Text>
            <Text style={styles.heading3}>Material Engineering</Text>
            <Text style={styles.bodyTextSmall}>
              Computational design and structural simulations.
            </Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.grid2, { marginTop: 12 }]}>
        <View style={[styles.gridItem2, styles.box]}>
          <Text style={styles.sectionLabel}>03</Text>
          <Text style={styles.heading3}>Fabrication</Text>
          <Text style={styles.bodyTextSmall}>
            Robotics, CNC milling, and tailored mix production.
          </Text>
        </View>
        
        <View style={[styles.gridItem2, styles.box]}>
          <Text style={styles.sectionLabel}>04</Text>
          <Text style={styles.heading3}>Installation</Text>
          <Text style={styles.bodyTextSmall}>
            White-glove installation and post-install monitoring.
          </Text>
        </View>
      </View>
      
      <PageFooter pageNum={4} />
    </Page>

    {/* Page 5: Gallery / Inspiration */}
    <Page size="A4" style={[styles.page, styles.contentPage]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageNumber}>Project Gallery</Text>
        <Text style={styles.pageNumber}>05</Text>
      </View>
      
      <Text style={styles.sectionLabel}>Inspiration</Text>
      <Text style={styles.heading1}>Our Work in Action</Text>
      <Text style={styles.bodyText}>
        From minimalist interiors to bold facade installations, explore our portfolio 
        of architectural concrete solutions.
      </Text>
      
      <View style={[styles.galleryGrid, { marginTop: 16 }]}>
        <View style={styles.galleryItem}>
          <Image src={microcementInterior1} style={styles.galleryImage} />
        </View>
        <View style={styles.galleryItem}>
          <Image src={tile02} style={styles.galleryImage} />
        </View>
        <View style={styles.galleryItem}>
          <Image src={microcementInsp02} style={styles.galleryImage} />
        </View>
        <View style={styles.galleryItem}>
          <Image src={structuralPanels} style={styles.galleryImage} />
        </View>
        <View style={styles.galleryItem}>
          <Image src={tile01} style={styles.galleryImage} />
        </View>
        <View style={styles.galleryItem}>
          <Image src={concretePanelInsp01} style={styles.galleryImage} />
        </View>
      </View>
      
      <View style={[styles.boxLight, { marginTop: 20 }]}>
        <Text style={styles.heading3}>Technical Excellence</Text>
        <View style={[styles.grid2, { marginTop: 8 }]}>
          <View style={styles.gridItem2}>
            <Text style={styles.bodyTextSmall}>• Compressive Strength: ≥120 MPa</Text>
            <Text style={styles.bodyTextSmall}>• Flexural Strength: ≥25 MPa</Text>
            <Text style={styles.bodyTextSmall}>• Water Absorption: ≤3%</Text>
          </View>
          <View style={styles.gridItem2}>
            <Text style={styles.bodyTextSmall}>• Thermal Tolerance: -30 to +80°C</Text>
            <Text style={styles.bodyTextSmall}>• Surface Profiles: 50+ finishes</Text>
            <Text style={styles.bodyTextSmall}>• Fire Rating: Class A1</Text>
          </View>
        </View>
      </View>
      
      <PageFooter pageNum={5} />
    </Page>

    {/* Page 6: Contact with Image */}
    <Page size="A4" style={styles.page}>
      <View style={styles.coverPage}>
        {/* Contact Image Section */}
        <View style={styles.coverImageContainer}>
          <Image src={microcementInterior1} style={styles.coverImage} />
          <View style={styles.coverImageOverlay} />
          <View style={styles.coverLogoOverlay}>
            <ArcosLogoPDF />
          </View>
        </View>
        
        {/* CTA Section */}
        <View style={styles.coverMain}>
          <Text style={styles.sectionLabel}>Get In Touch</Text>
          <Text style={styles.coverTitle}>
            Ready to{'\n'}start your{'\n'}project?
          </Text>
          <Text style={styles.coverSubtitle}>
            Whether you're an architect seeking material guidance or a developer 
            ready to break ground, our team is here to turn your vision into reality.
          </Text>
        </View>
        
        {/* Contact Footer */}
        <View style={[styles.coverFooter, { backgroundColor: COLORS.black }]}>
          <View>
            <Text style={styles.sectionLabel}>Email</Text>
            <Text style={{ color: COLORS.white, fontSize: 11 }}>hello@arcosworks.com</Text>
          </View>
          <View>
            <Text style={styles.sectionLabel}>Website</Text>
            <Text style={{ color: COLORS.white, fontSize: 11 }}>arcosworks.com</Text>
          </View>
          <View>
            <Text style={styles.sectionLabel}>Location</Text>
            <Text style={{ color: COLORS.white, fontSize: 11 }}>Southeast Asia</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// Download button component - using manual PDF generation
export function CompanyProfileDownloadButton({ className = '' }: { className?: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(<CompanyProfileDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Arcos-Company-Profile-2025.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={`cursor-pointer disabled:opacity-50 disabled:cursor-wait ${className}`}
    >
      <span className="inline-flex items-center gap-2">
        {isGenerating ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating PDF...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
