import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mainJs = readFileSync(join(root, 'src', 'scripts', 'main.js'), 'utf8');

function makeDom(html) {
  const dom = new JSDOM(html, {
    url: 'https://localhost/blog/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  dom.window.fetch = () => Promise.reject(new Error('offline'));
  dom.window.eval(mainJs);
  return dom;
}

const page = (theme = 'dark') => `
<!doctype html>
<html lang="pt-PT" data-theme="${theme}">
<body>
  <button id="theme-toggle" aria-label="Alternar tema">Tema</button>
  <button id="nav-toggle" aria-label="Abrir menu" aria-expanded="false">Menu</button>
  <nav id="main-nav"><a href="/blog/">Início</a></nav>
  <section>
    <div data-collection-filter>
      <input data-filter-search />
      <select data-filter-category>
        <option value="">Todos</option>
        <option value="tutorial">Tutoriais</option>
      </select>
    </div>
    <div data-filter-grid>
      <article class="card" data-category="tutorial" data-search="inteligência artificial">A</article>
      <article class="card" data-category="documentacao" data-search="guia gptclone">B</article>
    </div>
    <p data-filter-empty hidden>Nenhum resultado.</p>
  </section>
</body>
</html>`;

describe('client script (main.js) behaviour', () => {
  let dom;

  afterEach(() => {
    if (dom) dom.window.close();
    dom = undefined;
  });

  it('toggles the theme on click and persists the choice', () => {
    dom = makeDom(page('dark'));
    const doc = dom.window.document;
    doc.getElementById('theme-toggle').click();
    expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
    expect(dom.window.localStorage.getItem('gptclone-theme')).toBe('light');
    doc.getElementById('theme-toggle').click();
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles the mobile navigation', () => {
    dom = makeDom(page());
    const doc = dom.window.document;
    const toggle = doc.getElementById('nav-toggle');
    const nav = doc.getElementById('main-nav');
    toggle.click();
    expect(nav.classList.contains('is-open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    expect(nav.classList.contains('is-open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('filters cards by search query and category', () => {
    dom = makeDom(page());
    const doc = dom.window.document;
    const cards = [...doc.querySelectorAll('[data-filter-grid] .card')];
    const byHidden = () => cards.map((c) => c.hidden);

    // search matches first card only
    const search = doc.querySelector('[data-filter-search]');
    search.value = 'inteligência';
    search.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    expect(byHidden()).toEqual([false, true]);
    expect(doc.querySelector('[data-filter-empty]').hidden).toBe(true);

    // clear -> category filter selects first card
    search.value = '';
    search.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    const select = doc.querySelector('[data-filter-category]');
    select.value = 'tutorial';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    expect(byHidden()).toEqual([false, true]);

    // no matches -> empty state visible
    search.value = 'zzz';
    search.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    expect(doc.querySelector('[data-filter-empty]').hidden).toBe(false);
  });
});
