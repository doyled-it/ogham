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

test('empty input renders a valid finite-size svg, not Infinity', () => {
  const empty = layout(
    transliterate('', { ng: true, hLenition: 'keep', pStrategy: 'pin' }),
    { orientation: 'vertical', wordSep: 'gap', feather: 'start', strokeWeight: 'regular' },
  );
  const { svg, widthMm, heightMm } = renderSVG(empty, { colourway: getColourway('carved'), spacingMm: 5 });
  expect(Number.isFinite(widthMm)).toBe(true);
  expect(Number.isFinite(heightMm)).toBe(true);
  expect(svg).not.toContain('Infinity');
});

test('a poly primitive renders as a polyline', () => {
  const geom = {
    bounds: { minX: 0, minY: 0, maxX: 20, maxY: 20 },
    primitives: [{ kind: 'poly', points: [[0, 0], [10, 10], [20, 0]], width: 4 }],
  };
  const { svg } = renderSVG(geom, { colourway: getColourway('carved'), spacingMm: 5 });
  expect(svg).toContain('<polyline points="0,0 10,10 20,0"');
});
