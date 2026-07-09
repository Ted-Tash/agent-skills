---
name: help-me-choose
description: Build a visual HTML comparison page to help the user decide between two or more options. Use when the user says /help-me-choose, asks "which should I pick", or needs help deciding between alternatives.
---

# Help Me Choose

Generate a visual HTML comparison page that helps the user decide between options.

## Non-negotiable first response

When this skill is triggered, your first action must be a plain-text reply to the user before searching, reading files, writing HTML, running commands, or modifying project files.

The first response should include:

- The options you think are being compared.
- The high-level plan: clarify options, compare dimensions, generate a page, provide a localhost/file link.
- Where you expect to write the generated HTML, if known.
- Any missing information.

Keep it short. The purpose is to let the user stop you before generated files are written.

If the options and desired context are clear, send the plan and proceed. If the options are unclear, stop and ask.

## When to use

- User says `/help-me-choose`.
- User is weighing two or more options.
- User asks "which should I pick?" or "what are the tradeoffs?"

## Step 1 — Gather the options

Identify options from:

1. Explicit arguments, such as `/help-me-choose Redis vs Memcached`.
2. Conversation context.
3. A clarification question if the options are not clear.

Choose 4-8 comparison dimensions that matter for the user's actual context. Avoid generic filler.

Examples:

- Performance.
- Complexity.
- Cost.
- Learning curve.
- Ecosystem.
- Maintainability.
- Fit with the existing stack.
- Operational risk.

## Step 2 — Research and analyze

Gather concrete facts when available:

- Quantitative: benchmarks, bundle sizes, release cadence, memory use.
- Qualitative: developer experience, documentation, community, flexibility.
- Contextual: fit with the current repo, team, constraints, and timeline.

Never invent benchmark numbers. If a specific number is unknown, say so and use qualitative wording.

Score each option on each dimension from 1-10 and write short plain-language explanations.

## Step 3 — Generate the HTML page

Write a single self-contained HTML file. No external assets except CDN-hosted libraries.

Required CDN library:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
```

### Tone

Write clearly and casually. Avoid jargon where possible. If a technical term matters, explain it briefly.

### Required sections

1. Hero header — the question being answered.
2. TL;DR card — 2-3 sentence recommendation and caveat.
3. Options overview — one card per option.
4. Radar chart — use for 2-4 options.
5. Dimension deep-dive — score and explanation for each dimension.
6. Pros & cons grid.
7. Decision flowchart.
8. Bottom line.

If comparing more than 4 options, skip radar charts and use grouped bar charts instead.

### Styling requirements

- Embedded `<style>` block.
- Dark mode by default with light-mode `@media (prefers-color-scheme: light)` override.
- Responsive desktop/mobile layout.
- Max content width of `900px`, centered.
- Cards with rounded corners, subtle border, and soft shadow.
- Consistent accessible colors per option.
- System font stack.
- Score badges or visual meters.

### HTML skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Help Me Choose</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <style>
    /* styles */
  </style>
</head>
<body>
  <!-- content -->
  <script>
    // Chart.js setup
  </script>
</body>
</html>
```

## Step 4 — Write and link the page

Prefer writing into the current project's static public directory so the existing dev server can serve it.

Look for, in order:

- `public/`.
- `static/`.
- `dist/` or `build/` only if that is clearly the intended served static directory.

If none exists, write to `/tmp/` and provide the file path instead of a localhost link.

Use a timestamped filename:

```text
help-me-choose-<timestamp>.html
```

Determine local dev server port from:

- `Procfile` / `Procfile.dev`.
- `config/puma.rb`.
- `docker-compose.yml` / `dip.yml`.
- `package.json` scripts.
- Default to `3000` if nothing else is clear.

Do not use `open` or `xdg-open`. Provide a link for the user to click.

Example final link:

```text
http://localhost:3000/help-me-choose-<timestamp>.html
```

If the generated file is not ignored by git, mention that it may need cleanup later.

## Step 5 — Discuss and iterate

After the user reviews the page, answer questions or regenerate with:

- Different weights.
- New options.
- More detail on a specific dimension.
- A different recommendation framing.

## Step 6 — Clean up

When the user has decided, ask:

```text
Want me to delete the comparison page from public/ or the temp directory?
```

Only delete it if they say yes.

## Stop and ask if

- The options are unclear.
- The decision criteria are unclear.
- You would need to write into an unusual or tracked location.
- The comparison depends on facts you cannot verify or responsibly estimate.

## Important notes

- Always generate the full HTML in one write.
- Every Chart.js chart must have a unique `<canvas>` ID.
- Dataset lengths must match label counts.
- Keep the page concise; under about 500 lines is preferred.
- Do not fabricate data.
