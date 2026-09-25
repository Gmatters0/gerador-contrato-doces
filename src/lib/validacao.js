import { cpfValido, parseReais } from './formato.js';
import { hojeISO } from './extenso.js';

// Recebe o estado bruto do formulário. Devolve { erros, dados }.
// `dados` só é confiável quando `erros` está vazio.
export function validar(form, hoje = hojeISO()) {
  const erros = {};
  const c = form.contratante;

  if (c.nome.trim().length < 3) erros.nome = 'Informe o nome completo';
  if (!cpfValido(c.cpf)) erros.cpf = 'CPF inválido';
  if (!c.endereco.trim()) erros.endereco = 'Informe o endereço';
  if (c.telefone.replace(/\D/g, '').length < 10) erros.telefone = 'Telefone incompleto';
  if (c.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) erros.email = 'E-mail inválido';

  const itens = [];
  form.itens.forEach((it) => {
    const qtd = Number(it.qtd);
    const precoCents = parseReais(it.preco);
    const e = {};
    if (!it.tipo.trim()) e.tipo = 'Informe o doce';
    if (!Number.isInteger(qtd) || qtd < 1) e.qtd = 'Qtd inválida';
    if (!Number.isFinite(precoCents) || precoCents <= 0) e.preco = 'Informe o preço';
    if (Object.keys(e).length) erros[`item:${it.id}`] = e;
    itens.push({ tipo: it.tipo.trim(), sabor: it.sabor.trim(), qtd, precoCents });
  });
  if (itens.length === 0) erros.itens = 'Adicione ao menos um doce';

  // Entrega e montagem são independentes; se marcada, precisa de valor.
  const servicos = {};
  for (const nome of ['entrega', 'montagem']) {
    const { ativa, valor } = form[nome];
    if (!ativa) {
      servicos[nome] = null;
      continue;
    }
    const cents = parseReais(valor);
    if (!Number.isFinite(cents) || cents <= 0) erros[nome] = 'Informe o valor';
    servicos[nome] = cents;
  }

  const ev = form.evento;
  if (!ev.data) erros.data = 'Informe a data';
  else if (ev.data < hoje) erros.data = 'A data não pode estar no passado';
  if (!ev.hora) erros.hora = 'Informe o horário';
  if (!ev.horaEntrega) erros.horaEntrega = 'Informe o horário';
  if (!ev.local.trim()) erros.local = 'Informe o local do evento';
  if (!form.forma.trim()) erros.forma = 'Informe a forma de pagamento';

  const dados = {
    contratante: Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v.trim()])),
    itens,
    servicos, // { entrega, montagem }: centavos, ou null se não contratado
    forma: form.forma.trim().replace(/[.\s]+$/, ''),
    evento: { ...ev, local: ev.local.trim() },
  };
  return { erros, dados };
}
