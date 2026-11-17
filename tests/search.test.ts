import { describe, it, expect } from 'vitest';
import { searchContent, highlightMatch } from '../src/utils/search';

describe('search utilities', () => {
  const articles = [
    { id: '1', title: 'Inteligência Artificial', description: 'Introdução à IA', url: '/ia' },
    { id: '2', title: 'LLMs Explicados', description: 'Grandes Modelos de Linguagem', url: '/llm' },
    { id: '3', title: 'Arquitetura Transformer', description: 'Self-attention e camadas', url: '/transformer' },
  ];

  describe('searchContent', () => {
    it('should return all articles for empty query', () => {
      const result = searchContent(articles, '');
      expect(result).toHaveLength(0);
    });

    it('should find articles by title', () => {
      const result = searchContent(articles, 'Inteligência');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should find articles by description', () => {
      const result = searchContent(articles, 'Modelos');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should be case-insensitive', () => {
      const result = searchContent(articles, 'inteligência');
      expect(result).toHaveLength(1);
    });

    it('should return empty array for no matches', () => {
      const result = searchContent(articles, 'xyz');
      expect(result).toHaveLength(0);
    });
  });

  describe('highlightMatch', () => {
    it('should highlight matches in text', () => {
      const result = highlightMatch('Inteligência Artificial', 'Inteligência');
      expect(result).toContain('<mark>');
      expect(result).toContain('</mark>');
    });

    it('should return original text for empty query', () => {
      const result = highlightMatch('Hello World', '');
      expect(result).toBe('Hello World');
    });
  });
});