import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Header } from './Header';

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  it('renders title and creepy carnival tagline', () => {
    render(<Header />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Pennywise');
    expect(screen.getByText('Everyone pays in the end.')).toBeInTheDocument();
  });

  it('renders the clown mascot and red balloon SVGs', () => {
    render(<Header />);
    expect(screen.getByRole('img', { name: 'Creepy clown mascot' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Floating red balloon' })).toBeInTheDocument();
  });

  it('toggles theme between dark and light modes with correct data-theme attribute', () => {
    render(<Header />);
    const toggleBtn = screen.getByRole('button', { name: /switch to light parchment theme/i });
    expect(toggleBtn).toBeInTheDocument();

    // Click to switch to light
    fireEvent.click(toggleBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Button label updates to switch back to dark
    const darkBtn = screen.getByRole('button', { name: /switch to dark carnival theme/i });
    expect(darkBtn).toBeInTheDocument();

    // Click to switch back to dark
    fireEvent.click(darkBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
