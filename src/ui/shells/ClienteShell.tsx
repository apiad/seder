import type { ReactNode } from 'react';
import { useStore } from '../../store';

export default function ClienteShell({ children }: { children: ReactNode }) {
  const activeUserId = useStore(s => s.activeUserId);
  const users = useStore(s => s.users);
  const activeUser = users.find(u => u.id === activeUserId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-teal-700 text-white px-4 py-3 flex justify-between items-center">
        <span className="font-bold">SEDER · Cliente</span>
        <span className="text-sm opacity-80">{activeUser ? activeUser.name : 'Sin sesión'}</span>
      </header>
      <main className="p-4 max-w-md mx-auto">{children}</main>
    </div>
  );
}
