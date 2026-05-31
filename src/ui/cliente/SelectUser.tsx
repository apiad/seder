import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function SelectUser() {
  const users = useStore(s => s.users);
  const setActiveUser = useStore(s => s.setActiveUser);
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl tracking-wide text-uh-granate uppercase">¿Quién eres?</h2>
      <p className="text-sm text-slate-500">Login simulado para el demo.</p>
      <ul className="space-y-3">
        {users.map(u => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => { setActiveUser(u.id); navigate('/home'); }}
              className="w-full text-left bg-white border border-slate-200 rounded-xl px-5 py-4 min-h-16 shadow-sm hover:bg-uh-granate-soft hover:border-uh-granate hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              <div className="font-medium text-lg">{u.name}</div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mt-0.5">{u.category}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
