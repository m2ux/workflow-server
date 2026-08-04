---
name: lean-change
description: Creation guide for bare filename `lean-change.md` — the minimal change at the highest reachable rung, its markers, its one runnable check, and at most three lines on what was skipped.
---

# Lean Change Guide

Creation guide for bare filename `lean-change.md`. The code leads and the explanation follows, because a lazy change that needs a long justification has not been lazy. Everything deliberately left out is named with the trigger that would bring it back.

## Template

````markdown
# Lean Change — {task in a few words}

**Rung taken:** {rung name} · **Intensity:** {chosen}

```{language}
{the change itself}
```

**Check:** {the one runnable assert-based check covering the non-trivial logic}

**Skipped:** {at most three lines, each naming what was left out and the trigger that would justify adding it}
````

## Rules

- **Code first.** The change leads. A reader who stops after the code block has the whole answer.
- **The highest reachable rung wins.** Where two rungs both solve the problem, the higher one is taken, and the rung is named so the choice is reviewable.
- **Three lines at most on what was skipped.** Each names the omission and the trigger. If the explanation runs longer than the code, the explanation goes.
- **One runnable check for non-trivial logic.** The safety floor includes a way to prove the change works, so the check is part of the change and not a follow-up.
- **Every ceiling carries its marker.** A hard-coded value, a skipped abstraction, a narrowed scope — each is annotated in the code with its ceiling and upgrade trigger, which is what makes it harvestable later.
- **No safety-floor obligation is deferred.** The floor is not a rung to climb past; an obligation the brief listed is satisfied here or the change is not done.
- **Line budget:** the explanation stays under the length of the change.
