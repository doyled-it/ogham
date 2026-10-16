var Ogham = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // public/embed/src/element.js
  var element_exports = {};
  __export(element_exports, {
    OghamText: () => OghamText,
    oghamSVG: () => oghamSVG
  });

  // public/js/alphabet.js
  var LETTERS = {
    b: { value: "b", name: "Beith", group: "b", strokes: 1 },
    l: { value: "l", name: "Luis", group: "b", strokes: 2 },
    f: { value: "f", name: "Fearn", group: "b", strokes: 3 },
    s: { value: "s", name: "Sail", group: "b", strokes: 4 },
    n: { value: "n", name: "Nion", group: "b", strokes: 5 },
    h: { value: "h", name: "\xDAath", group: "h", strokes: 1 },
    d: { value: "d", name: "Dair", group: "h", strokes: 2 },
    t: { value: "t", name: "Tinne", group: "h", strokes: 3 },
    c: { value: "c", name: "Coll", group: "h", strokes: 4 },
    q: { value: "q", name: "Ceirt", group: "h", strokes: 5 },
    m: { value: "m", name: "Muin", group: "m", strokes: 1 },
    g: { value: "g", name: "Gort", group: "m", strokes: 2 },
    ng: { value: "ng", name: "nG\xE9adal", group: "m", strokes: 3 },
    z: { value: "z", name: "Straif", group: "m", strokes: 4 },
    r: { value: "r", name: "Ruis", group: "m", strokes: 5 },
    a: { value: "a", name: "Ailm", group: "v", strokes: 1 },
    o: { value: "o", name: "Onn", group: "v", strokes: 2 },
    u: { value: "u", name: "\xDAr", group: "v", strokes: 3 },
    e: { value: "e", name: "Eadhadh", group: "v", strokes: 4 },
    i: { value: "i", name: "Iodhadh", group: "v", strokes: 5 }
  };
  var LATER_VALUE = /* @__PURE__ */ new Set(["ng", "z", "h"]);
  var ACCENTS = { "\xE1": "a", "\xE9": "e", "\xED": "i", "\xF3": "o", "\xFA": "u" };
  var CONVENTION_MAP = { k: "c", v: "f", w: "f", y: "i", j: "i" };
  var LENITION_CONSONANTS = /* @__PURE__ */ new Set(["b", "c", "d", "f", "g", "m", "p", "s", "t"]);
  var PIN = { value: "p", name: "P\xEDn", group: "p", strokes: null, variant: "pin", strokesLabel: "double X" };
  var PEITH = { value: "p", name: "Peith", group: "peith", strokes: null, variant: "peith", strokesLabel: "soft Beith" };
  var FORFEDA = [
    { id: "eabhadh", name: "\xC9abhadh", value: "ea", codepoint: "U+1695", group: "eabhadh", strokesLabel: "single X", confidence: "high" },
    { id: "or", name: "\xD3r", value: "oi", codepoint: "U+1696", group: "or", strokesLabel: "diamond", confidence: "high" },
    { id: "uilleann", name: "Uilleann", value: "ui", codepoint: "U+1697", group: "uilleann", strokesLabel: "elbow", confidence: "uncertain" },
    { id: "ifin", name: "If\xEDn", value: "io", codepoint: "U+1698", group: "p", strokesLabel: "double X", confidence: "high" },
    { id: "eamhancholl", name: "Eamhancholl", value: "ae", codepoint: "U+1699", group: "eamhancholl", strokesLabel: "crosshatch", confidence: "uncertain" },
    { id: "peith", name: "Peith", value: "p", codepoint: "U+169A", group: "peith", strokesLabel: "soft Beith", confidence: "uncertain" }
  ];

  // public/js/transliterate.js
  function glyph(base, { source, flags = [], variant } = {}) {
    return {
      value: base.value,
      name: base.name,
      group: base.group,
      strokes: base.strokes,
      strokesLabel: base.strokesLabel,
      source: source ?? base.value,
      flags,
      variant: variant ?? null
    };
  }
  function stripAccents(ch) {
    return ACCENTS[ch] || ch;
  }
  function word(raw, opts, ignored, notes) {
    const chars = [...raw].map(stripAccents);
    const out = [];
    let prevInput = null;
    for (let i = 0; i < chars.length; i += 1) {
      const ch = chars[i];
      const two = ch + (chars[i + 1] || "");
      if (opts.ng && two === "ng") {
        out.push(glyph(LETTERS.ng, { source: "ng", flags: ["convention"] }));
        i += 1;
        prevInput = "g";
        continue;
      }
      if (two === "qu") {
        out.push(glyph(LETTERS.q, { source: "qu", flags: ["convention"] }));
        i += 1;
        prevInput = "u";
        continue;
      }
      if (ch === "h" && prevInput && LENITION_CONSONANTS.has(prevInput)) {
        if (!notes.includes("lenition")) notes.push("lenition");
        if (opts.hLenition === "drop") {
          prevInput = "h";
          continue;
        }
        out.push(glyph(LETTERS.h, { source: "h", flags: ["convention", "lenition"] }));
        prevInput = "h";
        continue;
      }
      if (ch === "p") {
        if (opts.pStrategy === "ceirt") out.push(glyph(LETTERS.q, { source: "p", flags: ["convention"] }));
        else if (opts.pStrategy === "peith") out.push(glyph(PEITH, { source: "p", flags: ["convention"], variant: "peith" }));
        else out.push(glyph(PIN, { source: "p", flags: ["convention"], variant: "pin" }));
        prevInput = "p";
        continue;
      }
      if (ch === "x") {
        out.push(glyph(LETTERS.c, { source: "x", flags: ["convention"] }));
        out.push(glyph(LETTERS.s, { source: "x", flags: ["convention"] }));
        prevInput = "x";
        continue;
      }
      if (LETTERS[ch]) {
        const flags = LATER_VALUE.has(ch) ? ["convention"] : [];
        out.push(glyph(LETTERS[ch], { source: ch, flags }));
        prevInput = ch;
        continue;
      }
      if (CONVENTION_MAP[ch]) {
        out.push(glyph(LETTERS[CONVENTION_MAP[ch]], { source: ch, flags: ["convention"] }));
        prevInput = ch;
        continue;
      }
      if (/[0-9]/.test(ch)) ignored.push({ char: ch, reason: "digit" });
      else ignored.push({ char: ch, reason: "punctuation" });
    }
    return out;
  }
  function transliterate(text, opts) {
    const o = { ng: true, hLenition: "keep", pStrategy: "pin", ...opts };
    const ignored = [];
    const notes = [];
    const lines = String(text).toLowerCase().split("\n");
    const stems = [];
    for (const line of lines) {
      const rawWords = line.split(/[ \t]+/).filter((w) => w.length > 0);
      const words = rawWords.map((w) => word(w, o, ignored, notes)).filter((g) => g.length > 0);
      if (words.length > 0) stems.push({ words });
    }
    return { stems, ignored, notes };
  }

  // public/js/unicode.js
  var BASE = {
    5761: "b",
    5762: "l",
    5763: "f",
    5764: "s",
    5765: "n",
    5766: "h",
    5767: "d",
    5768: "t",
    5769: "c",
    5770: "q",
    5771: "m",
    5772: "g",
    5773: "ng",
    5774: "z",
    5775: "r",
    5776: "a",
    5777: "o",
    5778: "u",
    5779: "e",
    5780: "i"
  };
  var FORFID_CP = {
    5781: "eabhadh",
    5782: "or",
    5783: "uilleann",
    5784: "ifin",
    5785: "eamhancholl",
    5786: "peith"
  };
  var FORFID_BY_ID = Object.fromEntries(FORFEDA.map((f) => [f.id, f]));
  var VARIANTS = {
    "1687:fe01": { geom: "rabbit-d", strokes: null, name: "Rabbit-eared Dair", value: "d", variant: "rabbit-eared" },
    "1690:fe01": { geom: "angled", strokes: 1, name: "Angled Ailm", value: "a", variant: "angled" },
    "1690:fe02": { geom: "hammerhead", strokes: null, name: "Hammerhead Ailm", value: "a", variant: "hammerhead" },
    "1690:fe03": { geom: "s-ailm", strokes: null, name: "S-shaped Ailm", value: "a", variant: "s-shaped" },
    "1691:fe01": { geom: "angled", strokes: 2, name: "Angled Onn", value: "o", variant: "angled" },
    "1692:fe01": { geom: "angled", strokes: 3, name: "Angled \xDAr", value: "u", variant: "angled" },
    "1693:fe01": { geom: "angled", strokes: 4, name: "Angled Eadhadh", value: "e", variant: "angled" },
    "1694:fe01": { geom: "angled", strokes: 5, name: "Angled Iodhadh", value: "i", variant: "angled" },
    "1694:fe02": { geom: "m", strokes: 5, name: "Diagonal Iodhadh", value: "i", variant: "diagonal" },
    "1695:fe01": { geom: "disjoined-ea", strokes: null, name: "Disjoined \xC9abhadh", value: "ea", variant: "disjoined" },
    "1697:fe01": { geom: "semi-uilleann", strokes: null, name: "Semicircular Uilleann", value: "ui", variant: "semicircular" },
    "1698:fe01": { geom: "x-ifin", strokes: null, name: "X-shaped If\xEDn", value: "p", variant: "x-shaped" }
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
    return { value: v.value, name: v.name, group: v.geom, strokes: v.strokes, strokesLabel: v.variant, source, flags: ["proposed"], variant: v.variant };
  }
  function doubleRGlyph(source) {
    return { value: "rr", name: "Double R", group: "double-r", strokes: null, strokesLabel: "bind", source, flags: ["proposed", "bind"], variant: "double-r" };
  }
  function isBase(cp) {
    return Boolean(BASE[cp] || FORFID_CP[cp]);
  }
  function parseOgham(text) {
    const ignored = [];
    const notes = [];
    const cps = [...String(text)].map((c) => c.codePointAt(0));
    const stems = [];
    let words = [];
    let current = [];
    const flushWord = () => {
      if (current.length) {
        words.push(current);
        current = [];
      }
    };
    const flushStem = () => {
      flushWord();
      if (words.length) {
        stems.push({ words });
      }
      words = [];
    };
    for (let i = 0; i < cps.length; i += 1) {
      const cp = cps[i];
      const next = cps[i + 1];
      if (cp === 10) {
        flushStem();
        continue;
      }
      if (cp === 5760 || cp === 32 || cp === 9) {
        flushWord();
        continue;
      }
      if (cp === 5787 || cp === 5788) {
        if (!notes.includes("feather-input")) notes.push("feather-input");
        continue;
      }
      if (cp === 8205) {
        ignored.push({ char: "\u200D", reason: "joiner" });
        continue;
      }
      if (isBase(cp)) {
        if (cp === 5775 && next === 8205 && cps[i + 2] === 5775) {
          current.push(doubleRGlyph("\u168F\u200D\u168F"));
          i += 2;
          continue;
        }
        if (next >= 65024 && next <= 65027) {
          const sel = next.toString(16);
          if (next === 65024) {
            current.push(baseGlyph(cp, String.fromCodePoint(cp)));
            i += 1;
            continue;
          }
          const key = `${cp.toString(16)}:${sel}`;
          if (VARIANTS[key]) {
            current.push(variantGlyph(VARIANTS[key], String.fromCodePoint(cp, next)));
            i += 1;
            continue;
          }
          if (!notes.includes("selector-ignored")) notes.push("selector-ignored");
          current.push(baseGlyph(cp, String.fromCodePoint(cp)));
          i += 1;
          continue;
        }
        current.push(baseGlyph(cp, String.fromCodePoint(cp)));
        continue;
      }
      ignored.push({ char: String.fromCodePoint(cp), reason: "unknown" });
    }
    flushStem();
    return { stems, ignored, notes };
  }

  // public/js/geometry.js
  var PITCH = 10;
  var LETTER_GAP = 22;
  var WORD_GAP = 60;
  var STEM_GAP = 80;
  var OVERSHOOT = 30;
  var FEATHER_BELOW = 14;
  var FEATHER_HALF_W = 11;
  var FEATHER_H = 12;
  var STROKE_WIDTH = { thin: 3, regular: 4, heavy: 6 };
  function letterStrokes(group, n, y, pitch = PITCH, tradition = "manuscript") {
    const out = [];
    for (let i = 0; i < n; i += 1) {
      const yy = y - i * pitch;
      if (group === "v") out.push(tradition === "monumental" ? [-4, yy, 4, yy] : [-12, yy, 12, yy]);
      else if (group === "h") out.push([-30, yy, 0, yy]);
      else if (group === "b") out.push([0, yy, 30, yy]);
      else if (group === "m") out.push([-15, yy - 11, 15, yy + 11]);
    }
    return out;
  }
  function pinStrokes(y) {
    const x = (yc) => [
      [-12, yc - 10, 12, yc + 10],
      [-12, yc + 10, 12, yc - 10]
    ];
    return [...x(y), ...x(y - 20)];
  }
  function peithStrokes(y) {
    return [
      [6, y, 6, y - 14],
      [12, y, 12, y - 14]
    ];
  }
  function eabhadhStrokes(y) {
    return [
      [-12, y - 10, 12, y + 10],
      [-12, y + 10, 12, y - 10]
    ];
  }
  function orStrokes(y) {
    return [
      [0, y - 13, 13, y],
      [13, y, 0, y + 13],
      [0, y + 13, -13, y],
      [-13, y, 0, y - 13]
    ];
  }
  function uilleannStrokes(y) {
    return [
      [0, y, 20, y],
      [20, y, 20, y - 20],
      [20, y - 20, 6, y - 20]
    ];
  }
  function eamhanchollStrokes(y) {
    return [
      [-10, y - 10, 10, y + 2],
      [-10, y - 2, 10, y + 10],
      [-10, y + 10, 10, y - 2],
      [-10, y + 2, 10, y - 10]
    ];
  }
  var FORFID_STROKES = {
    eabhadh: eabhadhStrokes,
    or: orStrokes,
    uilleann: uilleannStrokes,
    eamhancholl: eamhanchollStrokes
  };
  var FORFID_SPAN = { eabhadh: 0, or: 0, uilleann: 20, eamhancholl: 0 };
  function sampleQuad(p0, c, p1, n) {
    const pts = [];
    for (let k = 0; k <= n; k += 1) {
      const t = k / n, u = 1 - t;
      pts.push([
        u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
        u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]
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
        u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1]
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
  function rabbitDairStrokes(y) {
    return [
      ["poly", sampleQuad([0, y + 2], [-14, y + 6], [-24, y + 14], 6)],
      ["poly", sampleQuad([0, y - 2], [-14, y - 6], [-24, y - 14], 6)]
    ];
  }
  function sAilmStrokes(y) {
    return [["poly", sampleCubic([0, y - 12], [12, y - 6], [-12, y + 6], [0, y + 12], 10)]];
  }
  function semiUilleannStrokes(y) {
    return [["poly", sampleArc(0, y, 14, -Math.PI / 2, Math.PI / 2, 10)]];
  }
  function angledVowelStrokes(n, y) {
    const out = [];
    for (let i = 0; i < n; i += 1) {
      const yy = y - i * PITCH;
      out.push([-12, yy + 5, 0, yy - 5]);
      out.push([0, yy - 5, 12, yy + 5]);
    }
    return out;
  }
  function hammerheadStrokes(y) {
    return [
      [-12, y, 12, y],
      [12, y, 12, y - 10]
    ];
  }
  function disjoinedEabhadhStrokes(y) {
    return [
      [-10, y + 12, 0, y + 2],
      [0, y + 2, 10, y + 12],
      [-10, y - 12, 0, y - 2],
      [0, y - 2, 10, y - 12]
    ];
  }
  function xIfinStrokes(y) {
    return [
      [0, y - 10, 20, y + 10],
      [0, y + 10, 20, y - 10]
    ];
  }
  function doubleRStrokes(y) {
    const out = [];
    for (let i = 0; i < 5; i += 1) {
      const yy = y - i * PITCH;
      out.push([-15, yy - 11, 15, yy + 11]);
      out.push([-15, yy + 11, 15, yy - 11]);
    }
    return out;
  }
  function glyphSpan(glyph2) {
    if (glyph2.group === "p") return 20;
    if (glyph2.group === "peith") return 14;
    if (glyph2.group in FORFID_SPAN) return FORFID_SPAN[glyph2.group];
    if (glyph2.group === "rabbit-d") return 14;
    if (glyph2.group === "s-ailm") return 0;
    if (glyph2.group === "semi-uilleann") return 0;
    if (glyph2.group === "angled") return (glyph2.strokes - 1) * PITCH;
    if (glyph2.group === "hammerhead") return 0;
    if (glyph2.group === "disjoined-ea") return 0;
    if (glyph2.group === "x-ifin") return 0;
    if (glyph2.group === "double-r") return 40;
    return (glyph2.strokes - 1) * PITCH;
  }
  function glyphStrokes(glyph2, y, tradition) {
    if (glyph2.group === "p") return pinStrokes(y);
    if (glyph2.group === "peith") return peithStrokes(y);
    if (FORFID_STROKES[glyph2.group]) return FORFID_STROKES[glyph2.group](y);
    if (glyph2.group === "rabbit-d") return rabbitDairStrokes(y);
    if (glyph2.group === "s-ailm") return sAilmStrokes(y);
    if (glyph2.group === "semi-uilleann") return semiUilleannStrokes(y);
    if (glyph2.group === "angled") return angledVowelStrokes(glyph2.strokes, y);
    if (glyph2.group === "hammerhead") return hammerheadStrokes(y);
    if (glyph2.group === "disjoined-ea") return disjoinedEabhadhStrokes(y);
    if (glyph2.group === "x-ifin") return xIfinStrokes(y);
    if (glyph2.group === "double-r") return doubleRStrokes(y);
    return letterStrokes(glyph2.group, glyph2.strokes, y, PITCH, tradition);
  }
  function layoutStemStrokes(words, weight, wordAdvance, tradition) {
    const width = STROKE_WIDTH[weight];
    const strokes = [];
    const polys = [];
    let cursorY = 0;
    const firstStrokeY = 0;
    let lastStrokeY = 0;
    words.forEach((glyphs, wi) => {
      glyphs.forEach((glyph2, gi) => {
        for (const part of glyphStrokes(glyph2, cursorY, tradition)) {
          if (part[0] === "poly") polys.push({ points: part[1], width });
          else strokes.push([...part, width]);
        }
        lastStrokeY = cursorY - glyphSpan(glyph2);
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
    const wordAdvance = opts.wordSep === "gap" ? WORD_GAP : LETTER_GAP;
    const { strokes, polys, firstStrokeY, lastStrokeY } = layoutStemStrokes(words, opts.strokeWeight, wordAdvance, opts.tradition);
    const prims = [];
    const footY = firstStrokeY + OVERSHOOT;
    const topY = lastStrokeY - OVERSHOOT;
    prims.push({ kind: "stem", x1: offsetX, y1: footY, x2: offsetX, y2: topY, width });
    for (const [x1, y1, x2, y2, w] of strokes) {
      prims.push({ kind: "stroke", x1: x1 + offsetX, y1, x2: x2 + offsetX, y2, width: w });
    }
    for (const p of polys) {
      prims.push({ kind: "poly", points: p.points.map(([x, y]) => [x + offsetX, y]), width: p.width });
    }
    if (opts.feather === "start" || opts.feather === "both") {
      const apexY = firstStrokeY + FEATHER_BELOW;
      prims.push({
        kind: "feather",
        width,
        points: [[offsetX - FEATHER_HALF_W, apexY + FEATHER_H], [offsetX, apexY], [offsetX + FEATHER_HALF_W, apexY + FEATHER_H]]
      });
    }
    if (opts.feather === "both") {
      const apexY = lastStrokeY - FEATHER_BELOW - FEATHER_H;
      prims.push({
        kind: "feather",
        width,
        points: [[offsetX - FEATHER_HALF_W, apexY + FEATHER_H], [offsetX, apexY], [offsetX + FEATHER_HALF_W, apexY + FEATHER_H]]
      });
    }
    return prims;
  }
  function computeBounds(primitives) {
    if (primitives.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const pt = (x, y) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    };
    for (const p of primitives) {
      if (p.kind === "feather" || p.kind === "poly") for (const [x, y] of p.points) pt(x, y);
      else {
        pt(p.x1, p.y1);
        pt(p.x2, p.y2);
      }
    }
    return { minX, minY, maxX, maxY };
  }
  function buildVertical(result, opts) {
    const columns = [];
    if (opts.wordSep === "per-word") {
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
  function layout(result, opts) {
    const o = { orientation: "vertical", wordSep: "gap", feather: "start", strokeWeight: "regular", tradition: "manuscript", ...opts };
    let primitives = buildVertical(result, o);
    if (o.orientation === "horizontal") primitives = rotateCW(primitives);
    return { primitives, bounds: computeBounds(primitives) };
  }
  function rotateCW(primitives) {
    const r = (x, y) => [-y, x];
    return primitives.map((p) => {
      if (p.kind === "feather" || p.kind === "poly") {
        return { ...p, points: p.points.map(([x, y]) => r(x, y)) };
      }
      const [x1, y1] = r(p.x1, p.y1);
      const [x2, y2] = r(p.x2, p.y2);
      return { ...p, x1, y1, x2, y2 };
    });
  }

  // public/js/svg.js
  var MARGIN = 6;
  function round(n) {
    return Math.round(n * 100) / 100;
  }
  function backgroundFill(background, colourway) {
    if (background === "white") return "#ffffff";
    if (background === "transparent") return null;
    if (background === "canvas") return colourway.canvas;
    return null;
  }
  function renderSVG(geom, opts) {
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
    const aria = opts.ariaLabel ? ` aria-label="${escapeAttr(opts.ariaLabel)}"` : "";
    const body = [];
    if (bg) body.push(`<rect x="${minX}" y="${minY}" width="${wUnits}" height="${hUnits}" fill="${bg}"/>`);
    body.push(`<g fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round">`);
    for (const p of primitives) {
      if (p.kind === "feather" || p.kind === "poly") {
        const pts = p.points.map(([x, y]) => `${round(x)},${round(y)}`).join(" ");
        body.push(`<polyline points="${pts}" stroke-width="${p.width}"/>`);
      } else {
        body.push(`<line x1="${round(p.x1)}" y1="${round(p.y1)}" x2="${round(p.x2)}" y2="${round(p.y2)}" stroke-width="${p.width}"/>`);
      }
    }
    body.push("</g>");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${wUnits} ${hUnits}" width="${widthMm}mm" height="${heightMm}mm" role="img"${aria}>` + body.join("") + "</svg>";
    return { svg, widthMm, heightMm };
  }
  function escapeAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  // public/js/colourways.js
  var COLOURWAYS = [
    {
      id: "carved",
      label: "Carved",
      ink: "#000000",
      canvas: null,
      provenance: "Black on white. What a tattoo stencil or laser cutter needs. The default."
    },
    {
      id: "bronze",
      label: "Bronze & Enamel",
      ink: "#c9a24a",
      canvas: "#10201a",
      provenance: "La T\xE8ne metalwork: gold and bronze. The site's own colours."
    },
    {
      id: "orpiment",
      label: "Orpiment",
      ink: "#e3b23c",
      canvas: "#141722",
      provenance: "Orpiment, the gold-sheen yellow (auripigmentum) of the Book of Kells."
    },
    {
      id: "redlead",
      label: "Red Lead",
      ink: "#c8432b",
      canvas: "#f4ecd8",
      provenance: "Red lead (minium), the commonest red in the Book of Kells."
    },
    {
      id: "woad",
      label: "Woad",
      ink: "#35507e",
      canvas: "#f4ecd8",
      provenance: "Woad, the plant-dyed blue of the manuscripts and the dyer\u2019s vat, not lapis."
    },
    {
      id: "verdigris",
      label: "Verdigris",
      ink: "#2f7d6b",
      canvas: "#f4ecd8",
      provenance: "Verdigris, the copper green of the manuscripts. It ate through the vellum; here it is kinder."
    },
    {
      id: "crotal",
      label: "Crotal",
      ink: "#c66a3a",
      canvas: "#efe6cf",
      provenance: "Crotal, the lichen dye of Donegal tweed. The same lichens grow rust-orange on standing stones."
    },
    {
      id: "irongall",
      label: "Iron-Gall",
      ink: "#2b2016",
      canvas: "#f6efdd",
      provenance: "Iron-gall ink, the brown-black the scribes actually wrote with."
    }
  ];
  function getColourway(id) {
    return COLOURWAYS.find((c) => c.id === id) || COLOURWAYS[0];
  }

  // public/embed/src/api.js
  var DEFAULTS = {
    mode: "latin",
    orientation: "vertical",
    words: "gap",
    feather: "start",
    tradition: "manuscript",
    weight: "regular",
    spacing: 5,
    colourway: "carved",
    background: "transparent",
    ng: true,
    h: "keep",
    p: "pin",
    label: null
  };
  function oghamSVG(text, options = {}) {
    const o = { ...DEFAULTS, ...options };
    const str = String(text ?? "");
    const result = o.mode === "unicode" ? parseOgham(str) : transliterate(str, { ng: o.ng, hLenition: o.h, pStrategy: o.p });
    const geom = layout(result, {
      orientation: o.orientation,
      wordSep: o.words,
      feather: o.feather,
      strokeWeight: o.weight,
      tradition: o.tradition
    });
    const spacingNum = Number(o.spacing);
    const spacingMm = Number.isFinite(spacingNum) && spacingNum > 0 ? spacingNum : DEFAULTS.spacing;
    const ariaLabel = o.label || `${str} in ogham`;
    return renderSVG(geom, {
      colourway: getColourway(o.colourway),
      spacingMm,
      background: o.background,
      ariaLabel
    });
  }

  // public/embed/src/element.js
  var ATTRS = ["text", "mode", "orientation", "words", "feather", "tradition", "weight", "spacing", "colourway", "background", "label", "physical"];
  var OPTION_ATTRS = ATTRS.filter((a) => a !== "text" && a !== "physical");
  var OghamText = class extends HTMLElement {
    static get observedAttributes() {
      return ATTRS;
    }
    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      this.draw();
    }
    attributeChangedCallback() {
      if (this.shadowRoot) this.draw();
    }
    draw() {
      const options = {};
      for (const name of OPTION_ATTRS) {
        const v = this.getAttribute(name);
        if (v !== null) options[name] = v;
      }
      try {
        const out = oghamSVG(this.getAttribute("text") || "", options);
        let svg = out.svg;
        if (!this.hasAttribute("physical")) {
          svg = svg.replace(/width="[\d.]+mm"/, 'width="100%"').replace(/ height="[\d.]+mm"/, "");
        }
        this.shadowRoot.innerHTML = svg;
      } catch {
        this.shadowRoot.innerHTML = "";
      }
    }
  };
  if (typeof customElements !== "undefined" && !customElements.get("ogham-text")) {
    customElements.define("ogham-text", OghamText);
  }
  return __toCommonJS(element_exports);
})();
