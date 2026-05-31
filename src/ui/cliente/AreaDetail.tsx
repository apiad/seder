import { Link, useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function AreaDetail() {
  const { id } = useParams<{ id: string }>();
  const area = useStore(s => s.areas.find(a => a.id === id));
  const navigate = useNavigate();
  if (!area) return <p>Área desconocida.</p>;

  if (area.archetype === 'drop-in') {
    return (
      <div className="space-y-3">
        <h2 className="font-display text-2xl tracking-wide text-uh-granate">{area.name}</h2>
        <p>Está abierto, ven. Horario: {area.schedule.open}–{area.schedule.close}.</p>
        <Link to="/qr" className="block bg-uh-granate text-uh-cream text-center py-2 rounded uppercase tracking-widest text-sm font-display hover:bg-uh-granate-dark transition-colors">Abrir mi QR</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl tracking-wide text-uh-granate">{area.name}</h2>
      <p className="text-sm text-slate-500">
        Slots de {area.slotDurationMin} min · {area.schedule.open}–{area.schedule.close} · capacidad {area.capacityPerSlot}
      </p>
      <button
        type="button"
        onClick={() => navigate(`/reserve/${area.id}`)}
        className="block w-full bg-uh-granate text-uh-cream text-center py-2 rounded uppercase tracking-widest text-sm font-display hover:bg-uh-granate-dark transition-colors"
      >
        Reservar un turno
      </button>
    </div>
  );
}
