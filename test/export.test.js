import { test, expect } from 'vitest';
import { buildFilename } from '../public/js/export.js';

test('filename carries the first word, size and dpi', () => {
  expect(buildFilename('meitheal', 17.6, 300)).toBe('meitheal-ogham-17.6cm-300dpi.png');
});

test('multi-word uses the first word, lowercased and stripped', () => {
  expect(buildFilename('Two Words!', 10, 150)).toBe('two-ogham-10.0cm-150dpi.png');
});

test('empty text falls back to ogham', () => {
  expect(buildFilename('   ', 5, 600, 'svg')).toBe('ogham-ogham-5.0cm-600dpi.svg');
});
