# GPTCLONE Blog

Plataforma pública de conhecimento, investigação, educação e diário de projeto do GPTCLONE.

**URL de produção:** https://pedrom3160.github.io/blog/

## Idioma

Português Europeu (pt-PT). Arquitetura preparada para expansão multilingue.

## Secções de conteúdo

- **Jornal GPTCLONE** — Notícias, atualizações de desenvolvimento, marcos, decisões técnicas.
- **Biblioteca PDF** — Catálogo de documentos técnicos (PDFs de amostra CC-BY-4.0).
- **Biblioteca de Audiolivros** — Material educativo em formato áudio (entradas placeholder, áudio em breve).
- **Investigação em IA** — IA, ML, DL, LLMs, Transformers, Tokenização e muito mais.
- **GPTCLONE Academy** — Caminhos de aprendizagem estruturados.
- **Pesquisa** — Modal de pesquisa global e página de pesquisa, sobre `search-index.json`.

## Stack

- [Eleventy 3.x](https://www.11ty.dev/) — Gerador de sites estáticos
- Nunjucks — Templates
- Markdown — Conteúdo
- CSS moderno (design system próprio, sem frameworks CSS)
- JavaScript ES Modules (vanilla, sem frameworks)
- [Vitest](https://vitest.dev/) — Testes
- Node.js 22 LTS + npm

## Comandos

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Build de produção (base path /blog/, saída em _site/)
npm run build

# Validar o output do build (links, assets, base path, SEO)
npm run validate

# Pré-visualizar build
npm run preview

# Executar testes (Vitest)
npm test

# Regenerar PDFs/áudio de amostra
npm run generate:samples
```

## Estrutura de diretórios

```
.eleventy.js        Configuração Eleventy (collections, filtros, base path)
src/
  _includes/        Layouts e componentes Nunjucks
  pages/            Páginas e rotas (njk, 11ty.js)
  content/          Conteúdo Markdown (journal, ai-research, academy, authors)
  _data/            Dados globais (site, navigation, catálogos JSON)
  assets/           Imagens, favicon
  styles/           Design system (main.css)
  scripts/          Interatividade cliente (main.js)
  utils/            Utilitários (datas, pesquisa)
public/
  resources/        PDFs e áudio de amostra
scripts/            build.mjs, validate.mjs, generate-samples.mjs
tests/              Testes Vitest
.github/workflows/  Deploy para GitHub Pages
```

## Base path

O site é servido em `/blog/`. Todos os URLs relativos à raiz são reescritos para `/blog/...` por um transform de build (ver `.eleventy.js`).

## Licença

Conteúdo publicado sob licença CC-BY-4.0 salvo indicação em contrário.

## Limites arquitetónicos

O Blog é uma plataforma independente do ecossistema GPTCLONE. Não é uma dependência do Foundation, Studio, Router ou Model Hub.
