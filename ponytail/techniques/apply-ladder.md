---
metadata:
  version: 1.2.0
---

## Capability

Produce the minimal solution by climbing the lazy [ladder](../../ponytail/resources/the-ladder.md#rungs) — taking the highest rung that still solves the problem — while holding the [safety floor](../../ponytail/resources/the-ladder.md#safety-floor). Mark every deliberate simplification with the [ponytail marker](../../ponytail/resources/ponytail-marker-convention.md#convention) so its ceiling is harvestable, and leave one runnable assert-based check for any non-trivial logic.

## Inputs

### lean_brief

*(optional)* The captured brief and traced flow for the change — task, target, the real end-to-end flow, the reachable rungs, and the safety-floor obligations in play. When present, the climb starts from this understanding rather than re-deriving it.

## Outputs

### lean_change

The minimal change that solves the problem at the highest reachable [rung](../../ponytail/resources/the-ladder.md#rungs), with each deliberate simplification carrying its [ponytail marker](../../ponytail/resources/ponytail-marker-convention.md#convention) and a single runnable assert-based check covering any non-trivial logic. Every [safety-floor](../../ponytail/resources/the-ladder.md#safety-floor) obligation is satisfied, not deferred.

#### artifact

`lean-change.md`

#### audience

`human`

## Protocol

### 1. Choose the rung

- When `{lean_brief}` is present, start from its traced flow, reachable rungs, and safety-floor obligations rather than re-deriving them.
- Walk the [rungs](../../ponytail/resources/the-ladder.md#rungs) from the laziest down: do nothing, delete, reuse what exists, reach for the standard library, reach for a language native, lean on an already-installed dependency, write the one line, write the minimum code that works.
- Take the highest rung that solves the problem. When two rungs both work, take the higher one.
- Let `{lazy_intensity}` govern *how* the code is built, not just how a review flags it:
  - **lite** — build what was asked, then name the lazier alternative in one line and let the user pick.
  - **full** — enforce the ladder as written: highest reachable rung, shortest working diff, shortest explanation.
  - **ultra** — ship the minimal version and, in the same breath, challenge and trim the over-built part of the requirement itself.

### 2. Ship the lazy version and question the rest

- On a complex or over-specified request, ship the lazy version and question the rest in the **same response** — e.g. `Did X; Y covers it. Need full X? Say so.` Never stall on an answer you can default.
- This interaction is mandatory at `ultra` and available at `full`.

### 3. Hold the safety floor

- Walk the [safety floor](../resources/the-ladder.md#safety-floor) against the change: every obligation it places is satisfied before the change settles.

### 4. Mark the ceilings

- Wherever a deliberate simplification sets a ceiling — a hard-coded value, a skipped abstraction, a narrowed scope — annotate it with the [ponytail marker](../../ponytail/resources/ponytail-marker-convention.md#convention) recording the ceiling and the trigger that would justify upgrading past it.

### 5. Present the change

- Record the `{lean_change}` into `{artifact_dir}` per [lean-change](../resources/lean-change.md#template) and its [Rules](../resources/lean-change.md#rules) — code first, then at most three lines on what was skipped and the trigger that would justify adding it.
