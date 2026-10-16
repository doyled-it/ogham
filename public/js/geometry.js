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
// Returns [x1, y1, x2, y2] tuples in units. Vowels are full bars in the
// manuscript tradition and short notches in the monumental (stone) tradition.
export function letterStrokes(group, n, y, pitch = PITCH, tradition = 'manuscript') {
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const yy = y - i * pitch;
    if (group === 'v') out.push(tradition === 'monumental' ? [-4, yy, 4, yy] : [-12, yy, 12, yy]);
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

// Peith: two short strokes set parallel to the stem (the manuscript "soft
// Beith"). Corrected from the earlier Beith-plus-hook form, which the Unicode
// reference fonts do not support.
function peithStrokes(y) {
  return [
    [6, y, 6, y - 14],
    [12, y, 12, y - 14],
  ];
}

// Forfeda, drawn in the vertical convention (stem at x = 0), centred on y
// unless noted. Shapes follow the Unicode reference charts and fonts; the three
// flagged 'uncertain' in alphabet.js are the standard digital forms.

// Éabhadh: a single X crossing the stem.
function eabhadhStrokes(y) {
  return [
    [-12, y - 10, 12, y + 10],
    [-12, y + 10, 12, y - 10],
  ];
}

// Ór: a diamond, top and bottom vertices on the stem, sides off it.
function orStrokes(y) {
  return [
    [0, y - 13, 13, y],
    [13, y, 0, y + 13],
    [0, y + 13, -13, y],
    [-13, y, 0, y - 13],
  ];
}

// Uilleann: a squared elbow hooking off the stem.
function uilleannStrokes(y) {
  return [
    [0, y, 20, y],
    [20, y, 20, y - 20],
    [20, y - 20, 6, y - 20],
  ];
}

// Eamhancholl: a crosshatch of two strokes each way ("twinned Coll").
function eamhanchollStrokes(y) {
  return [
    [-10, y - 10, 10, y + 2],
    [-10, y - 2, 10, y + 10],
    [-10, y + 10, 10, y - 2],
    [-10, y + 2, 10, y - 10],
  ];
}

const FORFID_STROKES = {
  eabhadh: eabhadhStrokes,
  or: orStrokes,
  uilleann: uilleannStrokes,
  eamhancholl: eamhanchollStrokes,
};
const FORFID_SPAN = { eabhadh: 0, or: 0, uilleann: 20, eamhancholl: 0 };

// Point samplers for the three curved variant forms. They return [x, y] points
// in the vertical convention; the stem builder wraps each list as a poly part.
function sampleQuad(p0, c, p1, n) {
  const pts = [];
  for (let k = 0; k <= n; k += 1) {
    const t = k / n, u = 1 - t;
    pts.push([
      u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
      u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
    ]);
  }
  return pts;
}
function sampleCubic(p0, c1, c2, p1, n) {
  const pts = [];
  for (let k = 0; k <= n; k += 1) {
    const t = k / n, u = 1 - t;
    pts.push([
      u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
      u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1],
    ]);
  }
  return pts;
}
function sampleArc(cx, cy, r, a0, a1, n) {
  const pts = [];
  for (let k = 0; k <= n; k += 1) {
    const a = a0 + (a1 - a0) * (k / n);
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

// Rabbit-eared Dair: two strokes on one side of the stem, tips curving apart.
function rabbitDairStrokes(y) {
  return [
    ['poly', sampleQuad([0, y + 2], [-14, y + 6], [-24, y + 14], 6)],
    ['poly', sampleQuad([0, y - 2], [-14, y - 6], [-24, y - 14], 6)],
  ];
}
// S-shaped Ailm: a sigmoid crossing the stem.
function sAilmStrokes(y) {
  return [['poly', sampleCubic([0, y - 12], [12, y - 6], [-12, y + 6], [0, y + 12], 10)]];
}
// Semicircular Uilleann: a right semicircle, diameter on the stem, bulge off it.
function semiUilleannStrokes(y) {
  return [['poly', sampleArc(0, y, 14, -Math.PI / 2, Math.PI / 2, 10)]];
}

// Angled vowels: one chevron per vowel stroke, apex on the stem pointing in the
// reading direction, arms splaying to both sides. Two straight strokes per chevron.
function angledVowelStrokes(n, y) {
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const yy = y - i * PITCH;
    out.push([-12, yy + 5, 0, yy - 5]);
    out.push([0, yy - 5, 12, yy + 5]);
  }
  return out;
}
// Hammerhead Ailm: a crossing bar with a short foot at one end, parallel to the stem.
function hammerheadStrokes(y) {
  return [
    [-12, y, 12, y],
    [12, y, 12, y - 10],
  ];
}
// Disjoined Eabhadh: two chevrons facing across a central gap on the stem.
function disjoinedEabhadhStrokes(y) {
  return [
    [-10, y + 12, 0, y + 2], [0, y + 2, 10, y + 12],
    [-10, y - 12, 0, y - 2], [0, y - 2, 10, y - 12],
  ];
}
// X-shaped Ifin: a plain X on one side of the stem, inner tips on the stem.
function xIfinStrokes(y) {
  return [
    [0, y - 10, 20, y + 10],
    [0, y + 10, 20, y - 10],
  ];
}
// Double R: five Ruis diagonals overlaid by five mirrored diagonals.
function doubleRStrokes(y) {
  const out = [];
  for (let i = 0; i < 5; i += 1) {
    const yy = y - i * PITCH;
    out.push([-15, yy - 11, 15, yy + 11]);
    out.push([-15, yy + 11, 15, yy - 11]);
  }
  return out;
}

// Vertical extent a glyph occupies above its first stroke (first stroke to last).
function glyphSpan(glyph) {
  if (glyph.group === 'p') return 20;      // Pín / Ifín: two X centres 20 apart
  if (glyph.group === 'peith') return 14;  // two strokes 14 tall
  if (glyph.group in FORFID_SPAN) return FORFID_SPAN[glyph.group];
  if (glyph.group === 'rabbit-d') return 14;
  if (glyph.group === 's-ailm') return 0;
  if (glyph.group === 'semi-uilleann') return 0;
  if (glyph.group === 'angled') return (glyph.strokes - 1) * PITCH;
  if (glyph.group === 'hammerhead') return 0;
  if (glyph.group === 'disjoined-ea') return 0;
  if (glyph.group === 'x-ifin') return 0;
  if (glyph.group === 'double-r') return 40;
  return (glyph.strokes - 1) * PITCH;
}

function glyphStrokes(glyph, y, tradition) {
  if (glyph.group === 'p') return pinStrokes(y);
  if (glyph.group === 'peith') return peithStrokes(y);
  if (FORFID_STROKES[glyph.group]) return FORFID_STROKES[glyph.group](y);
  if (glyph.group === 'rabbit-d') return rabbitDairStrokes(y);
  if (glyph.group === 's-ailm') return sAilmStrokes(y);
  if (glyph.group === 'semi-uilleann') return semiUilleannStrokes(y);
  if (glyph.group === 'angled') return angledVowelStrokes(glyph.strokes, y);
  if (glyph.group === 'hammerhead') return hammerheadStrokes(y);
  if (glyph.group === 'disjoined-ea') return disjoinedEabhadhStrokes(y);
  if (glyph.group === 'x-ifin') return xIfinStrokes(y);
  if (glyph.group === 'double-r') return doubleRStrokes(y);
  return letterStrokes(glyph.group, glyph.strokes, y, PITCH, tradition);
}

// Lay out one stem's glyphs (already grouped into words) at local x = 0.
function layoutStemStrokes(words, weight, wordAdvance, tradition) {
  const width = STROKE_WIDTH[weight];
  const strokes = [];
  const polys = [];
  let cursorY = 0; // y of the next glyph's first stroke
  const firstStrokeY = 0;
  let lastStrokeY = 0;
  words.forEach((glyphs, wi) => {
    glyphs.forEach((glyph, gi) => {
      for (const part of glyphStrokes(glyph, cursorY, tradition)) {
        if (part[0] === 'poly') polys.push({ points: part[1], width });
        else strokes.push([...part, width]);
      }
      lastStrokeY = cursorY - glyphSpan(glyph);
      const isLastGlyphOfWord = gi === glyphs.length - 1;
      const isLastWord = wi === words.length - 1;
      if (!(isLastGlyphOfWord && isLastWord)) {
        const advance = isLastGlyphOfWord ? wordAdvance : LETTER_GAP;
        cursorY = lastStrokeY - advance;
      }
    });
  });
  return { strokes, polys, firstStrokeY, lastStrokeY };
}

function stemPrimitives(words, opts, offsetX) {
  const width = STROKE_WIDTH[opts.strokeWeight];
  const wordAdvance = opts.wordSep === 'gap' ? WORD_GAP : LETTER_GAP;
  const { strokes, polys, firstStrokeY, lastStrokeY } = layoutStemStrokes(words, opts.strokeWeight, wordAdvance, opts.tradition);
  const prims = [];
  const footY = firstStrokeY + OVERSHOOT; // SVG-down, below the lowest stroke
  const topY = lastStrokeY - OVERSHOOT;
  prims.push({ kind: 'stem', x1: offsetX, y1: footY, x2: offsetX, y2: topY, width });
  for (const [x1, y1, x2, y2, w] of strokes) {
    prims.push({ kind: 'stroke', x1: x1 + offsetX, y1, x2: x2 + offsetX, y2, width: w });
  }
  for (const p of polys) {
    prims.push({ kind: 'poly', points: p.points.map(([x, y]) => [x + offsetX, y]), width: p.width });
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
    if (p.kind === 'feather' || p.kind === 'poly') for (const [x, y] of p.points) pt(x, y);
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
  const o = { orientation: 'vertical', wordSep: 'gap', feather: 'start', strokeWeight: 'regular', tradition: 'manuscript', ...opts };
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
    if (p.kind === 'feather' || p.kind === 'poly') {
      return { ...p, points: p.points.map(([x, y]) => r(x, y)) };
    }
    const [x1, y1] = r(p.x1, p.y1);
    const [x2, y2] = r(p.x2, p.y2);
    return { ...p, x1, y1, x2, y2 };
  });
}
