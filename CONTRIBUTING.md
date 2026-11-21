# Contributing

Choose a [team](docs/TEAMS.md), find an unassigned issue, and comment with your plan. Wait for assignment from @DadoNitz to avoid duplicate work. Open an issue first for a new style, skill, or change in CLI behavior.

```sh
git clone https://github.com/DadoNitz/prettygit.git
cd prettygit
git switch -c docs/short-description
npm test
```

Use Node 20 or 22. There are no npm dependencies to install. PDF checks also need Chrome/Edge/Chromium; use `CHROME_PATH` if needed. Use fictional fixtures, never personal `resume.json`, tokens, or generated resumes.

Keep PRs focused. Reuse existing code, preserve CLI flags and profile fields, and add a small regression test for behavior changes. Update examples and docs when contracts change. For skills, include a realistic prompt and the observed result, including the confirmation boundary for remote edits.

Before requesting review: run `npm test`, describe manual checks and limitations, link the issue, and use the PR checklist. CI runs tests on Node 20 and 22. @DadoNitz reviews and merges; team-specific completion criteria are in [TEAMS](docs/TEAMS.md).
