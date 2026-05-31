import { useStore } from '../../store';

export default function ResetSeedButton() {
  const resetSeed = useStore(s => s.resetSeed);
  const onClick = () => {
    if (confirm('¿Resetear todo el estado del demo?')) resetSeed();
  };
  return (
    <button type="button" onClick={onClick} className="text-xs text-uh-beige underline hover:text-uh-cream">
      🔄 Resetear seed
    </button>
  );
}
