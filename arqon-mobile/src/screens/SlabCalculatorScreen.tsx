// src/screens/SlabCalculatorScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load } from '../store';
import type { AppState, Recipe } from '../types';
import Card from '../components/Card';
import NumberField from '../components/NumberField';
import AdminHeader from '../components/AdminHeader';

export default function SlabCalculatorScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [length, setLength] = useState(10); // meters
  const [width, setWidth] = useState(5); // meters
  const [thickness, setThickness] = useState(0.15); // meters
  const [selectedRecipeId, setSelectedRecipeId] = useState('');

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

  const selectedRecipe = state?.recipes.find(r => r.id === selectedRecipeId);

  const calculateSlabVolume = () => {
    const volume = length * width * thickness; // m³
    const weight = volume * (selectedRecipe?.densityKgM3 || 2400); // kg
    const area = length * width; // m²

    return {
      volume,
      weight,
      area,
      length,
      width,
      thickness,
    };
  };

  const slabData = calculateSlabVolume();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading slab calculator...
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
        title="Slab Calculator"
        subtitle="Calculate concrete volume for slabs"
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        {/* Dimensions */}
      <Card style={{ ...styles.dimensionsCard, marginTop: 16 }}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="resize-outline" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Dimensions
          </Text>
        </View>
        
        <View style={styles.dimensionRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Length (m):
          </Text>
          <NumberField
            value={length}
            onChange={setLength}
            style={styles.numberField}
            step={0.1}
          />
        </View>

        <View style={styles.dimensionRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Width (m):
          </Text>
          <NumberField
            value={width}
            onChange={setWidth}
            style={styles.numberField}
            step={0.1}
          />
        </View>

        <View style={styles.dimensionRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Thickness (m):
          </Text>
          <NumberField
            value={thickness}
            onChange={setThickness}
            style={styles.numberField}
            step={0.01}
          />
        </View>
      </Card>

      {/* Recipe Selection */}
      <Card style={styles.recipeCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recipe Selection
        </Text>
        
        <View style={styles.recipeInfo}>
          <Text style={[styles.recipeLabel, { color: colors.textSecondary }]}>
            Recipe:
          </Text>
          <Text style={[styles.recipeName, { color: colors.text }]}>
            {selectedRecipe ? selectedRecipe.name : 'No recipe selected'}
          </Text>
          {selectedRecipe && (
            <>
              <Text style={[styles.recipeProcess, { color: colors.textSecondary }]}>
                Process: {selectedRecipe.process}
              </Text>
              {selectedRecipe.densityKgM3 && (
                <Text style={[styles.recipeDensity, { color: colors.textSecondary }]}>
                  Density: {selectedRecipe.densityKgM3} kg/m³
                </Text>
              )}
            </>
          )}
        </View>
      </Card>

      {/* Volume Result */}
      <Card style={styles.resultsCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Volume Result
        </Text>
        
        <View style={styles.resultsGrid}>
          <View style={styles.resultItem}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              Volume
            </Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>
              {(slabData.volume || 0).toFixed(3)} m³
            </Text>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              Weight
            </Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>
              {(slabData.weight || 0).toFixed(0)} kg
            </Text>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              Area
            </Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>
              {(slabData.area || 0).toFixed(2)} m²
            </Text>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              Dimensions
            </Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>
              {slabData.length} × {slabData.width} × {slabData.thickness} m
            </Text>
          </View>
        </View>
      </Card>

      {/* Material Requirements */}
      {selectedRecipe && (
        <Card style={styles.materialsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Material Requirements
          </Text>
          <View style={styles.materialsList}>
            {selectedRecipe.lines.map((line, index) => {
              const materials = state?.materials || [];
              const material = materials.find(m => m.id === line.materialId);
              if (!material) return null;

              const amountKg = material.unit === 'kg' ? line.amount : 
                material.densityKgM3 ? (line.amount * material.densityKgM3 / 1000) : 0;
              
              const totalAmount = amountKg * (slabData.volume / 1000); // Scale to slab volume

              return (
                <View key={index} style={styles.materialRow}>
                  <View style={styles.materialInfo}>
                    <Text style={[styles.materialName, { color: colors.text }]}>
                      {material.name}
                    </Text>
                    <Text style={[styles.materialUnit, { color: colors.textSecondary }]}>
                      {line.amount} {material.unit} per m³
                    </Text>
                  </View>
                  <Text style={[styles.materialAmount, { color: colors.text }]}>
                    {(totalAmount || 0).toFixed(2)} {material.unit}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
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
  dimensionsCard: {
    margin: 16,
    marginTop: 0,
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
  dimensionRow: {
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
  numberField: {
    flex: 1,
    marginLeft: 16,
  },
  recipeCard: {
    margin: 16,
    marginTop: 0,
  },
  recipeInfo: {
    gap: 8,
  },
  recipeLabel: {
    fontSize: 14,
    fontWeight: '500',
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
  resultsCard: {
    margin: 16,
    marginTop: 0,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  resultItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 12,
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  materialsCard: {
    margin: 16,
    marginTop: 0,
  },
  materialsList: {
    gap: 12,
  },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  materialUnit: {
    fontSize: 14,
  },
  materialAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
