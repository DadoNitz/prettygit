import professional from './professional.mjs';
import aesthetic from './aesthetic.mjs';
import direct from './direct.mjs';

// To add a style: create src/styles/<id>.mjs with { id, label, resume, readme } and list it here.
export const STYLES = Object.fromEntries([professional, aesthetic, direct].map((s) => [s.id, s]));

export function getStyle(id) {
  const s = STYLES[id];
  if (!s) throw new Error(`Unknown style "${id}". Available: ${Object.keys(STYLES).join(', ')}`);
  return s;
}
