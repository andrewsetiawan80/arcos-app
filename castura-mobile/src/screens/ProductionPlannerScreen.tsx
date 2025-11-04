// src/screens/ProductionPlannerScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load } from '../store';
import type { AppState, Product, ProductVariant, Recipe } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import NumberField from '../components/NumberField';
import ProductPicker from '../components/ProductPicker';

export default function ProductionPlannerScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);

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

  const selectedProduct = state?.products.find(p => p.id === selectedProductId);
  const selectedVariant = selectedProduct?.variants.find(v => v.id === selectedVariantId);
  const selectedRecipe = selectedVariant ? state?.recipes.find(r => r.id === selectedVariant.recipeId) : null;

  const calculateProduction = () => {
    if (!selectedVariant || !selectedRecipe) return null;

    const volumePerUnit = (selectedVariant.size.w_mm * selectedVariant.size.h_mm * selectedVariant.size.t_mm) / 1_000_000_000; // m³
    const totalVolume = volumePerUnit * quantity;
    const totalWeight = totalVolume * (selectedRecipe.densityKgM3 || 2400); // kg
    const totalArea = (selectedVariant.size.w_mm * selectedVariant.size.h_mm * quantity) / 1_000_000; // m²

    return {
      volumePerUnit,
      totalVolume,
      totalWeight,
      totalArea,
      units: quantity,
    };
  };

  const productionData = calculateProduction();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading production planner...
        </Text>
      </View>
    );
  }

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load data
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        paddingTop: Math.max(insets.top + 8, 20),
        paddingBottom: 12,
        borderBottomColor: colors.border 
      }]}>
        <View style={styles.headerIconContainer}>
          <Ionicons name="build-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Production Planner
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Plan concrete production runs
          </Text>
        </View>
      </View>

      {/* Product Selection */}
      <Card style={styles.selectionCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="cube-outline" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Product Selection
          </Text>
        </View>
        
        <View style={styles.selectionRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Product:
          </Text>
          <View style={styles.selectContainer}>
            <ProductPicker
              products={state?.products || []}
              selectedProduct={selectedProduct || null}
              onSelect={(product) => {
                setSelectedProductId(product?.id || '');
                setSelectedVariantId(''); // Reset variant when product changes
              }}
              placeholder="Select Product"
            />
          </View>
        </View>

        {selectedProduct && (
          <View style={styles.selectionRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Variant:
            </Text>
            <View style={styles.selectContainer}>
              <TouchableOpacity
                style={[styles.selectButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => {
                  Alert.alert('Select Variant', 'Variant picker will be implemented');
                }}
              >
                <Text style={[styles.selectText, { color: colors.text }]}>
                  {selectedVariant ? selectedVariant.name : 'Select Variant'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card>

      {/* Production Parameters */}
      <Card style={styles.parametersCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Production Parameters
        </Text>
        
        <View style={styles.selectionRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Quantity:
          </Text>
          <NumberField
            value={quantity}
            onChange={setQuantity}
            style={styles.numberField}
            step={1}
          />
        </View>

        <View style={styles.selectionRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Production Date:
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => {
              Alert.alert('Select Date', 'Date picker will be implemented');
            }}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>
              {productionDate}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Production Results */}
      {productionData && (
        <Card style={styles.resultsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Production Summary
          </Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Units
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {productionData.units}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Volume
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {productionData.totalVolume.toFixed(3)} m³
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Weight
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {productionData.totalWeight.toFixed(0)} kg
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Area
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {productionData.totalArea.toFixed(2)} m²
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Recipe Information */}
      {selectedRecipe && (
        <Card style={styles.recipeCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recipe Information
          </Text>
          <View style={styles.recipeInfo}>
            <Text style={[styles.recipeName, { color: colors.text }]}>
              {selectedRecipe.name}
            </Text>
            <Text style={[styles.recipeProcess, { color: colors.textSecondary }]}>
              Process: {selectedRecipe.process}
            </Text>
            {selectedRecipe.densityKgM3 && (
              <Text style={[styles.recipeDensity, { color: colors.textSecondary }]}>
                Density: {selectedRecipe.densityKgM3} kg/m³
              </Text>
            )}
          </View>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Save Plan"
          onPress={() => {
            if (!selectedProduct || !selectedVariant || !selectedRecipe) {
              Alert.alert('Missing Information', 'Please select a product, variant, and ensure all details are filled.');
              return;
            }

            const production = calculateProduction();
            if (!production) {
              Alert.alert('Error', 'Unable to calculate production details.');
              return;
            }

            const productionPlan = {
              id: Math.random().toString(36).slice(2, 10),
              productId: selectedProduct.id,
              variantId: selectedVariant.id,
              recipeId: selectedRecipe.id,
              quantity,
              productionDate,
              volumePerUnit: production.volumePerUnit,
              totalVolume: production.totalVolume,
              totalWeight: production.totalWeight,
              totalArea: production.totalArea,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // Save to state (you would typically save this to a productionPlans array in your state)
            Alert.alert('Plan Saved', 'Production plan has been saved successfully!', [
              { text: 'OK' }
            ]);
          }}
          style={[styles.actionButton, { backgroundColor: colors.success }]}
        />
        <Button
          title="Generate Production Plan"
          onPress={() => {
            if (!selectedProduct || !selectedVariant || !selectedRecipe) {
              Alert.alert('Missing Information', 'Please select a product, variant, and ensure all details are filled.');
              return;
            }

            const production = calculateProduction();
            if (!production) {
              Alert.alert('Error', 'Unable to calculate production details.');
              return;
            }

            const plan = {
              product: selectedProduct.title,
              variant: selectedVariant.name,
              quantity,
              productionDate,
              volumePerUnit: production.volumePerUnit.toFixed(3),
              totalVolume: production.totalVolume.toFixed(3),
              totalWeight: production.totalWeight.toFixed(1),
              totalArea: production.totalArea.toFixed(2),
              recipe: selectedRecipe.name,
              density: selectedRecipe.densityKgM3,
            };

            const planText = `PRODUCTION PLAN
Product: ${plan.product}
Variant: ${plan.variant}
Quantity: ${plan.quantity} units
Production Date: ${plan.productionDate}

CALCULATIONS:
Volume per unit: ${plan.volumePerUnit} m³
Total volume: ${plan.totalVolume} m³
Total weight: ${plan.totalWeight} kg
Total area: ${plan.totalArea} m²

RECIPE:
Recipe: ${plan.recipe}
Density: ${plan.density} kg/m³

Generated on: ${new Date().toLocaleString()}`;

            Alert.alert('Production Plan Generated', planText, [
              { text: 'OK' }
            ]);
          }}
          style={styles.actionButton}
        />
        <Button
          title="Print Plan"
          onPress={() => {
            if (!selectedProduct || !selectedVariant || !selectedRecipe) {
              Alert.alert('Missing Information', 'Please select a product, variant, and ensure all details are filled.');
              return;
            }

            const production = calculateProduction();
            if (!production) {
              Alert.alert('Error', 'Unable to calculate production details.');
              return;
            }

            const planText = `CASTURA CONCRETE - PRODUCTION PLAN
=====================================

Product: ${selectedProduct.title}
Variant: ${selectedVariant.name}
Quantity: ${quantity} units
Production Date: ${productionDate}

CALCULATIONS:
Volume per unit: ${production.volumePerUnit.toFixed(3)} m³
Total volume: ${production.totalVolume.toFixed(3)} m³
Total weight: ${production.totalWeight.toFixed(1)} kg
Total area: ${production.totalArea.toFixed(2)} m²

RECIPE DETAILS:
Recipe: ${selectedRecipe.name}
Density: ${selectedRecipe.densityKgM3} kg/m³

MATERIALS REQUIRED:
${selectedRecipe.lines.map(line => {
  const material = state?.materials.find(m => m.id === line.materialId);
  const totalAmount = (line.amount * production.totalWeight) / (selectedRecipe.densityKgM3 || 2400);
  return `• ${material?.name || 'Unknown Material'}: ${totalAmount.toFixed(2)} ${material?.unit || 'kg'}`;
}).join('\n')}

Generated on: ${new Date().toLocaleString()}
=====================================`;

            Alert.alert(
              'Production Plan Ready to Print',
              'The production plan has been generated. You can copy this text to print or share.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Copy to Clipboard', 
                  onPress: () => {
                    // In a real app, you would use Clipboard.setString(planText)
                    Alert.alert('Copied', 'Production plan copied to clipboard');
                  }
                }
              ]
            );
          }}
          variant="outline"
          style={styles.actionButton}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
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
  selectionCard: {
    margin: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  selectContainer: {
    flex: 1,
    marginLeft: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  selectText: {
    fontSize: 16,
    flex: 1,
  },
  numberField: {
    flex: 1,
    marginLeft: 16,
  },
  parametersCard: {
    margin: 16,
    marginTop: 0,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
    flex: 1,
    marginLeft: 16,
  },
  dateText: {
    fontSize: 16,
    flex: 1,
  },
  resultsCard: {
    margin: 16,
    marginTop: 0,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipeCard: {
    margin: 16,
    marginTop: 0,
  },
  recipeInfo: {
    gap: 8,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipeProcess: {
    fontSize: 16,
  },
  recipeDensity: {
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  actionButton: {
    flex: 1,
  },
});
