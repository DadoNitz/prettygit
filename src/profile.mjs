// Runs in Node and in the browser: no node: imports here.
async function api(path, tk) {
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: { Accept: 'application/vnd.github+json', ...(tk && { Authorization: `Bearer ${tk}` }) },
  });
  if (res.status === 404) return null;
  if (res.status === 403 || res.status === 429) throw new Error('GitHub rate limit reached (60 requests/hour without login). Try again later.');
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}: ${await res.text()}`);
  return res.json();
}

/** Pure: shapes raw API data into the profile contract used by styles and skills. */
export function shapeProfile(user, rawRepos, readme) {
  const repos = rawRepos
    .filter((r) => !r.fork && !r.archived && r.name !== user.login)
    .map((r) => ({
      name: r.name, description: r.description, url: r.html_url, homepage: r.homepage || null,
      language: r.language, stars: r.stargazers_count, forks: r.forks_count,
      topics: r.topics || [], updated: r.pushed_at,
    }))
    .sort((a, b) => b.stars - a.stars || b.updated.localeCompare(a.updated));
  const counts = {};
  for (const r of repos) if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => ({ name, percent: Math.round((n / total) * 100) }));
  return {
    login: user.login, name: user.name || user.login, bio: user.bio, company: user.company,
    location: user.location, blog: user.blog ? (/^https?:/.test(user.blog) ? user.blog : `https://${user.blog}`) : null,
    email: user.email, twitter: user.twitter_username, avatar: user.avatar_url, url: user.html_url,
    followers: user.followers, publicRepos: user.public_repos, since: user.created_at?.slice(0, 4),
    hireable: !!user.hireable, readme, languages, repos,
    stars: repos.reduce((a, r) => a + r.stars, 0),
  };
}

export async function fetchProfile(login, tk = null) {
  const user = await api(`users/${encodeURIComponent(login)}`, tk);
  if (!user) throw new Error(`GitHub user "${login}" not found`);
  const repos = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await api(`users/${encodeURIComponent(login)}/repos?per_page=100&type=owner&page=${page}`, tk);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  const rm = await api(`repos/${encodeURIComponent(login)}/${encodeURIComponent(login)}/readme`, tk);
  const readme = rm ? new TextDecoder().decode(Uint8Array.from(atob(rm.content), (c) => c.charCodeAt(0))) : null;
  return shapeProfile(user, repos, readme);
}
