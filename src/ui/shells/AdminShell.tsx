import type { ReactNode } from 'react';
import { useStore } from '../../store';
import ResetSeedButton from '../components/ResetSeedButton';

export default function AdminShell({ children }: { children: ReactNode }) {
  const op = useStore(s => s.activeOperatorName);
  return (
    <div className="min-h-screen bg-uh-granate-darker text-uh-cream">
      <header className="bg-uh-granate-dark border-b-2 border-uh-beige">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-baseline">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-semibold tracking-[0.18em] text-uh-beige text-lg">SEDER</span>
            <span className="text-xs uppercase tracking-widest text-uh-beige/70">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <ResetSeedButton />
            <span className="text-xs uppercase tracking-wider text-uh-cream/80">{op ?? 'Sin operador'}</span>
          </div>
        </div>
        <div className="bg-uh-granate-darker text-uh-beige text-center text-[10px] uppercase tracking-[0.25em] py-1 border-t border-uh-granate">
          Universidad de La Habana · Panel administrativo
        </div>
      </header>
      <main className="p-4 max-w-3xl mx-auto">
        {children}
        <footer className="mt-12 text-center text-xs text-uh-beige/60">
          <a href="/index.html" className="underline hover:text-uh-beige">Abrir cliente PWA →</a>
        </footer>
      </main>
    </div>
  );
}
