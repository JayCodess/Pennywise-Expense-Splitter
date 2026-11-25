import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from '../App';

describe('Step 4 Results UI Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  it('displays empty state before people and expenses are added', () => {
    render(<App />);
    expect(
      screen.getByText('Add people and expenses to see who owes whom.')
    ).toBeInTheDocument();
  });

  it('displays exact Step 1 Test 1 settlements for Anna, Ben, and Chris', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Load example troupe (Anna, Ben, Chris)
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    // Verify exact settlements: "Ben owes Anna $78.00" and "Chris owes Anna $72.00"
    const settlementsList = screen.getByRole('list', { name: 'Settlement payments' });
    expect(settlementsList).toBeInTheDocument();

    expect(settlementsList).toHaveTextContent(/Ben owes Anna/);
    expect(settlementsList).toHaveTextContent('$78.00');
    expect(settlementsList).toHaveTextContent(/Chris owes Anna/);
    expect(settlementsList).toHaveTextContent('$72.00');

    // Verify balances list
    const balancesList = screen.getByRole('list', { name: 'Individual balances' });
    expect(balancesList).toBeInTheDocument();
    expect(balancesList).toHaveTextContent('+$150.00');
    expect(balancesList).toHaveTextContent('-$78.00');
    expect(balancesList).toHaveTextContent('-$72.00');
  });

  it('opens share menu and copies plain text summary with temporary confirmation', async () => {
    const user = userEvent.setup();

    // Mock navigator.clipboard with Object.defineProperty
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    render(<App />);

    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    const shareBtn = screen.getByRole('button', { name: /share the damage/i });
    await user.click(shareBtn);

    // Verify share menu opened
    const copyOption = screen.getByRole('menuitem', { name: /copy text summary/i });
    expect(copyOption).toBeInTheDocument();

    await user.click(copyOption);

    // Verify clipboard was called with formatted text
    expect(writeTextMock).toHaveBeenCalled();
    const copiedText = writeTextMock.mock.calls[0][0];
    expect(copiedText).toContain('🎈 Pennywise:');
    expect(copiedText).toContain('Total spent: $474.00');
    expect(copiedText).toContain('Ben → Anna: $78.00');
    expect(copiedText).toContain('Chris → Anna: $72.00');

    // Toast message appears
    expect(screen.getByText(/Copied… they'll see it\./i)).toBeInTheDocument();
  });

  it('renders collapsible How is this calculated section with formula', async () => {
    const user = userEvent.setup();
    render(<App />);

    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    expect(screen.getByText('How is this calculated?')).toBeInTheDocument();
    expect(screen.getByText('Balance = total paid − own share')).toBeInTheDocument();
  });

  it('shows confirmation when clicking Banish everything and clears expenses when confirmed', async () => {
    const user = userEvent.setup();
    render(<App />);

    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    const banishBtn = screen.getByRole('button', { name: 'Banish everything' });
    await user.click(banishBtn);

    expect(
      screen.getByText('This will make everything disappear. Sure?')
    ).toBeInTheDocument();

    // Click confirm
    const yesBanishBtn = screen.getByRole('button', { name: 'Yes, banish' });
    await user.click(yesBanishBtn);

    // State is cleared
    expect(
      screen.getByText('Add people and expenses to see who owes whom.')
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nobody's down here yet… how lonely.")
    ).toBeInTheDocument();
  });
});
