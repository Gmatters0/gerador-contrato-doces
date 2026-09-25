import { createElement } from 'react';
import { hojeISO } from '../lib/extenso.js';
import { nomeDeArquivo } from '../lib/formato.js';
import { montarContrato } from './texto.js';

// Carrega o renderizador de PDF só na hora de gerar (é a parte mais pesada do app).
export async function gerarEBaixar(dados, contratada) {
  const [{ pdf }, { ContratoPDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./ContratoPDF.jsx'),
  ]);

  const contrato = montarContrato(dados, contratada, hojeISO());
  const blob = await pdf(createElement(ContratoPDF, { contrato })).toBlob();

  const nome = nomeDeArquivo(dados.contratante.nome);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return nome;
}
