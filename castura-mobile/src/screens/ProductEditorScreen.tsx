// src/screens/ProductEditorScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { load, save, updateProduct, addProduct } from '../store';
import type { AppState, Product, ProductVariant, Recipe } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import NumberField from '../components/NumberField';

export default function ProductEditorScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const product = route?.params?.product;
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedProduct, setEditedProduct] = useState<Product | null>(
    product || {
      id: Math.random().toString(36).slice(2, 10),
      title: '',
      slug: '',
      public: false,
      variants: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

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

  const handleSave = async () => {
    if (!state || !editedProduct) return;

    let updatedState: AppState;
    const isNewProduct = !product; // If no original product, it's a new one

    if (isNewProduct) {
      // Create new product
      updatedState = addProduct(state, editedProduct);
    } else {
      // Update existing product
      updatedState = updateProduct(state, editedProduct.id, editedProduct);
    }
    
    setState(updatedState);
    await save(updatedState);
    
    Alert.alert('Success', isNewProduct ? 'Product created successfully' : 'Product updated successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleAddVariant = () => {
    if (!state || !editedProduct || state.recipes.length === 0) {
      Alert.alert('No Recipes', 'Please create recipes first');
      return;
    }

    const recipeOptions = state.recipes.map(r => ({
      text: r.name,
      onPress: () => {
        const newVariant: ProductVariant = {
          id: Math.random().toString(36).slice(2, 10),
          name: 'New Variant',
          recipeId: r.id,
          size: { w_mm: 300, h_mm: 300, t_mm: 50 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setEditedProduct({
          ...editedProduct,
          variants: [...editedProduct.variants, newVariant],
        });
      },
    }));

    Alert.alert('Add Variant', 'Select a recipe for this variant:', recipeOptions);
  };

  const handleRemoveVariant = (variantId: string) => {
    if (!editedProduct) return;
    
    Alert.alert(
      'Remove Variant',
      'Are you sure you want to remove this variant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newVariants = editedProduct.variants.filter(v => v.id !== variantId);
            setEditedProduct({ ...editedProduct, variants: newVariants });
          },
        },
      ]
    );
  };

  const updateVariant = (variantId: string, updates: Partial<ProductVariant>) => {
    if (!editedProduct) return;
    
    const newVariants = editedProduct.variants.map(v => 
      v.id === variantId ? { ...v, ...updates } : v
    );
    setEditedProduct({ ...editedProduct, variants: newVariants });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading product editor...
        </Text>
      </View>
    );
  }

  if (!state || !editedProduct) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load data
        </Text>
      </View>
    );
  }

  const recipesById = state.recipes.reduce((acc, r) => ({ ...acc, [r.id]: r }), {} as Record<string, Recipe>);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {product ? 'Edit Product' : 'Create Product'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {editedProduct.title || 'New product'}
        </Text>
      </View>

      {/* Basic Information */}
      <Card style={styles.infoCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Basic Information
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Product Title
          </Text>
          <Input
            value={editedProduct.title}
            onChangeText={(title) => setEditedProduct({ ...editedProduct, title })}
            placeholder="Enter product title"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Slug
          </Text>
          <Input
            value={editedProduct.slug}
            onChangeText={(slug) => setEditedProduct({ ...editedProduct, slug })}
            placeholder="Enter URL slug"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Description
          </Text>
          <Input
            value={editedProduct.blurb || ''}
            onChangeText={(blurb) => setEditedProduct({ ...editedProduct, blurb })}
            placeholder="Enter product description"
            style={styles.input}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setEditedProduct({ ...editedProduct, public: !editedProduct.public })}
          >
            <Ionicons
              name={editedProduct.public ? 'checkbox' : 'square-outline'}
              size={20}
              color={colors.text}
            />
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Public
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Variants */}
      <Card style={styles.variantsCard}>
        <View style={styles.variantsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Variants ({editedProduct.variants.length})
          </Text>
          <Button
            title="Add Variant"
            onPress={handleAddVariant}
            size="small"
            variant="outline"
          />
        </View>

        {editedProduct.variants.length === 0 ? (
          <View style={styles.emptyVariants}>
            <Ionicons name="cube-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No variants added yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Add variants to define different sizes and recipes
            </Text>
          </View>
        ) : (
          <View style={styles.variantsList}>
            {editedProduct.variants.map((variant) => {
              const recipe = recipesById[variant.recipeId];
              
              return (
                <View key={variant.id} style={styles.variantCard}>
                  <View style={styles.variantHeader}>
                    <Text style={[styles.variantName, { color: colors.text }]}>
                      {variant.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveVariant(variant.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.variantInfo}>
                    <View style={styles.variantRow}>
                      <Text style={[styles.variantLabel, { color: colors.textSecondary }]}>
                        Recipe:
                      </Text>
                      <Text style={[styles.variantValue, { color: colors.text }]}>
                        {recipe ? recipe.name : 'Unknown'}
                      </Text>
                    </View>
                    
                    <View style={styles.variantRow}>
                      <Text style={[styles.variantLabel, { color: colors.textSecondary }]}>
                        Size:
                      </Text>
                      <View style={styles.sizeInputs}>
                        <NumberField
                          value={variant.size.w_mm}
                          onChange={(w_mm) => updateVariant(variant.id, { 
                            size: { ...variant.size, w_mm } 
                          })}
                          style={styles.sizeInput}
                          step={10}
                        />
                        <Text style={[styles.sizeSeparator, { color: colors.textSecondary }]}>×</Text>
                        <NumberField
                          value={variant.size.h_mm}
                          onChange={(h_mm) => updateVariant(variant.id, { 
                            size: { ...variant.size, h_mm } 
                          })}
                          style={styles.sizeInput}
                          step={10}
                        />
                        <Text style={[styles.sizeSeparator, { color: colors.textSecondary }]}>×</Text>
                        <NumberField
                          value={variant.size.t_mm}
                          onChange={(t_mm) => updateVariant(variant.id, { 
                            size: { ...variant.size, t_mm } 
                          })}
                          style={styles.sizeInput}
                          step={5}
                        />
                        <Text style={[styles.sizeUnit, { color: colors.textSecondary }]}>mm</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Save Product"
          onPress={handleSave}
          style={styles.saveButton}
        />
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.cancelButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
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
  infoCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    marginBottom: 0,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  variantsCard: {
    margin: 16,
    marginTop: 0,
  },
  variantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyVariants: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
  },
  variantsList: {
    gap: 12,
  },
  variantCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 12,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  variantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 4,
  },
  variantInfo: {
    gap: 8,
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  variantValue: {
    fontSize: 14,
  },
  sizeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sizeInput: {
    width: 60,
    marginBottom: 0,
  },
  sizeSeparator: {
    fontSize: 14,
  },
  sizeUnit: {
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});
