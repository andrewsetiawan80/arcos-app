// src/screens/PlanningScreen.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import Card from '../components/Card';
import AdminHeader from '../components/AdminHeader';

export default function PlanningScreen({ navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const calculatorsItems = [
    {
      title: 'Tile Calculator',
      subtitle: 'Calculate tile production requirements',
      icon: 'grid-outline' as const,
      color: colors.primary,
      onPress: () => navigation.navigate('TilePlanner'),
    },
    {
      title: 'Slab Calculator',
      subtitle: 'Calculate concrete volume for slabs',
      icon: 'resize-outline' as const,
      color: colors.success,
      onPress: () => navigation.navigate('SlabCalculator'),
    },
    {
      title: 'Production Planning',
      subtitle: 'Plan concrete production runs',
      icon: 'build-outline' as const,
      color: colors.warning,
      onPress: () => navigation.navigate('ProductionPlanner'),
    },
    {
      title: 'Cost Calculator',
      subtitle: 'Calculate recipe costs and profitability',
      icon: 'calculator-outline' as const,
      color: colors.accent,
      onPress: () => navigation.navigate('CostCalculator'),
    },
  ];

  const renderPlanningItem = (item: any) => (
    <Card key={item.title} style={styles.planningCard} onPress={item.onPress}>
      <View style={styles.planningHeader}>
        <View style={[styles.planningIconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.planningInfo}>
          <Text style={[styles.planningTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.planningSubtitle, { color: colors.textSecondary }]}>
            {item.subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <AdminHeader
        title="Planning"
        subtitle="Production planning and calculators"
        navigation={navigation}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        {/* Calculators Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          CALCULATORS
        </Text>
        {calculatorsItems.map(renderPlanningItem)}
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  planningCard: {
    marginBottom: 12,
    padding: 16,
  },
  planningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planningIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planningInfo: {
    flex: 1,
  },
  planningTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  planningSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
});
