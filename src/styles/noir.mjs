import { esc } from '../util.mjs';

// Black & white, monospace, code-art vibe. README ships two original SVGs (banner + animated terminal).
const MONO = "'JetBrains Mono','Fira Code','Courier New',monospace";
const SLUG = { 'C#': 'dotnet', 'C++': 'cplusplus', HTML: 'html5', CSS: 'css', 'Jupyter Notebook': 'jupyter', Shell: 'gnubash' };
const COLORS = 'bg_color=0d0d0d&title_color=ffffff&text_color=bdbdbd&icon_color=ffffff&border_color=2b2b2b';

function badge(label, logo, url) {
  const text = encodeURIComponent(label.replace(/-/g, '--').replace(/_/g, '__'));
  const img = `<img src="https://img.shields.io/badge/${text}-000000?style=for-the-badge&logo=${encodeURIComponent(logo || '')}&logoColor=white" alt="${esc(label)}"/>`;
  return url ? `<a href="${esc(url)}">${img}</a>` : img;
}

function banner(p, x) {
  const code = [
    'def evolve(self):', '  while self.learning:', '    self.build()', '    self.break_things()', '    self.fix()', '  return self.better()',
    'class Developer:', `  stack = ${JSON.stringify(p.languages.slice(0, 2).map((l) => l.name))}`, '  def ship(self):', '    return commit()',
  ];
  const left = code.slice(0, 6).map((l, i) => `<text x="40" y="${70 + i * 26}">${esc(l)}</text>`).join('');
  const right = code.slice(6).map((l, i) => `<text x="860" y="${90 + i * 26}">${esc(l)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 1200 320" width="1200" height="320">
<style>
text{white-space:pre}
.code{font:15px ${MONO};fill:#3a3a3a}
.t{font:700 54px ${MONO};fill:#fff;letter-spacing:10px}
.s{font:18px ${MONO};fill:#9a9a9a;letter-spacing:4px}
.m{font:12px ${MONO};fill:#5c5c5c;letter-spacing:6px}
.orb{fill:none;stroke:#fff;stroke-width:1.2;stroke-dasharray:4 10;animation:spin 40s linear infinite;transform-origin:600px 160px}
.orb2{animation-duration:70s;animation-direction:reverse;opacity:.45}
.cur{animation:blink 1s steps(1) infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes blink{50%{opacity:0}}
</style>
<rect width="1200" height="320" fill="#000"/>
<g class="code">${left}${right}</g>
<ellipse class="orb" cx="600" cy="160" rx="330" ry="70" opacity=".6"/>
<ellipse class="orb orb2" cx="600" cy="160" rx="420" ry="110"/>
<rect x="330" y="105" width="540" height="120" fill="#000" opacity=".85"/>
<text class="t" x="600" y="168" text-anchor="middle">${esc(p.name.toUpperCase())}</text>
<text class="s" x="600" y="208" text-anchor="middle">&lt; ${esc(x.headline || 'developer')} /&gt;<tspan class="cur">_</tspan></text>
<text class="m" x="600" y="296" text-anchor="middle">${esc(x.motto || 'BUILD. BREAK. EVOLVE.')}</text>
<rect x=".5" y=".5" width="1199" height="319" fill="none" stroke="#2b2b2b"/>
</svg>`;
}

function terminal(p, x) {
  const lines = x.terminal || [
    ['whoami', `${p.name} — ${x.headline || 'developer'}`],
    ['cat stack.txt', p.languages.slice(0, 5).map((l) => l.name.toLowerCase()).join(' · ')],
    ['pwd', p.location || 'earth'],
  ];
  let y = 62;
  let t = 0.3;
  const rows = lines.map(([cmd, out]) => {
    const r = `<text class="l" style="animation-delay:${t.toFixed(1)}s" x="22" y="${y}"><tspan fill="#fff">$ </tspan>${esc(cmd)}</text>`
      + `<text class="l o" style="animation-delay:${(t + 0.6).toFixed(1)}s" x="22" y="${y + 22}">${esc(out)}</text>`;
    y += 54;
    t += 1.2;
    return r;
  }).join('\n');
  const h = y + 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 460 ${h}" width="460" height="${h}">
<style>
text{white-space:pre}
.l{font:14px ${MONO};fill:#d9d9d9;opacity:0;animation:in .2s forwards}
.o{fill:#8a8a8a}
.cur{font:14px ${MONO};fill:#fff;animation:blink 1s steps(1) infinite}
@keyframes in{to{opacity:1}}
@keyframes blink{50%{opacity:0}}
</style>
<rect x=".5" y=".5" width="459" height="${h - 1}" rx="8" fill="#000" stroke="#2b2b2b"/>
<circle cx="20" cy="18" r="5" fill="#fff"/><circle cx="38" cy="18" r="5" fill="#777"/><circle cx="56" cy="18" r="5" fill="#333"/>
<text x="230" y="22" text-anchor="middle" style="font:12px ${MONO};fill:#5c5c5c">${esc(p.login)}@github ~</text>
${rows}
<text class="cur" x="22" y="${y}">$ _</text>
</svg>`;
}

function assets(p, { extra = {} } = {}) {
  return { 'assets/noir-banner.svg': banner(p, extra), 'assets/noir-terminal.svg': terminal(p, extra) };
}

function readme(p, { extra: x = {} } = {}) {
  const h = (t) => `<h3 align="center">〔 ${t} 〕</h3>`;
  const stack = x.stack || p.languages.slice(0, 10).map((l) => [l.name, SLUG[l.name] || l.name.toLowerCase()]);
  const links = x.links || (p.blog ? [['Website', 'googlechrome', p.blog]] : []);
  const featured = x.featured
    ? x.featured.map((n) => p.repos.find((r) => r.name === n) || { name: n, url: `https://github.com/${p.login}/${n}` })
    : p.repos.slice(0, 4);
  const u = p.login;
  return `<div align="center">

<img src="./assets/noir-banner.svg" width="100%" alt="${esc(p.name)}"/>

${links.map(([label, logo, url]) => badge(label, logo, url)).join('\n')}

</div>

${h('about me')}

<img align="right" width="44%" src="./assets/noir-terminal.svg" alt="terminal"/>

${x.intro || esc(p.bio || '')}

${(x.about || []).map((a) => `- ${a}`).join('\n')}

<br clear="right"/>

${h('technologies')}

<div align="center">

${stack.map(([name, logo]) => badge(name, logo)).join('\n')}

</div>

${h('featured')}

${featured.map((r) => `- **[${r.name}](${r.url})**${r.homepage ? ` · [live ↗](${r.homepage})` : ''}${r.description ? ` — ${r.description}` : ''}`).join('\n')}

${h('statistics')}

<div align="center">

<img height="165" src="https://github-readme-stats.vercel.app/api?username=${u}&show_icons=true&include_all_commits=true&${COLORS}" alt="stats"/>
<img height="165" src="https://streak-stats.demolab.com?user=${u}&background=0d0d0d&border=2b2b2b&stroke=2b2b2b&ring=ffffff&fire=ffffff&currStreakNum=ffffff&sideNums=ffffff&currStreakLabel=bdbdbd&sideLabels=bdbdbd&dates=6b6b6b" alt="streak"/>

<img width="100%" src="https://github-readme-activity-graph.vercel.app/graph?username=${u}&bg_color=0d0d0d&color=bdbdbd&line=ffffff&point=ffffff&area=true&area_color=ffffff&hide_border=false&border_color=2b2b2b" alt="activity"/>

</div>
${x.spoken ? `\n${h('languages')}\n\n<p align="center"><code>${x.spoken.map(esc).join('</code> · <code>')}</code></p>\n` : ''}
<p align="center"><sub><code>${esc(x.quote || 'while (alive) { learn(); build(); }')}</code></sub></p>
`;
}

function resume(p, { extra = {}, labels: L }) {
  const projects = extra.projects || p.repos.slice(0, 6);
  const skills = extra.skills || p.languages.slice(0, 8).map((l) => l.name);
  const sec = (t, body) => `<h2>${t}</h2>${body}`;
  const items = (arr, f) => (arr || []).map(f).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(p.name)}</title><style>
@page{size:A4;margin:0}body{margin:0;font:10pt/1.5 ${MONO};color:#111}
header{background:#000;color:#fff;padding:14mm 16mm 10mm}header h1{margin:0;font-size:24pt;letter-spacing:6px}
header p{margin:4px 0 0;color:#aaa}main{padding:6mm 16mm}
h2{font-size:10pt;letter-spacing:4px;text-transform:uppercase;border-bottom:1px solid #000;margin:14px 0 6px}
.i{margin:0 0 6px;break-inside:avoid}.m{color:#777}.chips span{display:inline-block;border:1px solid #000;padding:1px 6px;margin:0 4px 4px 0}
a{color:inherit;text-decoration:none}
</style></head><body>
<header><h1>${esc(p.name.toUpperCase())}</h1><p>${[extra.email || p.email, p.blog, p.url, p.location].filter(Boolean).map(esc).join(' · ')}</p></header><main>
${sec(L.summary, `<p>${esc(extra.summary || p.bio || '')}</p>`)}
${extra.experience ? sec(L.experience, items(extra.experience, (e) => `<div class="i"><b>${esc(e.role)}</b> — ${esc(e.company)} <span class="m">${esc(e.period)}</span><div>${esc(e.description)}</div></div>`)) : ''}
${sec(L.projects, items(projects, (r) => `<div class="i"><b><a href="${esc(r.url)}">${esc(r.name)}</a></b> <span class="m">${esc(r.language || '')}</span><div>${esc(r.description || '')}</div></div>`))}
${extra.education ? sec(L.education, items(extra.education, (e) => `<div class="i"><b>${esc(e.course)}</b> — ${esc(e.school)} <span class="m">${esc(e.period)}</span></div>`)) : ''}
${sec(L.skills, `<div class="chips">${items(skills, (s) => `<span>${esc(s)}</span>`)}</div>`)}
</main></body></html>`;
}

export default { id: 'noir', label: 'Preto e branco, monoespaçado, code-art com SVG animado', resume, readme, assets };
