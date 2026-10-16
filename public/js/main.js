import { transliterate } from './transliterate.js';
import { parseOgham } from './unicode.js';
import { PALETTE } from './palette.js';
import { layout } from './geometry.js';
import { FORFEDA } from './alphabet.js';
import { renderSVG } from './svg.js';
import { COLOURWAYS, getColourway } from './colourways.js';
import { DEFAULTS, encode, decode } from './state.js';
import { buildFilename, svgToPng, copySvg, downloadBlob } from './export.js';

const els = {
  text: document.getElementById('text-input'),
  drawing: document.getElementById('drawing'),
  breakdown: document.getElementById('breakdown'),
  forfeda: document.getElementById('forfeda'),
  readout: document.getElementById('readout'),
  warning: document.getElementById('warning'),
  lenition: document.getElementById('lenition-note'),
  placeholder: document.getElementById('placeholder-note'),
  colourways: document.getElementById('colourways'),
  provenance: document.getElementById('provenance'),
  size: document.getElementById('size'),
  ng: document.getElementById('ng'),
  hKeep: document.getElementById('h-keep'),
  status: document.getElementById('export-status'),
  palette: document.getElementById('palette'),
};

let lastRender = null;

/* Helpers */
function radioVal(name, dflt) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : dflt;
}
function setRadio(name, val) {
  const el = document.querySelector(`input[name="${name}"][value="${CSS.escape(String(val))}"]`);
  if (el) el.checked = true;
}
function clampSize(n) {
  return Number.isFinite(n) && n > 0 ? n : DEFAULTS.s;
}
function flattenGlyphs(result) {
  const out = [];
  for (const stem of result.stems) for (const word of stem.words) for (const g of word) out.push(g);
  return out;
}
function strokeLabel(g) {
  if (g.strokes == null) return g.strokesLabel || '';
  return g.strokes === 1 ? '1 stroke' : `${g.strokes} strokes`;
}
function orientationOf(o) { return o === 'h' ? 'horizontal' : 'vertical'; }

/* Settings */
function readSettings() {
  return {
    t: els.text.value,
    o: radioVal('o', DEFAULTS.o),
    w: radioVal('w', DEFAULTS.w),
    f: radioVal('f', DEFAULTS.f),
    ng: els.ng.checked,
    h: els.hKeep.checked ? 'keep' : 'drop',
    p: radioVal('p', DEFAULTS.p),
    c: radioVal('c', DEFAULTS.c),
    s: clampSize(parseFloat(els.size.value)),
    wt: radioVal('wt', DEFAULTS.wt),
    tr: radioVal('tr', DEFAULTS.tr),
    bg: radioVal('bg', DEFAULTS.bg),
    src: radioVal('src', DEFAULTS.src),
  };
}
function applySettings(s) {
  els.text.value = s.t || '';
  setRadio('o', s.o);
  setRadio('w', s.w);
  setRadio('f', s.f);
  els.ng.checked = !!s.ng;
  els.hKeep.checked = s.h !== 'drop';
  setRadio('p', s.p);
  setRadio('wt', s.wt);
  setRadio('tr', s.tr);
  setRadio('bg', s.bg);
  setRadio('src', s.src);
  els.size.value = s.s;
  setRadio('c', s.c);
}

/* Colourways */
function buildColourways(selected) {
  const frag = document.createDocumentFragment();
  for (const c of COLOURWAYS) {
    const label = document.createElement('label');
    label.className = 'swatch';
    label.dataset.cw = c.id;
    label.title = c.provenance;
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'c';
    input.value = c.id;
    input.id = `c-${c.id}`;
    if (c.id === selected) input.checked = true;
    const dot = document.createElement('span');
    dot.className = 'dot';
    const name = document.createElement('span');
    name.className = 'swatch-name';
    name.textContent = c.label;
    label.append(input, dot, name);
    frag.append(label);
  }
  els.colourways.replaceChildren(frag);
}
function updateProvenance() {
  els.provenance.textContent = getColourway(radioVal('c', DEFAULTS.c)).provenance;
}
function onColourwayChange() {
  const c = radioVal('c', DEFAULTS.c);
  setRadio('bg', c === 'carved' ? 'transparent' : 'canvas');
  updateProvenance();
  render();
}

/* Warnings and notes */
function showPlaceholderNote(on) { els.placeholder.hidden = !on; }
function showWarning(ignored) {
  if (!ignored.length) { els.warning.hidden = true; els.warning.textContent = ''; return; }
  const chars = [...new Set(ignored.map((i) => i.char))].join(' ');
  els.warning.hidden = false;
  els.warning.textContent = `Set aside: ${chars}. Digits, punctuation and fadas are not written in ogham.`;
}
function showLenition(notes) {
  if (!notes.includes('lenition')) { els.lenition.hidden = true; return; }
  els.lenition.hidden = false;
  els.lenition.textContent = 'An h after b, c, d, f, g, m, p, s or t marks lenition, which ogham never wrote. It is kept here as the letter Úath. Turn off "Keep h after a consonant" to drop it.';
}

/* Breakdown */
function renderBreakdown(glyphs) {
  if (!glyphs.length) {
    els.breakdown.replaceChildren(Object.assign(document.createElement('p'), {
      className: 'breakdown-empty', textContent: 'No letters yet.',
    }));
    return;
  }
  const frag = document.createDocumentFragment();
  for (const g of glyphs) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    if (g.flags.includes('convention')) tile.classList.add('has-convention');
    if (g.flags.includes('proposed')) tile.classList.add('is-proposed');
    if (g.flags.includes('proposed')) tile.title = 'Proposed variant, not encoded in Unicode';

    const glyphBox = document.createElement('div');
    glyphBox.className = 'tile-glyph';
    // Decorative: the adjacent value and name already name this letter, so hide
    // the drawn glyph from assistive tech to avoid reading the name twice.
    glyphBox.setAttribute('aria-hidden', 'true');
    const mini = layout({ stems: [{ words: [[g]] }], ignored: [], notes: [] },
      { orientation: 'vertical', wordSep: 'none', feather: 'none', strokeWeight: 'regular' });
    glyphBox.innerHTML = renderSVG(mini, { colourway: { ink: 'currentColor', canvas: null }, spacingMm: 5 }).svg;

    const value = document.createElement('div');
    value.className = 'tile-value';
    value.textContent = g.value;
    const name = document.createElement('div');
    name.className = 'tile-name';
    name.textContent = g.name;
    const count = document.createElement('div');
    count.className = 'tile-count';
    count.textContent = strokeLabel(g);

    tile.append(glyphBox, value, name, count);
    if (g.flags.includes('convention')) tile.title = 'Mapped by convention';
    frag.append(tile);
  }
  els.breakdown.replaceChildren(frag);
}

/* Forfeda reference (static, drawn once from the FORFEDA table) */
function renderForfeda() {
  const frag = document.createDocumentFragment();
  for (const f of FORFEDA) {
    const tile = document.createElement('div');
    tile.className = f.confidence === 'uncertain' ? 'tile unconfirmed' : 'tile';
    if (f.confidence === 'uncertain') tile.title = 'Standard digital form, not yet confirmed against a manuscript';

    const glyphBox = document.createElement('div');
    glyphBox.className = 'tile-glyph';
    glyphBox.setAttribute('aria-hidden', 'true');
    const g = { value: f.value, name: f.name, group: f.group, strokes: null, strokesLabel: f.strokesLabel, flags: [] };
    const mini = layout({ stems: [{ words: [[g]] }], ignored: [], notes: [] },
      { orientation: 'vertical', wordSep: 'none', feather: 'none', strokeWeight: 'regular' });
    glyphBox.innerHTML = renderSVG(mini, { colourway: { ink: 'currentColor', canvas: null }, spacingMm: 5 }).svg;

    const value = document.createElement('div');
    value.className = 'tile-value';
    value.textContent = f.value;
    const name = document.createElement('div');
    name.className = 'tile-name';
    name.textContent = f.name;
    const cp = document.createElement('div');
    cp.className = 'tile-cp';
    cp.textContent = f.codepoint;

    tile.append(glyphBox, value, name, cp);
    frag.append(tile);
  }
  els.forfeda.replaceChildren(frag);
}

/* Ogham input mode */
function buildPalette() {
  const frag = document.createDocumentFragment();
  for (const group of PALETTE) {
    const box = document.createElement('div');
    box.className = 'palette-group';
    const h = document.createElement('h3');
    h.textContent = group.title;
    box.append(h);
    if (group.note) {
      const n = document.createElement('p');
      n.className = 'note';
      n.textContent = group.note;
      box.append(n);
    }
    const keys = document.createElement('div');
    keys.className = 'palette-keys';
    for (const item of group.items) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'palette-key';
      b.textContent = item.label;
      b.addEventListener('click', () => insertAtCaret(item.insert));
      keys.append(b);
    }
    box.append(keys);
    frag.append(box);
  }
  els.palette.append(frag);
}

function insertAtCaret(str) {
  const el = els.text;
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  el.value = el.value.slice(0, start) + str + el.value.slice(end);
  const pos = start + str.length;
  el.setSelectionRange(pos, pos);
  el.focus();
  render();
}

function applyMode(src) {
  document.body.classList.toggle('mode-unicode', src === 'unicode');
  els.palette.hidden = src !== 'unicode';
  els.text.setAttribute('placeholder', src === 'unicode' ? 'ᚆᚕᚒᚉ' : 'meitheal');
}

/* Main render */
function render() {
  const raw = els.text.value;
  const s = readSettings();
  const usingPlaceholder = raw.trim() === '' && s.src === 'latin';
  const text = usingPlaceholder ? 'meitheal' : raw;

  const result = s.src === 'unicode'
    ? parseOgham(text)
    : transliterate(text, { ng: s.ng, hLenition: s.h, pStrategy: s.p });
  const glyphs = flattenGlyphs(result);

  showPlaceholderNote(usingPlaceholder);
  showWarning(result.ignored);
  showLenition(result.notes);

  els.drawing.dataset.colourway = s.c;
  const geom = layout(result, {
    orientation: orientationOf(s.o), wordSep: s.w, feather: s.f, strokeWeight: s.wt, tradition: s.tr,
  });

  if (!geom.primitives.length) {
    els.drawing.replaceChildren(Object.assign(document.createElement('p'), {
      className: 'drawing-empty', textContent: 'Add some letters to see the drawing.',
    }));
    els.readout.textContent = '';
    lastRender = null;
  } else {
    const colour = getColourway(s.c);
    const aria = `${text} in ogham: ${glyphs.map((g) => g.value).join(', ')}`;
    const out = renderSVG(geom, { colourway: colour, spacingMm: s.s, background: s.bg, ariaLabel: aria });
    els.drawing.innerHTML = out.svg;
    els.readout.textContent = `${(out.heightMm / 10).toFixed(1)} cm tall, ${(out.widthMm / 10).toFixed(1)} cm wide at ${s.s} mm spacing`;
    lastRender = { svg: out.svg, widthMm: out.widthMm, heightMm: out.heightMm, text, bg: s.bg, canvas: colour.canvas };
  }

  renderBreakdown(glyphs);
}

/* Theme */
function applyTheme(mode) {
  if (mode === 'light' || mode === 'dark') document.documentElement.dataset.theme = mode;
  else delete document.documentElement.dataset.theme;
}
function initTheme() {
  let mode = 'auto';
  try { mode = localStorage.getItem('ogham-theme') || 'auto'; } catch { mode = 'auto'; }
  if (!['auto', 'light', 'dark'].includes(mode)) mode = 'auto';
  setRadio('theme', mode);
  applyTheme(mode);
}
function onThemeChange() {
  const mode = radioVal('theme', 'auto');
  applyTheme(mode);
  try { localStorage.setItem('ogham-theme', mode); } catch { /* storage blocked, ignore */ }
}

/* Export */
function status(message) { els.status.textContent = message; }

function dpiValue() { return parseInt(radioVal('dpi', '300'), 10); }

function downloadSvg() {
  if (!lastRender) { status('Add some letters first.'); return; }
  const blob = new Blob([lastRender.svg], { type: 'image/svg+xml' });
  const name = buildFilename(lastRender.text, lastRender.heightMm / 10, dpiValue(), 'svg');
  downloadBlob(blob, name);
  status(`Saved ${name}`);
}

async function downloadPng() {
  if (!lastRender) { status('Add some letters first.'); return; }
  const dpi = dpiValue();
  // Never hand back a transparent PNG (a stencil needs a solid background). This
  // also covers a crafted share link like ?c=carved&bg=canvas, where the canvas
  // colourway has no fill, so the SVG carries no background rect.
  const noFill = lastRender.bg === 'transparent' || (lastRender.bg === 'canvas' && !lastRender.canvas);
  const pngBg = noFill ? 'white' : 'transparent';
  try {
    const blob = await svgToPng(lastRender.svg, lastRender.widthMm, lastRender.heightMm, dpi, pngBg);
    const name = buildFilename(lastRender.text, lastRender.heightMm / 10, dpi, 'png');
    downloadBlob(blob, name);
    status(`Saved ${name}`);
  } catch {
    status('The PNG could not be made in this browser. The SVG download still works.');
  }
}

async function copySvgToClipboard() {
  if (!lastRender) { status('Add some letters first.'); return; }
  try { await copySvg(lastRender.svg); status('SVG copied to the clipboard.'); }
  catch { status('Copying was blocked. Use Download SVG instead.'); }
}

async function copyLink() {
  const url = `${location.origin}${location.pathname}?${encode(readSettings())}`;
  try { await navigator.clipboard.writeText(url); status('Share link copied.'); }
  catch { status('Copying was blocked by the browser.'); }
}

/* Wiring */
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function wire() {
  const debounced = debounce(render, 60);
  els.text.addEventListener('input', debounced);
  els.size.addEventListener('input', render);

  for (const name of ['o', 'w', 'f', 'p', 'wt', 'bg', 'tr', 'src']) {
    document.querySelectorAll(`input[name="${name}"]`).forEach((el) => el.addEventListener('change', render));
  }
  document.querySelectorAll('input[name="src"]').forEach((el) => el.addEventListener('change', () => applyMode(radioVal('src', DEFAULTS.src))));
  els.ng.addEventListener('change', render);
  els.hKeep.addEventListener('change', render);
  els.colourways.addEventListener('change', onColourwayChange);
  document.querySelectorAll('input[name="theme"]').forEach((el) => el.addEventListener('change', onThemeChange));

  document.getElementById('dl-svg').addEventListener('click', downloadSvg);
  document.getElementById('dl-png').addEventListener('click', downloadPng);
  document.getElementById('copy-svg').addEventListener('click', copySvgToClipboard);
  document.getElementById('copy-link').addEventListener('click', copyLink);
}

/* Init */
function init() {
  const settings = decode(location.search.replace(/^\?/, ''));
  buildColourways(settings.c);
  applySettings(settings);
  initTheme();
  updateProvenance();
  buildPalette();
  applyMode(settings.src);
  wire();
  renderForfeda();
  render();
}

init();
