import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setCache, getCache, clearCache } from '../utils/cache';

describe('cache utils', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it('stores data correctly', () => {
    setCache('key', 'val', 60);
    const item = JSON.parse(localStorage.getItem('key'));
    expect(item.value).toBe('val');
    expect(item.expiry).toBeGreaterThan(Date.now());
  });

  it('returns null when expired', () => {
    localStorage.setItem('key', JSON.stringify({ value: 'val', expiry: Date.now() - 1000 }));
    expect(getCache('key')).toBeNull();
    expect(localStorage.getItem('key')).toBeNull();
  });

  it('returns value within TTL', () => {
    setCache('key', 'val', 30);
    expect(getCache('key')).toBe('val');
  });

  it('clears correctly', () => {
    setCache('key', 'val', 60);
    clearCache('key');
    expect(localStorage.getItem('key')).toBeNull();
  });
});
