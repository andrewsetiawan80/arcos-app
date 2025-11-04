// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console with enhanced details
    console.error('🚨 React Error Boundary caught an error:', error);
    console.error('🚨 Error Message:', error.message);
    console.error('🚨 Error Stack:', error.stack);
    console.error('🚨 Error Info:', errorInfo);
    console.error('🚨 Component Stack:', errorInfo.componentStack);
    
    // Log additional debugging info
    console.error('🚨 Error Name:', error.name);
    console.error('🚨 Error Cause:', error.cause);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, errorInfo }: { error?: Error; errorInfo?: ErrorInfo }) {
  // Use default colors instead of theme to avoid context issues
  const colors = {
    background: '#0f0f0f',
    surface: '#1a1a1a',
    card: '#242424',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    border: '#333333',
    primary: '#6b7280',
    error: '#f44336',
  };

  const handleReload = () => {
    // In a real app, you might want to reload the app or navigate to a safe screen
    console.log('🔄 Reloading app...');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.errorContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="warning-outline" size={48} color={colors.error} />
        <Text style={[styles.title, { color: colors.text }]}>
          Something went wrong
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          The app encountered an unexpected error. Check the console for details.
        </Text>
        
        {__DEV__ && error && (
          <View style={[styles.errorDetails, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.errorTitle, { color: colors.error }]}>
              Error Details:
            </Text>
            <Text style={[styles.errorText, { color: colors.text }]}>
              {error.name}: {error.message}
            </Text>
            {error.stack && (
              <Text style={[styles.errorStack, { color: colors.textSecondary }]}>
                Stack Trace:{'\n'}{error.stack}
              </Text>
            )}
            {errorInfo && (
              <Text style={[styles.errorStack, { color: colors.textSecondary }]}>
                Component Stack:{'\n'}{errorInfo.componentStack}
              </Text>
            )}
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.reloadButton, { backgroundColor: colors.primary }]}
          onPress={handleReload}
        >
          <Ionicons name="refresh" size={20} color="#ffffff" />
          <Text style={styles.reloadButtonText}>Reload App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ErrorBoundary(props: Props) {
  return <ErrorBoundaryClass {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorDetails: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  reloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
