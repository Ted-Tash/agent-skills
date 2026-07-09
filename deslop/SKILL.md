---
name: deslop
description: Run a codebase quality sweep for duplication, weak types, unused code, circular dependencies, defensive programming, legacy paths, and AI-style slop. Use when the user wants to deslop, clean up the codebase, reduce tech debt, prep a PR for review, or run a quality pass.
---

# Deslop

A structured quality sweep that finds cleanup opportunities, writes a report, and only applies changes after user approval.

## Non-negotiable first response

When this skill is triggered, your first action must be a plain-text reply to the user before running any tool, git command, search, analysis script, or edit.

The first response should include:

- The scope you think the user wants reviewed.
- The high-level sweep plan.
- Whether this will be analysis-only or whether changes are being requested.
- Any risk or ambiguity.

Keep it short. The purpose is to let the user stop you before broad repo inspection or edits begin.

Default to analysis-only. Do not edit files until the user has reviewed the findings and approved specific categories or files.

## Quick start

Examples:

```text
/deslop                  # full codebase
/deslop src/api          # directory
/deslop 1234             # PR number
/deslop feat/new-auth    # branch diff
```

## Workflow

### 1. Announce the plan

Reply first. Do not inspect files, run git, or launch any helper before the plan is visible to the user.

### 2. Resolve scope

Turn the user's argument into a file list:

- Empty argument: full codebase.
- Digits or `#N`: use `gh pr view N --json files` to get changed files.
- Branch name: use `git diff --name-only <default>...<branch>`.
- Path/glob: use that path.

### 3. Exclude noisy/generated files

Skip:

- Patterns in `.gitignore` and `.git/info/exclude`.
- Build output: `dist/`, `build/`, `out/`, `.next/`, `target/`, `__pycache__/`.
- Vendored/generated: `node_modules/`, `vendor/`, `.venv/`, `*.generated.*`, `*.gen.go`, `*_pb2.py`.
- Snapshots: `__snapshots__/`, `*.snap`.
- Lockfiles unless the user specifically asks to inspect them.

If the filtered scope is more than about 500 files, stop and ask the user to narrow it.

### 4. Detect tooling

Look for language/tool config such as:

- `package.json`, `tsconfig*.json`, ESLint, Knip, Madge.
- `pyproject.toml`, Ruff, Vulture.
- `go.mod`, Staticcheck.
- `Cargo.toml`, Clippy.
- `Gemfile`, StandardRB, RuboCop.

Use available tools when they clearly fit. If a tool is missing, continue with manual inspection and repository search.

### 5. Analyze categories

Analyze the scope by category. This can be sequential. Do not assume hidden parallel-agent support.

1. **Deduplication** — duplicated logic that creates real complexity.
2. **Type consolidation** — duplicated or drifting type/interface definitions.
3. **Unused code** — tool-supported findings verified by repo-wide search.
4. **Circular dependencies** — import or package cycles and clean break points.
5. **Weak types** — `any`, unsafe casts, missing public annotations, unchecked assertions.
6. **Defensive programming** — swallowed errors, useless try/catch, unjustified fallbacks.
7. **Legacy paths** — stale flags, deprecated branches, compatibility shims.
8. **AI slop / comments / over-nesting** — narrating comments, task-referential comments, commented-out code, avoidable pyramids.

Use `deslop/AGENTS.md` for the detailed criteria for each category.

### 6. Write the report

Create `deslop-report.md` at the repo root with findings grouped by category and file.

Each finding should include:

- File and line(s).
- Category.
- Severity: high, medium, or low.
- Issue.
- Proposed fix.
- Confidence.
- Verification notes, especially for deletions.

### 7. Review with the user

Summarize:

- Count by category.
- Highest-value findings.
- Files that would change if applied.
- Anything uncertain.

Then ask which categories or files to apply.

### 8. Apply only after approval

Before editing:

1. Announce the exact apply plan.
2. Check the working tree.
3. Refuse to edit on `main`/`master` unless the user explicitly says to do so.
4. Apply approved changes in safe order:
   - Deletion and legacy cleanup.
   - Simplification and slop cleanup.
   - Consolidation.
   - Typing.
   - Structural dependency changes.
5. Run relevant tests/lint/typecheck after each meaningful batch.
6. Commit only if the user asked for commits or the workflow explicitly requires them.

## Stop and ask if

- Scope is huge or unclear.
- The working tree is dirty before applying changes.
- A proposed deletion cannot be verified confidently.
- Applying changes would touch files outside the approved scope.
- The current branch is `main`/`master` and the user did not explicitly approve direct edits.

## Guardrails

- Keep behavior unchanged unless fixing a clear bug.
- Analysis first, edits later.
- Do not auto-apply low-confidence findings.
- Verify every deletion with repo-wide search.
- Do not invent types or APIs.
- Prefer small, reviewable cleanup batches.
