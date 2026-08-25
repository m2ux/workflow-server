---
metadata:
  version: 2.0.0
---

## Capability

Produces the minimal change that solves the problem, with every deliberate ceiling marked so it can be harvested later.

## Inputs

### lean_brief

*(optional)* The captured brief and traced flow for the change — task, target, the real end-to-end flow, the reachable rungs, and the safety-floor obligations in play. When present, the climb starts from this understanding rather than re-deriving it.

## Outputs

### lean_change

The minimal change that solves the problem at the highest reachable [rung](../resources/the-ladder.md#rungs), with each deliberate simplification carrying its [ponytail marker](../resources/ponytail-marker-convention.md#convention), one runnable assert-based check over any non-trivial logic, and every [safety-floor](../resources/the-ladder.md#safety-floor) obligation satisfied.

#### artifact

`lean-change.md`

#### audience

`human`

## Protocol

### 1. Choose the rung

- When `{lean_brief}` is present, start from its traced flow, reachable rungs, and safety-floor obligations rather than re-deriving them.
- Walk the [rungs](../resources/the-ladder.md#rungs) from the laziest down and take the highest one that solves the understood problem.
- Let `{lazy_intensity}` govern how the code is built.  
  > - At `lite`, build what was asked and record the lazier alternative in one line beside it.
  > - At `full`, hold the ladder as written: highest reachable rung, shortest working diff, shortest explanation.
  > - At `ultra`, build the minimal version and trim the over-built part of the requirement itself, recording what it trimmed as an open question rather than waiting on an answer that can be defaulted.

### 2. Hold the safety floor

- Walk the [safety floor](../resources/the-ladder.md#safety-floor) against the change: every obligation it places is satisfied before the change settles.

### 3. Mark the ceilings

- Wherever a deliberate simplification sets a ceiling — a hard-coded value, a skipped abstraction, a narrowed scope — annotate it with the [ponytail marker](../resources/ponytail-marker-convention.md#convention) recording the ceiling and the trigger that would justify upgrading past it.

### 4. Record the change

- Record `{lean_change}` into `{artifact_dir}` per [lean-change](../resources/lean-change.md#template) and its [Rules](../resources/lean-change.md#rules).
