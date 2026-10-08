import { test, expect } from 'vitest';
import { transliterate } from '../public/js/transliterate.js';

const DEFAULTS = { ng: true, hLenition: 'keep', pStrategy: 'pin' };
// flatten the first stem's first word to its value sequence
const values = (r) => r.stems[0].words[0].map((g) => g.value);

test('meitheal maps to the eight-letter sequence', () => {
  const r = transliterate('meitheal', DEFAULTS);
  expect(values(r)).toEqual(['m', 'e', 'i', 't', 'h', 'e', 'a', 'l']);
  const names = r.stems[0].words[0].map((g) => g.name);
  expect(names).toEqual(['Muin', 'Eadhadh', 'Iodhadh', 'Tinne', 'Úath', 'Eadhadh', 'Ailm', 'Luis']);
});

test('the h in meitheal is flagged convention and lenition, and a note is raised', () => {
  const r = transliterate('meitheal', DEFAULTS);
  const h = r.stems[0].words[0][4];
  expect(h.value).toBe('h');
  expect(h.flags).toContain('convention');
  expect(h.flags).toContain('lenition');
  expect(r.notes).toContain('lenition');
});
