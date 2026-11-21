---
name: resume-pdf
description: Interview for verified career details and generate a styled PDF resume from a GitHub profile with prettygit.
---

Ask for username, target role, style, and language. Use [the tone guide](../../styles/README.md) and [the example schema](../../examples/resume.example.json); the example is fictional, not the user's history.

Interview in short rounds: summary and skills; each role's company, period, and factual achievements; each course's school and period. Confirm the final details. Omit unprovided entries or use empty arrays; never invent employers, dates, degrees, or metrics. Collect only details the user wants in the resume.

Save local `resume.json` with `summary` (string), `experience` (objects with `role`, `company`, `period`, `description` strings), `education` (objects with `course`, `school`, `period` strings), and `skills` (strings). Check these types and ensure no example values remain. Do not overwrite an existing file without reviewing it. Keep it out of commits and uploads.

From the prettygit root (or using the plugin's absolute CLI path from the user's workspace):

```sh
node bin/prettygit.mjs fetch USER
node bin/prettygit.mjs resume out/USER/profile.json --style STYLE --extra resume.json --lang en
```

Use `--lang pt` for Portuguese labels; write the actual summary and descriptions in the requested language. Node 20+ and Chrome, Edge, or Chromium are required; set `CHROME_PATH` if detection fails. No browser means HTML may be saved but PDF generation fails: report that accurately.

Review `out/USER/resume-STYLE.html` and `.pdf` for correct facts, readable layout, page breaks, and selectable text. Aim for one page without dropping relevant information. Report paths and any unverified layout; never publish the PDF automatically.
