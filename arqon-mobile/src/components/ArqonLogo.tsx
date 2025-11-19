import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface ArqonLogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export default function ArqonLogo({ size = 'medium', style }: ArqonLogoProps) {
  const sizeStyles = {
    small: { width: 100, height: 34 },
    medium: { width: 138, height: 46 },
    large: { width: 200, height: 66 }
  };

  return (
    <View style={[styles.logoContainer, style]}>
      <Image
        source={require('../../assets/argon-logo-transparent.png')}
        style={[styles.logo, sizeStyles[size]]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'visible',
  },
  logo: {
    backgroundColor: 'transparent',
    // Ensure the image doesn't get clipped
    overflow: 'visible',
  },
});
