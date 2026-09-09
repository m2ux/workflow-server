# Findings Register — `work-package`

**Date:** 2026-09-09 · **Mode:** Review, then Update
**Base ref:** `b5e545745e2f0e5a6ba63f5cb1a4f7e13f5e0b5c` (PR #635, the last remediation of this target) · **Targets:** `workflows/work-package`, 173 definition files
**Change surface:** 9 files (touched: 7 whole files + 2 relocations · I/O-contract closure: 1 · consumers: 2)

## Summary

| Severity | Raised | Applied | Known |
|----------|-------:|--------:|------:|
| Critical | 0 | 0 | 0 |
| High     | 2 | 2 | 0 |
| Medium   | 7 | 7 | 6 |
| Low      | 5 | 4 | 0 |

**Coverage:** walked 49 · not-applicable 6 · blocked 1 · paths read 76 of 173

Findings 1 and 3 landed on `workflow/prism-launch-results` (PR #663); finding 2 in the same branch after the design decisions under [Decisions](#decisions); finding 4 on `workflow/register-prefix-precedence` (PR #666) — all merged, with the corpus pointer and coverage stamp adopted in PR #665.

Findings 5 through 11 are the second reading batch, thirteen resource guides read whole plus the four resolvers they forced open. Findings 12 through 14 are the third, nine more resources and nine techniques. All applied on `workflow/wp-audit-batch2` (PR #668) except finding 14, which needs a content decision rather than a repair.

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
| 4 | Medium | `overlapping-rule-scopes` | `techniques/manage-registers/TECHNIQUE.md`, `created-lazily-and-unprefixed` | `manage-artifacts.artifact-prefix` states that artifact filenames carry the server prefix; this entry excepts the two registers. Both triggers hold for those two files, the handling differs, and neither entry named the other. | `pre-existing` | | Narrow `artifact-prefix` to the scope it always had, so the triggers stop intersecting. Precedence by dotted address was applied first and reverted — see [Decisions](#decisions). **Applied.** |
| 5 | High | `no-invented-naming`; conformance File naming | `resources/readme.md` | Tracked alongside `resources/README.md`. Lowercasing every tracked path in the corpus and looking for duplicates returns exactly one line, this file: on a case-insensitive filesystem the two tree entries map to one path, so the second checkout write clobbers the first and the working tree cannot be made clean. No sibling workflow mints such a file — `plain-language`, `workflow-authoring` and `workflow-design` each name `meta/resources/planning-readme.md` from their own index. Nothing referenced it but the two rows listing it, and its whole content was those same two pointers. | `pre-existing` | | Remove the file; the index rows read as the siblings' do. **Applied.** |
| 6 | Medium | `overlapping-rule-scopes` | `techniques/review-existing-feedback.md`, `unaddressed-blocker-caps-rating` + `techniques/review-summary.md`, `rating-cap-carve-in` | The first says the Overall Rating never exceeds the cap; the second says lift the cap where this review's findings refute the concern. Both hold when a Confirmed blocker-class concern is refuted by the consolidated analysis, the handling differs, and neither entry named the other. Each also carries the "findings being light" clause in its own words. `resources/prior-feedback-triage.md` adds a third home asserting the cap is "never recomputed elsewhere", which the carve-in falsifies. Settled by the technique that derives the value, not by any file stating the rule. | `pre-existing` | | Derive in the triage, decide at consolidation — the triage runs before any independent analysis by its own first step, so only the consumer has the findings the carve-in turns on. **Applied.** |
| 7 | Medium | `no-template-creation-guide` | `resources/pr-review-response.md`, Review Document Template | `respond-to-pr-review` declares artifact `{YYYY-MM-DD}-pr{pr_number}-review-analysis.md` for a human audience and cites this anchor twice as its shape. The anchor held a numbered list of seven section names, the only guide in the folder without a skeleton. Two of the seven are sections the group contract bound in the same activity rules out: `lean-header` names "a metadata block" as what a single context line replaces, and `state-once-per-artifact` names "a closing recap that restates the sections". | `pre-existing` | | A real template; the two forbidden sections replaced by what they were reaching for. **Applied.** |
| 8 | Medium | Principle 6, One Authoritative Home | `resources/github-issue-creation.md` + `resources/jira-issue-creation.md` | Both authored the same body — Problem Statement with Current and Desired state, Goal, Scope, User Stories, Success Metrics, Constraints, References — with near-identical placeholder prose, and three of five anti-patterns restated each other. Only the platform routing decided which copy a run saw, so an edit to one never reached the other. Reading the GitHub guide for platform-specific content found none. | `pre-existing` | | The neutral guide is that file renamed `issue-creation`; the Jira guide keeps its real delta and a Field Arrangement section. **Applied.** |
| 9 | Low | `state-once-per-artifact` | `resources/implementation-analysis.md`; `resources/knowledge-base-research.md`; `resources/wp-plan.md` | Each template opens with a lean header carrying the document's status and closes with a `**Status:**` field carrying it again, so a conforming artifact states it twice and a later pass can update either. **Scope corrected in batch 3:** first reported as two files on a search intersecting the literal `Draft/Complete` token, which missed `wp-plan.md`'s `[Planning/Ready/In Progress/Complete]`. Re-derived by matching any lifecycle value in a blockquote header against any `**Status:**` line, the set is three. | `pre-existing` | | Drop the closing field; the header is the home. **Applied** — two files in the first commit, the third after the corrected search. |
| 10 | Low | `single-rule-authority` | `resources/pr-description.md`, Rules | "Changes carry no file list" and "Changes carry no code" are strict subsets of "Changes state the substance, not the surface", which reconciled itself to them in prose — "which is why the rules above rule out paths, code and commit headers one at a time". A cross-reference written to reconcile entries rather than cite one is the tell the entry names. Since the section states each rule yields one finding per failure, a single bullet pasting a path yielded three. | `pre-existing` | | Fold the specifics into the substance criterion as conditions; keep grouping separate. No file cited either deleted heading. **Applied.** |
| 11 | Low | `no-duplicated-guidance` | `resources/review-mode.md`, Header Fields | Restated the findings constraint in near-identical words to `techniques/TECHNIQUE.md`, `findings-constraint`, which owns it and which `review-summary` applies by name at consolidation. Neither the enforcement point nor what that section covers — its own decomposition list scopes Header Fields to the header and its link conventions. | `pre-existing` | | Delete the restatement; the rule keeps its one home. **Applied.** |

| 12 | Medium | `technique-outputs-declared` | `techniques/assess-ticket-completeness.md` | Protocol records each weak or missing ticket dimension into `{assumptions_log}`, which the technique declares as an input only; its sole output is the boolean the checkpoint gates on. The flag is declared and the content is not, so the write is invisible to the activity's variable model and to a reader of the contract. Settled at the bind site in `activities/02-design-philosophy.yaml`, which carries no input or output remap, so the value crosses by same-name bag presence. Both other writers of that log in the same activity declare what they write. | `pre-existing` | | Declare it as an output naming what the pass leaves in the log, with no `#### artifact` — the filename home stays with `review-assumptions/record.md`, which is the shape `analyse-challenge/combine.md` already uses. **Applied.** |
| 13 | Low | `no-duplicated-guidance` | `techniques/codebase-comprehension/TECHNIQUE.md`, `deep_dives`; `techniques/plan-prepare/TECHNIQUE.md`, `tasks` | Each container declares a nested output component that the operation producing it also declares, and both pairs have drifted. The comprehension container calls `deep_dives` "targeted exploration sections added during user-driven loop" where the operation calls them "findings for the selected area: traced data flows, implementation detail, and edge cases" — sections against findings, a user-driven loop against a selected area. The plan container's `tasks` is a shortened prefix of the operation's. Checked across all twelve work-package containers declaring outputs; the only two overlaps. | `pre-existing` | | Keep the operation's statement — it produces the value, carries the fuller description, and sits beside the artifact and audience declarations for the same output. **Applied.** |
| 14 | Low | `no-contradictory-rules` | `resources/rust-substrate-code-review.md` | The declared `Category` vocabulary offers six values including `Security`, the Review Criteria section has five numbered categories with security criteria sitting as a subsection under Substrate Framework, and the Method Record's Compliance instruction names the same five and omits Security. A finding categorised `Security` therefore has no criteria section of its own and no compliance row to be scored in. | `pre-existing` | | Open — whether Security becomes a sixth peer with its own criteria, or leaves the vocabulary, is a judgement about what belongs in a Rust review rather than a defect with one repair. **Not applied.** |

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
| The four templated artifact names are a case `artifact-prefix` leaves undetermined | Raised as a check on the rule narrowed in finding 4. `write-artifact`'s Protocol settles it the other way: a token-templated name is a bare filename that happens to contain tokens, it takes the writing activity's prefix like any other, and each interpolation is its own logical artifact. The narrowed rule is complete. |
| `review-mode.md` states the Prior-Feedback table's shape carve-out twice | The category section's statement links the shared Table Format section it excepts, which is the cite-don't-restate shape rather than a second home. |
| `requirements-elicitation.md` links `assumptions-log.md`, which no resource is | Correct by design: the link is inside a template, so it resolves in the produced artifact against the register `review-assumptions/record.md` declares. |
| `resources/pr-description.md` cites `manage-artifacts.single-source-and-link` by dotted address rather than a resolvable link | A dotted address names a rule for a reader; the anchored-link convention governs resource and section citations. Both forms appear across the corpus for their own purposes. |
| Group containers declaring `## Outputs` at all is a convention divergence | The corpus discriminates the form, not the file: 29 of 79 containers declare outputs, 12 of them in this workflow. Only the nested-component overlap survives, as finding 13. |
| `resources/web-research.md` carries no `## Rules` and no line budget | Its section appends to the research document, whose budget the knowledge-base guide states. A second budget over the same artifact would be the defect. |
| `techniques/codebase-comprehension/deep-dive.md` braces `{codebase_area}` in its artifact name while Protocol binds `{$codebase_area}` | The corpus uses the unprefixed token consistently for this artifact — the resources index guide-map row spells it the same way — and `check:set-action-values` reads the pair without complaint. A claim about how the token resolves belongs to the schema and the loader, neither of which this pass read. |

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | Creation Rules | `not-applicable` — scoped by its own text to authoring the catalogue |
| Anti-Patterns | Tool-Technique-Doc Consistency | `blocked` — its entries compare authored claims against the live harness tool surface, which this pass did not read |
| Design Principles | Internalize Before Producing; Define Complete Scope; Clarify Before Assuming; Confirm Before Irreversible Changes; Close the Loop | `not-applicable` — session-conduct stances with no authored construct on this surface |

**Unit residual: 1 `blocked`.**

## File coverage

read 76 · unread 97 — summing to 173, the target's size at the audited commit.

**First batch** — `workflow.yaml`; all 15 activity YAMLs; `activities/README.md`; `techniques/README.md`; `techniques/{strategic-findings-analysis,review-summary,findings-classification}.md`; `techniques/conduct-retrospective/retrospective.md`; `techniques/finalize-documentation/render-token-usage.md`; `techniques/{manage-registers,manage-artifacts}/TECHNIQUE.md`; `README.md`; `REVIEW-MODE.md`; `resources/{README,readme-seed,canonical-home-map,adr,architecture-review,architecture-summary,assumption-reconciliation,assumptions-review,codebase-comprehension,complete-wp-guide,deferred-items,design-framework,findings-report,follow-ups}.md`.

**Second batch** — `resources/{github-issue-creation,implementation-analysis,jira-issue-creation,knowledge-base-research,manual-diff-review,pr-description,pr-review-response,prior-feedback-triage,provenance-log,readme,requirements-elicitation,research-reconciliation,review-mode}.md`, plus the four resolvers those readings forced open and which were read whole rather than sampled: `techniques/TECHNIQUE.md`, `techniques/review-existing-feedback.md`, `techniques/respond-to-pr-review.md`, `techniques/manage-artifacts/write-artifact.md`.

**Third batch** — `resources/{rust-substrate-code-review,strategic-review,symbol-provenance,tdd-concepts-rust,test-plan,test-suite-review,web-research,workflow-retrospective,wp-plan}.md`; `techniques/analyse-challenge/{TECHNIQUE,challenge,combine}.md`; `techniques/{apply-review-fixes,assess-ticket-completeness}.md`; `techniques/codebase-comprehension/{TECHNIQUE,deep-dive,revise-questions}.md`; and `techniques/plan-prepare/TECHNIQUE.md`, opened as the second instance of finding 13.

The 97 `unread` paths are the rest of `resources/` and `techniques/`. They are the residual this pass hands on, and the next pass starts its reading there. Every existence claim above is bounded by the 76 read plus the resolutions named in each Evidence cell.

Finding 5 removes one path, so a pass enumerating the target after PR #668 finds 172 and a residual of 96.

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
| How finding 4's two rules stop colliding | Narrow `artifact-prefix` to its own scope, splitting the triggers. Precedence by dotted address was applied first and reverted on challenge: it made `manage-registers` track a rule name it does not own, so renaming the prefix rule would falsify the claim with nothing failing. The entry's Fix ranks consolidation first and splitting equally valid where the split reflects a real distinction, and one owning activity against none is that distinction. Both commits are in PR #666's history |
| Where the rating cap's two answers separate | Producer sets, consumer decides — the triage derives the cap and defers, the carve-in stays the sole home for lifting. Folding the carve-in into the producer was rejected because the triage runs before any independent analysis by its own first step, so it cannot see the findings the carve-in turns on. Ordering the two by dotted address was rejected as the shape already withdrawn on finding 4 |
| How the duplicated issue-body template is homed | A platform-neutral home, reached by renaming rather than adding a file: reading the GitHub guide for platform-specific content found none, so a third file would have sat beside one that shrank to nothing. Folding Jira into it entirely was rejected — a GitHub run would then load the Jira terminology map, markup table and priority scale it never uses, which is the delivery cost section-grain resources exist to avoid |

## Sources

| Label | Path |
|---|---|
| Guard suite | `npm run check:all` — 38 pass, 0 fail, 0 unmeasured, run against each remediation branch in its own worktree via `WORKFLOWS_DIR`. On the batch-2 branch its first run failed, naming the section-framing ledger's entry for the path finding 5 removes as stale |
| Option-coverage walk | `npm run test:coverage-walk` — reachability passes over 1250s; the freshness half failed on stamp drift predating this work, closed by PR #665 |
| Binding-fidelity triage | `scripts/binding-fidelity-triage.json` — stamp one merge behind the audited corpus; the drift touched no work-package entry, and the one entry whose cited file changed was re-affirmed |
| Canonical-home-map triage | `scripts/canonical-home-map-triage.json` — 4 `workflow-design` rows as `fix-later` |
| Criteria homes | `workflows/workflow-design/resources/{design-principles,anti-patterns,schema-construct-inventory,convention-conformance}.md` |
| Guard registry | `scripts/guards.ts` |
| Prior pass | [2026-09-07 sweep](../2026-09-07-canon-audit-work-package-sweep/findings-register.md) |
| Changes | PR #663 (corpus), #664 (the check), #665 (pointer and stamp adoption), #666 (finding 4), #668 (findings 5–11) |
| Guard candidates | Finding 9 is filable, and batch 3 strengthened the case: the hand-search that reported two instances missed a third, which is exactly the failure a check does not have. Finding 13 is filable and mechanical — a nested output component declared on both a group container and one of its operations, which fired twice with both pairs drifted. Finding 6 is `overlapping-rule-scopes`' second appearance in this audit, which meets the entry threshold, but its Detect asks whether an input exists satisfying two triggers, which no pattern decides |
| Adjacent target noted, not audited | The corpus holds a separate 33-file `work-packages` workflow whose name differs from this target by one character. Nothing in this audit reaches it, and the near-collision is recorded here only so a later pass does not mistake one enumeration for the other |
