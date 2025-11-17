import React from 'react';
import arqosLogo from '../assets/arqos.png';

interface ArqonLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function ArqonLogo({ size = 'medium', className = '' }: ArqonLogoProps) {
  const sizeStyles = {
    small: { width: 80, height: 27 },
    medium: { width: 120, height: 40 },
    large: { width: 160, height: 53 }
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
