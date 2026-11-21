import { esc } from '../util.mjs';

const list = (items, fn) => (items || []).map(fn).join('');

// Clean, serif-headed, ATS-friendly one-column resume.
function resume(p, { extra = {}, labels: L }) {
  const projects = (extra.projects || p.repos.slice(0, 6));
  const skills = extra.skills || p.languages.slice(0, 8).map((l) => l.name);
  const contact = [extra.email || p.email, p.blog, p.url, p.location].filter(Boolean);
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>${esc(p.name)}</title><style>
@page { size: A4; margin: 16mm 18mm; }
body { font: 10.5pt/1.45 'Segoe UI', Helvetica, Arial, sans-serif; color: #1f2933; margin: 0; }
h1 { font: 600 24pt Georgia, serif; margin: 0; }
h2 { font: 600 11pt Georgia, serif; text-transform: uppercase; letter-spacing: .08em; color: #0b4f8a; border-bottom: 1px solid #c7d2de; padding-bottom: 2px; margin: 16px 0 6px; }
.contact { color: #52606d; margin: 4px 0 0; } .contact span + span::before { content: ' · '; }
.item { margin: 0 0 7px; break-inside: avoid; } .item b { color: #102a43; } .meta { color: #7b8794; font-size: 9pt; }
.skills { display: flex; flex-wrap: wrap; gap: 4px 14px; } a { color: inherit; text-decoration: none; }
</style></head><body>
<h1>${esc(p.name)}</h1>
<p class="contact">${contact.map((c) => `<span>${esc(c)}</span>`).join('')}</p>
<h2>${L.summary}</h2><p>${esc(extra.summary || p.bio || '')}</p>
${extra.experience ? `<h2>${L.experience}</h2>${list(extra.experience, (e) => `<div class="item"><b>${esc(e.role)}</b> — ${esc(e.company)} <span class="meta">${esc(e.period)}</span><div>${esc(e.description)}</div></div>`)}` : ''}
<h2>${L.projects}</h2>
${list(projects, (r) => `<div class="item"><b><a href="${esc(r.url)}">${esc(r.name)}</a></b> <span class="meta">${esc(r.language || '')}${r.stars ? ` · ★ ${r.stars}` : ''}</span><div>${esc(r.description || '')}</div></div>`)}
${extra.education ? `<h2>${L.education}</h2>${list(extra.education, (e) => `<div class="item"><b>${esc(e.course)}</b> — ${esc(e.school)} <span class="meta">${esc(e.period)}</span></div>`)}` : ''}
<h2>${L.skills}</h2><div class="skills">${list(skills, (s) => `<span>${esc(s)}</span>`)}</div>
</body></html>`;
}

function readme(p) {
  const top = p.repos.slice(0, 4);
  return `# ${p.name}

${p.bio || ''}

- 📍 ${p.location || '—'}
- 🌐 ${p.blog || p.url}

## Tech stack
${p.languages.slice(0, 8).map((l) => `\`${l.name}\``).join(' ')}

## Featured projects
| Project | Description |
|---|---|
${top.map((r) => `| [${r.name}](${r.url}) | ${(r.description || '').replace(/\|/g, '\|')} |`).join('\n')}

## GitHub stats
![stats](https://github-readme-stats.vercel.app/api?username=${p.login}&show_icons=true&hide_border=true)
`;
}

export default { id: 'professional', label: 'Sóbrio, recrutador-friendly, ATS-safe', resume, readme };
