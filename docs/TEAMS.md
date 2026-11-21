# Teams

@DadoNitz is the current owner and reviewer for all four teams. Team handles in CODEOWNERS are commented placeholders until an organization creates them.

| Team | Owner | Scope | Definition of done |
|---|---|---|---|
| Core/CLI | @DadoNitz | `bin/`, `src/github.mjs`, `src/pdf.mjs`; shared `src/` helpers and tests | CLI contracts preserved; regression tests pass on Node 20/22; affected commands checked; PDF changes checked with a real browser |
| Styles | @DadoNitz | `src/styles/`, `styles/README.md` | README and resume render with fictional data; escaping preserved; English/Portuguese labels checked; readable PDF and tests pass |
| Skills/Agent | @DadoNitz | `skills/`, `agents/`, `.claude-plugin/`, `examples/`, `AGENTS.md` | Frontmatter/manifest valid; CLI examples work; interview is factual; remote edits require explicit confirmation; private details stay local |
| Docs/Community | @DadoNitz | `docs/`, root `README.md`, `CONTRIBUTING.md`, `.github/`, license and ignore rules | Instructions match CLI; links/forms checked; no personal data; CI runs `npm test` on both supported versions |

To pick up an issue, choose one in your team's scope, check that it is unassigned, and comment with a brief plan. @DadoNitz assigns it; then create a focused branch and link the issue in your PR. Flag cross-team changes early and request review from each affected scope. Use [CONTRIBUTING](../CONTRIBUTING.md) for the shared workflow.
