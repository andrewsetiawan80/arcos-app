// src/screens/PublicHomeScreen.tsx - Match web app PublicHome 100%
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, Linking, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../store/auth';
import { load } from '../store';
import { api } from '../lib/api';
import type { AppState, Product, Category } from '../types';
import Button from '../components/Button';
import ArqonLogo from '../components/ArqonLogo';
import PublicHeader from '../components/PublicHeader';

function categoryName(slug?: string, categories: Category[] = []) {
  return categories.find((c) => c.slug === slug)?.name;
}

export default function PublicHomeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const servicesRef = useRef<View>(null);
  const processRef = useRef<View>(null);
  const projectsRef = useRef<View>(null);
  const contactRef = useRef<View>(null);
  
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    const loadData = async () => {
      try {
        const appState = await load();
        setState(appState);
      } catch (error) {
        console.error('Failed to load app state:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Fetch services and featured projects from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingServices(true);
        const [servicesRes, projectsRes] = await Promise.all([
          api.getServices(),
          api.getFeaturedProjects(),
        ]);
        
        if (!servicesRes.error && servicesRes.data) {
          // Take first 5 services for display
          setServices((servicesRes.data as any[]).slice(0, 5));
        }
        
        if (!projectsRes.error && projectsRes.data) {
          setFeaturedProjects((projectsRes.data as any[]).slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch services/projects:', error);
      } finally {
        setLoadingServices(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle scroll to section from navigation params
  useEffect(() => {
    const params = route.params as any;
    if (params?.scrollTo && scrollViewRef.current) {
      setTimeout(() => {
        let targetRef: React.RefObject<View> | null = null;
        switch (params.scrollTo) {
          case 'services':
            targetRef = servicesRef;
            break;
          case 'process':
            targetRef = processRef;
            break;
          case 'projects':
            targetRef = projectsRef;
            break;
          case 'contact':
            targetRef = contactRef;
            break;
        }
        
        if (targetRef?.current) {
          targetRef.current.measureInWindow((x, y, width, height) => {
            scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
          });
        }
      }, 300);
    }
  }, [route.params]);

  // All hooks must be called before any conditional returns
  const site = state?.settings?.site || {};
  const products: Product[] = state?.products || [];
  const categories: Category[] = state?.categories || [];

  const heroTitle = site.heroTitle || "ARCHITECTURAL CONCRETE, REFINED.";
  const heroSubtitle = site.heroSubtitle || "UHPC & GFRC panels, modular tiles, and microcement finishes — engineered for strength, durability, and beauty.";

  const featured = useMemo(
    () => products.filter((p) => !!p.public && !!p.featured && !!p.slug).slice(0, 6),
    [products]
  );

  // Use featured projects from API, fallback to products, then default
  const displayProjects = useMemo(() => {
    if (featuredProjects.length > 0) {
      return featuredProjects.map((p: any) => ({
        title: p.title,
        category: p.category,
        image: p.imageUrl,
        slug: undefined,
        big: false,
      }));
    }
    if (featured.length > 0) {
      return featured.map((p: Product) => ({
        title: p.name,
        category: categoryName(p.categorySlug, categories),
        image: p.coverImageUrl || '',
        slug: p.slug,
        big: false,
      }));
    }
    // Fallback default projects
    return [
      { title: "Modern Facade Panels", category: "UHPC Systems", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop", big: true },
      { title: "Interior Tile Collection", category: "Modular Tiles", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop", big: false },
      { title: "Custom Microcement Finish", category: "Finishes", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop", big: false },
      { title: "Structural GFRC Elements", category: "GFRC Systems", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop", big: false },
      { title: "Commercial Installation", category: "Projects", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop", big: false },
    ];
  }, [featuredProjects, featured, categories]);

  // Use services from API, fallback to default
  const displayServices = useMemo(() => {
    if (services.length > 0) {
      return services.map((s: any) => ({
        title: s.title,
        desc: s.description,
        image: s.imageUrl || "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
        features: s.points || [],
      }));
    }
    // Fallback default services
    return [
      { title: "UHPC Panels", desc: "Ultra-high performance concrete panels with compressive strength exceeding 150 MPa. Ideal for facades, cladding, and structural applications requiring exceptional durability and aesthetic precision.", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop", features: ["150+ MPa strength", "Custom sizes", "Various finishes"] },
      { title: "GFRC Systems", desc: "Glass fiber reinforced concrete delivering lightweight yet durable architectural elements. Perfect for large-scale projects requiring strength-to-weight optimization and design flexibility.", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop", features: ["Lightweight", "High flexibility", "Weather resistant"] },
      { title: "Modular Tiles", desc: "Precision-cast modular tiles engineered for flooring, walls, and decorative surfaces. Available in multiple sizes, textures, and finishes to match any design aesthetic.", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop", features: ["Multiple sizes", "Easy installation", "Durable finish"] },
      { title: "Microcement Finishes", desc: "Seamless, contemporary microcement applications for both interiors and exteriors. Creates a modern, continuous surface with exceptional durability and minimal maintenance.", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop", features: ["Seamless finish", "Low maintenance", "Versatile colors"] },
      { title: "Custom Fabrication", desc: "Tailored solutions for unique architectural requirements and specifications. From complex geometries to specialized performance needs, we bring your vision to life.", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop", features: ["Bespoke design", "Complex geometries", "Technical support"] },
    ];
  }, [services]);

  if (loading || !state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  const processSteps = [
    { step: "01", title: "Consultation", desc: "We discuss your vision, requirements, and project specifications to understand your needs." },
    { step: "02", title: "Design & Engineering", desc: "Our team creates detailed designs and engineering calculations to ensure optimal performance." },
    { step: "03", title: "Fabrication", desc: "Precision manufacturing in our state-of-the-art facility using advanced concrete technology." },
    { step: "04", title: "Installation", desc: "Professional installation by certified teams ensuring perfect execution on-site." },
  ];

  const specs = [
    { title: "Compressive Strength", value: "150+ MPa", desc: "Exceptional structural integrity for demanding applications" },
    { title: "Flexural Strength", value: "25+ MPa", desc: "Superior resistance to bending and deformation" },
    { title: "Density", value: "2,400 kg/m³", desc: "Optimized weight-to-strength ratio for efficiency" },
    { title: "Water Absorption", value: "< 0.5%", desc: "Minimal water ingress for long-term durability" },
    { title: "Freeze-Thaw", value: "300+ Cycles", desc: "Excellent resistance to extreme temperature variations" },
    { title: "Fire Rating", value: "A1 Class", desc: "Non-combustible material meeting highest safety standards" },
  ];

  const applications = [
    { title: "Facades & Cladding", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop", desc: "Modern building exteriors" },
    { title: "Interior Surfaces", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop", desc: "Walls, floors, and ceilings" },
    { title: "Landscape Design", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop", desc: "Outdoor installations" },
    { title: "Structural Elements", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop", desc: "Load-bearing components" },
  ];

  const testimonials = [
    { quote: "The quality and precision of Arqon's UHPC panels exceeded our expectations. The installation was seamless and the final result is stunning.", author: "Sarah Chen", role: "Project Architect", company: "Modern Architecture Studio", project: "Commercial Tower, Jakarta" },
    { quote: "Working with Arqon transformed our design vision into reality. Their expertise in custom fabrication allowed us to create unique architectural elements.", author: "Michael Rodriguez", role: "Lead Designer", company: "Urban Design Collective", project: "Residential Complex, Bali" },
    { quote: "The durability and aesthetic appeal of their products is unmatched. Our clients are consistently impressed with the finish quality.", author: "David Kim", role: "Construction Manager", company: "Premium Builders Group", project: "Hotel Renovation, Singapore" },
  ];

  const stats = [
    { number: "35+", label: "Years Experience" },
    { number: "500+", label: "Projects Completed" },
    { number: "50+", label: "Countries Served" },
    { number: "98%", label: "Client Satisfaction" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <PublicHeader navigation={navigation} />
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== HERO ===== */}
        <View style={[styles.heroSection, { paddingTop: 40, paddingBottom: 80 }]}>
        <View style={styles.heroBackground}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop" }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={[styles.heroOverlay, { backgroundColor: 'rgba(26, 26, 26, 0.7)' }]} />
        </View>
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            {heroTitle}
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            {heroSubtitle}
          </Text>
          <View style={styles.heroButtons}>
            <Button
              title="View Catalog"
              onPress={() => navigation.navigate('PublicCatalog')}
              variant="primary"
              style={{ flex: 1, minWidth: 140 }}
            />
            <Button
              title="Contact"
              onPress={() => {
                // Scroll to contact section
                // For now, just open email
                Linking.openURL(`mailto:${site.contactEmail || 'hello@arqon.com'}`);
              }}
              variant="secondary"
              style={{ flex: 1, minWidth: 140 }}
            />
          </View>
        </View>
      </View>

      {/* ===== ABOUT ===== */}
      <View style={[styles.section, { paddingVertical: 40, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <View style={styles.aboutContainer}>
          <View style={styles.aboutContent}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              WELCOME TO ARQON
            </Text>
            <Text style={[styles.aboutTitle, { color: colors.text }]}>
              New Heights in the World of Concrete Fabrication
            </Text>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              With decades of experience in architectural concrete, we specialize in creating 
              precision-engineered products that combine exceptional strength with aesthetic beauty. 
              Our expertise spans UHPC panels, GFRC systems, modular tiles, and custom microcement 
              finishes for residential, commercial, and institutional projects.
            </Text>
            <Text style={[styles.aboutTextSmall, { color: colors.textMuted }]}>
              Since 1989, we've been pushing the boundaries of what's possible with concrete, 
              delivering innovative solutions that stand the test of time.
            </Text>
          </View>
          <View style={styles.aboutImageContainer}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop" }}
              style={styles.aboutImage}
              resizeMode="cover"
            />
            <View style={[styles.aboutImageBorder, { borderColor: colors.border }]} />
          </View>
        </View>
      </View>

      {/* ===== SERVICES ===== */}
      <View ref={servicesRef} style={[styles.section, { paddingVertical: 40, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            WHAT WE OFFER
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Services
          </Text>
        </View>
        <View style={styles.servicesGrid}>
          {loadingServices ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            displayServices.map((service, i) => (
            <View key={i} style={[styles.serviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.serviceImageContainer}>
                <Image
                  source={{ uri: service.image }}
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
                <View style={styles.serviceImageOverlay} />
              </View>
              <View style={styles.serviceCardContent}>
                <Text style={[styles.serviceTitle, { color: colors.text }]}>
                  {service.title}
                </Text>
                <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>
                  {service.desc}
                </Text>
                {service.features && (
                  <View style={styles.serviceFeatures}>
                    {service.features.map((feature, fi) => (
                      <View key={fi} style={styles.serviceFeature}>
                        <Ionicons name="checkmark" size={12} color={colors.textMuted} />
                        <Text style={[styles.serviceFeatureText, { color: colors.textMuted }]}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
            ))
          )}
        </View>
      </View>

      {/* ===== PROCESS ===== */}
      <View ref={processRef} style={[styles.section, { paddingVertical: 40, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.processHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            HOW IT WORKS
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Our Process
          </Text>
          <Text style={[styles.processSubtitle, { color: colors.textSecondary }]}>
            From initial consultation to final installation, we guide you through every step of your project.
          </Text>
        </View>
        <View style={styles.processGrid}>
          {processSteps.map((step, i) => (
            <View key={i} style={styles.processItem}>
              <View style={[styles.processCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.processStepNumber, { color: colors.text }]}>
                  {step.step}
                </Text>
              </View>
              <Text style={[styles.processTitle, { color: colors.text }]}>
                {step.title}
              </Text>
              <Text style={[styles.processDesc, { color: colors.textSecondary }]}>
                {step.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ===== TECHNICAL SPECIFICATIONS ===== */}
      <View style={[styles.section, { paddingVertical: 40, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            TECHNICAL EXCELLENCE
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Specifications
          </Text>
        </View>
        <View style={styles.specsGrid}>
          {specs.map((spec, i) => (
            <View key={i} style={[styles.specCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.specValue, { color: colors.text }]}>
                {spec.value}
              </Text>
              <Text style={[styles.specTitle, { color: colors.textSecondary }]}>
                {spec.title}
              </Text>
              <Text style={[styles.specDesc, { color: colors.textMuted }]}>
                {spec.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ===== APPLICATIONS ===== */}
      <View style={[styles.section, { paddingVertical: 40, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            VERSATILE APPLICATIONS
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Where Our Products Excel
          </Text>
        </View>
        <View style={styles.applicationsGrid}>
          {applications.map((app, i) => (
            <View key={i} style={styles.applicationCard}>
              <View style={styles.applicationImageContainer}>
                <Image
                  source={{ uri: app.image }}
                  style={styles.applicationImage}
                  resizeMode="cover"
                />
                <View style={styles.applicationOverlay} />
                <View style={styles.applicationContent}>
                  <Text style={[styles.applicationTitle, { color: colors.text }]}>
                    {app.title}
                  </Text>
                  <Text style={[styles.applicationDesc, { color: colors.textSecondary }]}>
                    {app.desc}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ===== FEATURED PROJECTS ===== */}
      <View ref={projectsRef} style={[styles.section, { paddingVertical: 40, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <View style={styles.projectsHeader}>
          <View>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              FEATURED WORK
            </Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Our Projects
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('PublicCatalog')}
            style={[styles.viewAllButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.viewAllText, { color: colors.text }]}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.projectsGrid}>
          {loadingServices ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            displayProjects.slice(0, 5).map((project: any, i: number) => (
            <TouchableOpacity
              key={i}
              style={[styles.projectCard, i === 0 && styles.projectCardBig]}
              onPress={() => {
                if (project.slug) {
                  navigation.navigate('PublicProductDetail', { slug: project.slug });
                }
              }}
            >
              <Image
                source={{ uri: project.coverImageUrl || project.image }}
                style={styles.projectImage}
                resizeMode="cover"
              />
              <View style={styles.projectOverlay} />
              <View style={styles.projectContent}>
                <Text style={[styles.projectTitle, { color: colors.text }]} numberOfLines={2}>
                  {project.title}
                </Text>
                <Text style={[styles.projectCategory, { color: colors.textMuted }]}>
                  {project.categorySlug ? categoryName(project.categorySlug, categories) : project.category}
                </Text>
              </View>
            </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* ===== TESTIMONIALS ===== */}
      <View style={[styles.section, { paddingVertical: 40, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <View style={styles.testimonialsHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            CLIENT STORIES
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What Our Clients Say
          </Text>
        </View>
        <View style={styles.testimonialsGrid}>
          {testimonials.map((testimonial, i) => (
            <View key={i} style={[styles.testimonialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="chatbubbles-outline" size={32} color={colors.textMuted} style={{ marginBottom: 16 }} />
              <Text style={[styles.testimonialQuote, { color: colors.textSecondary }]}>
                "{testimonial.quote}"
              </Text>
              <View style={[styles.testimonialDivider, { borderTopColor: colors.border }]} />
              <Text style={[styles.testimonialAuthor, { color: colors.text }]}>
                {testimonial.author}
              </Text>
              <Text style={[styles.testimonialRole, { color: colors.textSecondary }]}>
                {testimonial.role}
              </Text>
              <Text style={[styles.testimonialCompany, { color: colors.textMuted }]}>
                {testimonial.company}
              </Text>
              <Text style={[styles.testimonialProject, { color: colors.textMuted }]}>
                {testimonial.project}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ===== STATS ===== */}
      <View style={[styles.section, { paddingVertical: 40, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {stat.number}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ===== CONTACT ===== */}
      <View ref={contactRef} style={[styles.section, { paddingVertical: 40, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <View style={styles.contactBackground}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop" }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={[styles.contactOverlay, { backgroundColor: 'rgba(26, 26, 26, 0.8)' }]} />
        </View>
        <View style={styles.contactContent}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            GET IN TOUCH
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact
          </Text>
          <Text style={[styles.contactIntro, { color: colors.textSecondary }]}>
            Tell us about your project—sizes, finish, and timeline. We'll get back with samples 
            and a tailored quotation.
          </Text>
          <View style={styles.contactGrid}>
            {site.contactEmail && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`mailto:${site.contactEmail}`)}
                style={[styles.contactItem, { borderColor: colors.border, backgroundColor: colors.surface }]}
              >
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Email</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{site.contactEmail}</Text>
              </TouchableOpacity>
            )}
            <View style={[styles.contactItem, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Location</Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>Jakarta, Indonesia</Text>
            </View>
            <View style={[styles.contactItem, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Phone</Text>
              <Text style={[styles.contactValue, { color: colors.text }]}>+62 21 1234 5678</Text>
            </View>
          </View>
          <View style={styles.contactButtons}>
            <Button
              title="Request Sample"
              onPress={() => Linking.openURL(`mailto:${site.contactEmail || 'hello@arqon.com'}?subject=Sample Request`)}
              variant="primary"
              style={{ flex: 1 }}
            />
            <Button
              title="Get Quote"
              onPress={() => Linking.openURL(`mailto:${site.contactEmail || 'hello@arqon.com'}?subject=Quote Request`)}
              variant="secondary"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

// Create styles function to use screenWidth
const createStyles = (screenWidth: number) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Hero
  heroSection: {
    position: 'relative',
    minHeight: Math.min(450, screenWidth * 0.75),
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    zIndex: 1,
    width: '100%',
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: Math.min(36, screenWidth * 0.1),
    fontWeight: '900',
    textTransform: 'uppercase',
    lineHeight: Math.min(42, screenWidth * 0.12),
    marginBottom: 16,
    letterSpacing: -0.5,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  heroSubtitle: {
    fontSize: Math.min(16, screenWidth * 0.04),
    lineHeight: Math.min(24, screenWidth * 0.06),
    marginBottom: 24,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
  },
  // Section
  section: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: Math.min(32, screenWidth * 0.08),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    lineHeight: Math.min(38, screenWidth * 0.1),
    textAlign: 'left',
  },
  // About
  aboutContainer: {
    gap: 24,
  },
  aboutContent: {
    gap: 16,
  },
  aboutTitle: {
    fontSize: Math.min(32, screenWidth * 0.08),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    lineHeight: Math.min(38, screenWidth * 0.1),
    textAlign: 'left',
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
  aboutTextSmall: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  aboutImageContainer: {
    position: 'relative',
    width: '100%',
    height: Math.min(screenWidth * 0.75, 280),
    borderRadius: 12,
    overflow: 'hidden',
  },
  aboutImage: {
    width: '100%',
    height: '100%',
  },
  aboutImageBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 12,
    pointerEvents: 'none',
  },
  // Services
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  serviceImageContainer: {
    position: 'relative',
    width: '100%',
    height: Math.min(screenWidth * 0.5, 180),
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  serviceCardContent: {
    padding: 20,
    gap: 12,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  serviceDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  serviceFeatures: {
    gap: 6,
    marginTop: 8,
  },
  serviceFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceFeatureText: {
    fontSize: 12,
  },
  // Process
  processHeader: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  processSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 24,
  },
  processGrid: {
    gap: 32,
  },
  processItem: {
    alignItems: 'center',
    gap: 12,
  },
  processCircle: {
    width: Math.min(80, screenWidth * 0.2),
    height: Math.min(80, screenWidth * 0.2),
    borderRadius: Math.min(40, screenWidth * 0.1),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  processStepNumber: {
    fontSize: Math.min(28, screenWidth * 0.07),
    fontWeight: '900',
  },
  processTitle: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  processDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  // Specs
  specsGrid: {
    gap: 16,
  },
  specCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  specValue: {
    fontSize: Math.min(32, screenWidth * 0.08),
    fontWeight: '900',
    marginBottom: 8,
  },
  specTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  specDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  // Applications
  applicationsGrid: {
    gap: 16,
  },
  applicationCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  applicationImageContainer: {
    position: 'relative',
    width: '100%',
    height: Math.min(screenWidth * 0.8, 280),
  },
  applicationImage: {
    width: '100%',
    height: '100%',
  },
  applicationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  applicationContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  applicationTitle: {
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  applicationDesc: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Projects
  projectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
    gap: 12,
    flexWrap: 'wrap',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  projectsGrid: {
    gap: 16,
  },
  projectCard: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    height: Math.min(screenWidth * 0.65, 240),
  },
  projectCardBig: {
    height: Math.min(screenWidth * 0.55, 200),
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  projectOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  projectContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  // Testimonials
  testimonialsHeader: {
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 12,
  },
  testimonialsGrid: {
    gap: 20,
  },
  testimonialCard: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  testimonialQuote: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  testimonialDivider: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  testimonialAuthor: {
    fontSize: 16,
    fontWeight: '700',
  },
  testimonialRole: {
    fontSize: 14,
    marginTop: 4,
  },
  testimonialCompany: {
    fontSize: 12,
    marginTop: 4,
  },
  testimonialProject: {
    fontSize: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'flex-start',
  },
  statItem: {
    alignItems: 'flex-start',
    gap: 8,
    minWidth: 120,
  },
  statNumber: {
    fontSize: Math.min(48, screenWidth * 0.12),
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    textAlign: 'left',
  },
  // Contact
  contactBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contactContent: {
    position: 'relative',
    zIndex: 1,
    gap: 24,
  },
  contactIntro: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 600,
    textAlign: 'left',
  },
  contactGrid: {
    gap: 12,
    marginBottom: 8,
  },
  contactItem: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  contactLabel: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '700',
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});

const styles = createStyles(Dimensions.get('window').width);
