import { test, expect } from 'vitest';
import { PALETTE } from '../public/js/palette.js';

test('the palette has the aicmi, forfeda, marks and proposed groups', () => {
  const titles = PALETTE.map((g) => g.title);
  expect(titles).toContain('Aicme Beithe');
  expect(titles).toContain('Forfeda');
  expect(titles).toContain('Marks');
  expect(titles.some((t) => /proposed/i.test(t))).toBe(true);
});

test('every palette entry inserts a non-empty string and has a label', () => {
  for (const group of PALETTE) {
    for (const item of group.items) {
      expect(typeof item.insert).toBe('string');
      expect(item.insert.length).toBeGreaterThan(0);
      expect(typeof item.label).toBe('string');
    }
  }
});

test('the double R entry inserts the joiner sequence', () => {
  const all = PALETTE.flatMap((g) => g.items);
  const dr = all.find((i) => i.label === 'Double R');
  expect(dr.insert).toBe('ᚏ‍ᚏ');
});
