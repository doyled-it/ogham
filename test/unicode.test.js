import { test, expect } from 'vitest';
import { parseOgham } from '../public/js/unicode.js';

const vals = (r) => r.stems[0].words[0].map((g) => g.value);
const names = (r) => r.stems[0].words[0].map((g) => g.name);

test('base letters map by codepoint', () => {
  // U+1681 BEITH, U+1690 AILM
  const r = parseOgham('ᚁᚐ', {});
  expect(vals(r)).toEqual(['b', 'a']);
  expect(names(r)).toEqual(['Beith', 'Ailm']);
});

test('forfeda map by codepoint', () => {
  const r = parseOgham('ᚕᚚ', {}); // Eabhadh, Peith
  expect(names(r)).toEqual(['Éabhadh', 'Peith']);
});

test('a variation selector picks a variant and flags it proposed', () => {
  const r = parseOgham('ᚐ︁', {}); // Ailm + VS2 = Angled Ailm
  const g = r.stems[0].words[0][0];
  expect(g.name).toBe('Angled Ailm');
  expect(g.group).toBe('angled');
  expect(g.strokes).toBe(1);
  expect(g.flags).toContain('proposed');
});

test('FE00 yields the standard glyph, not a variant', () => {
  const r = parseOgham('ᚐ︀', {});
  expect(r.stems[0].words[0][0].name).toBe('Ailm');
  expect(r.stems[0].words[0][0].flags).not.toContain('proposed');
});

test('a stray or inapplicable selector is set aside with a note', () => {
  const r = parseOgham('ᚁ︁', {}); // Beith has no FE01 variant
  expect(r.stems[0].words[0][0].name).toBe('Beith');
  expect(r.notes).toContain('selector-ignored');
});

test('ZWJ between two Ruis makes the double R', () => {
  const r = parseOgham('ᚏ‍ᚏ', {});
  const g = r.stems[0].words[0][0];
  expect(g.group).toBe('double-r');
  expect(g.flags).toContain('proposed');
  expect(r.stems[0].words[0]).toHaveLength(1);
});

test('a stray ZWJ is set aside', () => {
  const r = parseOgham('ᚁ‍', {});
  expect(r.ignored.some((i) => i.reason === 'joiner')).toBe(true);
});

test('the space mark and a normal space both split words', () => {
  const r = parseOgham('ᚁ ᚐ ᚅ', {});
  expect(r.stems[0].words).toHaveLength(3);
});

test('a newline starts a new stem', () => {
  const r = parseOgham('ᚁ\nᚐ', {});
  expect(r.stems).toHaveLength(2);
});

test('feather marks are set aside with a note', () => {
  const r = parseOgham('᚛ᚁ', {});
  expect(r.notes).toContain('feather-input');
  expect(vals(r)).toEqual(['b']);
});

test('unknown characters are reported', () => {
  const r = parseOgham('ᚁx', {});
  expect(r.ignored.some((i) => i.char === 'x')).toBe(true);
});

test('diagonal Iodhadh reuses Ruis geometry but keeps a distinct name and flag', () => {
  const r = parseOgham(String.fromCodePoint(0x1694, 0xfe02), {}); // Iodhadh + VS3
  const g = r.stems[0].words[0][0];
  expect(g.name).toBe('Diagonal Iodhadh');
  expect(g.group).toBe('m'); // the same geometry key as Ruis
  expect(g.strokes).toBe(5);
  expect(g.flags).toContain('proposed');
});
