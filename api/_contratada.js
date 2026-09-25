// Dados da Contratada (nome, RG, CPF, CNPJ, endereço, telefone, e-mail, cidade).
// Ficam fora do repositório: vêm da variável de ambiente CONTRATADA_JSON (um JSON em uma linha)
// e só chegam ao navegador depois do login (GET /api/config).
export function lerContratada() {
  const bruto = process.env.CONTRATADA_JSON;
  if (!bruto) throw new Error('CONTRATADA_JSON não configurada');
  const c = JSON.parse(bruto);
  for (const campo of ['nome', 'rg', 'cpf', 'cnpj', 'endereco', 'telefone', 'email', 'cidade']) {
    if (!c[campo]) throw new Error(`CONTRATADA_JSON sem o campo "${campo}"`);
  }
  return c;
}
