# Guia de Conteúdo — referência técnica

Este documento é a referência curta para quem já conhece o projeto. O percurso completo e
explicado passo a passo está nos handbooks:

- [Guia geral de publicação](PUBLISHING_GUIDE.md)
- [Artigos](ARTICLES_GUIDE.md)
- [PDFs](PDF_LIBRARY_GUIDE.md)
- [Audiolivros e áudio](AUDIOBOOKS_GUIDE.md)

## Idioma

O idioma principal é **português europeu (pt-PT)**. A arquitetura está preparada para futuras
traduções, mas não existe tradução publicada.

## Secções

| Secção | Pasta | Coleção | URL base |
|---|---|---|---|
| Jornal GPTCLONE | `src/content/journal/` | `journal` | `/journal/` |
| Investigação em IA | `src/content/ai-research/` | `ai-research` | `/ai-research/` |
| GPTCLONE Academy | `src/content/academy/` | `academy` | `/academy/` |
| Biblioteca PDF | `public/resources/pdfs/` + `src/_data/pdfLibrary.json` | — | `/pdf-library/` |
| Audiolivros | `public/resources/audiobooks/` + `src/_data/audiobookLibrary.json` | — | `/audiobook-library/` |

Os dados de diretório em `*.11tydata.json` aplicam `layouts/article.njk` aos artigos. Não é
necessário repetir `layout` no frontmatter.

## Frontmatter de artigo

```yaml
---
slug: o-meu-artigo
collection: journal
permalink: /journal/o-meu-artigo/
title: "Título"
description: "Resumo real para cartões, pesquisa e SEO."
pubDate: 2026-11-19
updatedDate: 2026-11-19
author: "GPTCLONE"
image: "/assets/images/capa.svg"
imageAlt: "Descrição da imagem"
tags: ["tag"]
category: "Categoria"
readingTime: "5 min"
related: ["outro-slug"]
---
```

Regras essenciais:

- `permalink` sem `/blog`; o build acrescenta o prefixo.
- Não escrever `# Título` no corpo: o layout cria o único `<h1>`.
- Código com linguagem; o Prism está configurado para Python, Bash e JSON.
- Imagens em `src/assets/images/` ou `public/resources/uploads/`; caminhos sem `/blog`.
- `draft: true` remove das coleções/pesquisa/tags/sitemap, mas não é uma barreira de privacidade:
  o URL pode continuar a ser gerado. Use um ramo/PR para trabalho inacabado.
- Não inventar autores, datas, resultados, parcerias ou funcionalidades.

## PDFs

O catálogo `src/_data/pdfLibrary.json` aponta para ficheiros em `public/resources/pdfs/`.
`downloadUrl` e `previewUrl` têm de existir; `npm run validate` falha se faltarem. O cartão
mostra **Ver PDF** quando há `previewUrl` e **Descarregar** quando há `downloadUrl`. Não existe
página individual por PDF.

## Áudio

O catálogo `src/_data/audiobookLibrary.json` aponta para ficheiros em
`public/resources/audiobooks/`. Use `streamUrl`/`downloadUrl` apenas para ficheiros reais;
entradas futuras usam `placeholder: true` e “Disponível em breve”. O cartão mostra **Ouvir** e
**Descarregar**; o player incorporado é o macro `audioPlayer` em
`src/_includes/components/cards.njk`, usado numa página própria.

## Princípios editoriais

- **Precisão:** distinguir factos, hipóteses e planos.
- **Transparência:** não apresentar funcionalidades planeadas como implementadas.
- **Acessibilidade:** texto alternativo, headings corretos, linguagem clara e conteúdo sem
  barreiras desnecessárias.
- **Honestidade:** não inventar métricas, conquistas, colaboradores ou credenciais.
- **Licenciamento:** publicar apenas conteúdo que pode ser distribuído e indicar a licença.

## Validação

Antes de publicar, ver o [guia geral](PUBLISHING_GUIDE.md#4-percurso-com-pré-visualização-local-opcional)
e correr `npm run build`, `npm run validate` e `npm test`. O GitHub Actions repete estes passos e
não publica uma versão inválida.
