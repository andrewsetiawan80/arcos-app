// src/screens/ProductDetailScreen.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import type { Product } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import AdminHeader from '../components/AdminHeader';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { product }: { product: Product } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title={product.title}
        subtitle={product.public ? 'Public product' : 'Private product'}
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        <Card style={styles.infoCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Product Information
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Slug:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            /{product.slug}
          </Text>
        </View>
        {product.categorySlug && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Category:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {product.categorySlug}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Variants:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {product.variants.length}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Created:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {new Date(product.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Updated:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {new Date(product.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </Card>

      {product.blurb && (
        <Card style={styles.descriptionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {product.blurb}
          </Text>
        </Card>
      )}

      {product.variants.length > 0 && (
        <Card style={styles.variantsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Variants ({product.variants.length})
          </Text>
          {product.variants.map((variant, index) => (
            <View key={index} style={styles.variantItem}>
              <Text style={[styles.variantName, { color: colors.text }]}>
                {variant.name}
              </Text>
              <Text style={[styles.variantSize, { color: colors.textSecondary }]}>
                {variant.size.w_mm} × {variant.size.h_mm} × {variant.size.t_mm} mm
              </Text>
            </View>
          ))}
        </Card>
      )}

      {product.tags && product.tags.length > 0 && (
        <Card style={styles.tagsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tags
          </Text>
          <View style={styles.tagsContainer}>
            {product.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.text }]}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Edit Product"
          onPress={() => {
            navigation.navigate('ProductEditor', { product });
          }}
          style={styles.editButton}
        />
      </View>
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
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  descriptionCard: {
    margin: 16,
    marginTop: 0,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  variantsCard: {
    margin: 16,
    marginTop: 0,
  },
  variantItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  variantName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  variantSize: {
    fontSize: 14,
  },
  tagsCard: {
    margin: 16,
    marginTop: 0,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#0a0a0a',
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 16,
  },
  editButton: {
    marginBottom: 0,
  },
});
