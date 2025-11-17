// src/screens/RecipesScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load, save, addRecipe, updateRecipe, deleteRecipe } from '../store';
import type { AppState, Recipe } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import ArqonLogo from '../components/ArqonLogo';
import AdminHeader from '../components/AdminHeader';

export default function RecipesScreen({ navigation }: any) {
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

  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleAddRecipe = () => {
    // Navigate to Recipe Editor for creating a new recipe
    navigation.navigate('RecipeEditor', { 
      recipe: null // null indicates creating a new recipe
    });
  };

  const handleDeleteRecipe = (recipe: Recipe) => {
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (state) {
              const updatedState = deleteRecipe(state, recipe.id);
              setState(updatedState);
              await save(updatedState);
            }
          },
        },
      ]
    );
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <Card style={styles.recipeCard} onPress={() => handleRecipePress(item)}>
      <View style={styles.recipeHeader}>
        <View style={styles.recipeIconContainer}>
          <Ionicons name="flask-outline" size={20} color="#33b5e5" />
        </View>
        <View style={styles.recipeInfo}>
          <Text style={[styles.recipeTitle, { color: colors.text }]}>
            {item.name}
          </Text>
          <View style={[styles.processBadge, { backgroundColor: '#33b5e520' }]}>
            <Text style={[styles.processText, { color: '#33b5e5' }]}>{item.process}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteRecipe(item);
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
      
      <View style={styles.recipeStats}>
        <View style={styles.statItem}>
          <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {item.lines.length} materials
          </Text>
        </View>
        {item.densityKgM3 && (
          <View style={styles.statItem}>
            <Ionicons name="speedometer-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {item.densityKgM3} kg/m³
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.recipeFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.updatedAt, { color: colors.textSecondary }]}>
            Updated {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading recipes...
        </Text>
      </View>
    );
  }

  if (!state) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load recipes
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Recipes"
        subtitle="Manage your concrete formulas"
        navigation={navigation}
        rightAction={{
          icon: 'add',
          onPress: handleAddRecipe,
        }}
      />

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Card style={styles.quickActionsCard}>
          <Text style={[styles.quickActionsTitle, { color: colors.text }]}>
            Recipe Development
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => navigation.navigate('DeriveRecipe')}
            >
              <Ionicons name="flask-outline" size={24} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.primary }]}>
                Create New Recipe
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: colors.success + '20' }]}
              onPress={() => navigation.navigate('Studio')}
            >
              <Ionicons name="construct-outline" size={24} color={colors.success} />
              <Text style={[styles.quickActionText, { color: colors.success }]}>
                Mix Studio
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      {!state || (state.recipes || []).length === 0 ? (
        <View style={[styles.emptyState, { paddingBottom: 80 + insets.bottom }]}>
          <Ionicons name="flask-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Recipes Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Create your first recipe to get started
          </Text>
          <TouchableOpacity
            onPress={handleAddRecipe}
            style={[styles.createRecipeButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.background} />
            <Text style={[styles.createRecipeButtonText, { color: colors.background }]}>
              Create Recipe
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={state.recipes}
          renderItem={renderRecipe}
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
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(51, 181, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  addButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 40,
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
  recipeCard: {
    marginBottom: 16,
    padding: 20,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(51, 181, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  processBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  processText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recipeFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
  createRecipeButton: {
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
  createRecipeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  quickActionsContainer: {
    padding: 16,
  },
  quickActionsCard: {
    padding: 16,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
