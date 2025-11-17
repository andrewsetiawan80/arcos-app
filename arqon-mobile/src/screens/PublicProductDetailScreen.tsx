// src/screens/PublicProductDetailScreen.tsx - Match web app PublicProductDetail
import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load } from '../store';
import type { AppState, Product } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import PublicHeader from '../components/PublicHeader';

export default function PublicProductDetailScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { slug } = route?.params || {};
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleEmail, setSampleEmail] = useState('');
  const [sampleName, setSampleName] = useState('');

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

  // All hooks must be called before any conditional returns
  const products: Product[] = state?.products || [];
  const product = useMemo(() => products.find((p) => p.slug === slug) || null, [products, slug]);
  const site = state?.settings?.site || {};

  if (loading || !state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  if (!product || !product.public) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Product not found</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          This product may be private or not yet published.
        </Text>
        <Button
          title="Back to Catalog"
          onPress={() => navigation.navigate('PublicCatalog')}
          variant="secondary"
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  const { title, coverImageUrl, galleryImages = [], variants = [], tags = [], blurb, pricePerSqmIDR, pricePerTileIDR } = product;
  const gallery = [coverImageUrl, ...galleryImages].filter(Boolean) as string[];

  const handleRequestSample = () => {
    if (!sampleEmail.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    const subject = `Sample Request: ${title}`;
    const body = `Hello,\n\nI would like to request a sample for: ${title}\n\nName: ${sampleName || 'Not provided'}\nEmail: ${sampleEmail}`;
    Linking.openURL(`mailto:${site.contactEmail || 'hello@arqon.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setSampleOpen(false);
    setSampleEmail('');
    setSampleName('');
    Alert.alert('Success', 'Email client opened. Please send your request.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <PublicHeader navigation={navigation} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { paddingTop: 12, paddingBottom: 12 }]}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('PublicCatalog');
            }
          }}
        >
          <Text style={[styles.backText, { color: colors.textSecondary }]}>← Back</Text>
        </TouchableOpacity>

        {/* Hero Image */}
        {gallery[0] && (
          <Image
            source={{ uri: gallery[0] }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>

          {blurb && (
            <Text style={[styles.blurb, { color: colors.textSecondary }]}>
              {blurb}
            </Text>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.tagText, { color: colors.text }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Variants */}
          {variants.length > 0 && (
            <View style={styles.variantsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Variants
              </Text>
              <View style={styles.variantsList}>
                {variants.map((variant) => (
                  <View
                    key={variant.id}
                    style={[styles.variant, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Text style={[styles.variantName, { color: colors.text }]}>
                      {variant.name || variant.color || 'Variant'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Pricing */}
          {(pricePerSqmIDR || pricePerTileIDR) && (
            <View style={styles.pricingSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Pricing
              </Text>
              {pricePerSqmIDR && (
                <Text style={[styles.price, { color: colors.text }]}>
                  From IDR {(pricePerSqmIDR || 0).toLocaleString()} / m²
                </Text>
              )}
              {pricePerTileIDR && (
                <Text style={[styles.price, { color: colors.text }]}>
                  From IDR {(pricePerTileIDR || 0).toLocaleString()} / tile
                </Text>
              )}
            </View>
          )}

          {/* CTA Buttons */}
          <View style={styles.ctaButtons}>
            <Button
              title="Request Sample"
              onPress={() => setSampleOpen(true)}
              variant="primary"
              style={{ flex: 1 }}
            />
            <Button
              title="Get Quote"
              onPress={() => Linking.openURL(`mailto:${site.contactEmail || 'hello@arqon.com'}?subject=Quote Request: ${title}`)}
              variant="secondary"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>

      {/* Sample Request Modal */}
      <Modal
        visible={sampleOpen}
        onClose={() => setSampleOpen(false)}
        title="Request Sample"
      >
        <View style={styles.modalContent}>
          <Input
            placeholder="Your Name"
            value={sampleName}
            onChangeText={setSampleName}
            style={{ marginBottom: 12 }}
          />
          <Input
            placeholder="Email Address"
            value={sampleEmail}
            onChangeText={setSampleEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginBottom: 20 }}
          />
          <Button
            title="Send Request"
            onPress={handleRequestSample}
            variant="primary"
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 20,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#2A2A2A',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  blurb: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  variantsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  variantsList: {
    gap: 8,
  },
  variant: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  variantName: {
    fontSize: 14,
    fontWeight: '600',
  },
  pricingSection: {
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalContent: {
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

