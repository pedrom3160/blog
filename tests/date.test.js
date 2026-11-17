import { describe, it, expect } from 'vitest';
import {
  getFormattedDate,
  getISODate,
  getReadingTime,
  formatRelativeDate,
} from '../src/utils/date.js';

describe('date utilities', () => {
  describe('getFormattedDate', () => {
    it('formats a date in pt-PT locale', () => {
      const result = getFormattedDate(new Date('2026-11-17'));
      expect(result).toContain('2026');
      expect(result).toContain('17');
    });

    it('handles string dates', () => {
      expect(getFormattedDate('2026-11-17')).toContain('2026');
    });
  });

  describe('getISODate', () => {
    it('returns an ISO date string', () => {
      expect(getISODate('2026-11-17')).toBe('2026-11-17');
    });
  });

  describe('getReadingTime', () => {
    it('calculates reading time for short text', () => {
      expect(getReadingTime('Hello world')).toBe('1 min');
    });

    it('calculates reading time for longer text', () => {
      expect(getReadingTime('word '.repeat(400))).toBe('2 min');
    });

    it('uses a custom WPM', () => {
      expect(getReadingTime('word '.repeat(100), 100)).toBe('1 min');
    });
  });

  describe('formatRelativeDate', () => {
    it('returns "Hoje" for today', () => {
      expect(formatRelativeDate(new Date())).toBe('Hoje');
    });

    it('returns "Ontem" for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(formatRelativeDate(yesterday)).toBe('Ontem');
    });

    it('returns days for this week', () => {
      const daysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeDate(daysAgo)).toBe('Há 3 dias');
    });
  });
});
