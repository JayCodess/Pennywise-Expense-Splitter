import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from '../App';
import { encodeShareableLink } from '../lib/linkCodec';

describe('Shareable Link & Safe Hash Import Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'dark');
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('generates shareable link and copies it to clipboard with warning hint', async () => {
    const user = userEvent.setup();

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(<App />);

    // Load example troupe
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    // Open share menu
    const shareBtn = screen.getByRole('button', { name: /share the damage/i });
    await user.click(shareBtn);

    // Verify Copy Link item has privacy warning hint
    expect(
      screen.getByText('Anyone with the link can see the names and amounts.')
    ).toBeInTheDocument();

    const copyLinkBtn = screen.getByRole('menuitem', { name: /copy shareable link/i });
    await user.click(copyLinkBtn);

    expect(writeTextMock).toHaveBeenCalled();
    const copiedUrl = writeTextMock.mock.calls[0][0];
    expect(copiedUrl).toContain('/#d=1.');

    // Toast confirmation
    expect(screen.getByText('Link copied')).toBeInTheDocument();
  });

  it('enters read-only view mode on startup when URL has #d=... without overwriting localStorage', async () => {
    const user = userEvent.setup();

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    // Pre-save some existing data in localStorage
    localStorage.setItem(
      'pennywise_data_v1',
      JSON.stringify({
        people: [{ id: 'saved_1', name: 'Original User' }],
        expenses: [],
        currency: 'USD',
      })
    );

    // Prepare a trip to share
    const sharedData = {
      people: [
        { id: 'u1', name: 'Sherlock' },
        { id: 'u2', name: 'Watson' },
      ],
      expenses: [
        {
          id: 'ex1',
          description: 'Baker St Rent',
          amountMinor: 22000,
          paidBy: 'u1',
          participants: ['u1', 'u2'],
        },
      ],
      currency: 'GBP',
    };

    const { url } = await encodeShareableLink(sharedData);
    const hash = url.split('#')[1];
    window.location.hash = `#${hash}`;

    render(<App />);

    // Shared banner appears in view mode
    await waitFor(() => {
      expect(
        screen.getByText(/You're viewing a shared trip \(2 people, 1 expense\)\./i)
      ).toBeInTheDocument();
    });

    // Displays shared trip data in the UI
    expect(screen.getAllByText('Sherlock').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Watson').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Baker St Rent')).toBeInTheDocument();

    // Verify localStorage was NOT overwritten while in view mode
    const stored = JSON.parse(localStorage.getItem('pennywise_data_v1') || '{}');
    expect(stored.people[0].name).toBe('Original User');

    // Clicking "Exit" returns to saved data and clears the hash
    const exitBtn = screen.getByRole('button', { name: 'Exit' });
    await user.click(exitBtn);

    expect(screen.queryByText(/You're viewing a shared trip/i)).not.toBeInTheDocument();
    expect(screen.getByText('Original User')).toBeInTheDocument();
    expect(screen.queryByText('Sherlock')).not.toBeInTheDocument();
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', expect.stringMatching(/^\//));
  });

  it('handles hashchange event dynamically to enter view mode', async () => {
    render(<App />);

    // Initially no banner
    expect(screen.queryByText(/You're viewing a shared trip/i)).not.toBeInTheDocument();

    const sharedData = {
      people: [
        { id: 'h1', name: 'Mina Harker' },
        { id: 'h2', name: 'Jonathan' },
      ],
      expenses: [
        {
          id: 'hex1',
          description: 'Train to Munich',
          amountMinor: 5000,
          paidBy: 'h1',
          participants: ['h1', 'h2'],
        },
      ],
      currency: 'EUR',
    };

    const { url } = await encodeShareableLink(sharedData);
    const hash = url.split('#')[1];

    // Trigger hashchange event
    await act(async () => {
      window.location.hash = `#${hash}`;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    await waitFor(() => {
      expect(screen.getByText(/You're viewing a shared trip/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText('Mina Harker').length).toBeGreaterThanOrEqual(1);
  });

  it('supports importing shared trip with confirmation when existing data is present, clearing hash', async () => {
    const user = userEvent.setup();
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    // Load example troupe first
    render(<App />);
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    const sharedData = {
      people: [
        { id: 'p_a', name: 'Dracula' },
        { id: 'p_b', name: 'Van Helsing' },
      ],
      expenses: [
        {
          id: 'ex_castle',
          description: 'Castle Stake Purchase',
          amountMinor: 8500,
          paidBy: 'p_b',
          participants: ['p_a', 'p_b'],
        },
      ],
      currency: 'EUR',
    };

    const { url } = await encodeShareableLink(sharedData);
    const hash = url.split('#')[1];

    await act(async () => {
      window.location.hash = `#${hash}`;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    await waitFor(() => {
      expect(screen.getByText(/You're viewing a shared trip/i)).toBeInTheDocument();
    });

    const importBtn = screen.getByRole('button', { name: 'Import' });
    await user.click(importBtn);

    // Shows confirmation prompt because user has current data
    expect(screen.getByText('Replace your current expenses?')).toBeInTheDocument();

    const yesReplaceBtn = screen.getByRole('button', { name: 'Yes, replace' });
    await user.click(yesReplaceBtn);

    // Data is now imported into store and saved to localStorage
    expect(screen.getAllByText('Dracula').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Van Helsing').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/You're viewing a shared trip/i)).not.toBeInTheDocument();

    // Verify localStorage now holds Dracula
    const stored = JSON.parse(localStorage.getItem('pennywise_data_v1') || '{}');
    expect(stored.people.some((p: { name: string }) => p.name === 'Dracula')).toBe(true);

    // Hash is cleared
    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it('displays friendly error banner for corrupted hash and clears on dismiss', async () => {
    const user = userEvent.setup();
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    window.location.hash = '#d=1.cInvalidCorruptedHash!!!';

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Could not load shared link')).toBeInTheDocument();
    });

    const dismissBtn = screen.getByRole('button', { name: 'Dismiss' });
    await user.click(dismissBtn);

    expect(screen.queryByText('Could not load shared link')).not.toBeInTheDocument();
    expect(replaceStateSpy).toHaveBeenCalled();
  });
});
