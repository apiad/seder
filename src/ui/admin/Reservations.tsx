import { useState } from 'react';
import { useStore } from '../../store';

export default function Reservations() {
  const reservations = useStore(s => s.reservations);
  const users = useStore(s => s.users);
  const areas = useStore(s => s.areas);
  const cancel = useStore(s => s.cancel);
  const [err, setErr] = useState<string | null>(null);

  const sorted = [...reservations].sort((a, b) => a.slotStart.localeCompare(b.slotStart));
  const userName = (id: string) => users.find(u => u.id === id)?.name ?? id;
  const areaName = (id: string) => areas.find(a => a.id === id)?.name ?? id;

  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl tracking-widest text-uh-beige uppercase">Reservas</h2>
      {err && <p className="text-sm text-red-300">{err}</p>}
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-widest text-uh-beige border-b border-uh-granate">
          <tr><th className="py-2">Cuándo</th><th>Quién</th><th>Dónde</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          {sorted.map(r => (
            <tr key={r.id} className="border-b border-uh-granate/40">
              <td className="py-2">{r.slotStart.replace('T', ' ').slice(0, 16)}</td>
              <td>{userName(r.userId)}</td>
              <td>{areaName(r.areaId)}</td>
              <td>{r.status}</td>
              <td>
                {r.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => setErr(cancel(r.id, new Date()))}
                    className="text-red-300 underline"
                  >
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
