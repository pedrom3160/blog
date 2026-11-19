import { describe, it, expect } from 'vitest';
import suggestions from '../src/_data/suggestions.js';
import {
  validateSuggestion,
  buildIssueUrl,
  formatSuggestionText,
  buildWeb3FormsPayload,
  web3formsSucceeded,
} from '../src/scripts/suggestions.js';

const valid = {
  repo: 'pedrom3160/blog',
  category: 'ideas',
  title: 'Adicionar um índice de artigos por tema',
  description: 'Uma página que agrupe artigos por tema ajudaria a encontrar conteúdo relacionado sem passar pela pesquisa.',
  name: 'Leitora',
  email: '',
};

describe('suggestions configuration', () => {
  it('publishes exactly five suggestion categories', () => {
    expect(suggestions.categories).toHaveLength(5);
  });

  it('uses unique ids and labels', () => {
    const ids = suggestions.categories.map((category) => category.id);
    const titles = suggestions.categories.map((category) => category.title);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(titles).size).toBe(titles.length);
    expect(ids).toContain('naming');
  });

  it('gives every category a title and a description', () => {
    for (const category of suggestions.categories) {
      expect(category.id).toMatch(/^[a-z]+$/);
      expect(category.title.length).toBeGreaterThan(2);
      expect(category.description.length).toBeGreaterThan(20);
    }
  });

  it('selects one coherent submission mode', () => {
    const { submission } = suggestions;
    expect(['github', 'web3forms', 'endpoint']).toContain(submission.mode);
    if (submission.mode === 'github') {
      expect(submission.endpoint).toBe('');
      expect(submission.accessKey).toBe('');
    } else {
      expect(submission.endpoint).toMatch(/^https:\/\//);
      expect(submission.provider.length).toBeGreaterThan(0);
      if (submission.mode === 'web3forms') expect(submission.accessKey.length).toBeGreaterThan(0);
    }
  });

  it('points at the existing public repository', () => {
    expect(suggestions.repo).toBe('pedrom3160/blog');
    expect(suggestions.lastReviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('suggestion validation', () => {
  it('accepts a complete suggestion', () => {
    expect(validateSuggestion(valid)).toEqual({});
  });

  it('requires a category, a title and a description', () => {
    const errors = validateSuggestion({ category: '', title: '', description: '' });
    expect(errors.category).toBeTruthy();
    expect(errors.title).toBeTruthy();
    expect(errors.description).toBeTruthy();
  });

  it('rejects titles and descriptions outside the accepted lengths', () => {
    expect(validateSuggestion({ ...valid, title: 'Curto' }).title).toBeTruthy();
    expect(validateSuggestion({ ...valid, title: 'x'.repeat(121) }).title).toBeTruthy();
    expect(validateSuggestion({ ...valid, description: 'Muito curto' }).description).toBeTruthy();
    expect(validateSuggestion({ ...valid, description: 'x'.repeat(2001) }).description).toBeTruthy();
    expect(validateSuggestion({ ...valid, name: 'x'.repeat(81) }).name).toBeTruthy();
  });

  it('treats email as optional but validates it when present', () => {
    expect(validateSuggestion(valid).email).toBeUndefined();
    expect(validateSuggestion({ ...valid, email: 'sem-arroba' }).email).toBeTruthy();
    expect(validateSuggestion({ ...valid, email: 'leitora@example.com' }).email).toBeUndefined();
  });
});

describe('GitHub issue handoff', () => {
  it('builds a prefilled issue URL for the project repository', () => {
    const url = buildIssueUrl({ ...valid, category: 'Ideias & Funcionalidades' });
    expect(url.startsWith('https://github.com/pedrom3160/blog/issues/new?')).toBe(true);
    const params = new URL(url).searchParams;
    expect(params.get('title')).toBe('[Sugestão] Adicionar um índice de artigos por tema');
    expect(params.get('body')).toContain('**Categoria:** Ideias & Funcionalidades');
    expect(params.get('body')).toContain(valid.description);
    expect(params.get('body')).toContain('**Sugestão de:** Leitora');
  });

  it('never includes the email in the public issue', () => {
    const url = buildIssueUrl({ ...valid, email: 'leitora@example.com' });
    expect(url).not.toContain('leitora%40example.com');
    expect(url).not.toContain('leitora@example.com');
  });

  it('rejects malformed repository names', () => {
    expect(() => buildIssueUrl({ ...valid, repo: 'not-a-repo' })).toThrow();
  });

  it('produces copyable text without markdown-only syntax', () => {
    const text = formatSuggestionText({ ...valid, category: 'Feedback' });
    expect(text).toContain('Sugestão: ' + valid.title);
    expect(text).toContain('Categoria: Feedback');
    expect(text).toContain(valid.description);
  });

  it('never includes the email in copyable text', () => {
    const text = formatSuggestionText({ ...valid, email: 'leitora@example.com' });
    expect(text).not.toContain('leitora@example.com');
  });

  it('encodes HTML-sensitive input in the issue URL', () => {
    const url = buildIssueUrl({ ...valid, title: '<script>alert(1)</script>' });
    expect(url).not.toContain('<script>');
    expect(new URL(url).searchParams.get('title')).toContain('<script>');
  });
});

describe('Web3Forms payload', () => {
  it('builds the public form payload without requiring email', () => {
    const payload = buildWeb3FormsPayload(valid, 'public-form-key', 'https://example.test/suggestions/');
    expect(payload.access_key).toBe('public-form-key');
    expect(payload.title).toBe(valid.title);
    expect(payload.message).toBe(valid.description);
    expect(payload.category).toBe('ideas');
    expect(payload.email).toBeUndefined();
    expect(payload.botcheck).toBe(false);
    expect(payload.page_url).toBe('https://example.test/suggestions/');
  });

  it('includes email only when supplied', () => {
    const payload = buildWeb3FormsPayload({ ...valid, email: 'leitora@example.com' }, 'public-form-key');
    expect(payload.email).toBe('leitora@example.com');
  });

  it('requires a public access key', () => {
    expect(() => buildWeb3FormsPayload(valid, '')).toThrow();
  });

  it('only treats an explicit success:true as successful', () => {
    expect(web3formsSucceeded({ success: true })).toBe(true);
    expect(web3formsSucceeded({ success: 'true' })).toBe(false);
    expect(web3formsSucceeded({ success: false })).toBe(false);
    expect(web3formsSucceeded(null)).toBe(false);
  });
});
