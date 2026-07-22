---
metadata:
  version: 1.0.0
---

## Capability

Challenge findings folded into the concern set with convergence/residue flags for the run-loop.

## Inputs

### challenge_findings

Ordered per-perspective findings from the challenge pass.

### concern_kind

Domain of the open set (`assumptions`, `open_questions`, …).

### assumptions_log

*(optional)* Assumptions log to update in place when `concern_kind` is `assumptions`.

### comprehension_artifact

*(optional)* Comprehension artifact whose Open Questions table is updated when `concern_kind` is `open_questions`.

### convergence_flag

Bag name of the boolean set true when further analyse/challenge is warranted.

### residue_flag

Bag name of the boolean set true iff irreducible opens remain after this combine.

### residue_collection

*(optional)* Bag name for the residual open collection to emit.

## Outputs

### assumptions_log

*(when applicable)* Log updated with challenge resolutions and newly surfaced items.

### comprehension_artifact

*(when applicable)* Artifact with Open Questions updated from the challenge-pass outcomes.

### convergence_flag

Bound flag: true if any item remains agent-resolvable (or newly surfaced as such); false when only irreducible residue (or empty set) remains.

### residue_flag

Bound flag: true iff irreducible opens remain for activity-level residual interview/batch.

### residue_collection

*(optional)* Residual open items when a collection name was supplied.

### open_assumptions

*(when concern_kind is assumptions)* Residual stakeholder-dependent opens — empty when none remain.

### has_resolvable_assumptions

*(when concern_kind is assumptions)* Same semantics as the convergence flag for the assumptions domain.

### has_open_assumptions

*(when concern_kind is assumptions)* Same semantics as the residue flag for the assumptions domain.

### needs_comprehension

*(when concern_kind is open_questions)* Convergence flag for comprehension bindings.

### has_open_questions

*(when concern_kind is open_questions)* Residue flag for comprehension bindings.

## Protocol

### 1. Merge Findings

- Walk `{challenge_findings}` in order; for each concern id, reconcile perspective outcomes (prefer evidence-backed `resolved-by-challenge` over bare `confirmed`)
- Apply resolutions to `{assumptions_log}` or the Open Questions table: resolved items get Outcome/resolution text; newly surfaced items are appended as open with classification
- Items marked `weakened` stay open but gain challenge notes for residual presentation

### 2. Reclassify and Set Flags

- Reclassify remaining opens: agent-resolvable → keep `{convergence_flag}` true; stakeholder/irreducible only → `{convergence_flag}` false and `{residue_flag}` true; none open → both false
- Emit `{residue_collection}` / `{open_assumptions}` as the irreducible set (empty when none)
- When `concern_kind` is `assumptions`, also bind `{has_resolvable_assumptions}` and `{has_open_assumptions}` to the same truths for existing activity conditions

### 3. Authority

- The log (or Open Questions table) remains the single source of truth — do not restate concern bodies elsewhere


## Rules

### combine-owns-flags

Only combine writes convergence and residue flags after a challenge pass. Analyse may set them during its phase; challenge units must not.

### empty-set-is-success

An empty open set after combine is a valid terminal state — `{residue_flag}` false, no interview required.
