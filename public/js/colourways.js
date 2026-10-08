// Each colourway sets the stroke ink and a suggested canvas, with a provenance note.
// Research: Book of Kells pigments (TCD / EXARC), Dyeing in Ancient Ireland
// (Library Ireland), La Tène enamel (Museum Wales). Default is carved (black).
export const COLOURWAYS = [
  { id: 'carved', label: 'Carved', ink: '#000000', canvas: null,
    provenance: 'Black on white. What a tattoo stencil or laser cutter needs. The default.' },
  { id: 'bronze', label: 'Bronze & Enamel', ink: '#c9a24a', canvas: '#10201a',
    provenance: "La Tène metalwork: gold and bronze. The site's own colours." },
  { id: 'orpiment', label: 'Orpiment', ink: '#e3b23c', canvas: '#141722',
    provenance: 'Orpiment, the gold-sheen yellow (auripigmentum) of the Book of Kells.' },
  { id: 'redlead', label: 'Red Lead', ink: '#c8432b', canvas: '#f4ecd8',
    provenance: 'Red lead (minium), the commonest red in the Book of Kells.' },
  { id: 'woad', label: 'Woad', ink: '#35507e', canvas: '#f4ecd8',
    provenance: 'Woad, the plant-dyed blue of the manuscripts and the dyer’s vat, not lapis.' },
  { id: 'verdigris', label: 'Verdigris', ink: '#2f7d6b', canvas: '#f4ecd8',
    provenance: 'Verdigris, the copper green of the manuscripts. It ate through the vellum; here it is kinder.' },
  { id: 'crotal', label: 'Crotal', ink: '#c66a3a', canvas: '#efe6cf',
    provenance: 'Crotal, the lichen dye of Donegal tweed. The same lichens grow rust-orange on standing stones.' },
  { id: 'irongall', label: 'Iron-Gall', ink: '#2b2016', canvas: '#f6efdd',
    provenance: 'Iron-gall ink, the brown-black the scribes actually wrote with.' },
];

export const DEFAULT_COLOURWAY = 'carved';

export function getColourway(id) {
  return COLOURWAYS.find((c) => c.id === id) || COLOURWAYS[0];
}
