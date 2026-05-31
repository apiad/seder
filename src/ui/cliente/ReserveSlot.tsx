import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { hhmmToMinutes } from '../../domain/time';

function* slotsFor(area: { schedule: { open: string; close: string }; slotDurationMin?: number }, day: string) {
  const open = hhmmToMinutes(area.schedule.open);
  const close = hhmmToMinutes(area.schedule.close);
  const dur = area.slotDurationMin ?? 60;
  for (let m = open; m + dur <= close; m += dur) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    yield `${day}T${hh}:${mm}:00`;
  }
}

export default function ReserveSlot() {
  const { areaId } = useParams<{ areaId: string }>();
  const area = useStore(s => s.areas.find(a => a.id === areaId))!;
  const activeUserId = useStore(s => s.activeUserId)!;
  const reserve = useStore(s => s.reserve);
  const reservations = useStore(s => s.reservations);
  const today = new Date().toISOString().slice(0, 10);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const slots = useMemo(() => Array.from(slotsFor(area, today)), [area, today]);

  const occupied = (slot: string) =>
    reservations.filter(r => r.areaId === area.id && r.slotStart === slot && r.status === 'active').length;

  const onReserve = (slot: string) => {
    const err = reserve(activeUserId, area.id, slot, new Date());
    if (err) setError(err);
    else navigate('/reservations');
  };

  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl tracking-wide text-uh-granate">Reservar — {area.name}</h2>
      <p className="text-sm text-slate-500">Hoy, {today}</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="grid grid-cols-3 gap-2">
        {slots.map(slot => {
          const occ = occupied(slot);
          const full = occ >= (area.capacityPerSlot ?? Infinity);
          return (
            <li key={slot}>
              <button
                type="button"
                disabled={full}
                onClick={() => onReserve(slot)}
                className={`w-full py-2 rounded text-sm border transition-colors ${full ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white border-uh-granate text-uh-granate hover:bg-uh-granate hover:text-uh-cream'}`}
              >
                {slot.slice(11, 16)}<br/>
                <span className="text-xs">{occ}/{area.capacityPerSlot}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
