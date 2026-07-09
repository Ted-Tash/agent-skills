---
name: qa-handoff
description: Prepare test data and links for manual QA. Use after implementation or when the user asks to set up data for browser testing.
---

# QA Handoff

Create or identify test data for manual verification and provide localhost links.

## Non-negotiable first response

When this skill is triggered, your first action must be a plain-text reply to the user before running git, Rails commands, database queries, data creation scripts, or browser checks.

The first response should include:

- What feature or behavior you think needs QA.
- The high-level plan: inspect changes, identify needed records, check existing data, create missing data, provide links.
- Any database writes you expect to perform.
- Whether you need clarification.

Keep it short. The purpose is to let the user stop you before database changes happen.

If the requested QA setup is clear, send the plan and proceed. If the feature or data needs are unclear, stop and ask.

## Steps

### 1. Announce the plan

Reply first. Do not inspect, query, or create data before this response.

### 2. Identify what to test

Use the current context and changed files:

```bash
git diff main --stat
git diff main
```

Use `master` instead of `main` if appropriate.

Look for relevant plans, models, controllers, routes, views, jobs, and services.

Determine:

- Pages the user should visit.
- Records that must exist.
- States/roles/edge cases worth testing.
- Any filters or query params that should be preloaded in links.

### 3. Check existing data

Before creating records, inspect existing data:

```bash
dip rails runner "<query to check existing records>"
```

Do not create duplicates if suitable records already exist.

### 4. Create only missing test records

Use `dip rails runner` with a script. Prefer FactoryBot if factories exist in `spec/factories/`; otherwise create records directly.

Rules:

- Add records only. Do not delete or modify existing records unless the user explicitly asks.
- Use realistic names, dates, amounts, and statuses.
- Cover meaningful states and roles.
- Print a summary of created/reused records.

Example pattern:

```bash
dip rails runner '
  alice = User.find_or_create_by!(email: "alice@test.com") do |u|
    u.name = "Alice Johnson"
    u.password = "password"
    u.role = "salesperson"
  end

  puts "Ready: #{alice.email}"
'
```

### 5. Determine local URLs

Find the dev server port from:

- `.dockerdev/compose.yml`.
- `docker-compose.yml`.
- `dip.yml`.
- `Procfile` / `Procfile.dev`.
- Rails default `3000` if no better clue exists.

Build direct links to relevant pages, including filter/query params when useful.

### 6. Include login credentials when needed

Check seeded/dev users if needed:

```bash
dip rails runner "User.where(admin: true).or(User.where(role: 'salesperson')).pluck(:email, :role, :admin)"
```

Mention likely dev password only when you have reason to believe it is `password`.

## Final response format

```markdown
**QA ready!** Here's what I set up and where to test:

**Test data created/reused:**
- ...

**Test in browser:**
- Page name: http://localhost:3000/...

**What to verify:**
- ...

**Login, if needed:**
- Email: ...
- Password: ...
```

## Stop and ask if

- The feature under test is unclear.
- Required data would need modifying or deleting existing records.
- The app/database is not running.
- Factory/direct creation details are uncertain enough to risk bad data.
- The correct login role is unclear.
