// src/components/PublicHeader.tsx - Header with logo for public-facing screens
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../store/auth';
import { useMenu } from '../context/MenuContext';
import ArcosLogo from './ArcosLogo';

interface PublicHeaderProps {
  navigation: any;
  onMenuPress?: () => void;
}

export default function PublicHeader({ navigation, onMenuPress }: PublicHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { openMenu } = useMenu();
  
  // Use global menu if onMenuPress not provided
  const handleMenuPress = onMenuPress || openMenu;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.headerContent}>
        {/* Menu Button - Left side */}
        <TouchableOpacity
          onPress={handleMenuPress}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Logo - Center */}
        <TouchableOpacity
          onPress={() => navigation.navigate('PublicHome')}
          style={styles.logoContainer}
          activeOpacity={0.8}
        >
          <ArcosLogo size="medium" />
        </TouchableOpacity>

        {/* Spacer for balance */}
        <View style={styles.headerSpacer} />
      </View>
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
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40, // Same width as menu button for balance
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
