import { Link } from 'react-router-dom';
import { useStore } from '../../store';

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const reservations = useStore(s => s.reservations);
  const accessLogs = useStore(s => s.accessLogs);
  const reservationsToday = reservations.filter(
    r => r.slotStart.startsWith(today) && r.status !== 'cancelled'
  );
  const admitsToday = accessLogs.filter(
    l => l.ts.startsWith(today) && l.result === 'admit'
  );
  const totalLogs = accessLogs.length;
  const recentLogs = accessLogs.slice(0, 10);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl tracking-widest text-uh-beige uppercase">Dashboard</h2>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Reservas hoy" value={reservationsToday.length} />
        <Stat label="Entradas hoy" value={admitsToday.length} />
        <Stat label="Logs totales" value={totalLogs} />
      </div>
      <nav className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm font-display uppercase tracking-widest">
        <Link to="/scanner" className="bg-uh-beige text-uh-granate-dark px-4 py-4 min-h-14 rounded-xl text-center shadow-md hover:bg-uh-beige-dark hover:shadow-lg active:scale-[0.97] transition-all duration-150">Escáner</Link>
        <Link to="/areas" className="bg-uh-granate px-4 py-4 min-h-14 rounded-xl text-uh-cream text-center shadow-md hover:bg-uh-granate-dark hover:shadow-lg active:scale-[0.97] transition-all duration-150">Áreas</Link>
        <Link to="/reservations" className="bg-uh-granate px-4 py-4 min-h-14 rounded-xl text-uh-cream text-center shadow-md hover:bg-uh-granate-dark hover:shadow-lg active:scale-[0.97] transition-all duration-150">Reservas</Link>
        <Link to="/users" className="bg-uh-granate px-4 py-4 min-h-14 rounded-xl text-uh-cream text-center shadow-md hover:bg-uh-granate-dark hover:shadow-lg active:scale-[0.97] transition-all duration-150">Usuarios</Link>
      </nav>
      <section>
        <h3 className="font-display uppercase tracking-widest text-xs text-uh-beige mb-2">Stream reciente</h3>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-uh-cream/60">Sin actividad.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {recentLogs.map(l => (
              <li key={l.id} className={l.result === 'admit' ? 'text-uh-beige' : 'text-red-300'}>
                {l.ts.slice(11, 19)} · {l.userId} → {l.areaId} · {l.result}{l.reason ? ` (${l.reason})` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-uh-granate-dark border border-uh-granate rounded-xl px-4 py-4 shadow-md">
      <div className="text-xs uppercase tracking-widest text-uh-beige">{label}</div>
      <div className="font-display text-3xl text-uh-cream mt-1">{value}</div>
    </div>
  );
}
