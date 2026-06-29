---
metadata:
  version: 1.0.0
---

## Capability

Review the change under the lens against the over-engineering [taxonomy](../../resources/review-taxonomy.md#tags) — one line per finding, each tagged and carrying its line saving — and close with a net line-count scoreboard. Scope is over-engineering only: correctness, security, and performance are out of scope, since the [safety floor](../../resources/the-ladder.md#safety-floor) already protects them.

## Inputs

### lean_change

*(optional)* The change under review — the diff or solution to scan for over-engineering. When absent, the change is read from `{target_path}` within the chosen `{pass_scope}`.

## Outputs

### review_findings

The tagged findings for the change — one line per finding, each carrying a [taxonomy](../../resources/review-taxonomy.md#tags) tag, the location, the simpler alternative, and the lines it would save — closing with a `net: -N lines` scoreboard. Records a clean result when the change is already lean.

#### artifact

`review-findings.md`

## Protocol

### 1. Scan against the taxonomy

- Read the change under review — `{lean_change}` when present, otherwise the change read from `{target_path}` within the chosen `{pass_scope}`. For each construct, ask whether one of the [taxonomy](../../resources/review-taxonomy.md#tags) tags applies: a deletion, a standard-library replacement, a language-native replacement, a YAGNI abstraction, or a shrinkable block.
- A higher `{lazy_intensity}` lowers the bar for flagging — `ultra` flags any construct a lazier rung could replace; `lite` flags only the clear wins.

### 2. Record one line per finding

- Write each finding as a single line in `{review_findings}`: the tag, the location, the simpler alternative, and the lines it would save.
- Keep to over-engineering. Do not record correctness, security, or performance findings — those belong to the [safety floor](../../resources/the-ladder.md#safety-floor), not this review.

### 3. Score the net

- Close with a `net: -N lines` scoreboard summing the savings across all findings. When the change is already lean, record a clean result with `net: 0 lines`.
