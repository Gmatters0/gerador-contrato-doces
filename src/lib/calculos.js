// itens: [{ qtd: inteiro, precoCents: inteiro }]. Tudo em centavos para não somar float.
export function subtotal(item) {
  return item.qtd * item.precoCents;
}

// servicos: { entrega, montagem } em centavos (0 = não contratado).
export function totais(itens, servicos = {}) {
  const doces = itens.reduce((s, i) => s + subtotal(i), 0);
  const entrega = servicos.entrega ?? 0;
  const montagem = servicos.montagem ?? 0;
  return { doces, entrega, montagem, final: doces + entrega + montagem };
}
