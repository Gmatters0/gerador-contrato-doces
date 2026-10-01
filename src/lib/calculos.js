// itens: [{ qtd: inteiro, precoCents: inteiro }]. Tudo em centavos para não somar float.
export function subtotal(item) {
  return item.qtd * item.precoCents;
}

// servicos: { entrega, montagem } em centavos (0 = não contratado).
// descontoPct: percentual (0 a 100) aplicado sobre doces + entrega + montagem.
export function totais(itens, servicos = {}, descontoPct = 0) {
  const doces = itens.reduce((s, i) => s + subtotal(i), 0);
  const entrega = servicos.entrega ?? 0;
  const montagem = servicos.montagem ?? 0;
  const bruto = doces + entrega + montagem;
  const desconto = descontoPct > 0 ? Math.round((bruto * descontoPct) / 100) : 0;
  return { doces, entrega, montagem, desconto, final: bruto - desconto };
}
