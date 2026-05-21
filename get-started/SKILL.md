---
name: get-started
description: Full fresh-start workflow — stop all containers, checkout main, pull, bundle, migrate, yarn, then create a task for a GitHub issue. Use when the user says /get-started or pastes an issue and wants to start fresh.
---

# Get Started — Fresh Start on an Issue

Stop everything, prep main, and kick off a new task for a GitHub issue.

## Trigger

User says "/get-started", "get started", "get-started", or pastes a GitHub issue URL and wants to begin fresh.

## Prerequisites

- A GitHub issue URL (the user will paste it, or it can be passed as an argument)
- Docker is running

## Steps

### 1. Stop all running containers

```bash
docker ps --format '{{.ID}}' \
  | xargs --no-run-if-empty docker inspect --format '{{ index .Config.Labels "com.docker.compose.project.working_dir"}}' \
  | uniq \
  | xargs --no-run-if-empty -I % sh -c 'cd %; dip down;'
```

If no containers are running, that's fine — move on.

### 2. Checkout main and pull

```bash
git checkout main
git pull
```

If there are uncommitted changes on the current branch, warn the user and ask what to do before switching branches.

### 3. Bundle install

```bash
dip bundle
```

### 4. Run migrations

```bash
dip rails db:migrate
```

### 5. Yarn install

```bash
dip yarn
```

### 6. Get the issue

If the user hasn't provided a GitHub issue URL yet, ask for one. Once you have it, read the issue to get its title and body:

```bash
gh issue view <ISSUE_NUMBER> --repo <OWNER>/<REPO> --json title,body,number,url
```

### 7. Create the task

Use the `create_task` tool to create a new task from the issue. Use the issue title as the task title, and include the issue URL and body in the description. Let REINS generate the branch name automatically.

### 8. Done

Print a summary:
- Containers stopped
- Main checked out and pulled
- Dependencies installed
- Migrations run
- Task created (with branch name and issue link)

The user is now ready to start working in the new task session.

## Failure handling

- **Uncommitted changes** → stop at step 2, ask user (stash? commit? discard?)
- **Bundle fails** → stop and report
- **Migration fails** → stop and report
- **Yarn fails** → stop and report
- **No issue provided** → ask for one before step 7

Don't silently skip failures. Each step must succeed before moving on.
