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
      <h2 className="font-display text-2xl tracking-widest text-uh-beige uppercase">Operador</h2>
      <ul className="space-y-2">
        {SUGGESTED.map(s => (
          <li key={s}>
            <button
              type="button"
              onClick={() => enter(s)}
              className="w-full text-left bg-uh-granate-dark border border-uh-granate rounded px-4 py-3 hover:bg-uh-granate hover:border-uh-beige transition-colors"
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
          className="flex-1 bg-uh-granate-dark border border-uh-granate rounded px-3 py-2 placeholder:text-uh-beige/50"
        />
        <button type="button" onClick={() => enter(name)} className="bg-uh-beige text-uh-granate-dark font-display uppercase tracking-widest text-sm px-4 py-2 rounded hover:bg-uh-beige-dark transition-colors">Entrar</button>
      </div>
    </div>
  );
}
