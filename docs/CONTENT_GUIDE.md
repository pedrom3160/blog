# Guia de Conteúdo — GPTCLONE Blog

## Idioma

O idioma principal do site é **português europeu (pt-PT)**. A arquitetura está preparada para futura expansão para inglês e espanhol, mas nenhuma tradução foi ainda implementada.

## Secções de Conteúdo

### 1. Jornal GPTCLONE

Localização: `content/journal/`

Artigos sobre:
- Notícias do projeto
- Atualizações de desenvolvimento
- Marcos atingidos
- Anúncios de lançamento
- Decisões técnicas
- Alterações de arquitetura
- Relatórios de desenvolvimento
- Notas de investigação
- Sumários de progresso

Cada artigo deve incluir:
- Data de publicação
- Autor
- Categorias e tags
- Tempo de leitura estimado
- Artigos relacionados

### 2. Investigação em IA

Localização: `content/ai-research/`

Tópicos cobertos:
- Modelos de Linguagem de Grande Escala (LLMs)
- Arquiteturas Transformer
- Tokenização
- Machine Learning
- Treino e fine-tuning de modelos
- Agentes de IA
- Avaliação e inferência
- RAG e embeddings
- Computação distribuída
- Experiências técnicas

**Importante:** Distinguir claramente entre resultados verificados, hipóteses e planos futuros. Nunca apresentar funcionalidades planeadas como já implementadas.

### 3. GPTCLONE Academy

Localização: `content/academy/`

Conceito: **Learn by Building** (Aprender Construindo).

Caminho inicial: **From Zero to Builder — The GPTCLONE Journey**

Tópicos:
- Fundamentos de programação
- Python
- Matemática e álgebra para IA
- Inteligência artificial
- Machine learning
- Redes neurais e LLMs
- Linux e sistemas operativos
- Networking
- Cibersegurança fundamentais
- Hardware
- Desenvolvimento assistido por IA
- Vibe Coding

### 4. Biblioteca PDF

Localização: `content/data/pdf-library.json`

Catálogo de documentos PDF com:
- Título, descrição, categoria, tags
- Autor, licença, idioma
- Número de páginas, tamanho
- URL de download (quando o ficheiro existe)
- Marcador `sample` para conteúdo de exemplo

**Nunca criar ligações de download falsas ou ficheiros em falta.** Se um PDF não existe, fornecer estado vazio verdadeiro e documentação sobre como adicionar.

### 5. Biblioteca de Audiolivros

Localização: `content/data/audiobook-library.json`

Catálogo de recursos áudio com:
- Título, descrição, categoria, tags
- Autor, narrador, licença, idioma
- Duração (quando disponível)
- URL de streaming/download (quando legalmente permitido e ficheiro existe)
- Marcador `placeholder` para conteúdo futuro

Respeitar direitos de autor e licenciamento.

## Como Adicionar Conteúdo

### Adicionar um Artigo (Markdown)

1. Criar um ficheiro `.md` na coleção apropriada (`content/journal/`, `content/ai-research/` ou `content/academy/`)
2. Incluir frontmatter YAML com todos os campos obrigatórios
3. Escrever o conteúdo em Markdown
4. O artigo é automaticamente listado na página da respetiva coleção

Exemplo de frontmatter:

```markdown
---
title: "Título do Artigo"
description: "Descrição resumida do artigo."
pubDate: 2026-11-17
author: "Equipa GPTCLONE"
image: "/assets/images/exemplo.svg"
tags: ["tag1", "tag2"]
category: "Categoria"
readingTime: "5 min"
related: ["slug-de-artigo-relacionado"]
---

# Título do Artigo

Conteúdo do artigo em Markdown.
```

### Adicionar um PDF à Biblioteca

1. Colocar o ficheiro PDF em `public/resources/pdfs/`
2. Adicionar uma entrada ao ficheiro `content/data/pdf-library.json`
3. Definir `downloadUrl` e `previewUrl` apontando para o ficheiro
4. Marcar `sample` como `false` se não for conteúdo de exemplo

### Adicionar um Audiolivro

1. Colocar o ficheiro de áudio em `public/resources/audiobooks/`
2. Adicionar uma entrada ao ficheiro `content/data/audiobook-library.json`
3. Definir `streamUrl` ou `downloadUrl`
4. Respeitar direitos de autor — apenas conteúdo com licença adequada

### Adicionar um Autor

1. Criar um ficheiro `.md` em `content/authors/`
2. Incluir frontmatter com `name`, `avatar` (opcional), `bio`, `role`

## Princípios Editoriais

- **Precisão técnica:** Todas as explicações distinguem factos estabelecidos de planos e ideias experimentais
- **Transparência:** Não afirmar funcionalidades como implementadas quando estão apenas planeadas
- **Acessibilidade:** Todo o conteúdo é público e gratuito, sem necessidade de registo
- **Honestidade:** Nunca inventar conquistas, marcos de referência ou capacidades não verificadas
