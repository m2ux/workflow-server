---
metadata:
  version: 1.1.0
---

## Capability

Challenge findings folded into the concern set with convergence/residue flags for the run-loop.

## Inputs

### challenge_findings

Ordered per-perspective findings from the challenge pass.

### residue_collection

*(optional)* Bag name for the residual open collection to emit.

## Outputs

### concern_document

The concern document with challenge resolutions applied and newly surfaced items appended.

### convergence_flag

Bound flag: true if any item remains agent-resolvable (or newly surfaced as such); false when only irreducible residue (or empty set) remains.

### residue_flag

Bound flag: true iff irreducible opens remain for activity-level residual interview/batch.

### residue_collection

*(optional)* Residual open items when a collection name was supplied.

## Protocol

### 1. Merge Findings

- Walk `{challenge_findings}` in order; for each concern id, reconcile perspective outcomes (prefer evidence-backed `resolved-by-challenge` over bare `confirmed`)
- Apply resolutions to `{concern_document}`: resolved items get Outcome/resolution text; newly surfaced items are appended as open with classification
- Items marked `weakened` stay open but gain challenge notes for residual presentation

### 2. Reclassify and Set Flags

- Reclassify remaining opens: agent-resolvable → keep `{convergence_flag}` true; stakeholder/irreducible only → `{convergence_flag}` false and `{residue_flag}` true; none open → both false
- Emit `{residue_collection}` as the irreducible set (empty when none)

### 3. Authority

- `{concern_document}` remains the single source of truth — do not restate concern bodies elsewhere

## Rules

### combine-owns-flags

Only combine writes convergence and residue flags after a challenge pass. Analyse may set them during its phase; challenge units must not.

### empty-set-is-success

An empty open set after combine is a valid terminal state — `{residue_flag}` false, no interview required.
