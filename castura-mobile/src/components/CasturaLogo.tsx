import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface CasturaLogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export default function CasturaLogo({ size = 'medium', style }: CasturaLogoProps) {
  const sizeStyles = {
    small: { width: 80, height: 27 },
    medium: { width: 120, height: 40 },
    large: { width: 160, height: 53 }
  };

  return (
    <View style={[styles.logoContainer, style]}>
      <Image
        source={require('../../assets/castura-logo.png')}
        style={[styles.logo, sizeStyles[size]]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Use blend mode to make black background transparent
    // This will make black pixels transparent while keeping the text visible
    backgroundColor: 'transparent',
  },
});
