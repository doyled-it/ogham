export const PITCH = 10;
export const LETTER_GAP = 22;
export const WORD_GAP = 60;
export const STEM_GAP = 80;
export const OVERSHOOT = 30;
export const FEATHER_BELOW = 14;
export const FEATHER_HALF_W = 11;
export const FEATHER_H = 12;
export const STROKE_WIDTH = { thin: 3, regular: 4, heavy: 6 };

// Strokes for one standard letter, first (lowest) stroke at y, stem at x = 0.
// Returns [x1, y1, x2, y2] tuples in units. Mirrors the brief's reference.
export function letterStrokes(group, n, y, pitch = PITCH) {
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const yy = y - i * pitch;
    if (group === 'v') out.push([-12, yy, 12, yy]);
    else if (group === 'h') out.push([-30, yy, 0, yy]);
    else if (group === 'b') out.push([0, yy, 30, yy]);
    else if (group === 'm') out.push([-15, yy - 11, 15, yy + 11]);
  }
  return out;
}

// Pín: two X's stacked along the stem, each arm spanning the vowel-stroke width.
// Lower X centred at y, upper X centred at y - 20. Returns [x1,y1,x2,y2] tuples.
function pinStrokes(y) {
  const x = (yc) => [
    [-12, yc - 10, 12, yc + 10],
    [-12, yc + 10, 12, yc - 10],
  ];
  return [...x(y), ...x(y - 20)];
}

// Peith: a Beith stroke (right) plus a small hook at its outer end.
function peithStrokes(y) {
  return [
    [0, y, 30, y],
    [30, y, 30, y - 6],
  ];
}

// Vertical extent a glyph occupies above its first stroke (first stroke to last).
function glyphSpan(glyph) {
  if (glyph.group === 'p') return 20; // double-X
  if (glyph.group === 'peith') return 0;
  return (glyph.strokes - 1) * PITCH;
}

function glyphStrokes(glyph, y) {
  if (glyph.group === 'p') return pinStrokes(y);
  if (glyph.group === 'peith') return peithStrokes(y);
  return letterStrokes(glyph.group, glyph.strokes, y);
}

// Lay out one stem's glyphs (already grouped into words) at local x = 0.
function layoutStemStrokes(words, weight, wordAdvance) {
  const width = STROKE_WIDTH[weight];
  const strokes = [];
  let cursorY = 0; // y of the next glyph's first stroke
  const firstStrokeY = 0;
  let lastStrokeY = 0;
  words.forEach((glyphs, wi) => {
    glyphs.forEach((glyph, gi) => {
      for (const s of glyphStrokes(glyph, cursorY)) strokes.push([...s, width]);
      lastStrokeY = cursorY - glyphSpan(glyph);
      const isLastGlyphOfWord = gi === glyphs.length - 1;
      const isLastWord = wi === words.length - 1;
      if (!(isLastGlyphOfWord && isLastWord)) {
        const advance = isLastGlyphOfWord ? wordAdvance : LETTER_GAP;
        cursorY = lastStrokeY - advance;
      }
    });
  });
  return { strokes, firstStrokeY, lastStrokeY };
}

function stemPrimitives(words, opts, offsetX) {
  const width = STROKE_WIDTH[opts.strokeWeight];
  const wordAdvance = opts.wordSep === 'gap' ? WORD_GAP : LETTER_GAP;
  const { strokes, firstStrokeY, lastStrokeY } = layoutStemStrokes(words, opts.strokeWeight, wordAdvance);
  const prims = [];
  const footY = firstStrokeY + OVERSHOOT; // SVG-down, below the lowest stroke
  const topY = lastStrokeY - OVERSHOOT;
  prims.push({ kind: 'stem', x1: offsetX, y1: footY, x2: offsetX, y2: topY, width });
  for (const [x1, y1, x2, y2, w] of strokes) {
    prims.push({ kind: 'stroke', x1: x1 + offsetX, y1, x2: x2 + offsetX, y2, width: w });
  }
  if (opts.feather === 'start' || opts.feather === 'both') {
    const apexY = firstStrokeY + FEATHER_BELOW; // below the first stroke
    prims.push({ kind: 'feather', width,
      points: [[offsetX - FEATHER_HALF_W, apexY + FEATHER_H], [offsetX, apexY], [offsetX + FEATHER_HALF_W, apexY + FEATHER_H]] });
  }
  if (opts.feather === 'both') {
    const apexY = lastStrokeY - FEATHER_BELOW - FEATHER_H; // above the highest stroke, point away
    prims.push({ kind: 'feather', width,
      points: [[offsetX - FEATHER_HALF_W, apexY + FEATHER_H], [offsetX, apexY], [offsetX + FEATHER_HALF_W, apexY + FEATHER_H]] });
  }
  return prims;
}

function computeBounds(primitives) {
  // Empty input (no words yet) has no geometry: return a zero box so the SVG
  // renderer produces a valid, empty drawing instead of Infinity dimensions.
  if (primitives.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const pt = (x, y) => { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; };
  for (const p of primitives) {
    if (p.kind === 'feather') for (const [x, y] of p.points) pt(x, y);
    else { pt(p.x1, p.y1); pt(p.x2, p.y2); }
  }
  return { minX, minY, maxX, maxY };
}

// Build primitives for all stems. In per-word mode each word is its own stem.
function buildVertical(result, opts) {
  const columns = [];
  if (opts.wordSep === 'per-word') {
    for (const stem of result.stems) for (const w of stem.words) columns.push([w]);
  } else {
    for (const stem of result.stems) columns.push(stem.words);
  }
  const prims = [];
  columns.forEach((words, ci) => {
    prims.push(...stemPrimitives(words, opts, ci * STEM_GAP));
  });
  return prims;
}

export function layout(result, opts) {
  const o = { orientation: 'vertical', wordSep: 'gap', feather: 'start', strokeWeight: 'regular', ...opts };
  let primitives = buildVertical(result, o);
  if (o.orientation === 'horizontal') primitives = rotateCW(primitives);
  return { primitives, bounds: computeBounds(primitives) };
}

// Rotate every primitive 90 degrees clockwise in SVG screen space: (x,y) -> (-y, x).
// This is SVG rotate(90). It turns the upright, bottom-to-top stem into a
// left-to-right one, with the B group below, the H group above, vowels straight
// across and the M diagonal running lower-left to upper-right.
export function rotateCW(primitives) {
  const r = (x, y) => [-y, x];
  return primitives.map((p) => {
    if (p.kind === 'feather') {
      return { ...p, points: p.points.map(([x, y]) => r(x, y)) };
    }
    const [x1, y1] = r(p.x1, p.y1);
    const [x2, y2] = r(p.x2, p.y2);
    return { ...p, x1, y1, x2, y2 };
  });
}
