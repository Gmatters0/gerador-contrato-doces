import { cookieDeSaida, json } from './_auth.js';

export default function handler(req, res) {
  return json(res, 200, { ok: true }, { 'Set-Cookie': cookieDeSaida(req) });
}
