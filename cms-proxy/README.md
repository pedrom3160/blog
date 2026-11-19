# GPTCLONE Blog — CMS Proxy (autenticação GitHub para o Decap CMS)

O GitHub Pages serve apenas ficheiros estáticos, pelo que o fluxo OAuth do
GitHub **não pode correr no frontend** (não se podem expor segredos de cliente).
Este servidor Node.js (sem dependências) faz de intermediário seguro entre o
Decap CMS (`/admin/`) e a API do GitHub.

## O que faz

| Rota | Método | Função |
|---|---|---|
| `/` | GET | Health check (`{"status":"ok"}`) |
| `/auth` | GET | Inicia o fluxo OAuth do GitHub (redirect) |
| `/auth/callback` | GET | Troca o `code` por token de acesso; define cookie http-only |
| `/auth/user` | GET | Devolve o utilizador autenticado (ou 401) |
| `/auth/logout` | POST | Limpa a sessão |
| `/api/*` | GET/POST/PUT/PATCH/DELETE | Encaminha para `https://api.github.com/*` com o token |

Apenas `api.github.com` é contactado — nunca URLs arbitrários (prevenção de
SSRF). O token nunca é devolvido ao frontend (cookie http-only; CORS restrito
às origens da CMS).

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `GITHUB_CLIENT_ID` | ✅ | Client ID da OAuth App do GitHub |
| `GITHUB_CLIENT_SECRET` | ✅ | Client Secret da OAuth App do GitHub |
| `BASE_URL` | ✅ | URL pública deste proxy (ex. `https://cms-proxy.onrender.com`) |
| `SESSION_SECRET` | ✅ | Segredo aleatório para assinar o cookie de estado |
| `NODE_ENV` | — | `production` ativa cookies `Secure; SameSite=None` |
| `ALLOWED_ORIGINS` | — | Origens CORS permitidas (padrão inclui `https://pedrom3160.github.io` e localhost) |
| `PORT` | — | Porta (a maioria dos hosts define automaticamente; padrão 8080) |

## Executar localmente

```powershell
$env:GITHUB_CLIENT_ID="..."; $env:GITHUB_CLIENT_SECRET="..."; $env:BASE_URL="http://localhost:8080"; $env:SESSION_SECRET="dev-secret"
node server.js
```

## Implantar (produção)

Qualquer host com Node.js 18+ serve (Render, Railway, Fly.io, VM/container):

1. Crie um serviço Web a partir deste repositório, apontando para a pasta
   `cms-proxy/`.
2. Comando de arranque: `npm start` (ou `node server.js`).
3. Configure as variáveis de ambiente acima.
4. Na OAuth App do GitHub, registe o callback
   `https://<URL-DO-PROXY>/auth/callback` com o scope `repo`.
5. Em `src/admin/config.yml`, substitua `__CMS_PROXY_URL__` pelo URL real:
   ```yaml
   backend:
     name: github
     repo: pedrom3160/blog
     branch: main
     base_url: https://<URL-DO-PROXY>/api
     auth_endpoint: https://<URL-DO-PROXY>/auth
   ```
6. Faça commit e aguarde o deploy do site. Consulte o
   [`CONTENT-MANAGEMENT.md`](../CONTENT-MANAGEMENT.md) para o fluxo completo.

## Segurança

- O token de acesso do GitHub fica apenas num cookie `HttpOnly` no domínio do
  proxy; o frontend nunca lhe acede.
- Validação de `state` (CSRF) com HMAC no callback OAuth.
- CORS restrito (por omissão) a `pedrom3160.github.io` e localhosts de
  desenvolvimento; em produção use `NODE_ENV=production` (cookies Secure).
- O proxy só encaminha para `https://api.github.com` (lista fixa de destinos).
- Sem dependências npm → superfície de ataque mínima.