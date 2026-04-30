---
name: pr-comments
description: Address PR review comments one at a time. User pastes a PR URL, then we check out the branch, read every review comment, discuss each one, make changes, commit, push, resolve threads, and reply to the reviewer. Use when the user pastes a PR link and wants to work through review feedback.
---

# PR Comments

Work through PR review comments interactively, one at a time.

## Trigger

User pastes a GitHub PR URL (or says something like "let's address PR comments").

## Steps

### 1. Parse the PR

Extract the owner, repo, and PR number from the URL. Then gather context — run these in parallel:

```bash
# Get PR metadata: branch, files, title
gh pr view <PR_NUMBER> --repo <OWNER>/<REPO> --json headRefName,baseRefName,title,url,files,reviews

# Get all review comments (threaded discussion on specific lines)
gh api repos/<OWNER>/<REPO>/pulls/<PR_NUMBER>/comments --paginate
```

### 2. Check out the branch

```bash
git fetch origin
git checkout <headRefName>
git pull origin <headRefName>
```

### 3. Read changed files

Read every file that was changed in the PR so you have full context for addressing comments. Use the `files` list from step 1.

### 4. Build the comment list

From the review comments fetched in step 1, build a list of **unresolved comment threads**. Group replies together — each thread is identified by the top-level comment (comments where `in_reply_to_id` is null are thread starters; those with `in_reply_to_id` are replies).

Skip threads that are already resolved. To check resolution status, use the GraphQL API:

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

This gives you thread IDs (needed for resolving later) and resolution status in one call. Prefer this over the REST endpoint for building the comment list.

### 5. Walk through comments ONE AT A TIME

**THIS IS THE MOST IMPORTANT STEP. Do not rush it.**

Present exactly ONE unresolved thread, then STOP and WAIT for the user to respond. Do not present the next comment. Do not make changes yet. Do not continue in any way until the user has explicitly told you what they want to do.

For each unresolved thread, present it like this:

---

**Comment _N_ of _total_** — `path/to/file.rb` line _L_

> _@reviewer said:_
> _the comment body_

_(show the relevant diff hunk for context)_

**My read:** _your analysis of what the reviewer is asking for_

**Proposed fix:** _what you'd do to address it_

---

Then **STOP. Do not write another word. Wait for the user.**

The user might:
- **Agree** → proceed with the proposed fix
- **Disagree / want something different** → adjust the plan
- **Want to skip** → mark it to skip (don't resolve, don't reply)
- **Want to discuss** → go back and forth until they're happy

Only after the user has given clear approval (or said skip) do you act on that comment and then present the next one. Every single comment gets its own back-and-forth. No exceptions.

### 6. Make the changes (per comment)

After the user approves a plan for the CURRENT comment, make the code changes immediately. Show the user what you changed. Then present the NEXT comment and STOP again. Repeat the cycle:

1. Present comment → STOP
2. User gives input → discuss until agreed
3. Make the change → show result
4. Present next comment → STOP

This loop continues until every comment has been addressed or skipped. Never batch multiple comments together. Never present two comments in one message.

### 7. Commit and push

Once ALL comments have been walked through and addressed (or skipped):

```bash
git add -A
git commit -m "$(cat <<'EOF'
address pr review feedback

<concise summary of what was changed and why>
EOF
)"
git push origin HEAD
```

If the changes are logically distinct, consider multiple commits grouped by concern. Use your judgment.

### 8. Resolve threads and reply

For each comment that was addressed (not skipped), do two things:

**a) Reply to the comment**, tagging the original reviewer:

```bash
gh api repos/<OWNER>/<REPO>/pulls/<PR_NUMBER>/comments \
  -f body="@<reviewer> <explanation of what was done to address this>" \
  -F in_reply_to=<top_level_comment_id>
```

Keep replies concise but informative. The reviewer should understand what changed without having to re-read the diff.

**b) Resolve the thread** using GraphQL:

```bash
gh api graphql -f query='
  mutation($threadId: ID!) {
    resolveReviewThread(input: {threadId: $threadId}) {
      thread { isResolved }
    }
  }
' -f threadId="<THREAD_NODE_ID>"
```

### 9. Summary

Print a wrap-up:

- How many comments were addressed
- How many were skipped
- What was committed
- Link to the PR

## Critical rule: ONE AT A TIME

This cannot be overstated. The user wants to be in the loop on every single comment. The workflow is a conversation, not a batch job.

- **NEVER present more than one comment per message.**
- **NEVER make changes without the user's go-ahead on that specific comment.**
- **NEVER skip ahead, summarize remaining comments, or ask "should I just handle the rest?"**
- **ALWAYS stop after presenting a comment and wait for the user's response.**
- If there are 20 comments, there will be at least 20 back-and-forth exchanges. That's the point.

## Other important notes

- **Be opinionated.** Don't just parrot the comment back — give your read on what the reviewer wants and propose a concrete fix. The user is relying on you to do the thinking.
- **Read the code first.** Before proposing a fix, make sure you've read the relevant file(s) so your suggestion actually works.
- **Respect skips.** If the user wants to skip a comment, don't resolve it or reply to it. They'll handle it themselves.
- **Group commits sensibly.** One big commit is fine for small PRs. For larger ones, group by file or concern.
