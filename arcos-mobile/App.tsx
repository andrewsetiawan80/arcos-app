// App.tsx
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeProvider';
import ErrorBoundary from './src/components/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';
import { useAuth } from './src/store/auth';

// Global error handler for React Native
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

// Enhanced error logging with stack traces
console.error = (...args) => {
  // Log all console errors with a special prefix for easier identification
  originalConsoleError('🚨 Console Error:', ...args);
  
  // Force stack trace for errors (but avoid recursion)
  if (args.length > 0 && args[0] instanceof Error && args[0].stack) {
    originalConsoleError('🚨 Stack Trace:', args[0].stack);
  }
};

// Enhanced logging for debugging
console.log = (...args) => {
  originalConsoleLog('📱 Debug Log:', ...args);
};

console.warn = (...args) => {
  originalConsoleWarn('⚠️ Warning:', ...args);
};

// Global error handlers for React Native
// Note: ErrorUtils is deprecated in newer React Native versions
// Using console.error override instead for better compatibility

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      await useAuth.getState().loadAuth();
      setAuthLoaded(true);
    };
    initAuth();
  }, []);

  const handleSplashFinish = () => {
    setIsSplashVisible(false);
  };

  if (isSplashVisible || !authLoaded) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={handleSplashFinish} />
        <StatusBar style="light" hidden={true} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AppNavigator />
          <StatusBar style="auto" />
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}