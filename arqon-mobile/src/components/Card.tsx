// src/components/Card.tsx - Match web app card styling exactly
import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  marginBottom?: number;
  onPress?: () => void;
  accent?: boolean; // Match web app accent bar
}

export default function Card({ 
  children, 
  style, 
  padding = 24, // Match web app p-6 (24px)
  margin = 0,
  marginBottom = 0,
  onPress,
  accent = false,
}: CardProps) {
  const { colors } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface, // #2A2A2A - Match web app
    borderWidth: 1,
    borderColor: colors.border, // rgba(255,255,255,0.1) - Match web app border-white/10
    borderRadius: 16, // Match web app rounded-2xl
    padding,
    margin,
    marginBottom,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  };

  const content = (
    <View style={[cardStyle, style]}>
      {accent && (
        <View
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            top: 0,
            height: 3,
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
            backgroundColor: 'rgba(214,163,98,0.9)', // Match web app accent gradient
          }}
        />
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={{ margin, marginBottom }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
