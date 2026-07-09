---
name: pr
description: Full PR workflow: run specs and lint, add changelog entry, push, open a PR that closes an issue, update issue status, and request review. Use when the user says /pr or asks to open a pull request.
---

# PR Workflow

Create a pull request safely and visibly.

## Non-negotiable first response

When this skill is triggered, your first action must be a plain-text reply to the user before running tests, lint, git, `gh`, edits, commits, pushes, or project-board updates.

The first response should include:

- The branch you believe will become the PR.
- The issue you think the PR closes, if known.
- The high-level plan: verify branch, run specs/lint, update changelog, commit, push, create PR, update project, request review.
- The public/destructive actions: committing, pushing, opening a PR, changing issue/project status.
- Any question that must be answered first.

Keep it short. The purpose is to let the user stop you before public or repo-mutating actions happen.

After the initial plan, proceed only if the issue and branch are clear. Ask before guessing.

## Prerequisites

- On a task/feature branch, not `main` or `master`.
- Work intended for the PR is committed, except for changelog/lint fixes this workflow may create.
- A GitHub issue exists and should be closed by the PR.
- GitHub CLI is authenticated.

## Steps

### 1. Announce the plan

Reply first. Do not run any command before this response.

### 2. Pre-flight checks

```bash
git status --short --branch
git branch --show-current
```

Stop if:

- Current branch is `main` or `master`.
- There are unexpected uncommitted changes.
- The linked issue is unclear.

Confirm the issue number if ambiguous.

### 3. Run specs

```bash
dip rspec
```

If specs fail, stop and report. Do not continue to linting.

### 4. Run linter

```bash
dip standardrb
```

If violations appear, try:

```bash
dip standardrb --fix
```

If auto-fix resolves them, commit separately:

```bash
git add -A
git commit -m "fix: standardrb auto-corrections"
```

If violations remain, stop and report.

### 5. Add changelog entry

Read `CHANGELOG.md` first and match its style. Add an entry near the top of the Unreleased/current section:

```markdown
- Short description of the change ([#ISSUE](issue_url))
```

Commit it separately:

```bash
git add CHANGELOG.md
git commit -m "docs: add changelog entry for #ISSUE"
```

If there is no changelog or the style is unclear, ask before creating a new pattern.

### 6. Push

```bash
git push -u origin HEAD
```

Stop if push fails.

### 7. Build PR context

Gather:

```bash
git diff main...HEAD
git log main..HEAD --oneline
gh issue view ISSUE
```

Use `master` instead of `main` if appropriate.

### 8. Create the PR

Write a clear PR body with:

- Summary.
- Approach.
- Reviewer notes.
- `Closes #ISSUE`.
- Test plan.

Example:

```bash
gh pr create --title "<concise title>" --body "$(cat <<'EOF'
## Summary
- ...

## Approach
...

## Reviewer notes
None

Closes #ISSUE

## Test plan
- [x] Specs pass
- [x] Linter passes
- [ ] Manual QA, if applicable
EOF
)"
```

### 9. Update issue project status

Inspect project items:

```bash
gh issue view ISSUE --json projectItems
```

If a GitHub Projects v2 item is attached, move status to the repo's review state, such as `Review In Progress`, `In Review`, or `Review`.

If no project board is attached or fields are unclear, skip and mention it.

### 10. Request review

Ask:

```text
Who should review this? Default is willtcarey.
```

Wait for the answer. If the user accepts the default:

```bash
gh pr edit <PR_NUMBER> --add-reviewer willtcarey
```

## Final response

Report:

- PR URL.
- Issue closed.
- Specs/lint result.
- Changelog commit, if created.
- Project status update result.
- Reviewer requested.

## Stop and ask if

- Issue number is ambiguous.
- Working tree has unexpected changes.
- Tests or lint fail.
- Changelog style is unclear.
- Push fails.
- PR title/body would require guessing.
- Reviewer is not confirmed.
