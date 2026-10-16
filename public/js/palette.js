// The click-to-insert palette for Ogham input mode. Each item inserts a string
// of ogham code points (a base character, a base plus variation selector, or the
// joiner sequence). Grouped for display. "insert" is what lands in the text box.
export const PALETTE = [
  { title: 'Aicme Beithe', items: [
    { label: 'Beith b', insert: 'ᚁ' }, { label: 'Luis l', insert: 'ᚂ' },
    { label: 'Fearn f', insert: 'ᚃ' }, { label: 'Sail s', insert: 'ᚄ' },
    { label: 'Nion n', insert: 'ᚅ' },
  ] },
  { title: 'Aicme hÚatha', items: [
    { label: 'Úath h', insert: 'ᚆ' }, { label: 'Dair d', insert: 'ᚇ' },
    { label: 'Tinne t', insert: 'ᚈ' }, { label: 'Coll c', insert: 'ᚉ' },
    { label: 'Ceirt q', insert: 'ᚊ' },
  ] },
  { title: 'Aicme Muine', items: [
    { label: 'Muin m', insert: 'ᚋ' }, { label: 'Gort g', insert: 'ᚌ' },
    { label: 'nGéadal ng', insert: 'ᚍ' }, { label: 'Straif z', insert: 'ᚎ' },
    { label: 'Ruis r', insert: 'ᚏ' },
  ] },
  { title: 'Aicme Ailme', items: [
    { label: 'Ailm a', insert: 'ᚐ' }, { label: 'Onn o', insert: 'ᚑ' },
    { label: 'Úr u', insert: 'ᚒ' }, { label: 'Eadhadh e', insert: 'ᚓ' },
    { label: 'Iodhadh i', insert: 'ᚔ' },
  ] },
  { title: 'Forfeda', items: [
    { label: 'Éabhadh', insert: 'ᚕ' }, { label: 'Ór', insert: 'ᚖ' },
    { label: 'Uilleann', insert: 'ᚗ' }, { label: 'Ifín', insert: 'ᚘ' },
    { label: 'Eamhancholl', insert: 'ᚙ' }, { label: 'Peith', insert: 'ᚚ' },
  ] },
  { title: 'Marks', items: [
    { label: 'Space', insert: ' ' },
  ] },
  { title: 'Proposed variants', note: 'Andrew West 2016, not encoded in Unicode', items: [
    { label: 'Rabbit-eared Dair', insert: 'ᚇ︁' },
    { label: 'Angled Ailm', insert: 'ᚐ︁' },
    { label: 'Hammerhead Ailm', insert: 'ᚐ︂' },
    { label: 'S-shaped Ailm', insert: 'ᚐ︃' },
    { label: 'Angled Onn', insert: 'ᚑ︁' },
    { label: 'Angled Úr', insert: 'ᚒ︁' },
    { label: 'Angled Eadhadh', insert: 'ᚓ︁' },
    { label: 'Angled Iodhadh', insert: 'ᚔ︁' },
    { label: 'Diagonal Iodhadh', insert: 'ᚔ︂' },
    { label: 'Disjoined Éabhadh', insert: 'ᚕ︁' },
    { label: 'Semicircular Uilleann', insert: 'ᚗ︁' },
    { label: 'X-shaped Ifín', insert: 'ᚘ︁' },
    { label: 'Double R', insert: 'ᚏ‍ᚏ' },
  ] },
];
