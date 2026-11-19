# Publicar no GPTCLONE Blog — Guia Geral

Este é o guia de entrada para publicar e manter conteúdo no GPTCLONE Blog. Foi escrito para
quem não quer decorar a arquitetura do projeto: comece por aqui e abra o guia específico quando
precisar de detalhes.

- [Artigos](ARTICLES_GUIDE.md)
- [PDFs e recursos educativos](PDF_LIBRARY_GUIDE.md)
- [Audiolivros e áudio](AUDIOBOOKS_GUIDE.md)

O site é estático (Eleventy + GitHub Pages). Não existe base de dados, painel de administração
obrigatório nem servidor próprio para publicar. Um artigo é um ficheiro Markdown no repositório;
um PDF ou áudio é um ficheiro em `public/resources/` mais uma entrada num catálogo JSON.

## 1. O que precisa

Para o percurso recomendado, só precisa de:

1. Uma conta GitHub com permissão de escrita no repositório
   [pedrom3160/blog](https://github.com/pedrom3160/blog).
2. Um navegador.
3. O texto, a imagem de capa, o PDF ou o áudio que quer publicar.

Não é necessário instalar Node.js para publicar pelo site do GitHub. Instalar as ferramentas
locais só é útil para pré-visualizar antes de publicar ou para trabalhar com mais conforto.

## 2. Tipos de conteúdo

| Conteúdo | Ficheiro principal | Onde aparece | Guia |
|---|---|---|---|
| Artigo | `src/content/<secção>/<slug>.md` | Homepage, secção, RSS, sitemap, pesquisa e etiquetas | [Artigos](ARTICLES_GUIDE.md) |
| PDF | `public/resources/pdfs/<ficheiro>.pdf` + `src/_data/pdfLibrary.json` | Biblioteca PDF | [PDFs](PDF_LIBRARY_GUIDE.md) |
| Áudio | `public/resources/audiobooks/...` + `src/_data/audiobookLibrary.json` | Biblioteca de Audiolivros | [Áudio](AUDIOBOOKS_GUIDE.md) |

As três secções editoriais de artigos são:

- **Jornal** — notícias, desenvolvimento, marcos e decisões do projeto.
- **Investigação em IA** — matérias técnicas e explicativas.
- **GPTCLONE Academy** — percursos de aprendizagem.

A navegação principal continua a ter exatamente quatro destinos: **Blog · About · Suggestions ·
Donations**. As secções e bibliotecas são descoberta de conteúdo, não menus adicionais.

## 3. Percurso rápido: publicar um artigo pelo GitHub

Este é o caminho recomendado para uma pessoa que só quer escrever e publicar.

1. Abra o repositório no GitHub e entre na pasta da secção certa:
   [`src/content/journal`](https://github.com/pedrom3160/blog/tree/main/src/content/journal),
   [`src/content/ai-research`](https://github.com/pedrom3160/blog/tree/main/src/content/ai-research)
   ou [`src/content/academy`](https://github.com/pedrom3160/blog/tree/main/src/content/academy).
2. Clique em **Add file → Create new file**.
3. Dê ao ficheiro um nome em minúsculas, sem acentos e com hífenes, por exemplo
   `o-meu-artigo.md`.
4. Copie o modelo de frontmatter do [guia de artigos](ARTICLES_GUIDE.md) e preencha todos os
   campos obrigatórios. O `permalink` deve corresponder à secção e ao slug.
5. Escreva o corpo em Markdown. Não repita o título como `# Título`; o layout já cria o único
   `<h1>`.
6. Se houver imagem, carregue-a em `src/assets/images/` e use o caminho
   `/assets/images/nome.svg` (sem `/blog`).
7. Antes de guardar, confirme o título, a descrição, a data, a categoria, as etiquetas e o
   `imageAlt`.
8. Escreva uma mensagem de commit clara, por exemplo `content: publicar artigo sobre X`, e
   confirme em **Commit changes** no ramo `main`.
9. Abra **Actions** no repositório e aguarde o workflow **Deploy GPTCLONE Blog to GitHub Pages**.
   Testes, build, validação e publicação têm de estar verdes.
10. Abra a página publicada em `https://pedrom3160.github.io/blog/` e confirme o artigo, a
    imagem, os links e a navegação.

O artigo aparece automaticamente na homepage, na respetiva secção, no RSS, no sitemap, na
pesquisa e nas etiquetas. Não é necessário editar essas páginas à mão.

> **Importante:** o URL fica definido pelo `permalink`. Depois de publicar, não mude o slug nem o
> `permalink` sem uma razão forte; não existem redirecionamentos automáticos.

## 4. Percurso com pré-visualização local (opcional)

Se tiver Node.js 22 e o repositório clonado:

```bash
npm install
npm run dev
```

Abra `http://localhost:8080/blog/`. O servidor atualiza a página quando guarda os ficheiros.
Antes de publicar, corra:

```bash
npm run build
npm run validate
npm test
```

- `npm run build` gera o site em `_site/`, com o prefixo `/blog/`.
- `npm run validate` verifica rotas, links internos, metadados, navegação e catálogos.
- `npm test` corre os testes automatizados.

Se a validação falhar, o GitHub Actions também falha e o site **não** é substituído pela versão
inválida. Corrija o erro em vez de ignorar o aviso.

## 5. Preparar o conteúdo antes de escrever

- **Título** — específico e legível; não use o título para prometer o que o texto não entrega.
- **Descrição** — uma ou duas frases concretas; é usada nos cartões, pesquisa e SEO.
- **Data** — a data real de publicação, em formato `AAAA-MM-DD`.
- **Categoria** — uma categoria editorial estável, por exemplo `Notícias do Projeto` ou
  `Arquitetura`.
- **Etiquetas** — duas a cinco tags úteis para pesquisa; evite tags inventadas só para SEO.
- **Imagem** — 1200 × 675 px é o formato usado pelos cartões; use `imageAlt` descritivo.
- **Licença e autoria** — não invente autores, parcerias, resultados ou datas. A assinatura
  pública por omissão é `GPTCLONE`.

## 6. Imagens, PDFs e áudio

### Imagens de artigos

Guardar em `src/assets/images/` (é copiada para `/assets/images/` no build). Formatos práticos:
SVG para ilustrações editoriais, WebP/JPEG para fotografias. Use nomes em minúsculas, sem
espaços. Uma imagem de capa deve ter texto alternativo real; imagens puramente decorativas devem
ser evitadas no conteúdo.

### PDFs

Os PDFs vivem em `public/resources/pdfs/` e são registados em `src/_data/pdfLibrary.json`.
O guia completo explica tamanho, metadados, ligação de descarga e limitações do visualizador:
[PDF_LIBRARY_GUIDE.md](PDF_LIBRARY_GUIDE.md).

### Áudio

Os ficheiros vivem em `public/resources/audiobooks/` e são registados em
`src/_data/audiobookLibrary.json`. O player acessível e o formato recomendado estão em
[AUDIOBOOKS_GUIDE.md](AUDIOBOOKS_GUIDE.md).

### Limites de ficheiros

O GitHub bloqueia ficheiros acima de 100 MB e avisa a partir de 50 MB. O site publicado no
GitHub Pages tem um limite de 1 GB. PDFs e áudio são binários e aumentam o tamanho do
repositório para sempre; prefira ficheiros otimizados e pequenos. Ver as alternativas e as
limitações atuais em cada guia.

## 7. Publicar, atualizar e remover

### Publicar

1. Crie ou edite o ficheiro.
2. Confirme o frontmatter e o conteúdo.
3. Faça commit no `main` (ou abra um pull request e faça merge).
4. Verifique o workflow em **Actions**.
5. Confirme a página em produção.

### Atualizar

Edite o mesmo ficheiro, atualize `updatedDate` se o artigo tiver essa data, e mantenha o
`permalink`. O sitemap usa `updatedDate` quando existe. Uma correção pequena não precisa de
novo artigo.

### Despublicar ou remover

- Para esconder um artigo das listagens sem apagar o ficheiro, o campo `draft: true` remove-o das
  coleções, pesquisa, etiquetas e sitemap. **Não trate `draft` como privacidade:** o ficheiro
  continua no repositório e o URL pode continuar a ser gerado. Para trabalho inacabado, use um
  ramo ou pull request e só faça merge quando estiver pronto.
- Para remover definitivamente, apague o ficheiro num commit. O histórico do Git conserva a
  versão anterior, mas não existe redirecionamento automático.
- Ao remover uma imagem/PDF/áudio, procure referências antes de apagar o ficheiro. O validador
  deteta links internos quebrados no HTML e caminhos de catálogo em falta, mas não substitui
  uma revisão editorial.

## 8. Checklist antes de publicar

- [ ] Título, descrição e data corretos.
- [ ] Secção, categoria, etiquetas e `permalink` coerentes.
- [ ] Um único `<h1>` (o layout cria-o; não escreva `#` no corpo).
- [ ] Imagem existente, com `imageAlt`; caminhos sem `/blog`.
- [ ] Links internos testados; sem `/blog/blog`.
- [ ] Código com linguagem (```` ```python ````, ```` ```bash ````, ```` ```json ````).
- [ ] Nenhum autor, resultado, parceria ou funcionalidade inventados.
- [ ] `npm run build`, `npm run validate` e `npm test` verdes (se usar o fluxo local).
- [ ] Workflow do GitHub Actions verde.
- [ ] Página de produção aberta e verificada.

## 9. Organização recomendada

```text
src/content/journal/          artigos do Jornal
src/content/ai-research/      artigos de investigação
src/content/academy/          artigos da Academy
src/content/authors/          perfis reais de autores
src/assets/images/            capas e ilustrações de artigos
public/resources/pdfs/        PDFs locais
public/resources/audiobooks/  áudio local (uma pasta por obra, se tiver capítulos)
public/resources/uploads/     uploads do CMS opcional
```

Mantenha nomes em `kebab-case`, sem espaços nem acentos. Para uma obra com capítulos, use uma
pasta com o slug da obra e nomes como `01-introducao.mp3`.

## 10. Simplificação: o que foi e não foi feito

**Recomendado:** edição direta no GitHub + este guia + modelos de frontmatter. É gratuito, não
tem servidor, mantém o histórico e já funciona com a arquitetura atual.

**Já existe, mas é opcional:** o Decap CMS em `/admin/` e o `cms-proxy/` permitem uma interface
gráfica, mas exigem uma OAuth App e um proxy Node.js configurado. Enquanto isso não estiver
feito, `/admin/` não autentica. Para o dia a dia, o guia não depende dele. Ver
[CONTENT-MANAGEMENT.md](../CONTENT-MANAGEMENT.md) se quiser configurar essa via avançada.

**Não foi adicionado:** um novo CMS, base de dados, editor SaaS ou dependência pesada. Isso
acrescentaria custos, autenticação, manutenção e uma segunda fonte de verdade sem melhorar o
fluxo essencial. O CMS existente não foi removido; continua disponível como opção futura.

**Próxima simplificação segura, se for necessária:** um pequeno formulário local que gere o
frontmatter a partir de campos, ou modelos copiáveis por secção. Qualquer uma dessas opções deve
ser testada e não deve escrever diretamente em produção sem validação.

## 11. Problemas comuns

| Sintoma | Verifique |
|---|---|
| Artigo não aparece | Nome da pasta/coleção, `permalink`, `draft`, data e workflow |
| Link 404 | Caminho sem `/blog`, barra final, slug existente |
| Imagem não aparece | Ficheiro em `src/assets/images/` e caminho `/assets/images/...` |
| PDF não descarrega | Ficheiro em `public/resources/pdfs/` e caminho no JSON |
| Áudio não toca | URL real, formato suportado e `streamUrl` no catálogo |
| Validação falha | Leia a mensagem exata no job; não faça merge com o workflow vermelho |
| Deploy antigo | Aguarde 1–3 minutos e confirme o run mais recente em Actions |

## 12. Onde pedir ajuda

- [Guia de artigos](ARTICLES_GUIDE.md)
- [Guia de PDFs](PDF_LIBRARY_GUIDE.md)
- [Guia de áudio](AUDIOBOOKS_GUIDE.md)
- [Referência técnica de conteúdo](CONTENT_GUIDE.md)
- [Arquitetura](ARCHITECTURE.md)
- [Deploy](DEPLOYMENT.md)
- [Sugestões e privacidade](SUGGESTIONS.md)
