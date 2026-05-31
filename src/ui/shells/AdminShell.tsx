import type { ReactNode } from 'react';
import { useStore } from '../../store';
import ResetSeedButton from '../components/ResetSeedButton';

export default function AdminShell({ children }: { children: ReactNode }) {
  const op = useStore(s => s.activeOperatorName);
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="bg-purple-700 px-4 py-3 flex justify-between items-center">
        <span className="font-bold">SEDER · Admin</span>
        <div className="flex items-center gap-3">
          <ResetSeedButton />
          <span className="text-sm opacity-80">{op ?? 'Sin operador'}</span>
        </div>
      </header>
      <main className="p-4 max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
