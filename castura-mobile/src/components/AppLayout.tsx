// src/components/AppLayout.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import AppHeader from './AppHeader';
import MainNavigator from '../navigation/AppNavigator';

type AreaKey = "dashboard" | "products" | "recipes" | "planning" | "sales" | "lab" | "settings";

export default function AppLayout() {
  const { colors } = useTheme();
  const [activeArea, setActiveArea] = useState<AreaKey>("dashboard");
  const [currentScreen, setCurrentScreen] = useState("Dashboard");

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
    
    // Determine active area based on screen
    if (screen === "Dashboard") {
      setActiveArea("dashboard");
    } else if (["Products", "ProductDetail", "ProductEditor", "CatalogSettings"].includes(screen)) {
      setActiveArea("products");
    } else if (["Recipes", "RecipeDetail", "RecipeEditor", "DeriveRecipe", "Studio"].includes(screen)) {
      setActiveArea("recipes");
    } else if (["Planning", "TilePlanner", "SlabCalculator", "ProductionPlanner", "CostCalculator"].includes(screen)) {
      setActiveArea("planning");
    } else if (["Sales", "Proposals"].includes(screen)) {
      setActiveArea("sales");
    } else if (["Lab", "LabEntry", "LabNew", "LabEntryEditor", "Ideas"].includes(screen)) {
      setActiveArea("lab");
    } else if (["Settings", "Materials", "Processes", "CmsPages", "CmsPageEditor"].includes(screen)) {
      setActiveArea("settings");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader activeArea={activeArea} onNavigate={handleNavigate} />
      <View style={styles.content}>
        <MainNavigator />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});






