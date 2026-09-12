## Summary

A technique step names what it consumes. Most of those names are written as a bare string. Of 412 technique input bindings, 349 are bare — 85 percent — and of those, 193 name a session value and 156 are literals, with both forms appearing in a single binding block. The server guesses: a bare string is a rename when it names a resolvable bag entry, otherwise a literal. Two placeholder grammars sit beside that guess. One accepts a dotted path inside braces; the other does not. Seventeen dotted placeholders already report as resolved while naming no producer.

A program that walks a definition cannot guess. This epic makes a bare supplied value a literal always, a reference always braced, and both placeholder grammars the dotted form, with a guard that holds the rule. It is the first new stage of [#527](https://github.com/m2ux/workflow-server/issues/527) after the rebase of 2026-09-12, and it lands before the runner, because shipping a component whose argument is that it removes guessing, with a near coin-flip heuristic on 85 percent of its inputs, defeats the argument.

This epic covers one work item per gap.

## The three gaps

**A bare string means two things in one block.** The same binding map can hold a literal path and a session value, both written without braces. The resolver treats the string as a rename when the bag happens to contain that name, and as a literal when it does not. The answer changes if an earlier step writes a colliding name.

**Two token grammars disagree about dots.** The grammar the resolution precedence uses has no dots. A sibling module's does. A dotted placeholder can therefore report as resolved on one path and name no producer on the other. Seventeen such sites exist.

**The guard that already holds the rule covers the wrong surface.** A `set` action and a checkpoint's `setVariable` already require a bare string to be a literal and a reference to be braced. Technique input bindings — the 193 sites that matter to the runner — are outside that guard.

## The work

**W1 — Measure the 193 sites and the 17 silent resolutions.** Walk every technique input binding through the real loader. Record which bare strings name a session value and which are literals, and list the dotted placeholders that report as resolved while naming no producer. This is the rewrite gate: every later change is checked against this list, not against inspection.

**W2 — A bare supplied value is a literal; a reference is braced.** Migrate the 193 sites. The existing set-action guard is the model. After this item, the rename-if-resolvable heuristic is gone from technique inputs.

**W3 — Both placeholder grammars are the dotted form.** One token regular expression, shared by resolution and by the modules that already accept dots. The 17 silent resolutions fail the load or resolve to a real producer.

**W4 — A guard holds both rules.** The set-action guard widens to technique input bindings, or a sibling guard shares its check. A new bare-as-reference or a second token grammar fails the change that introduces it.

## Why now is cheap

The set-action half of the rule already shipped, so the authoring convention is in the corpus and the guard has a home. The 193 sites are a closed walk through the loader, not an open discovery. Waiting means the runner either guesses or is blocked.

## Acceptance criteria

- [ ] Every technique input binding in the corpus is either a braced reference or a bare literal, and the loader no longer infers which.
- [ ] The 193 sites that named a session value are braced, checked against the W1 list, not against inspection.
- [ ] One placeholder grammar, the dotted form, is used by every resolver and every guard.
- [ ] The 17 dotted placeholders that reported as resolved while naming no producer either resolve to a producer or fail the load.
- [ ] A new bare-as-reference or a second token grammar fails the change that introduces it.

## Non-goals

- **Section slugs, inline technique calls, or borrowed-operation scope.** Those are [#530](https://github.com/m2ux/workflow-server/issues/530).
- **Per-step writes, the session store index, or a cursor.** Those are the write-authority and position epics.
- **Re-authoring action steps as technique outputs.** Still open, and not this surface.

## Tracking

Each work item is delivered as its own pull request when picked up.

| | Work item | Agent time | Gate |
|---|---|---|---|
| [ ] | **W1** — measure the 193 sites and the 17 silent resolutions | 2–3 h | — |
| [ ] | **W2** — bare is a literal; a reference is braced | 4–6 h | W1 |
| [ ] | **W3** — both placeholder grammars are the dotted form | 2–4 h | W1 |
| [ ] | **W4** — a guard holds both rules | 1–2 h | W2, W3 |
| | **Epic total** | **2–3 days** | |

Carries specification REQ-F044, REQ-F045 and REQ-NF031.

## Investigation detail

The rebase that created this epic, the counts, and the running order:
**[2026-09-12-i0-programme-rebase](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-09-12-i0-programme-rebase)**

The binding-resolution decision and the 193-site / 17-placeholder figures:
**[2026-08-28-runner-execution-protocol](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-28-runner-execution-protocol)**
