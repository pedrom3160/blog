import { describe, it, expect } from 'vitest';
import navigation from '../src/_data/navigation.js';
import donations from '../src/_data/donations.js';

describe('primary navigation contract', () => {
  it('contains exactly four destinations', () => {
    expect(navigation).toHaveLength(4);
  });

  it('exposes Blog, About, Suggestions and Donations in that order', () => {
    expect(navigation.map((item) => item.label)).toEqual(['Blog', 'About', 'Suggestions', 'Donations']);
  });

  it('points at preserved routes', () => {
    expect(navigation.map((item) => item.url)).toEqual(['/', '/about/', '/suggestions/', '/donations/']);
  });

  it('never duplicates a destination', () => {
    const urls = navigation.map((item) => item.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe('donations configuration', () => {
  it('uses a channel list that can be empty without inventing a payment link', () => {
    expect(Array.isArray(donations.channels)).toBe(true);
  });

  it('only publishes labelled https channels with a description', () => {
    for (const channel of donations.channels) {
      expect(typeof channel.label).toBe('string');
      expect(channel.label.length).toBeGreaterThan(2);
      expect(typeof channel.description).toBe('string');
      expect(channel.description.length).toBeGreaterThan(10);
      expect(channel.url).toMatch(/^https:\/\//);
    }
  });

  it('never stores card numbers, IBANs or wallet addresses', () => {
    const serialised = JSON.stringify(donations);
    expect(serialised).not.toMatch(/\b\d{16}\b/);
    expect(serialised).not.toMatch(/\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/);
    expect(serialised).not.toMatch(/0x[a-f0-9]{40}/i);
  });
});
