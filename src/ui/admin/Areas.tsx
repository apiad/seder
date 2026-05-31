import { useStore } from '../../store';
import { isWithinSchedule } from '../../domain/time';

export default function Areas() {
  const areas = useStore(s => s.areas);
  const now = new Date();

  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl tracking-widest text-uh-beige uppercase">Áreas</h2>
      <ul className="space-y-2">
        {areas.map(a => {
          const open = isWithinSchedule(now, a.schedule);
          return (
            <li key={a.id} className="bg-uh-granate-dark border border-uh-granate rounded p-3">
              <div className="flex justify-between items-baseline">
                <span className="font-display text-lg text-uh-cream">{a.name}</span>
                <span className={`text-xs uppercase tracking-widest ${open ? 'text-uh-beige' : 'text-uh-cream/40'}`}>
                  {open ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
              <div className="text-xs text-uh-cream/70 mt-1">
                {a.archetype} · {a.schedule.open}–{a.schedule.close}
                {a.archetype === 'slot-bookable' && <> · cap {a.capacityPerSlot}/slot</>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
