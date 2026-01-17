import React, { ReactNode } from 'react';

/**
 * Arcos Brand Section Components
 * 
 * Based on the Arcos Brand Guidelines layout templates:
 * - 3-element layout: Image + 2 boxes
 * - 2-element layout: Image + 1 box
 * - 1-element layout: Single box
 * 
 * Each box:
 * - Uses #232323 or #353535 background
 * - Uses white text (#ffffff)
 * - Has coherent padding (48-80px)
 * - Respects strong grid with equal margins
 */

interface ContentBoxProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

/**
 * Content Box - Dark background with white text
 */
export function ContentBox({ 
  children, 
  variant = 'primary',
  className = '' 
}: ContentBoxProps) {
  const bgColor = variant === 'primary' ? 'bg-[#232323]' : 'bg-[#353535]';
  
  return (
    <div 
      className={`
        ${bgColor} 
        text-white 
        p-8 sm:p-10 md:p-12 lg:p-16
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface ArcosSectionOneProps {
  /** Section label (small uppercase text) */
  label?: string;
  /** Main headline */
  headline: string;
  /** Sub-headline or description */
  subheadline?: string;
  /** Body content */
  body?: ReactNode;
  /** Call to action button */
  cta?: ReactNode;
  /** Background variant */
  variant?: 'primary' | 'secondary';
  /** Additional classes for the section */
  className?: string;
  /** ID for anchor links */
  id?: string;
}

/**
 * ArcosSectionOne - Single content box layout
 * Used for: Brand story, philosophy, text-heavy sections
 */
export function ArcosSectionOne({
  label,
  headline,
  subheadline,
  body,
  cta,
  variant = 'primary',
  className = '',
  id
}: ArcosSectionOneProps) {
  const bgColor = variant === 'primary' ? 'bg-[#232323]' : 'bg-[#353535]';
  
  return (
    <section 
      id={id}
      className={`${bgColor} text-white ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {label && (
            <p className="arcos-label text-white/60">{label}</p>
          )}
          
          <h2 className="arcos-heading-h2">{headline}</h2>
          
          {subheadline && (
            <p className="arcos-subheading text-white/80 max-w-2xl mx-auto">
              {subheadline}
            </p>
          )}
          
          {body && (
            <div className="arcos-body text-white/70 max-w-2xl mx-auto">
              {body}
            </div>
          )}
          
          {cta && (
            <div className="pt-4">{cta}</div>
          )}
        </div>
      </div>
    </section>
  );
}

interface ArcosSectionTwoProps {
  /** Section label (small uppercase text) */
  label?: string;
  /** Main headline */
  headline: string;
  /** Sub-headline or description */
  subheadline?: string;
  /** Body content */
  body?: ReactNode;
  /** Call to action button */
  cta?: ReactNode;
  /** Image URL */
  image: string;
  /** Image alt text */
  imageAlt: string;
  /** Image position */
  imagePosition?: 'left' | 'right';
  /** Background variant for content box */
  variant?: 'primary' | 'secondary';
  /** Additional classes */
  className?: string;
  /** ID for anchor links */
  id?: string;
}

/**
 * ArcosSectionTwo - Image + 1 content box layout
 * Used for: Product sections, feature highlights
 */
export function ArcosSectionTwo({
  label,
  headline,
  subheadline,
  body,
  cta,
  image,
  imageAlt,
  imagePosition = 'left',
  variant = 'primary',
  className = '',
  id
}: ArcosSectionTwoProps) {
  const bgColor = variant === 'primary' ? 'bg-[#232323]' : 'bg-[#353535]';
  
  const imageElement = (
    <div className="relative h-64 sm:h-80 md:h-96 lg:h-full min-h-[400px] overflow-hidden">
      <img 
        src={image} 
        alt={imageAlt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
  
  const contentElement = (
    <div className={`${bgColor} text-white p-8 sm:p-10 md:p-12 lg:p-16 flex flex-col justify-center`}>
      <div className="space-y-6 max-w-lg">
        {label && (
          <p className="arcos-label text-white/60">{label}</p>
        )}
        
        <h2 className="arcos-heading-h2">{headline}</h2>
        
        {subheadline && (
          <p className="arcos-subheading text-white/80">
            {subheadline}
          </p>
        )}
        
        {body && (
          <div className="arcos-body text-white/70">
            {body}
          </div>
        )}
        
        {cta && (
          <div className="pt-4">{cta}</div>
        )}
      </div>
    </div>
  );
  
  return (
    <section id={id} className={`${className}`}>
      <div className="grid lg:grid-cols-2">
        {imagePosition === 'left' ? (
          <>
            {imageElement}
            {contentElement}
          </>
        ) : (
          <>
            {contentElement}
            {imageElement}
          </>
        )}
      </div>
    </section>
  );
}

interface ArcosSectionThreeProps {
  /** Section label (small uppercase text) */
  label?: string;
  /** Main headline for first box */
  headline: string;
  /** Sub-headline or description for first box */
  subheadline?: string;
  /** Content for second box */
  secondaryContent: ReactNode;
  /** Image URL */
  image: string;
  /** Image alt text */
  imageAlt: string;
  /** Layout arrangement */
  layout?: 'image-left' | 'image-right' | 'image-top';
  /** ID for anchor links */
  id?: string;
  /** Additional classes */
  className?: string;
}

/**
 * ArcosSectionThree - Image + 2 content boxes layout
 * Used for: Hero sections, major feature presentations
 */
export function ArcosSectionThree({
  label,
  headline,
  subheadline,
  secondaryContent,
  image,
  imageAlt,
  layout = 'image-left',
  id,
  className = ''
}: ArcosSectionThreeProps) {
  
  if (layout === 'image-top') {
    return (
      <section id={id} className={className}>
        {/* Full-width image */}
        <div className="relative h-64 sm:h-80 md:h-[50vh] overflow-hidden">
          <img 
            src={image} 
            alt={imageAlt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#232323] to-transparent opacity-60" />
        </div>
        
        {/* Two boxes below */}
        <div className="grid md:grid-cols-2">
          <div className="bg-[#232323] text-white p-8 sm:p-10 md:p-12 lg:p-16">
            <div className="space-y-4">
              {label && (
                <p className="arcos-label text-white/60">{label}</p>
              )}
              <h2 className="arcos-heading-h2">{headline}</h2>
              {subheadline && (
                <p className="arcos-subheading text-white/80">{subheadline}</p>
              )}
            </div>
          </div>
          
          <div className="bg-[#353535] text-white p-8 sm:p-10 md:p-12 lg:p-16">
            {secondaryContent}
          </div>
        </div>
      </section>
    );
  }
  
  // image-left or image-right layout
  const isImageLeft = layout === 'image-left';
  
  return (
    <section id={id} className={className}>
      <div className="grid lg:grid-cols-2">
        {/* Image Column */}
        {isImageLeft && (
          <div className="relative h-64 sm:h-80 lg:h-auto min-h-[400px] lg:min-h-[600px] overflow-hidden">
            <img 
              src={image} 
              alt={imageAlt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        {/* Two stacked content boxes */}
        <div className="grid grid-rows-2">
          <div className="bg-[#232323] text-white p-8 sm:p-10 md:p-12 lg:p-16 flex items-center">
            <div className="space-y-4">
              {label && (
                <p className="arcos-label text-white/60">{label}</p>
              )}
              <h2 className="arcos-heading-h3">{headline}</h2>
              {subheadline && (
                <p className="arcos-subheading text-white/80">{subheadline}</p>
              )}
            </div>
          </div>
          
          <div className="bg-[#353535] text-white p-8 sm:p-10 md:p-12 lg:p-16 flex items-center">
            {secondaryContent}
          </div>
        </div>
        
        {/* Image on right */}
        {!isImageLeft && (
          <div className="relative h-64 sm:h-80 lg:h-auto min-h-[400px] lg:min-h-[600px] overflow-hidden">
            <img 
              src={image} 
              alt={imageAlt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * ArcosSectionHero - Full-bleed hero with overlaid content
 */
interface ArcosSectionHeroProps {
  /** Background image */
  image: string;
  /** Image alt text */
  imageAlt: string;
  /** Main headline */
  headline: string;
  /** Sub-headline */
  subheadline?: string;
  /** Optional label above headline */
  label?: string;
  /** Call to action buttons */
  cta?: ReactNode;
  /** Stats or metrics to display */
  stats?: Array<{ label: string; value: string }>;
  /** Additional classes */
  className?: string;
}

export function ArcosSectionHero({
  image,
  imageAlt,
  headline,
  subheadline,
  label,
  cta,
  stats,
  className = ''
}: ArcosSectionHeroProps) {
  return (
    <section className={`relative min-h-[90vh] flex items-center ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={image} 
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
        {/* Brand-compliant overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#232323] via-[#232323]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#232323] via-transparent to-[#232323]/50" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 md:py-32">
        <div className="max-w-3xl space-y-8">
          {label && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full">
              <span className="h-2 w-2 rounded-full bg-white/80 animate-pulse" />
              <span className="arcos-label text-white/80">{label}</span>
            </div>
          )}
          
          <h1 className="arcos-heading-hero text-white">{headline}</h1>
          
          {subheadline && (
            <p className="arcos-body-lg text-white/80 max-w-2xl">
              {subheadline}
            </p>
          )}
          
          {cta && (
            <div className="flex flex-wrap gap-4 pt-4">{cta}</div>
          )}
          
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl border border-white/15 bg-white/10">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="arcos-label text-white/60 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default {
  ContentBox,
  ArcosSectionOne,
  ArcosSectionTwo,
  ArcosSectionThree,
  ArcosSectionHero
};



