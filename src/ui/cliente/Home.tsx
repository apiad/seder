import { Link } from 'react-router-dom';
import { useStore } from '../../store';

export default function Home() {
  const activeUserId = useStore(s => s.activeUserId);
  const user = useStore(s => s.users.find(u => u.id === activeUserId));
  const areas = useStore(s => s.areas);
  const myReservations = useStore(s =>
    s.reservations.filter(r => r.userId === activeUserId && r.status === 'active')
  );

  if (!user) return <p>Sin sesión.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Hola, {user.name}.</h2>
        <Link to="/qr" className="text-sm text-teal-700 underline">Mi QR de acceso</Link>
      </div>

      <section>
        <h3 className="font-semibold mb-2">Próximas reservas</h3>
        {myReservations.length === 0 ? (
          <p className="text-sm text-slate-500">Sin reservas activas.</p>
        ) : (
          <ul className="space-y-2">
            {myReservations.map(r => (
              <li key={r.id} className="bg-white border border-slate-200 rounded px-3 py-2 text-sm">
                {r.areaId} — {r.slotStart.slice(11, 16)}
              </li>
            ))}
          </ul>
        )}
        <Link to="/reservations" className="text-sm text-teal-700 underline mt-1 inline-block">Ver todas</Link>
      </section>

      <section>
        <h3 className="font-semibold mb-2">Áreas</h3>
        <ul className="space-y-2">
          {areas.map(a => (
            <li key={a.id}>
              <Link to={`/area/${a.id}`} className="block bg-white border border-slate-200 rounded px-3 py-2 hover:bg-teal-50">
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-slate-500">
                  {a.archetype === 'slot-bookable' ? 'Reservar turno' : 'Acceso libre'} · {a.schedule.open}–{a.schedule.close}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
