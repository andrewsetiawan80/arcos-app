import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface ArqonLogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export default function ArqonLogo({ size = 'medium', style }: ArqonLogoProps) {
  const sizeStyles = {
    small: { width: 80, height: 27 },
    medium: { width: 110, height: 37 },
    large: { width: 160, height: 53 }
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
