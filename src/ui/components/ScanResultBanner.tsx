import type { ScanResult } from '../../domain/types';

export default function ScanResultBanner({ result, user, area }: {
  result: ScanResult | null;
  user?: { name: string };
  area?: { name: string };
}) {
  if (!result) return null;
  const ok = result.result === 'admit';
  return (
    <div className={`rounded p-4 text-center font-display uppercase tracking-widest border ${ok ? 'bg-uh-beige text-uh-granate-dark border-uh-beige-dark' : 'bg-red-700 text-uh-cream border-red-900'}`}>
      {ok ? '✓ Admitido' : '✕ Denegado'}
      <div className="text-sm font-sans normal-case tracking-normal mt-1 opacity-90">
        {user?.name} → {area?.name}
        {!ok && result.result === 'deny' && <> · {result.reason}</>}
      </div>
    </div>
  );
}
