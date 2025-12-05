import React from 'react';
import arcosLogo from '../assets/arcos-logo-transparent.png';

interface ArcosLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function ArcosLogo({ size = 'medium', className = '' }: ArcosLogoProps) {
  const sizeStyles = {
    small: { width: 100, height: 34 },
    medium: { width: 150, height: 50 },
    large: { width: 200, height: 66 }
  };

  const currentSize = sizeStyles[size];

  return (
    <div className={`${className} flex items-center m-0 p-0`}>
      <img 
        src={arcosLogo} 
        alt="Arcos" 
        className="block m-0 p-0"
        style={{ 
          width: currentSize.width, 
          height: currentSize.height,
          objectFit: 'contain',
          backgroundColor: 'transparent',
          display: 'block'
        }} 
      />
    </div>
  );
}
