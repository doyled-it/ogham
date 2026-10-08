# ogham

A small static site that turns typed text into ogham, drawn live as SVG. It produces
correct, scalable geometry you can send to a tattoo artist, a laser cutter, or a page, at a
real physical size. It is a drawing tool, not a font demo, and a transliterator, not a
translator.

Live at `ogham.doyled-it.com`.

## What ogham is

Ogham is an alphabet of strokes cut across a stemline, carved on the edges of standing
stones in Ireland and western Britain from about the 4th to the 6th century, for an early
form of Irish. It has twenty letters in four groups of five (the aicmí), and it is read
from the bottom up.

## The choices made here

This tool transliterates a modern spelling letter for letter. That is a modern convention,
not how the stones spelled anything, but it lets a word survive a round trip.

- **Fadas are not written.** Accented vowels (á é í ó ú) are reduced to a e i o u, because
  ogham did not write vowel length.
- **An h after a consonant is kept by default.** In modern Irish, h after b c d f g m p s t
  marks lenition (bh, ch, dh, and so on), which ogham never wrote, so the stones give no
  guidance. Keeping it as the letter Úath is the letter-for-letter choice; you can switch to
  drop it for a more historical look.
- **k and v are mapped by convention** and marked in the breakdown: k becomes Coll (Irish
  has no k), v and w become Fearn (which originally stood for the w sound).
- **p is written with Pín, a double X across the stem.** The original twenty letters had no
  p. Pín is the sign the stones themselves added for it, cut as an X or double X on the Cool
  East, Crickhowell, and Margam stones (Cool East reduces it to a single X because the
  double form is hard to carve). The earlier Q substitution and the later manuscript letter
  Peith are offered as options. Pín is a different letter from Ébad, the single-X forfid, and
  is drawn as the double X to keep them distinct. p is never silently mapped to b, the one
  option with no historical basis.

### The feather mark

A feather mark is a chevron on the stem at the foot, pointing toward the letters, that marks
where reading begins. There is no closing mark by default: the OG(H)AM project advises
against one for modern use. A closing mark is available as an option.

### Why it is drawn, not typed

Ogham has a Unicode block, but every font draws it differently, most render horizontally
only, and none give control over stroke length, spacing, or physical size. This tool draws
everything as SVG from the geometry, so the output is correct and scales to a real size in
millimetres.

### The ink

The colourways are grounded in real Irish material culture: the pigments of the Book of
Kells, the dyes of early Irish dress, and the gold and oxblood enamel of La Tène metalwork.
The default is Carved, black on white, because that is what a stencil or a laser cutter
needs.

## Corrections to the original brief

Two numbers in the source brief were off, and this build uses the corrected values:

- The word `meitheal` is **21 strokes** (1+4+5+3+1+4+1+2), not 28.
- At 5 mm stroke spacing it is about **17.2 cm** tall, not 16.7 cm.

## Develop

```bash
npm install          # install dev dependencies
npm test             # vitest unit tests (transliterate, geometry, svg, state, export)
npm run test:e2e     # playwright rendering smoke test
npm run dev          # wrangler dev, serves public/ locally
npm run deploy       # wrangler deploy (or push to the GitHub-connected Workers build)
```

The site is pure static files under `public/` (one HTML file, one stylesheet, ES modules
under `public/js/`), served by Cloudflare Workers static assets. There is no server code and
no build step. Settings and a share link live in the URL query; nothing is stored
server-side, and there are no third-party requests, cookies, or analytics.

## Sources

- Ogham, Wikipedia: https://en.wikipedia.org/wiki/Ogham
- OG(H)AM project (Glasgow and Maynooth), "Feather-marks": https://ogham.glasgow.ac.uk/index.php/2024/08/23/feather-marks/
- OG(H)AM project, "The Future of Digital Ogam": https://ogham.glasgow.ac.uk/index.php/2024/04/24/the-future-of-digital-ogam-potential-updates-to-the-unicode-ogham-block-to-facilitate-modern-usage/
- Ogham in 3D, Dublin Institute for Advanced Studies: https://ogham.celt.dias.ie/
- Forfeda, Wikipedia: https://en.wikipedia.org/wiki/Forfeda
- Primitive Irish, Wikipedia: https://en.wikipedia.org/wiki/Primitive_Irish
- Unicode chart, Ogham block (U+1680): https://www.unicode.org/charts/PDF/U1680.pdf

## Licence

Source-available, not OSI open source by design. Use is non-commercial only: the
Commons Clause forbids selling the software or a service whose value is essentially the
software. And it is copyleft: any derivative, including a modified version run as a network
service, must be released under the same terms (AGPL-3.0). See `LICENSE`.
