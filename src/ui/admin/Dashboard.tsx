import { Link } from 'react-router-dom';
import { useStore } from '../../store';

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const reservationsToday = useStore(s =>
    s.reservations.filter(r => r.slotStart.startsWith(today) && r.status !== 'cancelled')
  );
  const admitsToday = useStore(s =>
    s.accessLogs.filter(l => l.ts.startsWith(today) && l.result === 'admit')
  );
  const totalLogs = useStore(s => s.accessLogs.length);
  const recentLogs = useStore(s => s.accessLogs.slice(0, 10));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Reservas hoy" value={reservationsToday.length} />
        <Stat label="Entradas hoy" value={admitsToday.length} />
        <Stat label="Logs totales" value={totalLogs} />
      </div>
      <nav className="flex gap-3 text-sm">
        <Link to="/scanner" className="bg-purple-700 px-3 py-2 rounded">Escáner</Link>
        <Link to="/areas" className="bg-slate-800 px-3 py-2 rounded">Áreas</Link>
        <Link to="/reservations" className="bg-slate-800 px-3 py-2 rounded">Reservas</Link>
        <Link to="/users" className="bg-slate-800 px-3 py-2 rounded">Usuarios</Link>
      </nav>
      <section>
        <h3 className="font-semibold mb-2">Stream reciente</h3>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-500">Sin actividad.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {recentLogs.map(l => (
              <li key={l.id} className={l.result === 'admit' ? 'text-teal-300' : 'text-red-300'}>
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
    <div className="bg-slate-800 border border-slate-700 rounded p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
