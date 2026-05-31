import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

const SUGGESTED = ['Suilan', 'Operador 1', 'Operador 2'];

export default function SelectOperator() {
  const setActiveOperator = useStore(s => s.setActiveOperator);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const enter = (n: string) => {
    if (!n.trim()) return;
    setActiveOperator(n);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Operador</h2>
      <ul className="space-y-2">
        {SUGGESTED.map(s => (
          <li key={s}>
            <button
              type="button"
              onClick={() => enter(s)}
              className="w-full text-left bg-slate-800 border border-slate-700 rounded px-4 py-3 hover:bg-purple-900"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Otro nombre"
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2"
        />
        <button type="button" onClick={() => enter(name)} className="bg-purple-700 px-4 py-2 rounded">Entrar</button>
      </div>
    </div>
  );
}
