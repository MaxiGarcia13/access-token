import { describe, expect, it } from 'vitest';
import { safeEqual } from '../src/safe-equal.js';

describe('safeEqual', () => {
  it('returns true for identical strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
  });

  it('returns false for different strings of the same length', () => {
    expect(safeEqual('abc', 'abd')).toBe(false);
  });

  it('returns false for strings of different lengths', () => {
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });

  it('returns true for empty strings', () => {
    expect(safeEqual('', '')).toBe(true);
  });
});
