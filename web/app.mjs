import { fetchProfile } from '../src/profile.mjs';
import { STYLES, getStyle } from '../src/styles/index.mjs';
import { LABELS } from '../src/i18n.mjs';

const $ = (id) => document.getElementById(id);
const state = { profile: null, extra: {}, readme: '', assets: {} };
const KEY = 'prettygit:anthropic-key';

for (const s of Object.values(STYLES)) $('style').add(Object.assign(new Option(s.id, s.id), { title: s.label }));
$('style').value = 'noir';
if (localStorage.getItem(KEY)) { $('key').value = localStorage.getItem(KEY); $('remember').checked = true; }

const say = (msg, err = false) => { $('status').textContent = msg; $('status').className = err ? 'err' : ''; };
const busy = (on) => { $('go').disabled = on; $('improve').disabled = on || !state.profile; };

// GitHub renders the Markdown exactly like the profile page; local SVG assets are swapped in afterwards.
async function renderMarkdown(md) {
  const res = await fetch('https://api.github.com/markdown', {
    method: 'POST',
    headers: { Accept: 'text/html', 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: md, mode: 'markdown' }),
  });
  if (!res.ok) throw new Error(`GitHub markdown ${res.status}`);
  $('md').innerHTML = await res.text(); // sanitized by GitHub
  for (const img of $('md').querySelectorAll('img')) {
    const file = Object.keys(state.assets).find((p) => img.getAttribute('src')?.endsWith(p.split('/').pop()));
    if (file) img.src = URL.createObjectURL(new Blob([state.assets[file]], { type: 'image/svg+xml' }));
  }
}

async function render() {
  const style = getStyle($('style').value);
  const { profile, extra } = state;
  state.readme = style.readme(profile, { extra });
  state.assets = style.assets?.(profile, { extra }) || {};
  $('src').value = state.readme;
  $('cv').srcdoc = style.resume(profile, { extra, labels: LABELS[$('lang').value] });
  $('out').classList.add('on');
  await renderMarkdown(state.readme);
}

$('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  busy(true);
  say('buscando seu perfil no GitHub...');
  try {
    state.profile = await fetchProfile($('user').value.trim());
    state.extra = {};
    await render();
    say(`${state.profile.name}: ${state.profile.repos.length} repositórios lidos.`);
  } catch (err) {
    say(err.message, true);
  } finally {
    busy(false);
  }
});

for (const id of ['style', 'lang']) $(id).addEventListener('change', () => state.profile && render().catch((e) => say(e.message, true)));
$('key').addEventListener('input', () => busy(false));

$('improve').addEventListener('click', async () => {
  const key = $('key').value.trim();
  if (!key) return say('Cole sua chave da Anthropic primeiro.', true);
  if ($('remember').checked) localStorage.setItem(KEY, key); else localStorage.removeItem(KEY);
  busy(true);
  say('o Claude está reescrevendo seus textos (uns 20-60 s)...');
  try {
    const { improve } = await import('./ai.mjs');
    state.extra = await improve(key, state.profile, $('style').value, $('lang').value);
    await render();
    say('textos melhorados. Confira antes de publicar.');
  } catch (err) {
    say(err.status === 401 ? 'IA: chave da Anthropic inválida.' : err.status === 429 ? 'IA: limite de uso da sua chave atingido, tente em instantes.' : `IA: ${err.message}`, true);
  } finally {
    busy(false);
  }
});

$('remember').addEventListener('change', () => { if (!$('remember').checked) localStorage.removeItem(KEY); });

// /app?u=USER (from the landing page) opens straight on that profile; the form's pattern still validates it.
const u = new URLSearchParams(location.search).get('u');
if (u) { $('user').value = u; $('f').requestSubmit(); }

$('copy').addEventListener('click', async () => {
  await navigator.clipboard.writeText(state.readme);
  say('Markdown copiado. Cole no README.md do repositório com o seu nome de usuário.');
});

function download(name, text, type) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type })), download: name });
  a.click();
  URL.revokeObjectURL(a.href);
}

$('dl').addEventListener('click', () => {
  download('README.md', state.readme, 'text/markdown');
  for (const [path, svg] of Object.entries(state.assets)) download(path.split('/').pop(), svg, 'image/svg+xml');
  if (Object.keys(state.assets).length) say('Coloque os .svg numa pasta assets/ ao lado do README.md.');
});

$('pdf').addEventListener('click', () => $('cv').contentWindow.print());

const tabs = [...document.querySelectorAll('[role=tab]')];
for (const t of tabs) {
  t.addEventListener('click', () => {
    for (const o of tabs) {
      o.setAttribute('aria-selected', String(o === t));
      $(o.getAttribute('aria-controls')).hidden = o !== t;
    }
  });
}
