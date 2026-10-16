import { test, expect } from 'vitest';
import { oghamSVG } from '../public/embed/src/api.js';

test('renders a latin word to a valid svg with finite dimensions', () => {
  const out = oghamSVG('meitheal');
  expect(out.svg).toContain('<svg');
  expect(out.svg).toContain('role="img"');
  expect(Number.isFinite(out.widthMm)).toBe(true);
  expect(Number.isFinite(out.heightMm)).toBe(true);
  expect(out.heightMm).toBeGreaterThan(0);
});

test('renders ogham unicode input in unicode mode', () => {
  const out = oghamSVG('ᚁᚐ', { mode: 'unicode' }); // Beith, Ailm
  expect(out.svg).toContain('<svg');
  expect(out.heightMm).toBeGreaterThan(0);
});

test('orientation and colourway options are reflected', () => {
  const v = oghamSVG('meitheal', { orientation: 'vertical' });
  const h = oghamSVG('meitheal', { orientation: 'horizontal' });
  expect(h.widthMm).toBeGreaterThan(v.widthMm);
  const bronze = oghamSVG('meitheal', { colourway: 'bronze' });
  expect(bronze.svg).toContain('#c9a24a');
});

test('omitted options use the carved default', () => {
  expect(oghamSVG('meitheal').svg).toContain('stroke="#000000"');
});

test('an unknown colourway falls back without throwing', () => {
  expect(oghamSVG('meitheal', { colourway: 'plaid' }).svg).toContain('<svg');
});

test('empty text renders a valid, finite svg', () => {
  const out = oghamSVG('');
  expect(out.svg).toContain('<svg');
  expect(Number.isFinite(out.widthMm)).toBe(true);
  expect(out.svg).not.toContain('Infinity');
});
