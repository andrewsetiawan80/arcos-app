// src/components/AppHeader.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import ArqonLogo from './ArqonLogo';

type AreaKey = "dashboard" | "products" | "recipes" | "planning" | "sales" | "lab" | "settings";

interface AppHeaderProps {
  activeArea: AreaKey;
  onNavigate: (screen: string) => void;
}

const NAV: Record<
  AreaKey,
  { header: string; groups: { title?: string; items: { to: string; label: string }[] }[] }
> = {
  dashboard: {
    header: "Dashboard",
    groups: [
      { 
        items: [
          { to: "Dashboard", label: "Overview & Quick Actions" },
        ] 
      },
    ],
  },
  products: {
    header: "Products & Catalog",
    groups: [
      {
        title: "Product Management",
        items: [
          { to: "Products", label: "View Products" },
          { to: "ProductEditor", label: "Add/Edit Products" },
          { to: "CatalogSettings", label: "Product Settings" },
        ],
      },
    ],
  },
  recipes: {
    header: "Recipes & Mixes",
    groups: [
      {
        title: "Recipe Development",
        items: [
          { to: "Recipes", label: "Recipe Library" },
          { to: "DeriveRecipe", label: "Create New Recipe" },
          { to: "Studio", label: "Mix Studio" },
        ],
      },
    ],
  },
  planning: {
    header: "Planning & Estimating",
    groups: [
      {
        title: "Calculators",
        items: [
          { to: "TilePlanner", label: "Tile Calculator" },
          { to: "SlabCalculator", label: "Slab Calculator" },
          { to: "ProductionPlanner", label: "Production Planning" },
          { to: "CostCalculator", label: "Cost Calculator" },
        ],
      },
    ],
  },
  sales: {
    header: "Sales & Proposals",
    groups: [
      {
        title: "Client Work",
        items: [
          { to: "Proposals", label: "Create Proposals" },
          { to: "CostCalculator", label: "Pricing Tools" },
        ],
      },
    ],
  },
  lab: {
    header: "Lab & R&D",
    groups: [
      {
        title: "Research & Testing",
        items: [
          { to: "Lab", label: "Lab Notebook" },
          { to: "Ideas", label: "Experiment Ideas" },
        ],
      },
    ],
  },
  settings: {
    header: "Settings",
    groups: [
      {
        title: "System Configuration",
        items: [
          { to: "Materials", label: "Materials" },
          { to: "Processes", label: "Processes" },
          { to: "CmsPages", label: "Site Settings" },
        ],
      },
    ],
  },
};

const tabs: { key: AreaKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "Products" },
  { key: "recipes", label: "Recipes" },
  { key: "planning", label: "Planning" },
  { key: "sales", label: "Sales" },
  { key: "lab", label: "Lab" },
  { key: "settings", label: "Settings" },
];

export default function AppHeader({ activeArea, onNavigate }: AppHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [openKey, setOpenKey] = useState<AreaKey | null>(null);

  const topTab = (active: boolean) => {
    const baseClasses = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";
    return active 
      ? `${baseClasses} text-white` 
      : `${baseClasses} text-gray-400 hover:text-white`;
  };

  const handleTabPress = (tab: AreaKey) => {
    if (tab === "dashboard") {
      onNavigate("Dashboard");
    } else {
      setOpenKey(openKey === tab ? null : tab);
    }
  };

  const handleMenuItemPress = (to: string) => {
    onNavigate(to);
    setOpenKey(null);
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.surface,
      borderBottomColor: colors.border,
      paddingTop: Math.max(insets.top + 8, 20)
    }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Brand */}
        <TouchableOpacity 
          style={styles.brand}
          onPress={() => onNavigate("Dashboard")}
        >
          <ArqonLogo size="medium" style={{ transform: [{ scale: 6 }] }} />
        </TouchableOpacity>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeArea === tab.key && styles.activeTab
              ]}
              onPress={() => handleTabPress(tab.key)}
            >
              <Text style={[
                styles.tabText,
                { color: activeArea === tab.key ? colors.text : colors.textSecondary }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Right side controls */}
        <View style={styles.rightControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu */}
      {openKey && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.dropdownContent}>
            <Text style={[styles.dropdownTitle, { color: colors.text }]}>
              {NAV[openKey].header}
            </Text>
            {NAV[openKey].groups.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.group}>
                {group.title && (
                  <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>
                    {group.title}
                  </Text>
                )}
                {group.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.menuItem}
                    onPress={() => handleMenuItemPress(item.to)}
                  >
                    <Text style={[styles.menuItemText, { color: colors.text }]}>
                      {item.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    zIndex: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  brand: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flex: 1,
  },
  tabsContent: {
    alignItems: 'center',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    // Active styling handled by text color
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rightControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dropdownContent: {
    gap: 16,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
