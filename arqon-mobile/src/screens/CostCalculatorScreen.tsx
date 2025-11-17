// src/screens/CostCalculatorScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load, save } from '../store';
import type { AppState, Recipe, Material } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import AdminHeader from '../components/AdminHeader';
import NumberField from '../components/NumberField';
import ProductPicker from '../components/ProductPicker';

export default function CostCalculatorScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [batchKg, setBatchKg] = useState(1000);
  const [fx, setFx] = useState<any>(null);
  const [fxErr, setFxErr] = useState<string | null>(null);
  const [manualUSD, setManualUSD] = useState(15000);
  const [manualEUR, setManualEUR] = useState(16000);

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

  const recipe = selectedRecipe;
  const materialsById = state?.materials.reduce((acc, m) => ({ ...acc, [m.id]: m }), {} as Record<string, Material>) || {};

  const costRows = recipe ? recipe.lines.map(line => {
    const material = materialsById[line.materialId];
    if (!material) return null;
    
    const amountKg = material.unit === 'kg' ? line.amount : 
      material.densityKgM3 ? (line.amount * material.densityKgM3 / 1000) : 0;
    
    const costIDR = amountKg * material.costPerUnitIDR * (batchKg / 1000);
    
    return {
      materialId: line.materialId,
      materialName: material.name,
      amount: line.amount,
      unit: material.unit,
      amountKg,
      costIDR,
      notes: line.notes,
    };
  }).filter(Boolean) : [];

  const totalCostIDR = costRows.reduce((sum, row) => sum + (row?.costIDR || 0), 0);
  const costPerKg = batchKg > 0 ? totalCostIDR / batchKg : 0;

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `IDR ${Math.round(amount).toLocaleString('id-ID')}`;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading cost calculator...
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
        title="Cost Calculator"
        subtitle="Calculate material costs for recipes"
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        {/* Recipe Selection */}
      <Card style={styles.selectionCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="list-outline" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recipe Selection
          </Text>
        </View>
        <View style={styles.selectionRow}>
          <View style={styles.labelContainer}>
            <Ionicons name="flask-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Recipe:
            </Text>
          </View>
          <View style={styles.selectContainer}>
            <TouchableOpacity
              style={[styles.selectButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => {
                // Show recipe picker modal
                setShowRecipePicker(true);
              }}
            >
              <Text style={[styles.selectText, { color: colors.text }]}>
                {recipe ? recipe.name : 'Select Recipe'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.selectionRow}>
          <View style={styles.labelContainer}>
            <Ionicons name="scale-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Batch Size (kg):
            </Text>
          </View>
          <NumberField
            value={batchKg}
            onChange={setBatchKg}
            style={styles.numberField}
            step={100}
          />
        </View>
      </Card>

      {/* FX Information */}
      <Card style={styles.fxCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconContainer, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="trending-up-outline" size={20} color={colors.success} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Exchange Rates
          </Text>
        </View>
        <View style={styles.fxInfo}>
          <View style={styles.fxStatusRow}>
            <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.fxText, { color: colors.textSecondary }]}>
              {fx
                ? `FX: ${fx.source} — ${new Date(fx.fetchedAt).toLocaleString()} (USD→IDR ${(fx.idrPer?.USD || 0).toLocaleString('id-ID')}, EUR→IDR ${(fx.idrPer?.EUR || 0).toLocaleString('id-ID')})`
                : 'FX: not loaded'}
            </Text>
          </View>
          {fxErr && (
            <View style={styles.fxErrorRow}>
              <Ionicons name="warning-outline" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                Error: {fxErr}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Manual FX Override */}
      <Card style={styles.manualFxCard}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconContainer, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="settings-outline" size={20} color={colors.warning} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Manual FX (fallback)
          </Text>
        </View>
        <View style={styles.manualFxGrid}>
          <View style={styles.manualFxItem}>
            <View style={styles.manualFxLabelContainer}>
              <Ionicons name="logo-usd" size={16} color={colors.textSecondary} />
              <Text style={[styles.manualFxLabel, { color: colors.textSecondary }]}>
                USD → IDR
              </Text>
            </View>
            <NumberField
              value={manualUSD}
              onChange={setManualUSD}
              step={50}
              style={styles.manualFxInput}
            />
          </View>
          <View style={styles.manualFxItem}>
            <View style={styles.manualFxLabelContainer}>
              <Ionicons name="logo-euro" size={16} color={colors.textSecondary} />
              <Text style={[styles.manualFxLabel, { color: colors.textSecondary }]}>
                EUR → IDR
              </Text>
            </View>
            <NumberField
              value={manualEUR}
              onChange={setManualEUR}
              step={50}
              style={styles.manualFxInput}
            />
          </View>
        </View>
        <Button
          title="Use Manual FX"
          onPress={() => {
            // Set manual FX
            console.log('Set manual FX');
          }}
          style={styles.manualFxButton}
        />
      </Card>

      {/* Cost Results */}
      {recipe && costRows.length > 0 && (
        <Card style={styles.resultsCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="analytics-outline" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Cost Breakdown
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Total Cost:
              </Text>
            </View>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(totalCostIDR)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <Ionicons name="scale-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Cost per kg:
              </Text>
            </View>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(costPerKg)}
            </Text>
          </View>
          
          <View style={styles.materialsList}>
            {costRows.map((row, index) => (
              <View key={index} style={styles.materialRow}>
                <View style={styles.materialInfo}>
                  <View style={styles.materialNameContainer}>
                    <Ionicons name="cube-outline" size={16} color={colors.primary} />
                    <Text style={[styles.materialName, { color: colors.text }]}>
                      {row?.materialName}
                    </Text>
                  </View>
                  <Text style={[styles.materialAmount, { color: colors.textSecondary }]}>
                    {row?.amount} {row?.unit} ({(row?.amountKg || 0).toFixed(2)} kg)
                  </Text>
                </View>
                <Text style={[styles.materialCost, { color: colors.text }]}>
                  {formatCurrency(row?.costIDR || 0)}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Recipe Picker Modal */}
      <Modal
        visible={showRecipePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRecipePicker(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Recipe
            </Text>
            <TouchableOpacity
              onPress={() => setShowRecipePicker(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={state?.recipes || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.recipeItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedRecipe(item);
                  setShowRecipePicker(false);
                }}
              >
                <View style={styles.recipeInfo}>
                  <Text style={[styles.recipeName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.recipeProcess, { color: colors.textSecondary }]}>
                    Process: {item.process}
                  </Text>
                  <Text style={[styles.recipeMaterials, { color: colors.textSecondary }]}>
                    {item.lines.length} materials
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            style={styles.recipeList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="flask-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No recipes available
                </Text>
              </View>
            }
          />

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.border }]}
              onPress={() => {
                setSelectedRecipe(null);
                setShowRecipePicker(false);
              }}
            >
              <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>
                Clear Selection
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flex: 1,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
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
  fxCard: {
    margin: 16,
    marginTop: 0,
  },
  fxInfo: {
    gap: 8,
  },
  fxStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fxErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fxText: {
    fontSize: 14,
    flex: 1,
  },
  manualFxCard: {
    margin: 16,
    marginTop: 0,
  },
  manualFxGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  manualFxItem: {
    flex: 1,
  },
  manualFxLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  manualFxLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  manualFxInput: {
    marginBottom: 0,
  },
  manualFxButton: {
    alignSelf: 'flex-start',
  },
  resultsCard: {
    margin: 16,
    marginTop: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  materialsList: {
    marginTop: 16,
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
  materialNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '500',
  },
  materialAmount: {
    fontSize: 14,
  },
  materialCost: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Recipe Picker Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  recipeList: {
    flex: 1,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeProcess: {
    fontSize: 14,
    marginBottom: 2,
  },
  recipeMaterials: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
