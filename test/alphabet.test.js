import { test, expect } from 'vitest';
import { FORFEDA } from '../public/js/alphabet.js';

test('FORFEDA lists the six supplementary letters with the fields the reference needs', () => {
  expect(FORFEDA).toHaveLength(6);
  const byId = Object.fromEntries(FORFEDA.map((f) => [f.id, f]));
  expect(Object.keys(byId).sort()).toEqual(
    ['eabhadh', 'eamhancholl', 'ifin', 'or', 'peith', 'uilleann'],
  );
  for (const f of FORFEDA) {
    expect(typeof f.name).toBe('string');
    expect(f.codepoint).toMatch(/^U\+169[5-9A]$/);
    expect(typeof f.group).toBe('string');
    expect(['high', 'uncertain']).toContain(f.confidence);
  }
  // Ifín is the double X, which reuses the existing Pín geometry (group 'p').
  expect(byId.ifin.group).toBe('p');
  // The three flagged shapes are the uncertain ones.
  expect(byId.uilleann.confidence).toBe('uncertain');
  expect(byId.eamhancholl.confidence).toBe('uncertain');
  expect(byId.peith.confidence).toBe('uncertain');
});
