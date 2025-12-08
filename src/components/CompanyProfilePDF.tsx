import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  PDFDownloadLink,
} from '@react-pdf/renderer';

/**
 * Arcos Company Profile PDF
 * 
 * Following Arcos Brand Guidelines:
 * - Colors: #232323 (black), #353535 (gray), #ffffff (white)
 * - Typography: Host Grotesk for headings, Helvetica for body
 * - Layout: Clean, minimalist, brutalist aesthetic
 */

// Register Host Grotesk font
Font.register({
  family: 'Host Grotesk',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/hostgrotesk/v4/46kulZYKqqWabN_eL8LgxS4Ew6xtKv5HZByHzuTi.woff2',
      fontWeight: 700,
    },
    {
      src: 'https://fonts.gstatic.com/s/hostgrotesk/v4/46kulZYKqqWabN_eL8LgxS4Ew6xtKv5HZByHzuTi.woff2',
      fontWeight: 600,
    },
  ],
});

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
    justifyContent: 'space-between',
    height: '100%',
  },
  coverHeader: {
    padding: 48,
  },
  coverLogo: {
    marginBottom: 24,
  },
  logoLine: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  logoText: {
    fontFamily: 'Host Grotesk',
    fontSize: 36,
    fontWeight: 700,
    letterSpacing: 1,
    color: COLORS.white,
  },
  coverMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 48,
  },
  coverTitle: {
    fontFamily: 'Host Grotesk',
    fontSize: 48,
    fontWeight: 700,
    textTransform: 'uppercase',
    lineHeight: 1.1,
    marginBottom: 24,
    color: COLORS.white,
  },
  coverSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    maxWidth: 400,
    lineHeight: 1.6,
  },
  coverFooter: {
    backgroundColor: COLORS.gray,
    padding: 32,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coverStat: {
    textAlign: 'center',
  },
  coverStatValue: {
    fontFamily: 'Host Grotesk',
    fontSize: 28,
    fontWeight: 700,
    color: COLORS.white,
  },
  coverStatLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Content pages
  contentPage: {
    padding: 48,
  },
  pageHeader: {
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 16,
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
    fontFamily: 'Host Grotesk',
    fontSize: 32,
    fontWeight: 700,
    textTransform: 'uppercase',
    lineHeight: 1.2,
    marginBottom: 16,
    color: COLORS.white,
  },
  heading2: {
    fontFamily: 'Host Grotesk',
    fontSize: 20,
    fontWeight: 700,
    textTransform: 'uppercase',
    lineHeight: 1.3,
    marginBottom: 12,
    color: COLORS.white,
  },
  heading3: {
    fontFamily: 'Host Grotesk',
    fontSize: 14,
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: 8,
    color: COLORS.white,
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  bodyTextSmall: {
    fontSize: 9,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.7)',
  },

  // Layout components
  twoColumn: {
    display: 'flex',
    flexDirection: 'row',
    gap: 24,
  },
  column: {
    flex: 1,
  },
  box: {
    backgroundColor: COLORS.gray,
    padding: 24,
    marginBottom: 16,
  },
  boxLight: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  // Grid layouts
  grid2: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem2: {
    width: '48%',
  },
  grid3: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  gridItem3: {
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
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 3,
    marginRight: 12,
    marginTop: 4,
  },
  listText: {
    flex: 1,
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
  },

  // Metrics/stats
  metric: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  metricValue: {
    fontFamily: 'Host Grotesk',
    fontSize: 24,
    fontWeight: 700,
    color: COLORS.white,
  },
  metricLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  footerLogo: {
    fontSize: 12,
    fontFamily: 'Host Grotesk',
    fontWeight: 700,
    color: COLORS.white,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
});

// Logo component for PDF
const ArcosLogoPDF = ({ size = 'normal' }: { size?: 'normal' | 'small' }) => (
  <View style={size === 'small' ? { marginBottom: 0 } : styles.coverLogo}>
    <View style={[styles.logoLine, size === 'small' && { width: 24, height: 2 }]} />
    <Text style={[styles.logoText, size === 'small' && { fontSize: 16 }]}>arcos</Text>
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
        <View style={styles.coverHeader}>
          <ArcosLogoPDF />
        </View>
        
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

    {/* Page 3: Services */}
    <Page size="A4" style={[styles.page, styles.contentPage]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageNumber}>Our Services</Text>
        <Text style={styles.pageNumber}>03</Text>
      </View>
      
      <Text style={styles.sectionLabel}>Ecosystem of Expertise</Text>
      <Text style={styles.heading1}>Full-spectrum concrete innovation</Text>
      
      <View style={[styles.grid2, { marginTop: 24 }]}>
        <View style={[styles.gridItem2, styles.boxLight]}>
          <Text style={styles.heading3}>Seamless Microcement</Text>
          <Text style={styles.bodyTextSmall}>
            Thin-layer coatings (2-3mm) applied directly on-site for seamless, 
            joint-free surfaces. 60+ colors available.
          </Text>
          <View style={{ marginTop: 12 }}>
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
          <View style={{ marginTop: 12 }}>
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
          <View style={{ marginTop: 12 }}>
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
          <View style={{ marginTop: 12 }}>
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
      
      <Text style={styles.sectionLabel}>How We Work</Text>
      <Text style={styles.heading1}>From concept to completion</Text>
      <Text style={styles.bodyText}>
        Every engagement follows an integrated workflow, aligning concept, 
        material engineering, digital fabrication, and delivery into one continuous rhythm.
      </Text>
      
      <View style={[styles.grid3, { marginTop: 24 }]}>
        <View style={[styles.gridItem3, styles.box]}>
          <Text style={styles.sectionLabel}>01</Text>
          <Text style={styles.heading3}>Design & Planning</Text>
          <Text style={styles.bodyTextSmall}>
            Strategic workshops to decode vision, environmental context, 
            timelines, and performance criteria.
          </Text>
        </View>
        
        <View style={[styles.gridItem3, styles.box]}>
          <Text style={styles.sectionLabel}>02</Text>
          <Text style={styles.heading3}>Material Engineering</Text>
          <Text style={styles.bodyTextSmall}>
            Computational design, parametric modelling, and structural 
            simulations feed into fabrication logic.
          </Text>
        </View>
        
        <View style={[styles.gridItem3, styles.box]}>
          <Text style={styles.sectionLabel}>03</Text>
          <Text style={styles.heading3}>Fabrication</Text>
          <Text style={styles.bodyTextSmall}>
            Robotics, CNC milling, and tailored mix production operate 
            in parallel to compress schedules.
          </Text>
        </View>
      </View>
      
      <View style={[styles.box, { marginTop: 16 }]}>
        <Text style={styles.sectionLabel}>04</Text>
        <Text style={styles.heading3}>Installation & Delivery</Text>
        <Text style={styles.bodyTextSmall}>
          Global logistics, white-glove installation, and post-install monitoring 
          ensure the design performs for decades. Our certified installers handle 
          every project with precision and care.
        </Text>
      </View>
      
      <PageFooter pageNum={4} />
    </Page>

    {/* Page 5: Technical Specifications */}
    <Page size="A4" style={[styles.page, styles.contentPage]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageNumber}>Technical Specs</Text>
        <Text style={styles.pageNumber}>05</Text>
      </View>
      
      <Text style={styles.sectionLabel}>Material Performance</Text>
      <Text style={styles.heading1}>Built to endure</Text>
      <Text style={styles.bodyText}>
        Precision data informs every specification. Our lab continuously profiles 
        mix behaviour to guarantee repeatable results on site.
      </Text>
      
      <View style={[styles.twoColumn, { marginTop: 24 }]}>
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
            <Text style={styles.metricValue}>−30°C to +80°C</Text>
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
      
      <View style={[styles.boxLight, { marginTop: 24 }]}>
        <Text style={styles.heading3}>Quality Assurance</Text>
        <View style={[styles.grid2, { marginTop: 12 }]}>
          <View style={styles.gridItem2}>
            <Text style={styles.bodyTextSmall}>• Dimensional Tolerance: ±1mm</Text>
            <Text style={styles.bodyTextSmall}>• Surface Flatness: ≤2mm/3m</Text>
          </View>
          <View style={styles.gridItem2}>
            <Text style={styles.bodyTextSmall}>• Color Consistency: ΔE ≤ 2</Text>
            <Text style={styles.bodyTextSmall}>• Defect Rate: &lt;0.1%</Text>
          </View>
        </View>
      </View>
      
      <PageFooter pageNum={5} />
    </Page>

    {/* Page 6: Contact */}
    <Page size="A4" style={styles.page}>
      <View style={[styles.coverPage, { backgroundColor: COLORS.gray }]}>
        <View style={styles.coverHeader}>
          <ArcosLogoPDF />
        </View>
        
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
        
        <View style={[styles.coverFooter, { backgroundColor: COLORS.black }]}>
          <View>
            <Text style={styles.sectionLabel}>Email</Text>
            <Text style={{ color: COLORS.white, fontSize: 12 }}>hello@arcosworks.com</Text>
          </View>
          <View>
            <Text style={styles.sectionLabel}>Website</Text>
            <Text style={{ color: COLORS.white, fontSize: 12 }}>arcosworks.com</Text>
          </View>
          <View>
            <Text style={styles.sectionLabel}>Location</Text>
            <Text style={{ color: COLORS.white, fontSize: 12 }}>Southeast Asia</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

// Download button component
export function CompanyProfileDownloadButton({ className = '' }: { className?: string }) {
  return (
    <PDFDownloadLink
      document={<CompanyProfileDocument />}
      fileName="Arcos-Company-Profile-2025.pdf"
      className={className}
    >
      {({ loading }) => (
        <span className="inline-flex items-center gap-2">
          {loading ? (
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
      )}
    </PDFDownloadLink>
  );
}

export { CompanyProfileDocument };
export default CompanyProfileDownloadButton;
