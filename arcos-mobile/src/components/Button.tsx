// src/components/Button.tsx - Match web app button styling exactly
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode; // For arrow icons like web app
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8, // Match web app rounded-lg
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      opacity: disabled || loading ? 0.5 : 1,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: 12, paddingVertical: 8 },
      medium: { paddingHorizontal: 16, paddingVertical: 12 },
      large: { paddingHorizontal: 24, paddingVertical: 16 },
    };

    // Match web app button styles exactly
    // Primary: bg-white text-black (web app)
    // Secondary: bg-[#2A2A2A] border border-white/10 text-white
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: colors.primaryBg, // White
        borderWidth: 1,
        borderColor: colors.border,
      },
      secondary: {
        backgroundColor: colors.secondary, // #2A2A2A
        borderWidth: 1,
        borderColor: colors.border, // rgba(255,255,255,0.1)
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '700', // Match web app font-bold
      textTransform: 'uppercase', // Match web app uppercase
      letterSpacing: 0.5, // Match web app tracking-wider
    };

    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: 12 },
      medium: { fontSize: 14 },
      large: { fontSize: 16 },
    };

    // Match web app text colors
    const variantStyles: Record<string, TextStyle> = {
      primary: { color: colors.primaryText }, // Black on white
      secondary: { color: colors.text }, // White on #2A2A2A
      outline: { color: colors.text }, // White
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? colors.primaryText : colors.text} 
        />
      ) : (
        <>
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && <>{icon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}
