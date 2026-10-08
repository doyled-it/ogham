// Pure: build the export filename, e.g. meitheal-ogham-17.6cm-300dpi.png
export function buildFilename(text, heightCm, dpi, ext = 'png') {
  const first = String(text).trim().split(/\s+/)[0] || '';
  const slug = first.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'ogham';
  return `${slug}-ogham-${heightCm.toFixed(1)}cm-${dpi}dpi.${ext}`;
}

// Browser: rasterise an SVG string to a PNG blob at a physical size and dpi.
export function svgToPng(svgString, widthMm, heightMm, dpi, background) {
  return new Promise((resolve, reject) => {
    const pxPerMm = dpi / 25.4;
    const w = Math.max(1, Math.round(widthMm * pxPerMm));
    const h = Math.max(1, Math.round(heightMm * pxPerMm));
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (background && background !== 'transparent') {
        ctx.fillStyle = background === 'white' ? '#ffffff' : background;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('svg load failed')); };
    img.src = url;
  });
}

export async function copySvg(svgString) {
  await navigator.clipboard.writeText(svgString);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
