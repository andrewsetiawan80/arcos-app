import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface ArcosLogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export default function ArcosLogo({ size = 'medium', style }: ArcosLogoProps) {
  const sizeStyles = {
    small: { width: 100, height: 34 },
    medium: { width: 138, height: 46 },
    large: { width: 200, height: 66 }
  };

  return (
    <View style={[styles.logoContainer, style]}>
      <Image
        source={require('../../assets/arcos-logo-transparent.png')}
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
