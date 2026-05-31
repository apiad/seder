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
        <h2 className="text-xl font-bold">{area.name}</h2>
        <p>Está abierto, ven. Horario: {area.schedule.open}–{area.schedule.close}.</p>
        <Link to="/qr" className="block bg-teal-700 text-white text-center py-2 rounded">Abrir mi QR</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">{area.name}</h2>
      <p className="text-sm text-slate-500">
        Slots de {area.slotDurationMin} min · {area.schedule.open}–{area.schedule.close} · capacidad {area.capacityPerSlot}
      </p>
      <button
        type="button"
        onClick={() => navigate(`/reserve/${area.id}`)}
        className="block w-full bg-teal-700 text-white text-center py-2 rounded"
      >
        Reservar un turno
      </button>
    </div>
  );
}
