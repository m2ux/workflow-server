# Drafting Plan — Conditional Session Resume

**Target:** `meta` v5.8.0 → v5.9.0 · **Mode:** update · **Files:** 8
**Manifest:** [scope manifest](07-scope-manifest.md) · **Basis:** [design specification](03-design-specification.md)

Per-file drafting approach, in the tier order the scope manifest fixes.

---

## Mechanism correction settled before drafting

G4(b)'s drafted shape turns on who evaluates gates. The correction and its evidence are in the [file review note](09-file-review-note.md#g4b-mechanism-correction); the durability consequence is in [impact §2](06-impact-analysis.md#2-integrity-checks). Net effect on this plan: `record-match` is drafted to the Gate-1-approved specification shape.

---

## Tier 1 — variable declaration

### 1. `workflow.yaml`

Insert `resume_intent_requested` immediately before `has_saved_state`, so the block reads intent → saved state → slug → resuming. One-line description per `variable-description-one-line`; `defaultValue: false` keeps an intent-free request on the fast path. Bump `version` 5.8.0 → 5.9.0 (minor: additive variable, no removed declaration).

## Tier 2 — techniques and resource

### 2. `techniques/workflow-engine/detect-resume-intent.md` (new)

Standalone nested technique: `metadata.version: 1.0.0`, `## Capability`, `## Inputs` (`user_request`), `## Outputs` (`resume_intent_requested`), `## Protocol`. Protocol cites the lexicon by file-relative link (`../../resources/resume-intent-lexicon.md`) and states the match action only — the vocabulary itself stays in the resource per Cite Resource Policy (#29). Capability phrased as the delivered contract, not the procedure (#13).

### 3. `resources/resume-intent-lexicon.md` (new)

Frontmatter `name` + `description`, matching the three existing resources. Body: an affirmative phrase table, a short negative-case list (so "start" and "new" are not read as continuation), and a matching rule covering case and word-boundary handling. No Protocol — a resource is reference material.

### 4. `techniques/workflow-engine/scan-saved-sessions.md`

Rewrite Protocol step 3 and the `saved_session_candidates` description so the filter reads the client id at `triggeredWorkflows[].workflowId`, retaining the top-level `workflowId` arm for a directly-written client file. Confirmed against this session's own `session.json` and `schemas/session-file.schema.json:229-241`. Keep steps 1-2 and the entry shape. Bump `metadata.version` 1.0.0 → 1.1.0.

## Tier 3 — activity

### 5. `activities/00-discover-session.yaml`

Five edits, all inside the existing step list:

| Edit | Shape |
|------|-------|
| Rule 1 | Replaced in place, stating the intent precondition affirmatively (#17); the surface-via-checkpoint clause is retained |
| New step `detect-resume-intent` | `kind: technique` binding `workflow-engine::detect-resume-intent`, inserted after the `workflow-selection` checkpoint |
| Search trio | `extract-context`, `scan-planning-folders`, `match-session` each gain `when: resume_intent_requested == true` |
| `record-match` | `when` becomes `matched_session != null`; both `set` actions retained |
| `record-no-match` | `when` becomes `matched_session == null`, so the pair is mutually exclusive and neither gate reads what the other's `set` wrote |

Bump `version` 7.2.1 → 7.3.0. The `record-no-match` alignment is in scope as a direct consequence of the `record-match` repair: leaving it reading `has_saved_state == false` would keep a gate depending on an `action: set` value, which is the dependency #166 B7/B12 removes.

## Tier 4 — orientation

### 6. `resources/README.md`

Append one Resource Index row for `resume-intent-lexicon`. Additive only; the Removed table and Cross-Workflow Access section are untouched.

### 7. `activities/README.md`

Rewrite the `00. Discover Session` entry so the scan is described as conditional on stated intent, deleting the "even when the user said 'start'" clause (removal 4). The rest of the entry — catalog matching, identifying-context extraction, both checkpoints, the transition pointer — is preserved verbatim.

### 8. `README.md`

Three touches: header prose version to v5.9.0 (currently a stale v5.2.0 against a v5.8.0 definition), the `discover-session` mermaid edge label to carry `resume_intent_requested`, and the activity-table role text for row 00 to state the precondition.

---

## Not drafted

`extract-identifying-context.md`, `01-initialize-session.yaml`, and the parent repo's `src/`, `tests/`, `docs/`, `schemas/` — out of scope per the [scope manifest](07-scope-manifest.md#file-manifest).
