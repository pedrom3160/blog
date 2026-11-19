# Sugestões — integração, privacidade e operação

A página `/suggestions/` convida visitantes a propor funcionalidades, nomes, melhorias de
design e feedback. A configuração vive em `src/_data/suggestions.js`; o comportamento do
formulário está em `src/scripts/suggestions.js`.

Existem três modos, resolvidos no build por esta ordem:

| Prioridade | Modo | Quando é usado |
|---|---|---|
| 1 | `web3forms` | `WEB3FORMS_ACCESS_KEY` está definida |
| 2 | `endpoint` | `endpoint` está preenchido em `src/_data/suggestions.js` |
| 3 | `github` | Nenhum dos anteriores está configurado (estado atual) |

A ação nativa do formulário segue o modo configurado. No modo GitHub, sem JavaScript, abre
uma issue em branco; no modo provider, envia diretamente para o endpoint (Web3Forms recebe a
chave pública num campo oculto). Com JavaScript, o botão principal usa o mesmo modo e o GitHub
continua disponível como alternativa.

## Modo atual: issue pública no GitHub

Sem chave nem endpoint, o formulário valida os campos localmente e **prepara** uma issue no
repositório `pedrom3160/blog` com título, categoria, descrição e nome/pseudónimo opcional.
Depois abre o GitHub numa nova aba. A sugestão só existe quando o visitante confirma a
publicação no GitHub.

- Nenhum dado é enviado por este site.
- Não há falsa confirmação de envio: o estado diz “Sugestão preparada” e liga à issue.
- É necessária uma conta GitHub gratuita para publicar.
- O email não é pedido neste modo, porque a issue é pública.
- O campo “website” é um honeypot e nunca aparece para pessoas.

**Limitação principal:** visitantes sem conta GitHub não conseguem publicar. O botão “Copiar
sugestão” guarda o texto, mas não o submete.

## Modo recomendado para submissões anónimas: Web3Forms

Web3Forms é um serviço de formulários para sites estáticos: recebe o `POST`, filtra spam e
entrega a submissão por email ao proprietário. Não exige conta ao visitante e não precisa de
backend próprio.

### Porque foi escolhido

Comparação feita em novembro de 2026; os limites dos fornecedores podem mudar.

| Opção | Conta do visitante | Free tier | Observações |
|---|---|---|---|
| **Web3Forms** | Não | 250/mês | Chave pública por desenho, `POST` JSON/CORS, filtro de spam, hCaptcha opcional; dados até 3 anos (configurável) |
| Formspree | Não | 50/mês | Maturidade e spam fortes; limite baixo no gratuito |
| Formspark | Não | 250/mês | Spam forte e foco europeu; guarda IP até 12 meses; conta e endpoint |
| FormSubmit | Não | Ilimitado | Sem conta, mas expõe/ativa um email e tem menos controlo de privacidade |
| Cloudflare Worker | Não | Requer conta | Controlo total, mas exige Worker, segredo e envio de email; infraestrutura excessiva |

Web3Forms foi escolhido pelo maior limite gratuito sem obrigar o visitante a criar conta, pela
integração directa com `fetch` e por manter o GitHub como alternativa. O `access_key` é um
identificador público de encaminhamento, não uma credencial com poderes de leitura.

### Ativação (requer uma conta Web3Forms do proprietário)

1. Criar um formulário em https://web3forms.com/ com o email que deve receber as sugestões.
2. Confirmar o email e copiar o **Access Key** do formulário (UUID).
3. No GitHub, abrir **Settings → Secrets and variables → Actions → Variables** e criar
   `WEB3FORMS_ACCESS_KEY` com esse valor. É uma variável, não um secret: a chave fica visível
   no HTML por desenho.
4. O workflow `.github/workflows/deploy.yml` passa a variável ao build. Localmente:
   `WEB3FORMS_ACCESS_KEY=... npm run build && npm run validate`.
5. No painel Web3Forms, definir a retenção de submissões para **7 dias** (ou o mínimo adequado)
   e ativar hCaptcha apenas se houver spam.
6. Publicar e verificar que a página tem `data-mode="web3forms"`, o campo de email opcional e
   o botão “Enviar sugestão”. Fazer uma submissão real de teste.

Sem o passo 3, o site continua no modo GitHub. Não existe uma chave fictícia no repositório.

### O que o visitante vê

- Categoria, título e descrição obrigatórios; nome/pseudónimo e email opcionais.
- Aviso de que os campos seguem para Web3Forms, que os encaminha por email, e de que o email
  não é publicado.
- Ligação para a política de privacidade do Web3Forms.
- “Preparar no GitHub” como alternativa pública.
- Sucesso apenas quando o Web3Forms devolve `{"success": true}`; um HTTP 200 com
  `success: false` é tratado como falha.
- Em caso de falha, o texto permanece no formulário e é oferecida uma issue pré-preenchida no
  GitHub.

### Privacidade e retenção

- **GitHub:** nome e texto ficam públicos na issue; o email nunca é recolhido nem incluído no URL.
- **Web3Forms:** recebe categoria, título, descrição, nome e email (se preenchido), além de
  metadados técnicos como IP e user-agent. A submissão é armazenada e enviada por email ao
  proprietário. A retenção por omissão pode chegar a 3 anos e é configurável por formulário
  (mínimo de 7 dias); a visibilidade no painel gratuito é de 30 dias. Consultar
  https://web3forms.com/privacy e https://web3forms.com/dpa.
- O site não usa cookies, `localStorage` nem analytics para o formulário, e não guarda
  submissões localmente.
- Não incluir dados sensíveis. O email é opcional e serve apenas para uma eventual resposta.

### Spam, abuso e limites

- O honeypot local é a primeira barreira contra bots simples; o Web3Forms aplica também
  filtragem do lado do servidor. Não foi executado um teste com bots reais.
- Não foi adicionado CAPTCHA para evitar fricção. Se houver spam, ativar o hCaptcha do
  Web3Forms (gratuito) ou o Turnstile (Pro).
- O plano gratuito tem 250 submissões por mês e devolve 429 quando o limite é atingido. O site
  mostra erro e mantém a alternativa GitHub.
- A chave pública pode ser copiada e usada para enviar para a mesma caixa. A restrição de
  domínio é uma funcionalidade Pro; se houver abuso, rodar a chave e ativar hCaptcha.
- Não existe rate limiting próprio no browser: qualquer limite apenas no cliente seria
  contornável e criaria falsa segurança. O limite efetivo é o do fornecedor.

### Endpoint CORS genérico

Para outro fornecedor, preencher em `src/_data/suggestions.js`:

```js
const endpoint = 'https://formspree.io/f/xxxxxxxx';
const endpointProvider = 'Formspree';
```

O formulário envia `POST` JSON e só mostra sucesso após uma resposta 2xx. Nunca colocar neste
campo chaves privadas, tokens administrativos ou credenciais. Se o fornecedor exigir uma chave
pública, documentar o domínio e a retenção. O modo Web3Forms tem prioridade sobre este.

## Validação e acessibilidade

- Categoria obrigatória; título 8–120 caracteres; descrição 30–2000.
- Nome até 80 caracteres; email validado se preenchido.
- Erros ligados por `aria-describedby`, foco no primeiro campo inválido e estado em
  `role="status"` com `aria-live="polite"`.
- O formulário mantém validação nativa sem JavaScript e uma ligação directa para uma issue em
  branco.
- Durante o envio, o botão fica desativado e o formulário recebe `aria-busy="true"`.
- Sem JavaScript, o modo GitHub nunca inclui o campo de email; o modo provider envia ao
  fornecedor, não ao GitHub, evitando expor um email no URL.

## Testes e manutenção

- `tests/suggestions.test.js` cobre categorias, validação, URL da issue, ausência de email no
  URL público e no texto copiado, payload Web3Forms e a regra `success === true`.
- `npm run validate` verifica o modo renderizado, os campos, o email opcional, a chave pública
  quando aplicável, a ação GitHub de fallback, o estado acessível e o `noindex` da 404.
- Para testar o modo Web3Forms localmente sem enviar nada, construir com uma chave fictícia e
  substituir `window.fetch` no browser por uma resposta controlada; nunca usar uma chave real
  em testes automatizados.
- Ao alterar o formulário, atualizar `lastReviewed` e a versão de cache em `base.njk` e
  `suggestions.njk`.
