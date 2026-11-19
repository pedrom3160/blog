---
slug: tokenizacao-explicada
collection: ai-research
permalink: /ai-research/tokenizacao-explicada/
title: "Tokenização Explicada"
description: "Como funciona a tokenização em modelos de linguagem: BPE, WordPiece, SentencePiece, e o impacto nos LLMs. Explicação técnica com exemplos."
pubDate: 2026-11-17
updatedDate: 2026-11-17
author: "GPTCLONE"
image: "/assets/images/tokenization.svg"
tags: ["tokenização", "tokenizer", "bpe", "nlp", "processamento-linguagem-natural"]
category: "Processamento de Linguagem Natural"
readingTime: "10 min"
related: ["introducao-llms", "arquitetura-transformers", "introducao-ia"]
---

## O que é a tokenização?

A tokenização é o processo de dividir um texto em unidades menores chamadas **tokens**. Os modelos de linguagem não processam texto bruto; processam representações numéricas desses tokens. Cada token é mapeado para um inteiro (token ID) que serve de índice numa tabela de embeddings.

## Por que a tokenização é necessária

1. Os modelos neurais trabalham com números, não com texto.
2. Tokens permitem ao modelo aprender unidades significativas (subpalavras, palavras, caracteres).
3. Um vocabulário fixo de tokens torna o modelo computacionalmente viável.

## Tipos de tokenização

### Tokenização por palavra

Cada palavra é um token. Simples, mas gera vocabulários muito grandes e não consegue lidar com palavras fora do vocabulário (OOV - Out of Vocabulary).

### Tokenização por carácter

Cada caractere é um token. Vocabulário pequeno, mas sequências longas e dificuldade em capturar significado semântico.

### Tokenização por subpalavra (Subword)

Compromisso entre palavra e caractere. Palavras comuns são tokens únicos; palavras raras são divididas em subunidades. Este é o enfoque usado na maioria dos LLMs modernos.

## Algoritmos de subpalavra

### BPE (Byte Pair Encoding)

O BPE começa com caracteres individuais e funde iterativamente os pares de caracteres mais frequentes, criando tokens de subpalavras.

**Exemplo:**

```
Palavra: "hugging"
Passo 1: h u g g i n g
Passo 2: Fundir "ug" → h u g ug i n g
Passo 3: Fundir "hug" → hug ug i n g
Passo 4: Fundir "ing" → hug ug ing
Resultado: ["hug", "ug", "ing"]
```

### WordPiece

Usado pelo BERT. Similar ao BPE, mas usa uma métrica diferente para decidir quais pares fundir (baseia-se na probabilidade do par dado os componentes individuais).

### SentencePiece

Trata o texto como uma sequência de caracteres e aprende a tokenização diretamente do texto bruto, incluindo espaços como parte do vocabulário. Usado por modelos como T5 e LLaMA.

## Tokenização ao nível de bytes (Byte-level BPE)

Alguns modelos (como GPT-2) operam ao nível de bytes em vez de caracteres Unicode. Isso garante que qualquer string pode ser tokenizada sem tokens "desconhecidos", já que há apenas 256 possíveis bytes.

## Impacto nos LLMs

A escolha do tokenizador afeta:

- **Tamanho do vocabulário**: Tipicamente entre 30.000 e 100.000+ tokens.
- **Comprimento da sequência**: Mais tokens por texto = mais computação.
- **Eficiência em diferentes idiomas**: Alguns tokenizadores são mais eficientes para inglês do que para português ou outras línguas.
- **Capacidade de generalização**: Subpalavras permitem ao modelo lidar com palavras nunca vistas durante o treino.

## Exemplo prático

Texto: "O gato está no telhado"

Tokenização simplificada (exemplo ilustrativo):

```
["O", " gato", " está", " no", " telhado"]
Token IDs: [452, 1283, 2910, 538, 18901]
```

Em um tokenizer real, "telhado" poderia ser dividido em subpalavras como "telh" + "ado" se não estivesse no vocabulário.

## Limites e desafios

- **Tokenização inconsistente entre modelos**: Cada modelo tem o seu próprio tokenizer. Tokens não são intercambiáveis.
- **Custo por token**: APIs de LLMs cobram por token processado.
- **Viés linguístico**: Tokenizadores treinados principalmente em inglês podem ser menos eficientes para outras línguas.

---

Leia também: [Grandes Modelos de Linguagem (LLMs)](/ai-research/introducao-llms) e [Arquitetura Transformer Explicada](/ai-research/arquitetura-transformers).