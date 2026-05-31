import type { ScanResult } from '../../domain/types';

export default function ScanResultBanner({ result, user, area }: {
  result: ScanResult | null;
  user?: { name: string };
  area?: { name: string };
}) {
  if (!result) return null;
  const ok = result.result === 'admit';
  return (
    <div className={`rounded p-4 text-center font-bold ${ok ? 'bg-teal-700' : 'bg-red-700'}`}>
      {ok ? '✅ ADMITIDO' : '❌ DENEGADO'}
      <div className="text-sm font-normal mt-1">
        {user?.name} → {area?.name}
        {!ok && result.result === 'deny' && <> · {result.reason}</>}
      </div>
    </div>
  );
}
