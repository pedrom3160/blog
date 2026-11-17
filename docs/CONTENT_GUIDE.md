# Guia de Conteúdo — GPTCLONE Blog

## Idioma

O idioma principal do site é **português europeu (pt-PT)**. A arquitetura está preparada para futura expansão para inglês e espanhol, mas nenhuma tradução foi ainda implementada.

## Secções de Conteúdo

### 1. Jornal GPTCLONE

Localização: `src/content/journal/`

Artigos sobre notícias do projeto, atualizações de desenvolvimento, marcos, anúncios, decisões técnicas e relatórios.

### 2. Investigação em IA

Localização: `src/content/ai-research/`

Tópicos: LLMs, Transformers, Tokenização, Machine Learning, treino/fine-tuning, agentes, avaliação, RAG, NLP.

**Importante:** Distinguir claramente entre resultados verificados, hipóteses e planos futuros.

### 3. GPTCLONE Academy

Localização: `src/content/academy/`

Caminho inicial: **From Zero to Builder — The GPTCLONE Journey** — fundamentos de programação, Python, matemática para IA, ML, redes neurais, Linux, networking, cibersegurança, hardware e desenvolvimento assistido por IA.

### 4. Biblioteca PDF

Localização: `src/_data/pdfLibrary.json`

Catálogo de documentos PDF com título, descrição, categoria, tags, autor, licença, páginas, tamanho e `downloadUrl`/`previewUrl`. Os ficheiros de amostra (CC-BY-4.0, claramente identificados como exemplos) podem ser regenerados com `npm run generate:samples`.

**Nunca criar ligações de download falsas ou ficheiros em falta.** `npm run validate` verifica que cada URL do catálogo existe no build.

### 5. Biblioteca de Audiolivros

Localização: `src/_data/audiobookLibrary.json`

Catálogo de recursos áudio. As entradas atuais são placeholders verdadeiros (`placeholder: true`, `streamUrl: null`, "Disponível em breve"). O ficheiro `sample-tone.wav` é uma demonstração técnica do player, não um audiolivro. Respeitar direitos de autor e licenciamento.

## Como Adicionar Conteúdo

### Adicionar um Artigo (Markdown)

1. Criar um ficheiro `.md` em `src/content/journal/`, `src/content/ai-research/` ou `src/content/academy/`
2. Incluir frontmatter YAML completo
3. O artigo é automaticamente listado (coleção explícita em `.eleventy.js`)

Exemplo:

```markdown
---
title: "Título do Artigo"
description: "Descrição resumida do artigo."
pubDate: 2026-11-17
author: "Equipa GPTCLONE"
slug: "titulo-do-artigo"
collection: "journal"
permalink: "/journal/titulo-do-artigo/"
image: "/assets/images/exemplo.svg"
tags: ["tag1", "tag2"]
category: "Categoria"
related: ["slug-de-artigo-relacionado"]
---

# Título do Artigo

Conteúdo do artigo em Markdown.
```

Notas:
- `permalink` é escrito **sem** o prefixo `/blog` — o filtro `| url` e o transform de build adicionam-no.
- Tags alimentam automaticamente `/tags/` e `/tags/[tag]/`.
- Os dados por coleção (layout, etc.) estão em `.11tydata.json` dentro de cada diretório.

### Adicionar um PDF à Biblioteca

1. Colocar o ficheiro PDF em `public/resources/pdfs/`
2. Adicionar uma entrada a `src/_data/pdfLibrary.json`
3. Definir `downloadUrl` e `previewUrl` (sem prefixo `/blog`)
4. Atualizar `pages` e `sizeBytes` com valores reais

### Adicionar um Audiolivro

1. Colocar o ficheiro de áudio em `public/resources/audiobooks/`
2. Adicionar uma entrada a `src/_data/audiobook-library.json` (renomear para o formato de `audiobookLibrary.json`)
3. Definir `streamUrl`/`downloadUrl` apenas quando o ficheiro existir e o licenciamento o permitir
4. Caso contrário, manter `placeholder: true` e `durationDisplay` honesto

### Adicionar um Autor

1. Criar um ficheiro `.md` em `src/content/authors/`
2. Incluir frontmatter com `name`, `avatar` (opcional), `bio`, `role` (`permalink: false` é herdado do `.11tydata.json`)

## Princípios Editoriais

- **Precisão técnica:** distinguir factos estabelecidos de planos e ideias experimentais
- **Transparência:** não afirmar funcionalidades como implementadas quando estão apenas planeadas
- **Acessibilidade:** todo o conteúdo é público e gratuito, sem necessidade de registo
- **Honestidade:** nunca inventar conquistas, marcos de referência ou capacidades não verificadas
