// Generates sample PDF files (clearly marked as samples) and a demo WAV tone
// referenced by the PDF and audiobook catalogs. Run: node scripts/generate-samples.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const PDFS = [
  {
    file: 'sample-gptclone-guide.pdf',
    title: 'Guia de Introdução ao GPTCLONE — GPTCLONE Sample',
    pages: 12,
    body: [
      'Grandes Modelos de Linguagem (LLMs) sao sistemas de inteligencia artificial treinados em grandes volumes de texto para prever a proxima palavra de uma sequencia.',
      'Neste documento de exemplo percorremos os conceitos fundamentais: tokenizacao, embeddings, self-attention e o ciclo de treino.',
      'Cada capitulo inclui um resumo e perguntas de revisao pensadas para estudo autonomo.',
    ],
  },
  {
    file: 'sample-transformer-notes.pdf',
    title: 'Notas de Arquitetura Transformer — GPTCLONE Sample',
    pages: 8,
    body: [
      'O Transformer substitui a recorrencia por mecanismos de atencao que processam toda a sequencia em paralelo.',
      'Este exemplo cobre encoder, decoder, multi-head attention, posicional encoding e normalizacao.',
      'Os diagramas descritivos servem como apoio ao artigo publicado no blog.',
    ],
  },
  {
    file: 'sample-bpe-tutorial.pdf',
    title: 'Tutorial de Tokenização BPE — GPTCLONE Sample',
    pages: 15,
    body: [
      'Byte-Pair Encoding (BPE) e um algoritmo de compressao adaptado que aprende um vocabulario de sub-palavras a partir de um corpus.',
      'Este documento de exemplo mostra o passo a passo do algoritmo com exemplos numericos simples.',
      'Inclui exercicios praticos para comparar vocabularios de tamanhos diferentes.',
    ],
  },
];

function escapePdf(text) {
  return text
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
    // Strip non-ASCII (accents) — minimal PDF generator uses WinAnsi-safe text only.
    .replace(/[^\x20-\x7E]/g, '');
}

// Minimal, dependency-free PDF writer: Helvetica text, one paragraph per page.
function buildPdf(title, body, pageCount) {
  const objects = [];
  const kids = [];
  for (let i = 0; i < pageCount; i++) {
    const pageObj = pageCount + 1 + i * 2;
    const contentObj = pageObj + 1;
    kids.push(`${pageObj} 0 R`);
    const lines = [];
    if (i === 0) {
      lines.push('BT /F2 22 Tf 72 720 Td (' + escapePdf(title) + ') Tj ET');
      lines.push('BT /F1 11 Tf 72 690 Td (GPTCLONE Blog - documento de exemplo (sample). Licenca: CC-BY-4.0.) Tj ET');
      lines.push('BT /F1 11 Tf 72 668 Td (Este PDF foi gerado automaticamente para demonstrar a Biblioteca PDF.) Tj ET');
      lines.push('BT /F1 11 Tf 72 646 Td (Nao e uma publicacao academica real. Confira as fontes antes de citar.) Tj ET');
      lines.push('BT /F2 14 Tf 72 600 Td (Indice do conteudo:) Tj ET');
      body.forEach((p, j) => {
        lines.push('BT /F1 10 Tf 84 ' + (580 - j * 24) + ' Td (' + escapePdf(p.slice(0, 90)) + ') Tj ET');
      });
    } else {
      const p = body[(i - 1) % body.length];
      lines.push('BT /F2 16 Tf 72 740 Td (Pagina ' + (i + 1) + ' de ' + pageCount + ') Tj ET');
      lines.push('BT /F1 11 Tf 72 700 Td (' + escapePdf(p.slice(0, 95)) + ') Tj ET');
      lines.push('BT /F1 11 Tf 72 680 Td (' + escapePdf(p.slice(95, 190)) + ') Tj ET');
      lines.push('BT /F1 9 Tf 72 80 Td (GPTCLONE Blog sample - CC-BY-4.0 - pedrom3160.github.io/blog) Tj ET');
    }
    const stream = lines.join('\n');
    objects[pageObj] = `<< /Type /Page /Parent ${2} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${3} 0 R /F2 ${4} 0 R >> >> /Contents ${contentObj} 0 R >>`;
    objects[contentObj] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }
  const catalogObj = 1;
  const pagesObj = 2;
  objects[catalogObj] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
  objects[pagesObj] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pageCount} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';

  let out = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 1; i < objects.length; i++) {
    if (!objects[i]) continue;
    offsets[i] = out.length;
    out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefPos = out.length;
  const max = objects.length;
  out += `xref\n0 ${max}\n0000000000 65535 f \n`;
  for (let i = 1; i < max; i++) {
    out += (offsets[i] || 0).toString().padStart(10, '0') + ' 00000 n \n';
  }
  out += `trailer\n<< /Size ${max} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}

function buildWav(seconds = 2, sampleRate = 8000, freq = 440) {
  const samples = seconds * sampleRate;
  const dataSize = samples;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate, 28);
  buffer.writeUInt16LE(1, 32);
  buffer.writeUInt16LE(8, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples; i++) {
    const fade = Math.min(1, (samples - i) / (sampleRate * 0.2), i / (sampleRate * 0.02) || 1);
    const v = Math.sin((2 * Math.PI * freq * i) / sampleRate) * fade;
    buffer.writeUInt8(Math.round(128 + v * 100), 44 + i);
  }
  return buffer;
}

const pdfDir = join(root, 'public', 'resources', 'pdfs');
const audioDir = join(root, 'public', 'resources', 'audiobooks');
mkdirSync(pdfDir, { recursive: true });
mkdirSync(audioDir, { recursive: true });

for (const spec of PDFS) {
  writeFileSync(join(pdfDir, spec.file), buildPdf(spec.title, spec.body, spec.pages));
  console.log('PDF  ->', join('public', 'resources', 'pdfs', spec.file), `(${spec.pages} pages)`);
}

writeFileSync(join(audioDir, 'sample-tone.wav'), buildWav());
console.log('WAV  ->', join('public', 'resources', 'audiobooks', 'sample-tone.wav'), '(2s tone, demo only)');
