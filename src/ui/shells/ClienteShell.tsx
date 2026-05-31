import type { ReactNode } from 'react';
import { useStore } from '../../store';

export default function ClienteShell({ children }: { children: ReactNode }) {
  const activeUserId = useStore(s => s.activeUserId);
  const users = useStore(s => s.users);
  const activeUser = users.find(u => u.id === activeUserId);

  return (
    <div className="min-h-screen bg-uh-cream text-slate-900">
      <header className="bg-white border-b-4 border-uh-granate">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-baseline">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-semibold tracking-[0.18em] text-uh-granate text-lg">SEDER</span>
            <span className="text-xs uppercase tracking-widest text-slate-500">Cliente</span>
          </div>
          <span className="text-xs uppercase tracking-wider text-slate-600">{activeUser ? activeUser.name : 'Sin sesión'}</span>
        </div>
        <div className="bg-uh-granate text-uh-beige text-center text-[10px] uppercase tracking-[0.25em] py-1">
          Universidad de La Habana · Estadio Universitario
        </div>
      </header>
      <main className="p-4 max-w-md mx-auto">
        {children}
        <footer className="mt-12 text-center text-xs text-slate-500">
          <a href={`${import.meta.env.BASE_URL}admin.html`} className="underline hover:text-uh-granate">Abrir admin PWA →</a>
        </footer>
      </main>
    </div>
  );
}
