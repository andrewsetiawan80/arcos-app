// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import ProductsScreen from '../screens/ProductsScreen';
import RecipesScreen from '../screens/RecipesScreen';
import PlanningScreen from '../screens/PlanningScreen';
import SalesScreen from '../screens/SalesScreen';
import LabScreen from '../screens/LabScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import individual screens for stack navigation
import ProductDetailScreen from '../screens/ProductDetailScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import MaterialScreen from '../screens/MaterialScreen';
import CostCalculatorScreen from '../screens/CostCalculatorScreen';
import ProductionPlannerScreen from '../screens/ProductionPlannerScreen';
import TilePlannerScreen from '../screens/TilePlannerScreen';
import SlabCalculatorScreen from '../screens/SlabCalculatorScreen';
import RecipeEditorScreen from '../screens/RecipeEditorScreen';
import ProductEditorScreen from '../screens/ProductEditorScreen';
import LabEntryEditorScreen from '../screens/LabEntryEditorScreen';
import ProcessesScreen from '../screens/ProcessesScreen';
import IdeasScreen from '../screens/IdeasScreen';
import ProposalScreen from '../screens/ProposalScreen';
import CatalogSettingsScreen from '../screens/CatalogSettingsScreen';
import DeriveRecipeScreen from '../screens/DeriveRecipeScreen';
import StudioScreen from '../screens/StudioScreen';
import CmsPagesScreen from '../screens/CmsPagesScreen';
import CmsPageEditorScreen from '../screens/CmsPageEditorScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
function ProductsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductsList" component={ProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ProductEditor" component={ProductEditorScreen} />
      <Stack.Screen name="CatalogSettings" component={CatalogSettingsScreen} />
    </Stack.Navigator>
  );
}

function RecipesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecipesList" component={RecipesScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="RecipeEditor" component={RecipeEditorScreen} />
      <Stack.Screen name="DeriveRecipe" component={DeriveRecipeScreen} />
      <Stack.Screen name="Studio" component={StudioScreen} />
    </Stack.Navigator>
  );
}

function PlanningStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlanningList" component={PlanningScreen} />
      <Stack.Screen name="TilePlanner" component={TilePlannerScreen} />
      <Stack.Screen name="SlabCalculator" component={SlabCalculatorScreen} />
      <Stack.Screen name="ProductionPlanner" component={ProductionPlannerScreen} />
      <Stack.Screen name="CostCalculator" component={CostCalculatorScreen} />
    </Stack.Navigator>
  );
}

function SalesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SalesList" component={SalesScreen} />
      <Stack.Screen name="Proposals" component={ProposalScreen} />
      <Stack.Screen name="CostCalculator" component={CostCalculatorScreen} />
    </Stack.Navigator>
  );
}

function LabStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LabList" component={LabScreen} />
      <Stack.Screen name="LabNew" component={LabEntryEditorScreen} />
      <Stack.Screen name="LabEntryEditor" component={LabEntryEditorScreen} />
      <Stack.Screen name="Ideas" component={IdeasScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsList" component={SettingsScreen} />
      <Stack.Screen name="Materials" component={MaterialScreen} />
      <Stack.Screen name="Processes" component={ProcessesScreen} />
      <Stack.Screen name="CatalogSettings" component={CatalogSettingsScreen} />
      <Stack.Screen name="CmsPages" component={CmsPagesScreen} />
      <Stack.Screen name="CmsPageEditor" component={CmsPageEditorScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Products') {
              iconName = focused ? 'cube' : 'cube-outline';
            } else if (route.name === 'Recipes') {
              iconName = focused ? 'flask' : 'flask-outline';
            } else if (route.name === 'Planning') {
              iconName = focused ? 'calculator' : 'calculator-outline';
            } else if (route.name === 'Sales') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Lab') {
              iconName = focused ? 'beaker' : 'beaker-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
            borderTopWidth: 0,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 8),
            height: 60 + Math.max(insets.bottom - 8, 0),
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Products" component={ProductsStack} />
        <Tab.Screen name="Recipes" component={RecipesStack} />
        <Tab.Screen name="Planning" component={PlanningStack} />
        <Tab.Screen name="Sales" component={SalesStack} />
        <Tab.Screen name="Lab" component={LabStack} />
        <Tab.Screen name="Settings" component={SettingsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
