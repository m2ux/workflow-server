---
name: lean-brief
description: Creation guide for bare filename `lean-brief.md` — the entry brief recording the task, target, chosen intensity and scope, the traced end-to-end flow, the reachable rungs, and the safety-floor obligations in play.
---

# Lean Brief Guide

Creation guide for bare filename `lean-brief.md`. Written before any code changes, so the climb starts from a traced flow rather than an assumption. Its job is to make the problem, the path through the code, and the obligations that constrain a shortcut all visible on one page.

## Template

```markdown
# Lean Brief — {task in a few words}

**Target:** `{path}` · **Intensity:** {chosen} · **Scope:** {chosen}

**Problem:** {the one sentence the change must solve.}

## Traced Flow

**Entry:** {where the flow starts}
**Data:** {what it carries}
**Exit and error paths:** {where it ends, and how it fails}

## Reachable Rungs

| Rung | Why it looks reachable |
|------|------------------------|
| rung name | one line |

## Safety Floor in Play

| Obligation | Why this flow implicates it |
|------------|-----------------------------|
| validation at a trust boundary | one line |
```

## Rules

- **The problem is one sentence.** If it cannot be stated in one, clarifying it is itself a safety-floor obligation and the brief says so rather than tracing around it.
- **The flow is traced, not guessed.** Entry, data, and exit and error paths come from reading the affected code end to end.
- **Rungs are candidates, not decisions.** The brief names what looks reachable; the climb decides which rung holds.
- **Every implicated obligation is listed with its reason.** An obligation named without why this flow implicates it cannot be checked later.
- **Line budget:** ~40 lines. A brief longer than the change it precedes has stopped being a brief.
