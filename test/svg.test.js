import { test, expect } from 'vitest';
import { transliterate } from '../public/js/transliterate.js';
import { layout } from '../public/js/geometry.js';
import { renderSVG } from '../public/js/svg.js';
import { getColourway } from '../public/js/colourways.js';

const geom = layout(
  transliterate('meitheal', { ng: true, hLenition: 'keep', pStrategy: 'pin' }),
  { orientation: 'vertical', wordSep: 'gap', feather: 'start', strokeWeight: 'regular' },
);

test('meitheal exports at roughly 17.2 cm tall at 5 mm spacing', () => {
  const { heightMm, widthMm } = renderSVG(geom, { colourway: getColourway('carved'), spacingMm: 5 });
  expect(heightMm).toBeGreaterThan(168);
  expect(heightMm).toBeLessThan(180);
  expect(widthMm).toBeGreaterThan(30);
  expect(widthMm).toBeLessThan(42);
});

test('height scales linearly with spacing', () => {
  const a = renderSVG(geom, { colourway: getColourway('carved'), spacingMm: 5 }).heightMm;
  const b = renderSVG(geom, { colourway: getColourway('carved'), spacingMm: 10 }).heightMm;
  expect(b / a).toBeCloseTo(2, 5);
});

test('the svg carries the ink colour and mm dimensions', () => {
  const { svg } = renderSVG(geom, { colourway: getColourway('bronze'), spacingMm: 5 });
  expect(svg).toContain('stroke="#c9a24a"');
  expect(svg).toMatch(/width="[\d.]+mm"/);
  expect(svg).toContain('viewBox=');
  expect(svg).toContain('role="img"');
});

test('a white background adds a rect, transparent does not', () => {
  const white = renderSVG(geom, { colourway: getColourway('carved'), spacingMm: 5, background: 'white' });
  const clear = renderSVG(geom, { colourway: getColourway('carved'), spacingMm: 5, background: 'transparent' });
  expect(white.svg).toContain('<rect');
  expect(clear.svg).not.toContain('<rect');
});
