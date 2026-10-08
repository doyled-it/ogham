import { test, expect } from 'vitest';
import { COLOURWAYS, DEFAULT_COLOURWAY, getColourway } from '../public/js/colourways.js';

test('there are eight colourways and carved is the default', () => {
  expect(COLOURWAYS).toHaveLength(8);
  expect(DEFAULT_COLOURWAY).toBe('carved');
  expect(getColourway('carved').ink).toBe('#000000');
});

test('every colourway has id, label, ink and a provenance note', () => {
  for (const c of COLOURWAYS) {
    expect(c.id).toBeTruthy();
    expect(c.label).toBeTruthy();
    expect(c.ink).toMatch(/^#[0-9a-f]{6}$/i);
    expect(c.provenance.length).toBeGreaterThan(10);
  }
});

test('unknown id falls back to carved', () => {
  expect(getColourway('nope').id).toBe('carved');
});
