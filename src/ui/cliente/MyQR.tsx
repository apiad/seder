import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../store';

export default function MyQR() {
  const activeUserId = useStore(s => s.activeUserId);
  const user = useStore(s => s.users.find(u => u.id === activeUserId));
  if (!user) return <p>Sin sesión.</p>;

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Mi acceso</h2>
      <div className="bg-white p-4 rounded shadow">
        <QRCodeSVG value={user.qrToken} size={240} />
      </div>
      <div className="text-center">
        <div className="font-medium text-lg">{user.name}</div>
        <div className="text-xs text-slate-500 capitalize">{user.category}</div>
      </div>
    </div>
  );
}
