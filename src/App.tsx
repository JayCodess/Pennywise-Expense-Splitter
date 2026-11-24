import React from 'react';
import { ExpenseProvider } from './hooks/useExpenseStore';
import { Header } from './components/Header';
import { PeopleCard } from './components/PeopleCard';
import { AddExpenseCard } from './components/AddExpenseCard';
import { ExpensesCard } from './components/ExpensesCard';
import { Toast } from './components/Toast';
import { StormDrain } from './components/StormDrain';

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between p-3 sm:p-4 selection:bg-accent selection:text-white">
      <div>
        <Header />

        <main className="w-full max-w-xl mx-auto mt-4 space-y-4">
          {/* Order: People -> Add expense -> Expenses */}
          <PeopleCard />
          <AddExpenseCard />
          <ExpensesCard />
        </main>
      </div>

      <footer className="w-full max-w-xl mx-auto py-6 text-center text-xs text-text-muted flex flex-col items-center gap-2">
        <StormDrain size={28} />
        <p>Your data stays in your browser. Down in the drain, where nobody can find it.</p>
      </footer>

      {/* Floating Session Undo Toast */}
      <Toast />
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
