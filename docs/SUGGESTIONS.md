# Sugestões — integração e privacidade

A página `/suggestions/` convida visitantes a propor funcionalidades, nomes, melhorias de
design e feedback. A configuração vive em `src/_data/suggestions.js`; o comportamento do
formulário está em `src/scripts/suggestions.js`.

## Comportamento por omissão: issue pública no GitHub

Sem backend, o formulário valida os campos localmente e **prepara** uma issue no repositório
`pedrom3160/blog` com título, categoria, descrição e nome/pseudónimo opcional. Depois abre o
GitHub numa nova aba. A sugestão só existe quando o visitante confirma a publicação no GitHub.

- Nenhum dado é enviado por este site.
- Não há falsa confirmação de envio: o estado diz “Sugestão preparada” e liga à issue.
- É necessária uma conta GitHub gratuita para publicar.
- O email não é pedido neste modo, porque a issue é pública.
- O campo “website” é um honeypot e nunca aparece para pessoas.

Limitações: visitantes sem conta GitHub não conseguem publicar. O botão “Copiar sugestão”
permite guardar o texto, mas não o submete. Se for necessário aceitar sugestões sem conta,
configure um endpoint privado.

## Endpoint privado opcional

1. Crie um formulário num serviço compatível com CORS e POST JSON (por exemplo, Formspree).
2. Em `src/_data/suggestions.js`, defina:

   ```js
   const endpoint = 'https://formspree.io/f/xxxxxxxx';
   const endpointProvider = 'Formspree';
   ```

3. Confirme que o serviço aceita `POST` com `Content-Type: application/json` e devolve 2xx.
4. Teste num ambiente local: o formulário só apresenta sucesso após uma resposta 2xx.
5. Atualize `lastReviewed` e a política de privacidade do serviço.

O endpoint é público por natureza (é chamado pelo browser). Nunca coloque aqui chaves
privadas, tokens de API com poderes administrativos ou credenciais. Se o serviço exigir uma
chave pública, documente-a e restrinja o domínio de origem no painel do fornecedor.

Neste modo, o campo de email aparece, é opcional e é enviado ao fornecedor. A página indica
o nome do fornecedor e não publica o email.

## Validação e acessibilidade

- Categoria obrigatória; título 8–120 caracteres; descrição 30–2000.
- Nome até 80 caracteres; email validado se preenchido.
- Erros ligados por `aria-describedby`, foco no primeiro campo inválido e estado em
  `role="status"` com `aria-live="polite"`.
- O formulário mantém validação nativa sem JavaScript e oferece uma ligação directa para
  abrir uma issue em branco.
- Nenhum dado é guardado em `localStorage` ou cookies.

## Spam

O honeypot é suficiente para o volume esperado. Se o endpoint for ativado e receber spam,
ative a proteção anti-spam do fornecedor em vez de adicionar CAPTCHA à página. Não recolha
IPs nem dados de rastreio no site.

## Testes

`tests/suggestions.test.js` cobre categorias, validação, construção da issue e garantia de
que o email nunca entra no URL público. `npm run validate` verifica a rota, os campos, os
textos essenciais, a ausência da assinatura antiga de equipa e a sitemap.
