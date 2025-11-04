// src/screens/RecipeDetailScreen.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import type { Recipe } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';

export default function RecipeDetailScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { recipe }: { recipe: Recipe } = route.params;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {recipe.name}
        </Text>
        <View style={[styles.processBadge, { backgroundColor: colors.text }]}>
          <Text style={styles.processText}>{recipe.process}</Text>
        </View>
      </View>

      <Card style={styles.infoCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recipe Information
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Process:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {recipe.process}
          </Text>
        </View>
        {recipe.densityKgM3 && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Density:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {recipe.densityKgM3} kg/m³
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Materials:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {recipe.lines.length}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Created:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {new Date(recipe.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Updated:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {new Date(recipe.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </Card>

      {recipe.lines.length > 0 && (
        <Card style={styles.materialsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Materials ({recipe.lines.length})
          </Text>
          {recipe.lines.map((line, index) => (
            <View key={index} style={styles.materialItem}>
              <View style={styles.materialInfo}>
                <Text style={[styles.materialId, { color: colors.text }]}>
                  {line.materialId}
                </Text>
                {line.notes && (
                  <Text style={[styles.materialNotes, { color: colors.textSecondary }]}>
                    {line.notes}
                  </Text>
                )}
              </View>
              <Text style={[styles.materialAmount, { color: colors.text }]}>
                {line.amount}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="Edit Recipe"
          onPress={() => {
            navigation.navigate('RecipeEditor', { recipe });
          }}
          style={styles.editButton}
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  processBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  processText: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: '600',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  materialsCard: {
    margin: 16,
    marginTop: 0,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  materialInfo: {
    flex: 1,
  },
  materialId: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  materialNotes: {
    fontSize: 14,
  },
  materialAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    padding: 16,
  },
  editButton: {
    marginBottom: 0,
  },
});
