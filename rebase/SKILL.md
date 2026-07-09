---
name: rebase
description: Rebase the current branch onto origin/main, origin/master, or a user-specified base, resolve conflicts carefully, force-push, then run linter and specs. Use when the user says /rebase or asks to rebase their branch.
---

# Rebase

Fetch, rebase the current feature branch onto the upstream base branch, resolve conflicts, force-push, and verify.

## Non-negotiable first response

When this skill is triggered, your first action must be a plain-text reply to the user before running git, editing files, resolving conflicts, pushing, or running tests.

The first response should include:

- The branch you believe will be rebased.
- The base branch you expect to rebase onto.
- The high-level plan: check status, fetch, rebase, resolve conflicts if needed, force-push, lint, specs.
- The risky actions: rewriting history and force-pushing.

Keep it short. The purpose is to let the user stop you before history-changing commands run.

After the initial plan, proceed only if the request is clear and the working tree is clean. Stop and ask on ambiguity.

## Prerequisites

- Current branch is a feature/task branch, not `main`, `master`, or `staging`.
- Working tree is clean.
- The branch has been pushed or the user is comfortable with force-pushing after rebase.

## Steps

### 1. Announce the plan

Reply first. Do not run `git status`, `git fetch`, or any other command before this response.

### 2. Pre-flight checks

```bash
git status --short --branch
git branch --show-current
git branch -r | grep -E 'origin/(main|master|staging)$'
```

Stop if:

- Working tree is dirty.
- Current branch is `main`, `master`, or `staging`.
- Base branch is unclear.

### 3. Detect base branch

Use the user's specified base if provided. Otherwise:

1. Prefer `origin/main`.
2. Fall back to `origin/master`.
3. Use `origin/staging` only if explicitly requested.

### 4. Fetch

```bash
git fetch origin
```

### 5. Rebase

```bash
git rebase origin/<base-branch>
```

Do not use interactive rebase.

### 6. Resolve conflicts carefully

For each conflict:

1. Read every conflicted file.
2. Check the commit being replayed:

```bash
git log --oneline -1 REBASE_HEAD
```

3. Understand both upstream and branch intent.
4. Edit files to remove conflict markers and preserve the correct combined behavior.
5. Stage resolved files:

```bash
git add <resolved-files>
```

6. Continue:

```bash
git rebase --continue
```

If the commit became empty, use:

```bash
git rebase --skip
```

Stop and ask if the correct resolution is ambiguous or high risk.

Common conflict handling:

- Lockfiles: usually take upstream, then rerun the package manager if needed.
- Schema files: usually take upstream, then rerun migrations if needed.
- Renames: apply branch intent to the new upstream location/name.
- Deleted upstream code: drop branch changes only if upstream clearly removed that path intentionally.

### 7. Force-push safely

```bash
git push --force-with-lease --force-if-includes
```

If rejected, stop and explain.

### 8. Run linter

```bash
dip standardrb
```

If violations appear, try:

```bash
dip standardrb --fix
```

If auto-fix changes files, commit them separately and push again.

### 9. Run specs

```bash
dip rspec
```

If specs fail, report failures. Do not attempt broad fixes unless the user asks.

## Final response

Summarize:

- Base branch used.
- Whether conflicts occurred and which files were resolved.
- Whether force-push succeeded.
- Linter result.
- Spec result.

## Stop and ask if

- Working tree is dirty.
- Current branch is protected/base branch.
- Conflict resolution is ambiguous.
- Force-push is rejected.
- Test failures require product/code decisions.
