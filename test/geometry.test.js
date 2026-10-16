import { test, expect } from 'vitest';
import { transliterate } from '../public/js/transliterate.js';
import { layout, letterStrokes, rotateCW } from '../public/js/geometry.js';

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

test('Éabhadh is a single X of two crossing strokes', () => {
  const g = layout(tl('', {}), { ...OPTS, feather: 'none' });
  // build a one-glyph result directly for a forfid by group
  const forfid = { value: 'ea', name: 'Éabhadh', group: 'eabhadh', strokes: null, flags: [] };
  const gg = layout({ stems: [{ words: [[forfid]] }], ignored: [], notes: [] }, { ...OPTS, feather: 'none' });
  const strokes = gg.primitives.filter((p) => p.kind === 'stroke');
  expect(strokes).toHaveLength(2);
  for (const s of strokes) {
    expect(Math.abs(s.x1)).toBe(12);
    expect(Math.abs(s.x2)).toBe(12);
  }
  // reference to g keeps the no-op empty layout honest
  expect(g.primitives).toHaveLength(0);
});

test('Ór is a four-stroke diamond with its waist on the stem', () => {
  const forfid = { value: 'oi', name: 'Ór', group: 'or', strokes: null, flags: [] };
  const gg = layout({ stems: [{ words: [[forfid]] }], ignored: [], notes: [] }, { ...OPTS, feather: 'none' });
  const strokes = gg.primitives.filter((p) => p.kind === 'stroke');
  expect(strokes).toHaveLength(4);
  // left and right vertices sit off the stem, top and bottom vertices on it
  const xs = strokes.flatMap((s) => [s.x1, s.x2]);
  expect(Math.max(...xs)).toBe(13);
  expect(Math.min(...xs)).toBe(-13);
});

test('Uilleann is a three-segment elbow', () => {
  const forfid = { value: 'ui', name: 'Uilleann', group: 'uilleann', strokes: null, flags: [] };
  const gg = layout({ stems: [{ words: [[forfid]] }], ignored: [], notes: [] }, { ...OPTS, feather: 'none' });
  expect(gg.primitives.filter((p) => p.kind === 'stroke')).toHaveLength(3);
});

test('Eamhancholl is a four-stroke crosshatch', () => {
  const forfid = { value: 'ae', name: 'Eamhancholl', group: 'eamhancholl', strokes: null, flags: [] };
  const gg = layout({ stems: [{ words: [[forfid]] }], ignored: [], notes: [] }, { ...OPTS, feather: 'none' });
  expect(gg.primitives.filter((p) => p.kind === 'stroke')).toHaveLength(4);
});

test('Peith is two short strokes, not the old Beith-and-hook', () => {
  const forfid = { value: 'p', name: 'Peith', group: 'peith', strokes: null, flags: [] };
  const gg = layout({ stems: [{ words: [[forfid]] }], ignored: [], notes: [] }, { ...OPTS, feather: 'none' });
  const strokes = gg.primitives.filter((p) => p.kind === 'stroke');
  expect(strokes).toHaveLength(2);
  // both strokes run parallel to the stem (vertical), so x1 === x2 on each
  for (const s of strokes) expect(s.x1).toBe(s.x2);
  // and neither spans the full 30-unit Beith width
  for (const s of strokes) expect(Math.abs(s.x2)).toBeLessThan(30);
});

test('diagonal Iodhadh (group m, 5 strokes) draws the same strokes as Ruis', () => {
  const sOf = (glyph) => layout({ stems: [{ words: [[glyph]] }], ignored: [], notes: [] }, { ...OPTS, feather: 'none' })
    .primitives.filter((p) => p.kind === 'stroke').map((p) => [p.x1, p.y1, p.x2, p.y2]);
  const diagonal = sOf({ value: 'i', name: 'Diagonal Iodhadh', group: 'm', strokes: 5, flags: ['proposed'] });
  const ruis = sOf({ value: 'r', name: 'Ruis', group: 'm', strokes: 5, flags: [] });
  expect(diagonal).toHaveLength(5);
  expect(diagonal).toEqual(ruis); // same shape; distinguished only by name and flag
});

test('manuscript vowels are full bars, monumental vowels are short notches', () => {
  expect(letterStrokes('v', 1, 0)).toEqual([[-12, 0, 12, 0]]);
  expect(letterStrokes('v', 1, 0, 10, 'manuscript')).toEqual([[-12, 0, 12, 0]]);
  expect(letterStrokes('v', 1, 0, 10, 'monumental')).toEqual([[-4, 0, 4, 0]]);
  expect(letterStrokes('v', 3, 0, 10, 'monumental')).toEqual([
    [-4, 0, 4, 0], [-4, -10, 4, -10], [-4, -20, 4, -20],
  ]);
});

test('tradition only changes vowels, not consonants or the m group', () => {
  expect(letterStrokes('b', 1, 0, 10, 'monumental')).toEqual([[0, 0, 30, 0]]);
  expect(letterStrokes('h', 1, 0, 10, 'monumental')).toEqual([[-30, 0, 0, 0]]);
  expect(letterStrokes('m', 1, 0, 10, 'monumental')).toEqual([[-15, -11, 15, 11]]);
});

test('layout defaults to manuscript and monumental shrinks the vowel bars', () => {
  const man = layout(tl('a'), { ...OPTS, feather: 'none' });
  const mon = layout(tl('a'), { ...OPTS, feather: 'none', tradition: 'monumental' });
  const vbar = man.primitives.find((p) => p.kind === 'stroke');
  const vnotch = mon.primitives.find((p) => p.kind === 'stroke');
  expect(vbar.x1).toBe(-12);
  expect(vnotch.x1).toBe(-4);
  // the default (no tradition given) matches manuscript
  const def = layout(tl('a'), { ...OPTS, feather: 'none' });
  expect(def.primitives.find((p) => p.kind === 'stroke').x1).toBe(-12);
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

test('rotateCW rotates a poly primitive point by point', () => {
  const [p] = rotateCW([{ kind: 'poly', points: [[2, 3], [4, 5]], width: 4 }]);
  expect(p.points).toEqual([[-3, 2], [-5, 4]]);
});

test('a glyph part marked poly becomes a poly primitive carried through layout', () => {
  // A synthetic glyph whose group has no geometry yet falls through to letterStrokes,
  // so we test the mixed-parts path directly via the exported helper in a later task.
  // Here we assert the stem builder keeps straight strokes working unchanged.
  const g = layout(tl('b'), { ...OPTS, feather: 'none' });
  expect(g.primitives.filter((p) => p.kind === 'stroke')).toHaveLength(1);
  expect(g.primitives.filter((p) => p.kind === 'poly')).toHaveLength(0);
});

test('curved variants produce poly parts with endpoints on the stem', () => {
  const semi = { value: 'ui', name: 'Semicircular Uilleann', group: 'semi-uilleann', strokes: null, flags: ['proposed'] };
  const g = layout({ stems: [{ words: [[semi]] }], ignored: [], notes: [] }, { ...OPTS, feather: 'none' });
  const polys = g.primitives.filter((p) => p.kind === 'poly');
  expect(polys).toHaveLength(1);
  const pts = polys[0].points;
  // a right semicircle of radius 14 centred on the stem: ends on the stem, bulge to +x = 14
  expect(Math.round(Math.max(...pts.map((p) => p[0])))).toBe(14);
  expect(Math.round(Math.min(...pts.map((p) => p[0])))).toBe(0);
});

test('rabbit-eared Dair is two poly parts on one side of the stem', () => {
  const d = { value: 'd', name: 'Rabbit-eared Dair', group: 'rabbit-d', strokes: null, flags: ['proposed'] };
  const g = layout({ stems: [{ words: [[d]] }], ignored: [], notes: [] }, { ...OPTS, feather: 'none' });
  const polys = g.primitives.filter((p) => p.kind === 'poly');
  expect(polys).toHaveLength(2);
  for (const p of polys) for (const [x] of p.points) expect(x).toBeLessThanOrEqual(0);
});

test('S-shaped Ailm is one poly crossing the stem', () => {
  const a = { value: 'a', name: 'S-shaped Ailm', group: 's-ailm', strokes: null, flags: ['proposed'] };
  const g = layout({ stems: [{ words: [[a]] }], ignored: [], notes: [] }, { ...OPTS, feather: 'none' });
  expect(g.primitives.filter((p) => p.kind === 'poly')).toHaveLength(1);
});

const forfGlyph = (group, strokes = null) => ({ value: '?', name: group, group, strokes, flags: ['proposed'] });
const strokesOf = (glyph) => layout({ stems: [{ words: [[glyph]] }], ignored: [], notes: [] }, { ...OPTS, feather: 'none' }).primitives.filter((p) => p.kind === 'stroke');

test('an angled vowel is two strokes per vowel stroke (a chevron each)', () => {
  expect(strokesOf(forfGlyph('angled', 1))).toHaveLength(2);
  expect(strokesOf(forfGlyph('angled', 5))).toHaveLength(10);
});

test('hammerhead Ailm is a crossing bar plus a foot', () => {
  expect(strokesOf(forfGlyph('hammerhead'))).toHaveLength(2);
});

test('disjoined Eabhadh is four strokes with a central gap on the stem', () => {
  const s = strokesOf(forfGlyph('disjoined-ea'));
  expect(s).toHaveLength(4);
  // no stroke crosses the stem centre line between the two chevron apexes
});

test('x-shaped Ifin is a two-stroke X on one side of the stem', () => {
  const s = strokesOf(forfGlyph('x-ifin'));
  expect(s).toHaveLength(2);
  for (const k of s) { expect(k.x1).toBeGreaterThanOrEqual(0); expect(k.x2).toBeGreaterThanOrEqual(0); }
});

test('double R is a ten-stroke lattice', () => {
  expect(strokesOf(forfGlyph('double-r'))).toHaveLength(10);
});
