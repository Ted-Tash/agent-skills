---
name: pr-comments
description: Address PR review comments one at a time. Use when the user pastes a PR URL and wants to work through review feedback interactively.
---

# PR Comments

Work through unresolved PR review comments interactively, one thread at a time.

## Non-negotiable first response

When this skill is triggered, your first action must be a plain-text reply to the user before running `gh`, git, API calls, checkout, reads, edits, commits, pushes, replies, or thread-resolution mutations.

The first response should include:

- The PR URL/number you think the user wants to handle.
- The high-level plan: fetch PR metadata, check out branch, read changed files, gather unresolved threads, present one comment at a time.
- The public/mutating actions that will happen later only after approval: edits, commits, pushes, replies, resolving threads.
- Any missing information.

Keep it short. The purpose is to let the user stop you before checkout/API activity begins.

After the initial plan, proceed if the PR URL is clear. Stop and ask if it is not.

## Critical interaction rule

Handle exactly one unresolved review thread at a time.

- Never present more than one comment per message.
- Never make changes for a comment until the user approves the proposed fix for that specific comment.
- Never resolve or reply to a thread until its fix has been applied, committed, and pushed.
- Always stop after presenting a comment and wait for the user.

## Steps

### 1. Announce the plan

Reply first. Do not run `gh`, git, or API calls before this response.

### 2. Parse and fetch PR context

Extract owner, repo, and PR number from the URL. Then gather:

```bash
gh pr view <PR_NUMBER> --repo <OWNER>/<REPO> --json headRefName,baseRefName,title,url,files,reviews
gh api repos/<OWNER>/<REPO>/pulls/<PR_NUMBER>/comments --paginate
```

Also fetch review thread resolution status with GraphQL:

```bash
gh api graphql -f query='
  query($owner: String!, $repo: String!, $pr: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        reviewThreads(first: 100) {
          nodes {
            id
            isResolved
            comments(first: 50) {
              nodes {
                id
                databaseId
                body
                author { login }
                path
                line
                startLine
                diffHunk
              }
            }
          }
        }
      }
    }
  }
' -F owner="<OWNER>" -F repo="<REPO>" -F pr="<PR_NUMBER>"
```

### 3. Check out the PR branch

Before switching branches, check for local changes:

```bash
git status --short --branch
```

If dirty, stop and ask.

Then:

```bash
git fetch origin
git checkout <headRefName>
git pull origin <headRefName>
```

### 4. Read changed files

Read every file changed in the PR so comments are evaluated with context.

### 5. Build unresolved thread list

Group comments by thread. Skip resolved threads. For each unresolved thread, retain:

- Thread node ID.
- Top-level REST comment database ID.
- Reviewer login.
- File and line.
- Diff hunk.
- Full comment/reply history.

### 6. Present one thread and stop

For each unresolved thread, present exactly one in this shape:

---

**Comment N of TOTAL** — `path/to/file` line L

> @reviewer said:
> comment body

Include the relevant diff hunk if it helps the user understand the comment.

**My read:** what the reviewer is asking for.

**Proposed fix:** concrete change you recommend.

---

Then stop. Do not continue until the user responds.

### 7. Apply approved fix

Only after user approval for the current thread:

1. Make the change.
2. Show what changed.
3. Move to the next unresolved thread and stop again.

If the user skips a thread, mark it as skipped locally and do not edit, reply, or resolve it.

### 8. Commit and push after all threads are handled

When all comments have been addressed or skipped:

```bash
git add -A
git commit -m "address pr review feedback"
git push origin HEAD
```

Use multiple commits if changes are logically separate.

### 9. Reply and resolve addressed threads

For each addressed thread, reply concisely:

```bash
gh api repos/<OWNER>/<REPO>/pulls/<PR_NUMBER>/comments \
  -f body="@<reviewer> <what changed>" \
  -F in_reply_to=<top_level_comment_id>
```

Then resolve with GraphQL:

```bash
gh api graphql -f query='
  mutation($threadId: ID!) {
    resolveReviewThread(input: {threadId: $threadId}) {
      thread { isResolved }
    }
  }
' -f threadId="<THREAD_NODE_ID>"
```

Do not resolve skipped threads.

## Final response

Report:

- Addressed thread count.
- Skipped thread count.
- Commit hash(es).
- Push result.
- Resolved/replied threads.
- PR URL.

## Stop and ask if

- PR URL is missing or ambiguous.
- Working tree is dirty before checkout.
- A comment's intent is unclear.
- A proposed fix touches unrelated code.
- Commit or push fails.
- Thread resolution API fails.
