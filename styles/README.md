# Style guide

Use the same facts in every style. Match the user's language; never invent achievements.

| Style | Voice | Emojis | Target length |
|---|---|---|---|
| `professional` | Calm, specific, recruiter-focused; clear headings and evidence | None in resume; at most two useful README icons | README 200–350 words; resume 1–2 pages |
| `aesthetic` | Warm and personal; curated projects, airy sections, restrained visual accents | Up to one per README heading; keep resume text clear | README 150–250 words; resume 1–2 pages |
| `direct` | Short sentences, plain lists, facts first; no filler | None | README 80–150 words; aim for a one-page resume |

These are editing targets, not automatic page limits. The CLI creates a starting draft; the agent refines wording and checks the rendered PDF. Keep contact links readable and avoid decorative badges that obscure useful information.

## noir

Black & white, monospace, code-art. README ships two original animated SVGs (`assets/noir-banner.svg`, `assets/noir-terminal.svg`) that must be published next to it. Customize with `--extra`: `headline`, `motto`, `links` [[label, simple-icons slug, url]], `intro`, `about` [], `terminal` [[cmd, output]], `stack` [[name, slug]], `featured` [repo names], `spoken` [], `quote`.
