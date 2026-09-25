import { configurado, credenciaisValidas, criarCookie, json, lerJson } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { erro: 'Método não permitido' });
  if (!configurado()) return json(res, 500, { erro: 'Servidor sem credenciais configuradas' });

  let corpo;
  try {
    corpo = await lerJson(req);
  } catch {
    return json(res, 413, { erro: 'Requisição inválida' });
  }

  if (!credenciaisValidas(corpo.usuario, corpo.senha)) {
    // Atraso fixo para dificultar tentativa e erro em massa.
    await new Promise((r) => setTimeout(r, 800));
    return json(res, 401, { erro: 'Usuário ou senha incorretos' });
  }
  return json(res, 200, { ok: true }, { 'Set-Cookie': criarCookie(req) });
}
