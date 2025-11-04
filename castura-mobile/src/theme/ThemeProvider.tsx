// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MobileTheme } from '../types';

const THEME_KEY = 'castura_mobile_theme';

type ThemeContextType = {
  theme: MobileTheme;
  setTheme: (theme: MobileTheme) => void;
  colors: ThemeColors;
};

type ThemeColors = {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryLight: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  tabBar: string;
  tabBarBorder: string;
};

// Premium Banking-Inspired Theme (matches web app admin dashboard)
const lightColors: ThemeColors = {
  background: '#f6f7f9',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#0b0c0d',
  textSecondary: '#616a72',
  border: '#e1e5e9',
  primary: '#6b7280',
  primaryLight: '#9ca3af',
  accent: '#4b5563',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  tabBar: '#ffffff',
  tabBarBorder: '#e1e5e9',
};

const darkColors: ThemeColors = {
  background: '#0f0f0f', // deep black background
  surface: '#1a1a1a',   // elevated panels
  card: '#242424',      // card surfaces
  text: '#ffffff',      // pure white text
  textSecondary: '#b3b3b3', // secondary text
  border: '#333333',    // subtle borders
  primary: '#6b7280',   // neutral gray
  primaryLight: '#9ca3af',
  accent: '#4b5563',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  tabBar: '#1a1a1a',
  tabBarBorder: '#333333',
};


const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<MobileTheme>('dark');
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
