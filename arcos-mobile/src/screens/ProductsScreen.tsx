// src/screens/ProductsScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load, save, addProduct, updateProduct, deleteProduct } from '../store';
import type { AppState, Product } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import AdminHeader from '../components/AdminHeader';
import ArcosLogo from '../components/ArcosLogo';

export default function ProductsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleAddProduct = () => {
    // Navigate to Product Editor for creating a new product
    navigation.navigate('ProductEditor', { 
      product: null // null indicates creating a new product
    });
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (state) {
              const updatedState = deleteProduct(state, product.id);
              setState(updatedState);
              await save(updatedState);
            }
          },
        },
      ]
    );
  };

  const handleTogglePublic = async (product: Product) => {
    if (state) {
      const updatedState = updateProduct(state, product.id, { public: !product.public });
      setState(updatedState);
      await save(updatedState);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Card style={styles.productCard} onPress={() => handleProductPress(item)}>
      <View style={styles.productHeader}>
        <View style={styles.productIconContainer}>
          <Ionicons name="cube-outline" size={20} color="#00c851" />
        </View>
        <View style={styles.productInfo}>
          <Text style={[styles.productTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.productSlug, { color: colors.textSecondary }]}>
            /{item.slug}
          </Text>
        </View>
        <View style={styles.productActions}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleTogglePublic(item);
            }}
            style={[styles.actionButton, { backgroundColor: item.public ? '#00c85120' : '#ffbb3320' }]}
          >
            <Ionicons
              name={item.public ? 'eye' : 'eye-off'}
              size={16}
              color={item.public ? '#00c851' : '#ffbb33'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteProduct(item);
            }}
            style={[styles.actionButton, { backgroundColor: '#ff444420' }]}
          >
            <Ionicons
              name="trash-outline"
              size={16}
              color="#ff4444"
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.blurb && (
        <Text style={[styles.productBlurb, { color: colors.textSecondary }]}>
          {item.blurb}
        </Text>
      )}
      
      <View style={styles.productFooter}>
        <View style={styles.productStats}>
          <View style={styles.statItem}>
            <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.variantCount, { color: colors.textSecondary }]}>
              {item.variants.length} variant{item.variants.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.public ? '#00c851' : '#ffbb33' }]}>
            <Text style={styles.statusText}>
              {item.public ? 'Public' : 'Private'}
            </Text>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.updatedAt, { color: colors.textSecondary }]}>
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading products...
        </Text>
      </View>
    );
  }

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load products
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Products"
        subtitle="Manage your product catalog"
        navigation={navigation}
        rightAction={{
          icon: 'add',
          onPress: handleAddProduct,
        }}
      />

      {!state || (state.products || []).length === 0 ? (
        <View style={[styles.emptyState, { paddingBottom: 80 + insets.bottom }]}>
          <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Products Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Create your first product to get started
          </Text>
          <TouchableOpacity
            onPress={handleAddProduct}
            style={[styles.createProductButton, { backgroundColor: '#ffffff', borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color="#000000" />
            <Text style={[styles.createProductButtonText, { color: '#000000' }]}>
              Create Product
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={state.products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 80 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    marginBottom: 16,
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 200, 81, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productSlug: {
    fontSize: 12,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  productBlurb: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  variantCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  updatedAt: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  createProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minWidth: 200,
  },
  createProductButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
