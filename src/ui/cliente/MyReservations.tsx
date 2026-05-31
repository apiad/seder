import { useState } from 'react';
import { useStore } from '../../store';

export default function MyReservations() {
  const activeUserId = useStore(s => s.activeUserId)!;
  const allReservations = useStore(s => s.reservations);
  const reservations = allReservations.filter(r => r.userId === activeUserId);
  const areas = useStore(s => s.areas);
  const cancel = useStore(s => s.cancel);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...reservations].sort((a, b) => a.slotStart.localeCompare(b.slotStart));

  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl tracking-wide text-uh-granate">Mis reservas</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {sorted.length === 0 && <p className="text-sm text-slate-500">No tienes reservas.</p>}
      <ul className="space-y-3">
        {sorted.map(r => {
          const area = areas.find(a => a.id === r.areaId);
          return (
            <li key={r.id} className="bg-white border border-slate-200 rounded-xl px-4 py-4 min-h-16 shadow-sm flex justify-between items-center gap-3">
              <div className="min-w-0">
                <div className="font-medium text-base">{area?.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{r.slotStart.replace('T', ' ').slice(0, 16)} · {r.status}</div>
              </div>
              {r.status === 'active' && (
                <button
                  type="button"
                  onClick={() => {
                    const err = cancel(r.id, new Date());
                    setError(err);
                  }}
                  className="text-xs uppercase tracking-widest text-red-600 border border-red-200 rounded-lg px-3 py-2 min-h-10 hover:bg-red-50 active:scale-95 transition-all duration-150"
                >
                  Cancelar
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
