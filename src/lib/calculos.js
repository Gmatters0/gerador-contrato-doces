import { TAXA_ENTREGA_CENTS } from './constantes.js';

// itens: [{ qtd: inteiro, precoCents: inteiro }]. Tudo em centavos para não somar float.
export function subtotal(item) {
  return item.qtd * item.precoCents;
}

export function totais(itens, entrega) {
  const doces = itens.reduce((s, i) => s + subtotal(i), 0);
  const taxa = entrega ? TAXA_ENTREGA_CENTS : 0;
  return { doces, taxa, final: doces + taxa };
}
