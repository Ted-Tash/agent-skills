---
name: get-started
description: Fresh-start workflow: stop containers, update main, install dependencies, migrate, read a GitHub issue, and create a task. Use when the user says /get-started or wants to start fresh from an issue.
---

# Get Started — Fresh Start on an Issue

Prepare the repo from a clean main branch and create a task for a GitHub issue.

## Non-negotiable first response

When this skill is triggered, your first action must be a plain-text reply to the user before running any tool, git command, Docker command, GitHub API call, or task creation.

The first response should include:

- The issue you think the user wants to start, if provided.
- The high-level plan: stop containers, check status, update main, install dependencies, migrate, read issue, create task, then start a brief grill-me planning question.
- Any destructive or branch-changing actions, especially checkout/pull.
- Whether you need clarification.

Keep it short. The purpose is to let the user stop you before branch changes or environment commands run.

If the issue URL/number and repo context are clear, send the plan and proceed. If uncommitted changes exist or the issue is missing, stop and ask.

## Prerequisites

- Docker is running.
- `dip` is available for the project.
- GitHub CLI is authenticated.
- A GitHub issue URL or issue number is available before task creation.

## Steps

### 1. Announce the plan

Reply first. Do not run Docker, git, `gh`, or dependency commands before this response.

### 2. Check for uncommitted work

```bash
git status --short --branch
```

If there are uncommitted changes, stop and ask what to do before switching branches.

### 3. Stop all running containers

```bash
docker ps --format '{{.ID}}' \
  | xargs --no-run-if-empty docker inspect --format '{{ index .Config.Labels "com.docker.compose.project.working_dir"}}' \
  | uniq \
  | xargs --no-run-if-empty -I % sh -c 'cd %; dip down;'
```

If no containers are running, continue.

### 4. Checkout main and pull

```bash
git checkout main
git pull --ff-only
```

If the repo uses `master` instead of `main`, use `master`.

### 5. Install dependencies and migrate

Run sequentially and stop on the first failure:

```bash
dip bundle
dip rails db:migrate
dip yarn
```

### 6. Read the issue

If the user did not provide an issue, ask for one.

```bash
gh issue view <ISSUE_NUMBER> --repo <OWNER>/<REPO> --json title,body,number,url
```

### 7. Create the task

Use the `create_task` tool. Use the issue title as the task title and include the issue URL and body in the description. Let Reins generate the branch name unless the user requested a specific one.

### 8. Start a grill-me planning question

After the task is created, start a brief `grill-me` handoff before implementation begins.

Do not launch into implementation. Ask exactly one tough planning question based on the issue context, then stop and wait for the user.

Good examples:

```text
Before you start building: what assumption in this issue would cause the implementation plan to fail if it turns out to be false?
```

```text
Before implementation: what is the smallest version of this change that would satisfy the issue without overbuilding?
```

```text
Before coding: what edge case or reviewer concern is most likely to make this approach need rework?
```

### 9. Final response

Report:

- Containers stopped.
- Main checked out and pulled.
- Dependency/migration results.
- Task created, including branch/session info if available.
- Issue link.
- The first `grill-me` question.

## Stop and ask if

- There are uncommitted changes.
- The issue is missing or ambiguous.
- `git pull` cannot fast-forward.
- Any dependency or migration command fails.
- Task creation would use an unclear title or repo.
