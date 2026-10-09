// src/navigation/AppNavigator.tsx
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../store/auth';
import { MenuProvider, useMenu } from '../context/MenuContext';
import GlobalMenu from '../components/GlobalMenu';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import ProductsScreen from '../screens/ProductsScreen';
import RecipesScreen from '../screens/RecipesScreen';
import PlanningScreen from '../screens/PlanningScreen';
import SalesScreen from '../screens/SalesScreen';
import LabScreen from '../screens/LabScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Public screens
import PublicHomeScreen from '../screens/PublicHomeScreen';
import PublicCatalogScreen from '../screens/PublicCatalogScreen';
import PublicProductDetailScreen from '../screens/PublicProductDetailScreen';
import LoginScreen from '../screens/LoginScreen';

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
import ClientsScreen from '../screens/ClientsScreen';
import ClientEditorScreen from '../screens/ClientEditorScreen';
import QuotesScreen from '../screens/QuotesScreen';
import QuoteEditorScreen from '../screens/QuoteEditorScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import DeriveRecipeScreen from '../screens/DeriveRecipeScreen';
import StudioScreen from '../screens/StudioScreen';
import CmsPagesScreen from '../screens/CmsPagesScreen';
import CmsPageEditorScreen from '../screens/CmsPageEditorScreen';
import ProductionHomeScreen from '../screens/ProductionHomeScreen';
import EngineerHomeScreen from '../screens/EngineerHomeScreen';

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
      <Stack.Screen name="Clients" component={ClientsScreen} />
      <Stack.Screen name="ClientEditor" component={ClientEditorScreen} />
      <Stack.Screen name="Quotes" component={QuotesScreen} />
      <Stack.Screen name="QuoteEditor" component={QuoteEditorScreen} />
      <Stack.Screen name="Proposals" component={ProposalScreen} />
      <Stack.Screen name="CostCalculator" component={CostCalculatorScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
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

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Products" component={ProductsStack} />
      <Stack.Screen name="Recipes" component={RecipesStack} />
      <Stack.Screen name="Planning" component={PlanningStack} />
      <Stack.Screen name="Sales" component={SalesStack} />
      <Stack.Screen name="Lab" component={LabStack} />
      <Stack.Screen name="Settings" component={SettingsStack} />
    </Stack.Navigator>
  );
}

function ProductionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProductionHome" component={ProductionHomeScreen} />
      <Stack.Screen name="Recipes" component={RecipesScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="CostCalculator" component={CostCalculatorScreen} />
      <Stack.Screen name="SlabCalculator" component={SlabCalculatorScreen} />
      <Stack.Screen name="TilePlanner" component={TilePlannerScreen} />
      <Stack.Screen name="ProductionPlanner" component={ProductionPlannerScreen} />
      <Stack.Screen name="Studio" component={StudioScreen} />
    </Stack.Navigator>
  );
}

function EngineerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EngineerHome" component={EngineerHomeScreen} />
      <Stack.Screen name="Recipes" component={RecipesStack} />
      <Stack.Screen name="Lab" component={LabStack} />
      <Stack.Screen name="Studio" component={StudioScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function PublicStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PublicHome" component={PublicHomeScreen} />
      <Stack.Screen name="PublicCatalog" component={PublicCatalogScreen} />
      <Stack.Screen name="PublicProductDetail" component={PublicProductDetailScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function AppNavigatorContent() {
  const { isAuthenticated, role } = useAuth();
  
  // Get navigation ref for global menu
  const navigationRef = React.useRef<any>(null);
  
  // Store navigation ref globally for menu access
  React.useEffect(() => {
    (global as any).navigationRef = navigationRef;
    return () => {
      delete (global as any).navigationRef;
    };
  }, []);
  
  // Track current route for menu
  const [currentRoute, setCurrentRoute] = useState<string | null>(null);

  const handleStateChange = (state: any) => {
    if (state) {
      const routes = state.routes;
      const currentRouteName = routes[state.index]?.name;
      setCurrentRoute(currentRouteName);
    }
  };

  return (
    <>
      <NavigationContainer 
        ref={navigationRef}
        onStateChange={handleStateChange}
        onReady={() => {
          const state = navigationRef.current?.getRootState();
          if (state) {
            const routes = state.routes;
            const currentRouteName = routes[state.index]?.name;
            setCurrentRoute(currentRouteName);
          }
        }}
      >
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName={
            isAuthenticated 
              ? (role === 'production' ? "Production" : role === 'sales' ? "Sales" : role === 'engineer' ? "Engineer" : "Admin")
              : "Public"
          }
        >
          <Stack.Screen name="Public" component={PublicStack} />
          {isAuthenticated && role === 'production' && (
            <Stack.Screen name="Production" component={ProductionStack} />
          )}
          {isAuthenticated && role === 'sales' && (
            <Stack.Screen name="Sales" component={SalesStack} />
          )}
          {isAuthenticated && role === 'engineer' && (
            <Stack.Screen name="Engineer" component={EngineerStack} />
          )}
          {isAuthenticated && role === 'admin' && (
            <Stack.Screen name="Admin" component={AdminStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      
      {/* Global Menu - works everywhere */}
      <GlobalMenu navigation={navigationRef.current} currentRoute={currentRoute} />
    </>
  );
}

export default function AppNavigator() {
  return (
    <MenuProvider>
      <AppNavigatorContent />
    </MenuProvider>
  );
}
