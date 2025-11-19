import React from 'react';
import arqosLogo from '../assets/arqos.png';

interface ArqonLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function ArqonLogo({ size = 'medium', className = '' }: ArqonLogoProps) {
  const sizeStyles = {
    small: { width: 100, height: 34 },
    medium: { width: 150, height: 50 },
    large: { width: 200, height: 66 }
  };

  const currentSize = sizeStyles[size];

  return (
    <div className={className}>
      <img 
        src={arqosLogo} 
        alt="Arqon" 
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
