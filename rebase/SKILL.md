---
name: rebase
description: Rebase the current branch onto origin/main (or master/staging), resolve all conflicts, force-push, then run the linter and specs. Use when the user says /rebase or asks to rebase their branch.
---

# Rebase

Fetch, rebase onto the upstream base branch, resolve conflicts, force-push, and verify the build.

## Prerequisites

- On a feature/task branch (not main/master/staging)
- All work is committed (clean working tree)

## Steps

### 1. Pre-flight checks

```bash
git status
git branch --show-current
```

- Confirm the working tree is clean. If there are uncommitted changes, stop and ask the user what to do.
- Confirm we're not on main/master/staging. If we are, stop — rebasing the base branch makes no sense.

### 2. Detect the base branch

Determine which upstream branch to rebase onto. Check in this order:

```bash
git branch -r | grep -E 'origin/(main|master|staging)$'
```

- If the user specified a branch, use that.
- Otherwise default to `origin/main`.
- If only `origin/master` exists, use that.
- `origin/staging` is only used when the user explicitly asks for it.

### 3. Fetch origin

```bash
git fetch origin
```

### 4. Rebase

```bash
git rebase origin/<base-branch>
```

**Do NOT use `--interactive` / `-i`** — interactive rebase requires a TTY and will hang.

If the rebase completes cleanly (no conflicts), skip to step 5.

#### Resolving conflicts

When a conflict occurs, work through it commit-by-commit:

1. **Read every conflicted file** listed in `git status` (look for "both modified", "both added", "deleted by us/them").

2. **Understand the intent of both sides.** For each conflicted file:
   - Read the full file to see the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
   - Check `git log --oneline -1 REBASE_HEAD` to understand what the current commit was trying to do.
   - Use your judgment to produce the correct merged result — the goal is code that incorporates both the upstream changes and the branch's changes correctly.

3. **Resolve the file** by editing it to remove all conflict markers and produce the correct code. Common patterns:
   - **Both sides changed the same code** — combine the intent of both changes. Prefer the branch's feature logic layered on top of upstream's structural changes.
   - **Upstream renamed/moved something the branch also touched** — adopt upstream's new names/locations and apply the branch's logic there.
   - **Upstream deleted something the branch modified** — if upstream intentionally removed it, drop the branch's changes to that code. If upstream just refactored, apply the branch's changes to the new structure.
   - **Gemfile.lock / yarn.lock / package-lock.json** — accept upstream's version, then re-run the package manager (`bundle install`, `yarn install`, etc.) to incorporate the branch's additions.
   - **Schema files (db/schema.rb, structure.sql)** — accept upstream's version; the branch's migrations will re-apply on the next `db:migrate`.

4. **Stage the resolved files:**
   ```bash
   git add <resolved-files>
   ```

5. **Continue the rebase:**
   ```bash
   git rebase --continue
   ```

6. **Repeat** until all commits are replayed. If a commit becomes empty after resolution (all its changes are already upstream), drop it:
   ```bash
   git rebase --skip
   ```

If at any point the conflicts are too ambiguous to resolve confidently (e.g., massive architectural changes on both sides), **stop and present the conflict to the user** with both sides explained. Do not guess on high-risk merges.

### 5. Force-push

```bash
git push --force-with-lease --force-if-includes
```

If this fails with a "stale info" error, it usually means another push happened. Stop and tell the user.

### 6. Run the linter

```bash
dip standardrb
```

If there are violations, attempt auto-fix:

```bash
dip standardrb --fix
```

If auto-fix resolves everything, commit: `fix: standardrb auto-corrections after rebase`. Then push again.

If violations remain that can't be auto-fixed, report them to the user but continue to specs.

### 7. Run specs

```bash
dip rspec
```

If specs fail, report the failures. Do not attempt to fix spec failures automatically — the user needs to decide how to handle them.

### 8. Done

Print a summary:
- Base branch rebased onto
- Number of commits replayed
- Whether conflicts were resolved (and what they were)
- Linter result
- Spec result

## Failure handling

- **Dirty working tree** → stop at step 1, ask user
- **Rebase conflicts too ambiguous** → stop mid-step-4, show both sides
- **Force-push rejected** → stop at step 5, explain
- **Linter failures (can't auto-fix)** → warn, continue to specs
- **Spec failures** → report, stop

Never silently swallow a conflict or error. Transparency is more important than speed.
