---
name: agent-browser
description: Take screenshots of the running dev app using Playwright. Use when you need to capture UI state for PR descriptions or visual verification.
---

# Agent Browser

Automate a headless Chromium browser to capture screenshots of a local dev app.

## Non-negotiable first response

When this skill is triggered, your first action must be a plain-text reply to the user before running any tool, command, browser action, or script.

The first response should include:

- The pages or UI states you think need screenshots.
- The high-level browser plan: login, navigate, interact, capture.
- Any assumptions about local URL, credentials, or app state.
- Whether you need clarification before proceeding.

Keep it short. The purpose is to let the user stop you before browser automation starts.

If the requested screenshot flow is clear and low risk, send the plan and then proceed. If credentials, target pages, or expected state are unclear, stop and ask.

## When to use

- Capturing screenshots for pull request descriptions.
- Visually verifying UI changes.
- Documenting before/after states of a feature.

## Prerequisites

- Dev stack is running.
- Node.js is available.
- Playwright dependencies are installed for this skill.
- The target app URL and login credentials are known, or the page does not require auth.

## Screenshot workflow

1. Announce the screenshot plan first.
2. Confirm or infer:
   - `baseUrl` (usually `http://localhost:3000`).
   - Login route and credentials, if needed.
   - Pages to capture.
   - Interactions needed before capture.
3. Run the screenshot script with a JSON config:

```bash
node ~/.agents/skills/agent-browser/scripts/screenshot.js '<json_config>'
```

If this repo copy is being used directly instead of the installed skill path, run:

```bash
node agent-browser/scripts/screenshot.js '<json_config>'
```

## Config format

```json
{
  "baseUrl": "http://localhost:3000",
  "login": {
    "url": "/users/sign_in",
    "emailField": "user[email]",
    "passwordField": "user[password]",
    "email": "admin@example.com",
    "password": "password"
  },
  "screenshots": [
    {
      "name": "descriptive-name",
      "path": "/sales/new",
      "waitFor": "#some-element",
      "actions": [
        { "click": "#element-selector" },
        { "fill": ["#input-selector", "text to type"] },
        { "wait": 500 },
        { "click": "text=Some Button" }
      ]
    }
  ],
  "outputDir": "tmp/screenshots"
}
```

## Available actions

- `{ "click": "selector" }` — click an element.
- `{ "fill": ["selector", "value"] }` — fill an input.
- `{ "wait": milliseconds }` — wait a fixed duration.
- `{ "select": ["selector", "value"] }` — select an option.
- `{ "hover": "selector" }` — hover over an element.
- `{ "screenshot": "name" }` — take an intermediate screenshot.
- `{ "waitForSelector": "selector" }` — wait for an element.
- `{ "type": ["selector", "value"] }` — type with keystrokes.

## Example

```bash
node ~/.agents/skills/agent-browser/scripts/screenshot.js '{
  "baseUrl": "http://localhost:3000",
  "login": { "email": "admin@example.com", "password": "password" },
  "screenshots": [
    { "name": "sales-form", "path": "/sales/new" },
    { "name": "company-edit", "path": "/companies/1/edit", "waitFor": "form" }
  ]
}'
```

Screenshots are saved to `tmp/screenshots/` by default.

## Stop and ask if

- Login credentials are missing.
- The target page or desired state is ambiguous.
- The app is not running.
- The requested automation would submit, delete, publish, email, charge, or otherwise mutate real data unexpectedly.

## Final response

Report:

- Screenshot files created.
- Any failures and why.
- Any assumptions made.
