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
  const { settlements } = useExpenseStore();

  // Currency-neutral mascot glow: clown's eyes brighten when multiple settlements are pending
  const shouldGlowMascot = settlements.length >= 2;

  return (
    <div className="min-h-screen flex flex-col justify-between p-3 sm:p-4 selection:bg-accent selection:text-white">
      <div>
        <Header glowMascot={shouldGlowMascot} />

        {/* Responsive Grid: Single column on mobile, 2 columns on desktop (>=1024px) */}
        <main className="w-full max-w-xl lg:max-w-5xl mx-auto mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column: Inputs (People -> Add expense -> Expenses) */}
            <div className="lg:col-span-7 space-y-4">
              <PeopleCard />
              <AddExpenseCard />
              <ExpensesCard />
            </div>

            {/* Right Column: Sticky Results with internal scrolling if taller than viewport */}
            <div className="lg:col-span-5 lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-0.5 rounded-card">
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
