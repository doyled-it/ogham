const MARGIN = 6; // units of breathing room around the drawing

function round(n) { return Math.round(n * 100) / 100; }

// Resolve the background fill: explicit 'white'/'transparent', or a colourway canvas.
function backgroundFill(background, colourway) {
  if (background === 'white') return '#ffffff';
  if (background === 'transparent') return null;
  if (background === 'canvas') return colourway.canvas; // may be null
  return null;
}

export function renderSVG(geom, opts) {
  const { bounds, primitives } = geom;
  const colourway = opts.colourway;
  const spacingMm = opts.spacingMm ?? 5;
  const mmPerUnit = 0.5 * (spacingMm / 5);

  const minX = bounds.minX - MARGIN;
  const minY = bounds.minY - MARGIN;
  const wUnits = bounds.maxX - bounds.minX + 2 * MARGIN;
  const hUnits = bounds.maxY - bounds.minY + 2 * MARGIN;
  const widthMm = round(wUnits * mmPerUnit);
  const heightMm = round(hUnits * mmPerUnit);

  const ink = colourway.ink;
  const bg = backgroundFill(opts.background, colourway);
  const aria = opts.ariaLabel ? ` aria-label="${escapeAttr(opts.ariaLabel)}"` : '';

  const body = [];
  if (bg) body.push(`<rect x="${minX}" y="${minY}" width="${wUnits}" height="${hUnits}" fill="${bg}"/>`);
  body.push(`<g fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round">`);
  for (const p of primitives) {
    if (p.kind === 'feather' || p.kind === 'poly') {
      const pts = p.points.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');
      body.push(`<polyline points="${pts}" stroke-width="${p.width}"/>`);
    } else {
      body.push(`<line x1="${round(p.x1)}" y1="${round(p.y1)}" x2="${round(p.x2)}" y2="${round(p.y2)}" stroke-width="${p.width}"/>`);
    }
  }
  body.push('</g>');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${wUnits} ${hUnits}" ` +
    `width="${widthMm}mm" height="${heightMm}mm" role="img"${aria}>` +
    body.join('') +
    '</svg>';

  return { svg, widthMm, heightMm };
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
