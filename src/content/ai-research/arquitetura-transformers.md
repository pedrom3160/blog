---
slug: arquitetura-transformers
collection: ai-research
permalink: /ai-research/arquitetura-transformers/
title: "Arquitetura Transformer Explicada"
description: "Como funciona a arquitetura Transformer: self-attention, camadas, codificação posicional, encoder e decoder. Explicação técnica passo a passo."
pubDate: 2026-11-17
updatedDate: 2026-11-17
author: "GPTCLONE"
image: "/assets/images/transformer-architecture.svg"
tags: ["transformer", "arquitetura", "self-attention", "deep-learning", "redes-neurais"]
category: "Arquitetura de Modelos"
readingTime: "15 min"
related: ["introducao-llms", "introducao-ia", "tokenizacao-explicada"]
---

## O que é o Transformer?

O Transformer é uma arquitetura de rede neural introduzida no artigo "Attention Is All You Need" (Vaswani et al., 2017). Revolucionou o processamento de linguagem natural ao dispensar recorrência e convoluções, baseando-se exclusivamente em mecanismos de atenção.

## Componentes principais

### Embeddings de entrada

Os tokens de entrada são convertidos em vetores de representação (embeddings). Estes vetores capturam informação semântica sobre cada token.

### Codificação posicional

Como o Transformer não processa sequências de forma sequencial (diferente das RNNs), precisa de informação sobre a posição de cada token na sequência. A codificação posicional adiciona esta informação aos embeddings.

```python
# Exemplo simplificado de codificação posicional senoidal
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

Onde `pos` é a posição e `i` é a dimensão.

### Self-Attention (Atenção Autoatenta)

O mecanismo de atenção permite ao modelo focar em diferentes partes da sequência de entrada ao processar cada token. Para cada token, calculamos:

- **Query (Q)**: O que estou a procurar?
- **Key (K)**: Que informação contenho?
- **Value (V)**: Que informação ofereço?

A atenção é calculada como:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Onde $d_k$ é a dimensão das chaves, usada para escalar e evitar valores muito grandes no softmax.

### Multi-Head Attention

Em vez de um único mecanismo de atenção, o Transformer usa múltiplas "cabeças" de atenção em paralelo, cada uma focando em diferentes aspetos da sequência. Os resultados são concatenados e transformados linearmente.

### Feed-Forward Network

Após a atenção, cada posição passa por uma rede feed-forward (duas camadas lineares com uma função de ativação entre elas).

### Camadas e estrutura

O Transformer original tem:

- **Encoder**: Múltiplas camadas de auto-atenção + feed-forward. Processa a sequência de entrada.
- **Decoder**: Múltiplas camadas de auto-atenção mascarada + atenção encoder-decoder + feed-forward. Gere a sequência de saída.

Para modelos apenas de linguagem (como os LLMs modernos), usa-se tipicamente apenas o decoder (arquitetura decoder-only).

## Fluxo de processamento (Decoder-only)

1. Tokens de entrada → Embeddings + Codificação Posicional
2. Para cada camada do decoder:
   a. Multi-Head Self-Attention mascarada (o modelo não pode ver tokens futuros)
   b. Norma de camada + ligação residual
   c. Multi-Head Cross-Attention (apenas em encoder-decoder; omitido em decoder-only)
   d. Norma de camada + ligação residual
   e. Feed-Forward Network
   f. Norma de camada + ligação residual
3. Camada linear final + Softmax → Probabilidades sobre o vocabulário
4. Seleção do próximo token

## Por que o Transformer funciona bem

- **Paralelização**: Todo o processo pode ser paralelizado ao longo da sequência (diferente das RNNs).
- **Dependências de longo alcance**: A atenção direta permite conectar qualquer par de tokens, independentemente da distância.
- **Escalabilidade**: O desempenho melhora com mais dados e mais parâmetros.

## Variantes comuns

| Variante | Descrição | Uso típico |
|----------|-----------|------------|
| Encoder-only | Apenas o encoder (ex: BERT) | Classificação, extração de entidades |
| Decoder-only | Apenas o decoder (ex: GPT) | Geração de texto, LLMs |
| Encoder-decoder | Ambos (ex: T5) | Tradução, resumo |

---

Leia também: [Grandes Modelos de Linguagem (LLMs)](/ai-research/introducao-llms) e [Tokenização Explicada](/ai-research/tokenizacao-explicada).