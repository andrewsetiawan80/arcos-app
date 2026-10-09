import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArcosLogo, { ArcosLogoMark } from '../components/ArcosLogo';

describe('ArcosLogo', () => {
  it('renders the logo SVG', () => {
    render(<ArcosLogo />);
    const svg = screen.getByRole('img', { name: /arcos/i });
    expect(svg).toBeInTheDocument();
  });

  it('renders with small size', () => {
    render(<ArcosLogo size="small" />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('height', '20');
  });

  it('renders with medium size (default)', () => {
    render(<ArcosLogo />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('height', '28');
  });

  it('renders with large size', () => {
    render(<ArcosLogo size="large" />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('height', '40');
  });

  it('renders tagline when withTagline is true', () => {
    render(<ArcosLogo withTagline />);
    expect(screen.getByText('Architectural Concrete Solutions')).toBeInTheDocument();
  });

  it('does not render tagline by default', () => {
    render(<ArcosLogo />);
    expect(screen.queryByText('Architectural Concrete Solutions')).not.toBeInTheDocument();
  });
});

describe('ArcosLogoMark', () => {
  it('renders the mark SVG', () => {
    render(<ArcosLogoMark />);
    const svg = screen.getByRole('img', { name: /arcos/i });
    expect(svg).toBeInTheDocument();
  });
});
