# Findings Register — `work-package`

**Date:** 2026-09-09 · **Mode:** Review, then Update
**Base ref:** `b5e545745e2f0e5a6ba63f5cb1a4f7e13f5e0b5c` (PR #635, the last remediation of this target) · **Targets:** `workflows/work-package`, 173 definition files
**Change surface:** 9 files (touched: 7 whole files + 2 relocations · I/O-contract closure: 1 · consumers: 2)

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 0 | 0 |
| High     | 0 | 0 |
| Medium   | 2 | 6 |
| Low      | 0 | 0 |

**Coverage:** walked 49 · not-applicable 6 · blocked 1 · paths read 39 of 173

Findings 1 and 3 were applied on `workflow/prism-launch-results` (PR #663, merged). Finding 2 was applied in the same branch after the design decisions recorded under [Decisions](#decisions). Finding 4 is applied and unmerged.

## Change surface

| Path | How it joined |
|------|----------------|
| `activities/10-post-impl-review.yaml` | touched (whole file); also I/O-contract closure — references `meta/techniques/workflow-engine/handle-sub-workflow.md`, whose Outputs gained `child_planning_folder_path` |
| `activities/11-validate.yaml` | touched (whole file) |
| `activities/README.md` | touched (whole file) |
| `resources/README.md` | touched (whole file) |
| `resources/canonical-home-map.md` | touched (whole file) |
| `techniques/conduct-retrospective/retrospective.md` | touched (whole file) |
| `techniques/finalize-documentation/render-token-usage.md` | touched (whole file) |
| `resources/session-trace.md` · `resources/token-usage.md` | touched (relocated to `meta/resources/`) |
| `prism-audit/workflow.yaml` equivalent — `remediate-vuln/workflow.yaml` | consumer — borrows both touched activities |
| `remediate-vuln/activities/README.md` | consumer — references the touched activities README |

## Findings

### `work-package`

| ID | Severity | Entry | Location | Evidence | Origin | Known | Fix |
|----|----------|-------|----------|----------|--------|-------|-----|
| 1 | High | `cited-home-owns-claim` | `resources/canonical-home-map.md`, Map row for research findings | Named `knowledge-base-research.md` as the home. That is the guide resource; the persisted artifact is `kb-research.md`, declared on `techniques/research/document.md` and mapped in the resources index. `verify-artifact-conforms` is bound with this map, so the gate asked every template to link a home no run writes. | `pre-existing` | | Point the row at the artifact filename the producing technique declares. **Applied.** |
| 2 | Medium | *(no covering entry)* | `activities/10-post-impl-review.yaml`, `dispatch-prism` | Bound `workflow-engine::handle-sub-workflow` with no output remap; the activity declared no prism-derived name and no later step consumed one. On the complex path the pipeline ran and its product reached nothing, while the activity's outcome claimed structural risks were identified for triage. | `diff` — contract-drift at a referencer | | Read the manifest, carry findings on one slot from both paths. **Applied.** |
| 3 | Medium | `instruction-narrates-an-actor` | `techniques/conduct-retrospective/retrospective.md`; `techniques/finalize-documentation/render-token-usage.md` | Each closed a write with an account of a later revision folding in the terminal activity's own dispatch. That revision belongs to `meta` `workflow-engine::revise-session-metrics`; a close-out worker can neither observe nor act on it, and each instruction is complete without it. | `pre-existing` | | Delete the narration. **Applied.** |
| 4 | Medium | `overlapping-rule-scopes` | `techniques/manage-registers/TECHNIQUE.md`, `created-lazily-and-unprefixed` | `manage-artifacts.artifact-prefix` states that artifact filenames carry the server prefix; this entry excepts the two registers. Both triggers hold for those two files, the handling differs, and neither entry named the other. | `pre-existing` | | State the precedence in the narrower entry by dotted address. **Applied, unmerged.** |

### Withdrawn on adversarial re-derivation

| Candidate | Why it fell |
|---|---|
| A clean strategic review routes to `review-failed` and loops to planning | `strategic-findings-analysis` sets `review_passed` on the finding-free path; the gates are not its only producer. |
| The review-mode skeleton interpolates four names no technique declares | Template section slots filled from `classified_findings`, each cited by its own anchor. Matches the ledger's `artifact-template-placeholder` rationale. |
| Guide-map rows for the two relocated resources dangle | Both rows already repoint to `meta/resources/`; `check:artifact-guides` passes. |
| `readme-seed` hard-codes a numeric prefix in two register links | Corpus form of that table, and its own notes state the rule. |
| `pr_number` declared on both a group container and the workflow root | The entry carves out container files and `check:inherited-inputs` passes. |
| Borrowed activities' exits unread against their second entry | `remediate-vuln` binds both exits identically to work-package. |
| `{pr_reference}` in `REVIEW-MODE.md` names no declared value | Declared as an input on `review-mode-detection`. |
| The two registers' declared artifacts conflict with five documents calling them unprefixed | `manage-registers.created-lazily-and-unprefixed` owns the behaviour, `write-artifact`'s prefix input is optional, and neither operation passes it. Reported High before the container contract was opened; the residue is finding 4. |

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | Creation Rules | `not-applicable` — scoped by its own text to authoring the catalogue |
| Anti-Patterns | Tool-Technique-Doc Consistency | `blocked` — its entries compare authored claims against the live harness tool surface, which this pass did not read |
| Design Principles | Internalize Before Producing; Define Complete Scope; Clarify Before Assuming; Confirm Before Irreversible Changes; Close the Loop | `not-applicable` — session-conduct stances with no authored construct on this surface |

**Unit residual: 1 `blocked`.**

## File coverage

read 39 · unread 134 — summing to 173.

Read whole: `workflow.yaml`; all 15 activity YAMLs; `activities/README.md`; `techniques/README.md`; `techniques/{strategic-findings-analysis,review-summary,findings-classification}.md`; `techniques/conduct-retrospective/retrospective.md`; `techniques/finalize-documentation/render-token-usage.md`; `techniques/manage-registers/TECHNIQUE.md`; `README.md`; `REVIEW-MODE.md`; `resources/{README,readme-seed,canonical-home-map,adr,architecture-review,architecture-summary,assumption-reconciliation,assumptions-review,codebase-comprehension,complete-wp-guide,deferred-items,design-framework,findings-report,follow-ups}.md`.

The 134 `unread` paths are the rest of `resources/` and `techniques/`. They are the residual this pass hands on, and the next pass starts its reading there. Every existence claim above is bounded by the 39 read plus the resolutions named in each Evidence cell.

## Known

Six items the 2026-09-07 pass accepted as design decisions, excluded from the decision surface.

| Key | Where accepted |
|---|---|
| Five gates carrying options that route identically | 2026-09-07 register, held 11 |
| Two elicitation operations running the interview | held 2 (partial) |
| One bag name carrying three declared meanings | held 10 (partial) |
| The two lazily created registers as declared artifacts | held 16 — superseded: the artifacts are declared and the group rule owns the prefix; the residue is finding 4 |
| Complexity assigned by the path gate | held 28 |
| The comprehension exit's predicate | held 41 |

## Decisions

| Question | Decision |
|---|---|
| How structural findings reach the classifier | Normalize both paths onto one `structural_findings` slot; the classifier gains one optional input and never learns which pipeline produced them |
| Whether the launched run's artifacts are link-reachable | Settled from the server: for a persistent parent, `dispatch_child` embeds the child and returns the parent's own planning folder, so the artifacts sit alongside every other planning artifact |
| How much stale prose the change sweeps | Both occurrences, in this change |
| Which hand-walked units become guards | The canonical-home-map check only; a check keyed on prose naming the terminal activity would freeze the phrasings its author saw |

## Sources

| Label | Path |
|---|---|
| Guard suite | `npm run check:all` — 38 pass, 0 fail, 0 unmeasured with PR #665 applied |
| Option-coverage walk | `npm run test:coverage-walk` — reachability passes over 1250s; the freshness half failed on stamp drift predating this work, closed by PR #665 |
| Binding-fidelity triage | `scripts/binding-fidelity-triage.json` — stamp one merge behind the audited corpus; the drift touched no work-package entry, and the one entry whose cited file changed was re-affirmed |
| Canonical-home-map triage | `scripts/canonical-home-map-triage.json` — 4 `workflow-design` rows as `fix-later` |
| Criteria homes | `workflows/workflow-design/resources/{design-principles,anti-patterns,schema-construct-inventory,convention-conformance}.md` |
| Guard registry | `scripts/guards.ts` |
| Prior pass | [2026-09-07 sweep](../2026-09-07-canon-audit-work-package-sweep/findings-register.md) |
| Changes | PR #663 (corpus), #664 (the check), #665 (pointer and stamp adoption) |
