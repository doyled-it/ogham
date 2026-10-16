export const DEFAULTS = {
  t: '', o: 'v', w: 'gap', f: 'start', ng: true, h: 'keep', p: 'pin', c: 'carved', s: 5, wt: 'regular', bg: 'transparent', tr: 'manuscript', src: 'latin',
};

const ENUMS = {
  o: ['v', 'h'],
  w: ['gap', 'per-word', 'none'],
  f: ['start', 'both', 'none'],
  h: ['keep', 'drop'],
  p: ['pin', 'ceirt', 'peith'],
  wt: ['thin', 'regular', 'heavy'],
  bg: ['transparent', 'white', 'canvas'],
  tr: ['manuscript', 'monumental'],
  src: ['latin', 'unicode'],
};

export function encode(settings) {
  const s = { ...DEFAULTS, ...settings };
  const params = new URLSearchParams();
  for (const key of Object.keys(DEFAULTS)) {
    let value = s[key];
    if (key === 'ng') value = s.ng ? '1' : '0';
    const def = key === 'ng' ? (DEFAULTS.ng ? '1' : '0') : DEFAULTS[key];
    if (key === 't') { if (s.t) params.set('t', s.t); continue; }
    if (String(value) !== String(def)) params.set(key, String(value));
  }
  return params.toString();
}

export function decode(query) {
  const p = new URLSearchParams(query);
  const out = { ...DEFAULTS };
  if (p.has('t')) out.t = p.get('t');
  for (const key of Object.keys(ENUMS)) {
    if (p.has(key) && ENUMS[key].includes(p.get(key))) out[key] = p.get(key);
  }
  if (p.has('ng')) out.ng = p.get('ng') === '1';
  if (p.has('c')) out.c = p.get('c');
  if (p.has('s')) {
    const n = Number(p.get('s'));
    if (Number.isFinite(n) && n > 0) out.s = n;
  }
  return out;
}
