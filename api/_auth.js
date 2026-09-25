import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'sessao';
const DURACAO_S = 60 * 60 * 12; // 12 horas

function assinar(payload) {
  return createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url');
}

function iguais(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function configurado() {
  return Boolean(process.env.APP_USER && process.env.APP_PASSWORD && process.env.SESSION_SECRET);
}

export function credenciaisValidas(user, senha) {
  // Compara sempre os dois campos, para não vazar qual deles errou.
  const okUser = iguais(user ?? '', process.env.APP_USER);
  const okSenha = iguais(senha ?? '', process.env.APP_PASSWORD);
  return okUser && okSenha;
}

export function criarCookie(req) {
  const exp = Math.floor(Date.now() / 1000) + DURACAO_S;
  const valor = `${exp}.${assinar(String(exp))}`;
  return montarCookie(valor, DURACAO_S, req);
}

export function cookieDeSaida(req) {
  return montarCookie('', 0, req);
}

function montarCookie(valor, maxAge, req) {
  const https = req.headers['x-forwarded-proto'] === 'https';
  return [
    `${COOKIE}=${valor}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
    https ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function autenticado(req) {
  if (!configurado()) return false;
  const cookies = (req.headers.cookie ?? '').split(';').map((c) => c.trim());
  const c = cookies.find((x) => x.startsWith(`${COOKIE}=`));
  if (!c) return false;
  const [exp, sig] = c.slice(COOKIE.length + 1).split('.');
  if (!exp || !sig || !iguais(sig, assinar(exp))) return false;
  return Number(exp) > Math.floor(Date.now() / 1000);
}

export function json(res, status, corpo, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end(JSON.stringify(corpo));
}

export async function lerJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const partes = [];
  let tamanho = 0;
  for await (const p of req) {
    tamanho += p.length;
    if (tamanho > 10_000) throw new Error('corpo grande demais');
    partes.push(p);
  }
  try {
    return JSON.parse(Buffer.concat(partes).toString('utf8') || '{}');
  } catch {
    return {};
  }
}
