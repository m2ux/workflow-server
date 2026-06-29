---
metadata:
  version: 1.0.0
---

## Capability

Produce the minimal solution by climbing the lazy [ladder](../../resources/the-ladder.md#rungs) — taking the highest rung that still solves the problem — while holding the [safety floor](../../resources/the-ladder.md#safety-floor). Mark every deliberate simplification with the [ponytail marker](../../resources/ponytail-marker-convention.md#convention) so its ceiling is harvestable, and leave one runnable assert-based check for any non-trivial logic.

## Inputs

### lean_brief

*(optional)* The captured brief and traced flow for the change — task, target, the real end-to-end flow, the reachable rungs, and the safety-floor obligations in play. When present, the climb starts from this understanding rather than re-deriving it.

## Outputs

### lean_change

The minimal change that solves the problem at the highest reachable [rung](../../resources/the-ladder.md#rungs), with each deliberate simplification carrying its [ponytail marker](../../resources/ponytail-marker-convention.md#convention) and a single runnable assert-based check covering any non-trivial logic. Every [safety-floor](../../resources/the-ladder.md#safety-floor) obligation is satisfied, not deferred.

#### artifact

`lean-change.md`

## Protocol

### 1. Choose the rung

- When `{lean_brief}` is present, start from its traced flow, reachable rungs, and safety-floor obligations rather than re-deriving them.
- Walk the [rungs](../../resources/the-ladder.md#rungs) from the laziest down: do nothing, delete, reuse what exists, reach for the standard library, reach for a language native, lean on an already-installed dependency, write the one line, write the minimum code that works.
- Take the highest rung that solves the problem. When two rungs both work, take the higher one.

### 2. Hold the safety floor

- Before settling the change, walk the [safety floor](../../resources/the-ladder.md#safety-floor): problem understood, input validation at trust boundaries, error handling that prevents data loss, security, accessibility, hardware calibration, anything explicitly requested. None of these is a rung to climb past.
- Leave one runnable assert-based check for any non-trivial logic — the floor includes a way to prove the change works.

### 3. Mark the ceilings

- Wherever a deliberate simplification sets a ceiling — a hard-coded value, a skipped abstraction, a narrowed scope — annotate it with the [ponytail marker](../../resources/ponytail-marker-convention.md#convention) recording the ceiling and the trigger that would justify upgrading past it.

### 4. Present the change

- Lead with the `{lean_change}` code; follow with at most three lines naming what was skipped and the trigger that would justify adding it.
