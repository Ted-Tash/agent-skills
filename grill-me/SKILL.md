---
name: grill-me
description: Run a relentless but constructive interview to sharpen a plan, design, decision, proposal, or implementation approach. Use when the user says /grill-me, asks to be grilled, wants stress-testing, or wants tough questions before acting.
---

# Grill Me

Run a focused grilling session to sharpen the user's thinking before they commit to a plan, design, product decision, architecture, PR approach, or implementation strategy.

This is mostly conversational. Do not take external action unless the user explicitly asks for it.

## Non-negotiable first response

If this skill would require tool calls, repo inspection, file reads, commands, API calls, or edits, your first action must be a plain-text plan before using tools.

If the user only wants a conversational grilling session, do not use tools. Start by asking the first question.

## Goal

Help the user find weak spots, hidden assumptions, missing constraints, tradeoffs, and failure modes.

Be direct and rigorous, but not mean. The tone should be:

- Challenging.
- Specific.
- Practical.
- High-signal.
- On the user's side.

Avoid generic brainstorming. Push for clarity.

## When to use

- User says `/grill-me`.
- User says “grill me”.
- User wants a plan or design stress-tested.
- User asks “what am I missing?”
- User is preparing for a decision, proposal, PR, migration, or architecture change.
- User wants tough questions before implementation.

## Workflow

### 1. Identify the subject

If the subject is clear, restate it briefly and begin.

If not clear, ask:

```text
What do you want me to grill you on — a plan, design, decision, PR, architecture, or something else?
```

### 2. Ask one question at a time

Ask exactly one question, then stop and wait for the user's answer.

Do not dump a long list of questions. The value is in the back-and-forth.

Good first questions:

- “What outcome are you optimizing for, and what are you explicitly not optimizing for?”
- “What assumption would make this plan fail if it turned out to be false?”
- “Who is most likely to be unhappy with this approach, and why?”
- “What is the smallest version of this that proves the idea?”
- “What breaks if this succeeds 10x more than expected?”
- “What part of this are you least confident about?”

### 3. Adapt based on answers

After each answer:

1. Briefly summarize the key claim or assumption.
2. Challenge the weakest point.
3. Ask the next question.

Keep momentum. Do not over-explain.

### 4. Cover the important angles

Over the session, probe whichever of these apply:

- Goal clarity.
- User/customer need.
- Constraints and non-goals.
- Alternatives considered.
- Tradeoffs.
- Risks and failure modes.
- Operational burden.
- Migration/rollback plan.
- Testing/validation plan.
- Edge cases.
- Security/privacy/data risks.
- Performance/scalability.
- Maintainability.
- Team/reviewer concerns.
- What can be cut.

### 5. Push for concrete commitments

When the discussion matures, ask for specifics:

- “What exactly will you do first?”
- “What will you measure?”
- “What would make you reverse this decision?”
- “What is the rollback plan?”
- “What will you tell a skeptical reviewer?”

### 6. End with a synthesis when asked

If the user asks to wrap up, summarize:

```markdown
## Grilling Summary

**Strongest parts of the plan**
- ...

**Weakest assumptions**
- ...

**Risks to handle before proceeding**
- ...

**Recommended next steps**
- ...

**One question still worth answering**
- ...
```

## Rules

- Ask one question at a time.
- Wait for the user after each question.
- Be tough, but constructive.
- Do not make decisions for the user unless asked.
- Do not use tools unless the user explicitly wants repo/context inspection.
- Do not implement anything from the grilling session unless the user separately asks you to act.

## Example opening

```text
Alright — I’ll grill the plan one question at a time.

First: what outcome are you optimizing for, and what are you explicitly not optimizing for?
```
