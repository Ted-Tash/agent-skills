---
name: code-review
description: Review the current branch's code changes for bugs and correctness issues. Use when the user asks to review code, review a branch, or run a code review after verifying things work.
---

# Code Review

Review the current branch's diff against its base branch and report discrete, actionable correctness issues.

## Non-negotiable first response

When this skill is triggered, your first action must be a plain-text reply to the user before running any tool, git command, API call, or analysis command.

The first response should include:

- What branch or change you intend to review.
- The base branch you expect to compare against, if known.
- The high-level review plan: inspect status, gather diff, review changed files, report findings.
- Any assumptions or questions.

Keep it short. The purpose is to let the user stop you before you inspect or run commands.

If the review target is clear, send the plan and then proceed. If the branch/base is ambiguous, stop and ask.

## Review scope

Focus on bugs introduced by the change:

- Correctness regressions.
- Broken edge cases.
- Security or privacy issues.
- Data loss or migration risks.
- Performance issues that are clear from the diff.
- Maintainability issues only when they are concrete and likely to cause bugs.

Do not flag trivial style, subjective preferences, or pre-existing issues unless the diff makes them worse.

## Steps

### 1. Announce the plan

Reply first. Do not run `git`, `gh`, `rg`, or any other tool before this response.

### 2. Pre-flight

Check:

```bash
git status --short --branch
git branch -r | grep -E 'origin/(main|master|staging)$'
```

Determine the base branch:

- Use the branch the user specified, if any.
- Otherwise prefer `origin/main`.
- Fall back to `origin/master` if main does not exist.
- Use `origin/staging` only when the user asks for it or the repo clearly uses staging as the PR base.

### 3. Gather the diff

```bash
git merge-base HEAD origin/<base-branch>
git diff --stat $(git merge-base HEAD origin/<base-branch>)..HEAD
git diff $(git merge-base HEAD origin/<base-branch>)..HEAD
```

If the diff is large, first review the stat and changed file list, then inspect files in logical groups.

### 4. Read relevant files

Read changed files and nearby unchanged context before making claims. Use repository search to verify affected callsites when needed.

### 5. Produce findings

Use the review guidance in this skill's `review-prompt.md` as the standard for what counts as a finding.

Return human-readable markdown:

```markdown
## Code Review Results

### Overall Verdict: Correct|Incorrect

> Short explanation.

**Confidence:** NN%

---

### Findings

#### [P<n>] Title

**File:** `path/to/file` (lines X-Y)
**Confidence:** NN%

One paragraph explaining the bug, when it happens, and why it matters.
```

If there are no findings, say:

```markdown
> No issues found. The patch looks correct.
```

## Stop and ask if

- The working tree has uncommitted changes that make the review target ambiguous.
- The base branch cannot be determined.
- The diff is too large to review responsibly in one pass.
- The user asks for a style/design review instead of a correctness review.

## Important notes

- Do not edit files during a code review unless the user explicitly asks for fixes.
- Do not commit, push, or open PRs from this skill.
- Do not assume hidden parallel review helpers. If the harness provides optional helpers, only use them after the initial plan response and only when they are clearly available.
