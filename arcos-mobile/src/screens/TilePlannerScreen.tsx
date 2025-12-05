// src/screens/TilePlannerScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load } from '../store';
import type { AppState, Product, ProductVariant, Recipe } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import AdminHeader from '../components/AdminHeader';
import NumberField from '../components/NumberField';
import ProductPicker from '../components/ProductPicker';

export default function TilePlannerScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [area, setArea] = useState(100); // m²
  const [wastage, setWastage] = useState(10); // percentage

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

  const calculateTileRequirements = () => {
    if (!selectedVariant) return null;

    const tileArea = (selectedVariant.size.w_mm * selectedVariant.size.h_mm) / 1_000_000; // m² per tile
    const tilesNeeded = Math.ceil((area * (1 + wastage / 100)) / tileArea);
    const totalVolume = (tilesNeeded * selectedVariant.size.w_mm * selectedVariant.size.h_mm * selectedVariant.size.t_mm) / 1_000_000_000; // m³
    const totalWeight = totalVolume * (selectedRecipe?.densityKgM3 || 2400); // kg

    return {
      tileArea,
      tilesNeeded,
      totalVolume,
      totalWeight,
      area,
      wastage,
    };
  };

  const tileData = calculateTileRequirements();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading tile planner...
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
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Tile Planner"
        subtitle="Plan tile layouts and calculate quantities"
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        {/* Product Selection */}
      <Card style={{ ...styles.selectionCard, marginTop: 16 }}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="cube-outline" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tile Selection
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

      {/* Area Parameters */}
      <Card style={styles.parametersCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Area Parameters
        </Text>
        
        <View style={styles.selectionRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Area (m²):
          </Text>
          <NumberField
            value={area}
            onChange={setArea}
            style={styles.numberField}
            step={1}
          />
        </View>

        <View style={styles.selectionRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Wastage (%):
          </Text>
          <NumberField
            value={wastage}
            onChange={setWastage}
            style={styles.numberField}
            step={1}
          />
        </View>
      </Card>

      {/* Tile Information */}
      {selectedVariant && (
        <Card style={styles.tileInfoCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tile Information
          </Text>
          <View style={styles.tileInfoGrid}>
            <View style={styles.tileInfoItem}>
              <Text style={[styles.tileInfoLabel, { color: colors.textSecondary }]}>
                Dimensions
              </Text>
              <Text style={[styles.tileInfoValue, { color: colors.text }]}>
                {selectedVariant.size.w_mm} × {selectedVariant.size.h_mm} × {selectedVariant.size.t_mm} mm
              </Text>
            </View>
            <View style={styles.tileInfoItem}>
              <Text style={[styles.tileInfoLabel, { color: colors.textSecondary }]}>
                Area per tile
              </Text>
              <Text style={[styles.tileInfoValue, { color: colors.text }]}>
                {((tileData?.tileArea) || 0).toFixed(4)} m²
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Calculation Results */}
      {tileData && (
        <Card style={styles.resultsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Calculation Results
          </Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Tiles Needed
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {tileData.tilesNeeded}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Volume
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {(tileData.totalVolume || 0).toFixed(3)} m³
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Weight
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {(tileData.totalWeight || 0).toFixed(0)} kg
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Coverage Area
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {tileData.area} m²
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
          title="Generate Production Plan"
          onPress={() => {
            Alert.alert('Production Plan', 'Production plan generation will be implemented');
          }}
          style={styles.actionButton}
        />
        <Button
          title="Save Plan"
          onPress={() => {
            Alert.alert('Save', 'Save functionality will be implemented');
          }}
          variant="outline"
          style={styles.actionButton}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
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
  tileInfoCard: {
    margin: 16,
    marginTop: 0,
  },
  tileInfoGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  tileInfoItem: {
    flex: 1,
  },
  tileInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  tileInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
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
