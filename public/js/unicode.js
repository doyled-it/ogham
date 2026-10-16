import { LETTERS, FORFEDA } from './alphabet.js';

const BASE = {
  0x1681: 'b', 0x1682: 'l', 0x1683: 'f', 0x1684: 's', 0x1685: 'n',
  0x1686: 'h', 0x1687: 'd', 0x1688: 't', 0x1689: 'c', 0x168a: 'q',
  0x168b: 'm', 0x168c: 'g', 0x168d: 'ng', 0x168e: 'z', 0x168f: 'r',
  0x1690: 'a', 0x1691: 'o', 0x1692: 'u', 0x1693: 'e', 0x1694: 'i',
};
const FORFID_CP = {
  0x1695: 'eabhadh', 0x1696: 'or', 0x1697: 'uilleann', 0x1698: 'ifin', 0x1699: 'eamhancholl', 0x169a: 'peith',
};
const FORFID_BY_ID = Object.fromEntries(FORFEDA.map((f) => [f.id, f]));

// Variant lookup keyed by "<baseHex>:<selectorHex>".
const VARIANTS = {
  '1687:fe01': { geom: 'rabbit-d', strokes: null, name: 'Rabbit-eared Dair', value: 'd', variant: 'rabbit-eared' },
  '1690:fe01': { geom: 'angled', strokes: 1, name: 'Angled Ailm', value: 'a', variant: 'angled' },
  '1690:fe02': { geom: 'hammerhead', strokes: null, name: 'Hammerhead Ailm', value: 'a', variant: 'hammerhead' },
  '1690:fe03': { geom: 's-ailm', strokes: null, name: 'S-shaped Ailm', value: 'a', variant: 's-shaped' },
  '1691:fe01': { geom: 'angled', strokes: 2, name: 'Angled Onn', value: 'o', variant: 'angled' },
  '1692:fe01': { geom: 'angled', strokes: 3, name: 'Angled Úr', value: 'u', variant: 'angled' },
  '1693:fe01': { geom: 'angled', strokes: 4, name: 'Angled Eadhadh', value: 'e', variant: 'angled' },
  '1694:fe01': { geom: 'angled', strokes: 5, name: 'Angled Iodhadh', value: 'i', variant: 'angled' },
  '1694:fe02': { geom: 'm', strokes: 5, name: 'Diagonal Iodhadh', value: 'i', variant: 'diagonal' },
  '1695:fe01': { geom: 'disjoined-ea', strokes: null, name: 'Disjoined Éabhadh', value: 'ea', variant: 'disjoined' },
  '1697:fe01': { geom: 'semi-uilleann', strokes: null, name: 'Semicircular Uilleann', value: 'ui', variant: 'semicircular' },
  '1698:fe01': { geom: 'x-ifin', strokes: null, name: 'X-shaped Ifín', value: 'p', variant: 'x-shaped' },
};

function letterGlyph(key, source) {
  const L = LETTERS[key];
  return { value: L.value, name: L.name, group: L.group, strokes: L.strokes, strokesLabel: L.strokesLabel, source, flags: [], variant: null };
}
function forfidGlyph(id, source) {
  const f = FORFID_BY_ID[id];
  return { value: f.value, name: f.name, group: f.group, strokes: null, strokesLabel: f.strokesLabel, source, flags: [], variant: f.id };
}
function baseGlyph(cp, source) {
  if (BASE[cp]) return letterGlyph(BASE[cp], source);
  return forfidGlyph(FORFID_CP[cp], source);
}
function variantGlyph(v, source) {
  return { value: v.value, name: v.name, group: v.geom, strokes: v.strokes, strokesLabel: v.variant, source, flags: ['proposed'], variant: v.variant };
}
function doubleRGlyph(source) {
  return { value: 'rr', name: 'Double R', group: 'double-r', strokes: null, strokesLabel: 'bind', source, flags: ['proposed', 'bind'], variant: 'double-r' };
}

function isBase(cp) { return Boolean(BASE[cp] || FORFID_CP[cp]); }

export function parseOgham(text) {
  const ignored = [];
  const notes = [];
  const cps = [...String(text)].map((c) => c.codePointAt(0));
  const stems = [];
  let words = [];
  let current = [];
  const flushWord = () => { if (current.length) { words.push(current); current = []; } };
  const flushStem = () => { flushWord(); if (words.length) { stems.push({ words }); } words = []; };

  for (let i = 0; i < cps.length; i += 1) {
    const cp = cps[i];
    const next = cps[i + 1];
    if (cp === 0x0a) { flushStem(); continue; }
    if (cp === 0x1680 || cp === 0x20 || cp === 0x09) { flushWord(); continue; }
    if (cp === 0x169b || cp === 0x169c) { if (!notes.includes('feather-input')) notes.push('feather-input'); continue; }
    if (cp === 0x200d) { ignored.push({ char: '‍', reason: 'joiner' }); continue; }
    if (isBase(cp)) {
      if (cp === 0x168f && next === 0x200d && cps[i + 2] === 0x168f) {
        current.push(doubleRGlyph('ᚏ‍ᚏ'));
        i += 2; continue;
      }
      if (next >= 0xfe00 && next <= 0xfe03) {
        const sel = next.toString(16);
        if (next === 0xfe00) { current.push(baseGlyph(cp, String.fromCodePoint(cp))); i += 1; continue; }
        const key = `${cp.toString(16)}:${sel}`;
        if (VARIANTS[key]) { current.push(variantGlyph(VARIANTS[key], String.fromCodePoint(cp, next))); i += 1; continue; }
        if (!notes.includes('selector-ignored')) notes.push('selector-ignored');
        current.push(baseGlyph(cp, String.fromCodePoint(cp))); i += 1; continue;
      }
      current.push(baseGlyph(cp, String.fromCodePoint(cp)));
      continue;
    }
    ignored.push({ char: String.fromCodePoint(cp), reason: 'unknown' });
  }
  flushStem();
  return { stems, ignored, notes };
}
