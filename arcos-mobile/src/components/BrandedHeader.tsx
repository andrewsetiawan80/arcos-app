// src/components/BrandedHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface BrandedHeaderProps {
  title: string;
  subtitle?: string;
  showBrand?: boolean;
}

export default function BrandedHeader({ title, subtitle, showBrand = true }: BrandedHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {showBrand && (
        <View style={styles.brandContainer}>
          <View style={[styles.brandLogo, { backgroundColor: colors.primary }]}>
            <Text style={[styles.brandText, { color: colors.background }]}>C</Text>
          </View>
          <View style={styles.brandInfo}>
            <Text style={[styles.brandName, { color: colors.text }]}>Arcos</Text>
            <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>
              Advanced Concrete Solutions
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  brandTagline: {
    fontSize: 14,
    opacity: 0.8,
  },
  titleContainer: {
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
});







