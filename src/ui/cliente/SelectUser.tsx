import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

export default function SelectUser() {
  const users = useStore(s => s.users);
  const setActiveUser = useStore(s => s.setActiveUser);
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">¿Quién eres?</h2>
      <p className="text-sm text-slate-500">Login simulado para el demo.</p>
      <ul className="space-y-2">
        {users.map(u => (
          <li key={u.id}>
            <button
              type="button"
              onClick={() => { setActiveUser(u.id); navigate('/home'); }}
              className="w-full text-left bg-white border border-slate-200 rounded-lg px-4 py-3 hover:bg-teal-50"
            >
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-slate-500 capitalize">{u.category}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
