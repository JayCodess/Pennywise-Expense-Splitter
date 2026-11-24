import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from '../App';

describe('Step 3 Input UI Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  it('allows adding people and displays duplicate name error', async () => {
    const user = userEvent.setup();
    render(<App />);

    const nameInput = screen.getByPlaceholderText("Who's joining the carnival?");
    const addBtn = screen.getByRole('button', { name: '+ Add' });

    // Add Anna
    await user.type(nameInput, 'Anna');
    await user.click(addBtn);

    const peopleList = screen.getByRole('list', { name: 'People in group' });
    expect(within(peopleList).getByText('Anna')).toBeInTheDocument();

    // Try adding duplicate "anna" (case-insensitive)
    await user.type(nameInput, 'anna');
    await user.click(addBtn);
    expect(screen.getByText(/"anna" is already at the carnival\./i)).toBeInTheDocument();

    // Add Ben
    await user.clear(nameInput);
    await user.type(nameInput, 'Ben{Enter}');
    expect(within(peopleList).getByText('Ben')).toBeInTheDocument();
  });

  it('shows inline confirmation when removing a person who is part of an expense', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Load example troupe (Anna, Ben, Chris)
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    const peopleList = screen.getByRole('list', { name: 'People in group' });
    expect(within(peopleList).getByText('Anna')).toBeInTheDocument();
    expect(within(peopleList).getByText('Ben')).toBeInTheDocument();

    // Try removing Ben (who is in expenses)
    const removeBenBtn = screen.getByRole('button', { name: 'Remove Ben' });
    await user.click(removeBenBtn);

    // Confirmation alertdialog should be visible
    const alertdialog = screen.getByRole('alertdialog');
    expect(alertdialog).toBeInTheDocument();
    expect(screen.getByText(/Banish Ben\?/i)).toBeInTheDocument();

    // Press Escape to cancel
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(within(peopleList).getByText('Ben')).toBeInTheDocument();

    // Click remove again and confirm
    await user.click(removeBenBtn);
    const confirmBtn = screen.getByRole('button', { name: 'Banish Ben' });
    await user.click(confirmBtn);

    // Ben is removed from people list
    expect(within(peopleList).queryByText('Ben')).not.toBeInTheDocument();
  });

  it('handles stale payer after removal by falling back to the first remaining person', async () => {
    const user = userEvent.setup();
    render(<App />);

    const nameInput = screen.getByPlaceholderText("Who's joining the carnival?");
    // Add 3 people so when 1 is removed, >=2 remain and form stays visible
    await user.type(nameInput, 'Anna{Enter}');
    await user.type(nameInput, 'Ben{Enter}');
    await user.type(nameInput, 'Chris{Enter}');

    // Anna is default payer
    const annaRadio = screen.getByRole('radio', { name: 'Anna' });
    const benRadio = screen.getByRole('radio', { name: 'Ben' });
    expect(annaRadio).toHaveAttribute('aria-checked', 'true');

    // Switch payer to Ben
    await user.click(benRadio);
    expect(benRadio).toHaveAttribute('aria-checked', 'true');

    // Remove Ben (not in any expense yet, removes immediately)
    const removeBenBtn = screen.getByRole('button', { name: 'Remove Ben' });
    await user.click(removeBenBtn);

    // Payer must fall back to Anna without stale ID
    const updatedAnnaRadio = screen.getByRole('radio', { name: 'Anna' });
    expect(updatedAnnaRadio).toHaveAttribute('aria-checked', 'true');
  });

  it('validates amount input on blur/submit and adds an expense with form reset', async () => {
    const user = userEvent.setup();
    render(<App />);

    const nameInput = screen.getByPlaceholderText("Who's joining the carnival?");
    await user.type(nameInput, 'Anna{Enter}');
    await user.type(nameInput, 'Ben{Enter}');

    const descInput = screen.getByPlaceholderText('e.g. Carnival tickets, cotton candy');
    const amountInput = screen.getByPlaceholderText('0.00');
    const addExpenseBtn = screen.getByRole('button', { name: 'Add to the tab' });

    // Type invalid amount and blur
    await user.type(amountInput, 'invalid');
    await user.tab();
    expect(screen.getByText(/Enter a valid amount > 0/i)).toBeInTheDocument();

    // Type valid description and valid amount
    await user.type(descInput, 'Haunted House Tickets');
    await user.clear(amountInput);
    await user.type(amountInput, '45.50');

    // Submit
    await user.click(addExpenseBtn);

    // Expense is added to list
    const expensesList = screen.getByRole('list', { name: 'Expenses list' });
    expect(within(expensesList).getByText('Haunted House Tickets')).toBeInTheDocument();
    expect(within(expensesList).getByText('$45.50')).toBeInTheDocument();

    // Form description and amount are cleared, description field refocused
    expect(descInput).toHaveValue('');
    expect(amountInput).toHaveValue('');
    expect(descInput).toHaveFocus();
  });

  it('supports inline editing, prefilling plain amount, and cancels with Escape', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Load example troupe
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    // Find edit button for Apartment ($300.00)
    const editAptBtn = screen.getByRole('button', { name: 'Edit Apartment' });
    await user.click(editAptBtn);

    // Edit input should be prefilled with plain editable string "300.00"
    const editAmountInput = screen.getByDisplayValue('300.00');
    expect(editAmountInput).toBeInTheDocument();

    // Press Escape to cancel edit
    await user.keyboard('{Escape}');
    expect(screen.queryByDisplayValue('300.00')).not.toBeInTheDocument();

    // The newly remounted Edit button receives focus
    await waitFor(() => {
      const remountedEditBtn = screen.getByRole('button', { name: 'Edit Apartment' });
      expect(remountedEditBtn).toHaveFocus();
    });

    // Open edit again, change description, and save
    const currentEditBtn = screen.getByRole('button', { name: 'Edit Apartment' });
    await user.click(currentEditBtn);
    const editDescInput = screen.getByDisplayValue('Apartment');
    await user.clear(editDescInput);
    await user.type(editDescInput, 'Creepy Mansion Rental');

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    await user.click(saveBtn);

    const expensesList = screen.getByRole('list', { name: 'Expenses list' });
    expect(within(expensesList).getByText('Creepy Mansion Rental')).toBeInTheDocument();
  });

  it('deletes an expense and restores it via the Undo toast', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Load example troupe
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    const expensesList = screen.getByRole('list', { name: 'Expenses list' });
    expect(within(expensesList).getByText('Museum')).toBeInTheDocument();

    // Delete Museum
    const deleteMuseumBtn = screen.getByRole('button', { name: 'Delete Museum' });
    await user.click(deleteMuseumBtn);

    // Museum gone from list
    expect(within(expensesList).queryByText('Museum')).not.toBeInTheDocument();

    // Undo toast appears with role="status"
    const toast = screen.getByRole('status');
    expect(toast).toBeInTheDocument();
    expect(screen.getByText(/Deleted “Museum”/i)).toBeInTheDocument();

    // Click Undo
    const undoBtn = screen.getByRole('button', { name: 'Undo' });
    await user.click(undoBtn);

    // Museum is restored
    await waitFor(() => {
      expect(within(expensesList).getByText('Museum')).toBeInTheDocument();
    });
  });

  it('updates amounts immediately when switching global currency', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Load example troupe
    const loadExampleBtn = screen.getByRole('button', { name: /load example troupe/i });
    await user.click(loadExampleBtn);

    // Total tab starts in USD: $474.00
    expect(screen.getByTestId('total-spent')).toHaveTextContent('$474.00');

    // Switch currency to EUR
    const currencySelect = screen.getByTitle('Session Currency');
    await user.selectOptions(currencySelect, 'EUR');

    // Total updates to EUR
    expect(screen.getByTestId('total-spent')).toHaveTextContent('€474.00');
  });
});
