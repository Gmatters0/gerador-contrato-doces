# Gerador de Contratos de Doces

Login → formulário com cálculos automáticos → PDF baixado direto → formulário limpo.
Nada do cliente é gravado nem enviado a servidor: o PDF é montado no navegador.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # defina usuário, senha e segredo
npm run dev                  # http://localhost:5173
npm test                     # cálculos, valores por extenso, CPF, validação
```

## Publicar (Vercel)

1. Suba o projeto para um repositório **privado** e importe na Vercel (detecta Vite e a pasta `api/` sozinha).
2. Em *Settings → Environment Variables*, cadastre `APP_USER`, `APP_PASSWORD`, `SESSION_SECRET` e `CONTRATADA_JSON` (modelo em `.env.example`)
   (um texto longo e aleatório, ex.: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
3. Faça o deploy. Sem login válido, `/api/config` responde 401 e os dados da Contratada não saem do servidor.

## Onde mudar as coisas

| O quê | Onde |
|---|---|
| Dados da Contratada (nome, CPF, endereço…) | variável `CONTRATADA_JSON` (`.env.local` ou Vercel) |
| Prazos de 15/10/20 dias, forma de pagamento padrão, sugestões de doces | `src/lib/constantes.js` |
| Texto das cláusulas | `src/contrato/texto.js` |
| Visual do PDF (cores, fontes, espaçamentos) | `src/contrato/ContratoPDF.jsx` |
| Visual do formulário | `src/estilo.css` |

## Sessão

Cookie assinado (HMAC), `HttpOnly`, `SameSite=Strict`, válido por 12 horas. Sair invalida o cookie no navegador.
