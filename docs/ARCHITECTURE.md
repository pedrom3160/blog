# Arquitetura do GPTCLONE Blog

## Visão Geral

O GPTCLONE Blog é um site estático construído com [Eleventy 3.x](https://www.11ty.dev/), projetado como uma plataforma pública de conhecimento, investigação, educação e diário de projeto. O site é totalmente estático, não requer backend, não necessita de registo de utilizador e é hospedado via GitHub Pages em `https://pedrom3160.github.io/blog/`.

## Stack Tecnológica

| Camada | Tecnologia | Propósito |
|--------|-----------|-----------|
| Gerador | Eleventy (^3.1.8) | Site estático, coleções, filtros, transforms |
| Templates | Nunjucks | Layouts e componentes |
| Conteúdo | Markdown + markdown-it | Artigos e páginas |
| Estilização | CSS moderno (`src/styles/main.css`) | Design system GPTCLONE (dark/light) |
| Interatividade | JavaScript ES Modules (vanilla) | Tema, pesquisa, filtros, TOC, player |
| Testes | Vitest (^3.2.x) + jsdom | Unitários e DOM |
| Pacotes | npm (Node.js 22 LTS) | Gestão de dependências |
| Hospedagem | GitHub Pages + GitHub Actions | Deploy automático |

## Estrutura de Diretórios

```
blog/
├── .eleventy.js              # Configuração: collections, filtros, base path
├── .github/workflows/deploy.yml  # GitHub Actions para Pages
├── docs/                     # Documentação
├── src/
│   ├── _includes/            # base.njk, article.njk, header, footer, cards, search-modal
│   ├── pages/                # Páginas (njk) + search-index.11ty.js
│   ├── content/              # Markdown: journal/, ai-research/, academy/, authors/
│   ├── _data/                # site.js, navigation.js, pdfLibrary.json, audiobookLibrary.json
│   ├── assets/               # Imagens, favicon.svg
│   ├── styles/main.css       # Design system
│   ├── scripts/main.js       # Interatividade cliente
│   └── utils/                # date.js, search.js
├── public/resources/         # PDFs e áudio de amostra (CC-BY-4.0)
├── scripts/                  # build.mjs, validate.mjs, generate-samples.mjs
├── tests/                    # Testes Vitest
└── package.json
```

## Coleções de Conteúdo

Definidas em `.eleventy.js` (as coleções automáticas não estão disponíveis nesta configuração; são construídas explicitamente):

- **journal**, **ai-research**, **academy** — via `getFilteredByGlob` sobre `src/content/<seção>/*.md`
- **authors** — perfis de autor (`permalink: false`)
- **articles** — união das três coleções de artigos, ordenada por `pubDate`
- **tags** — construída a partir de `tags` no front matter
- **sitePages** — páginas de listagem/navegação

Cada artigo tem front matter: `title`, `description`, `pubDate`, `author`, `tags`, `category`, `slug`, `collection`, `permalink` e dados de diretório em `.11tydata.json` (layout `layouts/article.njk`).

## Rotas do Site

| Rota (sem base path) | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/journal/`, `/journal/[slug]/` | Jornal |
| `/ai-research/`, `/ai-research/[slug]/` | Investigação IA |
| `/academy/`, `/academy/[slug]/` | Academy |
| `/pdf-library/` | Biblioteca PDF |
| `/audiobook-library/` | Biblioteca de audiolivros |
| `/about/` | Sobre |
| `/search/` | Página de pesquisa (+ modal global) |
| `/tags/`, `/tags/[tag]/` | Índice de etiquetas e filtro |
| `/rss.xml` | Feed RSS |
| `/sitemap.xml` | Sitemap |
| `/search-index.json` | Índice de pesquisa |
| `/404.html` | Página de erro |

## Base Path (`/blog/`)

O site é servido sob `/blog/`. Estratégia:

1. `pathPrefix: '/blog/'` no retorno de `return {}` — o filtro interno `| url` adiciona o prefixo.
2. Filtro `absoluteUrl` — `https://pedrom3160.github.io/blog/` + URL não prefixado.
3. Transform `base-path-links` — reescreve `href|src|poster|srcset` começados por `/` para `/blog/...` no HTML de saída (cobre links em Markdown).

Permalinks no conteúdo são escritos **sem** o prefixo; `page.url` é não prefixado.

## Design System

Paleta purple & aurora: `#1b1836`, `#242044`, `#39416D`, `#7047D7`, `#A66BFF`, `#16C9D8`, `#F2EEFF`. Tema escuro é o padrão; tema claro completo via `data-theme="light"`, com preferência do sistema e persistência em `localStorage` (`gptclone-theme`). Variáveis CSS custom em `src/styles/main.css`.

## Testes e Validação

- `npm test` — Vitest: utilitários de data/pesquisa e comportamento DOM (tema, navegação, filtros) via jsdom.
- `npm run validate` — valida `_site/`: inventário de páginas, assets, ausência de URLs sem `/blog` ou com `/blog/blog`, resolução de links internos, existência de recursos de catálogo, sanidade de RSS/sitemap/canônicas.

## Deploy

`scripts/build.mjs` executa `eleventy --pathprefix=/blog/` (saída `_site/`). O workflow `.github/workflows/deploy.yml` faz: checkout → Node 22 → `npm ci` → `npm test` → `npm run build` → `npm run validate` → upload de `_site` → deploy-pages.

## Princípios de Design

- Site totalmente estático — sem backend, sem base de dados, sem autenticação
- Conteúdo em português europeu (pt-PT) com arquitetura preparada para futuras traduções
- Design original GPTCLONE, não um tema genérico
- Acessibilidade e navegação por teclado
- Design responsivo (desktop, tablet, mobile)
- Conteúdo verdadeiro — nunca apresentar funcionalidades planeadas como implementadas
