import { kebabize, camelize } from '../utils';

describe('utils', () => {
  describe('kebabize', () => {
    it('converts camelCase to kebab-case', () => {
      expect(kebabize('camelCase')).toBe('camel-case');
    });

    it('converts PascalCase to kebab-case', () => {
      expect(kebabize('PascalCase')).toBe('pascal-case');
    });

    it('handles multiple uppercase letters', () => {
      expect(kebabize('XMLHttpRequest')).toBe('xml-http-request');
    });

    it('handles single uppercase letter at start', () => {
      expect(kebabize('Test')).toBe('test');
    });

    it('handles already lowercase string', () => {
      expect(kebabize('lowercase')).toBe('lowercase');
    });

    it('handles empty string', () => {
      expect(kebabize('')).toBe('');
    });

    it('handles string with numbers', () => {
      expect(kebabize('test123Case')).toBe('test123-case');
    });

    it('handles consecutive uppercase letters', () => {
      expect(kebabize('HTMLParser')).toBe('html-parser');
    });
  });

  describe('camelize', () => {
    it('converts kebab-case to camelCase', () => {
      expect(camelize('kebab-case')).toBe('kebabCase');
    });

    it('handles multiple hyphens', () => {
      expect(camelize('multi-word-string')).toBe('multiWordString');
    });

    it('handles single hyphen', () => {
      expect(camelize('single-word')).toBe('singleWord');
    });

    it('handles no hyphens', () => {
      expect(camelize('noHyphens')).toBe('noHyphens');
    });

    it('handles empty string', () => {
      expect(camelize('')).toBe('');
    });

    it('handles string starting with hyphen', () => {
      expect(camelize('-test')).toBe('Test');
    });

    it('handles consecutive hyphens', () => {
      expect(camelize('test--case')).toBe('test-case');
    });
  });
});