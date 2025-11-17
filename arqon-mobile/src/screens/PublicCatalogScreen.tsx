// src/screens/PublicCatalogScreen.tsx - Match web app PublicCatalog
import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load } from '../store';
import type { AppState, Product } from '../types';
import PublicHeader from '../components/PublicHeader';

function uniqueTags(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) (p.tags || []).forEach((t) => set.add(t));
  return Array.from(set).sort();
}

export default function PublicCatalogScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

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
  const visible = useMemo(
    () => products.filter((p) => !!p.public && !!p.slug),
    [products]
  );
  const tags = useMemo(() => uniqueTags(visible), [visible]);
  const filtered = useMemo(
    () =>
      activeTag
        ? visible.filter((p) => (p.tags || []).includes(activeTag))
        : visible,
    [visible, activeTag]
  );

  const catalogTitle = state?.settings?.site?.catalogTitle || "Architectural Concrete Collection";

  if (loading || !state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <PublicHeader navigation={navigation} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: 20, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              PRODUCTS
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {catalogTitle}
            </Text>
            <Text style={[styles.count, { color: colors.textSecondary }]}>
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Tag Filters */}
        {tags.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
            contentContainerStyle={styles.tagsContent}
          >
            <TouchableOpacity
              style={[
                styles.tagButton,
                {
                  backgroundColor: !activeTag ? colors.surface : colors.background,
                  borderColor: colors.border,
                },
                !activeTag && { borderColor: colors.borderLight },
              ]}
              onPress={() => setActiveTag(null)}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: !activeTag ? colors.text : colors.textSecondary },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagButton,
                  {
                    backgroundColor: activeTag === tag ? colors.surface : colors.background,
                    borderColor: colors.border,
                  },
                  activeTag === tag && { borderColor: colors.borderLight },
                ]}
                onPress={() => setActiveTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: activeTag === tag ? colors.text : colors.textSecondary },
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Products Grid */}
        <View style={styles.grid}>
          {filtered.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation.navigate('PublicProductDetail', { slug: product.slug })}
            >
              {product.coverImageUrl ? (
                <Image
                  source={{ uri: product.coverImageUrl }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.productImagePlaceholder, { backgroundColor: colors.surfaceElevated }]}>
                  <Text style={{ color: colors.textSecondary }}>No Image</Text>
                </View>
              )}
              <View style={styles.productCardContent}>
                <Text style={[styles.productTitle, { color: colors.text }]} numberOfLines={2}>
                  {product.title}
                </Text>
                {product.blurb && (
                  <Text style={[styles.productBlurb, { color: colors.textSecondary }]} numberOfLines={2}>
                    {product.blurb}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No products found
            </Text>
          </View>
        )}
      </ScrollView>
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
  header: {
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 8,
  },
  label: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  count: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  tagsContainer: {
    marginVertical: 20,
  },
  tagsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#2A2A2A',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCardContent: {
    padding: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  productBlurb: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

