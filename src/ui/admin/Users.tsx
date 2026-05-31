import { useStore } from '../../store';

export default function Users() {
  const users = useStore(s => s.users);
  const logs = useStore(s => s.accessLogs);

  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl tracking-widest text-uh-beige uppercase">Usuarios</h2>
      <ul className="space-y-3">
        {users.map(u => {
          const userLogs = logs.filter(l => l.userId === u.id).slice(0, 5);
          return (
            <li key={u.id} className="bg-uh-granate-dark border border-uh-granate rounded p-3">
              <div className="flex justify-between items-baseline">
                <span className="font-display text-lg text-uh-cream">{u.name}</span>
                <span className="text-xs uppercase tracking-widest text-uh-beige">{u.category}</span>
              </div>
              <div className="text-xs text-uh-cream/70 mt-1">
                Membresía: {u.membership ? `${u.membership.area} hasta ${u.membership.validUntil}` : '—'}
              </div>
              {userLogs.length > 0 && (
                <ul className="mt-2 text-xs space-y-0.5">
                  {userLogs.map(l => (
                    <li key={l.id} className={l.result === 'admit' ? 'text-uh-beige' : 'text-red-300'}>
                      {l.ts.slice(11, 19)} → {l.areaId} · {l.result}{l.reason ? ` (${l.reason})` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
