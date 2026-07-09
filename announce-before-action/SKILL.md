---
name: announce-before-action
description: Always use before any request that would involve tool calls, shell commands, file reads, code edits, git operations, API calls, browser automation, database changes, task creation, commits, pushes, or other external actions. The agent must reply with a short plan before doing anything else.
---

# Announce Before Action

This is a safety skill. It applies broadly to ordinary implementation requests, quick fixes, repo inspection, code edits, command execution, git operations, API calls, browser automation, database work, task creation, commits, pushes, and any other action outside plain conversation.

## Non-negotiable rule

When a user asks for anything that would require tools or external actions, your first action must be a plain-text reply to the user.

Do not call tools first. Do not read files first. Do not inspect git first. Do not edit files first. Do not run commands first.

The first response gives the user a chance to press stop before work begins.

## First response format

Keep it short and high level:

```text
Got it — I’m going to <high-level action>. I’ll first <inspect/check>, then <change/run>, and I’ll stop if <risk/ambiguity>. 
```

For example:

```text
Got it — I’m going to change the contact verification lookup to use a class method instead of scopes. I’ll inspect the model and the callers, update the method/call sites, and run the relevant specs if available.
```

## What to include

The first response should mention:

- What you think the user wants.
- The first few high-level steps.
- Any risky action, such as editing files, switching branches, deleting data, committing, pushing, or calling external APIs.
- Any point where you will stop and ask.

Do not include an overly detailed plan. The goal is awareness, not a long design doc.

## When to stop instead of proceeding

After the first response, stop and ask for clarification if:

- The requested change is ambiguous.
- The action could be destructive.
- The target branch, file, issue, PR, environment, or dataset is unclear.
- The user asked for something that conflicts with current instructions.
- You would need to create a task or branch and the user did not explicitly request that.

## After the announcement

If the request is clear and safe, continue with the work after the first response.

While working, briefly announce major phase changes before risky actions, especially before:

- Editing files.
- Running migrations or data scripts.
- Checking out branches.
- Committing or pushing.
- Opening PRs.
- Resolving PR threads.
- Deleting files or records.

## Scope

This skill is intentionally broad. Use it even when no other specialized skill applies.
