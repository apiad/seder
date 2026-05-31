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
      <h2 className="text-xl font-bold">Escáner simulado</h2>
      <ScanResultBanner result={result} user={user} area={area} />
      <div className="grid gap-3">
        <label className="block">
          <span className="text-sm text-slate-400">Usuario</span>
          <select value={userId} onChange={e => setUserId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 mt-1">
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.category})</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Área</span>
          <select value={areaId} onChange={e => setAreaId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 mt-1">
            {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <button type="button" onClick={onScan} className="bg-purple-700 py-3 rounded font-bold">
          Simular escaneo
        </button>
      </div>
    </div>
  );
}
