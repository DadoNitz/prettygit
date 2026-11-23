// prettygit landing: the real style functions render every banner, terminal, README and résumé on this page.
import { STYLES } from '../../src/styles/index.mjs';
import { LABELS } from '../../src/i18n.mjs';
import { SAMPLE, EXTRA, SUMMARY } from './sample.mjs';
import { COPY } from './copy.mjs';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const IDS = ['professional', 'aesthetic', 'direct', 'noir'];
const LANG_KEY = 'prettygit:lang';
const state = { lang: 'en', style: 'professional', profile: SAMPLE, sample: true, stars: 0 };

// Apple-style spring: damping ratio + response. Retargeting keeps the live value and velocity, so it can be interrupted anywhere.
function spring(apply, { response = 0.35, damping = 1, value = 0, eps = 0.001 } = {}) {
  const k = (2 * Math.PI / response) ** 2;
  const c = (4 * Math.PI * damping) / response;
  let x = value, v = 0, to = value, raf = 0, last = 0;
  const tick = (now) => {
    const dt = clamp((now - last) / 1000, 0, 0.05);
    last = now;
    for (let n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n; n > 0; n--) { v += (-k * (x - to) - c * v) * h; x += v * h; }
    if (Math.abs(x - to) < eps && Math.abs(v) < eps * 20) { x = to; v = 0; raf = 0; } else raf = requestAnimationFrame(tick);
    apply(x);
  };
  return {
    set(target, jump = false) {
      to = target;
      if (jump || reduced.matches) { cancelAnimationFrame(raf); raf = 0; x = to; v = 0; apply(x); return; }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    },
  };
}

// ---------- words ----------
const t = (key, ...a) => { const v = COPY[state.lang][key] ?? COPY.en[key]; return typeof v === 'function' ? v(...a) : v; };
const live = Object.assign(document.createElement('p'), { className: 'sr-only' });
live.setAttribute('role', 'status');
document.body.append(live);

function applyLang(lang, save = true) {
  state.lang = lang;
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  document.title = t('meta.title');
  for (const el of $$('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of $$('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) { const [attr, key] = pair.split(':'); el.setAttribute(attr, t(key)); }
  }
  for (const b of $$('[data-lang]')) b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  if (save) try { localStorage.setItem(LANG_KEY, lang); } catch {}
  renderCaptions();
  renderStars();
  renderCommand();
  renderSheets();
}

// ---------- the product, rendered ----------
const extra = () => (state.sample ? { ...EXTRA, summary: SUMMARY[state.lang] } : {});

const svgUrls = {};
function setSvg(img, name, svg) {
  // the SVGs animate themselves; with reduced motion they arrive finished
  if (reduced.matches) svg = svg.replace('</style>', '*{animation:none!important}.l{opacity:1}</style>');
  const old = svgUrls[name];
  svgUrls[name] = img.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  if (old) URL.revokeObjectURL(old);
}

function renderProfile() {
  const p = state.profile;
  const a = STYLES.noir.assets(p, { extra: extra() });
  setSvg($('#banner'), 'noir-banner.svg', a['assets/noir-banner.svg']);
  setSvg($('#term'), 'noir-terminal.svg', a['assets/noir-terminal.svg']);
  for (const el of $$('[data-login]')) el.textContent = p.login;
  const kv = (o) => `{ ${Object.entries(o).map(([k, v]) => `"${k}": ${JSON.stringify(v)}`).join(', ')} }`;
  $('#json-out').textContent = [
    '{',
    `  "login": ${JSON.stringify(p.login)},`,
    `  "name": ${JSON.stringify(p.name)},`,
    `  "location": ${JSON.stringify(p.location)},`,
    `  "since": ${JSON.stringify(p.since)},`,
    `  "languages": [${p.languages.slice(0, 2).map(kv).join(', ')}, …],`,
    `  "repos": [${p.repos.slice(0, 1).map(({ name, language, stars }) => kv({ name, language, stars })).join(', ')}, …]`,
    '}',
  ].join('\n');
  $('#readme-out').textContent = ['README.noir.md', 'assets/noir-banner.svg', 'assets/noir-terminal.svg'].map((f) => `out/${p.login}/${f}`).join('\n');
  $('#resume-out').textContent = `out/${p.login}/resume-aesthetic.html\nout/${p.login}/resume-aesthetic.pdf`;
  renderCaptions();
  renderSheets();
  renderReadmes();
}

function renderCaptions() {
  const p = state.profile;
  $('#banner').alt = t('hero.bannerAlt', p.name);
  $('#banner-cap').textContent = state.sample ? t('hero.caption') : t('hero.captionYou', p.login);
  for (const id of IDS) $(`[data-sheet="${id}"]`).title = t('styles.sheet', id);
}

// Résumés and READMEs are filled only when their section is near, so the first screen loads alone.
const sheets = { dirty: true, near: false };
const readmes = { dirty: true, near: false, gen: 0 };
function renderSheets() {
  sheets.dirty = true;
  if (!sheets.near) return;
  sheets.dirty = false;
  for (const id of IDS) $(`[data-sheet="${id}"]`).srcdoc = onScreen(STYLES[id].resume(state.profile, { extra: extra(), labels: LABELS[state.lang] }));
}
// A screen ignores @page, so the preview borrows the print margins to look like the PDF page.
function onScreen(html) {
  const m = html.match(/@page\s*\{[^}]*margin:\s*([^;}]+)/);
  return m && m[1].trim() !== '0' ? html.replace('</style>', `@media screen{html{padding:${m[1].trim()}}}</style>`) : html;
}
new IntersectionObserver(([e]) => { sheets.near = e.isIntersecting; if (sheets.near && sheets.dirty) renderSheets(); }, { rootMargin: '1200px 0px' }).observe($('#styles'));
// READMEs cost GitHub API calls (60/hour without login) and pull third-party badges: only when the section is close
new IntersectionObserver(([e]) => { readmes.near = e.isIntersecting; if (readmes.near && readmes.dirty) renderReadmes(); }, { rootMargin: '300px 0px' }).observe($('#styles'));

// The README is drawn by GitHub's own renderer, as on a profile page; cached per style and user for the session.
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
async function githubHtml(id, login, text) {
  const key = `prettygit:md:${id}:${login}:${hash(text)}`;
  try { const hit = sessionStorage.getItem(key); if (hit) return hit; } catch {}
  const res = await fetch('https://api.github.com/markdown', {
    method: 'POST',
    headers: { Accept: 'text/html', 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, mode: 'markdown' }), // 'markdown' renders like a README; 'gfm' turns every line break into <br>
  });
  if (!res.ok) throw new Error(`GitHub markdown ${res.status}`);
  const html = await res.text();
  try { sessionStorage.setItem(key, html); } catch {}
  return html;
}
async function renderReadmes() {
  readmes.dirty = true;
  if (!readmes.near) return;
  readmes.dirty = false;
  const gen = ++readmes.gen;
  const p = state.profile;
  for (const id of [state.style, ...IDS.filter((i) => i !== state.style)]) {
    const text = STYLES[id].readme(p, { extra: extra() });
    const box = $(`[data-pane="${id}"] .md`);
    try {
      const html = await githubHtml(id, p.login, text);
      if (gen !== readmes.gen) return;
      box.innerHTML = html; // sanitized by GitHub, as in web/app.mjs
      box.classList.remove('raw');
      // the README's headings belong to the README, not to this page's outline: keep their look, drop the role
      for (const h of box.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
        const d = Object.assign(document.createElement('div'), { className: h.localName });
        if (h.hasAttribute('align')) d.setAttribute('align', h.getAttribute('align'));
        d.append(...h.childNodes);
        h.replaceWith(d);
      }
      for (const img of box.querySelectorAll('img')) {
        const own = svgUrls[img.getAttribute('src')?.split('/').pop()];
        if (own) img.src = own; // ./assets/noir-*.svg are the SVGs drawn on this page
        img.loading = 'lazy';
        img.decoding = 'async';
      }
      for (const a of box.querySelectorAll('a')) { a.tabIndex = -1; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    } catch {
      if (gen !== readmes.gen) return;
      const code = document.createElement('code');
      code.textContent = text; // offline or rate-limited: the Markdown itself, wrapped
      box.replaceChildren(document.createElement('pre'));
      box.firstChild.append(code);
      box.classList.add('raw');
    }
    if (id === state.style) scrubReadme();
  }
}

const paper = $('.paper');
new ResizeObserver(() => paper.style.setProperty('--s', (paper.clientWidth / 794).toFixed(4))).observe(paper);

// ---------- style switcher ----------
const stylesEl = $('#styles');
const seg = $('.seg');
const thumb = $('.seg-thumb');
const thumbX = spring((v) => thumb.style.setProperty('--x', `${v}px`), { response: 0.36, eps: 0.05 });
const thumbW = spring((v) => thumb.style.setProperty('--w', `${v}px`), { response: 0.36, eps: 0.05 });
function moveThumb(jump = false) {
  const label = $('input:checked', seg).parentElement;
  thumbX.set(label.offsetLeft, jump);
  thumbW.set(label.offsetWidth, jump);
}

function renderCommand() {
  $('#style-cmd').textContent = `npx --package=github:DadoNitz/prettygit prettygit resume USER --style ${state.style} --lang ${state.lang}`;
}

function setStyle(id) {
  if (id === state.style) return;
  state.style = id;
  const at = IDS.indexOf(id);
  stylesEl.dataset.style = id;
  stylesEl.dataset.tone = id === 'noir' ? 'dark' : 'light';
  $(`input[value="${id}"]`, seg).checked = true;
  for (const el of $$('[data-pane], [data-sheet]', stylesEl)) {
    const i = IDS.indexOf(el.dataset.pane || el.dataset.sheet);
    el.style.setProperty('--side', i < at ? -1 : 1);
    el.classList.toggle('is-on', i === at);
  }
  $('#style-title').dataset.i18n = `style.${id}.title`;
  $('#style-desc').dataset.i18n = `style.${id}.desc`;
  $('#style-title').textContent = t(`style.${id}.title`);
  $('#style-desc').textContent = t(`style.${id}.desc`);
  $('#sheet-name').textContent = `resume-${id}.pdf`;
  renderCommand();
  moveThumb();
  tone();
}

// ---------- scroll scenes ----------
// A scene's track is (hold + 1) screens tall and its stage sticks; a spring follows the scroll so the
// stage moves with weight and can be reversed at any point. Phones and reduced motion get the finished layout.
const canPin = matchMedia('(min-width: 1081px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)');
const scenes = [];
function scene(section, render) {
  const track = $('.scene-track', section);
  const s = { section, on: false };
  const progress = spring((p) => render(p), { response: 0.22, eps: 0.0004 });
  s.span = () => track.offsetHeight - innerHeight;
  s.top = () => track.getBoundingClientRect().top + scrollY;
  s.update = (jump = false) => { if (s.on) progress.set(clamp((scrollY - s.top()) / s.span()), jump); };
  s.mode = () => {
    s.on = canPin.matches;
    section.style.setProperty('--hold', section.dataset.hold);
    section.classList.toggle('is-live', s.on);
    section.classList.toggle('is-rest', !s.on);
    if (s.on) s.update(true); else render(null);
  };
  scenes.push(s);
  return s;
}

// Styles: four beats, one per style. A click scrolls to that style's beat; beats passed on the way are skipped.
let lock = null;
let readFrac = 0;
const stylesScene = scene(stylesEl, (p) => {
  if (p === null) { readFrac = 0; for (const md of $$('.md', stylesEl)) md.style.transform = ''; return; }
  const u = p * IDS.length;
  const beat = Math.min(IDS.length - 1, Math.floor(u));
  if (lock !== null) { if (beat !== lock) return; lock = null; }
  setStyle(IDS[beat]);
  readFrac = clamp((u - beat - 0.12) / 0.76); // top of the README as the beat opens, its end as it closes
  scrubReadme();
});
// Within a beat the README reads top to bottom with the scroll, so nothing in it is out of reach.
function scrubReadme() {
  if (!stylesScene?.on) return;
  const md = $(`[data-pane="${state.style}"] .md`);
  const view = md.closest('.readme-body').clientHeight;
  md.style.transform = `translate3d(0, ${(-readFrac * Math.max(0, md.offsetHeight - view)).toFixed(1)}px, 0)`;
}
for (const ev of ['wheel', 'touchstart', 'keydown']) addEventListener(ev, () => { lock = null; }, { passive: true });

seg.addEventListener('change', (e) => {
  const at = IDS.indexOf(e.target.value);
  setStyle(e.target.value);
  if (!stylesScene.on) return;
  lock = at;
  scrollTo({ top: stylesScene.top() + ((at + 0.08) / IDS.length) * stylesScene.span(), behavior: 'smooth' });
});

// Profile: the camera moves across the real print, one region per beat.
const STOPS = [[1, 0.5, 0.5], [1.42, 0.5, 0.14], [1.5, 0.8, 0.44], [1.4, 0.5, 0.66], [1.36, 0.42, 0.84]];
const print = $('.print-frame img');
const beats = $$('.beat');
let beatOn = 0;
const smooth = (x) => x * x * (3 - 2 * x);
scene($('#profile'), (p) => {
  if (p === null) { print.style.transform = ''; return; }
  const u = p * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(u));
  const e = smooth(clamp((u - i - 0.2) / 0.6)); // hold still around each stop, travel between them
  const [s0, x0, y0] = STOPS[i];
  const [s1, x1, y1] = STOPS[i + 1];
  const s = lerp(s0, s1, e);
  const W = print.parentElement.clientWidth;
  const H = print.parentElement.clientHeight;
  const tx = clamp(W / 2 - s * lerp(x0, x1, e) * W, W - s * W, 0);
  const ty = clamp(H / 2 - s * lerp(y0, y1, e) * H, H - s * H, 0);
  print.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
  const b = Math.round(i + e);
  if (b !== beatOn) {
    beats[beatOn].classList.remove('is-on');
    for (const [j, el] of beats.entries()) el.classList.toggle('was', j < b);
    beats[b].classList.add('is-on');
    beatOn = b;
  }
});

// Hero: the banner leans toward you as the page starts to move.
const banner = $('.banner-frame');
const termFig = $('.hero-term');
const heroMove = spring((v) => {
  banner.style.transform = v ? `scale(${(1 + v * 0.035).toFixed(4)})` : '';
  termFig.style.transform = v ? `translate3d(0, ${(-v * 32).toFixed(1)}px, 0)` : '';
}, { response: 0.3, eps: 0.0005 });

// Nav material follows the section under it.
const nav = $('.nav');
const toned = $$('main > section');
function tone() {
  const y = nav.offsetHeight / 2;
  const under = toned.find((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
  nav.dataset.tone = under?.dataset.tone === 'dark' ? 'dark' : 'light';
}

let queued = false;
function frame() {
  queued = false;
  for (const s of scenes) s.update();
  if (!reduced.matches) heroMove.set(clamp(scrollY / innerHeight));
  tone();
}
addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
addEventListener('resize', () => { moveThumb(true); for (const s of scenes) s.update(true); tone(); });
const remode = () => { for (const s of scenes) s.mode(); moveThumb(true); };
canPin.addEventListener('change', remode);

// ---------- entrances ----------
if (!reduced.matches) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px' });
  for (const el of $$('[data-reveal]')) {
    const parts = el.matches('h2, p') ? [el] : [...el.children];
    parts.forEach((k, i) => { k.classList.add('r'); k.style.setProperty('--i', i); });
    $$('.bar', el).forEach((b, n) => b.style.setProperty('--n', n));
    io.observe(el);
  }
}

// ---------- controls ----------
for (const b of $$('[data-lang]')) b.addEventListener('click', () => applyLang(b.dataset.lang));

for (const b of $$('[data-copy]')) {
  b.addEventListener('click', async () => {
    const text = $(b.dataset.copy).textContent;
    try {
      await navigator.clipboard.writeText(text);
      b.dataset.i18n = 'copied';
      b.textContent = t('copied');
      b.classList.add('done');
      live.textContent = t('copied');
      clearTimeout(b.timer);
      b.timer = setTimeout(() => { b.dataset.i18n = 'copy'; b.textContent = t('copy'); b.classList.remove('done'); live.textContent = ''; }, 1600);
    } catch {
      getSelection().selectAllChildren($(b.dataset.copy)); // clipboard blocked: leave it selected for Ctrl+C
    }
  });
}

const tryForm = $('#try');
const say = (msg, err = false) => { const s = $('#try-status'); s.textContent = msg; s.classList.toggle('err', err); };
tryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = $('#try-user');
  const login = input.value.trim();
  input.value = login;
  if (!login || !input.checkValidity()) { say(t('styles.bad'), true); input.focus(); return; }
  const btn = $('button', tryForm);
  btn.disabled = true;
  say(t('styles.reading', login));
  try {
    const { fetchProfile } = await import('../../src/profile.mjs');
    state.profile = await fetchProfile(login);
    state.sample = false;
    renderProfile();
    $('#cta-user').value = state.profile.login;
    say(t('styles.showing', state.profile.name));
  } catch (err) {
    say(err.message, true);
  } finally {
    btn.disabled = false;
  }
});

$('#cta-form').addEventListener('submit', (e) => {
  const input = $('#cta-user');
  input.value = input.value.trim();
  if (!input.checkValidity()) { e.preventDefault(); input.reportValidity(); }
});

function renderStars() {
  for (const el of $$('[data-stars]')) el.textContent = state.stars ? t('stars', state.stars) : '';
}
fetch('https://api.github.com/repos/DadoNitz/prettygit', { headers: { Accept: 'application/vnd.github+json' } })
  .then((r) => (r.ok ? r.json() : null))
  .then((d) => { if (d?.stargazers_count > 0) { state.stars = d.stargazers_count; renderStars(); } })
  .catch(() => {});

// ---------- start ----------
let saved = null;
try { saved = localStorage.getItem(LANG_KEY); } catch {}
state.lang = saved === 'pt' ? 'pt' : 'en';
renderProfile();
applyLang(state.lang, false);
remode();
frame();
document.fonts?.ready.then(() => moveThumb(true));
