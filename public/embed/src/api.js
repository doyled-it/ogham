import { transliterate } from '../../js/transliterate.js';
import { parseOgham } from '../../js/unicode.js';
import { layout } from '../../js/geometry.js';
import { renderSVG } from '../../js/svg.js';
import { getColourway } from '../../js/colourways.js';

const DEFAULTS = {
  mode: 'latin',
  orientation: 'vertical',
  words: 'gap',
  feather: 'start',
  tradition: 'manuscript',
  weight: 'regular',
  spacing: 5,
  colourway: 'carved',
  background: 'transparent',
  ng: true,
  h: 'keep',
  p: 'pin',
  label: null,
};

// Draw ogham from text and options, reusing the full engine. Returns { svg, widthMm, heightMm }.
export function oghamSVG(text, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const str = String(text ?? '');
  const result = o.mode === 'unicode'
    ? parseOgham(str)
    : transliterate(str, { ng: o.ng, hLenition: o.h, pStrategy: o.p });
  const geom = layout(result, {
    orientation: o.orientation,
    wordSep: o.words,
    feather: o.feather,
    strokeWeight: o.weight,
    tradition: o.tradition,
  });
  const spacingNum = Number(o.spacing);
  const spacingMm = Number.isFinite(spacingNum) && spacingNum > 0 ? spacingNum : DEFAULTS.spacing;
  const ariaLabel = o.label || `${str} in ogham`;
  return renderSVG(geom, {
    colourway: getColourway(o.colourway),
    spacingMm,
    background: o.background,
    ariaLabel,
  });
}

export { DEFAULTS };
