import { describe, it, expect } from 'vitest';
import { isValidStellarAddress, formatXLM } from '../utils/stellar';

describe('Stellar utils', () => {
  describe('isValidStellarAddress', () => {
    it('returns true for a valid G... address', () => {
      // Valid Stellar public key with correct CRC
      expect(isValidStellarAddress('GBBVAN7YTES4NTF5EC2ULSNTVVAZCHZCPX7UI3X7UXYZLH6ZSY4JPDAW')).toBe(true);
    });
    it('returns true for another valid Stellar SDK address', () => {
      expect(isValidStellarAddress('GCMV5MHJ6T4YOC735L4IP5S55VUZY6BD3M7ZCKWHVJUR2GZNREC43TFZ')).toBe(true);
    });
    it('returns false for an invalid string', () => {
      expect(isValidStellarAddress('not-stellar')).toBe(false);
    });
    it('returns false for an empty string', () => {
      expect(isValidStellarAddress('')).toBe(false);
    });
    it('returns false for an ethereum address', () => {
      expect(isValidStellarAddress('0x4b78...')).toBe(false);
    });
  });

  describe('formatXLM', () => {
    it("formats '100.0000000' to '100.00 XLM'", () => {
      expect(formatXLM('100.0000000')).toBe('100.00 XLM');
    });
    it('formats whole numbers', () => {
      expect(formatXLM('50')).toBe('50.00 XLM');
    });
    it('formats 0', () => {
      expect(formatXLM('0')).toBe('0.00 XLM');
    });
  });
});
