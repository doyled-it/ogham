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

test('lenition h can be dropped', () => {
  const r = transliterate('meitheal', { ng: true, hLenition: 'drop', pStrategy: 'pin' });
  expect(r.stems[0].words[0].map((g) => g.value)).toEqual(['m', 'e', 'i', 't', 'e', 'a', 'l']);
});

test('Sláinte strips the fada', () => {
  const r = transliterate('Sláinte', { ng: true, hLenition: 'keep', pStrategy: 'pin' });
  expect(r.stems[0].words[0].map((g) => g.value)).toEqual(['s', 'l', 'a', 'i', 'n', 't', 'e']);
});

test('teanga: ng on gives five letters, off gives six', () => {
  const on = transliterate('teanga', { ng: true, hLenition: 'keep', pStrategy: 'pin' });
  expect(on.stems[0].words[0].map((g) => g.value)).toEqual(['t', 'e', 'a', 'ng', 'a']);
  const off = transliterate('teanga', { ng: false, hLenition: 'keep', pStrategy: 'pin' });
  expect(off.stems[0].words[0].map((g) => g.value)).toEqual(['t', 'e', 'a', 'n', 'g', 'a']);
});

test('ollamh: drop gives o l l a m, keep gives o l l a m h', () => {
  const drop = transliterate('ollamh', { ng: true, hLenition: 'drop', pStrategy: 'pin' });
  expect(drop.stems[0].words[0].map((g) => g.value)).toEqual(['o', 'l', 'l', 'a', 'm']);
  const keep = transliterate('ollamh', { ng: true, hLenition: 'keep', pStrategy: 'pin' });
  expect(keep.stems[0].words[0].map((g) => g.value)).toEqual(['o', 'l', 'l', 'a', 'm', 'h']);
});

test('Kerry maps k and y by convention, flagged', () => {
  const r = transliterate('Kerry', { ng: true, hLenition: 'keep', pStrategy: 'pin' });
  const w = r.stems[0].words[0];
  expect(w.map((g) => g.value)).toEqual(['c', 'e', 'r', 'r', 'i']);
  expect(w[0].flags).toContain('convention');
  expect(w[4].flags).toContain('convention');
});

test('Pádraig draws p as Pín by default, flagged', () => {
  const r = transliterate('Pádraig', { ng: true, hLenition: 'keep', pStrategy: 'pin' });
  const w = r.stems[0].words[0];
  expect(w.map((g) => g.value)).toEqual(['p', 'a', 'd', 'r', 'a', 'i', 'g']);
  expect(w[0].name).toBe('Pín');
  expect(w[0].variant).toBe('pin');
  expect(w[0].flags).toContain('convention');
});

test('Pádraig with p strategy ceirt gives q a d r a i g', () => {
  const r = transliterate('Pádraig', { ng: true, hLenition: 'keep', pStrategy: 'ceirt' });
  const w = r.stems[0].words[0];
  expect(w.map((g) => g.value)).toEqual(['q', 'a', 'd', 'r', 'a', 'i', 'g']);
  expect(w[0].source).toBe('p');
});

test('qu collapses onto a single Ceirt, flagged', () => {
  const r = transliterate('quiz', { ng: true, hLenition: 'keep', pStrategy: 'pin' });
  const w = r.stems[0].words[0];
  expect(w.map((g) => g.value)).toEqual(['q', 'i', 'z']);
  expect(w[0].source).toBe('qu');
  expect(w[0].flags).toContain('convention');
});

test('two words become one stem with two words', () => {
  const r = transliterate('two words', { ng: true, hLenition: 'keep', pStrategy: 'pin' });
  expect(r.stems).toHaveLength(1);
  expect(r.stems[0].words).toHaveLength(2);
  expect(r.stems[0].words[0].map((g) => g.value)).toEqual(['t', 'f', 'o']);
});

test('a newline starts a new stem', () => {
  const r = transliterate('a\nb', { ng: true, hLenition: 'keep', pStrategy: 'pin' });
  expect(r.stems).toHaveLength(2);
});

test('digits and punctuation are dropped and reported', () => {
  const r = transliterate('a1b!', { ng: true, hLenition: 'keep', pStrategy: 'pin' });
  expect(r.stems[0].words[0].map((g) => g.value)).toEqual(['a', 'b']);
  expect(r.ignored).toEqual([
    { char: '1', reason: 'digit' },
    { char: '!', reason: 'punctuation' },
  ]);
});
