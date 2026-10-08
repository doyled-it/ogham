# ogham.doyled-it.com: an ogham transliterator

Brief for Claude Code. Build a small static site that turns typed text into ogham, drawn live as SVG, with vertical and horizontal layouts, word handling, and PNG/SVG export. Host it on Cloudflare Workers at `ogham.doyled-it.com`; deployment follows the existing Workers instructions already on this machine, so do not invent a new deploy path.

## 1. What it is and is not

It is a drawing tool. Ogham is a set of strokes on a stemline, and the point of the site is to produce correct, scalable geometry that can go to a tattoo artist, a laser cutter or a page. It is not a font demo: do not render ogham with Unicode characters or an ogham font. The Unicode block (U+1680 to U+169C) exists, but every font draws it differently (Noto Sans Ogham, for example, draws vowels as lozenges), most fonts render horizontally only, and none give control over stroke length, spacing or physical size. Draw everything as SVG from the geometry in section 5. A "copy as Unicode text" button is optional and low priority; if it is added, it is secondary and off the main path.

It is also a transliterator, not a translator. It maps letters of a typed word to ogham letters by the table in section 4. It does not translate English to Irish or check spelling.

## 2. Pages and layout

One page. Mobile first, works at 360 px wide and at desktop widths. Light and dark via `prefers-color-scheme`. System UI font; no web fonts needed (the ogham is drawn, not typed). No analytics, no cookies, no third-party requests; settings may persist in `localStorage`.

Top to bottom:

1. A large text box. Live preview on every keystroke (debounce about 60 ms). Placeholder: `meitheal`. Multiple words and multiple lines allowed.
2. The drawing: an inline SVG that re-renders from the text and the controls.
3. Controls, as a compact row of toggles and a size field (section 3).
4. A letter-by-letter breakdown under the drawing: for each ogham letter in the output, a small tile with the letter drawn alone, its Latin value, its Irish name and its stroke count, in reading order. This is how a user verifies the output against any chart.
5. Export: Download SVG, Download PNG, Copy SVG. A share link that encodes text and settings in the URL query so a drawing can be sent to someone.
6. An About section: what ogham is in three sentences, how the transliteration works, the conventions chosen and why, the caveats, and the sources (section 8).

## 3. Controls

| Control | Options | Default | Notes |
|---|---|---|---|
| Orientation | vertical, horizontal | vertical | Vertical reads bottom to top. Horizontal reads left to right. See section 5 for the rotation rule. |
| Word separation | gap on one stem, one stem per word, none | gap on one stem | Stones ran words together with no breaks; a bare stretch of stem is the modern convention for a word break (it is what the Unicode "ogham space" is). "One stem per word" lays each word out as its own column (vertical) or row (horizontal), side by side. "None" is the historical look. Line breaks in the input always start a new stem. |
| Feather marks | start only, start and end, none | start only | One opening mark at the start, point toward the letters, sitting on the stem. No closing mark by default: the Glasgow OG(H)AM project advises against it for modern use. |
| ng as one letter | on, off | on | Irish "ng" is the single letter nGéadal. Turn off for English where n and g are separate sounds. |
| h after a consonant | keep, drop | keep | In modern Irish, h after b c d f g m p s t marks lenition (bh, ch, dh, fh, gh, mh, ph, sh, th). Ogham never wrote lenition. Default keeps the h as the letter Úath, a letter-for-letter transliteration of the modern spelling; "drop" removes it for a more historical look. An inline note explains this whenever the input contains one of those pairs. |
| Size | stroke spacing in mm (default 5), or total height in cm | 5 mm | Drives the exported physical size. Everything scales from stroke spacing; see section 5. |
| Stroke weight | thin, regular, heavy | regular | 1.5, 2 and 3 mm lines at 5 mm spacing; scales with spacing. |
| Background | transparent, white | transparent for SVG, white for PNG | |

## 4. Transliteration

Lowercase the input. Strip accents on vowels (á é í ó ú become a e i o u) and remember to mention in the About section that fadas are not written in ogham. Ignore digits and punctuation, but show an unobtrusive warning listing what was ignored. Spaces separate words; newlines separate stems.

Greedy matching, longest first: check `ng` (when the toggle is on), then single letters.

The twenty letters, in the four aicmí. Side is given for the vertical orientation (stem upright, reading bottom to top).

| Aicme | Side | Letters (value: name, strokes) |
|---|---|---|
| Beithe | right of the stem | b: Beith 1 · l: Luis 2 · f: Fearn 3 · s: Sail 4 · n: Nion 5 |
| hÚatha | left of the stem | h: Úath 1 · d: Dair 2 · t: Tinne 3 · c: Coll 4 · q: Ceirt 5 |
| Muine | diagonal across | m: Muin 1 · g: Gort 2 · ng: nGéadal 3 · z: Straif 4 · r: Ruis 5 |
| Ailme | straight across | a: Ailm 1 · o: Onn 2 · u: Úr 3 · e: Eadhadh 4 · i: Iodhadh 5 |

Three of the twenty carry a later value, and the breakdown should mark them with the same small "convention" marker as the mapped letters below: ng (nGéadal's Primitive Irish value was [ɡʷ]; the ng reading is the manuscript tradition's and is what every modern chart uses), z (Straif's original value is uncertain, possibly a sibilant distinct from s; "Z" is the manuscript reading), and h (Úath's original value is unclear, possibly [j]; "H" is the manuscript reading). None of this changes how they are drawn.

Letters not in the alphabet, mapped by convention and flagged with a small "convention" marker in the breakdown so the user knows:

| Input | Output | Why |
|---|---|---|
| k | c (Coll) | Same sound; Irish has no k. |
| v, w | f (Fearn) | Fearn originally stood for /w/; v is the modern Irish spelling of that sound (bh/mh). |
| y | i (Iodhadh) | Nearest vowel. |
| j | i (Iodhadh) | No j in Irish; nearest. |
| x | c + s | Two sounds. |
| qu | q (Ceirt) | Ceirt was /kʷ/. |
| p | Pín, the first forfeda, drawn as a double X across the stem; options: Ceirt (q) or Peith | The original twenty had no p because Proto-Celtic lost the sound. Three strategies are attested, in historical order: the earliest inscriptions wrote Latin p as Q (QRIMITIR for presbyter); a few later stones used the added letter Pín, cut as an X or double X across the stem (Cool East, Crickhowell, Margam); and the manuscript tradition, after it reassigned the forfeda to vowels, invented Peith, a modified Beith with a hook. Default to Pín as a double X (two X's side by side on the stem, each spanning the width of a vowel stroke), flag it, and offer Ceirt and Peith as alternatives in a setting. Never silently map p to b: that is the one option with no historical basis. |

Double letters are written twice (ll is two Luis). Capitals are treated as lowercase.

Worked example, the default placeholder: `meitheal` becomes, bottom to top: m (Muin, 1 diagonal), e (Eadhadh, 4 across), i (Iodhadh, 5 across), t (Tinne, 3 left), h (Úath, 1 left), e (Eadhadh, 4 across), a (Ailm, 1 across), l (Luis, 2 right). Eight letters, 28 strokes. With "h after a consonant" set to drop, it is seven letters with the h removed.

## 5. Geometry

Work in abstract units where the stroke spacing (the distance between adjacent strokes of one letter) is 10 units. At the default size, 10 units = 5 mm, so 1 unit = 0.5 mm. Everything below is in these units; the exporter multiplies by the chosen physical scale.

Vertical layout, stem on x = 0, reading upward (y decreasing in SVG):

- Stem: a straight line, stroke width 4 (regular), round caps. It extends 30 units below the lowest stroke and 30 above the highest.
- Within a letter, strokes are 10 units apart.
- Between letters on one stem, the gap from the last stroke of one letter to the first stroke of the next is 22 units.
- Word gap (when "gap on one stem" is chosen): 60 units of bare stem.
- B group (right): a horizontal line from x = 0 to x = +30.
- H group (left): a horizontal line from x = −30 to x = 0.
- Vowels (across): a horizontal line from x = −12 to x = +12. This is the manuscript form, and the one the sheet uses; on the stones the vowels were short notches cut on the edge itself. Full strokes are the right choice for anything that has to be read on skin or paper; a "notch" style (strokes from x = −5 to x = +5) can be offered later as an option, not now.
- M group (diagonal across): a line from (−15, y − 11) to (+15, y + 11), that is from upper left to lower right with the stem upright. All M strokes in a letter are parallel.
- Feather mark (start): a chevron on the stem at the foot, 14 units below the first stroke, 22 units wide, 12 tall, point toward the letters: path `M −11 (y+12) L 0 y L 11 (y+12)`. The optional closing mark mirrors it at the top, point away from the letters.
- Stroke width: thin 3, regular 4, heavy 6 units, round caps and joins.

Horizontal layout is the vertical drawing rotated 90° clockwise. That single rule gives everything else: reading becomes left to right, the B group hangs below the stem, the H group stands above, vowels cross it straight, and the M diagonal becomes lower left to upper right. Implement it as a transform on the same geometry, not as a second drawing routine, so the two can never disagree.

"One stem per word" places stems side by side (vertical) or stacked (horizontal) with 80 units between them, feet or starts aligned.

Export: SVG with `width` and `height` in mm (computed from units × 0.5 × (spacing / 5)), a `viewBox` in units, black strokes (`#000`), optional white rect background. PNG rendered from the same SVG via canvas at a chosen DPI (default 300; also offer 150 and 600), with the physical size in the filename, for example `meitheal-ogham-16.7cm-300dpi.png`. "Copy SVG" puts the SVG markup on the clipboard.

A reference for one letter in JavaScript, to pin the conventions:

```js
// group: 'b' | 'h' | 'm' | 'v'   n: 1..5   y: SVG y of the first (lowest) stroke, stem at x = 0
function letterStrokes(group, n, y, pitch = 10) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const yy = y - i * pitch;
    if (group === 'v') out.push([-12, yy, 12, yy]);
    else if (group === 'h') out.push([-30, yy, 0, yy]);
    else if (group === 'b') out.push([0, yy, 30, yy]);
    else out.push([-15, yy - 11, 15, yy + 11]);   // 'm', upper left to lower right
  }
  return out;  // [x1, y1, x2, y2] in units
}
```

## 6. Tests

Unit tests (node's built-in test runner or Vitest, whichever the repo already uses) for the transliterator and the geometry; no browser needed for these.

- `meitheal` produces exactly the eight-letter sequence in section 4 with the default settings, and seven letters with lenition-h dropped.
- `Sláinte` strips the fada and produces s l a i n t e.
- `teanga` with ng on produces t e a ng a (five letters); with ng off, six.
- `ollamh` with lenition-h dropped produces o l l a m; with keep, o l l a m h.
- `Kerry` produces c e r r i (k and y by convention, flagged).
- `Pádraig` strips the fada and produces p a d r a i g with p drawn as Pín and flagged; with the p setting on Ceirt it produces q a d r a i g.
- Spaces produce a word gap of 60 units in gap mode and separate stems in per-word mode; a newline always starts a new stem.
- Digits and punctuation are dropped and reported.
- Horizontal geometry equals vertical geometry rotated 90° clockwise, checked numerically on `meitheal`.
- Exported SVG for `meitheal` at 5 mm spacing is about 16.7 cm tall (eight letters, 28 strokes, seven gaps of 22 units, 30 units overshoot each end, plus the mark). Assert within 2 mm.

One rendering smoke test in Playwright: type `meitheal`, screenshot the SVG, compare against a stored reference image at a loose threshold.

## 7. Technical shape

- Static: `index.html`, one CSS file, one JS module. No framework needed; use one only if the existing repo conventions call for it.
- Cloudflare Workers with static assets, following the existing instructions on this machine. No server code. Custom domain `ogham.doyled-it.com`.
- Security headers via the Worker or `_headers`: `Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self'`, no inline scripts (use the module file), `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`.
- Share links put state in the query string only (`?t=meitheal&o=v&w=gap&f=start&ng=1&h=keep&s=5`), nothing server-side.
- Accessible: the SVG has `role="img"` and an `aria-label` that reads the transliteration back ("meitheal in ogham: m, e, i, t, h, e, a, l"); controls are real buttons and inputs with labels; everything works from the keyboard; focus is visible.
- Licence: MIT. Repo README repeats the About section.

## 8. About section and sources

The About section should say, briefly: ogham is an alphabet of strokes on a line, cut on the edges of standing stones in Ireland and western Britain from about the 4th to the 6th century, for an early form of Irish; twenty letters in four groups of five; read from the bottom up. Then the conventions: this tool transliterates modern spellings letter for letter, which is a modern convention rather than how the stones spelled anything; fadas are not written; h after a consonant is kept by default because the stones never wrote lenition and so give no guidance, and the letter-for-letter choice lets the word survive a round trip; k and v are mapped by convention and marked; p is written with Pín, the letter the stones themselves added for it, with the earlier Q substitution and the later Peith available as options. Then the feather-mark note and why there is no closing mark. Then why the drawing is SVG and not a font.

Sources to link:

- Ogham, Wikipedia: https://en.wikipedia.org/wiki/Ogham (the letter table, sides, reading direction, dating)
- OG(H)AM project, University of Glasgow and Maynooth University, "Feather-marks": https://ogham.glasgow.ac.uk/index.php/2024/08/23/feather-marks/ (the start mark, and the advice against a closing mark)
- OG(H)AM project, "The Future of Digital Ogam": https://ogham.glasgow.ac.uk/index.php/2024/04/24/the-future-of-digital-ogam-potential-updates-to-the-unicode-ogham-block-to-facilitate-modern-usage/ (direction of writing on stones versus the Unicode guideline)
- Ogham in 3D, Dublin Institute for Advanced Studies: https://ogham.celt.dias.ie/ (3D scans of the stones)
- Forfeda, Wikipedia: https://en.wikipedia.org/wiki/Forfeda (the added letters, Pín and Peith, and the three stones with p)
- Primitive Irish, Wikipedia: https://en.wikipedia.org/wiki/Primitive_Irish (why there was no p, and QRIMITIR for presbyter)
- Unicode chart, Ogham block: https://www.unicode.org/charts/PDF/U1680.pdf (for the record, and to explain what the site deliberately does not use; the reference glyphs for Pín/Ifín ᚘ and Peith ᚚ are here)

## 9. Acceptance

- Typing `meitheal` with defaults shows the eight-letter vertical column with one feather mark at the foot, and the breakdown lists Muin, Eadhadh, Iodhadh, Tinne, Úath, Eadhadh, Ailm, Luis in that order.
- Switching to horizontal shows the same word left to right with B strokes below and H strokes above the stem.
- `two words` renders as one stem with a bare gap, as two stems side by side, or as one unbroken run, depending on the word-separation setting.
- Download SVG opens in a vector editor at the stated physical size; Download PNG is the same drawing at the chosen DPI.
- The page passes the tests in section 6, loads with no third-party requests, and works on a phone.
