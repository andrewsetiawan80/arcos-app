// src/screens/DeriveRecipeScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load, save, addRecipe } from '../store';
import type { AppState, Recipe, RecipeLine, Material } from '../types';
import { getProcesses } from '../lib/process';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import NumberField from '../components/NumberField';

const newid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export default function DeriveRecipeScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const baseRecipeId = route?.params?.baseRecipeId;
  
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [baseRecipe, setBaseRecipe] = useState<Recipe | null>(null);
  
  // Form state
  const [name, setName] = useState('Derived Recipe');
  const [version, setVersion] = useState('v0.1');
  const [density, setDensity] = useState<number | ''>('');
  const [tags, setTags] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('');
  const [lines, setLines] = useState<RecipeLine[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const appState = await load();
        setState(appState);
        
        if (baseRecipeId) {
          const base = appState.recipes.find(r => r.id === baseRecipeId);
          if (base) {
            setBaseRecipe(base);
            setName(`${base.name} — derived (${new Date().toLocaleDateString()})`);
            setDensity(base.densityKgM3 ?? '');
            setSelectedProcess(base.process);
            setLines(base.lines.map(l => ({ ...l, id: newid() })));
          }
        }
      } catch (error) {
        console.error('Failed to load app state:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [baseRecipeId]);

  const handleAddLine = () => {
    if (!state || state.materials.length === 0) {
      Alert.alert('No Materials', 'Please create materials first');
      return;
    }
    
    const materialOptions = state.materials.map(material => ({
      text: material.name,
      onPress: () => {
        setLines([{ id: newid(), materialId: material.id, amount: 0.01, notes: '' }, ...lines]);
      },
    }));
    
    Alert.alert('Select Material', 'Choose a material to add:', materialOptions);
  };

  const handleUpdateLine = (lineId: string, updates: Partial<RecipeLine>) => {
    setLines(lines.map(l => (l.id === lineId ? { ...l, ...updates } : l)));
  };

  const handleRemoveLine = (lineId: string) => {
    setLines(lines.filter(l => l.id !== lineId));
  };

  const handleSave = async () => {
    if (!state || !name.trim()) {
      Alert.alert('Error', 'Please enter a recipe name');
      return;
    }

    const newRecipe: Recipe = {
      id: newid(),
      name: name.trim(),
      process: selectedProcess,
      version,
      densityKgM3: density === '' ? undefined : Number(density),
      lines,
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
      createdAt: now(),
      updatedAt: now(),
    };

    const updatedState = addRecipe(state, newRecipe);
    setState(updatedState);
    await save(updatedState);
    
    Alert.alert('Success', 'Recipe created successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const renderLine = ({ item }: { item: RecipeLine }) => {
    const material = state?.materials.find(m => m.id === item.materialId);
    
    return (
      <Card key={item.id} style={styles.lineCard}>
        <View style={styles.lineHeader}>
          <Text style={[styles.materialName, { color: colors.text }]}>
            {material?.name || 'Unknown Material'}
          </Text>
          <TouchableOpacity
            onPress={() => handleRemoveLine(item.id)}
            style={[styles.removeButton, { backgroundColor: colors.error + '20' }]}
          >
            <Ionicons name="close" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.lineInputs}>
          <View style={styles.amountInput}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Amount
            </Text>
            <NumberField
              value={item.amount.toString()}
              onChangeText={(text) => {
                const amount = parseFloat(text) || 0;
                handleUpdateLine(item.id, { amount });
              }}
              placeholder="0.00"
              style={styles.numberInput}
            />
          </View>
          
          <View style={styles.notesInput}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Notes
            </Text>
            <Input
              value={item.notes || ''}
              onChangeText={(text) => handleUpdateLine(item.id, { notes: text })}
              placeholder="Optional notes"
              style={styles.textInput}
            />
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading recipe derivation...
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
          <Ionicons name="flask-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Derive Recipe
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {baseRecipe ? `Based on: ${baseRecipe.name}` : 'Create a new recipe from scratch'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {!baseRecipe ? (
          <Card style={styles.selectionCard}>
            <View style={styles.selectionHeader}>
              <Ionicons name="flask-outline" size={24} color={colors.primary} />
              <Text style={[styles.selectionTitle, { color: colors.text }]}>
                Select Base Recipe
              </Text>
            </View>
            <Text style={[styles.selectionSubtitle, { color: colors.textSecondary }]}>
              Choose an existing recipe to use as the foundation for your new recipe.
            </Text>
            
            {state.recipes.length === 0 ? (
              <View style={styles.emptyRecipes}>
                <Ionicons name="flask-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No recipes available
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Create some recipes first to use as base recipes.
                </Text>
              </View>
            ) : (
              <View style={styles.recipeList}>
                {state.recipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={[styles.recipeItem, { borderColor: colors.border }]}
                    onPress={() => {
                      setBaseRecipe(recipe);
                      setName(`${recipe.name} — derived (${new Date().toLocaleDateString()})`);
                      setDensity(recipe.densityKgM3 ?? '');
                      setSelectedProcess(recipe.process);
                      setLines(recipe.lines.map(l => ({ ...l, id: newid() })));
                    }}
                  >
                    <View style={styles.recipeInfo}>
                      <Text style={[styles.recipeName, { color: colors.text }]}>
                        {recipe.name}
                      </Text>
                      <Text style={[styles.recipeDetails, { color: colors.textSecondary }]}>
                        {recipe.process} • {recipe.lines.length} materials
                        {recipe.densityKgM3 && ` • ${recipe.densityKgM3} kg/m³`}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        ) : (
          <>
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
              value={name}
              onChangeText={setName}
              placeholder="Enter recipe name"
              style={styles.input}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Process
            </Text>
            <TouchableOpacity
              style={[styles.processSelector, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => {
                const processOptions = getProcesses(state).map(proc => ({
                  text: proc.label,
                  onPress: () => setSelectedProcess(proc.key),
                }));
                
                Alert.alert('Select Process', 'Choose a process type:', processOptions);
              }}
            >
              <Text style={[styles.processText, { color: colors.text }]}>
                {getProcesses(state).find(p => p.key === selectedProcess)?.label || 'Select Process'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Version
              </Text>
              <Input
                value={version}
                onChangeText={setVersion}
                placeholder="v0.1"
                style={styles.input}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Density (kg/m³)
              </Text>
              <NumberField
                value={density.toString()}
                onChangeText={(text) => setDensity(text === '' ? '' : parseFloat(text) || '')}
                placeholder="2400"
                style={styles.input}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Tags (comma-separated)
            </Text>
            <Input
              value={tags}
              onChangeText={setTags}
              placeholder="concrete, precast, decorative"
              style={styles.input}
            />
          </View>
        </Card>

        {/* Materials */}
        <Card style={styles.materialsCard}>
          <View style={styles.materialsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Materials ({lines.length})
            </Text>
            <Button
              title="Add Material"
              onPress={handleAddLine}
              size="small"
            />
          </View>
          
          {lines.length === 0 ? (
            <View style={styles.emptyMaterials}>
              <Ionicons name="flask-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No materials added yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Tap "Add Material" to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={lines}
              renderItem={renderLine}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
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
          </>
        )}
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
  content: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  materialsCard: {
    marginBottom: 16,
    padding: 20,
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
    opacity: 0.8,
  },
  lineCard: {
    marginBottom: 12,
    padding: 16,
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineInputs: {
    gap: 12,
  },
  amountInput: {
    flex: 1,
  },
  notesInput: {
    flex: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#00c851',
  },
  cancelButton: {
    borderColor: '#666',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  selectionCard: {
    marginBottom: 16,
    padding: 20,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  selectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyRecipes: {
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
    opacity: 0.8,
  },
  recipeList: {
    gap: 12,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeDetails: {
    fontSize: 14,
    opacity: 0.8,
  },
  processSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  processText: {
    fontSize: 16,
    flex: 1,
  },
});
