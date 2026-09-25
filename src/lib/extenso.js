const UN = [
  'zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
  'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove',
];
const DEZ = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CEN = [
  '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
  'seiscentos', 'setecentos', 'oitocentos', 'novecentos',
];
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function ate999(n) {
  if (n === 100) return 'cem';
  const c = Math.floor(n / 100);
  const r = n % 100;
  const partes = [];
  if (c) partes.push(CEN[c]);
  if (r) {
    if (r < 20) partes.push(UN[r]);
    else {
      const d = Math.floor(r / 10);
      const u = r % 10;
      partes.push(u ? `${DEZ[d]} e ${UN[u]}` : DEZ[d]);
    }
  }
  return partes.join(' e ');
}

// Inteiros de 0 a 999.999.999.
export function inteiroPorExtenso(n) {
  if (!Number.isInteger(n) || n < 0 || n > 999_999_999) throw new RangeError('fora do intervalo');
  if (n === 0) return 'zero';
  const milhoes = Math.floor(n / 1_000_000);
  const milhares = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;

  const partes = [];
  if (milhoes) partes.push({ v: milhoes, t: milhoes === 1 ? 'um milhão' : `${ate999(milhoes)} milhões` });
  if (milhares) partes.push({ v: milhares, t: milhares === 1 ? 'mil' : `${ate999(milhares)} mil` });
  if (resto) partes.push({ v: resto, t: ate999(resto) });

  // "e" antes da última parte quando ela é menor que 100 ou centena exata.
  return partes.reduce((acc, p, i) => {
    if (i === 0) return p.t;
    const ultima = i === partes.length - 1;
    return acc + (ultima && (p.v < 100 || p.v % 100 === 0) ? ' e ' : ' ') + p.t;
  }, '');
}

export function valorPorExtenso(cents) {
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  const partes = [];
  if (reais > 0) {
    const de = reais % 1_000_000 === 0 ? ' de' : '';
    partes.push(`${inteiroPorExtenso(reais)}${de} ${reais === 1 ? 'real' : 'reais'}`);
  }
  if (centavos > 0) {
    partes.push(`${inteiroPorExtenso(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`);
  }
  return partes.length ? partes.join(' e ') : 'zero reais';
}

function partesData(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? { ano: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]) } : null;
}

// "2026-11-21" -> "vinte e um de novembro de dois mil e vinte e seis"
export function dataPorExtenso(iso) {
  const { ano, mes, dia } = partesData(iso);
  const d = dia === 1 ? 'primeiro' : inteiroPorExtenso(dia);
  return `${d} de ${MESES[mes - 1]} de ${inteiroPorExtenso(ano)}`;
}

// "2026-11-21" -> "21/11/2026"
export function dataCurta(iso) {
  const { ano, mes, dia } = partesData(iso);
  return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
}

// "2026-09-10" -> "10 de setembro de 2026"
export function dataLonga(iso) {
  const { ano, mes, dia } = partesData(iso);
  return `${dia} de ${MESES[mes - 1]} de ${ano}`;
}

export function hojeISO(agora = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`;
}
