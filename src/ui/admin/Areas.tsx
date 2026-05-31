import { useStore } from '../../store';
import { isWithinSchedule } from '../../domain/time';

export default function Areas() {
  const areas = useStore(s => s.areas);
  const now = new Date();

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Áreas</h2>
      <ul className="space-y-2">
        {areas.map(a => {
          const open = isWithinSchedule(now, a.schedule);
          return (
            <li key={a.id} className="bg-slate-800 border border-slate-700 rounded p-3">
              <div className="flex justify-between">
                <span className="font-medium">{a.name}</span>
                <span className={`text-xs ${open ? 'text-teal-300' : 'text-slate-500'}`}>
                  {open ? 'ABIERTO' : 'CERRADO'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
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
