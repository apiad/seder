import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../store';

export default function MyQR() {
  const activeUserId = useStore(s => s.activeUserId);
  const user = useStore(s => s.users.find(u => u.id === activeUserId));
  if (!user) return <p>Sin sesión.</p>;

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="font-display text-2xl tracking-wide text-uh-granate uppercase">Mi acceso</h2>
      <div className="bg-white p-4 rounded shadow border-2 border-uh-granate">
        <QRCodeSVG value={user.qrToken} size={240} fgColor="#6d222e" />
      </div>
      <div className="text-center">
        <div className="font-display text-lg tracking-wide text-uh-granate">{user.name}</div>
        <div className="text-xs uppercase tracking-widest text-slate-500">{user.category}</div>
      </div>
    </div>
  );
}
