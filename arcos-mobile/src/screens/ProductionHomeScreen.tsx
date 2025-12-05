// src/screens/ProductionHomeScreen.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import Card from '../components/Card';
import AdminHeader from '../components/AdminHeader';

export default function ProductionHomeScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const productionTools = [
    {
      title: 'Recipes',
      subtitle: 'View and manage product recipes',
      icon: 'flask-outline' as const,
      color: colors.primary,
      onPress: () => navigation.navigate('Recipes'),
    },
    {
      title: 'Cost Calculator',
      subtitle: 'Calculate recipe costs and profitability',
      icon: 'calculator-outline' as const,
      color: colors.success,
      onPress: () => navigation.navigate('CostCalculator'),
    },
    {
      title: 'Slab Calculator',
      subtitle: 'Calculate concrete volume for slabs',
      icon: 'resize-outline' as const,
      color: colors.warning,
      onPress: () => navigation.navigate('SlabCalculator'),
    },
    {
      title: 'Tile Calculator',
      subtitle: 'Calculate tile production requirements',
      icon: 'grid-outline' as const,
      color: colors.accent,
      onPress: () => navigation.navigate('TilePlanner'),
    },
    {
      title: 'Production Planner',
      subtitle: 'Plan concrete production runs',
      icon: 'build-outline' as const,
      color: colors.error,
      onPress: () => navigation.navigate('ProductionPlanner'),
    },
    {
      title: 'Mix Studio',
      subtitle: 'Interactive recipe mixing and testing',
      icon: 'color-palette-outline' as const,
      color: colors.primary,
      onPress: () => navigation.navigate('Studio'),
    },
  ];

  const renderTool = (tool: any) => (
    <Card key={tool.title} style={styles.toolCard} onPress={tool.onPress}>
      <View style={styles.toolHeader}>
        <View style={[styles.toolIconContainer, { backgroundColor: tool.color + '20' }]}>
          <Ionicons name={tool.icon} size={32} color={tool.color} />
        </View>
        <View style={styles.toolInfo}>
          <Text style={[styles.toolTitle, { color: colors.text }]}>
            {tool.title}
          </Text>
          <Text style={[styles.toolSubtitle, { color: colors.textSecondary }]}>
            {tool.subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Production Tools"
        subtitle="Recipes, calculators, and mix studio"
        navigation={navigation}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Access
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Everything you need for production
            </Text>
          </View>

          <View style={styles.toolsGrid}>
            {productionTools.map(renderTool)}
          </View>
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
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
  },
  toolsGrid: {
    gap: 12,
  },
  toolCard: {
    marginBottom: 0,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  toolSubtitle: {
    fontSize: 14,
  },
});

