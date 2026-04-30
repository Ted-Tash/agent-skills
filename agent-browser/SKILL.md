---
name: agent-browser
description: Take screenshots of the running dev app using Playwright. Use when you need to capture UI state for PR descriptions or visual verification.
---

# Agent Browser

Automate a headless Chromium browser to take screenshots of the local dev app.

## When to use

- Capturing screenshots for pull request descriptions
- Visually verifying UI changes
- Documenting before/after states of a feature

## Prerequisites

- Dev stack must be running
- Playwright installed (`npx playwright` available, with chromium: `npx playwright install chromium`)
- Node.js available

## Taking screenshots

Run the screenshot script with a JSON config:

```bash
node ~/.agents/skills/agent-browser/scripts/screenshot.js '<json_config>'
```

### Config format

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

### Config fields

| Field | Required | Description |
|---|---|---|
| `baseUrl` | yes | Base URL of the dev server |
| `login` | no | Login config (omit to skip auth) |
| `login.url` | no | Login page path (default: `/users/sign_in`) |
| `login.emailField` | no | Email input name attribute (default: `user[email]`) |
| `login.passwordField` | no | Password input name attribute (default: `user[password]`) |
| `login.email` | yes (if login) | Login email |
| `login.password` | yes (if login) | Login password |
| `screenshots` | yes | Array of pages to screenshot |
| `screenshots[].name` | yes | Filename (without extension) |
| `screenshots[].path` | yes | URL path to navigate to |
| `screenshots[].waitFor` | no | CSS selector to wait for before screenshotting |
| `screenshots[].actions` | no | Array of actions to perform before screenshotting |
| `screenshots[].fullPage` | no | Capture full page (default: true) |
| `outputDir` | no | Directory for screenshots (default: `tmp/screenshots`) |

### Available actions

- `{ "click": "selector" }` — click an element
- `{ "fill": ["selector", "value"] }` — type into an input
- `{ "wait": milliseconds }` — wait a fixed duration
- `{ "select": ["selector", "value"] }` — select an option
- `{ "hover": "selector" }` — hover over an element
- `{ "screenshot": "name" }` — take an intermediate screenshot
- `{ "waitForSelector": "selector" }` — wait for an element to appear
- `{ "type": ["selector", "value"] }` — type with keystrokes (useful for searchable inputs)

### Example

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

Screenshots are saved to `tmp/screenshots/` as PNG files.

## Notes

- The script runs headless Chromium — no display needed
- Viewport is 1280x800 by default
- Login is performed once, cookies persist for all screenshots in the run
- Use `waitFor` to ensure dynamic content has loaded before capturing
- The login config is generic — adjust field names for non-Devise apps
