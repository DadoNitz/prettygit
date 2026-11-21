import { esc } from '../util.mjs';

const list = (items, fn) => (items || []).map(fn).join('');
const badge = (n) => `![${n}](https://img.shields.io/badge/${encodeURIComponent(n).replace(/-/g, '--')}-ffb4c8?style=for-the-badge&labelColor=3b2f4a)`;

// Soft pastel two-column resume: tinted sidebar with avatar + chips, serif display type.
function resume(p, { extra = {}, labels: L }) {
  const projects = extra.projects || p.repos.slice(0, 6);
  const skills = extra.skills || p.languages.slice(0, 8).map((l) => l.name);
  const contact = [extra.email || p.email, p.blog, p.url, p.location].filter(Boolean);
  return `<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>${esc(p.name)}</title><style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 10pt/1.5 'Segoe UI', Helvetica, sans-serif; color: #3b2f4a; display: flex; min-height: 297mm; }
aside { width: 72mm; background: linear-gradient(180deg, #f6dfe8, #e4def5); padding: 16mm 8mm; }
main { flex: 1; padding: 16mm 12mm; background: #fffafc; }
.av { width: 38mm; height: 38mm; border-radius: 50%; border: 3px solid #fff; display: block; margin: 0 auto 8mm; object-fit: cover; box-shadow: 0 2px 10px #b79ac755; }
h1 { font: italic 600 26pt Georgia, serif; margin: 0; color: #5b3a6b; line-height: 1.1; }
h2 { font: 600 8.5pt 'Segoe UI', sans-serif; text-transform: uppercase; letter-spacing: .2em; color: #b0679a; margin: 0 0 5px; }
aside h2 { margin-top: 8mm; } main h2 { margin-top: 7mm; border-bottom: 1px solid #ecd3e3; padding-bottom: 3px; }
.tag { color: #7a6a8a; margin: 4px 0 0; }
aside p { margin: 0 0 4px; font-size: 9pt; word-break: break-all; }
.chips { display: flex; flex-wrap: wrap; gap: 4px; } .chips span { background: #fff; color: #7a3f78; border-radius: 99px; padding: 2px 9px; font-size: 8.5pt; box-shadow: 0 1px 3px #b79ac733; }
.item { margin: 0 0 8px; break-inside: avoid; } .item b { color: #5b3a6b; } .meta { color: #a08cae; font-size: 8.5pt; }
a { color: inherit; text-decoration: none; }
</style></head><body>
<aside>
${p.avatar ? `<img class="av" src="${esc(p.avatar)}" alt="">` : ''}
<h2>${L.contact}</h2>${list(contact, (c) => `<p>${esc(c)}</p>`)}
<h2>${L.skills}</h2><div class="chips">${list(skills, (s) => `<span>${esc(s)}</span>`)}</div>
</aside>
<main>
<h1>${esc(p.name)}</h1><p class="tag">@${esc(p.login)}</p>
<h2>${L.summary}</h2><p>${esc(extra.summary || p.bio || '')}</p>
${extra.experience ? `<h2>${L.experience}</h2>${list(extra.experience, (e) => `<div class="item"><b>${esc(e.role)}</b> — ${esc(e.company)} <span class="meta">${esc(e.period)}</span><div>${esc(e.description)}</div></div>`)}` : ''}
<h2>${L.projects}</h2>
${list(projects, (r) => `<div class="item"><b><a href="${esc(r.url)}">${esc(r.name)}</a></b> <span class="meta">${esc(r.language || '')}${r.stars ? ` · ★ ${r.stars}` : ''}</span><div>${esc(r.description || '')}</div></div>`)}
${extra.education ? `<h2>${L.education}</h2>${list(extra.education, (e) => `<div class="item"><b>${esc(e.course)}</b> — ${esc(e.school)} <span class="meta">${esc(e.period)}</span></div>`)}` : ''}
</main></body></html>`;
}

function readme(p) {
  const top = p.repos.slice(0, 4);
  const u = encodeURIComponent(p.login);
  return `<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=180&section=header&text=${encodeURIComponent(p.name)}&fontSize=44&fontColor=ffffff&animation=fadeIn" alt="${p.name}"/>

<p align="center"><i>${p.bio || ''}</i></p>

<p align="center">✨ ${p.location || ''} · 🌐 <a href="${p.blog || p.url}">${p.blog || p.url}</a></p>

## 🛠️ Tech stack
${p.languages.slice(0, 8).map((l) => badge(l.name)).join('\n')}

## 🌸 Featured projects
${top.map((r) => `- **[${r.name}](${r.url})**${r.language ? ` · \`${r.language}\`` : ''}${r.stars ? ` · ⭐ ${r.stars}` : ''}\n  ${r.description || ''}`).join('\n')}

## 📊 GitHub stats
<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=${u}&show_icons=true&theme=graywhite&hide_border=true" alt="stats"/>
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${u}&layout=compact&theme=graywhite&hide_border=true" alt="top langs"/>
</p>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=100&section=footer" alt=""/>
`;
}

export default { id: 'aesthetic', label: 'Visual marcante, paleta suave e coluna lateral', resume, readme };
