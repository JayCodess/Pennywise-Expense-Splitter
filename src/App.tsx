import React, { useState, useEffect, useRef } from 'react';
import { ExpenseProvider, useExpenseStore } from './hooks/useExpenseStore';
import { ToastProvider } from './hooks/useToast';
import { Header } from './components/Header';
import { PeopleCard } from './components/PeopleCard';
import { AddExpenseCard } from './components/AddExpenseCard';
import { ExpensesCard } from './components/ExpensesCard';
import { ResultsCard } from './components/ResultsCard';
import { ResultsScrollPill } from './components/ResultsScrollPill';
import { Toast } from './components/Toast';
import { StormDrain } from './components/StormDrain';
import { BloodDefs } from './components/decor/BloodDefs';
import { ViewportBloodLip } from './components/decor/ViewportBloodLip';
import { CornerSplatter } from './components/decor/CornerSplatter';
import { FloatingBalloons } from './components/decor/FloatingBalloons';
import { FogAndNoise } from './components/decor/FogAndNoise';
import { FooterBalloonBundle } from './components/decor/FooterBalloonBundle';
import { GutterEyes } from './components/decor/GutterEyes';
import { ClawScratches } from './components/decor/ClawScratches';

export const AppContent: React.FC = () => {
  const { people, expenses, settlements } = useExpenseStore();
  const [grinWiden, setGrinWiden] = useState(false);
  const prevPeopleCount = useRef(people.length);
  const prevExpensesCount = useRef(expenses.length);

  // Briefly widen clown's grin when a person or expense is added
  useEffect(() => {
    if (people.length > prevPeopleCount.current || expenses.length > prevExpensesCount.current) {
      setGrinWiden(true);
      const timer = setTimeout(() => setGrinWiden(false), 700);
      return () => clearTimeout(timer);
    }
    prevPeopleCount.current = people.length;
    prevExpensesCount.current = expenses.length;
  }, [people.length, expenses.length]);

  // Currency-neutral mascot glow: clown's eyes brighten when multiple settlements are pending
  const shouldGlowMascot = settlements.length >= 2;

  return (
    <div className="relative min-h-screen flex flex-col justify-between p-3 sm:p-4 selection:bg-accent selection:text-white overflow-x-hidden">
      {/* SVG Global Filters & Gradients */}
      <BloodDefs />

      {/* Top Viewport Blood Lip with Procedural Drips */}
      <ViewportBloodLip />

      {/* Background Decor Layers (aria-hidden, pointer-events: none) */}
      <CornerSplatter />
      <ClawScratches />
      <GutterEyes />
      <FloatingBalloons />
      <FogAndNoise />

      <div className="relative z-10 pt-2 sm:pt-4">
        <Header glowMascot={shouldGlowMascot} grinWiden={grinWiden} />

        {/* Responsive Grid: Single column on mobile, 2 columns on desktop (>=1024px) */}
        <main className="w-full max-w-xl lg:max-w-5xl mx-auto mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
            {/* Left Column: Inputs (People -> Add expense -> Expenses) with 32-40px gap */}
            <div className="lg:col-span-7 space-y-8 sm:space-y-10">
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

      <footer className="w-full max-w-xl lg:max-w-5xl mx-auto py-8 text-center text-xs text-text-muted flex flex-col items-center gap-2 relative z-10">
        <div className="flex items-center justify-center gap-3">
          <StormDrain size={28} blinkingEyes />
          <FooterBalloonBundle className="-mt-2" />
        </div>
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
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ExpenseProvider>
  );
};

export default App;
