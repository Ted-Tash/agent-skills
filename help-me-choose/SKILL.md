---
name: help-me-choose
description: Build a visual HTML comparison page to help the user decide between two or more options. Use when the user says /help-me-choose, asks "which should I pick", or needs help deciding between alternatives.
---

# Help Me Choose

Generate a rich, visual HTML comparison page and open it in the browser so the user can see their options side-by-side.

## When to use

- User says `/help-me-choose`
- User is weighing two or more options (libraries, architectures, approaches, tools, etc.)
- User asks "which should I pick?" or "what are the tradeoffs?"

## Step 1 — Gather the options

Identify the options being compared. They come from one of:

1. **Explicit arguments** — the user passed them after the command (e.g., `/help-me-choose Redis vs Memcached`)
2. **Conversation context** — the discussion has surfaced alternatives; extract them
3. **Ask** — if the options aren't clear, ask: "What are the options you're choosing between?"

For each option, identify 4-8 comparison dimensions that matter for the user's context (performance, complexity, cost, learning curve, ecosystem, maintainability, etc.). Tailor the dimensions to what's actually relevant — don't use generic filler.

## Step 2 — Research and analyze

For each option, gather concrete facts. Prefer specifics over vague claims:

- **Quantitative** — benchmarks, bundle sizes, GitHub stars, release cadence, memory usage
- **Qualitative** — developer experience, documentation quality, community support, flexibility
- **Contextual** — how well it fits the user's specific project, stack, and constraints

Score each option on each dimension (1-10 scale) and prepare short, plain-language explanations.

## Step 3 — Generate the HTML page

Write a single self-contained HTML file. No external assets except CDN-hosted libraries.

### Required CDN libraries

```html
<!-- Chart.js for radar/bar charts -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
```

### Tone and language

Write at a **20-year-old reading level** — clear, casual, no jargon without explanation. If you must use a technical term, follow it with a short "(that means...)" aside. Imagine explaining to a smart college student who hasn't seen this specific tech before.

### Required sections in the HTML

1. **Hero header** — the question being answered, styled prominently
2. **TL;DR card** — a 2-3 sentence recommendation up top with a colored highlight for the suggested winner, plus a caveat for when the other option(s) would be better
3. **Options overview** — a card per option with a short description, logo/icon (use emoji if no logo available), and key stats
4. **Radar chart** — a Chart.js radar chart comparing all options across the scored dimensions. Each option gets its own color. This is the centerpiece visual.
5. **Dimension deep-dive** — for each comparison dimension, a section with:
   - A bar chart or visual meter showing relative scores
   - A plain-language paragraph explaining *why* the scores are what they are
   - A concrete example or analogy where helpful
6. **Pros & Cons grid** — a side-by-side grid with green checkmarks for pros and red X marks for cons
7. **Decision flowchart** — a simple text-based or HTML/CSS flowchart: "If you need X, go with A. If you care more about Y, go with B."
8. **Bottom line** — final recommendation with reasoning

### Styling requirements

Use an embedded `<style>` block. The page must be:

- **Dark mode by default** with a light-mode `@media (prefers-color-scheme: light)` override
- **Responsive** — looks good on both desktop and mobile
- **Well-spaced** — generous padding, clear section separation
- **Color-coded** — each option gets a distinct, accessible color used consistently throughout (chart lines, card borders, headers)
- **Typography** — use system font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Max content width of `900px`, centered

### Visual design guidelines

- Cards: rounded corners (12px), subtle border, soft shadow
- Section dividers: subtle horizontal rules or spacing
- Scores: show as colored pill badges (e.g., green for 8+, yellow for 5-7, red for <5)
- Charts: use semi-transparent fills so overlapping areas are visible
- Emoji usage is encouraged for visual scanning (e.g., fast performance, easy to learn, large community)

### HTML template structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Help Me Choose: [Option A] vs [Option B]</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
  <style>
    /* Dark-first design with light mode override */
    /* Color variables per option */
    /* Responsive grid layouts */
    /* Card, badge, chart container styles */
  </style>
</head>
<body>
  <!-- Hero -->
  <!-- TL;DR -->
  <!-- Option cards -->
  <!-- Radar chart canvas -->
  <!-- Dimension sections with bar charts -->
  <!-- Pros/Cons grid -->
  <!-- Decision flowchart -->
  <!-- Bottom line -->

  <script>
    // Chart.js radar + bar chart initialization
  </script>
</body>
</html>
```

## Step 4 — Serve it through the project's local web server

Write the HTML into the project's public directory so the already-running dev server serves it as a static asset. The user clicks a localhost link — no extra servers, no file paths.

1. **Find the public directory in the current project.** Look for whichever exists:
   - `public/` (Rails, most web frameworks)
   - `static/` (Django, Hugo, some Node frameworks)
   - `dist/` or `build/` (frontend SPAs — less common)

   If none exist, fall back to writing to `/tmp/` and mention the file path instead.

2. **Generate a timestamped filename and write the HTML:**
   ```
   help-me-choose-<timestamp>.html
   ```
   Write the file to `<project>/public/help-me-choose-<timestamp>.html` (or whichever public dir was found) using the write tool.

3. **Determine the local dev server port.** Check for clues in order:
   - `Procfile` / `Procfile.dev` (look for port flags like `-p 3000`)
   - `config/puma.rb` (Rails — default 3000)
   - `docker-compose.yml` / `dip.yml` (mapped ports)
   - `package.json` scripts (Node — often 3000, 5173, 8080)
   - Default to **3000** if nothing else is found

4. **Give the user a clickable link:**

   > **Here's your comparison page: http://localhost:3000/help-me-choose-<timestamp>.html**

   Use the actual port discovered in step 3.

5. **Do NOT use `xdg-open` or `open`** — just provide the link. The user will click it.

6. **Gitignore** — these files will already be ignored if the project has `public/` gitignored for generated assets. If not, mention that the user may want to clean it up later or add `public/help-me-choose-*` to `.gitignore`.

## Step 5 — Discuss

After the user has reviewed the page, be ready to:

- Answer follow-up questions about any dimension
- Regenerate the page with updated weights or new options
- Dive deeper into a specific aspect

## Step 6 — Clean up

Once the user has made their decision (they say things like "let's go with A", "option B", "I've decided", etc.):

1. **Ask:** "Want me to delete the comparison page from `public/`?"
2. If they say yes, delete the file:
   ```bash
   rm <project>/public/help-me-choose-<timestamp>.html
   ```
3. Confirm it's gone. Keep it brief — don't make a big deal out of it.

## Important notes

- **Always generate the full HTML in one shot** — don't stream partial HTML to the file
- **Every chart must have a `<canvas>` with a unique ID** — Chart.js needs this
- **Test your Chart.js config mentally** — make sure dataset lengths match label counts
- **Keep the page under ~500 lines of HTML** — concise is better than exhaustive
- **If comparing more than 4 options**, skip the radar chart (it gets unreadable) and use grouped bar charts instead
- **Never invent benchmark numbers** — if you don't know a specific figure, say "generally considered faster" rather than making up a number
