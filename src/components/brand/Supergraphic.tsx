import React from 'react';

/**
 * Arcos Supergraphic Component
 * 
 * Based on the Arcos Brand Guidelines:
 * - Derived from the horizontal cut of the letter "O"
 * - Creates a column/cluster of repeating semi-circle shapes
 * - Always monochrome: #353535 on #232323, or #232323 on white with low opacity
 * - Minimalist and architectural, not decorative
 */

interface SupergraphicProps {
  /** Number of shapes to render */
  count?: number;
  /** Size of each shape */
  size?: 'small' | 'medium' | 'large';
  /** Color variant */
  variant?: 'on-black' | 'on-white';
  /** Opacity level */
  opacity?: number;
  /** Orientation of the shapes */
  orientation?: 'vertical' | 'horizontal';
  /** Whether shapes should alternate rotation */
  alternating?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function Supergraphic({
  count = 5,
  size = 'medium',
  variant = 'on-black',
  opacity = 0.3,
  orientation = 'vertical',
  alternating = true,
  className = ''
}: SupergraphicProps) {
  // Size configurations
  const sizeConfig = {
    small: { width: 40, height: 20 },
    medium: { width: 80, height: 40 },
    large: { width: 120, height: 60 }
  };
  
  const { width, height } = sizeConfig[size];
  
  // Color based on variant
  const fillColor = variant === 'on-black' ? '#353535' : '#232323';
  
  // Gap between shapes
  const gap = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
  
  return (
    <div 
      className={`supergraphic ${className}`}
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        gap: gap,
        opacity: opacity
      }}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => {
        // Determine rotation: alternating creates visual interest
        const rotation = alternating ? (index % 2 === 0 ? 0 : 180) : 0;
        
        return (
          <svg
            key={index}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* The "cut O" shape - a semi-circle representing the horizontal slice of the O */}
            <path
              d={`M 0 ${height} A ${width/2} ${height} 0 0 1 ${width} ${height} L ${width} ${height} L 0 ${height} Z`}
              fill={fillColor}
            />
          </svg>
        );
      })}
    </div>
  );
}

/**
 * Supergraphic Background - Covers entire section
 * Places supergraphic as a subtle background element
 */
interface SupergraphicBackgroundProps {
  /** Position of the supergraphic */
  position?: 'left' | 'right' | 'center';
  /** Color variant */
  variant?: 'on-black' | 'on-white';
  /** Opacity level */
  opacity?: number;
  /** Children to render on top */
  children: React.ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
}

export function SupergraphicBackground({
  position = 'right',
  variant = 'on-black',
  opacity = 0.15,
  children,
  className = ''
}: SupergraphicBackgroundProps) {
  const positionStyles = {
    left: { left: 0, top: '50%', transform: 'translateY(-50%)' },
    right: { right: 0, top: '50%', transform: 'translateY(-50%)' },
    center: { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  };
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Supergraphic element */}
      <div 
        className="absolute pointer-events-none"
        style={positionStyles[position]}
      >
        <Supergraphic 
          count={8}
          size="large"
          variant={variant}
          opacity={opacity}
          orientation="vertical"
          alternating={true}
        />
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Decorative Supergraphic Strip
 * A horizontal strip of supergraphic shapes
 */
interface SupergraphicStripProps {
  /** Color variant */
  variant?: 'on-black' | 'on-white';
  /** Height of the strip */
  height?: number;
  /** Additional CSS classes */
  className?: string;
}

export function SupergraphicStrip({
  variant = 'on-black',
  height = 60,
  className = ''
}: SupergraphicStripProps) {
  const fillColor = variant === 'on-black' ? '#353535' : '#232323';
  
  return (
    <div 
      className={`w-full overflow-hidden ${className}`}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 400 ${height}`}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Repeating semi-circle pattern */}
        {Array.from({ length: 10 }).map((_, index) => {
          const x = index * 40;
          const isUp = index % 2 === 0;
          
          return (
            <path
              key={index}
              d={isUp 
                ? `M ${x} ${height} A 20 ${height/2} 0 0 1 ${x + 40} ${height} Z`
                : `M ${x} 0 A 20 ${height/2} 0 0 0 ${x + 40} 0 Z`
              }
              fill={fillColor}
              opacity={0.3}
            />
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Single O-cut shape for inline use
 */
interface OcutShapeProps {
  size?: number;
  rotation?: 0 | 90 | 180 | 270;
  variant?: 'on-black' | 'on-white';
  opacity?: number;
  className?: string;
}

export function OcutShape({
  size = 60,
  rotation = 0,
  variant = 'on-black',
  opacity = 0.4,
  className = ''
}: OcutShapeProps) {
  const fillColor = variant === 'on-black' ? '#353535' : '#232323';
  const halfSize = size / 2;
  
  return (
    <svg
      width={size}
      height={halfSize}
      viewBox={`0 0 ${size} ${halfSize}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ 
        transform: `rotate(${rotation}deg)`,
        opacity 
      }}
      aria-hidden="true"
    >
      <path
        d={`M 0 ${halfSize} A ${halfSize} ${halfSize} 0 0 1 ${size} ${halfSize} Z`}
        fill={fillColor}
      />
    </svg>
  );
}

export default Supergraphic;
