import test from 'node:test';
import assert from 'node:assert/strict';
import { inteiroPorExtenso, valorPorExtenso, dataPorExtenso, dataCurta, dataLonga } from '../src/lib/extenso.js';
import { parseReais, cpfValido, mascaraCpf, mascaraTelefone, brl, nomeDeArquivo } from '../src/lib/formato.js';
import { totais } from '../src/lib/calculos.js';
import { validar } from '../src/lib/validacao.js';

test('inteiros por extenso', () => {
  assert.equal(inteiroPorExtenso(0), 'zero');
  assert.equal(inteiroPorExtenso(21), 'vinte e um');
  assert.equal(inteiroPorExtenso(100), 'cem');
  assert.equal(inteiroPorExtenso(101), 'cento e um');
  assert.equal(inteiroPorExtenso(1000), 'mil');
  assert.equal(inteiroPorExtenso(1100), 'mil e cem');
  assert.equal(inteiroPorExtenso(1930), 'mil novecentos e trinta');
  assert.equal(inteiroPorExtenso(2026), 'dois mil e vinte e seis');
  assert.equal(inteiroPorExtenso(12345), 'doze mil trezentos e quarenta e cinco');
  assert.equal(inteiroPorExtenso(1_000_000), 'um milhão');
});

test('valor por extenso', () => {
  assert.equal(valorPorExtenso(193000), 'mil novecentos e trinta reais');
  assert.equal(valorPorExtenso(165000), 'mil seiscentos e cinquenta reais');
  assert.equal(valorPorExtenso(28000), 'duzentos e oitenta reais');
  assert.equal(valorPorExtenso(100), 'um real');
  assert.equal(valorPorExtenso(150), 'um real e cinquenta centavos');
  assert.equal(valorPorExtenso(1), 'um centavo');
  assert.equal(valorPorExtenso(0), 'zero reais');
});

test('datas', () => {
  assert.equal(dataPorExtenso('2026-11-21'), 'vinte e um de novembro de dois mil e vinte e seis');
  assert.equal(dataPorExtenso('2026-12-01'), 'primeiro de dezembro de dois mil e vinte e seis');
  assert.equal(dataCurta('2026-11-21'), '21/11/2026');
  assert.equal(dataLonga('2026-09-10'), '10 de setembro de 2026');
});

test('parse de reais', () => {
  assert.equal(parseReais('5,50'), 550);
  assert.equal(parseReais('5.5'), 550);
  assert.equal(parseReais('1.234,56'), 123456);
  assert.equal(parseReais('1.234'), 123400);
  assert.equal(parseReais('R$ 33'), 3300);
  assert.ok(Number.isNaN(parseReais('')));
  assert.ok(Number.isNaN(parseReais('abc')));
});

test('cpf e máscaras', () => {
  assert.equal(cpfValido('529.982.247-25'), true);
  assert.equal(cpfValido('111.111.111-11'), false);
  assert.equal(cpfValido('529.982.247-26'), false);
  assert.equal(mascaraCpf('52998224725'), '529.982.247-25');
  assert.equal(mascaraTelefone('11987654321'), '(11) 98765-4321');
  assert.equal(mascaraTelefone('1133334444'), '(11) 3333-4444');
});

test('totais: doces + entrega + montagem, cada um opcional', () => {
  const itens = Array.from({ length: 6 }, () => ({ qtd: 50, precoCents: 550 }));
  assert.deepEqual(totais(itens, { entrega: 15000, montagem: 13000 }), { doces: 165000, entrega: 15000, montagem: 13000, final: 193000 });
  assert.deepEqual(totais(itens, { entrega: 15000, montagem: null }), { doces: 165000, entrega: 15000, montagem: 0, final: 180000 });
  assert.deepEqual(totais(itens, { entrega: 0, montagem: 13000 }).final, 178000);
  assert.deepEqual(totais(itens), { doces: 165000, entrega: 0, montagem: 0, final: 165000 });
  assert.equal(brl(193000), 'R$ 1.930,00');
});

test('nome de arquivo', () => {
  assert.equal(nomeDeArquivo('Vitória da Silva Gonzaga'), 'CONTRATO Vitória da Silva Gonzaga.pdf');
  assert.equal(nomeDeArquivo('A/B:C'), 'CONTRATO ABC.pdf');
});

const formOk = () => ({
  contratante: { nome: 'Maria Souza', cpf: '529.982.247-25', rg: '', endereco: 'Rua A, 1', telefone: '(11) 99999-9999', email: '' },
  itens: [{ id: 1, tipo: 'Bombom', sabor: '', qtd: '50', preco: '5,50' }],
  entrega: { ativa: false, valor: '' },
  montagem: { ativa: false, valor: '' },
  forma: 'Pagamento via transferência Pix.',
  evento: { data: '2026-11-21', hora: '15:30', horaEntrega: '12:00', local: 'Salão X' },
});

test('validação', () => {
  const ok = validar(formOk(), '2026-09-10');
  assert.deepEqual(ok.erros, {});
  assert.equal(ok.dados.forma, 'Pagamento via transferência Pix');
  assert.deepEqual(ok.dados.servicos, { entrega: null, montagem: null });

  const s = formOk();
  s.entrega = { ativa: true, valor: '150,00' };
  s.montagem = { ativa: true, valor: '' };
  const rs = validar(s, '2026-09-10');
  assert.equal(rs.dados.servicos.entrega, 15000);
  assert.equal(rs.erros.montagem, 'Informe o valor');
  assert.equal(rs.erros.entrega, undefined);

  const f = formOk();
  f.contratante.cpf = '123';
  f.itens[0].qtd = '0';
  f.evento.data = '2026-01-01';
  const r = validar(f, '2026-09-10');
  assert.ok(r.erros.cpf && r.erros['item:1'].qtd && r.erros.data);
});
