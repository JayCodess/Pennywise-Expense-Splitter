import React from 'react';
import { Header } from './components/Header';
import { StormDrain } from './components/StormDrain';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 selection:bg-accent selection:text-white">
      <div>
        <Header />

        <main className="w-full max-w-xl mx-auto mt-6">
          <div className="bg-surface border border-border rounded-card p-6 shadow-carnival animate-card-in text-center">
            <div className="flex justify-center mb-4">
              <StormDrain size={44} />
            </div>
            <h2 className="font-display text-2xl text-text-base mb-2">
              Step 0: Foundation Ready
            </h2>
            <p className="text-text-muted text-sm leading-relaxed mb-4">
              The carnival lights are wired. Palette, fonts, and mascot SVGs are loaded.
              Toggle between the dark void and faded parchment above to test both themes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full border border-border bg-background text-text-muted">
                WCAG AA Compliant
              </span>
              <span className="px-3 py-1 rounded-full border border-border bg-background text-text-muted">
                Tabular Digits
              </span>
              <span className="px-3 py-1 rounded-full border border-border bg-background text-positive-text font-semibold">
                Sickly Green Positive
              </span>
              <span className="px-3 py-1 rounded-full border border-border bg-background text-negative-text font-semibold">
                Blood Red Negative
              </span>
            </div>
          </div>
        </main>
      </div>

      <footer className="w-full max-w-xl mx-auto py-6 text-center text-xs text-text-muted flex flex-col items-center gap-2">
        <StormDrain size={28} />
        <p>Your data stays in your browser. Down in the drain, where nobody can find it.</p>
      </footer>
    </div>
  );
};

export default App;
