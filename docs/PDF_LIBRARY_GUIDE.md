# Publicar PDFs e Recursos Educativos

A Biblioteca PDF é um catálogo de documentos em `src/_data/pdfLibrary.json`. Não é um CMS nem
uma pasta mágica: o ficheiro PDF tem de existir e o catálogo tem de apontar para ele.

- Página pública: https://pedrom3160.github.io/blog/pdf-library/
- Pasta dos ficheiros: `public/resources/pdfs/`
- Catálogo: `src/_data/pdfLibrary.json`

## 1. Como a biblioteca funciona hoje

A página lista cartões com título, descrição, categoria, autor, idioma, licença, páginas, tamanho
e botões de ação. O cartão usa `downloadUrl` para **Descarregar** e `previewUrl` para **Ver PDF**
(abre o documento numa nova aba). O validador confirma que ambos os caminhos existem.

**Limitações atuais:**

- Não existe uma página individual por PDF. O documento é apresentado no catálogo.
- O cartão não mostra uma imagem de capa. Para uma capa visual, crie um artigo de apresentação
  com imagem e ligue ao PDF, ou seja explícito sobre essa limitação.
- O visualizador depende do navegador. Um PDF local servido pelo GitHub Pages abre no leitor
  nativo do browser quando clicado; não há um leitor incorporado no catálogo.
- Os caminhos do catálogo têm de ser locais (começados por `/resources/...`) para passarem no
  validador atual. URLs externas exigem alteração do template e da validação.

## 2. Preparar o PDF

Antes de carregar:

- Verifique a ortografia, a paginação e os links internos do documento.
- Confirme que tem direito a publicar o conteúdo e escolha a licença correta.
- Comprima imagens e remova páginas em branco.
- Prefira PDF/A ou PDF com texto selecionável, não apenas digitalizações.
- Use um nome em minúsculas, sem acentos nem espaços:
  `guia-transformers.pdf`.
- Anote o número real de páginas e o tamanho em bytes.

Para obter o tamanho em bytes no Windows:

```powershell
(Get-Item .\guia-transformers.pdf).Length
```

## 3. Carregar o ficheiro

### Pelo GitHub

1. Abra a pasta
   [`public/resources/pdfs`](https://github.com/pedrom3160/blog/tree/main/public/resources/pdfs).
2. **Add file → Upload files**.
3. Selecione o PDF e confirme o nome.
4. Faça commit em `main`.

O ficheiro fica disponível em:
`https://pedrom3160.github.io/blog/resources/pdfs/<nome>.pdf`.

### Localmente

Copie o PDF para `public/resources/pdfs/` e faça commit. Não use caminhos absolutos do seu
computador no catálogo.

## 4. Registar no catálogo

Abra `src/_data/pdfLibrary.json` e adicione um objeto ao array `documents`:

```json
{
  "id": "pdf-guia-transformers-001",
  "title": "Guia prático de Transformers",
  "description": "Uma introdução técnica à arquitetura Transformer, com atenção, exemplos e referências.",
  "category": "investigacao",
  "tags": ["transformers", "attention", "ia"],
  "author": "GPTCLONE",
  "license": "CC-BY-4.0",
  "language": "pt-PT",
  "pages": 24,
  "sizeBytes": 1843200,
  "sample": false,
  "downloadUrl": "/resources/pdfs/guia-transformers.pdf",
  "previewUrl": "/resources/pdfs/guia-transformers.pdf",
  "uploadDate": "2026-11-19"
}
```

Atualize também `lastUpdated` no topo do JSON, se fizer sentido.

### Campos

| Campo | Obrigatório | Notas |
|---|---|---|
| `id` | Sim | Único; não reutilize o ID de outro documento |
| `title` | Sim | Título visível no cartão |
| `description` | Sim | Explicação concreta do conteúdo |
| `category` | Sim | Usada no filtro; mantenha um conjunto estável |
| `tags` | Sim (array) | Ajuda na pesquisa; use termos reais |
| `author` | Sim | `GPTCLONE` por omissão; não invente pessoas |
| `license` | Sim | Ex.: `CC-BY-4.0`; só publique o que pode licenciar |
| `language` | Sim | `pt-PT` para português europeu |
| `pages` | Recomendado | Número real de páginas |
| `sizeBytes` | Recomendado | Tamanho real; o cartão formata KB/MB |
| `sample` | Sim | `true` para exemplos claramente marcados |
| `downloadUrl` | Sim | Caminho local para o PDF |
| `previewUrl` | Opcional | Caminho para visualização; útil se o template o mostrar |
| `uploadDate` | Sim | Data de entrada no catálogo em `AAAA-MM-DD` |

### Categorias

As categorias atuais são livres, mas devem ser consistentes. Exemplos usados: `documentacao`,
`investigacao`, `tutorial`. O filtro compara o valor em minúsculas. Não misture `Tutorial`,
`tutorial` e `tutoriais` para o mesmo tipo de conteúdo.

## 5. Verificar a ligação

O build copia `public/resources/` para `/resources/` e aplica o prefixo `/blog/` aos caminhos.
No JSON, escreva sempre:

```text
/resources/pdfs/guia-transformers.pdf
```

Nunca escreva `/blog/resources/...` (duplica o prefixo) nem `C:\...`.

Execute:

```bash
npm run build
npm run validate
```

O validador falha se `downloadUrl` ou `previewUrl` apontarem para um ficheiro inexistente em
`_site`. Isto evita publicar um cartão com uma descarga quebrada.

## 6. Ver no browser

O PDF é um ficheiro estático. O browser moderno abre-o no seu leitor integrado quando navega
para o URL. A descarga usa o atributo `download` do cartão.

Se precisar de um leitor incorporado, isso é uma alteração de template (por exemplo, um
`<iframe>`/`<object>` com fallback), não uma configuração do JSON. Não foi implementado porque
aumenta o peso da página e tem comportamento inconsistente entre browsers. Para a maioria dos
casos, uma ligação direta é mais simples e acessível.

## 7. Criar uma página de apresentação (opcional)

O catálogo não cria uma rota por PDF. Se quiser uma página editorial com capa, contexto e links:

1. Crie um artigo normal numa secção (`src/content/journal/`, por exemplo).
2. Use uma imagem de capa em `src/assets/images/`.
3. No corpo, explique o documento e ligue ao PDF:

```markdown
[Descarregar o guia em PDF](/resources/pdfs/guia-transformers.pdf)
```

O build acrescenta `/blog/`. O artigo aparece no RSS/sitemap e o PDF continua no catálogo. Não
duplique o PDF em duas pastas.

## 8. Organizar muitos PDFs

- Um ficheiro = uma entrada no catálogo.
- Nomes `kebab-case`, sem versões ambíguas; se atualizar, prefira substituir o ficheiro e
  atualizar `uploadDate`/`pages`/`sizeBytes`, ou usar `guia-transformers-v2.pdf` e manter a
  entrada antiga se o histórico for importante.
- Categorias e tags são a navegação; não crie uma pasta por categoria enquanto o catálogo for
  plano.
- Documentos grandes devem ser divididos por tema, não por páginas arbitrárias.
- Não apague um PDF enquanto houver links para ele.

## 9. Tamanho, GitHub e alternativas

Limites práticos atuais:

- GitHub bloqueia ficheiros acima de **100 MB** e avisa a partir de **50 MB**.
- O site do GitHub Pages tem um limite de **1 GB** por publicação.
- Binários grandes ficam no histórico Git para sempre e tornam clones mais pesados.

Para este blog, mantenha PDFs pequenos (idealmente poucos MB). Se um documento for muito grande:

- otimize imagens e remova conteúdo duplicado;
- divida em volumes;
- use GitHub Releases para o ficheiro e ligue ao URL da release;
- considere Zenodo, Internet Archive ou armazenamento de objetos (por exemplo, Cloudflare R2).

**Atenção:** o catálogo/validador atuais esperam caminhos locais. Para usar um URL externo é
necessário alterar `downloadUrl`/`previewUrl`, o template e a validação, e verificar licença,
estabilidade e privacidade do alojamento. Não aponte para um URL que não controla.

## 10. Remover um PDF

1. Remova a entrada do JSON.
2. Procure referências em artigos e páginas.
3. Apague o PDF do repositório num commit.
4. Corra `npm run build && npm run validate`.

O histórico Git mantém a versão anterior, mas não há redirecionamento para quem tenha guardado o
URL antigo.

## 11. Checklist

- [ ] PDF revisto, otimizado e com licença clara.
- [ ] Nome `kebab-case` e ficheiro em `public/resources/pdfs/`.
- [ ] Entrada com `id` único e todos os metadados reais.
- [ ] `downloadUrl`/`previewUrl` sem `/blog`.
- [ ] `sizeBytes` e `pages` corretos.
- [ ] `npm run build` e `npm run validate` verdes.
- [ ] Cartão e descarga testados em produção.
