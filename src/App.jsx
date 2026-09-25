import { useCallback, useEffect, useState } from 'react';
import Login from './Login.jsx';
import Formulario from './Formulario.jsx';

export default function App() {
  // 'verificando' | 'saiu' | 'entrou'
  const [estado, setEstado] = useState('verificando');
  const [contratada, setContratada] = useState(null);

  // Devolve null se entrou, ou o motivo se não deu (o login mostra na tela).
  const carregarSessao = useCallback(async () => {
    try {
      const r = await fetch('/api/config', { credentials: 'same-origin' });
      if (r.ok) {
        setContratada((await r.json()).contratada);
        setEstado('entrou');
        return null;
      }
      setEstado('saiu');
      if (r.status === 401) return null; // sem sessão: só mostra o login
      const corpo = await r.json().catch(() => ({}));
      return corpo.erro ?? `Erro do servidor (${r.status})`;
    } catch {
      setEstado('saiu');
      return 'Sem conexão com o servidor';
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
