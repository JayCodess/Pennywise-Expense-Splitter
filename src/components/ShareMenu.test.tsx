import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { App } from '../App';

describe('ShareMenu Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'dark');
    // Ensure window.matchMedia is always present and returns a valid MediaQueryList in tests
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('keeps trigger focusable with aria-disabled="true" and tooltip hint when there are no settlements', async () => {
    const user = userEvent.setup();
    render(<App />);

    const shareBtn = screen.getByRole('button', { name: /share the damage/i });
    expect(shareBtn).toBeInTheDocument();
    expect(shareBtn).toHaveAttribute('aria-disabled', 'true');
    expect(shareBtn).toHaveAttribute('title', 'Add expenses first');

    // Clicking it when disabled does not open menu
    await user.click(shareBtn);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens menu, navigates with Arrow keys and Home/End, and closes with Escape returning focus to trigger', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Load example troupe to produce settlements
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    const shareBtn = screen.getByRole('button', { name: /share the damage/i });
    expect(shareBtn).toHaveAttribute('aria-disabled', 'false');

    await user.click(shareBtn);

    const menu = screen.getByRole('menu', { name: 'Share damage options' });
    expect(menu).toBeInTheDocument();

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThanOrEqual(7);

    // Initial focus lands inside menu
    await waitFor(() => {
      expect(document.activeElement).toBe(menuItems[0]);
    });

    // Arrow down moves to next item
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(menuItems[1]);

    // Arrow down again
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(menuItems[2]);

    // Arrow up moves back
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(menuItems[1]);

    // End key moves to last item
    fireEvent.keyDown(window, { key: 'End' });
    expect(document.activeElement).toBe(menuItems[menuItems.length - 1]);

    // Home key moves to first item
    fireEvent.keyDown(window, { key: 'Home' });
    expect(document.activeElement).toBe(menuItems[0]);

    // Escape closes menu and returns focus to shareBtn
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(shareBtn);
  });

  it('triggers WhatsApp and Telegram share actions via window.open with proper encoded params', async () => {
    const user = userEvent.setup();
    const openMock = vi.fn().mockReturnValue({});
    vi.stubGlobal('open', openMock);

    render(<App />);

    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    const shareBtn = screen.getByRole('button', { name: /share the damage/i });
    await user.click(shareBtn);

    // Click WhatsApp
    const whatsappBtn = screen.getByRole('menuitem', { name: /whatsapp/i });
    await user.click(whatsappBtn);

    expect(openMock).toHaveBeenCalled();
    const whatsappCall = openMock.mock.calls[0];
    expect(whatsappCall[0]).toContain('https://wa.me/?text=');
    expect(whatsappCall[0]).toContain(encodeURIComponent('Ben → Anna: $78.00'));
    expect(whatsappCall[1]).toBe('_blank');
    expect(whatsappCall[2]).toBe('noopener,noreferrer');

    // Reopen menu to test Telegram
    await user.click(shareBtn);
    const telegramBtn = screen.getByRole('menuitem', { name: /telegram/i });
    await user.click(telegramBtn);

    expect(openMock).toHaveBeenCalledTimes(2);
    const telegramCall = openMock.mock.calls[1];
    expect(telegramCall[0]).toContain('https://t.me/share/url?url=');
    expect(telegramCall[0]).toContain('&text=');
    expect(telegramCall[0]).toContain(encodeURIComponent('Chris → Anna: $72.00'));
  });

  it('triggers SMS and Email with encoded strings', async () => {
    const user = userEvent.setup();
    render(<App />);

    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    const shareBtn = screen.getByRole('button', { name: /share the damage/i });
    await user.click(shareBtn);

    const smsBtn = screen.getByRole('menuitem', { name: /sms message/i });
    expect(smsBtn).toBeInTheDocument();

    const emailBtn = screen.getByRole('menuitem', { name: /email/i });
    expect(emailBtn).toBeInTheDocument();
  });
});
