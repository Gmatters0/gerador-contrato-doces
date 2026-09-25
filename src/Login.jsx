import { useState } from 'react';

export default function Login({ aoEntrar }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });
      if (r.ok) {
        // Login aceito: se os dados não carregarem, mostra o motivo em vez de ficar parado.
        const motivo = await aoEntrar();
        setErro(motivo ?? 'Login aceito, mas a sessão não foi mantida. Verifique se o navegador bloqueia cookies.');
        return;
      }
      const corpo = await r.json().catch(() => ({}));
      setErro(corpo.erro ?? 'Não foi possível entrar');
    } catch {
      setErro('Sem conexão com o servidor');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login">
      <form className="cartao login-cartao" onSubmit={enviar}>
        <span className="eyebrow">Acesso restrito</span>
        <h1>Gerador de Contratos</h1>
        <p className="sub">Entre para preencher um novo contrato.</p>

        <label className="campo">
          <span>Usuário</span>
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" autoFocus required />
        </label>
        <label className="campo">
          <span>Senha</span>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required />
        </label>

        {erro && <p className="erro-bloco" role="alert">{erro}</p>}

        <button className="botao" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </main>
  );
}
