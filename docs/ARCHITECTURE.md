# Arquitetura do GPTCLONE Blog

## Visão Geral

O GPTCLONE Blog é um site estático construído com [Eleventy 3.x](https://www.11ty.dev/), projetado como uma plataforma pública de conhecimento, investigação, educação e diário de projeto. O site é totalmente estático, não requer backend, não necessita de registo de utilizador e é hospedado via GitHub Pages em `https://pedrom3160.github.io/blog/`.

## Stack Tecnológica

| Camada | Tecnologia | Propósito |
|--------|-----------|-----------|
| Gerador | Eleventy (^3.1.8) | Site estático, coleções, filtros, transforms |
| Templates | Nunjucks | Layouts e componentes |
| Conteúdo | Markdown + markdown-it | Artigos e páginas |
| Estilização | CSS moderno (`src/styles/main.css`) | Design system "Graphite & Vermilion" (claro/escuro) |
| Realce de código | Prism (build-time) | Syntax highlighting em blocos com linguagem |
| Interatividade | JavaScript ES Modules (vanilla) | Tema, pesquisa, filtros, TOC, player |
| Testes | Vitest (^3.2.x) + jsdom | Unitários e DOM |
| Pacotes | npm (Node.js 22 LTS) | Gestão de dependências |
| Hospedagem | GitHub Pages + GitHub Actions | Deploy automático |

## Estrutura de Diretórios

```
blog/
├── .eleventy.js              # Configuração: collections, filtros, base path
├── .github/workflows/deploy.yml  # GitHub Actions para Pages
├── docs/                     # Arquitetura, conteúdo, deploy, donativos, contribuição
├── src/
│   ├── _includes/            # base.njk, article.njk, about.njk, header, footer, cards, listing, share, search-modal
│   ├── pages/                # Páginas (njk) + search-index.11ty.js
│   ├── content/              # Markdown: journal/, ai-research/, academy/, authors/
│   ├── _data/                # site.js, navigation.js, suggestions.js, donations.js, catálogos JSON
│   ├── assets/               # Capas editoriais SVG, favicon.svg, social-card.png
│   ├── styles/main.css       # Design system
│   ├── scripts/main.js       # Interatividade cliente
│   ├── scripts/suggestions.js # Validação e handoff do formulário
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
| `/about/` | Sobre (missão, visão, princípios, ficha do projeto) |
| `/suggestions/` | Sugestões (categorias, nome provisório, formulário) |
| `/donations/` | Donativos (motivo, prioridades, transparência, canais, FAQ) |
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

## Navegação primária

Contrato rígido: **exatamente quatro destinos** — Blog (`/`), About (`/about/`), Suggestions
(`/suggestions/`) e Donations (`/donations/`). A lista vive em `src/_data/navigation.js`; o filtro
`isNavActive` marca o estado ativo e o validador falha se qualquer página emitir outro número de
links primários. Secções, etiquetas, pesquisa e paginação são descoberta de conteúdo (homepage e
rodapé), não menus.

## Sugestões e participação

`src/_data/suggestions.js` contém o repositório, as cinco categorias, a data de revisão e um
`endpoint` opcional. Sem endpoint, `src/scripts/suggestions.js` valida o formulário e abre uma
issue pública pré-preenchida no GitHub; não há pedido de email nem confirmação falsa. Com endpoint,
o formulário faz `POST` JSON e só reporta sucesso após uma resposta 2xx. Ver `docs/SUGGESTIONS.md`.
A página e o formulário são cobertos por `tests/suggestions.test.js` e pelo validador.

## Design System

Identidade "Graphite & Vermilion": papel quente `#faf7f1`, tinta `#14161a`, acento vermelhão
`#b5391b` (claro) / `#ff7a4f` (escuro). Tipografia Fraunces (display), Inter (texto) e IBM Plex Mono
(rótulos, metadados, código). Tema claro por defeito; escuro via `prefers-color-scheme`, com escolha
persistida em `localStorage` (`gptclone-theme`). Tokens e componentes em `src/styles/main.css`;
capas editoriais em `src/assets/images/`; cartão social raster em `social-card.png`.

Contraste dos pares principais: acento sobre papel 5,51:1, muted 5,26:1, texto secundário 9,75:1,
acento escuro 7,39:1 (todos ≥ AA).

## Testes e Validação

- `npm test` — Vitest: utilitários de data/pesquisa, comportamento DOM (tema, navegação, filtros), contrato de navegação (4 itens), configuração de donativos e validação/URL do formulário de sugestões.
- `npm run validate` — valida `_site/`: inventário de páginas (inclui `/suggestions/` e `/donations/`), assets, base path, resolução de links internos (com query string), catálogos, RSS/sitemap/canónicas, **navegação primária exatamente Blog · About · Suggestions · Donations**, um único `<h1>`, `lang="pt-PT"`, `<main id="main">`, `alt` em imagens, labels associados, título/descrição SEO, IDs únicos, campos e conteúdo essencial do formulário de sugestões, ausência de linguagem de equipa e JSON-LD (`BlogPosting` + `BreadcrumbList`, imagem absoluta) nos artigos.

## Deploy

`scripts/build.mjs` executa `eleventy --pathprefix=/blog/` (saída `_site/`). O workflow `.github/workflows/deploy.yml` faz: checkout → Node 22 → `npm ci` → `npm test` → `npm run build` → `npm run validate` → upload de `_site` → deploy-pages.

## Princípios de Design

- Site totalmente estático — sem backend, sem base de dados, sem autenticação
- Conteúdo em português europeu (pt-PT) com arquitetura preparada para futuras traduções
- Design original GPTCLONE, não um tema genérico
- Acessibilidade e navegação por teclado
- Design responsivo (desktop, tablet, mobile)
- Conteúdo verdadeiro — nunca apresentar funcionalidades planeadas como implementadas

## CMS de Conte�do (Decap CMS)

O GPTCLONE Blog inclui um **CMS real baseado em Git** (Decap CMS), acess�vel em
`/admin/`, que permite ao propriet�rio criar, editar, pr�-visualizar, publicar,
despublicar e eliminar artigos **sem recorrer a um agente de IA**.

### Componentes

| Componente | Localiza��o | Fun��o |
|---|---|---|
| Interface de administra��o | `src/admin/index.html` | SPA do Decap CMS (CDN `decap-cms@^3.0.0`) |
| Configura��o | `src/admin/config.yml` | Backend, cole��es, campos, media, preview |
| Proxy OAuth/API | `cms-proxy/server.js` | Autentica��o GitHub + encaminhamento da API (Node.js, sem depend�ncias) |
| Pr�-visualiza��o | `src/pages/preview.njk` | Renderiza rascunhos via `?payload=` (JSON) |
| Cole��es CMS | `src/content/{journal,ai-research,academy}/*.md` | Artigos (Markdown + frontmatter) |
| P�gina Sobre | `src/content/about.md` | Ficheiro �nico edit�vel (cole��o `files`) |
| Media | `public/resources/uploads/` | Imagens/PDF carregados pelo CMS |

### Fluxo de dados

```
/admin/ (Decap CMS)  ?  cms-proxy (OAuth GitHub)  ?  GitHub API
                                                          �
                                     commit no ramo main
                                                          �
                             GitHub Actions: test ? build ? validate ? Pages
                                                          �
                                       https://pedrom3160.github.io/blog/
```

### Estados editoriais

- **Rascunho** (`draft: true` no frontmatter): exclu�do automaticamente das
  cole��es p�blicas (`articles`, `journal`, `ai-research`, `academy`, `tags`,
  sitemap) e da pesquisa. Vis�vel e edit�vel no CMS; pr�-visualiz�vel.
- **Publicado** (`draft` ausente/`false`): inclu�do no build e no site.
- **Eliminado**: ficheiro removido do reposit�rio (commit); recuper�vel via
  hist�rico Git.

### Autentica��o e seguran�a

- OAuth do GitHub atrav�s de `cms-proxy/` (servidor externo, pois o GitHub Pages
  � est�tico). O token fica num cookie http-only no dom�nio do proxy; **nenhum
  segredo � exposto no frontend**.
- Requer configura��o externa �nica: OAuth App no GitHub + implanta��o do
  `cms-proxy/` + preenchimento de `base_url`/`auth_endpoint` em
  `src/admin/config.yml`. Ver `CONTENT-MANAGEMENT.md` (sec��o 12) e
  `cms-proxy/README.md`.
- Sem a configura��o, o site p�blico e a edi��o via Git funcionam normalmente;
  apenas `/admin/` n�o autentica.

### Formato do conte�do

Cada artigo � um ficheiro Markdown com frontmatter YAML:

```yaml
---
title: "T�tulo"
description: "Resumo / SEO"
slug: "titulo-do-artigo"
pubDate: 2026-11-18
updatedDate: 2026-11-18        # opcional
author: "GPTCLONE"
image: "/resources/uploads/imagem.jpg"   # opcional
category: "Categoria"
tags: ["tag1", "tag2"]
readingTime: "5 min"           # opcional
draft: false                   # true = rascunho (n�o publicado)
related: ["outro-artigo"]      # opcional (slugs)
---
Corpo do artigo em Markdown.
```

O URL final � `/blog/<cole��o>/<slug>/`. PDFs e audiolivros s�o geridos como
cat�logos JSON (`src/_data/pdfLibrary.json`, `src/_data/audiobookLibrary.json`)
com os ficheiros em `public/resources/`.
