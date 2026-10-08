import { test, expect } from 'vitest';
import { transliterate } from '../public/js/transliterate.js';
import { layout, letterStrokes } from '../public/js/geometry.js';

const OPTS = { orientation: 'vertical', wordSep: 'gap', feather: 'start', strokeWeight: 'regular' };
const tl = (s, o = {}) => transliterate(s, { ng: true, hLenition: 'keep', pStrategy: 'pin', ...o });

test('letterStrokes matches the reference conventions', () => {
  expect(letterStrokes('v', 1, 0)).toEqual([[-12, 0, 12, 0]]);
  expect(letterStrokes('h', 1, 0)).toEqual([[-30, 0, 0, 0]]);
  expect(letterStrokes('b', 1, 0)).toEqual([[0, 0, 30, 0]]);
  expect(letterStrokes('m', 1, 0)).toEqual([[-15, -11, 15, 11]]);
  expect(letterStrokes('v', 2, 0)).toEqual([[-12, 0, 12, 0], [-12, -10, 12, -10]]);
});

test('meitheal vertical produces the expected bounds and stroke count', () => {
  const g = layout(tl('meitheal'), OPTS);
  const strokes = g.primitives.filter((p) => p.kind === 'stroke');
  expect(strokes).toHaveLength(21);
  expect(g.bounds).toEqual({ minX: -30, minY: -314, maxX: 30, maxY: 30 });
});

test('a start feather mark is present at the foot', () => {
  const g = layout(tl('meitheal'), OPTS);
  const feathers = g.primitives.filter((p) => p.kind === 'feather');
  expect(feathers).toHaveLength(1);
  const f = feathers[0];
  expect(f.points[1][1]).toBeLessThan(f.points[0][1]);
});

test('a word gap adds 60 units of bare stem between words on one stem', () => {
  const near = layout(tl('a a'), { ...OPTS, wordSep: 'none' });
  const far = layout(tl('a a'), { ...OPTS, wordSep: 'gap' });
  const h = (g) => g.bounds.maxY - g.bounds.minY;
  expect(h(far) - h(near)).toBe(38);
});
