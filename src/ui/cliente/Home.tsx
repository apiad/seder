import { useStore } from '../../store';

export default function Home() {
  const activeUserId = useStore(s => s.activeUserId);
  const user = useStore(s => s.users.find(u => u.id === activeUserId));
  return (
    <div>
      <h2 className="text-xl font-bold">Hola, {user?.name ?? 'invitado'}.</h2>
      <p className="text-sm text-slate-500">Home — pendiente.</p>
    </div>
  );
}
