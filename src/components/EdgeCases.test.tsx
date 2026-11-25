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

    const veryLongName = 'Ringmaster Bartholomew Montgomery III of Carnival Woods';
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
    const addExpenseBtn = screen.getByRole('button', { name: 'Add expense' });

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
    const addExpenseBtn = screen.getByRole('button', { name: 'Add expense' });

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

  it('guarantees each card has exactly one clipped 18px blood layer and content is layered above it', () => {
    render(<App />);

    const bloodLayers = screen.getAllByTestId('card-blood-layer');
    // Exactly 4 main cards: People, Add Expense, Expenses, Results
    expect(bloodLayers).toHaveLength(4);

    bloodLayers.forEach((layer) => {
      expect(layer).toHaveClass('absolute');
      expect(layer).toHaveClass('top-0');
      expect(layer).toHaveClass('left-0');
      expect(layer).toHaveClass('right-0');
      expect(layer).toHaveClass('h-[18px]');
      expect(layer).toHaveClass('overflow-hidden');
      expect(layer).toHaveClass('pointer-events-none');
      expect(layer).toHaveClass('z-0');

      // The SVG inside should be the CardTopBlood
      const svg = layer.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox', '0 0 600 18');
    });

    // Content container sibling inside cards has relative z-10
    bloodLayers.forEach((layer) => {
      const parent = layer.parentElement;
      expect(parent).toBeInTheDocument();
      // Parent card has pt-8 sm:pt-9
      expect(parent?.className).toMatch(/pt-8 sm:pt-9/);

      const content = parent?.querySelector('.relative.z-10');
      expect(content).toBeInTheDocument();
    });
  });

  it('sets maxLength on name (60) and description (120) inputs', async () => {
    const user = userEvent.setup();
    render(<App />);

    const personInput = screen.getByPlaceholderText("Who's joining the carnival?");
    expect(personInput).toHaveAttribute('maxLength', '60');

    // Load example troupe so add expense form is visible
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    const descInput = screen.getByPlaceholderText('e.g. Carnival tickets, cotton candy');
    expect(descInput).toHaveAttribute('maxLength', '120');
  });

  it('enforces 50 people limit in UI with friendly inline message', async () => {
    const user = userEvent.setup();

    // Populate localStorage with 50 people
    const people50 = Array.from({ length: 50 }, (_, i) => ({
      id: `p_${i + 1}`,
      name: `Troupe Member ${i + 1}`,
    }));
    localStorage.setItem(
      'pennywise_data_v1',
      JSON.stringify({
        people: people50,
        expenses: [],
        currency: 'USD',
      })
    );

    render(<App />);

    const personInput = screen.getByPlaceholderText("Who's joining the carnival?");
    const addBtn = screen.getByRole('button', { name: '+ Add' });

    await user.type(personInput, 'Extra Member 51');
    await user.click(addBtn);

    expect(screen.getByText("That's the limit for one trip: 50 people.")).toBeInTheDocument();
  });

  it('enforces 500 expenses limit in UI with friendly inline message', async () => {
    const user = userEvent.setup();

    const peopleList = [
      { id: 'p1', name: 'Anna' },
      { id: 'p2', name: 'Ben' },
    ];
    const expenses500 = Array.from({ length: 500 }, (_, i) => ({
      id: `e_${i + 1}`,
      description: `Expense ${i + 1}`,
      amountMinor: 1000,
      paidBy: 'p1',
      participants: ['p1', 'p2'],
    }));

    localStorage.setItem(
      'pennywise_data_v1',
      JSON.stringify({
        people: peopleList,
        expenses: expenses500,
        currency: 'USD',
      })
    );

    render(<App />);

    const descInput = screen.getByPlaceholderText('e.g. Carnival tickets, cotton candy');
    const amountInput = screen.getByPlaceholderText('0.00');
    const addExpenseBtn = screen.getByRole('button', { name: 'Add expense' });

    await user.type(descInput, 'Expense 501');
    await user.type(amountInput, '25.00');
    await user.click(addExpenseBtn);

    expect(screen.getByText("That's the limit for one trip: 500 expenses.")).toBeInTheDocument();
  });
});
