---
metadata:
  version: 1.2.0
---

## Capability

Review the change under the lens against the over-engineering [taxonomy](ponytail/review-taxonomy#tags) — one line per finding, each tagged and carrying its line saving — and close with a net line-count scoreboard. Scope is over-engineering only: correctness, security, and performance are out of scope, since the [safety floor](ponytail/the-ladder#safety-floor) already protects them.

## Inputs

### lean_change

*(optional)* The change under review — the diff or solution to scan for over-engineering. When absent, the change is read from `{target_path}` within the chosen `{pass_scope}`.

### findings_destination

*(optional)* Artifact file the findings are written into. When a caller supplies an existing review artifact (e.g. a consolidated code-review report), the findings are written as a `## Lean-Coding Audit` section of that artifact, updated in place.

#### default

`review-findings.md` (standalone)

## Outputs

### review_findings

The tagged findings for the change — one line per finding, each carrying a [taxonomy](ponytail/review-taxonomy#tags) tag, the location, the simpler alternative, and the lines it would save — closing with a `net: -N lines` scoreboard. Records a clean result when the change is already lean. Written to `{findings_destination}`.

## Protocol

### 1. Scan against the taxonomy

- Read the change under review — `{lean_change}` when present, otherwise the change read from `{target_path}` within the chosen `{pass_scope}`. For each construct, ask whether one of the [taxonomy](ponytail/review-taxonomy#tags) tags applies: a deletion, a standard-library replacement, a language-native replacement, a YAGNI abstraction, or a shrinkable block.
- **Comment proportionality (hard trim):** Flag comment / doc blocks whose bulk is not proportional to the surrounding code they annotate — why-rationale does not excuse a comment larger than the code beneath it. Prefer `delete` (restating or disposable) or `shrink` (keep a short why). See [taxonomy — comment proportionality](ponytail/review-taxonomy#comment-proportionality).
- A higher `{lazy_intensity}` lowers the bar for flagging — `ultra` flags any construct a lazier rung could replace; `lite` flags only the clear wins.

### 2. Record one line per finding

- Write each finding as a single line in `{review_findings}` at `{findings_destination}` (standalone by default; a section of the caller's review artifact when supplied): the tag, the location, the simpler alternative, and the lines it would save.
- Keep to over-engineering. Do not record correctness, security, or performance findings — those belong to the [safety floor](ponytail/the-ladder#safety-floor), not this review.
- Never emit a `delete` finding against the lone smoke test or assert-based self-check — it is the ponytail minimum, not bloat.
- This review reports only: it lists findings into `{review_findings}` and applies nothing. The fixes are not made here.

### 3. Score the net

- Close with a `net: -N lines` scoreboard summing the savings across all findings. When the change carries no over-engineering, record the clean result as `Lean already. Ship.`
