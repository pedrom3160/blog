import { describe, it, expect } from 'vitest';
import { searchContent, highlightMatch } from '../src/utils/search.js';

describe('search utilities', () => {
  const articles = [
    { id: '1', title: 'Inteligência Artificial', description: 'Introdução à IA', url: '/ia' },
    { id: '2', title: 'LLMs Explicados', description: 'Grandes Modelos de Linguagem', url: '/llm' },
    { id: '3', title: 'Arquitetura Transformer', description: 'Self-attention e camadas', url: '/transformer' },
  ];

  describe('searchContent', () => {
    it('returns no results for an empty query', () => {
      expect(searchContent(articles, '')).toHaveLength(0);
    });

    it('finds articles by title', () => {
      const result = searchContent(articles, 'Inteligência');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('finds articles by description', () => {
      const result = searchContent(articles, 'Modelos');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('is case-insensitive', () => {
      expect(searchContent(articles, 'inteligência')).toHaveLength(1);
    });

    it('returns an empty array for no matches', () => {
      expect(searchContent(articles, 'xyz')).toHaveLength(0);
    });
  });

  describe('highlightMatch', () => {
    it('highlights matches in text', () => {
      const result = highlightMatch('Inteligência Artificial', 'Inteligência');
      expect(result).toContain('<mark>');
      expect(result).toContain('</mark>');
    });

    it('returns the original text for an empty query', () => {
      expect(highlightMatch('Hello World', '')).toBe('Hello World');
    });

    it('escapes regex metacharacters in the query', () => {
      expect(highlightMatch('Hello (World)', '(World)')).toBe('Hello <mark>(World)</mark>');
    });
  });
});
