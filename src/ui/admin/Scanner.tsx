import { useState } from 'react';
import { useStore } from '../../store';
import type { ScanResult } from '../../domain/types';
import ScanResultBanner from '../components/ScanResultBanner';

export default function Scanner() {
  const users = useStore(s => s.users);
  const areas = useStore(s => s.areas);
  const scan = useStore(s => s.scan);
  const [userId, setUserId] = useState(users[0]?.id ?? '');
  const [areaId, setAreaId] = useState(areas[0]?.id ?? '');
  const [result, setResult] = useState<ScanResult | null>(null);

  const onScan = () => setResult(scan(userId, areaId, new Date()));

  const user = users.find(u => u.id === userId);
  const area = areas.find(a => a.id === areaId);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl tracking-widest text-uh-beige uppercase">Escáner simulado</h2>
      <ScanResultBanner result={result} user={user} area={area} />
      <div className="grid gap-3">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-uh-beige">Usuario</span>
          <select value={userId} onChange={e => setUserId(e.target.value)}
            className="w-full bg-uh-granate-dark border border-uh-granate rounded-xl px-4 py-3 min-h-14 mt-1 focus:outline-none focus:border-uh-beige transition-colors">
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.category})</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-uh-beige">Área</span>
          <select value={areaId} onChange={e => setAreaId(e.target.value)}
            className="w-full bg-uh-granate-dark border border-uh-granate rounded-xl px-4 py-3 min-h-14 mt-1 focus:outline-none focus:border-uh-beige transition-colors">
            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <button type="button" onClick={onScan} className="bg-uh-beige text-uh-granate-dark py-4 min-h-16 rounded-xl text-lg font-display uppercase tracking-widest shadow-md hover:bg-uh-beige-dark hover:shadow-lg active:scale-[0.98] transition-all duration-150">
          Simular escaneo
        </button>
      </div>
    </div>
  );
}
