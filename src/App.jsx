import { useCallback, useEffect, useState } from 'react';
import Login from './Login.jsx';
import Formulario from './Formulario.jsx';

export default function App() {
  // 'verificando' | 'saiu' | 'entrou'
  const [estado, setEstado] = useState('verificando');
  const [contratada, setContratada] = useState(null);

  const carregarSessao = useCallback(async () => {
    try {
      const r = await fetch('/api/config', { credentials: 'same-origin' });
      if (!r.ok) return setEstado('saiu');
      setContratada((await r.json()).contratada);
      setEstado('entrou');
    } catch {
      setEstado('saiu');
    }
  }, []);

  useEffect(() => {
    carregarSessao();
  }, [carregarSessao]);

  async function sair() {
    await fetch('/api/logout', { method: 'POST' }).catch(() => {});
    setContratada(null);
    setEstado('saiu');
  }

  if (estado === 'verificando') return <div className="carregando">Carregando…</div>;
  if (estado === 'saiu') return <Login aoEntrar={carregarSessao} />;
  return <Formulario contratada={contratada} aoSair={sair} />;
}
