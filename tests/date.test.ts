import { describe, it, expect } from 'vitest';
import { getFormattedDate, getISODate, getReadingTime, formatRelativeDate } from '../src/utils/date';

describe('date utilities', () => {
  describe('getFormattedDate', () => {
    it('should format a date in pt-PT locale', () => {
      const date = new Date('2026-11-17');
      const result = getFormattedDate(date);
      expect(result).toContain('2026');
      expect(result).toContain('17');
    });

    it('should handle string dates', () => {
      const result = getFormattedDate('2026-11-17');
      expect(result).toContain('2026');
    });
  });

  describe('getISODate', () => {
    it('should return ISO date string', () => {
      const result = getISODate('2026-11-17');
      expect(result).toBe('2026-11-17');
    });
  });

  describe('getReadingTime', () => {
    it('should calculate reading time for short text', () => {
      const text = 'Hello world';
      const result = getReadingTime(text);
      expect(result).toBe('1 min');
    });

    it('should calculate reading time for longer text', () => {
      const text = 'word '.repeat(400); // 400 words
      const result = getReadingTime(text);
      expect(result).toBe('2 min');
    });

    it('should use custom WPM', () => {
      const text = 'word '.repeat(100);
      const result = getReadingTime(text, 100);
      expect(result).toBe('1 min');
    });
  });

  describe('formatRelativeDate', () => {
    it('should return "Hoje" for today', () => {
      const result = formatRelativeDate(new Date());
      expect(result).toBe('Hoje');
    });

    it('should return "Ontem" for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = formatRelativeDate(yesterday);
      expect(result).toBe('Ontem');
    });
  });
});