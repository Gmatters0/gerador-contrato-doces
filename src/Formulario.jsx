import { useRef, useState } from 'react';
import { FORMA_PAGAMENTO_PADRAO, SUGESTOES_DOCES, TAXA_ENTREGA_CENTS } from './lib/constantes.js';
import { subtotal, totais } from './lib/calculos.js';
import { hojeISO } from './lib/extenso.js';
import { brl, mascaraCpf, mascaraTelefone, parseReais } from './lib/formato.js';
import { validar } from './lib/validacao.js';
import { gerarEBaixar } from './contrato/gerar.js';

function estadoInicial(novoId) {
  return {
    contratante: { nome: '', cpf: '', rg: '', endereco: '', telefone: '', email: '' },
    itens: [{ id: novoId(), tipo: '', sabor: '', qtd: '', preco: '' }],
    entrega: false,
    forma: FORMA_PAGAMENTO_PADRAO,
    evento: { data: '', hora: '', horaEntrega: '', local: '' },
  };
}

function Campo({ rotulo, erro, opcional, className = '', children }) {
  return (
    <label className={`campo ${erro ? 'tem-erro' : ''} ${className}`}>
      <span>
        {rotulo}
        {opcional && <em> (opcional)</em>}
      </span>
      {children}
      {erro && <small className="erro">{erro}</small>}
    </label>
  );
}

function Corpo({ contratada, aoSair, aoConcluir }) {
  const contador = useRef(0);
  const novoId = () => ++contador.current;
  const [form, setForm] = useState(() => estadoInicial(novoId));
  const [erros, setErros] = useState({});
  const [gerando, setGerando] = useState(false);
  const [falha, setFalha] = useState('');

  const hoje = hojeISO();

  const setC = (campo, valor) => setForm((f) => ({ ...f, contratante: { ...f.contratante, [campo]: valor } }));
  const setE = (campo, valor) => setForm((f) => ({ ...f, evento: { ...f.evento, [campo]: valor } }));
  const setItem = (id, campo, valor) =>
    setForm((f) => ({ ...f, itens: f.itens.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)) }));
  const addItem = () =>
    setForm((f) => ({ ...f, itens: [...f.itens, { id: novoId(), tipo: '', sabor: '', qtd: '', preco: '' }] }));
  const removeItem = (id) => setForm((f) => ({ ...f, itens: f.itens.filter((i) => i.id !== id) }));

  // Total ao vivo: linhas ainda incompletas valem zero.
  const itensNumericos = form.itens.map((i) => {
    const qtd = Number(i.qtd);
    const precoCents = parseReais(i.preco);
    return {
      qtd: Number.isInteger(qtd) && qtd > 0 ? qtd : 0,
      precoCents: Number.isFinite(precoCents) ? precoCents : 0,
    };
  });
  const t = totais(itensNumericos, form.entrega);

  async function enviar(e) {
    e.preventDefault();
    setFalha('');
    const { erros: novos, dados } = validar(form, hoje);
    setErros(novos);
    if (Object.keys(novos).length) {
      requestAnimationFrame(() =>
        document.querySelector('.tem-erro, .erro-bloco')?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      );
      return;
    }
    setGerando(true);
    try {
      const arquivo = await gerarEBaixar(dados, contratada);
      aoConcluir(arquivo);
    } catch (err) {
      console.error(err);
      setFalha('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerando(false);
    }
  }

  const c = form.contratante;
  const ev = form.evento;

  return (
    <div className="pagina">
      <header className="topo">
        <div>
          <h1>Novo contrato</h1>
          <p className="sub">Preencha os dados. Os valores são calculados sozinhos.</p>
        </div>
        <button type="button" className="botao-link" onClick={aoSair}>Sair</button>
      </header>

      <form onSubmit={enviar} noValidate>
        <section className="cartao">
          <h2><b>1</b> Contratante</h2>
          <div className="grade">
            <Campo rotulo="Nome completo" erro={erros.nome} className="span2">
              <input value={c.nome} onChange={(e) => setC('nome', e.target.value)} autoComplete="off" />
            </Campo>
            <Campo rotulo="CPF" erro={erros.cpf}>
              <input value={c.cpf} onChange={(e) => setC('cpf', mascaraCpf(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" />
            </Campo>
            <Campo rotulo="RG" opcional>
              <input value={c.rg} onChange={(e) => setC('rg', e.target.value)} inputMode="numeric" />
            </Campo>
            <Campo rotulo="Endereço" erro={erros.endereco} className="span2">
              <input value={c.endereco} onChange={(e) => setC('endereco', e.target.value)} placeholder="Rua, número, bairro" />
            </Campo>
            <Campo rotulo="Telefone" erro={erros.telefone}>
              <input value={c.telefone} onChange={(e) => setC('telefone', mascaraTelefone(e.target.value))} inputMode="tel" placeholder="(11) 90000-0000" />
            </Campo>
            <Campo rotulo="E-mail" erro={erros.email} opcional>
              <input type="email" value={c.email} onChange={(e) => setC('email', e.target.value)} />
            </Campo>
          </div>
        </section>

        <section className="cartao">
          <h2><b>2</b> Tipo de doces e quantidades</h2>
          <datalist id="doces">
            {SUGESTOES_DOCES.map((d) => <option key={d} value={d} />)}
          </datalist>

          <div className="itens">
            {form.itens.map((it, idx) => {
              const e = erros[`item:${it.id}`] ?? {};
              return (
                <div className="item" key={it.id}>
                  <Campo rotulo="Doce" erro={e.tipo} className="i-tipo">
                    <input list="doces" value={it.tipo} onChange={(ev2) => setItem(it.id, 'tipo', ev2.target.value)} placeholder="Ex.: Trouxinha" aria-label="Doce" />
                  </Campo>
                  <Campo rotulo="Sabor / detalhe" className="i-sabor">
                    <input value={it.sabor} onChange={(ev2) => setItem(it.id, 'sabor', ev2.target.value)} placeholder="Ex.: de Coco, dourado" aria-label="Sabor ou detalhe" />
                  </Campo>
                  <Campo rotulo="Qtd." erro={e.qtd} className="i-qtd">
                    <input value={it.qtd} onChange={(ev2) => setItem(it.id, 'qtd', ev2.target.value.replace(/\D/g, ''))} inputMode="numeric" aria-label="Quantidade" />
                  </Campo>
                  <Campo rotulo="Preço unit." erro={e.preco} className="i-preco">
                    <div className="moeda">
                      <span>R$</span>
                      <input value={it.preco} onChange={(ev2) => setItem(it.id, 'preco', ev2.target.value.replace(/[^\d.,]/g, ''))} inputMode="decimal" placeholder="0,00" aria-label="Preço unitário" />
                    </div>
                  </Campo>
                  <div className="i-sub" aria-label="Subtotal">
                    <span className="rotulo-sub">Subtotal</span>
                    <strong>{brl(subtotal(itensNumericos[idx]))}</strong>
                  </div>
                  <button
                    type="button"
                    className="remover"
                    onClick={() => removeItem(it.id)}
                    disabled={form.itens.length === 1}
                    aria-label="Remover doce"
                    title="Remover"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          {erros.itens && <p className="erro">{erros.itens}</p>}
          <button type="button" className="botao-sec" onClick={addItem}>+ Adicionar doce</button>
        </section>

        <section className="cartao">
          <h2><b>3</b> Preço e pagamento</h2>
          <label className="check">
            <input type="checkbox" checked={form.entrega} onChange={(e) => setForm((f) => ({ ...f, entrega: e.target.checked }))} />
            <span>
              Entrega e montagem da mesa no local <em>(+ {brl(TAXA_ENTREGA_CENTS)})</em>
            </span>
          </label>
          <Campo rotulo="Forma de pagamento" erro={erros.forma}>
            <input value={form.forma} onChange={(e) => setForm((f) => ({ ...f, forma: e.target.value }))} />
          </Campo>

          <dl className="resumo">
            <div><dt>Total dos doces</dt><dd>{brl(t.doces)}</dd></div>
            {form.entrega && <div><dt>Entrega e montagem</dt><dd>{brl(t.taxa)}</dd></div>}
            <div className="final"><dt>Valor final</dt><dd>{brl(t.final)}</dd></div>
          </dl>
        </section>

        <section className="cartao">
          <h2><b>4</b> Sobre o evento</h2>
          <div className="grade">
            <Campo rotulo="Data do evento" erro={erros.data}>
              <input type="date" min={hoje} value={ev.data} onChange={(e) => setE('data', e.target.value)} />
            </Campo>
            <Campo rotulo="Horário do evento" erro={erros.hora}>
              <input type="time" value={ev.hora} onChange={(e) => setE('hora', e.target.value)} />
            </Campo>
            <Campo rotulo={form.entrega ? 'Horário da entrega' : 'Horário da retirada'} erro={erros.horaEntrega}>
              <input type="time" value={ev.horaEntrega} onChange={(e) => setE('horaEntrega', e.target.value)} />
            </Campo>
            <Campo rotulo="Local (nome e endereço)" erro={erros.local} className="span3">
              <input value={ev.local} onChange={(e) => setE('local', e.target.value)} placeholder="Ex.: Sítio Recanto, Rua X, 263 - Bairro, Cidade - SP" />
            </Campo>
          </div>
        </section>

        {falha && <p className="erro-bloco" role="alert">{falha}</p>}

        <div className="barra-acao">
          <div className="barra-total">
            <span>Valor final</span>
            <strong>{brl(t.final)}</strong>
          </div>
          <button className="botao grande" disabled={gerando}>
            {gerando ? 'Gerando PDF…' : 'Gerar contrato em PDF'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Formulario({ contratada, aoSair }) {
  // Trocar a chave descarta todo o estado: é assim que o ciclo recomeça sem guardar nada.
  const [ciclo, setCiclo] = useState(0);
  const [aviso, setAviso] = useState('');

  function concluir(arquivo) {
    setAviso(`“${arquivo}” foi baixado. O formulário foi limpo para o próximo contrato.`);
    setCiclo((c) => c + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      {aviso && (
        <div className="aviso" role="status">
          <span>✓ {aviso}</span>
          <button type="button" onClick={() => setAviso('')} aria-label="Fechar aviso">×</button>
        </div>
      )}
      <Corpo key={ciclo} contratada={contratada} aoSair={aoSair} aoConcluir={concluir} />
    </>
  );
}
