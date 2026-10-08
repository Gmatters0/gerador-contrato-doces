import test from 'node:test';
import assert from 'node:assert/strict';
import { montarContrato } from '../src/contrato/texto.js';

const contratada = { nome: 'Ana Exemplo', rg: '1', cpf: '529.982.247-25', cnpj: '2', endereco: 'Rua X', telefone: '(11) 90000-0000', email: 'a@b.c', cidade: 'Guarulhos' };
const dados = (servicos, descontoPct = 0, degustacao = null) => ({
  contratante: { nome: 'Maria Souza', cpf: '529.982.247-25', rg: '', endereco: 'Rua A, 1', telefone: '(11) 99999-9999', email: '' },
  itens: [{ tipo: 'Bombom', sabor: '', qtd: 50, precoCents: 550 }],
  servicos,
  descontoPct,
  degustacao,
  forma: 'Pagamento via transferência Pix',
  evento: { data: '2026-11-21', hora: '15:30', horaEntrega: '12:00', local: 'Salão X' },
});
const clausula6 = (k) => k.secoesPosProduto[0].clausulas[0].texto;
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

test('sem desconto: sem menção na Cláusula 6 e sem linha de desconto nos totais', () => {
  const k = montarContrato(dados({ entrega: null, montagem: null }), contratada, '2026-09-10');
  assert.doesNotMatch(clausula6(k), /desconto/);
  assert.equal(k.produto.totais.descontoLinha, null);
  assert.equal(k.produto.totais.final, 'R$ 275,00');
});

test('com desconto: aparece na Cláusula 6, nos totais e reduz o valor final', () => {
  // 275,00 (doces) + 150,00 (entrega) = 425,00; 10% de desconto = 42,50 -> final 382,50
  const k = montarContrato(dados({ entrega: 15000, montagem: null }, 10), contratada, '2026-09-10');
  assert.match(clausula6(k), /desconto de 10%, no valor de \*\*R\$ 42,50\*\*/);
  assert.deepEqual(k.produto.totais.descontoLinha, { rotulo: 'Desconto (10%)', valor: '- R$ 42,50' });
  assert.equal(k.produto.totais.final, 'R$ 382,50');
});

test('desconto com percentual fracionário', () => {
  const k = montarContrato(dados({ entrega: null, montagem: null }, 12.5), contratada, '2026-09-10');
  // 275,00 com 12,5% de desconto = 34,375 -> arredonda para 34,38
  assert.deepEqual(k.produto.totais.descontoLinha, { rotulo: 'Desconto (12,5%)', valor: '- R$ 34,38' });
  assert.equal(k.produto.totais.final, 'R$ 240,62');
});

test('degustação: aparece na Cláusula 6 e nos totais, depois do desconto percentual', () => {
  // 275,00 + 150,00 = 425,00; -10% (42,50) = 382,50; -degustação 50,00 = 332,50
  const k = montarContrato(dados({ entrega: 15000, montagem: null }, 10, 5000), contratada, '2026-09-10');
  assert.match(clausula6(k), /desconto da degustação no valor de \*\*R\$ 50,00\*\* \(cinquenta reais\)/);
  assert.deepEqual(k.produto.totais.degustacaoLinha, { rotulo: 'Desconto da degustação', valor: '- R$ 50,00' });
  assert.equal(k.produto.totais.final, 'R$ 332,50');
  assert.match(clausula6(k), /remunerado pela quantia de \*\*R\$ 332,50\*\*/);
});

test('degustação sozinha, sem desconto percentual', () => {
  const k = montarContrato(dados({ entrega: null, montagem: null }, 0, 5000), contratada, '2026-09-10');
  assert.equal(k.produto.totais.descontoLinha, null);
  assert.equal(k.produto.totais.final, 'R$ 225,00');
  assert.doesNotMatch(clausula6(k), /desconto de/);
});

test('sem degustação: sem linha nem menção', () => {
  const k = montarContrato(dados({ entrega: null, montagem: null }), contratada, '2026-09-10');
  assert.equal(k.produto.totais.degustacaoLinha, null);
  assert.doesNotMatch(clausula6(k), /degustação/);
});

test('assinatura da contratada: usa a imagem quando existe e fica em branco quando não', () => {
  const sem = montarContrato(dados({ entrega: null, montagem: null }), contratada, '2026-09-10');
  assert.equal(sem.assinaturas[0].imagem, null);
  assert.equal(sem.assinaturas[1].imagem, undefined);
  const com = montarContrato(dados({ entrega: null, montagem: null }), { ...contratada, assinatura: 'data:image/png;base64,AAAA' }, '2026-09-10');
  assert.equal(com.assinaturas[0].imagem, 'data:image/png;base64,AAAA');
  assert.equal(com.assinaturas[1].imagem, undefined); // contratante nunca recebe imagem
});
