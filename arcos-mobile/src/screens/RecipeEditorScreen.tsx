// src/screens/RecipeEditorScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load, save, updateRecipe, addRecipe } from '../store';
import type { AppState, Recipe, Material } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import AdminHeader from '../components/AdminHeader';
import Input from '../components/Input';
import NumberField from '../components/NumberField';

export default function RecipeEditorScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const recipe = route?.params?.recipe;
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedRecipe, setEditedRecipe] = useState<Recipe | null>(
    recipe || {
      id: Math.random().toString(36).slice(2, 10),
      name: '',
      process: 'precast',
      lines: [],
      densityKgM3: 2400,
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
    if (!state || !editedRecipe) return;

    let updatedState: AppState;
    const isNewRecipe = !recipe; // If no original recipe, it's a new one

    if (isNewRecipe) {
      // Create new recipe
      updatedState = addRecipe(state, editedRecipe);
    } else {
      // Update existing recipe
      updatedState = updateRecipe(state, editedRecipe.id, editedRecipe);
    }
    
    setState(updatedState);
    await save(updatedState);
    
    Alert.alert('Success', isNewRecipe ? 'Recipe created successfully' : 'Recipe updated successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleAddMaterial = () => {
    if (!state) {
      Alert.alert('No Materials', 'Please add materials first');
      return;
    }
    
    const materials = state.materials || [];
    if (materials.length === 0) {
      Alert.alert('No Materials', 'Please add materials first');
      return;
    }

    const materialOptions = materials.map(m => ({
      text: m.name,
      onPress: () => {
        const newLine = {
          materialId: m.id,
          amount: 0,
          notes: '',
        };
        setEditedRecipe({
          ...editedRecipe,
          lines: [...editedRecipe.lines, newLine],
        });
      },
    }));

    Alert.alert('Add Material', 'Select a material to add:', materialOptions);
  };

  const handleRemoveMaterial = (index: number) => {
    Alert.alert(
      'Remove Material',
      'Are you sure you want to remove this material?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newLines = editedRecipe.lines.filter((_, i) => i !== index);
            setEditedRecipe({ ...editedRecipe, lines: newLines });
          },
        },
      ]
    );
  };

  const updateMaterialAmount = (index: number, amount: number) => {
    const newLines = [...editedRecipe.lines];
    newLines[index] = { ...newLines[index], amount };
    setEditedRecipe({ ...editedRecipe, lines: newLines });
  };

  const updateMaterialNotes = (index: number, notes: string) => {
    const newLines = [...editedRecipe.lines];
    newLines[index] = { ...newLines[index], notes };
    setEditedRecipe({ ...editedRecipe, lines: newLines });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading recipe editor...
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

  if (!editedRecipe) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          No recipe data available
        </Text>
      </View>
    );
  }

  const materials = state?.materials || [];
  const materialsById = materials.reduce((acc, m) => ({ ...acc, [m.id]: m }), {} as Record<string, Material>);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title={editedRecipe.name || "Edit Recipe"}
        subtitle="Modify recipe details and materials"
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >

      {/* Basic Information */}
      <Card style={styles.infoCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Basic Information
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Recipe Name
          </Text>
          <Input
            value={editedRecipe.name}
            onChangeText={(name) => setEditedRecipe({ ...editedRecipe, name })}
            placeholder="Enter recipe name"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Process
          </Text>
          <Input
            value={editedRecipe.process}
            onChangeText={(process) => setEditedRecipe({ ...editedRecipe, process })}
            placeholder="Enter process type"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Density (kg/m³)
          </Text>
          <NumberField
            value={editedRecipe.densityKgM3 || 0}
            onChange={(density) => setEditedRecipe({ ...editedRecipe, densityKgM3: density })}
            style={styles.numberInput}
            step={50}
          />
        </View>
      </Card>

      {/* Materials */}
      <Card style={styles.materialsCard}>
        <View style={styles.materialsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Materials ({editedRecipe.lines.length})
          </Text>
          <Button
            title="Add Material"
            onPress={handleAddMaterial}
            size="small"
            variant="outline"
          />
        </View>

        {editedRecipe.lines.length === 0 ? (
          <View style={styles.emptyMaterials}>
            <Ionicons name="layers-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No materials added yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Add materials to build your recipe
            </Text>
          </View>
        ) : (
          <View style={styles.materialsList}>
            {editedRecipe.lines.map((line, index) => {
              const material = materialsById[line.materialId];
              if (!material) return null;

              return (
                <View key={index} style={styles.materialRow}>
                  <View style={styles.materialInfo}>
                    <Text style={[styles.materialName, { color: colors.text }]}>
                      {material.name}
                    </Text>
                    <Text style={[styles.materialUnit, { color: colors.textSecondary }]}>
                      {material.unit}
                    </Text>
                  </View>
                  
                  <View style={styles.materialControls}>
                    <NumberField
                      value={line.amount}
                      onChange={(amount) => updateMaterialAmount(index, amount)}
                      style={styles.amountInput}
                      step={0.1}
                    />
                    <TouchableOpacity
                      onPress={() => handleRemoveMaterial(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
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
          title="Save Recipe"
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
  numberInput: {
    marginBottom: 0,
  },
  materialsCard: {
    margin: 16,
    marginTop: 0,
  },
  materialsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyMaterials: {
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
  materialsList: {
    gap: 12,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  materialControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountInput: {
    width: 80,
    marginBottom: 0,
  },
  removeButton: {
    padding: 8,
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
