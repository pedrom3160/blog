# Deploy — GPTCLONE Blog

## Visão Geral

O GPTCLONE Blog é um site estático construído com Eleventy 3.x e hospedado no GitHub Pages. O build é produzido pelo GitHub Actions e os ficheiros estáticos são servidos diretamente.

URL de produção: `https://pedrom3160.github.io/blog/`

## Stack de Deploy

- **Gerador de site estático:** Eleventy (`@11ty/eleventy` ^3.1.8)
- **Hospedagem:** GitHub Pages (gratuito, público)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)
- **Runtime:** Node.js 22 LTS
- **Gestor de pacotes:** npm (`package-lock.json`)

## Workflow do GitHub Actions

O workflow está em `.github/workflows/deploy.yml` e é executado em cada push para o branch `main` (e manualmente via `workflow_dispatch`):

1. **Checkout** — `actions/checkout@v4`
2. **Setup Node.js** — `actions/setup-node@v4` com Node 22
3. **Install dependencies** — `npm ci`
4. **Run tests** — `npm test` (Vitest)
5. **Build site** — `npm run build` → `node scripts/build.mjs` → `eleventy --pathprefix=/blog/` (saída `_site/`)
6. **Validate build output** — `npm run validate` (links, assets, base path, SEO)
7. **Setup Pages / Upload artifact** — `actions/configure-pages@v5` + `actions/upload-pages-artifact@v3` (caminho `./_site`)
8. **Deploy** — `actions/deploy-pages@v4`

Permissões: `contents: read`, `pages: write`, `id-token: write`. Concurrency group `pages`.

## Configuração do GitHub Pages

No repositório GitHub (`pedrom3160/blog`):

1. Ir a **Settings** → **Pages**
2. Em **Build and deployment**, selecionar **Source: GitHub Actions**
3. O workflow irá automaticamente construir e deployar em cada push para `main`
4. O site ficará disponível em `https://pedrom3160.github.io/blog/`

## Build Local

```powershell
# Instalar dependências
npm install

# Build de produção (base path /blog/, saída _site/)
npm run build

# Validar o output
npm run validate

# Pré-visualizar localmente
npm run preview
```

O resultado do build fica em `_site/`:
- `index.html`, páginas de cada secção e artigos
- `styles/`, `scripts/`, `assets/` — copiados de `src/`
- `resources/` — PDFs e áudio de amostra de `public/resources/`
- `rss.xml`, `sitemap.xml`, `robots.txt`, `search-index.json`

## Verificação

Antes de fazer push, executar localmente:

```powershell
npm test             # Testes unitários e DOM
npm run build        # Build de produção
npm run validate     # Validação de links/assets/base path
```

## Limitações

- Site totalmente estático — sem backend, sem base de dados
- Sem autenticação nem registo de utilizador
- Pesquisa no cliente sobre `search-index.json`
- PDFs e audiolivros só estão disponíveis se os ficheiros físicos existirem em `public/resources/` (3 PDFs de amostra CC-BY-4.0 gerados por `npm run generate:samples`; entradas de audiolivro são placeholders)
