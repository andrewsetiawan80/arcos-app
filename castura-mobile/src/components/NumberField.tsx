// src/components/NumberField.tsx
import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface NumberFieldProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  step?: number;
  showWarning?: boolean;
}

export default function NumberField({
  value,
  onChange,
  label,
  error,
  containerStyle,
  style,
  step = 1,
  showWarning = true,
  ...props
}: NumberFieldProps) {
  const { colors } = useTheme();
  const [textValue, setTextValue] = useState(value.toString());
  const [showInvalidWarning, setShowInvalidWarning] = useState(false);

  // Improved validation for decimal numbers like 0.02, .02, etc.
  const isValidNumber = (val: string): boolean => {
    if (val === "" || val === "-" || val === "." || val === "-.") return true;
    return /^-?(?:\d+\.?\d*|\.\d+)$/.test(val);
  };

  const handleTextChange = (text: string) => {
    // Prevent alphabetic characters and other invalid input
    if (!/^[0-9.\-]*$/.test(text)) {
      setShowInvalidWarning(true);
      return;
    }

    setTextValue(text);
    setShowInvalidWarning(false);

    if (text === "") {
      onChange(0);
    } else if (isValidNumber(text)) {
      const numValue = parseFloat(text);
      if (!isNaN(numValue)) {
        onChange(numValue);
      }
    }
  };

  const handleBlur = () => {
    setShowInvalidWarning(false);
    const numValue = parseFloat(textValue);
    if (isNaN(numValue) || textValue === "") {
      setTextValue(value.toString());
    } else {
      setTextValue(numValue.toString());
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : showInvalidWarning ? colors.error : colors.border,
            color: colors.text,
          },
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        value={textValue}
        onChangeText={handleTextChange}
        onBlur={handleBlur}
        onFocus={() => setShowInvalidWarning(false)}
        keyboardType="numeric"
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
      {showWarning && showInvalidWarning && (
        <Text style={[styles.warning, { color: colors.error }]}>
          Numbers only (0-9, decimal point, minus sign)
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  warning: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
