---
metadata:
  version: 2.0.0
---

## Capability

Tags what the change over-builds, one line per finding, with the lines each cut would save.

## Inputs

### lean_change

*(optional)* The change under review — the diff or solution to scan for over-engineering. When absent, the change is read from `{target_path}` within the chosen `{pass_scope}`.

## Outputs

### review_findings

The tagged findings for the change, each under a stable `LC-{n}` designator so a reader and a caller reference the same finding — carrying a [taxonomy](../resources/review-taxonomy.md#tags) tag, the location, the simpler alternative, and the lines it would save — closing with the diff-scoped [scoreboard](../resources/review-taxonomy.md#scoreboard).

#### artifact

`review-findings.md`

#### audience

`human`

## Protocol

### 1. Scan against the taxonomy

- Read the change under review — `{lean_change}` when present, otherwise the change read from `{target_path}` within the chosen `{pass_scope}`. For each construct, ask whether one of the [taxonomy](../resources/review-taxonomy.md#tags) tags applies: a deletion, a standard-library replacement, a language-native replacement, a YAGNI abstraction, or a shrinkable block.
- Flag disproportionate comment and doc blocks per [Comment proportionality](../resources/review-taxonomy.md#comment-proportionality).
- A higher `{lazy_intensity}` lowers the bar for flagging — `ultra` flags any construct a lazier rung could replace; `lite` flags only the clear wins.

### 2. Record one line per finding

- Write each finding as a single line in `{review_findings}`, under its own designator per [Finding Format](../resources/review-taxonomy.md#finding-format).

### 3. Score the net

- Close `{review_findings}` with the diff-scoped [scoreboard](../resources/review-taxonomy.md#scoreboard), summing the savings across all findings.

## Rules

### the-lone-check-is-not-bloat

A `delete` finding is never raised against the single smoke test or assert-based self-check a change carries. That check is the safety floor's minimum, so removing it is not a saving.
