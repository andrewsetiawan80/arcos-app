import React from 'react';
import casturaLogo from '../assets/castura-logo.png';

interface CasturaLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function CasturaLogo({ size = 'medium', className = '' }: CasturaLogoProps) {
  const sizeStyles = {
    small: { width: 80, height: 27 },
    medium: { width: 120, height: 40 },
    large: { width: 160, height: 53 }
  };

  const currentSize = sizeStyles[size];

  return (
    <div className={className}>
      <img 
        src={casturaLogo} 
        alt="Castura" 
        style={{ 
          width: currentSize.width, 
          height: currentSize.height,
          objectFit: 'contain',
          backgroundColor: 'transparent'
        }} 
      />
    </div>
  );
}
