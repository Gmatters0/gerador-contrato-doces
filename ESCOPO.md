# Escopo — Gerador de Contratos de Doces (versão simplificada)

Base: modelo "CONTRATO Vitória da Silva.pdf".

## 1. Objetivo

Um gerador de contratos, simples e direto. Sem persistência de dados, sem cadastro de clientes, sem histórico.

## 2. Fluxo

```
Login → Formulário (cálculos automáticos) → Gerar PDF (download direto) → Formulário limpo (ciclo recomeça)
```

## 3. Fora do escopo

Banco de dados, histórico, clientes recorrentes, catálogo editável, tela de configurações, assinatura digital, envio por WhatsApp/e-mail, Word, multiusuário.

## 4. Telas

1. **Login:** usuário e senha únicos.
2. **Formulário:** 4 blocos, com o total sendo atualizado em tempo real.
3. **Ação "Gerar PDF":** baixa o arquivo e limpa o formulário.

Sem tela de pré-visualização separada. Se sobrar tempo, um painel de prévia ao lado do formulário.

## 5. Campos do formulário

**Contratante:** nome, CPF, RG, endereço, telefone, e-mail.

**Doces (lista dinâmica):** tipo, sabor/variação, quantidade, preço unitário, com adicionar/remover linha. Subtotal por linha e **TOTAL DOCES** automáticos. Os tipos (Trouxinha, Prestígio, Bombom, Pharsalos, Flor, Torre) ficam como sugestões fixas no código, mas o campo aceita texto livre.

**Preço e pagamento:** taxa de transporte/montagem (opcional), **VALOR FINAL** automático (doces + taxa), prazo de pagamento (padrão 15 dias), forma de pagamento (padrão Pix). Valor por extenso automático.

**Evento:** data, horário, horário da entrega, local (nome e endereço), retirada ou entrega + montagem.

**Automático:** data de emissão (hoje), data do evento por extenso, nome do arquivo `CONTRATO {Nome}.pdf`.

**Lógica condicional:** retirada omite a Cláusula 10 (taxa) e renumera as cláusulas.

**Texto fixo:** dados da Contratada e cláusulas 1–9, no código.

## 6. Cálculos

- Subtotal = quantidade × preço unitário
- TOTAL DOCES = soma dos subtotais
- VALOR FINAL = TOTAL DOCES + taxa de transporte/montagem
- Valores e datas por extenso gerados por código

## 7. Proposta técnica

- Aplicação web de página única (Vite + React ou HTML/JS puro), com PDF gerado no navegador (`html2pdf.js`/`jsPDF`).
- Nada é armazenado: o estado vive na memória e é descartado depois do download.
- Hospedagem gratuita (Vercel ou Netlify).

**Sobre o login:** como não há servidor, uma senha checada só no navegador não protege nada (fica visível no código, inclusive os dados da Contratada). Opções:

| Opção | Segurança | Esforço |
|---|---|---|
| A. Senha única no servidor (Vercel/Netlify: middleware ou função de login com cookie) | Real | +2–3 h |
| B. Proteção por senha da própria hospedagem (HTTP Basic Auth) | Real, sem tela de login própria | +0,5 h |
| C. Tela de login só no front-end | Apenas visual | +1 h |

Recomendação: **A**. Mantém a tela de login e a proteção é real.

## 8. Estimativa

| Etapa | Esforço |
|---|---|
| Revisar texto do modelo e decisões (vocês) | 1–2 h |
| Formulário, validações e cálculos | 3–4 h |
| Template do contrato + PDF fiel ao modelo | 4–5 h |
| Cláusula condicional + limpar formulário após o download | 1 h |
| Login (opção A) | 2–3 h |
| Testes com 3 contratos reais + deploy | 3 h |
| **Total** | **≈ 2 dias úteis** (14–18 h) |

Risco principal: fidelidade visual do PDF e quebra de página com muitos itens.

## 9. Critérios de aceite

- Reproduzir o contrato da Vitória da Silva (R$ 1.930,00, data por extenso) com resultado equivalente ao PDF original.
- Novo contrato do zero em menos de 3 minutos.
- Sem login válido, não acessa nem o formulário nem os dados da Contratada.
- Nenhum dado do cliente gravado ou enviado a servidor.
- Funciona no celular e no desktop.

## 10. Pontos do modelo a corrigir (antes de virar template)

1. Cláusula 4: "contratada deverá efetuar o pagamento" → *contratante*.
2. Erros: "nada data" → "na data"; "presto" → "prestado"; "perdera" → "perderá".
3. Cláusula 8 (10 dias) × Parágrafo único (20 dias): esclarecer a que cada prazo se aplica.
4. Cláusula 1 diz só "doces gourmet", enquanto o preâmbulo cita "bolo e doces gourmet".
5. Mistura de gênero ("contratado"/"contratada").
6. Cláusula 6 só prevê Pix; precisa funcionar com outras formas de pagamento.
7. Sem foro; e, por coletar CPF/RG, uma cláusula de LGPD seria prudente.

## 11. Decisões em aberto

1. Login: opção A, B ou C?
2. Corrigimos os erros do modelo já na versão automatizada?
3. Preço unitário digitado a cada contrato (sem catálogo)?
4. Prazos (15 dias, 10/20 dias) e taxa de R$ 280 são sempre iguais ou variam?
