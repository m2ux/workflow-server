# Anti-Pattern Findings — `meta`

**Mode:** update · **Date:** 2026-07-27
**Pass:** anti-patterns
**Target:** `meta` v5.9.0 · post-commit walk of `b3dc2506..aea417ec` (9 files, +106 −18)

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| PA-1 | Low | `contract-not-procedure` — Protocol step 2 is a trailing pure projection of the declared Output: it restates the Output description's true/false mapping verbatim and produces no distinct outcome. Both siblings (`extract-identifying-context`, `match-saved-session`) emit their output inline in a single Protocol step | `meta/techniques/workflow-engine/detect-resume-intent.md` — Protocol step 2 (L25) | Delete step 2; have step 1 emit `{resume_intent_requested}` from the lexicon match |
| PA-2 | Low | `readme-orients-not-transcribes` — the File Structure tree states workflow `variables` / `rules` inventory counts, which Detect names directly and Do-not-flag admits only "file structure overview **without** counts". The line had already drifted (`16 variables, 3 rules` against an actual 18 and 2) and this change re-stated the counts instead of dropping them | `meta/README.md` — File Structure, `workflow.yaml` entry (L124) | Drop the parenthetical: `# Meta workflow definition` |
| PA-3 | Low | `no-rationale-in-description` — Protocol step 3's trailing clause justifies why the step exists ("so both arms are needed to reach every session-bearing folder"); Detect covers procedure bullets, and the rationale is already homed in [design specification § G4](03-design-specification.md) | `meta/techniques/workflow-engine/scan-saved-sessions.md` — Protocol step 3 (L26) | Cut the "so both arms are needed…" clause; keep the preceding data-shape fact the step operates on |
| PA-4 | Low | `procedure-in-io-contract` (boundary) — the Output description carries a compressed sourcing clause that Protocol step 4 already owns in full, and the compression is inaccurate for the top-level arm, where the record is the meta session rather than a "client record" | `meta/techniques/workflow-engine/scan-saved-sessions.md` — `saved_session_candidates` (L20) | Reduce the Output to shape and meaning (one entry per planning folder recording a session for `{target_workflow_id}`); leave sub-field sourcing to Protocol step 4 |

**Finding count:** 4

## Resolution

All four fixed in the post-update remedia cycle (1 iteration); re-audit returned 0.

| ID | File edited | Change applied |
|----|-------------|----------------|
| PA-1 | `meta/techniques/workflow-engine/detect-resume-intent.md` | Protocol step 2 deleted; step 1 now ends "…and emit `{resume_intent_requested}`", matching the single-step emit-in-place shape of `extract-identifying-context` and `match-saved-session` |
| PA-2 | `meta/README.md` | `# Meta workflow definition (19 variables, 2 rules)` → `# Meta workflow definition`; tree alignment preserved |
| PA-3 | `meta/techniques/workflow-engine/scan-saved-sessions.md` | Protocol step 3's trailing "A meta-orchestrated run records… so both arms are needed…" sentence deleted; the disjunction step 4 refers to as the nested and top-level arms is unchanged |
| PA-4 | `meta/techniques/workflow-engine/scan-saved-sessions.md` | `saved_session_candidates` reduced to shape and meaning — "…entries, one per planning folder recording a session for `{target_workflow_id}`"; sub-field sourcing stays solely in Protocol step 4 |

**Post-fix validation.** `validate-workflow-yaml.ts` — 6 files pass, 0 fail, no unanchored protocol references. `check-all-refs.ts` — 0 unresolved. `check-binding-fidelity.ts` — 0 NEW. `check-technique-template.ts` and `check-variable-model.ts` clean. `check-resource-anchors.ts` — the same 3 pre-existing broken links, none in a changed file.

**No collateral removal.** Each edit is the smallest change its finding calls for. The two consequential edits inside AP-127 that no finding named are recorded in [conformance findings § Resolution](08-conformance-findings.md#resolution).

## Notes

- **Surface evidence for the Tool-Technique-Doc entries.** `consistent-tool-names` / `no-false-resource-delivery` / `complete-bootstrap-path` / `describe-tool-value` / `no-redundant-tools` were checked against the actual harness surface (`src/schema/activity.schema.ts`, `src/schema/condition.schema.ts`, `src/tools/`) and the authoritative bootstrap resource: the change names no harness tool and makes no return-shape or bootstrap claim. No finding.
- **Cleared, with evidence — the `exists` / `notExists` gate pair.** `match-saved-session` declares `matched_session` as "or null when none match", and `evaluateSimpleCondition` in `src/schema/condition.schema.ts:60-61` resolves `exists` as `value !== undefined && value !== null` and `notExists` as its complement. The search-skipped path (variable absent) and the searched-but-unmatched path (variable null) therefore both route to `record-no-match`, and `resume-session` cannot fire spuriously. The pre-commit F-1 repair holds under the reference implementation.
- **Cleared — `no-derived-state-shadow` / `mode-as-state`.** `resume_intent_requested` is not a projection of `has_saved_state` or of any other declared variable; `resume-session` still gates on `has_saved_state` alone, with no compound shadow.
- **Cleared — `no-activity-prose-rules`.** The `rules:` block and its single entry were deleted from `00-discover-session.yaml`, reaching the entry's mandated end state (no activity `rules:` block) rather than merely rewording the rule.
- **Cleared — `no-set-of-technique-output` / `no-valueless-control-set`.** `record-match` and `record-no-match` are `kind: action` steps with no technique binding, and every `set` carries a `value:` — the value-bearing control-set carve-out.
- **Cleared — `variable-description-one-line`, `boolean-id-shape`, `snake-case-symbols`.** `resume_intent_requested` is a one-line description with no producer/consumer/gate tail, and an affirmative `<noun>_<participle>` predicate id.
- **Cleared — `resource-fills-not-does` / `no-resource-caller-backlink` on the new lexicon.** `## Matching` holds matching semantics for a consult vocabulary (an explicit carve-out), and the intro and frontmatter name what the file *is* with no caller link or gate narration. The two resource-*index* rows that do name the consuming technique sit in READMEs, not in the resource, and match every sibling row in the same tables.
- **Considered, not flagged — `readme-orients-not-transcribes` on `meta/activities/README.md`.** The `00. Discover Session` paragraph enumerates the activity's step order and both checkpoints with their conditions, and this change lengthened that enumeration by one step. The shape is the pre-existing house pattern for all five entries in the file (and for `activities/README.md` across the library); correcting it means a library-wide convention change, outside this session's scope. Recorded in [deferred items](05-deferred-items.md).
- **Considered, not flagged — `avoidance-voice-in-definitions` on `outcome[1]`.** "no search performed otherwise" states the else-branch outcome rather than framing against the prior design, and Detect excludes "not every English negation".
- **Considered, not flagged — AP-127 against itself.** The new entry's own literals (`~/projects/work/workflows/`, `workflows`, "eight design dimensions") sit on the exemplar line, which its Do-not-flag exempts. `meta` as a literal in `scan-saved-sessions` Protocol step 3 has no declared slot and is a fixed constant, which the same Detect excludes — PA-3 removes the clause for a different reason.
