# Publicar Audiolivros e Áudio

A Biblioteca de Audiolivros é um catálogo em `src/_data/audiobookLibrary.json`. O ficheiro de
áudio tem de existir em `public/resources/audiobooks/` e o catálogo tem de apontar para ele.

- Página pública: https://pedrom3160.github.io/blog/audiobook-library/
- Pasta dos ficheiros: `public/resources/audiobooks/`
- Catálogo: `src/_data/audiobookLibrary.json`
- Player reutilizável: `src/_includes/components/cards.njk` (`audioPlayer`)

## 1. Como a biblioteca funciona hoje

Cada entrada mostra título, descrição, categoria, autor, narrador, idioma, licença e duração. Se
`streamUrl` existir, o cartão mostra **Ouvir**; se `downloadUrl` existir, mostra **Descarregar**.
Entradas sem ficheiro usam `placeholder: true` e **Em breve**.

O cartão **não incorpora** o player por entrada: **Ouvir** abre o ficheiro de áudio no browser.
A página tem um player de demonstração (`sample-tone.wav`) para mostrar os controlos. Para um
player incorporado numa página própria, use o macro `audioPlayer` (secção 6).

**Limitações atuais:**

- Não existe uma página individual por audiolivro.
- Não há suporte nativo a capítulos/playlist no catálogo.
- O cartão não mostra imagem de capa.
- O player personalizado não inclui transcrição nem faixas de legenda; a transcrição deve ser
  incluída como texto na página.

## 2. Preparar o áudio

Recomendações para narração educativa:

- **MP3** é a escolha mais compatível para download e reprodução.
- **M4A/AAC** é uma boa alternativa de qualidade/tamanho.
- **OGG/Opus** é eficiente, mas menos universal em alguns dispositivos.
- Evite WAV para conteúdo longo: é muito maior. O `sample-tone.wav` existe apenas como
  demonstração técnica.
- Para voz, 44,1 kHz ou 48 kHz, mono ou estéreo, 96–128 kbps MP3 costuma ser suficiente.
- Normalize o volume, remova silêncios excessivos e confirme que não há clipping.
- Nome: `01-introducao.mp3`, `02-fundamentos.mp3`; sem espaços nem acentos.

Só publique áudio que pode distribuir. Indique a licença e o crédito do narrador/autor.

## 3. Carregar o áudio

### Pelo GitHub

1. Abra
   [`public/resources/audiobooks`](https://github.com/pedrom3160/blog/tree/main/public/resources/audiobooks).
2. **Add file → Upload files**.
3. Para uma obra com capítulos, crie uma pasta com o slug da obra e carregue os ficheiros.
4. Faça commit em `main`.

O URL público começa por:
`https://pedrom3160.github.io/blog/resources/audiobooks/...`.

### Localmente

Copie os ficheiros para `public/resources/audiobooks/` e faça commit. Não coloque caminhos
absolutos do computador no JSON.

## 4. Registar no catálogo

```json
{
  "id": "audio-transformers-001",
  "title": "Introdução aos Transformers — Áudio",
  "description": "Explicação introdutória à arquitetura Transformer, narrada em português europeu.",
  "category": "arquitetura",
  "tags": ["transformers", "attention", "audio"],
  "author": "GPTCLONE",
  "narrator": "Nome real do narrador",
  "license": "CC-BY-4.0",
  "language": "pt-PT",
  "durationSeconds": 932,
  "durationDisplay": "15:32",
  "sample": false,
  "placeholder": false,
  "downloadUrl": "/resources/audiobooks/transformers/audio-completo.mp3",
  "streamUrl": "/resources/audiobooks/transformers/audio-completo.mp3",
  "uploadDate": "2026-11-19"
}
```

### Campos

| Campo | Obrigatório | Notas |
|---|---|---|
| `id` | Sim | Único; não reutilize |
| `title` | Sim | Nome visível |
| `description` | Sim | Conteúdo e âmbito, sem promessas |
| `category` | Sim | Usada no filtro; mantenha consistência |
| `tags` | Sim (array) | Pesquisa e descoberta |
| `author` | Sim | Autor do texto/projeto |
| `narrator` | Recomendado | Pessoa ou “Síntese de voz” se for o caso |
| `license` | Sim | Licença do áudio e do texto |
| `language` | Sim | `pt-PT` |
| `durationSeconds` | Opcional | Duração real em segundos (reservado para metadados) |
| `durationDisplay` | Recomendado | Texto mostrado, ex.: `15:32` |
| `sample` | Sim | `true` para amostras |
| `placeholder` | Sim | `true` só quando não há ficheiro |
| `downloadUrl` | Opcional | Caminho local, se existir ficheiro |
| `streamUrl` | Opcional | Caminho local para ouvir |
| `uploadDate` | Sim | `AAAA-MM-DD` |

Os caminhos não levam `/blog`; o build acrescenta o prefixo. O validador falha se `streamUrl` ou
`downloadUrl` apontarem para ficheiros inexistentes.

## 5. Placeholders honestos

Enquanto não existe áudio:

```json
{
  "id": "audio-futuro-001",
  "title": "Título previsto",
  "description": "Descrição do que será publicado.",
  "category": "llm",
  "tags": ["llm", "audio"],
  "author": "GPTCLONE",
  "narrator": "Síntese de voz (planeada)",
  "license": "CC-BY-4.0",
  "language": "pt-PT",
  "durationSeconds": null,
  "durationDisplay": "Disponível em breve",
  "sample": true,
  "placeholder": true,
  "downloadUrl": null,
  "streamUrl": null,
  "uploadDate": "2026-11-19"
}
```

Não coloque um URL que não existe só para o cartão parecer completo.

## 6. Player acessível numa página própria

O catálogo não cria uma rota por obra. Se precisar de uma página com player incorporado, crie
uma página Nunjucks ou um artigo com um bloco de template. O macro existente é:

```njk
{% import "components/cards.njk" as cards %}
{{ cards.audioPlayer(
  "Introdução aos Transformers",
  "/resources/audiobooks/transformers/audio-completo.mp3",
  "/resources/audiobooks/transformers/audio-completo.mp3"
) }}
```

O player inclui:

- botão Reproduzir/Pausar com `aria-label` atualizado;
- barra de progresso com etiqueta;
- controlo de volume com etiqueta;
- tempo atual/duração;
- ligação de descarga opcional.

O elemento `<audio>` não tem `controls` nativo porque os controlos são personalizados; por isso,
teste teclado e leitores de ecrã. Inclua sempre uma **transcrição** ou um resumo textual na
página e não dependa apenas do áudio para informação essencial.

### Capítulos

Não existe playlist nativa no catálogo. Duas opções simples:

1. **Um ficheiro combinado** com a obra completa (mais simples).
2. **Uma entrada por capítulo** no catálogo, com títulos claros (`Capítulo 1 — ...`), ou uma
   página própria com vários players.

Para uma página com capítulos, use um heading por capítulo e um player por ficheiro; não
apresente uma lista como se fosse uma playlist automática.

## 7. Capas e imagens

O cartão atual não tem campo de capa. Para uma apresentação visual:

- crie um artigo normal com `image`/`imageAlt` e ligue ao áudio; ou
- faça uma alteração deliberada ao template/JSON para suportar `coverImage` (não implementado).

Não invente uma capa em falta nem use uma imagem sem direitos.

## 8. Tamanho, GitHub e alternativas

Limites práticos atuais:

- GitHub bloqueia ficheiros acima de **100 MB** e avisa a partir de **50 MB**.
- GitHub Pages tem um limite de **1 GB** por site publicado.
- Áudio binário aumenta permanentemente o histórico do repositório.

Para narrações longas:

- comprima para MP3/M4A adequado a voz;
- divida em capítulos de tamanho razoável;
- use GitHub Releases para ficheiros grandes e ligue ao URL da release;
- considere um host de áudio/R2 com suporte a streaming.

**Atenção:** o catálogo/validador atuais esperam caminhos locais. Para URLs externos é preciso
alterar o template, o catálogo e a validação, e confirmar licença, disponibilidade e privacidade.
Não use URLs temporários.

## 9. Remover ou substituir

1. Remova/atualize a entrada no JSON.
2. Procure links para o ficheiro em artigos e páginas.
3. Apague/substitua o áudio num commit.
4. Corra `npm run build && npm run validate`.

Substituir um ficheiro no mesmo caminho mantém o URL, mas pode deixar caches antigas; prefira um
nome novo e atualize o catálogo quando a alteração for relevante.

## 10. Checklist

- [ ] Áudio revisto, com volume e silêncios tratados.
- [ ] Licença e créditos corretos.
- [ ] Formato/nome adequados; ficheiros em `public/resources/audiobooks/`.
- [ ] Entrada com `id` único, duração e narrador reais.
- [ ] `streamUrl`/`downloadUrl` sem `/blog` e existentes.
- [ ] Placeholder honesto quando não há ficheiro.
- [ ] Transcrição/resumo disponível para conteúdo essencial.
- [ ] Player testado com teclado e leitor de ecrã, se houver player incorporado.
- [ ] `npm run build` e `npm run validate` verdes.
- [ ] Cartão e reprodução testados em produção.
