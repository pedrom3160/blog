# GPTCLONE Blog

Plataforma pública de conhecimento, investigação, educação e diário de projeto do GPTCLONE.

## Idioma

Português Europeu (pt-PT). Arquitetura preparada para expansão multilingue.

## Secções de conteúdo

- **Jornal GPTCLONE** — Notícias, atualizações de desenvolvimento, marcos, decisões técnicas.
- **Biblioteca PDF** — Catálogo de documentos técnicos, tutoriais, guias de programação.
- **Biblioteca de Audiolivros** — Material educativo em formato áudio.
- **Investigação em IA** — IA, ML, DL, LLMs, Transformers, Tokenização e muito mais.
- **GPTCLONE Academy** — Caminhos de aprendizagem estruturados.

## Stack

- [Astro](https://astro.build/) — Generador de sites estáticos
- [TypeScript](https://www.typescriptlang.org/) — Tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) — Estilização utilitária
- [MDX](https://mdxjs.com/) — Conteúdo em Markdown com componentes
- [Vitest](https://vitest.dev/) — Testes

## Comandos

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Pré-visualizar build
npm run preview

# Executar testes
npm test
```

## Estrutura de diretórios

```
src/
  components/   Componentes reutilizáveis
  layouts/      Layouts de página
  pages/        Páginas e rotas
  styles/       Estilos globais
  utils/        Utilitários
content/
  journal/      Artigos do jornal (Markdown)
  ai-research/  Artigos de investigação IA (Markdown)
  academy/      Conteúdo da academia (Markdown)
  authors/      Perfis de autor
  data/         Dados de catálogos (JSON)
public/
  assets/       Imagens, avatares, ícones
  resources/    PDFs e audiolivros (não versionar ficheiros grandes)
```

## Licença

Conteúdo publicado sob licença CC-BY-4.0 salvo indicação em contrário.

## Limites arquitetónicos

O Blog é uma plataforma independente do ecossistema GPTCLONE. Não é uma dependência do Foundation, Studio, Router ou Model Hub.