import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from '../App';

describe('Step 5 Edge Cases & Accessibility Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  it('handles 20+ people and wraps chips cleanly', async () => {
    const user = userEvent.setup();
    render(<App />);

    const nameInput = screen.getByPlaceholderText("Who's joining the carnival?");
    const addBtn = screen.getByRole('button', { name: '+ Add' });

    // Add 20 people quickly with fireEvent
    for (let i = 1; i <= 20; i++) {
      fireEvent.change(nameInput, { target: { value: `Troupe Member ${i}` } });
      await user.click(addBtn);
    }

    const peopleList = screen.getByRole('list', { name: 'People in group' });
    expect(peopleList.children).toHaveLength(20);
    expect(within(peopleList).getByText('Troupe Member 1')).toBeInTheDocument();
    expect(within(peopleList).getByText('Troupe Member 20')).toBeInTheDocument();
  });

  it('truncates extremely long names and descriptions with title attribute', async () => {
    const user = userEvent.setup();
    render(<App />);

    const nameInput = screen.getByPlaceholderText("Who's joining the carnival?");
    const addBtn = screen.getByRole('button', { name: '+ Add' });

    const veryLongName = 'The Great and Horrifying Ringmaster Bartholomew Montgomery III of the Old Carnival';
    fireEvent.change(nameInput, { target: { value: veryLongName } });
    await user.click(addBtn);

    // Verify element with title attribute
    const personSpan = screen.getByTitle(veryLongName);
    expect(personSpan).toBeInTheDocument();
    expect(personSpan).toHaveClass('truncate');

    // Add another person to allow expense entry
    fireEvent.change(nameInput, { target: { value: 'Ben' } });
    await user.click(addBtn);

    // Add an expense with a very long description
    const descInput = screen.getByPlaceholderText('e.g. Carnival tickets, cotton candy');
    const amountInput = screen.getByPlaceholderText('0.00');
    const addExpenseBtn = screen.getByRole('button', { name: 'Add to the tab' });

    const veryLongDesc = 'Super Deluxe VIP Carnival Night Pass with Mystery Spooky Maze Tour and Unlimited Popcorn';
    fireEvent.change(descInput, { target: { value: veryLongDesc } });
    fireEvent.change(amountInput, { target: { value: '150.00' } });
    await user.click(addExpenseBtn);

    const descHeading = screen.getByTitle(veryLongDesc);
    expect(descHeading).toBeInTheDocument();
    expect(descHeading).toHaveClass('truncate');
  });

  it('formats huge amounts properly and safely', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Load example troupe
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    const descInput = screen.getByPlaceholderText('e.g. Carnival tickets, cotton candy');
    const amountInput = screen.getByPlaceholderText('0.00');
    const addExpenseBtn = screen.getByRole('button', { name: 'Add to the tab' });

    // Add a huge expense of 5 million dollars
    fireEvent.change(descInput, { target: { value: 'Haunted Carnival Ground Purchase' } });
    fireEvent.change(amountInput, { target: { value: '5,000,000.00' } });
    await user.click(addExpenseBtn);

    const amounts = screen.getAllByText('$5,000,000.00');
    expect(amounts.length).toBeGreaterThan(0);
  });

  it('switches currency without converting numeric value (reformat only)', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Load example troupe: total spent is $474.00
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    expect(screen.getByTestId('total-spent')).toHaveTextContent('$474.00');

    // Switch to GBP
    const currencySelect = screen.getByTitle('Session Currency');
    await user.selectOptions(currencySelect, 'GBP');

    // Re-formatted to £474.00 (same value 474.00, no conversion)
    expect(screen.getByTestId('total-spent')).toHaveTextContent('£474.00');

    // Switch to INR
    await user.selectOptions(currencySelect, 'INR');
    expect(screen.getByTestId('total-spent')).toHaveTextContent(/₹474\.00/);
  });

  it('updates concise aria-live summary line as settlements change', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Initial empty state summary
    const summaryLine = screen.getByText('Waiting for people and expenses');
    expect(summaryLine).toHaveAttribute('aria-live', 'polite');

    // Load example (2 payments: Ben owes Anna $78.00 and Chris owes Anna $72.00)
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    expect(screen.getByText('2 payments to settle up')).toHaveAttribute('aria-live', 'polite');
  });
});
