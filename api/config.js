import { autenticado, json } from './_auth.js';
import { lerContratada } from './_contratada.js';

// Também serve para o navegador saber se a sessão ainda é válida.
export default function handler(req, res) {
  if (!autenticado(req)) return json(res, 401, { erro: 'Não autenticado' });
  try {
    return json(res, 200, { contratada: lerContratada() });
  } catch (e) {
    console.error(e.message);
    return json(res, 500, { erro: e.message });
  }
}
