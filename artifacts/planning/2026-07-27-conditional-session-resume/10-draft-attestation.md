# Draft Attestation — Conditional Session Resume

**Mode:** update · **Files:** 8 · **Attestation:** ready for batch review

Block statuses are against the committed `meta` at `origin/workflows` (`b3dc2506`). Detail on the one contested block is in the [file review note](09-file-review-note.md#g4b-mechanism-correction).

## Reviewed blocks

| Block | File | Status | Rationale |
|-------|------|--------|-----------|
| `version` | `meta/workflow.yaml` | modified | 5.8.0 → 5.9.0; minor, additive variable only |
| variable `resume_intent_requested` | `meta/workflow.yaml` | added | Boolean, `defaultValue: false`, one-line description; placed before `has_saved_state` so the block reads intent → saved state → slug → resuming |
| `version` | `meta/activities/00-discover-session.yaml` | modified | 7.2.1 → 7.3.0; minor, step added and gates changed |
| `rules[0]` | `meta/activities/00-discover-session.yaml` | modified | Replaced in place; states the precondition affirmatively and keeps the surface-via-checkpoint clause (removal 1) |
| step `detect-resume-intent` | `meta/activities/00-discover-session.yaml` | added | `kind: technique` binding `workflow-engine::detect-resume-intent`, positioned after the `workflow-selection` checkpoint |
| step `extract-context` | `meta/activities/00-discover-session.yaml` | modified | Gains `when: resume_intent_requested == true`; `when` placed after `technique:` per sibling convention in activities 01 and 02 |
| step `scan-planning-folders` | `meta/activities/00-discover-session.yaml` | modified | Same gate, same placement |
| step `match-session` | `meta/activities/00-discover-session.yaml` | modified | Same gate, same placement |
| step `record-match` | `meta/activities/00-discover-session.yaml` | modified | `when` → `matched_session != null` (removal 2). Both `set` actions retained — see the mechanism correction; this is the Gate-1-approved spec shape |
| step `record-no-match` | `meta/activities/00-discover-session.yaml` | modified | `when` → `matched_session == null`, so neither gate reads what the sibling's `set` wrote |
| checkpoint `resume-session` | `meta/activities/00-discover-session.yaml` | unchanged | Stays conditioned on `has_saved_state` alone, per approved assumption A-5 |
| checkpoint `workflow-selection` | `meta/activities/00-discover-session.yaml` | unchanged | Outside this change |
| `transitions` | `meta/activities/00-discover-session.yaml` | unchanged | Topology untouched |
| whole file | `meta/techniques/workflow-engine/detect-resume-intent.md` | added | Capability / Inputs / Outputs / Protocol per the normative template; Protocol cites the lexicon rather than embedding it (#29) |
| whole file | `meta/resources/resume-intent-lexicon.md` | added | Frontmatter `name` + `description` matching the three existing resources; affirmative table, negative cases, matching rule |
| `metadata.version` | `meta/techniques/workflow-engine/scan-saved-sessions.md` | modified | 1.0.0 → 1.1.0 |
| `## Outputs` description | `meta/techniques/workflow-engine/scan-saved-sessions.md` | modified | States which record supplies the entry fields (removal 3) |
| `## Protocol` | `meta/techniques/workflow-engine/scan-saved-sessions.md` | modified | Nested-`workflowId` arm added, verified against `schemas/session-file.schema.json:229-241` and a live `session.json`; empty-folder skip added; steps 1-2 preserved |
| Resource Index row | `meta/resources/README.md` | added | Additive; Removed table and Cross-Workflow Access untouched |
| `00. Discover Session` entry | `meta/activities/README.md` | modified | Conditional phrasing, lexicon link; rest of the entry preserved verbatim (removal 4) |
| header prose | `meta/README.md` | modified | v5.2.0 → v5.9.0 and the summary sentence carries the precondition |
| activity table row 00 | `meta/README.md` | modified | Role text states the precondition |
| mermaid flow legend | `meta/README.md` | modified | `discover-session` edge label carries `resume_intent_requested` |
| Resources table row | `meta/README.md` | added | Parallel to the `resources/README.md` index row |
| File Structure block | `meta/README.md` | modified | Lexicon added to the tree; stale `16 variables, 3 rules` corrected to `19 variables, 2 rules` |

## Binding fidelity pass

Every drafted step that binds an operation resolves (`check-all-refs`: 0 unresolved). `detect-resume-intent`'s only required input, `user_request`, is ambient caller context with no in-workflow producer — the same shape as the already-baselined `meta` entries for that input. No drafted activity step in this change persists a planning artifact, so the `manage-artifacts::write-artifact` binding requirement does not apply here.

**draft_attestation:** All 25 blocks are reviewed, understood, and intentional; no block is flagged for revision. One block — `record-match` — was drafted against the approved design specification rather than the Gate 2 relay's amendment, because the amendment's stated premise is contradicted by the schema; Gate 2 should confirm the correction ([detail](09-file-review-note.md#g4b-mechanism-correction)).
