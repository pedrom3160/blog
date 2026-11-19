# Gestão de Conteúdo — GPTCLONE Blog

Este documento explica, passo a passo, como gerir o conteúdo do GPTCLONE Blog
através do **CMS do Decap** (interface de administração em `/admin/`), sem
necessidade de recorrer a um agente de IA ou a programação.

O GPTCLONE Blog é um site estático (Eleventy + GitHub Pages). O CMS é
**baseado em Git**: cada alteração é guardada como um *commit* no repositório
`pedrom3160/blog`, e o GitHub Actions reconstrói e publica o site
automaticamente. Não existe base de dados nem backend no site público.

> **Estado da implementação (importante):**
> - ✅ Interface de administração (`/admin/`), configuração do CMS, páginas de
>   pré-visualização (`/preview/`) e proxy de autenticação (`cms-proxy/`): **implementados**.
> - ⚠️ A autenticação com o GitHub **exige configuração externa** (criar uma
>   OAuth App no GitHub e implantar o `cms-proxy/` num serviço Node.js).
>   Enquanto essa configuração não estiver feita, o `/admin/` não permite
>   autenticação, mas **todo o site público e a edição via Git continuam a
>   funcionar**. Ver secção 12.

## Índice

1. [Como aceder à CMS](#1-como-aceder-à-cms)
2. [Como autenticar](#2-como-autenticar)
3. [Como criar um artigo](#3-como-criar-um-artigo)
4. [Como editar um artigo](#4-como-editar-um-artigo)
5. [Como guardar rascunhos](#5-como-guardar-rascunhos)
6. [Como pré-visualizar conteúdo](#6-como-pré-visualizar-conteúdo)
7. [Como publicar e despublicar](#7-como-publicar-e-despublicar)
8. [Como carregar imagens e documentos](#8-como-carregar-imagens-e-documentos)
9. [Como gerir PDFs, audiolivros e podcasts](#9-como-gerir-pdfs-audiolivros-e-podcasts)
10. [Como a publicação chega ao site ao vivo](#10-como-a-publicação-chega-ao-site-ao-vivo)
11. [Como resolver problemas comuns](#11-como-resolver-problemas-comuns)
12. [Serviços externos e credenciais a configurar](#12-serviços-externos-e-credenciais-a-configurar)

---

## 1. Como aceder à CMS

A interface de administração está disponível no endereço:

```
https://pedrom3160.github.io/blog/admin/
```

Também pode ser acedida localmente durante o desenvolvimento:

```
http://localhost:8080/admin/
```

A página `/admin/` carrega a aplicação Decap CMS e lê a configuração em
`src/admin/config.yml` (copiada para `_site/admin/config.yml` em cada build).

## 2. Como autenticar

A autenticação é feita com a **conta GitHub do proprietário** (ou de qualquer
pessoa com acesso de escrita ao repositório `pedrom3160/blog`).

1. Abra `https://pedrom3160.github.io/blog/admin/`.
2. Clique em **Login with GitHub** (ou "Entrar com GitHub").
3. Na primeira utilização, autorize a aplicação OAuth na sua conta GitHub.
4. Após a autorização, é redirecionado de volta para o `/admin/` já autenticado.

O fluxo de autenticação passa pelo servidor proxy (`cms-proxy/`) descrito na
secção 12 — **nenhum token ou segredo fica guardado no frontend**. O token de
acesso do GitHub é guardado num cookie http-only no domínio do proxy e apenas o
proxy o envia à API do GitHub.

Só utilizadores com permissão de *push* no repositório conseguem autenticar-se.

## 3. Como criar um artigo

1. Entre no `/admin/` e escolha a coleção pretendida:
   - **Jornal GPTCLONE** → `src/content/journal/`
   - **Investigação em IA** → `src/content/ai-research/`
   - **GPTCLONE Academy** → `src/content/academy/`
2. Clique em **New + New [Coleção]** (ou "Novo").
3. Preencha os campos:
   - **Título** — título do artigo (obrigatório).
   - **Descrição (resumo / SEO)** — resumo curto usado em cartões, pesquisa e SEO.
   - **Slug do URL** — identificador do URL (ex. `o-meu-artigo`). Use apenas
     letras minúsculas, números e hífenes.
   - **Data de publicação** — data do artigo.
   - **Data de atualização** — opcional; preencha quando editar o conteúdo.
   - **Autor** — por omissão "GPTCLONE" (a assinatura pública do projeto).
   - **Imagem em destaque** — carregue ou selecione uma imagem da biblioteca.
   - **Categoria** — categoria do artigo (ex. "Notícias do Projeto").
   - **Etiquetas** — lista de etiquetas (uma por linha).
   - **Tempo de leitura** — opcional (ex. "5 min").
   - **Rascunho** — deixe **desmarcado** para publicar ou **marcado** para
     guardar como rascunho (ver secção 5).
   - **Artigos relacionados** — slugs de artigos relacionados (opcional).
   - **Conteúdo (Markdown)** — o corpo do artigo com o editor Markdown
     (suporta negrito, itálico, títulos, listas, tabelas, imagens, etc.).
4. Clique em **Guardar** (Save) para gravar no GitHub.

O ficheiro criado é um `.md` com *frontmatter* YAML na pasta da coleção, e o
URL final do artigo é `/blog/<coleção>/<slug>/`.

## 4. Como editar um artigo

1. Entre no `/admin/` e abra a coleção do artigo.
2. Clique no artigo pretendido na lista.
3. Edite os campos e o conteúdo.
4. Clique em **Guardar** (Save) — cria um commit no ramo `main`.
5. O GitHub Actions reconstrói o site e as alterações ficam visíveis após o
   deploy (normalmente 1–3 minutos). Ver secção 10.

Também pode editar diretamente os ficheiros Markdown no GitHub
(`pedrom3160/blog` → pasta da coleção) ou clonar o repositório e editar
localmente — o conteúdo é exatamente o mesmo.
---

## 5. Como guardar rascunhos

Um **rascunho** é um artigo que existe no repositório mas **não aparece no
site público** (não entra nas listagens, pesquisa, tags ou sitemap).

1. Ao criar ou editar um artigo, **marque** o campo **Rascunho** (Draft).
2. Clique em **Guardar** (Save).
3. O CMS grava `draft: true` no frontmatter do ficheiro.
4. Na lista da coleção, use o filtro **"Rascunhos"** (view filter) para ver
   apenas os artigos por publicar.

O Eleventy exclui automaticamente artigos com `draft: true` de todas as
coleções públicas (`articles`, `journal`, `ai-research`, `academy`, `tags` e
sitemap). O rascunho continua acessível no editor do CMS e pode ser
pré-visualizado (secção 6).

Para "desfazer" o rascunho e publicar, basta **desmarcar** o campo Rascunho e
guardar (ver secção 7).

## 6. Como pré-visualizar conteúdo

Antes de publicar, pode pré-visualizar o aspeto final do artigo:

1. Abra o artigo no editor do CMS.
2. Clique no botão **Pre*** (Preview) na barra do editor.
3. O CMS abre a página `/preview/` numa nova janela com o conteúdo do rascunho
   renderizado (título, data, autor, etiquetas e corpo Markdown), usando o
   mesmo estilo visual do site.
4. A pré-visualização mostra um aviso de que o conteúdo **não está publicado**.

A página `/preview/` também pode ser usada de forma autónoma passando o conteúdo
no parâmetro `payload` (JSON) — é o mecanismo usado pelo CMS para enviar o
rascunho. Sem parâmetros, mostra apenas instruções.

> A pré-visualização **não guarda** nada no repositório; é apenas uma
> visualização local no navegador.

## 7. Como publicar e despublicar

**Publicar um rascunho:**

1. Abra o artigo no editor.
2. **Desmarque** o campo **Rascunho** (Draft).
3. Clique em **Guardar** (Save).
4. O artigo passa a fazer parte das coleções públicas e aparece no site após o
   deploy (secção 10).

**Despublicar um artigo (mantendo o ficheiro):**

1. Abra o artigo no editor.
2. **Marque** o campo **Rascunho** (Draft).
3. Clique em **Guardar** (Save).
4. O artigo deixa de aparecer no site público, mas o conteúdo fica guardado
   como rascunho para edição futura.

**Eliminar (remover) um artigo:**

1. Abra o artigo no editor.
2. Clique no ícone de **eliminar** (Delete) na barra do editor e confirme.
3. O CMS remove o ficheiro do repositório (commit de eliminação).
4. O artigo desaparece do site no deploy seguinte.

> Eliminar é permanente (o histórico do Git mantém as versões anteriores, que
> podem ser recuperadas via GitHub). Prefira **despublicar via Rascunho** se
> quiser manter o conteúdo para mais tarde.

## 8. Como carregar imagens e documentos

O CMS tem uma **biblioteca de media** integrada:

1. No editor de um artigo (ou na secção **Media** do CMS), clique em
   **Upload** / **Carregar**.
2. Selecione o ficheiro (imagem, PDF, etc.) no seu computador.
3. O CMS carrega o ficheiro para a pasta `public/resources/uploads/` do
   repositório (via API do GitHub, através do proxy) e devolve o caminho
   `/resources/uploads/<nome-do-ficheiro>`.
4. Para usar a imagem:
   - Como **imagem em destaque**: selecione-a no campo "Imagem em destaque".
   - No **conteúdo**: arraste-a para o editor Markdown ou insira
     `![descrição](/resources/uploads/<ficheiro>)`.

Os caminhos `/resources/uploads/...` são reescritos automaticamente para
`/blog/resources/uploads/...` no site publicado, e os ficheiros ficam
disponíveis em `https://pedrom3160.github.io/blog/resources/uploads/...`.

Formatos recomendados: imagens `.jpg`, `.png`, `.webp`, `.svg`; documentos
---

## 9. Como gerir PDFs, audiolivros e podcasts

As bibliotecas de recursos (PDF, audiolivros e futuros podcasts) são
**catálogos JSON** versionados no repositório, porque precisam de metadados
ricos (páginas, tamanho, duração, licença) que o editor Markdown não cobre.

### Biblioteca PDF (`src/_data/pdfLibrary.json`)

1. Coloque o ficheiro PDF em `public/resources/pdfs/` (via GitHub web upload ou
   `git`).
2. Adicione uma entrada ao array `documents` em `src/_data/pdfLibrary.json`:
   ```json
   {
     "id": "pdf-001",
     "title": "Título do documento",
     "description": "Descrição do documento.",
     "category": "documentacao",
     "tags": ["ia", "guia"],
     "author": "GPTCLONE",
     "license": "CC-BY-4.0",
     "language": "pt-PT",
     "pages": 12,
     "sizeBytes": 123456,
     "sample": false,
     "downloadUrl": "/resources/pdfs/o-meu-documento.pdf",
     "previewUrl": "/resources/pdfs/o-meu-documento.pdf",
     "uploadDate": "2026-11-18"
   }
   ```
3. `downloadUrl`/`previewUrl` devem apontar para caminhos existentes (sem o
   prefixo `/blog`); o build acrescenta-o.
4. Faça commit e o site reconstrói automaticamente. `npm run validate` verifica
   que cada URL do catálogo existe no build.

### Biblioteca de Audiolivros (`src/_data/audiobookLibrary.json`)

1. Coloque o ficheiro de áudio (`.mp3`, `.wav`, `.ogg`) em
   `public/resources/audiobooks/`.
2. Adicione uma entrada ao array `audiobooks` com `streamUrl`/`downloadUrl`
   apontando para o ficheiro e `durationDisplay` real (ex. "12:34").
3. Entradas sem ficheiro devem manter `placeholder: true`, `streamUrl: null`,
   `downloadUrl: null` e `durationDisplay: "Disponível em breve"`.

### Podcasts (planeado)

Não existe coleção de podcasts dedicada; os episódios podem ser publicados como
artigos da coleção **Jornal** com um player de áudio embutido (componente
`audioPlayer` em `cards.njk`), ou através de uma entrada na biblioteca de
audiolivros quando o formato o justificar. Qualquer evolução deve manter os
mesmos princípios: ficheiros reais, metadados honestos, licenças respeitadas.

> **Nunca** criar ligações de download para ficheiros inexistentes — o
> validator (`npm run validate`) falha o build se um URL do catálogo não existir.

## 10. Como a publicação chega ao site ao vivo

O fluxo completo é:

```
CMS (/admin/)  →  commit no GitHub (ramo main)  →  GitHub Actions
                                                        │
                     ┌──────────────────────────────────┤
                     ▼                                  ▼
              npm test (Vitest)              npm run build (Eleventy)
                     │                                  │
                     └──────────────┬───────────────────┘
                                    ▼
                          npm run validate
                                    │
                                    ▼
                      Deploy para GitHub Pages
                                    │
                                    ▼
                https://pedrom3160.github.io/blog/
```

1. Quando guarda/publica no CMS, é criado um commit no ramo `main`.
2. O workflow `.github/workflows/deploy.yml` executa automaticamente:
   testes → build → validação → deploy.
3. Em 1–3 minutos, o site em `https://pedrom3160.github.io/blog/` é atualizado.
4. Pode acompanhar o estado em **GitHub → Actions** no repositório.

Se o workflow falhar (ex. validação), o deploy **não acontece** e o site
permanece na versão anterior — o conteúdo inválido não chega ao público.
---

## 11. Como resolver problemas comuns

**Não consigo autenticar-me no /admin/**
- Confirme que o `cms-proxy/` está implantado e acessível (secção 12) e que
  `base_url`/`auth_endpoint` em `src/admin/config.yml` apontam para o URL real
  do proxy.
- A app OAuth do GitHub deve ter o callback `https://<proxy>/auth/callback` e o
  scope `repo`.
- Apenas contas com acesso de escrita ao repositório conseguem entrar.
- Limpe os cookies do site e tente novamente.

**Guardar um artigo não o mostra no site**
- Verifique o campo **Rascunho** (Draft): se estiver marcado, o artigo não é
  publicado (secção 7).
- Aguarde 1–3 minutos pelo deploy e confirme o estado em GitHub → Actions.

**O build/validação falha no GitHub Actions**
- Erros comuns: `downloadUrl`/`streamUrl` de catálogo a apontar para ficheiros
  inexistentes; frontmatter inválido (campos obrigatórios em falta); URLs sem o
  formato esperado.
- Abra o job falhado em Actions para ver a mensagem exata e corrija o conteúdo.

**Imagem não aparece**
- Confirme que o carregamento terminou (biblioteca Media) e que o caminho
  `/resources/uploads/...` está correto no frontmatter/Markdown.
- Formatos suportados: jpg, png, webp, svg, gif.

**"Input redirection is not supported" ao correr testes localmente**
- É um aviso do Vitest quando corre sem terminal interativo; os testes
  executam-se na mesma. Em CI (GitHub Actions) o problema não ocorre.

**Preciso de ajuda / quero editar via Git**
- Consulte `docs/CONTENT_GUIDE.md` (formato do conteúdo) e `README.md`
  (estrutura do projeto). Todo o conteúdo é Markdown com frontmatter YAML.

## 12. Serviços externos e credenciais a configurar

Para ativar a **autenticação e a escrita no CMS** (criar/editar/publicar/
carregar media), é necessário configurar **uma única vez**:

### 12.1. Criar uma OAuth App no GitHub

1. GitHub → *Settings* → *Developer settings* → *OAuth Apps* → **New OAuth App**.
2. Preencha:
   - **Application name**: `GPTCLONE Blog CMS`
   - **Homepage URL**: `https://pedrom3160.github.io/blog/`
   - **Authorization callback URL**: `https://<URL-DO-PROXY>/auth/callback`
3. Guarde o **Client ID** e gere um **Client Secret**.
### 12.2. Implantar o servidor proxy (`cms-proxy/`)

O GitHub Pages é estático e não pode guardar segredos; o OAuth tem de passar
por um servidor. A pasta `cms-proxy/` contém um servidor Node.js **sem
dependências** que:

- faz o fluxo OAuth do GitHub (`/auth`, `/auth/callback`);
- guarda o token num cookie http-only;
- encaminha as chamadas à API do GitHub (`/api/*`) com o token.

**Variáveis de ambiente necessárias:**

| Variável | Exemplo | Descrição |
|---|---|---|
| `GITHUB_CLIENT_ID` | `Iv1.0123456789abcdef` | Client ID da OAuth App |
| `GITHUB_CLIENT_SECRET` | `0123456789abcdef...` | Client Secret da OAuth App |
| `BASE_URL` | `https://cms-proxy-gptclone.onrender.com` | URL pública do proxy |
| `SESSION_SECRET` | *(texto aleatório longo)* | Assinatura do cookie de sessão |
| `NODE_ENV` | `production` | Define cookies Secure |
| `PORT` | `8080` | Porta (a maioria dos hosts define automaticamente) |

**Opções de alojamento (escolha uma):** Render, Railway, Fly.io, ou qualquer
VM/container com Node.js 18+. No Render/Railway basta criar um serviço Web a
partir do repositório, apontar para a pasta `cms-proxy/`, comando `npm start`, e
configurar as variáveis acima.

**Não é necessário instalar dependências** — o proxy não tem dependências npm.

### 12.3. Configurar o CMS

Edite `src/admin/config.yml` e substitua os placeholders pelo URL real do proxy:

```yaml
backend:
  name: github
  repo: pedrom3160/blog
  branch: main
  base_url: https://<URL-DO-PROXY>/api
  auth_endpoint: https://<URL-DO-PROXY>/auth
```

Faça commit e aguarde o deploy. A partir daí, `/admin/` fica totalmente
operacional.

### 12.4. Desenvolvimento local (opcional, sem proxy)

Para testar o CMS localmente sem configurar OAuth, o Decap suporta
`local_backend: true` (beta) com o servidor `npx decap-server` a correr na raiz
do repositório. Esta opção **não é necessária** para produção e não está
configurada por omissão.

---

## Página de Sugestões

A página `/suggestions/` não é gerida pelo CMS: o texto editorial vive em
`src/pages/suggestions.njk`, as categorias em `src/_data/suggestions.js` e o comportamento
em `src/scripts/suggestions.js`. Por omissão, o formulário prepara uma issue pública no
GitHub; não há backend nem armazenamento de submissões. Para receber sugestões sem conta
GitHub, configure um endpoint CORS em `src/_data/suggestions.js` e siga
`docs/SUGGESTIONS.md`. O CMS continua a gerir apenas os artigos, a página Sobre e os
catálogos de recursos.

## Resumo: operacional vs. requer configuração

| Funcionalidade | Estado |
|---|---|
| Site público (Jornal, Investigação IA, Academy, PDF, Audiolivros, Sobre, Sugestões, Doações, Pesquisa, Tags, RSS, Sitemap) | ✅ Operacional |
| Build + validação + testes (GitHub Actions) | ✅ Operacional |
| Interface de administração `/admin/` | ✅ Implementada |
| Pré-visualização de rascunhos (`/preview/`) | ✅ Implementada |
| Estados rascunho/publicado + exclusão | ✅ Implementados (filtragem no build) |
| Biblioteca de media (uploads de imagens/PDF) | ✅ Implementada no CMS |
| **Autenticação GitHub + escrita no repositório** | ⚠️ Requer OAuth App + `cms-proxy/` implantado (secção 12) |

Sem a secção 12, o site público e a edição de conteúdo via Git (editor web do
GitHub, repositório local) funcionam normalmente; apenas a interface `/admin/`
não consegue autenticar.
`.pdf`. Para imagens grandes, prefira WebP e dimensões até ~1600px de largura.