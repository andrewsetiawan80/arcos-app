// src/screens/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { load } from '../store';
import type { AppState } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import AdminHeader from '../components/AdminHeader';

export default function DashboardScreen({ navigation }: any) {
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading...
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

      const products = state.products || [];
      const recipes = state.recipes || [];
      const materials = state.materials || [];
      
      const stats = [
        {
          title: 'Public Products',
          value: products.filter(p => p.public).length,
          subtitle: 'Published',
          icon: 'cube-outline' as const,
          color: colors.success,
          onPress: () => navigation.navigate('Products'),
        },
        {
          title: 'Recipes',
          value: recipes.length,
          subtitle: 'Formulas',
          icon: 'flask-outline' as const,
          color: colors.primary,
          onPress: () => navigation.navigate('Recipes'),
        },
        {
          title: 'Materials',
          value: materials.length,
          subtitle: 'Raw Materials',
          icon: 'library-outline' as const,
          color: colors.warning,
          onPress: () => navigation.navigate('Settings', { screen: 'Materials' }),
        },
        {
          title: 'Open Proposals',
          value: (state.proposals || []).filter((p) => p.status !== "won" && p.status !== "lost").length,
          subtitle: 'Active',
          icon: 'people-outline' as const,
          color: colors.error,
          onPress: () => navigation.navigate('Settings', { screen: 'Proposals' }),
        },
      ];

  // Derived lists
  const recentLab = [...(state.labEntries || [])]
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    .slice(0, 5);

  const recentRecipes = [...recipes]
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 5);

  const lowStock = materials.filter(m => 
    typeof (m as any).stockKg === "number" && 
    typeof (m as any).reorderPointKg === "number" && 
    (m as any).stockKg <= (m as any).reorderPointKg
  ).slice(0, 5);

  const openProposals = (state.proposals || [])
    .filter((p) => p.status !== "won" && p.status !== "lost")
    .slice(0, 6);

  const quickActions = [
    {
      title: 'Add Product',
      icon: 'add-circle-outline' as const,
      color: colors.success,
      onPress: () => navigation.navigate('Products'),
    },
    {
      title: 'New Recipe',
      icon: 'flask-outline' as const,
      color: colors.primary,
      onPress: () => navigation.navigate('Recipes'),
    },
    {
      title: 'Lab Entry',
      icon: 'beaker-outline' as const,
      color: colors.error,
      onPress: () => navigation.navigate('Lab'),
    },
    {
      title: 'Calculate',
      icon: 'calculator-outline' as const,
      color: colors.warning,
      onPress: () => navigation.navigate('Planning', { screen: 'CostCalculator' }),
    },
  ];

      return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
          <AdminHeader 
            title="Dashboard"
            subtitle="Manage your concrete products, recipes, and lab testing"
            navigation={navigation}
          />

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={{ 
              paddingTop: 16,
              paddingBottom: 32 + insets.bottom,
              paddingHorizontal: 16
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Welcome Header */}
            <View style={[styles.welcomeHeader, { marginBottom: 32, paddingBottom: 32, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary, fontSize: 10, letterSpacing: 3 }]}>
                ARCOS DASHBOARD
              </Text>
              <Text style={[styles.welcomeTitle, { color: colors.text, fontSize: 36, fontWeight: '900', marginTop: 8, marginBottom: 12 }]}>
                Welcome Back
              </Text>
              <Text style={[styles.welcomeDescription, { color: colors.textSecondary, fontSize: 14, lineHeight: 20 }]}>
                Manage your concrete products, recipes, and lab testing with precision and efficiency.
              </Text>
            </View>

            {/* Quick Actions */}
            <View style={{ marginBottom: 32 }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: 10, letterSpacing: 3, marginBottom: 8 }]}>
                  QUICK ACTIONS
                </Text>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: 0 }]}>
                  Quick Actions
                </Text>
              </View>
              <View style={[styles.quickActionsGrid, { gap: 12 }]}>
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.quickActionButton, { 
                      borderColor: colors.border, 
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      backgroundColor: colors.surface,
                      borderWidth: 1
                    }]}
                    onPress={action.onPress}
                  >
                    <Ionicons name={action.icon} size={24} color={action.color} />
                    <Text style={[styles.quickActionText, { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 8 }]}>
                      {action.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 4 Stats Cards Grid */}
            <View style={[styles.statsGridContainer, { marginBottom: 32 }]}>
              {stats.map((stat, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.statsCard, { 
                    borderColor: colors.border, 
                    backgroundColor: colors.surface,
                  }]}
                  onPress={stat.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.statsCardContent}>
                    <View style={[styles.statsCardIconContainer, { backgroundColor: `${stat.color}20` }]}>
                      <Ionicons name={stat.icon} size={24} color={stat.color} />
                    </View>
                    <View style={styles.statsCardTextContainer}>
                      <Text style={[styles.statsCardValue, { color: colors.text }]}>
                        {stat.value}
                      </Text>
                      <Text style={[styles.statsCardTitle, { color: colors.text }]}>
                        {stat.title}
                      </Text>
                      <Text style={[styles.statsCardSubtitle, { color: colors.textSecondary }]}>
                        {stat.subtitle}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Analytics Section */}
            <View style={[styles.analyticsSection, { marginBottom: 32, gap: 16 }]}>
              <Card style={[styles.analyticsCard, { padding: 24 }]}>
                <View style={styles.analyticsHeader}>
                  <View style={styles.analyticsIconContainer}>
                    <Ionicons name="bar-chart-outline" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.analyticsTitleContainer}>
                    <Text style={[styles.analyticsTitle, { color: colors.text }]}>
                      Monthly Overview
                    </Text>
                    <Text style={[styles.analyticsSubtitle, { color: colors.textSecondary }]}>
                      Revenue & Performance
                    </Text>
                  </View>
                </View>
                <View style={styles.chartContainer}>
                  {[65, 80, 45, 90, 75, 85, 70].map((height, i) => (
                    <View key={i} style={styles.chartBar}>
                      <View 
                        style={[styles.chartBarFill, { height: `${height}%` }]}
                      />
                      <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={styles.chartFooter}>
                  <View style={styles.chartValueContainer}>
                    <Text style={[styles.chartValue, { color: colors.text }]}>
                      $24,580
                    </Text>
                    <Text style={[styles.chartValueLabel, { color: colors.textSecondary }]}>
                      Total Revenue
                    </Text>
                  </View>
                  <View style={styles.chartTrend}>
                    <Ionicons name="trending-up" size={16} color={colors.success} />
                    <Text style={[styles.chartTrendText, { color: colors.success }]}>
                      +12.5%
                    </Text>
                  </View>
                </View>
              </Card>

              <Card style={[styles.analyticsCard, { padding: 24 }]}>
                <View style={styles.analyticsHeader}>
                  <View style={styles.analyticsIconContainer}>
                    <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
                  </View>
                  <View style={styles.analyticsTitleContainer}>
                    <Text style={[styles.analyticsTitle, { color: colors.text }]}>
                      Project Status
                    </Text>
                    <Text style={[styles.analyticsSubtitle, { color: colors.textSecondary }]}>
                      Current Pipeline
                    </Text>
                  </View>
                </View>
                <View style={styles.statusList}>
                  {[
                    { label: 'Active Projects', value: 8, color: colors.primary, icon: 'play-circle' },
                    { label: 'In Progress', value: 12, color: colors.warning, icon: 'time' },
                    { label: 'Completed', value: 24, color: colors.success, icon: 'checkmark-circle' },
                    { label: 'On Hold', value: 3, color: colors.textSecondary, icon: 'pause-circle' },
                  ].map((item, i) => (
                    <View key={i} style={styles.statusItem}>
                      <View style={[styles.statusIcon, { backgroundColor: item.color }]}>
                        <Ionicons name={item.icon as any} size={16} color="#ffffff" />
                      </View>
                      <View style={styles.statusTextContainer}>
                        <Text style={[styles.statusLabel, { color: colors.text }]}>
                          {item.label}
                        </Text>
                        <Text style={[styles.statusSubLabel, { color: colors.textSecondary }]}>
                          {item.value} projects
                        </Text>
                      </View>
                      <Text style={[styles.statusValue, { color: colors.text }]}>
                        {item.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            </View>

            {/* Main Content Grid */}
            <View style={[styles.mainGrid, { gap: 16, marginBottom: 32 }]}>
              {/* Left Column */}
              <View style={styles.leftColumn}>
                <Card style={[styles.listCard, { padding: 24 }]}>
                  <View style={styles.listHeader}>
                    <View style={styles.listTitleContainer}>
                      <View style={styles.listIconContainer}>
                        <Ionicons name="beaker-outline" size={20} color={colors.error} />
                      </View>
                      <View>
                        <Text style={[styles.listTitle, { color: colors.text }]}>
                          Recent Lab Entries
                        </Text>
                        <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
                          Latest experiments
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Lab')}>
                      <Text style={[styles.listAction, { color: colors.textSecondary }]}>
                        View all →
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {recentLab.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="beaker-outline" size={32} color={colors.textSecondary} />
                      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No lab entries yet. Start documenting experiments.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.listContent}>
                      {recentLab.map((entry, index) => (
                        <TouchableOpacity key={index} style={styles.listItem}>
                          <View style={styles.listItemIcon}>
                            <Ionicons name="flask-outline" size={16} color={colors.error} />
                          </View>
                          <View style={styles.listItemContent}>
                            <Text style={[styles.listItemTitle, { color: colors.text }]}>
                              {entry.title || entry.id}
                            </Text>
                            <Text style={[styles.listItemMeta, { color: colors.textSecondary }]}>
                              {entry.status || "draft"} • {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ""}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Card>

                <Card style={styles.listCard}>
                  <View style={styles.listHeader}>
                    <View style={styles.listTitleContainer}>
                      <View style={styles.listIconContainer}>
                        <Ionicons name="flask-outline" size={20} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={[styles.listTitle, { color: colors.text }]}>
                          Recent Recipes
                        </Text>
                        <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
                          Latest formulas
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Recipes')}>
                      <Text style={[styles.listAction, { color: colors.textSecondary }]}>
                        All recipes →
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {recentRecipes.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="flask-outline" size={32} color={colors.textSecondary} />
                      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No recipes yet.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.listContent}>
                      {recentRecipes.map((recipe, index) => (
                        <TouchableOpacity key={index} style={styles.listItem}>
                          <View style={styles.listItemIcon}>
                            <Ionicons name="cube-outline" size={16} color={colors.primary} />
                          </View>
                          <View style={styles.listItemContent}>
                            <Text style={[styles.listItemTitle, { color: colors.text }]}>
                              {recipe.name}
                            </Text>
                            <Text style={[styles.listItemMeta, { color: colors.textSecondary }]}>
                              {recipe.process || "—"} • {recipe.updatedAt ? new Date(recipe.updatedAt).toLocaleDateString() : ""}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Card>
              </View>

              {/* Right Column */}
              <View style={styles.rightColumn}>
                <Card style={[styles.listCard, { padding: 24 }]}>
                  <View style={styles.listHeader}>
                    <View style={styles.listTitleContainer}>
                      <View style={styles.listIconContainer}>
                        <Ionicons name="people-outline" size={20} color={colors.warning} />
                      </View>
                      <View>
                        <Text style={[styles.listTitle, { color: colors.text }]}>
                          Open Proposals
                        </Text>
                        <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
                          Active deals
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings', { screen: 'Proposals' })}>
                      <Text style={[styles.listAction, { color: colors.textSecondary }]}>
                        Create proposal →
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {openProposals.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="people-outline" size={32} color={colors.textSecondary} />
                      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No open proposals.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.listContent}>
                      {openProposals.map((proposal, index) => (
                        <TouchableOpacity key={index} style={styles.listItem}>
                          <View style={styles.listItemIcon}>
                            <Ionicons name="document-text-outline" size={16} color={colors.warning} />
                          </View>
                          <View style={styles.listItemContent}>
                            <Text style={[styles.listItemTitle, { color: colors.text }]}>
                              {proposal.title || `Proposal ${proposal.id}`}
                            </Text>
                            <Text style={[styles.listItemMeta, { color: colors.textSecondary }]}>
                              {proposal.client || "—"} • {proposal.total ? `Rp ${proposal.total.toLocaleString()}` : ""}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Card>

                <Card style={styles.listCard}>
                  <View style={styles.listHeader}>
                    <View style={styles.listTitleContainer}>
                      <View style={styles.listIconContainer}>
                        <Ionicons name="warning-outline" size={20} color={colors.error} />
                      </View>
                      <View>
                        <Text style={[styles.listTitle, { color: colors.text }]}>
                          Low Stock
                        </Text>
                        <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
                          Reorder needed
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings', { screen: 'Materials' })}>
                      <Text style={[styles.listAction, { color: colors.textSecondary }]}>
                        Materials →
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {lowStock.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="checkmark-circle-outline" size={32} color={colors.success} />
                      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        All good. No low stock items.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.listContent}>
                      {lowStock.map((material, index) => (
                        <TouchableOpacity key={index} style={styles.listItem}>
                          <View style={styles.listItemIcon}>
                            <Ionicons name="library-outline" size={16} color={colors.error} />
                          </View>
                          <View style={styles.listItemContent}>
                            <Text style={[styles.listItemTitle, { color: colors.text }]}>
                              {material.name}
                            </Text>
                            <Text style={[styles.listItemMeta, { color: colors.textSecondary }]}>
                              {(material as any).stockKg ? `${(material as any).stockKg} kg` : ""} • 
                              {(material as any).reorderPointKg ? `Min ${(material as any).reorderPointKg} kg` : ""}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </Card>
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
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  // Logo Header
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tagline: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '300',
  },
  // Welcome Header
  welcomeHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  welcomeSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  // Quick Actions
  quickActionsCard: {
    margin: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  quickActionText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  // 4 Stats Cards Grid - Same style as quick actions
  statsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  statsCardContent: {
    alignItems: 'center',
    width: '100%',
  },
  statsCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statsCardTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  statsCardValue: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  statsCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
    marginTop: 4,
  },
  statsCardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  // Analytics Section
  analyticsSection: {
    gap: 16,
    flexDirection: 'column',
  },
  analyticsCard: {
    margin: 0,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  analyticsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  analyticsTitleContainer: {
    flex: 1,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  analyticsSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  // Chart
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    marginBottom: 20,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  chartBarFill: {
    width: '100%',
    backgroundColor: '#888888',
    borderRadius: 6,
    marginBottom: 8,
    minHeight: 20,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartValueContainer: {
    flex: 1,
  },
  chartValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 2,
  },
  chartValueLabel: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  chartTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 81, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chartTrendText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  // Status List
  statusList: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusSubLabel: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  // Main Grid
  mainGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  leftColumn: {
    width: '100%',
    gap: 16,
  },
  rightColumn: {
    width: '100%',
    gap: 16,
  },
  // List Cards
  listCard: {
    margin: 0,
    padding: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  listTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  listSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  listAction: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  listContent: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  listItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listItemMeta: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
  },
});
