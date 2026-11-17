# Deploy — GPTCLONE Blog

## Visão Geral

O GPTCLONE Blog é um site estático construído com Astro e hospedado no GitHub Pages. O build é produzido localmente (ou via GitHub Actions) e os ficheiros estáticos são servidos diretamente.

URL esperado: `https://pedrom3160.github.io/blog/`

## Stack de Deploy

- **Gerador de site estático:** Astro (`output: 'static'`)
- **Hospedagem:** GitHub Pages (gratuito, público)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)
- **Gestor de pacotes:** pnpm

## Workflow do GitHub Actions

O workflow está em `.github/workflows/deploy.yml` e é executado em cada push para o branch `main`:

1. **Checkout** — Obtém o código do repositório
2. **Setup Node.js** — Configura o ambiente Node.js 24
3. **Setup pnpm** — Instala o gestor de pacotes pnpm
4. **Install dependencies** — Executa `pnpm install`
5. **Build** — Executa `pnpm run build` (inclui validação de TypeScript)
6. **Upload artifact** — Envia a pasta `dist/` para o GitHub Pages
7. **Deploy** — Implementa o site via `actions/deploy-pages@v4`

## Configuração do GitHub Pages

No repositório GitHub (`pedrom3160/blog`):

1. Ir a **Settings** → **Pages**
2. Em **Build and deployment**, selecionar **Source: GitHub Actions**
3. O workflow irá automaticamente construir e deployar em cada push para `main`
4. O site ficará disponível em `https://pedrom3160.github.io/blog/`

## Build Local

```powershell
# Instalar dependências
pnpm install

# Build de produção
pnpm run build

# Pré-visualizar localmente
pnpm run preview
```

O resultado do build fica em `dist/`:
- `index.html` — ponto de entrada
- `assets/` — JavaScript e CSS com hash de cache
- Ficheiros estáticos copiados de `public/`

## Verificação

Antes de fazer push, executar localmente:

```powershell
pnpm run build          # Verificar se o build ocorre sem erros
pnpm run preview        # Verificar o site localmente
```

## Limitações

- Site totalmente estático — sem backend, sem base de dados
- Sem autenticação nem registo de utilizador
- Sem busca do lado do servidor (busca no frontend se implementada)
- PDFs e audiolivros só estão disponíveis se os ficheiros físicos existirem em `public/resources/`
