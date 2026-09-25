export function brl(cents) {
  const v = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `R$ ${v}`;
}

// "5,50" | "5.5" | "1.234,56" | "1.234" -> centavos (inteiro). Inválido -> NaN.
export function parseReais(texto) {
  let s = String(texto ?? '').replace(/[^\d.,]/g, '');
  if (!s) return NaN;
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes('.')) {
    const ultimo = s.split('.').pop();
    s = ultimo.length === 3 ? s.replace(/\./g, '') : s; // "1.234" é milhar; "5.5" é decimal
  }
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

const so = (v) => String(v ?? '').replace(/\D/g, '');

export function mascaraCpf(v) {
  const d = so(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

export function mascaraTelefone(v) {
  const d = so(v).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function cpfValido(cpf) {
  const d = so(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (base) => {
    let soma = 0;
    for (let i = 0; i < base; i++) soma += Number(d[i]) * (base + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]);
}

export function nomeDeArquivo(nome) {
  const limpo = String(nome).replace(/[\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
  return `CONTRATO ${limpo || 'sem nome'}.pdf`;
}
