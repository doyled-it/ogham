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

test('Pín renders four strokes (a double X) and is one letter wide', () => {
  const g = layout(tl('p'), { ...OPTS, feather: 'none' });
  const strokes = g.primitives.filter((p) => p.kind === 'stroke');
  expect(strokes).toHaveLength(4);
  for (const s of strokes) {
    expect(Math.abs(s.x1)).toBeLessThanOrEqual(12);
    expect(Math.abs(s.x2)).toBeLessThanOrEqual(12);
  }
});

test('per-word mode places stems 80 units apart', () => {
  const g = layout(tl('a a'), { ...OPTS, wordSep: 'per-word', feather: 'none' });
  const stems = g.primitives.filter((p) => p.kind === 'stem');
  expect(stems).toHaveLength(2);
  expect(stems[1].x1 - stems[0].x1).toBe(80);
});

test('feather both adds a mark at each end', () => {
  const g = layout(tl('meitheal'), { ...OPTS, feather: 'both' });
  expect(g.primitives.filter((p) => p.kind === 'feather')).toHaveLength(2);
});

test('horizontal is the vertical geometry rotated 90 clockwise (x,y)->(-y,x)', () => {
  const v = layout(tl('meitheal'), { ...OPTS });
  const h = layout(tl('meitheal'), { ...OPTS, orientation: 'horizontal' });
  expect(h.primitives).toHaveLength(v.primitives.length);
  const vs = v.primitives.find((p) => p.kind === 'stroke');
  const hs = h.primitives[v.primitives.indexOf(vs)];
  expect(hs.x1).toBe(-vs.y1);
  expect(hs.y1).toBe(vs.x1);
  expect(h.bounds).toEqual({ minX: -30, minY: -30, maxX: 314, maxY: 30 });
});

test('empty input yields a zero box, not Infinity bounds', () => {
  const g = layout(tl(''), OPTS);
  expect(g.primitives).toHaveLength(0);
  expect(g.bounds).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
});
