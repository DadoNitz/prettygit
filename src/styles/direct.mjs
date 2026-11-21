import { esc } from '../util.mjs';

const list = (items, fn) => (items || []).map(fn).join('');

// Plain monospace, no decoration, fits one A4 page.
function resume(p, { extra = {}, labels: L }) {
  const projects = (extra.projects || p.repos).slice(0, 5);
  const skills = extra.skills || p.languages.slice(0, 8).map((l) => l.name);
  const contact = [extra.email || p.email, p.blog, p.url, p.location].filter(Boolean);
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>${esc(p.name)}</title><style>
@page { size: A4; margin: 14mm 16mm; }
body { font: 9.5pt/1.4 Consolas, 'Courier New', monospace; color: #000; margin: 0; }
h1 { font-size: 14pt; margin: 0; } h2 { font-size: 10pt; margin: 12px 0 3px; text-transform: uppercase; } h2::before { content: '## '; }
p, ul { margin: 0; } ul { padding-left: 16px; } li { margin: 0 0 2px; } a { color: inherit; text-decoration: none; }
</style></head><body>
<h1>${esc(p.name)}</h1>
<p>${contact.map(esc).join(' | ')}</p>
<h2>${L.summary}</h2><p>${esc(extra.summary || p.bio || '')}</p>
${extra.experience ? `<h2>${L.experience}</h2><ul>${list(extra.experience, (e) => `<li>${esc(e.role)} @ ${esc(e.company)} (${esc(e.period)}): ${esc(e.description)}</li>`)}</ul>` : ''}
<h2>${L.projects}</h2><ul>${list(projects, (r) => `<li><a href="${esc(r.url)}">${esc(r.name)}</a>${r.language ? ` [${esc(r.language)}]` : ''}${r.description ? ` - ${esc(r.description)}` : ''}</li>`)}</ul>
${extra.education ? `<h2>${L.education}</h2><ul>${list(extra.education, (e) => `<li>${esc(e.course)} - ${esc(e.school)} (${esc(e.period)})</li>`)}</ul>` : ''}
<h2>${L.skills}</h2><p>${skills.map(esc).join(', ')}</p>
</body></html>`;
}

function readme(p) {
  return `# ${p.name}

- ${p.bio || ''}
- Local: ${p.location || '-'}
- Site: ${p.blog || p.url}
- Stack: ${p.languages.slice(0, 6).map((l) => l.name).join(', ')}
- Projetos: ${p.repos.slice(0, 3).map((r) => `[${r.name}](${r.url})`).join(', ')}
`;
}

export default { id: 'direct', label: 'Minimalista, monoespaçado, 1 página', resume, readme };
