// The twenty ogham letters, keyed by Latin value.
// group: 'b' (right of stem) | 'h' (left) | 'm' (diagonal) | 'v' (vowel, across).
export const LETTERS = {
  b: { value: 'b', name: 'Beith', group: 'b', strokes: 1 },
  l: { value: 'l', name: 'Luis', group: 'b', strokes: 2 },
  f: { value: 'f', name: 'Fearn', group: 'b', strokes: 3 },
  s: { value: 's', name: 'Sail', group: 'b', strokes: 4 },
  n: { value: 'n', name: 'Nion', group: 'b', strokes: 5 },
  h: { value: 'h', name: 'Úath', group: 'h', strokes: 1 },
  d: { value: 'd', name: 'Dair', group: 'h', strokes: 2 },
  t: { value: 't', name: 'Tinne', group: 'h', strokes: 3 },
  c: { value: 'c', name: 'Coll', group: 'h', strokes: 4 },
  q: { value: 'q', name: 'Ceirt', group: 'h', strokes: 5 },
  m: { value: 'm', name: 'Muin', group: 'm', strokes: 1 },
  g: { value: 'g', name: 'Gort', group: 'm', strokes: 2 },
  ng: { value: 'ng', name: 'nGéadal', group: 'm', strokes: 3 },
  z: { value: 'z', name: 'Straif', group: 'm', strokes: 4 },
  r: { value: 'r', name: 'Ruis', group: 'm', strokes: 5 },
  a: { value: 'a', name: 'Ailm', group: 'v', strokes: 1 },
  o: { value: 'o', name: 'Onn', group: 'v', strokes: 2 },
  u: { value: 'u', name: 'Úr', group: 'v', strokes: 3 },
  e: { value: 'e', name: 'Eadhadh', group: 'v', strokes: 4 },
  i: { value: 'i', name: 'Iodhadh', group: 'v', strokes: 5 },
};

// Letters that carry a later / manuscript value: flag 'convention' in the breakdown.
export const LATER_VALUE = new Set(['ng', 'z', 'h']);

// Vowel-accent stripping (fadas are not written in ogham).
export const ACCENTS = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };

// Single-letter convention mappings (flag 'convention', keep original as source).
export const CONVENTION_MAP = { k: 'c', v: 'f', w: 'f', y: 'i', j: 'i' };

// Consonants that take lenition h in modern Irish (bh ch dh fh gh mh ph sh th).
export const LENITION_CONSONANTS = new Set(['b', 'c', 'd', 'f', 'g', 'm', 'p', 's', 't']);

// Forfeda used for p. Pín (default) is a double-X; Peith is a modified Beith.
// Ceirt reuses LETTERS.q. strokes is null for forms not counted 1..5; the
// breakdown shows strokesLabel instead.
export const PIN = { value: 'p', name: 'Pín', group: 'p', strokes: null, variant: 'pin', strokesLabel: 'double X' };
export const PEITH = { value: 'p', name: 'Peith', group: 'peith', strokes: null, variant: 'peith', strokesLabel: 'soft Beith' };
