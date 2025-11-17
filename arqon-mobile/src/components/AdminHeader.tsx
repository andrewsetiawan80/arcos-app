// src/components/AdminHeader.tsx - Header with logo and menu for admin screens
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useMenu } from '../context/MenuContext';
import ArqonLogo from './ArqonLogo';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  navigation?: any;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

export default function AdminHeader({ title, subtitle, navigation, rightAction }: AdminHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { openMenu } = useMenu();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: Math.max(insets.top + 8, 20),
        },
      ]}
    >
      <View style={styles.headerContent}>
        {/* Menu Button - Left side */}
        <TouchableOpacity
          onPress={openMenu}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Logo - Center */}
        <TouchableOpacity
          onPress={() => navigation?.navigate('Admin', { screen: 'Dashboard' })}
          style={styles.logoContainer}
          activeOpacity={0.8}
        >
          <ArqonLogo size="medium" />
        </TouchableOpacity>

        {/* Right Action Button or Spacer */}
        {rightAction ? (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.rightActionButton}
            activeOpacity={0.7}
          >
            <Ionicons name={rightAction.icon as any} size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>
      
      {title && (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40, // Same width as menu button for balance
  },
  rightActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});

