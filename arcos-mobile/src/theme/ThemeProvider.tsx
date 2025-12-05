// src/theme/ThemeProvider.tsx - Match web app dark theme exactly
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MobileTheme } from '../types';

const THEME_KEY = 'arcos_mobile_theme';

type ThemeContextType = {
  theme: MobileTheme;
  setTheme: (theme: MobileTheme) => void;
  colors: ThemeColors;
};

// Match web app dark theme colors exactly (#1A1A1A, #2A2A2A, etc.)
type ThemeColors = {
  background: string;      // #1A1A1A - main background
  surface: string;         // #2A2A2A - elevated panels/cards
  surfaceElevated: string; // #333333 - higher elevation
  text: string;           // #ffffff - pure white text
  textSecondary: string;  // #b3b3b3 - secondary text
  textMuted: string;      // #808080 - muted text
  border: string;         // rgba(255,255,255,0.1) - subtle borders
  borderLight: string;    // rgba(255,255,255,0.2) - lighter borders
  primary: string;        // #ffffff - white for primary actions
  primaryBg: string;      // #ffffff - white background
  primaryText: string;    // #000000 - black text on white
  secondary: string;      // #2A2A2A - secondary buttons
  accent: string;         // gradient colors for accents
  success: string;
  warning: string;
  error: string;
  info: string;
  tabBar: string;         // #1A1A1A - tab bar background
  tabBarBorder: string;   // rgba(255,255,255,0.1)
};

// Dark theme matching web app exactly
const darkColors: ThemeColors = {
  background: '#1A1A1A',           // Match web app
  surface: '#2A2A2A',              // Match web app
  surfaceElevated: '#333333',      // Match web app hover states
  text: '#FFFFFF',                 // Pure white
  textSecondary: '#B3B3B3',        // Secondary text
  textMuted: '#808080',            // Muted text
  border: 'rgba(255, 255, 255, 0.1)',     // Match web app border-white/10
  borderLight: 'rgba(255, 255, 255, 0.2)', // Match web app border-white/20
  primary: '#FFFFFF',              // White for primary buttons
  primaryBg: '#FFFFFF',            // White background for primary buttons
  primaryText: '#000000',          // Black text on white buttons
  secondary: '#2A2A2A',            // Secondary button background
  accent: '#6B7280',               // Neutral gray accent
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  tabBar: '#1A1A1A',
  tabBarBorder: 'rgba(255, 255, 255, 0.1)',
};

// Light theme (optional, matching web app)
const lightColors: ThemeColors = {
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceElevated: '#F6F7F9',
  text: '#0B0C0D',
  textSecondary: '#616A72',
  textMuted: '#9AA0A6',
  border: '#E1E5E9',
  borderLight: '#C9CBD1',
  primary: '#0B0C0D',
  primaryBg: '#0B0C0D',
  primaryText: '#FFFFFF',
  secondary: '#FFFFFF',
  accent: '#6B7280',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E1E5E9',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<MobileTheme>('dark'); // Default to dark like web app
  const [isLoading, setIsLoading] = useState(true);

  const setTheme = async (newTheme: MobileTheme) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
          setThemeState(savedTheme as MobileTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
