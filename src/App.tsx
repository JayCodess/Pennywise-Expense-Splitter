import React from 'react';
import { ExpenseProvider, useExpenseStore } from './hooks/useExpenseStore';
import { Header } from './components/Header';
import { PeopleCard } from './components/PeopleCard';
import { AddExpenseCard } from './components/AddExpenseCard';
import { ExpensesCard } from './components/ExpensesCard';
import { ResultsCard } from './components/ResultsCard';
import { ResultsScrollPill } from './components/ResultsScrollPill';
import { Toast } from './components/Toast';
import { StormDrain } from './components/StormDrain';

export const AppContent: React.FC = () => {
  const { settlements, totalSpentMinor } = useExpenseStore();

  // Theme Spec: clown's eyes brighten slightly when the total owed is large (>= $100)
  const isLargeTotal = totalSpentMinor >= 10000 || settlements.some((s) => s.amountMinor >= 5000);

  return (
    <div className="min-h-screen flex flex-col justify-between p-3 sm:p-4 selection:bg-accent selection:text-white">
      <div>
        <Header glowMascot={isLargeTotal} />

        {/* Responsive Grid: Single column on mobile, 2 columns on desktop (>=1024px) */}
        <main className="w-full max-w-xl lg:max-w-5xl mx-auto mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column: Inputs (People -> Add expense -> Expenses) */}
            <div className="lg:col-span-7 space-y-4">
              <PeopleCard />
              <AddExpenseCard />
              <ExpensesCard />
            </div>

            {/* Right Column: Results ("Who pays whom") - sticky on desktop */}
            <div className="lg:col-span-5 lg:sticky lg:top-6">
              <ResultsCard />
            </div>
          </div>
        </main>
      </div>

      <footer className="w-full max-w-xl lg:max-w-5xl mx-auto py-8 text-center text-xs text-text-muted flex flex-col items-center gap-2">
        <StormDrain size={28} />
        <p>Your data stays in your browser. Down in the drain, where nobody can find it.</p>
      </footer>

      {/* Floating Session Undo Toast & Mobile Results Scroll Pill */}
      <Toast />
      <ResultsScrollPill />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
};

export default App;
