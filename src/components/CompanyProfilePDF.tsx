import React, { useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';

/**
 * Arcos Company Profile PDF
 * 
 * Following Arcos Brand Guidelines:
 * - Colors: #232323 (black), #353535 (gray), #ffffff (white)
 * - Typography: Helvetica (built-in, similar to brand fonts)
 * - Layout: Clean, minimalist, brutalist aesthetic
 * 
 * Note: Images removed due to @react-pdf/renderer not supporting WebP format
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
  page: {
    backgroundColor: COLORS.black,
    color: COLORS.white,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.6,
  },
  
  // Cover page
  coverPage: {
    padding: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  coverHeader: {
    marginBottom: 40,
  },
  logoLine: {
    width: 50,
    height: 5,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  logoText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 48,
    letterSpacing: 2,
    color: COLORS.white,
  },
  coverMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  coverLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 4,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  coverTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 52,
    textTransform: 'uppercase',
    lineHeight: 1.05,
    marginBottom: 30,
    color: COLORS.white,
  },
  coverSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    maxWidth: 400,
    lineHeight: 1.7,
  },
  coverFooter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 30,
    marginTop: 40,
  },
  coverStat: {
    textAlign: 'left',
  },
  coverStatValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 32,
    color: COLORS.white,
  },
  coverStatLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Content pages
  contentPage: {
    padding: 50,
  },
  pageHeader: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageNumber: {
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  
  // Typography
  sectionLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 4,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  heading1: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    textTransform: 'uppercase',
    lineHeight: 1.15,
    marginBottom: 20,
    color: COLORS.white,
  },
  heading2: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    textTransform: 'uppercase',
    lineHeight: 1.2,
    marginBottom: 12,
    color: COLORS.white,
  },
  heading3: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 8,
    color: COLORS.white,
  },
  bodyText: {
    fontSize: 11,
    lineHeight: 1.8,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 15,
  },
  bodyTextSmall: {
    fontSize: 10,
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.75)',
  },

  // Layout components
  twoColumn: {
    display: 'flex',
    flexDirection: 'row',
    gap: 30,
  },
  column: {
    flex: 1,
  },
  box: {
    backgroundColor: COLORS.gray,
    padding: 20,
    marginBottom: 15,
  },
  boxLight: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  // Grid layouts
  grid2: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  gridItem2: {
    width: '48%',
  },
  grid4: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  gridItem4: {
    flex: 1,
  },

  // Lists
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 8,
  },
  listBullet: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
    marginRight: 12,
    marginTop: 5,
  },
  listText: {
    flex: 1,
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },

  // Metrics/stats
  metric: {
    marginBottom: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  metricValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 26,
    color: COLORS.white,
  },
  metricLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 35,
    left: 50,
    right: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 15,
  },
  footerLogo: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },

  // Decorative
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 25,
  },
  accentBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.white,
    marginBottom: 15,
  },
});

// Logo component for PDF
const ArcosLogoPDF = () => (
  <View style={styles.coverHeader}>
    <View style={styles.logoLine} />
    <Text style={styles.logoText}>arcos</Text>
  </View>
);

// Small logo
const ArcosLogoSmall = () => (
  <View>
    <View style={{ width: 24, height: 3, backgroundColor: COLORS.white, marginBottom: 4 }} />
    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 16, color: COLORS.white }}>arcos</Text>
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
    {/* Cover Page */}
    <Page size="A4" style={styles.page}>
      <View style={styles.coverPage}>
        <ArcosLogoPDF />
        
        <View style={styles.coverMain}>
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
      
      <View style={styles.accentBar} />
      <Text style={styles.sectionLabel}>Who We Are</Text>
      <Text style={styles.heading1}>Collapsing the gap between design intent and construction reality</Text>
      
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
          <Text style={styles.bodyText}>
            From laboratory mix development to on-site installation, our team balances 
            strength, durability, and aesthetic precision. Designers come to us when they 
            need the craftsmanship and scientific rigour to make ambitious spaces possible.
          </Text>
        </View>
        <View style={styles.column}>
          <View style={styles.box}>
            <Text style={styles.heading3}>Material Lab</Text>
            <Text style={styles.bodyTextSmall}>
              UHPC, GFRC, and microtopping formulations tuned for climate, 
              performance, and finish. Every mix is developed in-house.
            </Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.heading3}>Digital Fabrication</Text>
            <Text style={styles.bodyTextSmall}>
              Parametric modelling flows into robotic casting, modular molds, 
              logistics, and install supervision.
            </Text>
          </View>
          <View style={styles.box}>
            <Text style={styles.heading3}>Project Delivery</Text>
            <Text style={styles.bodyTextSmall}>
              End-to-end accountability from design-assist through 
              installation and handover documentation.
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
      <Text style={styles.bodyText}>
        Every project benefits from our integrated approach—material science, fabrication, 
        and installation under one roof.
      </Text>
      
      <View style={[styles.grid2, { marginTop: 20 }]}>
        <View style={[styles.gridItem2, styles.boxLight]}>
          <Text style={styles.heading3}>Seamless Microcement</Text>
          <Text style={styles.bodyTextSmall}>
            Thin-layer coatings (2-3mm) applied directly on-site for seamless, 
            joint-free surfaces. 60+ colors available.
          </Text>
          <View style={{ marginTop: 10 }}>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>Floors, walls, and wet areas</Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>Moisture and UV resistant</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.gridItem2, styles.boxLight]}>
          <Text style={styles.heading3}>Architectural Panels</Text>
          <Text style={styles.bodyTextSmall}>
            Prefabricated UHPC and GFRC panels for facades and feature walls. 
            Custom sizes, textures, and finishes.
          </Text>
          <View style={{ marginTop: 10 }}>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>Precision manufacturing</Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>Weather-resistant formulations</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.gridItem2, styles.boxLight]}>
          <Text style={styles.heading3}>3D Concrete Tiles</Text>
          <Text style={styles.bodyTextSmall}>
            Add depth and dimension with innovative 3D concrete tiles. 
            Multiple patterns for interior and exterior.
          </Text>
          <View style={{ marginTop: 10 }}>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>Lightweight and easy install</Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>Custom designs available</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.gridItem2, styles.boxLight]}>
          <Text style={styles.heading3}>Polished Concrete</Text>
          <Text style={styles.bodyTextSmall}>
            High-performance polished overlays for commercial and residential 
            spaces requiring durability and aesthetics.
          </Text>
          <View style={{ marginTop: 10 }}>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>Mirror-finish options</Text>
            </View>
            <View style={styles.listItem}>
              <View style={styles.listBullet} />
              <Text style={styles.listText}>High abrasion resistance</Text>
            </View>
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
      
      <View style={styles.accentBar} />
      <Text style={styles.sectionLabel}>How We Work</Text>
      <Text style={styles.heading1}>From concept to completion</Text>
      <Text style={styles.bodyText}>
        Every engagement follows an integrated workflow, aligning concept, 
        material engineering, digital fabrication, and delivery into one continuous rhythm.
      </Text>
      
      <View style={[styles.grid4, { marginTop: 25 }]}>
        <View style={[styles.gridItem4, styles.box]}>
          <Text style={[styles.sectionLabel, { marginBottom: 5 }]}>01</Text>
          <Text style={styles.heading3}>Design & Planning</Text>
          <Text style={styles.bodyTextSmall}>
            Strategic workshops to decode vision, environmental context, 
            timelines, and performance criteria.
          </Text>
        </View>
        
        <View style={[styles.gridItem4, styles.box]}>
          <Text style={[styles.sectionLabel, { marginBottom: 5 }]}>02</Text>
          <Text style={styles.heading3}>Engineering</Text>
          <Text style={styles.bodyTextSmall}>
            Computational design, parametric modelling, and structural 
            simulations feed into fabrication logic.
          </Text>
        </View>
        
        <View style={[styles.gridItem4, styles.box]}>
          <Text style={[styles.sectionLabel, { marginBottom: 5 }]}>03</Text>
          <Text style={styles.heading3}>Fabrication</Text>
          <Text style={styles.bodyTextSmall}>
            Robotics, CNC milling, and tailored mix production operate 
            in parallel to compress schedules.
          </Text>
        </View>
        
        <View style={[styles.gridItem4, styles.box]}>
          <Text style={[styles.sectionLabel, { marginBottom: 5 }]}>04</Text>
          <Text style={styles.heading3}>Installation</Text>
          <Text style={styles.bodyTextSmall}>
            White-glove installation and post-install monitoring ensure 
            decades of performance.
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <Text style={styles.heading2}>Why Arcos</Text>
      <View style={styles.grid2}>
        <View style={styles.gridItem2}>
          <View style={styles.listItem}>
            <View style={styles.listBullet} />
            <Text style={styles.listText}>One partner from concept to handover</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.listBullet} />
            <Text style={styles.listText}>Material science expertise</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.listBullet} />
            <Text style={styles.listText}>Certified installation teams</Text>
          </View>
        </View>
        <View style={styles.gridItem2}>
          <View style={styles.listItem}>
            <View style={styles.listBullet} />
            <Text style={styles.listText}>BIM-ready digital workflows</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.listBullet} />
            <Text style={styles.listText}>Regional expertise (SE Asia)</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.listBullet} />
            <Text style={styles.listText}>Sustainability focused</Text>
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
      
      <View style={styles.accentBar} />
      <Text style={styles.sectionLabel}>Material Performance</Text>
      <Text style={styles.heading1}>Built to endure</Text>
      <Text style={styles.bodyText}>
        Precision data informs every specification. Our lab continuously profiles 
        mix behaviour to guarantee repeatable results on site.
      </Text>
      
      <View style={[styles.twoColumn, { marginTop: 25 }]}>
        <View style={styles.column}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>≥120 MPa</Text>
            <Text style={styles.metricLabel}>Compressive Strength</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>≥25 MPa</Text>
            <Text style={styles.metricLabel}>Flexural Strength</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>≤3%</Text>
            <Text style={styles.metricLabel}>Water Absorption</Text>
          </View>
        </View>
        <View style={styles.column}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>-30 to +80°C</Text>
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
      
      <View style={[styles.boxLight, { marginTop: 15 }]}>
        <Text style={styles.heading3}>Quality Assurance</Text>
        <View style={[styles.grid2, { marginTop: 10 }]}>
          <View style={styles.gridItem2}>
            <Text style={styles.bodyTextSmall}>• Dimensional Tolerance: ±1mm</Text>
            <Text style={styles.bodyTextSmall}>• Surface Flatness: ≤2mm/3m</Text>
          </View>
          <View style={styles.gridItem2}>
            <Text style={styles.bodyTextSmall}>• Color Consistency: ΔE ≤ 2</Text>
            <Text style={styles.bodyTextSmall}>• Defect Rate: less than 0.1%</Text>
          </View>
        </View>
      </View>
      
      <PageFooter pageNum={5} />
    </Page>

    {/* Page 6: Contact */}
    <Page size="A4" style={styles.page}>
      <View style={[styles.coverPage, { backgroundColor: COLORS.gray }]}>
        <ArcosLogoSmall />
        
        <View style={styles.coverMain}>
          <Text style={styles.coverLabel}>Get In Touch</Text>
          <Text style={styles.coverTitle}>
            Ready to{'\n'}start your{'\n'}project?
          </Text>
          <Text style={styles.coverSubtitle}>
            Whether you're an architect seeking material guidance or a developer 
            ready to break ground, our team is here to turn your vision into reality.
          </Text>
        </View>
        
        <View style={[styles.coverFooter, { borderTopColor: 'rgba(255,255,255,0.1)' }]}>
          <View>
            <Text style={[styles.sectionLabel, { marginBottom: 5 }]}>Email</Text>
            <Text style={{ color: COLORS.white, fontSize: 13 }}>hello@arcosworks.com</Text>
          </View>
          <View>
            <Text style={[styles.sectionLabel, { marginBottom: 5 }]}>Website</Text>
            <Text style={{ color: COLORS.white, fontSize: 13 }}>arcosworks.com</Text>
          </View>
          <View>
            <Text style={[styles.sectionLabel, { marginBottom: 5 }]}>Location</Text>
            <Text style={{ color: COLORS.white, fontSize: 13 }}>Southeast Asia</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// Download button component
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
