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

// Import JPG images (supported by react-pdf)
import heroFacade from '../assets/images/hero-facade.jpg';
import landmarkInstallation from '../assets/images/landmark-installation.jpg';
import workshopCloseup from '../assets/images/workshop-closeup.jpg';
import microcementInterior from '../assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.jpg';
import microcementWalls from '../assets/images/minimalist-interior-design-with-concrete-walls-modern-furniture.jpg';
import mosaicFacade from '../assets/images/mosaic-facade-detail.jpg';
import concretePanelDetail from '../assets/images/concrete-panel-detail.jpg';
import mixDesign from '../assets/images/mix-design.jpg';

/**
 * Arcos Company Profile PDF
 * 
 * Following Arcos Brand Guidelines:
 * - Colors: #232323 (black), #353535 (gray), #ffffff (white) - NO OTHER COLORS
 * - Typography: Helvetica (built-in)
 * - Layout: Clean, minimalist, brutalist aesthetic
 * - Images: JPG format (WebP not supported)
 */

// Brand colors - ONLY these three colors per guidelines
const COLORS = {
  black: '#232323',
  gray: '#353535',
  white: '#ffffff',
  textMuted: '#999999',
};

// Create styles following brand guidelines
const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.black,
    color: COLORS.white,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.6,
  },
  
  // Cover page
  coverPage: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  coverImageSection: {
    height: '50%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(35, 35, 35, 0.6)',
  },
  coverLogoArea: {
    position: 'absolute',
    top: 40,
    left: 40,
  },
  logoLine: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  logoText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 32,
    letterSpacing: 1,
    color: COLORS.white,
  },
  coverContent: {
    flex: 1,
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  coverLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: COLORS.textMuted,
    marginBottom: 15,
  },
  coverTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 38,
    textTransform: 'uppercase',
    lineHeight: 1.1,
    marginBottom: 20,
    color: COLORS.white,
  },
  coverSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    maxWidth: 380,
    lineHeight: 1.7,
  },
  coverFooter: {
    backgroundColor: COLORS.gray,
    padding: 25,
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
    padding: 45,
  },
  pageHeader: {
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
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
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  heading1: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    textTransform: 'uppercase',
    lineHeight: 1.15,
    marginBottom: 15,
    color: COLORS.white,
  },
  heading2: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    lineHeight: 1.2,
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
    fontSize: 10,
    lineHeight: 1.7,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  bodyTextSmall: {
    fontSize: 9,
    lineHeight: 1.6,
    color: COLORS.textMuted,
  },

  // Layout components - NO gap property (causes green lines in react-pdf)
  twoColumn: {
    display: 'flex',
    flexDirection: 'row',
  },
  columnLeft: {
    flex: 1,
    marginRight: 12,
  },
  columnRight: {
    flex: 1,
    marginLeft: 12,
  },
  column: {
    flex: 1,
  },
  box: {
    backgroundColor: COLORS.gray,
    padding: 18,
    marginBottom: 12,
  },
  boxLight: {
    backgroundColor: COLORS.gray,
    padding: 18,
    marginBottom: 12,
  },
  
  // Image styles
  sectionImage: {
    width: '100%',
    height: 130,
    objectFit: 'cover',
    marginBottom: 15,
  },
  smallImage: {
    width: '100%',
    height: 90,
    objectFit: 'cover',
    marginBottom: 10,
  },
  
  // Grid layouts - using margins instead of gap
  grid2: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem2Left: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
  },
  gridItem2Right: {
    width: '48%',
    marginLeft: '2%',
    marginBottom: 12,
  },
  grid4: {
    display: 'flex',
    flexDirection: 'row',
  },
  gridItem4: {
    flex: 1,
    marginRight: 8,
  },
  gridItem4Last: {
    flex: 1,
  },

  // Lists
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 6,
  },
  listBullet: {
    width: 5,
    height: 5,
    backgroundColor: COLORS.textMuted,
    borderRadius: 2,
    marginRight: 10,
    marginTop: 4,
  },
  listText: {
    flex: 1,
    fontSize: 9,
    color: COLORS.textMuted,
  },

  // Metrics/stats
  metric: {
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  metricValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
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
    bottom: 30,
    left: 45,
    right: 45,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    paddingTop: 12,
  },
  footerLogo: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted,
  },

  // Accent bar
  accentBar: {
    width: 35,
    height: 3,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
});

// Logo component for PDF
const ArcosLogoPDF = () => (
  <View style={styles.coverLogoArea}>
    <View style={styles.logoLine} />
    <Text style={styles.logoText}>arcos</Text>
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
        <View style={styles.coverImageSection}>
          <Image src={heroFacade} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
          <ArcosLogoPDF />
        </View>
        
        <View style={styles.coverContent}>
          <Text style={styles.coverLabel}>Company Profile 2025</Text>
          <Text style={styles.coverTitle}>
            Engineered{'\n'}Concrete{'\n'}Artistry
          </Text>
          <Text style={styles.coverSubtitle}>
            From seamless microcement finishes to parametric facade systems—
            Arcos delivers Southeast Asia's most advanced architectural concrete solutions.
          </Text>
        </View>
        
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

    {/* Page 2: About Us */}
    <Page size="A4" style={[styles.page, styles.contentPage]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageNumber}>About Arcos</Text>
        <Text style={styles.pageNumber}>02</Text>
      </View>
      
      <Image src={landmarkInstallation} style={styles.sectionImage} />
      
      <View style={styles.accentBar} />
      <Text style={styles.sectionLabel}>Who We Are</Text>
      <Text style={styles.heading1}>Collapsing the gap between design and reality</Text>
      
      <View style={styles.twoColumn}>
        <View style={styles.columnLeft}>
          <Text style={styles.bodyText}>
            Arcos formed in 2025 when a collective of materials scientists, architects, 
            and fabrication engineers set out to collapse the gap between avant-garde 
            design intent and construction reality.
          </Text>
          <Text style={styles.bodyText}>
            We specialise in seamless microcement finishes, polished concrete overlays, 
            terrazzo systems, architectural panels, and 3D tiles—all engineered and 
            delivered through one accountable partner.
          </Text>
        </View>
        <View style={styles.columnRight}>
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
              Parametric modelling flows into robotic casting and 
              modular mold production.
            </Text>
          </View>
        </View>
      </View>
      
      <PageFooter pageNum={2} />
    </Page>

    {/* Page 3: Services */}
    <Page size="A4" style={[styles.page, styles.contentPage]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageNumber}>Our Services</Text>
        <Text style={styles.pageNumber}>03</Text>
      </View>
      
      <View style={styles.accentBar} />
      <Text style={styles.sectionLabel}>Ecosystem of Expertise</Text>
      <Text style={styles.heading1}>Full-spectrum concrete innovation</Text>
      
      <View style={[styles.grid2, { marginTop: 15 }]}>
        <View style={styles.gridItem2Left}>
          <Image src={microcementInterior} style={styles.smallImage} />
          <View style={styles.boxLight}>
            <Text style={styles.heading3}>Seamless Microcement</Text>
            <Text style={styles.bodyTextSmall}>
              2-3mm coatings for seamless surfaces. 60+ colors.
            </Text>
          </View>
        </View>
        
        <View style={styles.gridItem2Right}>
          <Image src={concretePanelDetail} style={styles.smallImage} />
          <View style={styles.boxLight}>
            <Text style={styles.heading3}>Architectural Panels</Text>
            <Text style={styles.bodyTextSmall}>
              UHPC and GFRC panels for facades and walls.
            </Text>
          </View>
        </View>
        
        <View style={styles.gridItem2Left}>
          <Image src={mosaicFacade} style={styles.smallImage} />
          <View style={styles.boxLight}>
            <Text style={styles.heading3}>3D Concrete Tiles</Text>
            <Text style={styles.bodyTextSmall}>
              Innovative tiles adding depth and dimension.
            </Text>
          </View>
        </View>
        
        <View style={styles.gridItem2Right}>
          <Image src={microcementWalls} style={styles.smallImage} />
          <View style={styles.boxLight}>
            <Text style={styles.heading3}>Polished Concrete</Text>
            <Text style={styles.bodyTextSmall}>
              High-performance polished overlays.
            </Text>
          </View>
        </View>
      </View>
      
      <PageFooter pageNum={3} />
    </Page>

    {/* Page 4: Process */}
    <Page size="A4" style={[styles.page, styles.contentPage]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageNumber}>Our Process</Text>
        <Text style={styles.pageNumber}>04</Text>
      </View>
      
      <View style={styles.twoColumn}>
        <View style={styles.columnLeft}>
          <Image src={workshopCloseup} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
        </View>
        <View style={styles.columnRight}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionLabel}>How We Work</Text>
          <Text style={styles.heading2}>From concept to completion</Text>
          <Text style={styles.bodyText}>
            Every engagement follows an integrated workflow, aligning concept, 
            engineering, fabrication, and delivery.
          </Text>
        </View>
      </View>
      
      <View style={[styles.grid4, { marginTop: 20 }]}>
        <View style={[styles.gridItem4, styles.box]}>
          <Text style={[styles.sectionLabel, { marginBottom: 4 }]}>01</Text>
          <Text style={styles.heading3}>Design</Text>
          <Text style={styles.bodyTextSmall}>
            Workshops to decode vision and criteria.
          </Text>
        </View>
        
        <View style={[styles.gridItem4, styles.box]}>
          <Text style={[styles.sectionLabel, { marginBottom: 4 }]}>02</Text>
          <Text style={styles.heading3}>Engineering</Text>
          <Text style={styles.bodyTextSmall}>
            Parametric modelling and simulations.
          </Text>
        </View>
        
        <View style={[styles.gridItem4, styles.box]}>
          <Text style={[styles.sectionLabel, { marginBottom: 4 }]}>03</Text>
          <Text style={styles.heading3}>Fabrication</Text>
          <Text style={styles.bodyTextSmall}>
            Robotics and CNC production.
          </Text>
        </View>
        
        <View style={[styles.gridItem4Last, styles.box]}>
          <Text style={[styles.sectionLabel, { marginBottom: 4 }]}>04</Text>
          <Text style={styles.heading3}>Installation</Text>
          <Text style={styles.bodyTextSmall}>
            White-glove delivery and support.
          </Text>
        </View>
      </View>
      
      <View style={[styles.boxLight, { marginTop: 15 }]}>
        <Text style={styles.heading3}>Why Arcos</Text>
        <View style={[styles.grid2, { marginTop: 8 }]}>
          <View style={styles.gridItem2Left}>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>One partner from concept to handover</Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>Material science expertise</Text>
            </View>
          </View>
          <View style={styles.gridItem2Right}>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>Certified installation teams</Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>BIM-ready digital workflows</Text>
            </View>
          </View>
        </View>
      </View>
      
      <PageFooter pageNum={4} />
    </Page>

    {/* Page 5: Technical Specifications */}
    <Page size="A4" style={[styles.page, styles.contentPage]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageNumber}>Technical Specs</Text>
        <Text style={styles.pageNumber}>05</Text>
      </View>
      
      <Image src={mixDesign} style={styles.sectionImage} />
      
      <View style={styles.accentBar} />
      <Text style={styles.sectionLabel}>Material Performance</Text>
      <Text style={styles.heading1}>Built to endure</Text>
      
      <View style={[styles.twoColumn, { marginTop: 15 }]}>
        <View style={styles.columnLeft}>
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
        <View style={styles.columnRight}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>-30 to +80C</Text>
            <Text style={styles.metricLabel}>Thermal Tolerance</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>50+ finishes</Text>
            <Text style={styles.metricLabel}>Surface Profiles</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>Class A1</Text>
            <Text style={styles.metricLabel}>Fire Rating</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.boxLight, { marginTop: 10 }]}>
        <Text style={styles.heading3}>Quality Assurance</Text>
        <View style={[styles.grid2, { marginTop: 8 }]}>
          <View style={styles.gridItem2Left}>
            <Text style={styles.bodyTextSmall}>Tolerance: +/-1mm</Text>
            <Text style={styles.bodyTextSmall}>Flatness: 2mm/3m max</Text>
          </View>
          <View style={styles.gridItem2Right}>
            <Text style={styles.bodyTextSmall}>Color Delta E: 2 max</Text>
            <Text style={styles.bodyTextSmall}>Defects: 0.1% max</Text>
          </View>
        </View>
      </View>
      
      <PageFooter pageNum={5} />
    </Page>

    {/* Page 6: Contact */}
    <Page size="A4" style={styles.page}>
      <View style={styles.coverPage}>
        <View style={styles.coverImageSection}>
          <Image src={microcementInterior} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
          <ArcosLogoPDF />
        </View>
        
        <View style={styles.coverContent}>
          <Text style={styles.coverLabel}>Get In Touch</Text>
          <Text style={styles.coverTitle}>
            Ready to{'\n'}start your{'\n'}project?
          </Text>
          <Text style={styles.coverSubtitle}>
            Whether you're an architect seeking material guidance or a developer 
            ready to break ground, our team is here to turn your vision into reality.
          </Text>
        </View>
        
        <View style={[styles.coverFooter, { backgroundColor: COLORS.black }]}>
          <View>
            <Text style={styles.coverLabel}>Email</Text>
            <Text style={{ color: COLORS.white, fontSize: 11 }}>hello@arcosworks.com</Text>
          </View>
          <View>
            <Text style={styles.coverLabel}>Website</Text>
            <Text style={{ color: COLORS.white, fontSize: 11 }}>arcosworks.com</Text>
          </View>
          <View>
            <Text style={styles.coverLabel}>Location</Text>
            <Text style={{ color: COLORS.white, fontSize: 11 }}>Southeast Asia</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// Download button component
export function CompanyProfileDownloadButton({ className = '' }: { className?: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== PDF BUTTON CLICKED ===');
    
    if (isGenerating) {
      console.log('Already generating, returning');
      return;
    }
    
    setIsGenerating(true);
    console.log('Starting PDF generation...');
    
    try {
      console.log('Creating PDF blob...');
      const blob = await pdf(<CompanyProfileDocument />).toBlob();
      console.log('PDF blob created, size:', blob.size);
      
      const url = URL.createObjectURL(blob);
      console.log('Blob URL created:', url);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Arcos-Company-Profile-2025.pdf';
      link.style.display = 'none';
      document.body.appendChild(link);
      
      console.log('Triggering download...');
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Cleanup complete');
      }, 100);
      
      console.log('=== PDF DOWNLOAD COMPLETE ===');
    } catch (error) {
      console.error('=== PDF ERROR ===', error);
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
            Generating PDF...
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
