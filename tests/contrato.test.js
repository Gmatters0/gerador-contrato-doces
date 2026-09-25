import test from 'node:test';
import assert from 'node:assert/strict';
import { montarContrato } from '../src/contrato/texto.js';

const contratada = { nome: 'Ana Exemplo', rg: '1', cpf: '529.982.247-25', cnpj: '2', endereco: 'Rua X', telefone: '(11) 90000-0000', email: 'a@b.c', cidade: 'Guarulhos' };
const dados = (servicos) => ({
  contratante: { nome: 'Maria Souza', cpf: '529.982.247-25', rg: '', endereco: 'Rua A, 1', telefone: '(11) 99999-9999', email: '' },
  itens: [{ tipo: 'Bombom', sabor: '', qtd: 50, precoCents: 550 }],
  servicos,
  forma: 'Pagamento via transferência Pix',
  evento: { data: '2026-11-21', hora: '15:30', horaEntrega: '12:00', local: 'Salão X' },
});
const clausula10 = (k) => k.secoesPosProduto.flatMap((s) => s.clausulas).find((c) => c.rotulo === 'Cláusula 10ª.');

test('sem entrega nem montagem: sem Cláusula 10 e sem linhas de taxa', () => {
  const k = montarContrato(dados({ entrega: null, montagem: null }), contratada, '2026-09-10');
  assert.equal(clausula10(k), undefined);
  assert.equal(k.produto.totais.entrega, null);
  assert.equal(k.produto.totais.montagem, null);
  assert.equal(k.produto.totais.final, 'R$ 275,00');
  assert.match(k.evento.texto, /retirada dos doces/);
});

test('só entrega', () => {
  const k = montarContrato(dados({ entrega: 15000, montagem: null }), contratada, '2026-09-10');
  assert.match(clausula10(k).texto, /taxa de entrega no valor de \*\*R\$ 150,00\*\* \(cento e cinquenta reais\)/);
  assert.doesNotMatch(clausula10(k).texto, /montagem/);
  assert.equal(k.produto.totais.final, 'R$ 425,00');
  assert.match(k.evento.texto, /entrega dos doces/);
});

test('só montagem: doces continuam para retirada', () => {
  const k = montarContrato(dados({ entrega: null, montagem: 13000 }), contratada, '2026-09-10');
  assert.match(clausula10(k).texto, /taxa de montagem no valor de \*\*R\$ 130,00\*\*/);
  assert.doesNotMatch(clausula10(k).texto, /entrega/);
  assert.equal(k.produto.totais.entrega, null);
  assert.equal(k.produto.totais.montagem, 'R$ 130,00');
  assert.match(k.evento.texto, /retirada dos doces/);
});

test('entrega e montagem: valores separados somam no valor final', () => {
  const k = montarContrato(dados({ entrega: 15000, montagem: 13000 }), contratada, '2026-09-10');
  assert.match(clausula10(k).texto, /entrega dos doces e a montagem da mesa/);
  assert.match(clausula10(k).texto, /R\$ 150,00.*R\$ 130,00/);
  assert.equal(k.produto.totais.final, 'R$ 555,00');
  assert.match(k.secoes[0].clausulas[1].texto, /será entregue no local do evento/);
});
