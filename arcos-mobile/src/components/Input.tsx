// src/components/Input.tsx - Match web app input styling exactly
import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function Input({
  label,
  error,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceElevated, // Match web app bg-[#1A1A1A]
            borderColor: error ? colors.error : colors.border, // Match web app border-white/10
            color: colors.text,
          },
          error && { borderColor: colors.error },
          style,
        ]}
        placeholderTextColor={colors.textMuted} // Match web app placeholder-gray-500
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12, // Match web app rounded-2xl
    paddingHorizontal: 16, // Match web app px-4
    paddingVertical: 14, // Match web app py-3
    fontSize: 14, // Match web app text-sm
    fontWeight: '500',
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});
