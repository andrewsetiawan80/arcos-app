# Arqon Mobile App

A React Native mobile application for the Arqon Concrete Management System, built with Expo and TypeScript.

## Features

- **Dashboard**: Overview of products, recipes, materials, and lab entries
- **Products**: Manage concrete products and variants
- **Recipes**: View and manage concrete recipes
- **Lab Entries**: Track R&D experiments and trials
- **Materials**: Manage raw materials database
- **Settings**: Configure app preferences and themes

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **AsyncStorage** for data persistence
- **Expo Vector Icons** for icons
- **Custom Theme System** with light/dark/monochrome modes

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Navigate to the mobile app directory:
   ```bash
   cd arqon-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on your preferred platform:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web (for testing)
   npm run web
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── NumberField.tsx
│   └── Header.tsx
├── navigation/          # Navigation configuration
│   └── AppNavigator.tsx
├── screens/            # Screen components
│   ├── DashboardScreen.tsx
│   ├── ProductsScreen.tsx
│   ├── RecipesScreen.tsx
│   ├── LabScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── ProductDetailScreen.tsx
│   ├── RecipeDetailScreen.tsx
│   ├── LabEntryScreen.tsx
│   └── MaterialScreen.tsx
├── theme/              # Theme system
│   └── ThemeProvider.tsx
├── types.ts            # TypeScript type definitions
└── store.ts            # Data storage and management
```

## Data Storage

The mobile app uses AsyncStorage for local data persistence, mirroring the web app's localStorage approach. All data is stored locally on the device and can be exported/imported as needed.

## Theme System

The app supports three themes:
- **Light**: Clean, bright interface
- **Dark**: Dark interface for low-light usage
- **Monochrome**: Minimalist grayscale design

## Navigation

The app uses a bottom tab navigation with the following tabs:
- **Dashboard**: Main overview screen
- **Products**: Product management
- **Recipes**: Recipe management
- **Lab**: Lab entries and experiments
- **Settings**: App configuration

## Development

### Adding New Screens

1. Create a new screen component in `src/screens/`
2. Add the screen to the appropriate stack navigator in `AppNavigator.tsx`
3. Update the navigation types if needed

### Adding New Components

1. Create the component in `src/components/`
2. Use the `useTheme` hook for consistent styling
3. Follow the existing component patterns

### Data Management

- Use the `load()` and `save()` functions from `store.ts` for data persistence
- All data operations should be async
- Follow the existing data structure defined in `types.ts`

## Building for Production

### iOS

1. Configure your Apple Developer account
2. Run: `expo build:ios`
3. Follow the prompts to build and submit to App Store

### Android

1. Configure your Google Play Console
2. Run: `expo build:android`
3. Follow the prompts to build and submit to Google Play

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Test on both iOS and Android platforms
4. Update documentation as needed

## License

This project is part of the Arqon Concrete Management System.







