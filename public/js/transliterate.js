import { LETTERS, LATER_VALUE, ACCENTS, CONVENTION_MAP, LENITION_CONSONANTS, PIN, PEITH } from './alphabet.js';

function glyph(base, { source, flags = [], variant } = {}) {
  return {
    value: base.value,
    name: base.name,
    group: base.group,
    strokes: base.strokes,
    strokesLabel: base.strokesLabel,
    source: source ?? base.value,
    flags,
    variant: variant ?? null,
  };
}

function stripAccents(ch) {
  return ACCENTS[ch] || ch;
}

// Transliterate one lowercased word into a list of glyphs, pushing ignored
// characters and notes onto the shared arrays.
function word(raw, opts, ignored, notes) {
  const chars = [...raw].map(stripAccents);
  const out = [];
  let prevInput = null; // previous input char that produced (or would have) a glyph
  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    const two = ch + (chars[i + 1] || '');

    // ng digraph (greedy, when enabled)
    if (opts.ng && two === 'ng') {
      out.push(glyph(LETTERS.ng, { source: 'ng', flags: ['convention'] }));
      i += 1; prevInput = 'g'; continue;
    }
    // qu digraph -> Ceirt (labiovelar /kʷ/), flagged convention
    if (two === 'qu') {
      out.push(glyph(LETTERS.q, { source: 'qu', flags: ['convention'] }));
      i += 1; prevInput = 'u'; continue;
    }

    // lenition h: h after one of b c d f g m p s t
    if (ch === 'h' && prevInput && LENITION_CONSONANTS.has(prevInput)) {
      if (!notes.includes('lenition')) notes.push('lenition');
      if (opts.hLenition === 'drop') { prevInput = 'h'; continue; }
      out.push(glyph(LETTERS.h, { source: 'h', flags: ['convention', 'lenition'] }));
      prevInput = 'h'; continue;
    }

    // p strategies
    if (ch === 'p') {
      if (opts.pStrategy === 'ceirt') out.push(glyph(LETTERS.q, { source: 'p', flags: ['convention'] }));
      else if (opts.pStrategy === 'peith') out.push(glyph(PEITH, { source: 'p', flags: ['convention'], variant: 'peith' }));
      else out.push(glyph(PIN, { source: 'p', flags: ['convention'], variant: 'pin' }));
      prevInput = 'p'; continue;
    }

    // x -> c + s
    if (ch === 'x') {
      out.push(glyph(LETTERS.c, { source: 'x', flags: ['convention'] }));
      out.push(glyph(LETTERS.s, { source: 'x', flags: ['convention'] }));
      prevInput = 'x'; continue;
    }

    // direct alphabet letter
    if (LETTERS[ch]) {
      const flags = LATER_VALUE.has(ch) ? ['convention'] : [];
      out.push(glyph(LETTERS[ch], { source: ch, flags }));
      prevInput = ch; continue;
    }

    // convention single-letter map
    if (CONVENTION_MAP[ch]) {
      out.push(glyph(LETTERS[CONVENTION_MAP[ch]], { source: ch, flags: ['convention'] }));
      prevInput = ch; continue;
    }

    // ignored: digits, punctuation, anything else
    if (/[0-9]/.test(ch)) ignored.push({ char: ch, reason: 'digit' });
    else ignored.push({ char: ch, reason: 'punctuation' });
    // prevInput unchanged (a dropped char does not create a lenition anchor)
  }
  return out;
}

export function transliterate(text, opts) {
  const o = { ng: true, hLenition: 'keep', pStrategy: 'pin', ...opts };
  const ignored = [];
  const notes = [];
  const lines = String(text).toLowerCase().split('\n');
  const stems = [];
  for (const line of lines) {
    const rawWords = line.split(/[ \t]+/).filter((w) => w.length > 0);
    const words = rawWords.map((w) => word(w, o, ignored, notes)).filter((g) => g.length > 0);
    if (words.length > 0) stems.push({ words });
  }
  return { stems, ignored, notes };
}
