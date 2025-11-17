// src/screens/MaterialScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load, save, addMaterial, updateMaterial, deleteMaterial } from '../store';
import type { AppState, Material } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import AdminHeader from '../components/AdminHeader';

export default function MaterialScreen({ navigation }: any) {
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

  const handleAddMaterial = () => {
    Alert.prompt(
      'Add New Material',
      'Enter material name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (name?: string) => {
            if (name && state) {
              const newMaterial = {
                name: name.trim(),
                unit: 'kg',
                costPerUnitIDR: 0,
                densityKgM3: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              
              const updatedState = addMaterial(state, newMaterial);
              setState(updatedState);
              await save(updatedState);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDeleteMaterial = (material: Material) => {
    Alert.alert(
      'Delete Material',
      `Are you sure you want to delete "${material.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (state) {
              const updatedState = deleteMaterial(state, material.id);
              setState(updatedState);
              await save(updatedState);
            }
          },
        },
      ]
    );
  };

  const handleEditMaterial = (material: Material) => {
    Alert.prompt(
      'Edit Material',
      'Enter new name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (name?: string) => {
            if (name && state) {
              const updatedState = updateMaterial(state, material.id, { name: name.trim() });
              setState(updatedState);
              await save(updatedState);
            }
          },
        },
      ],
      'plain-text',
      material.name
    );
  };

  const renderMaterial = ({ item }: { item: Material }) => (
    <Card style={styles.materialCard}>
      <View style={styles.materialHeader}>
        <View style={styles.materialIconContainer}>
          <Ionicons name="cube-outline" size={20} color="#00c851" />
        </View>
        <View style={styles.materialInfo}>
          <Text style={[styles.materialName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.materialUnit, { color: colors.textSecondary }]}>
            Unit: {item.unit}
          </Text>
        </View>
        <View style={styles.materialActions}>
          <TouchableOpacity
            onPress={() => handleEditMaterial(item)}
            style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          >
            <Ionicons name="pencil-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteMaterial(item)}
            style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.materialDetails}>
        <View style={styles.costInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.costLabel, { color: colors.textSecondary }]}>
              Cost per {item.unit}:
            </Text>
          </View>
          <Text style={[styles.costValue, { color: colors.text }]}>
            IDR {(item.costPerUnitIDR || 0).toLocaleString('id-ID')}
          </Text>
        </View>
        
        {item.densityKgM3 && (
          <View style={styles.densityInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="scale-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.densityLabel, { color: colors.textSecondary }]}>
                Density:
              </Text>
            </View>
            <Text style={[styles.densityValue, { color: colors.text }]}>
              {item.densityKgM3} kg/m³
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.materialFooter}>
        <Text style={[styles.updatedAt, { color: colors.textSecondary }]}>
          Updated {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading materials...
        </Text>
      </View>
    );
  }

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load materials
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Materials"
        subtitle={`Manage your material inventory (${(state?.materials || []).length})`}
        navigation={navigation}
      />

      {!state || (state.materials || []).length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="library-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Materials Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Add your first material to get started
          </Text>
          <TouchableOpacity
            onPress={handleAddMaterial}
            style={[styles.createMaterialButton, { backgroundColor: '#ffffff', borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color="#000000" />
            <Text style={[styles.createMaterialButtonText, { color: '#000000' }]}>
              Create Material
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={state.materials}
          renderItem={renderMaterial}
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
  listContainer: {
    padding: 16,
  },
  materialCard: {
    marginBottom: 12,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  materialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 200, 81, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  materialUnit: {
    fontSize: 12,
    opacity: 0.8,
  },
  materialActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialDetails: {
    gap: 8,
    marginBottom: 12,
  },
  costInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  densityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  costLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  costValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  densityLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  densityValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  materialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updatedAt: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createMaterialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  createMaterialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
