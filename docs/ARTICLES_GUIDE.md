# Publicar Artigos

Este guia cobre o fluxo completo de um artigo: criar o ficheiro, preencher o frontmatter,
escrever em Markdown, pré-visualizar, validar, publicar, atualizar e remover.

O artigo é um ficheiro Markdown em `src/content/`. O Eleventy gera a página, o cartão, o índice da
secção, a pesquisa, o RSS e a entrada no sitemap. Não edite essas páginas manualmente.

## 1. Escolher a secção e o URL

| Secção | Pasta | Coleção | Prefixo do URL |
|---|---|---|---|
| Jornal | `src/content/journal/` | `journal` | `/journal/<slug>/` |
| Investigação em IA | `src/content/ai-research/` | `ai-research` | `/ai-research/<slug>/` |
| GPTCLONE Academy | `src/content/academy/` | `academy` | `/academy/<slug>/` |

O URL público final inclui o base path do GitHub Pages: `/blog/`. No frontmatter escreva o
`permalink` **sem** `/blog`; o build acrescenta-o.

Escolha um slug curto, em minúsculas, sem acentos e com hífenes:

```text
titulo-do-artigo
```

O nome do ficheiro e o `slug` devem ser iguais por convenção. Não use espaços, `_` ou acentos.

## 2. Criar o ficheiro

### Pelo site do GitHub (recomendado para começar)

1. Abra a pasta da secção, por exemplo
   [`src/content/ai-research`](https://github.com/pedrom3160/blog/tree/main/src/content/ai-research).
2. **Add file → Create new file**.
3. Nome: `o-meu-artigo.md`.
4. Cole o modelo abaixo e substitua os valores.
5. **Commit changes** no `main`.

### Localmente

Crie o ficheiro na pasta certa e abra `http://localhost:8080/blog/` com `npm run dev`.

## 3. Frontmatter completo

Copie e adapte. Os campos marcados como obrigatórios são os usados pelo layout, pelas coleções,
pelos cartões e pelo JSON-LD.

```yaml
---
slug: o-meu-artigo
collection: ai-research
permalink: /ai-research/o-meu-artigo/
title: "Um título claro e específico"
description: "Uma ou duas frases que expliquem o que o leitor vai encontrar."
pubDate: 2026-11-19
updatedDate: 2026-11-19
author: "GPTCLONE"
image: "/assets/images/uma-capa.svg"
imageAlt: "Descrição breve da ilustração de abertura"
tags: ["investigação", "transformers"]
category: "Arquitetura"
readingTime: "6 min"
related: ["introducao-llms", "tokenizacao-explicada"]
---
```

### O que cada campo faz

| Campo | Obrigatório | Função |
|---|---|---|
| `slug` | Sim, por convenção | Identificador estável do artigo e dos relacionados |
| `collection` | Sim | `journal`, `ai-research` ou `academy`; tem de corresponder à pasta |
| `permalink` | Sim | URL sem `/blog`, terminado em `/` |
| `title` | Sim | `<h1>`, cartões, RSS, pesquisa e metadados |
| `description` | Sim | Resumo, cartão, pesquisa, meta description e JSON-LD |
| `pubDate` | Sim | Data de publicação e ordenação |
| `updatedDate` | Opcional | Data de atualização; usada no sitemap e no JSON-LD |
| `author` | Sim | Nome público; por omissão `GPTCLONE` |
| `image` | Opcional | Capa; caminho sem `/blog` |
| `imageAlt` | Recomendado | Texto alternativo real da capa |
| `tags` | Sim (pode ser vazio) | Etiquetas, páginas de tags e pesquisa |
| `category` | Sim | Categoria editorial mostrada no cartão |
| `readingTime` | Recomendado | Texto como `5 min` |
| `related` | Opcional | Slugs de artigos relacionados |

O layout é aplicado automaticamente por `journal.11tydata.json`,
`ai-research.11tydata.json` ou `academy.11tydata.json`. Não precisa de escrever `layout:` no
artigo.

### Regras de metadata

- `title` e `description` devem ser únicos e verdadeiros. Não escreva descrições genéricas só
  para SEO.
- `pubDate` em `AAAA-MM-DD`; não invente uma data para parecer atual.
- `permalink` deve começar pela coleção e usar o mesmo slug; não inclua `/blog`.
- Se mudar o `permalink` depois de publicar, os links antigos deixam de existir. Não há
  redirecionamentos automáticos.
- `author` deve ser uma pessoa/projeto real. Para o projeto, use `GPTCLONE`; não crie autores
  fictícios.
- `image` deve existir em `src/assets/images/` ou `public/resources/uploads/`; o caminho no
  frontmatter não leva `/blog`.
- Para SVG, o cartão social usa a imagem raster por omissão; isso é intencional.

## 4. Exemplo real do repositório

O ficheiro
[`src/content/journal/bem-vindo-ao-blog-gptclone.md`](https://github.com/pedrom3160/blog/blob/main/src/content/journal/bem-vindo-ao-blog-gptclone.md)
mostra o padrão usado no site:

```yaml
---
slug: bem-vindo-ao-blog-gptclone
collection: journal
permalink: /journal/bem-vindo-ao-blog-gptclone/
title: "Bem-vindo ao GPTCLONE Blog"
description: "Conheça o novo espaço de conhecimento, investigação e educação do projeto GPTCLONE."
pubDate: 2026-11-17
updatedDate: 2026-11-17
author: "GPTCLONE"
image: "/assets/images/welcome-hero.svg"
tags: ["anúncio", "início", "gptclone"]
category: "Notícias do Projeto"
readingTime: "5 min"
related: ["introducao-ao-gptclone", "sobre-o-jornal-gptclone"]
---
```

O corpo começa diretamente com parágrafos e `##`, sem repetir o `#` do título. O URL final é
`https://pedrom3160.github.io/blog/journal/bem-vindo-ao-blog-gptclone/`.

## 5. Escrever o corpo

### Estrutura

- O layout cria o único `<h1>` a partir de `title`.
- Comece as secções com `##` e as subsecções com `###`; não salte níveis.
- Use listas, tabelas e negrito com moderação.
- O índice lateral é construído automaticamente a partir dos `##`/`###` no browser.
- Inclua uma introdução clara e uma conclusão ou resumo.

```markdown
## O problema

Texto introdutório.

### Um detalhe importante

- Ponto um.
- Ponto dois.

## Como funciona

| Componente | Função |
|---|---|
| Tokenizador | Converte texto em tokens |
| Modelo | Processa a sequência |
```

### Código

Use cercas com linguagem. O Prism está configurado para `python`, `bash` e `json`; esses blocos
recebem realce e botão de cópia. Sem linguagem, o bloco continua legível mas sem realce.

````markdown
```python
def soma(a, b):
    return a + b
```
````

Não cole credenciais, chaves, emails privados, tokens ou dados pessoais em exemplos.

### Links

- Interno: `[Introdução aos LLMs](/ai-research/introducao-llms/)` (sem `/blog`).
- Externo: use o URL completo e um texto descritivo.
- Não use “clique aqui”; descreva o destino.
- Confirme que o link interno existe. O validador verifica links no HTML construído.

### Imagens no corpo

1. Carregue o ficheiro em `src/assets/images/` (ou `public/resources/uploads/` no CMS).
2. No Markdown, use caminho sem `/blog`:

```markdown
![Diagrama do fluxo de atenção](/assets/images/diagrama-atencao.svg)
```

O texto alternativo deve descrever a informação da imagem. Para uma imagem puramente decorativa,
prefira não a incluir no corpo.

### Referências

Não existe um sistema de citações automático. Use uma secção final:

```markdown
## Referências

- Vaswani et al., *Attention Is All You Need*, 2017.
- [Documentação oficial](https://example.com/docs)
```

Só cite fontes que realmente consultou. Não invente referências nem resultados.

## 6. Pré-visualizar e validar

### No GitHub

O GitHub mostra o Markdown no separador **Preview**, mas não aplica o layout do blog. Para uma
verificação fiel, use o fluxo local.

### Local

```bash
npm install
npm run dev
```

Abra `http://localhost:8080/blog/<secção>/<slug>/`.

Antes de publicar:

```bash
npm run build
npm run validate
npm test
```

O validador verifica, entre outros: rotas esperadas, links internos, um único `<h1>`,
`lang="pt-PT"`, imagens com `alt`, metadados SEO, JSON-LD, formulário de sugestões e o contrato
de quatro menus. Se algo falhar, o deploy não publica a versão inválida.

## 7. Publicar

1. Commit do ficheiro no `main` (ou pull request com merge).
2. GitHub → **Actions** → workflow **Deploy GPTCLONE Blog to GitHub Pages**.
3. Confirme que **test**, **build** e **validate** passaram.
4. Aguarde o deploy e abra a página de produção.
5. Confirme o artigo na homepage/secção, a imagem, os links, o RSS e o sitemap.

O artigo não precisa de ser adicionado a uma lista: as coleções são explícitas em
`.eleventy.js` e o artigo entra automaticamente se estiver na pasta correta e não tiver
`draft: true`.

## 8. Editar depois

1. Edite o mesmo ficheiro.
2. Atualize `updatedDate` com a data real da revisão.
3. Mantenha `slug`/`permalink` para não quebrar links.
4. Faça commit e confirme o novo deploy.

Para corrigir uma gralha, não é necessário criar um artigo novo. Para mudar o título, o URL pode
ficar igual; o título é independente do slug.

## 9. Despublicar ou remover

- **Rascunho:** `draft: true` remove o artigo das coleções, pesquisa, etiquetas e sitemap. O
  ficheiro continua no repositório e o URL pode continuar a ser gerado; **não é um mecanismo de
  privacidade**. Para trabalho inacabado, use um ramo/PR e só faça merge quando estiver pronto.
- **Remover:** apague o ficheiro com um commit. O histórico Git conserva a versão anterior, mas
  não há redirecionamento.
- Ao remover uma imagem ou recurso, procure referências antes de o apagar.

## 10. Erros comuns

| Erro | Causa provável | Correção |
|---|---|---|
| 404 no artigo | `permalink` errado, ficheiro fora da pasta ou `/blog` incluído | Corrija o permalink e a coleção |
| Artigo não listado | `draft: true`, data inválida ou build falhou | Verifique frontmatter e Actions |
| Link quebrado | Caminho sem barra final ou slug inexistente | Confirme o URL no build |
| Imagem quebrada | Caminho com `/blog` ou ficheiro fora de `src/assets/images` | Use `/assets/images/...` |
| Dois `<h1>` | Escreveu `# Título` no corpo | Remova o `#`; o layout já tem o título |
| Validação de SEO falha | Falta `description`, título ou metadata | Preencha o frontmatter |
| Data no futuro | `pubDate` futura | Use a data real de publicação |

## 11. Checklist final

- [ ] Secção/pasta correta e slug estável.
- [ ] Frontmatter completo e sem `/blog` no `permalink`.
- [ ] Um único `<h1>` e hierarquia de headings correta.
- [ ] Descrição, categoria, tags e `imageAlt` reais.
- [ ] Imagens e links internos existentes.
- [ ] Código com linguagem e sem segredos.
- [ ] Referências verificadas.
- [ ] `npm run build`, `npm run validate` e `npm test` verdes.
- [ ] Workflow de Pages verde.
- [ ] Página de produção revista.
