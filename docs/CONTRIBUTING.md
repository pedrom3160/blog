# Contribuir — GPTCLONE Blog

Obrigado pelo interesse em contribuir para o GPTCLONE Blog! Este guia explica como participar no desenvolvimento do projeto.

## Código de Conduta

- Seja respeitoso e construtivo em todas as interações
- Foque-se em conteúdo técnico preciso e honesto
- Nunca invente conquistas, benchmarks ou funcionalidades não implementadas
- Respeite direitos de autor e licenciamento de conteúdos de terceiros

## Como Contribuir

### 1. Fork e Clone

```bash
git clone https://github.com/pedrom3160/blog.git
cd blog
```

### 2. Instalar Dependências

O projeto usa npm:

```powershell
npm install
```

### 3. Ambiente de Desenvolvimento

```powershell
# Servidor de desenvolvimento com recarregamento automático
npm run dev

# O servidor fica disponível em http://localhost:8080 (porta padrão do Eleventy)
```

### 4. Adicionar Conteúdo

Consulte `docs/CONTENT_GUIDE.md` para instruções detalhadas sobre:

- Adicionar artigos ao Jornal, Investigação IA ou Academia
- Adicionar PDFs à Biblioteca PDF
- Adicionar audiolivros à Biblioteca de Audiolivros
- Adicionar autores

### 5. Validação

Antes de submeter alterações, executar:

```powershell
# Executar testes
npm test

# Build de produção
npm run build

# Validar o output do build (links, base path, SEO)
npm run validate

# Pré-visualizar build
npm run preview
```

### 6. Submeter Alterações

```bash
git checkout -b sua-feature
git add .
git commit -m "feat: descrição da alteração"
git push origin sua-feature
```

Abrir um Pull Request no GitHub descrevendo as alterações.

## Estrutura de Commits

Usar mensagens de commit no formato:

```
<tipo>: <descrição>

Exemplos:
feat: adicionar artigo sobre Transformers ao jornal
fix: corrigir cor de fundo na página inicial
docs: atualizar guia de conteúdo
chore: atualizar dependências
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Revisão de Código

Todos os Pull Requests devem:
- Passar nos testes existentes
- Passar na verificação de tipos TypeScript
- Produzir um build de produção bem-sucedido
- Manter a consistência com o design system GPTCLONE
- Incluir documentação quando adicionar novas funcionalidades

## Conteúdo e Licença

Todo o conteúdo do blog é publicado sob licença **CC-BY-4.0** salvo indicação em contrário. Ficheiros de recursos (PDFs, áudio) podem ter licenciamentos próprios, indicados em cada entrada do catálogo.

O código-fonte do site está sob a mesma licença salvo indicação em contrário.

## Limites do Projeto

O Blog é uma plataforma independente do ecossistema GPTCLONE. Não é uma dependência do Foundation, Studio, Router ou Model Hub. Não criar integrações com a infraestrutura interna de modelos salvo requisito futuro claramente documentado.
