---
name: pr
description: Full PR workflow — run specs, lint, create changelog entry, push, open a PR that closes an issue, update issue status, and request review. Use when the user says /pr or asks to open a pull request.
---

# PR Workflow

End-to-end pull request creation. Runs through every step sequentially, stopping on failures.

## Prerequisites

- On a task branch (not main/master)
- Work is committed
- A GitHub issue exists that this branch addresses

## Steps

### 1. Identify the issue

Look at the task description, branch name, and recent conversation to determine which GitHub issue this PR closes. If ambiguous, ask. Confirm the issue number with the user before proceeding.

### 2. Run specs

```bash
dip rspec
```

If specs fail, stop and report. Do not continue to linting.

### 3. Run linter

```bash
dip standardrb
```

If there are lint violations, run `dip standardrb --fix`, then check if the fixes resolve everything. If auto-fix works, commit the lint fixes separately (`fix: standardrb auto-corrections`). If violations remain that can't be auto-fixed, stop and report.

### 4. Create changelog entry

Add an entry to `CHANGELOG.md` at the top of the Unreleased section (or the topmost section if no Unreleased heading exists). Format:

```
- Short description of the change ([#ISSUE](issue_url))
```

Read the existing changelog first to match its style. Commit the changelog entry: `docs: add changelog entry for #ISSUE`.

### 5. Push

```bash
git push -u origin HEAD
```

### 6. Create the PR

Before creating the PR, build a thorough description by gathering context:

```bash
# Full diff against base branch
git diff main...HEAD

# Commit history on this branch
git log main..HEAD --oneline

# Read the issue for context on what was requested
gh issue view ISSUE
```

Write the PR description by:
- Reading the **issue** to understand the original ask
- Reading the **full diff** and **commit history** to understand what was actually done
- Explaining the **approach** — not just *what* changed but *why* this approach was chosen
- Calling out anything a reviewer should pay attention to (new dependencies, migration concerns, tricky logic, etc.)
- Keeping it scannable — use bullet points and short paragraphs, not walls of text

The PR body must include `Closes #ISSUE` to auto-close the issue on merge.

```bash
gh pr create --title "<concise title under 70 chars>" --body "$(cat <<'EOF'
## Summary
<2-4 bullet points: what changed and why>

## Approach
<Brief explanation of the implementation approach and any key decisions>

## Reviewer notes
<Anything the reviewer should look at closely, or "None">

Closes #ISSUE

## Test plan
- [ ] Specs pass
- [ ] Linter passes
- [ ] Manual QA (if applicable)
EOF
)"
```

### 7. Move the issue to "Review In Progress"

Update the issue's project status. First, discover the project and status field:

```bash
# Find the project item ID and field info
gh issue view ISSUE --json projectItems
```

Then move it using `gh project item-edit`. If the repo uses GitHub Projects (v2), update the Status field to "Review In Progress" (or the closest match — "In Review", "Review", etc.). If no project board is attached, skip this step and tell the user.

### 8. Request review

Ask the user:

> Who should review this? (default: willtcarey)

Wait for their response. If they confirm or say nothing specific, use `willtcarey`. Then:

```bash
gh pr edit <PR_NUMBER> --add-reviewer <reviewer>
```

### 9. Done

Print the PR URL and a summary of everything that was done.

## Failure handling

- **Specs fail** → stop at step 2, show failures
- **Lint fails (can't auto-fix)** → stop at step 3, show violations
- **Push fails** → stop at step 5, show error (likely needs rebase)
- **PR creation fails** → stop at step 6, show error
- **Project board update fails** → warn but continue (non-blocking)

Never skip a failing step. The whole point is catching problems before the PR exists.
