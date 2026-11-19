# GPTCLONE Blog

Publicação independente sobre inteligência artificial: notas de investigação, diário de projeto e material educativo.

**Produção:** https://pedrom3160.github.io/blog/
**Repositório:** https://github.com/pedrom3160/blog

## Identidade e navegação

O site tem **exatamente quatro destinos na navegação principal**:

| Menu | Destino |
|------|---------|
| Blog | `/` — homepage editorial com destaque, arquivo, áreas de conteúdo e temas |
| About | `/about/` — projeto, missão, visão, princípios e limites |
| Suggestions | `/suggestions/` — convite à participação, nome provisório e formulário |
| Donations | `/donations/` — modelo de apoio, prioridades e estado dos canais |

As secções de conteúdo (Jornal, Investigação em IA, Academy, Bibliotecas, Etiquetas e Pesquisa) são
descoberta de conteúdo: vivem na homepage e no rodapé, e **não** são menus adicionais.

## Conteúdo

- **Jornal GPTCLONE** — notícias, atualizações de desenvolvimento, marcos e decisões técnicas.
- **Investigação em IA** — IA, ML, DL, LLMs, Transformers, tokenização e temas relacionados.
- **GPTCLONE Academy** — caminhos de aprendizagem estruturados.
- **Biblioteca PDF** — documentos técnicos de amostra (CC-BY-4.0).
- **Biblioteca de Audiolivros** — catálogo com placeholders honestos e um leitor de áudio funcional.
- **Pesquisa** — modal global (`/`) e página dedicada sobre `search-index.json`.

Idioma: **português europeu (pt-PT)**. A arquitetura está preparada para expansão multilingue.

## Publicar e manter conteúdo

O percurso recomendado não exige um CMS: os artigos são Markdown no repositório e os recursos
são ficheiros mais entradas de catálogo.

- [Guia geral de publicação](docs/PUBLISHING_GUIDE.md) — comece aqui.
- [Artigos](docs/ARTICLES_GUIDE.md) — frontmatter, Markdown, imagens, pré-visualização e publicação.
- [PDFs](docs/PDF_LIBRARY_GUIDE.md) — ficheiros, catálogo, tamanho e download.
- [Áudio e audiolivros](docs/AUDIOBOOKS_GUIDE.md) — formatos, catálogo, player e acessibilidade.
- [Referência técnica de conteúdo](docs/CONTENT_GUIDE.md).
- [Sugestões e privacidade](docs/SUGGESTIONS.md).

A interface opcional em `/admin/` (Decap CMS) continua documentada em
[CONTENT-MANAGEMENT.md](CONTENT-MANAGEMENT.md), mas exige uma OAuth App e um proxy Node.js
configurados; não é necessária para publicar pelo GitHub.

## Design system

Identidade editorial própria, documentada em `src/styles/main.css`:

- **Graphite & Vermilion** — papel quente (`#faf7f1`) e tinta grafite no tema claro; grafite profundo no tema escuro; acento vermelhão (`#b5391b` / `#ff7a4f`).
- **Tipografia** — Fraunces (títulos), Inter (texto), IBM Plex Mono (rótulos, metadados e código).
- **Grelha editorial** — linhas finas, cartões sem sombras pesadas, numeração de secções, capa em “placa” escura.
- **Tema** — claro por defeito, escuro conforme `prefers-color-scheme`; escolha persistida em `localStorage`.
- **Acessibilidade** — contraste AA/AAA nos pares principais, foco visível, `prefers-reduced-motion`, navegação por teclado e skip link.

## Stack

- [Eleventy 3.x](https://www.11ty.dev/) + Nunjucks
- Markdown (markdown-it) com realce de sintaxe Prism no build
- CSS moderno sem frameworks
- JavaScript vanilla (tema, pesquisa, filtros, TOC, progresso de leitura, copiar código/ligação, áudio)
- [Vitest](https://vitest.dev/) + jsdom
- Node.js 22 LTS + npm
- GitHub Actions → GitHub Pages

## Comandos

```bash
npm install          # dependências
npm run dev          # servidor local (http://localhost:8080/blog/)
npm run build        # build de produção em _site/ com base path /blog/
npm run validate     # valida o output (rotas, links, SEO, acessibilidade, navegação)
npm test             # Vitest
npm run preview      # pré-visualizar o build
npm run generate:samples
```

## Estrutura

```
.eleventy.js              Configuração: coleções, filtros, realce, base path
src/
  _includes/
    layouts/              base.njk, article.njk, about.njk
    components/           header, footer, cards, listing, share, search-modal
  pages/                  homepage, secções, about, suggestions, donations, bibliotecas,
                          tags, pesquisa, 404, rss, sitemap, search-index, preview
  content/                Markdown (journal, ai-research, academy, authors) + about.md
  _data/                  site.js, navigation.js, suggestions.js, donations.js, catálogos JSON
  assets/                 capas editoriais SVG, favicon, social-card.png
  styles/main.css         Design system completo
  scripts/main.js         Interações cliente
  scripts/suggestions.js  Validação e handoff do formulário de sugestões
  utils/                  datas e pesquisa (testados)
public/resources/         PDFs e áudio de amostra
scripts/                  build.mjs, validate.mjs, generate-samples.mjs, migrate-content.mjs
tests/                    Vitest (datas, pesquisa, DOM, navegação/donativos)
docs/                     Arquitetura, guias de publicação, conteúdo, deploy, donativos, sugestões
reports/                  Auditoria e relatório de redesign
```

## Navegação e contratos

- A navegação primária é gerada a partir de `src/_data/navigation.js` (4 itens).
- `npm run validate` falha se qualquer página tiver mais ou menos de quatro links primários, se os
  rótulos não forem `Blog · About · Suggestions · Donations`, se faltar `<h1>` único, `lang="pt-PT"`,
  `alt` em imagens, metadados SEO, JSON-LD de artigo, labels associados, IDs duplicados, ou se
  aparecer a assinatura antiga de equipa ou o título promocional retirado.
- Os URLs existentes são preservados; as rotas novas são `/donations/` (missão anterior) e
  `/suggestions/`.

## Base path

O site é servido em `/blog/`. `pathPrefix` adiciona o prefixo via filtro `| url`; um transform
reescreve URLs relativos à raiz no HTML final. `absoluteUrl` aceita URLs com ou sem prefixo e
normaliza para `https://pedrom3160.github.io/blog/...`.

## Donativos

`src/_data/donations.js` é o único ponto de configuração. Sem canais verificados, `/donations/`
mostra um estado vazio explícito em vez de uma ligação inventada. Ver `docs/DONATIONS.md`.

## Sugestões

`/suggestions/` apresenta as categorias de contributo, a explicação do nome provisório e um
formulário. Por omissão, o formulário não tem backend: valida os campos e prepara uma issue
pública no GitHub, que o visitante confirma. Não existe falsa confirmação de envio e não é
pedido email nesse modo.

Para receber sugestões sem exigir uma conta GitHub, crie um formulário Web3Forms e defina a
variável pública `WEB3FORMS_ACCESS_KEY` no repositório (Actions → Variables) ou no ambiente de
build. O formulário passa então a enviar por `POST` para Web3Forms, com email opcional e o
GitHub ainda disponível como alternativa pública. A chave é pública por desenho; não é um
segredo. Privacidade, spam, retenção e ativação estão em `docs/SUGGESTIONS.md`.

## Licença

Conteúdo publicado sob CC-BY-4.0, salvo indicação em contrário.

## Limites arquiteturais

O Blog é independente do GPTCLONE Foundation, Studio, Router e Model Hub. Não depende de backend,
base de dados, autenticação ou rastreio de terceiros.
