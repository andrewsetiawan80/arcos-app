import React from 'react';

interface ArcosLogoProps {
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Color variant - use 'light' (white logo) on dark backgrounds, 'dark' (black logo) on light backgrounds */
  variant?: 'light' | 'dark';
  /** Show tagline below logo */
  withTagline?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Arcos Logo Component
 * 
 * Brand Guidelines:
 * - White logo on dark backgrounds (#232323 or #353535)
 * - Black logo on white background
 * - Maintain safe zone: roughly the height of the logo as padding on all sides
 * - Do NOT stretch, skew, or recolor outside the brand palette
 */
export default function ArcosLogo({ 
  size = 'medium', 
  variant = 'light',
  withTagline = false,
  className = '' 
}: ArcosLogoProps) {
  // Size configurations with safe zone built in
  const sizeConfig = {
    small: { 
      logoHeight: 28, 
      lineWidth: 32,
      lineHeight: 3,
      letterSpacing: '0.12em',
      fontSize: 20,
      taglineSize: 8,
      safeZone: 14 // Half the logo height
    },
    medium: { 
      logoHeight: 40, 
      lineWidth: 46,
      lineHeight: 4,
      letterSpacing: '0.12em',
      fontSize: 28,
      taglineSize: 10,
      safeZone: 20
    },
    large: { 
      logoHeight: 56, 
      lineWidth: 64,
      lineHeight: 5,
      letterSpacing: '0.12em',
      fontSize: 40,
      taglineSize: 12,
      safeZone: 28
    }
  };

  const config = sizeConfig[size];
  
  // Colors based on variant (following brand guidelines)
  const colors = {
    light: {
      primary: '#ffffff',    // White on dark backgrounds
      secondary: 'rgba(255, 255, 255, 0.7)'
    },
    dark: {
      primary: '#232323',    // Arcos Black on light backgrounds
      secondary: 'rgba(35, 35, 35, 0.7)'
    }
  };

  const currentColors = colors[variant];

  return (
    <div 
      className={`arcos-logo-container ${className}`}
      style={{ 
        padding: config.safeZone,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: withTagline ? 4 : 0
      }}
    >
      {/* Main Logo SVG */}
      <svg 
        width="auto" 
        height={config.logoHeight}
        viewBox="0 0 200 60"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Arcos"
        role="img"
      >
        {/* Horizontal line above the 'a' */}
        <rect 
          x="0" 
          y="2" 
          width="38" 
          height="4" 
          fill={currentColors.primary}
        />
        
        {/* Logo text: arcos */}
        <text 
          x="0" 
          y="52" 
          fontFamily="'Host Grotesk', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="48"
          fontWeight="700"
          letterSpacing="0.02em"
          fill={currentColors.primary}
        >
          arcos
        </text>
      </svg>

      {/* Optional Tagline */}
      {withTagline && (
        <span 
          style={{
            fontFamily: "'Host Grotesk', system-ui, sans-serif",
            fontSize: config.taglineSize,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: currentColors.secondary,
            marginTop: 4
          }}
        >
          Architectural Concrete Solutions
        </span>
      )}
    </div>
  );
}

/**
 * Minimal logo mark only (just the 'a' with line)
 */
export function ArcosLogoMark({ 
  size = 24, 
  variant = 'light',
  className = '' 
}: { 
  size?: number; 
  variant?: 'light' | 'dark';
  className?: string;
}) {
  const color = variant === 'light' ? '#ffffff' : '#232323';
  
  return (
    <svg 
      width={size} 
      height={size}
      viewBox="0 0 40 40"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Arcos"
      role="img"
    >
      {/* Line above */}
      <rect x="2" y="2" width="16" height="3" fill={color} />
      
      {/* Letter 'a' stylized */}
      <text 
        x="2" 
        y="36" 
        fontFamily="'Host Grotesk', system-ui, sans-serif"
        fontSize="32"
        fontWeight="700"
        fill={color}
      >
        a
      </text>
    </svg>
  );
}
