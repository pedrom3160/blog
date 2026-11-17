# Arquitetura do GPTCLONE Blog

## Visão Geral

O GPTCLONE Blog é um site estático construído com [Astro](https://astro.build/), projetado como uma plataforma pública de conhecimento, investigação, educação e diário de projeto. O site é totalmente estático, não requer backend, não necessita de registo de utilizador e é hospedado via GitHub Pages.

## Stack Tecnológica

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|-----------|
| Framework | Astro | ^4.16.12 | Gerador de site estático, SSR/SSG |
| Linguagem | TypeScript | ^5.6.3 | Tipagem estática, segurança de tipos |
| Estilização | Tailwind CSS | ^3.4.14 | CSS utilitário, design system GPTCLONE |
| Conteúdo | MDX + Astro Content Collections | — | Artigos, tutoriais, conteúdos estruturados |
| RSS | @astrojs/rss | ^4.0.9 | Feed de sindicação |
| Sitemap | @astrojs/sitemap | ^3.2.1 | Mapa do site para SEO |
| Testes | Vitest | ^2.1.4 | Testes unitários |
| Imagens | sharp | ^0.33.5 | Otimização de imagens |
| Pacotes | pnpm | — | Gestão de dependências |

## Estrutura de Diretórios

```
blog/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions para Pages
├── docs/                       # Documentação do projeto
├── reports/                    # Relatórios de desenvolvimento
├── content/
│   ├── config.ts               # Configuração das coleções de conteúdo
│   ├── journal/                # Artigos do jornal (Markdown)
│   ├── ai-research/            # Artigos de investigação IA (Markdown)
│   ├── academy/                # Conteúdo da academia (Markdown)
│   ├── authors/                # Perfis de autor (MDX frontmatter)
│   └── data/                   # Catálogos JSON (PDFs, audiolivros)
├── public/
│   ├── assets/                 # Imagens, avatares, ícones
│   ├── favicon.svg             # Favicon do site
│   └── robots.txt              # Diretrizes para crawlers
├── src/
│   ├── components/             # Componentes Astro reutilizáveis
│   ├── layouts/                # Layouts de página
│   ├── pages/                  # Rotas e páginas
│   ├── styles/                 # Estilos globais (CSS)
│   └── utils/                  # Utilitários (conteúdo, data, busca)
├── tests/                      # Testes Vitest
├── astro.config.mjs            # Configuração do Astro
├── tailwind.config.js          # Configuração do Tailwind
├── postcss.config.mjs          # Configuração do PostCSS
├── tsconfig.json               # Configuração do TypeScript
├── vitest.config.mts           # Configuração do Vitest
├── package.json                # Dependências e scripts
├── pnpm-lock.yaml              # Ficheiro de bloqueio pnpm
└── README.md                   # Documentação principal
```

## Coleções de Conteúdo

As coleções são definidas em `content/config.ts`:

- **journal** — Artigos do jornal GPTCLONE (notícias, atualizações, marcos)
- **ai-research** — Artigos de investigação em IA (LLMs, Transformers, etc.)
- **academy** — Conteúdo educativo da GPTCLONE Academy
- **authors** — Perfis de autor

Cada entrada de artigo segue o esquema `blogSchema` com campos: `title`, `description`, `pubDate`, `updatedDate`, `author`, `image`, `tags`, `category`, `readingTime`, `draft`, `related`.

## Rotes do Site

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial com artigos em destaque e visão geral |
| `/journal/` | Listagem de artigos do jornal |
| `/journal/[slug]/` | Artigo individual do jornal |
| `/ai-research/` | Listagem de artigos de investigação IA |
| `/ai-research/[slug]/` | Artigo individual de investigação |
| `/academy/` | Listagem de conteúdo da academia |
| `/academy/[slug]/` | Lição individual da academia |
| `/pdf-library/` | Catálogo de documentos PDF |
| `/audiobook-library/` | Catálogo de audiolivros |
| `/about/` | Sobre o blog, missão e limites |
| `/tags/[tag]/` | Artigos filtrados por tag |
| `/rss.xml` | Feed RSS |
| `/404` | Página de erro personalizada |

## Design System

A paleta de cores GPTCLONE (purple & aurora):

- `#1b1836` — primary dark background
- `#242044` — deep purple (bg)
- `#39416D` — secondary purple (surface)
- `#7047D7` — primary purple
- `#A66BFF` — aurora purple
- `#16C9D8` — cyan accent
- `#F2EEFF` — light text

Tema escuro como experiência principal. Suporte a tema claro via toggle. CSS custom properties em `src/styles/global.css`.

## Deploy

O site é construído estaticamente com `astro build` (saída em `dist/`). O deploy é feito via GitHub Actions para GitHub Pages. O workflow está em `.github/workflows/deploy.yml`.

URL esperado: `https://pedrom3160.github.io/blog/`

## Princípios de Design

- Site totalmente estático — sem backend, sem base de dados, sem autenticação
- Conteúdo em português europeu (pt-PT) com arquitetura preparada para futuras traduções
- Design original GPTCLONE, não um tema genérico
- Acessibilidade e navegação por teclado
- Design responsivo (desktop, tablet, mobile)
- Conteúdo verdadeiro — nunca apresentar funcionalidades planeadas como implementadas
