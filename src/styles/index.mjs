import professional from './professional.mjs';
import aesthetic from './aesthetic.mjs';
import direct from './direct.mjs';
import noir from './noir.mjs';

// To add a style: create src/styles/<id>.mjs with { id, label, resume, readme } (optional assets() -> { path: content }) and list it here.
export const STYLES = Object.fromEntries([professional, aesthetic, direct, noir].map((s) => [s.id, s]));

export function getStyle(id) {
  const s = STYLES[id];
  if (!s) throw new Error(`Unknown style "${id}". Available: ${Object.keys(STYLES).join(', ')}`);
  return s;
}
