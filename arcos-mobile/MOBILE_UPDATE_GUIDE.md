# Mobile App Update Guide - Matching Web App 100%

## ✅ Completed Updates

### 1. Core Infrastructure
- **Types** (`src/types.ts`): Updated to match web app exactly (Material, Recipe, Product, etc.)
- **Theme** (`src/theme/ThemeProvider.tsx`): Updated to match web app dark theme (#1A1A1A, #2A2A2A, etc.)
- **Store** (`src/store.ts`): Updated to match web app store with AsyncStorage for mobile

### 2. Components Updated
- **Button**: Matches web app styling (primary = white bg/black text, secondary = #2A2A2A bg)
- **Card**: Matches web app styling (border-white/10, #2A2A2A background, rounded-2xl)

### 3. Components Still Needed
- **Input**: Update to match web app input styling
- **NumberField**: Update to match web app
- **All other components**: Update to use new theme colors

## 📋 Remaining Work

### Screens to Update (Match Web App Pages)

All screens need to be updated to:
1. Use the new theme colors exactly
2. Match web app layout and structure
3. Use updated components (Button, Card, etc.)
4. Match functionality 100%

#### Admin Screens:
- [ ] `DashboardScreen.tsx` → Match `AppDashboard.tsx`
- [ ] `MaterialsScreen.tsx` → Match `Materials.tsx`
- [ ] `ProductsScreen.tsx` → Match `Products.tsx`
- [ ] `RecipesScreen.tsx` → Match `Recipes.tsx`
- [ ] `RecipeEditorScreen.tsx` → Match `RecipeEditor.tsx`
- [ ] `ProductEditorScreen.tsx` → Match `ProductEditor.tsx`
- [ ] `CostCalculatorScreen.tsx` → Match `Cost.tsx`
- [ ] `ProposalScreen.tsx` → Match `Proposal.tsx`
- [ ] `IdeasScreen.tsx` → Match `Ideas.tsx`
- [ ] `ProcessesScreen.tsx` → Match `Processes.tsx`
- [ ] `DeriveRecipeScreen.tsx` → Match `DeriveRecipe.tsx`
- [ ] `StudioScreen.tsx` → Match `Studio.tsx`
- [ ] `ProductionPlannerScreen.tsx` → Match `ProductionPlanner.tsx`
- [ ] `TilePlannerScreen.tsx` → Match `TilePlanner.tsx`
- [ ] `SlabCalculatorScreen.tsx` → Match `SlabCalculator.tsx`
- [ ] `LabScreen.tsx` → Match `Lab.tsx`
- [ ] `LabEntryEditorScreen.tsx` → Match `LabEntryEditor.tsx`
- [ ] `CatalogSettingsScreen.tsx` → Match `CatalogSettings.tsx`
- [ ] `CmsPagesScreen.tsx` → Match `CmsPages.tsx`
- [ ] `CmsPageEditorScreen.tsx` → Match `CmsPageEditor.tsx`

#### Public Screens (Need to Create):
- [ ] `PublicHomeScreen.tsx` → Match `PublicHome.tsx`
- [ ] `PublicCatalogScreen.tsx` → Match `PublicCatalog.tsx`
- [ ] `PublicProductDetailScreen.tsx` → Match `PublicProductDetail.tsx`
- [ ] `PublicPageScreen.tsx` → Match `PublicPage.tsx`
- [ ] `PublicLayoutScreen.tsx` → Match `PublicLayout.tsx`

### Navigation Updates
- Update `AppNavigator.tsx` to include public routes
- Add tab/screen for public-facing pages
- Match web app routing structure

## 🎨 Styling Guidelines

### Colors (from ThemeProvider)
```typescript
background: '#1A1A1A'           // Main background
surface: '#2A2A2A'              // Cards, panels
surfaceElevated: '#333333'      // Hover states
text: '#FFFFFF'                 // Primary text
textSecondary: '#B3B3B3'        // Secondary text
textMuted: '#808080'            // Muted text
border: 'rgba(255,255,255,0.1)' // Borders
```

### Typography
- Headers: `fontWeight: '900'`, `textTransform: 'uppercase'`, `letterSpacing: 0.5`
- Body: `fontWeight: '400'`, regular letter spacing
- Buttons: `fontWeight: '700'`, `textTransform: 'uppercase'`, `letterSpacing: 0.5`

### Spacing
- Padding: Match web app (p-4 = 16px, p-6 = 24px)
- Margins: Match web app spacing
- Border radius: `rounded-2xl` = 16px

## 📱 Patterns to Follow

### Screen Structure
```typescript
import { useTheme } from '../theme/ThemeProvider';
import { load } from '../store';
import Card from '../components/Card';
import Button from '../components/Button';

export default function MyScreen() {
  const { colors } = useTheme();
  const state = await load(); // or useState + useEffect
  
  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ 
        borderBottomWidth: 1, 
        borderBottomColor: colors.border,
        paddingBottom: 32 
      }}>
        <Text style={{ 
          fontSize: 12, 
          textTransform: 'uppercase',
          letterSpacing: 3,
          color: colors.textSecondary 
        }}>
          Section Label
        </Text>
        <Text style={{ 
          fontSize: 48, 
          fontWeight: '900',
          textTransform: 'uppercase',
          color: colors.text 
        }}>
          Title
        </Text>
      </View>
      
      {/* Content */}
      <Card>
        {/* Card content */}
      </Card>
    </ScrollView>
  );
}
```

### Button Usage
```typescript
// Primary (white bg, black text)
<Button 
  title="Primary Action" 
  onPress={handlePress}
  variant="primary"
/>

// Secondary (dark bg, white text)
<Button 
  title="Secondary Action" 
  onPress={handlePress}
  variant="secondary"
/>
```

## 🔄 Next Steps

1. Update remaining components (Input, NumberField, etc.)
2. Update all admin screens one by one
3. Create public-facing screens
4. Update navigation structure
5. Test all functionality matches web app

## 📝 Notes

- All screens should use `useTheme()` hook for colors
- All data should come from `load()` from store
- Match web app functionality exactly
- Use React Native components but style to match web app
- Test on both iOS and Android


