# Donativos — configuração e política

A página `/donations/` explica o modelo de apoio ao projeto. **Não existem canais de donativo
ativos** por omissão, e o site nunca inventa um botão de pagamento.

## Onde se configura

Ficheiro único: `src/_data/donations.js`.

```js
export default {
  channels: [],
  status: 'not-configured',
  lastReviewed: '2026-11-19',
};
```

### Adicionar um canal

```js
channels: [
  {
    label: 'GitHub Sponsors',
    description: 'Apoio recorrente para alojamento e manutenção.',
    url: 'https://github.com/sponsors/pedrom3160',
    type: 'recurring', // ou 'one-off'
  },
],
```

Regras obrigatórias:

1. Apenas canais controlados pelo projeto e verificáveis.
2. `url` tem de começar por `https://`.
3. Preencher `label` e `description` (a página e os testes verificam ambos).
4. Nunca guardar números de cartão, IBANs, chaves privadas ou endereços de criptomoeda neste
   ficheiro, no repositório ou em qualquer página.
5. Atualizar `lastReviewed` sempre que a página for revista.

## Comportamento da página

| Estado | Renderização |
|--------|--------------|
| `channels: []` | Painel “Ainda não existem canais de apoio ativos”, com aviso de que só canais listados são legítimos |
| Um ou mais canais | Grelha de canais com etiqueta, descrição e ligação `rel="noopener noreferrer"` |

A página inclui ainda prioridades de custo, compromissos de transparência, alternativas sem
donativo e FAQ. Não promete recompensas, deduções fiscais ou influência editorial.

## Testes

`tests/navigation.test.js` valida que:

- o catálogo é uma lista (pode estar vazio);
- cada canal tem rótulo, descrição e URL `https://`;
- não existem padrões de cartão, IBAN ou wallet no ficheiro.

## Segurança

Se um canal for comprometido, remover a entrada, atualizar `lastReviewed`, e publicar. A página é o
único ponto oficial de canais; qualquer pedido noutro meio deve ser considerado suspeito.
