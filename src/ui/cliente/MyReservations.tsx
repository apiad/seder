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
      <h2 className="text-xl font-bold">Mis reservas</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {sorted.length === 0 && <p className="text-sm text-slate-500">No tienes reservas.</p>}
      <ul className="space-y-2">
        {sorted.map(r => {
          const area = areas.find(a => a.id === r.areaId);
          return (
            <li key={r.id} className="bg-white border border-slate-200 rounded px-3 py-2 flex justify-between items-center">
              <div>
                <div className="font-medium">{area?.name}</div>
                <div className="text-xs text-slate-500">{r.slotStart.replace('T', ' ').slice(0, 16)} · {r.status}</div>
              </div>
              {r.status === 'active' && (
                <button
                  type="button"
                  onClick={() => {
                    const err = cancel(r.id, new Date());
                    setError(err);
                  }}
                  className="text-xs text-red-600 underline"
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
