import { test, expect } from 'vitest';
import { DEFAULTS, encode, decode } from '../public/js/state.js';

test('decode of empty query gives the defaults', () => {
  expect(decode('')).toEqual(DEFAULTS);
});

test('encode then decode round-trips a settings object', () => {
  const s = { t: 'meitheal', o: 'h', w: 'per-word', f: 'both', ng: false, h: 'drop', p: 'ceirt', c: 'bronze', s: 8, wt: 'heavy', bg: 'white', tr: 'monumental' };
  expect(decode(encode(s))).toEqual(s);
});

test('tradition defaults to manuscript and old links without tr still decode', () => {
  expect(decode('').tr).toBe('manuscript');
  expect(decode('o=h&c=bronze').tr).toBe('manuscript');
});

test('an invalid tr falls back to the default', () => {
  expect(decode('tr=carved').tr).toBe('manuscript');
});

test('encode omits values equal to the default to keep urls short', () => {
  const q = encode({ ...DEFAULTS, t: 'meitheal' });
  expect(q).toContain('t=meitheal');
  expect(q).not.toContain('o=');
  expect(q).not.toContain('wt=');
});

test('invalid values fall back to the default', () => {
  const s = decode('o=diagonal&c=plaid&s=abc');
  expect(s.o).toBe(DEFAULTS.o);
  expect(s.c).toBe('plaid'); // colourway id kept raw; getColourway maps unknown ids to carved downstream
  expect(s.s).toBe(DEFAULTS.s);
});
