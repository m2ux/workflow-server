# Findings Register — `work-package`

**Date:** 2026-09-06 · **Mode:** Review, then Update
**Base ref:** `330cec2872374180acab64c34360fb00db24b02c` (corpus HEAD at audit time) · **Targets:** `workflows/work-package` (171 definition files)
**Change surface:** 0 files at audit time (touched: 0 · I/O-contract closure: 0 · consumers: 0)

A standalone audit of the target at HEAD with no change under audit, so every Origin is `pre-existing` relative to this base ref. Remediation followed in the same session; the Disposition column records where each finding was closed.

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 0 | 0 |
| High     | 0 (6 raised, 6 fixed) | 0 |
| Medium   | 0 (14 raised, 14 fixed) | 0 |
| Low      | 0 (1 raised, 1 fixed) | 0 |

**Coverage:** divergences 11 — see Coverage. No per-unit walked tally was kept, so this register cannot certify a complete walk.

**Guards:** `npm run check:all` 31 of 32 pass at every commit of both branches. The one failure is a `binding-fidelity` triage cite that lives on the code branch. `npm run test:coverage-walk` — **not completed**; three runs were started and killed before a verdict.

## Findings

| ID | Severity | Entry | Location | Evidence | Origin | Disposition |
|----|----------|-------|----------|----------|--------|-------------|
| F1 | High | `pass-orchestration-in-technique` | `techniques/analyse-challenge/run-loop.md` Protocol §2 | Work-invokes four operations: the bound `{analyse_technique}`, `challenge`, `combine`, and conditionally `revise-questions`. Bound as a step in activities 02, 04, 05, 06, 07, 08, 15 | pre-existing | Fixed #622 — loop moved to the activities; `run-loop` deleted |
| F2 | High | `bind-site-is-orchestration-truth` | `activities/README.md` diagrams for 02, 08, 10 | Three nodes with no bind behind them: a revise edge back to classification (02 declared one exit), a `verifyBranch` node (08 opens on the task loop), a `detectManual` node (10 has the rationale attestation there) | pre-existing | Fixed #623 — redrawn from a dump of each activity's steps and exits |
| F3 | High | `cited-home-owns-claim` | `REVIEW-MODE.md` headless section | "Five gates stay interactive … `npm run test:coverage-walk` is what holds a review run to reaching only these five." `rationale-attestation` is a sixth, review-reachable with no condition and no `defaultOption`. Read against the resolver: neither `option-coverage.test.ts` nor `option-coverage.json` asserts any ceiling | pre-existing | Fixed #622 — roster replaced by the criterion that decides interactivity |
| F4 | High | `no-technique-resource-dual-home` | `techniques/review-summary.md` Protocol vs `resources/review-mode.md#header-fields` | Both state the Activities-field rules: one entry per activity, never per-technique, never a technique-file link, README section not raw `.yaml` | pre-existing | Fixed #622 — resource is the home; technique cites the section |
| F5 | High | `no-resource-caller-backlink` | `resources/github-issue-creation.md`, `resources/jira-issue-creation.md` | Both link `../activities/01-issue-management.yaml`, which does not exist. `check:anchors` resolves `.md#anchor` only, so nothing caught the dead link | pre-existing | Fixed #622 — backlinks deleted |
| F6 | High | `no-duplicated-guidance` | `README.md`, `REVIEW-MODE.md`, `resources/review-mode.md` | Three surfaces state review-mode activation, gating and headless behaviour; two claim to be the complete account | pre-existing | Fixed #622 — one home, two pointers |
| F7 | Medium | `technique-stage-agnostic` | 10 techniques, incl. `review-diff.md`, `review-assumptions/reconcile.md`, `research/triage.md`, `task-completion-review.md` | Clauses naming a caller construct, not merely "the activity": "so the activity `forEach` can bind", "before the activity gates [interview] on", "the convergence checkpoint then presents" | pre-existing | Fixed #622 |
| F8 | Medium | `bind-site-is-orchestration-truth` | `README.md` workflow graph, `REVIEW-MODE.md` review flow | Graph drew a comprehension branch design-philosophy does not declare and omitted seven edges; the review flow routed plan-prepare to lean-coding-audit while the sentence beneath it named the assumptions-review exit that carries it | pre-existing | Fixed #622 (review flow), #623 (workflow graph) |
| F9 | Medium | `atomic-checkpoints` | `activities/02-design-philosophy.yaml` | `classification-and-path-confirmed` packed classification confirmation and path selection; its revise option carried no effect and the activity declared one exit, so choosing it changed nothing | pre-existing | Fixed #623 — two gates, revise takes an exit bound in both graphs |
| F10 | Medium | `inherited-input-re-declared` | 9 leaf techniques across 6 groups | Each redeclares an input its group contract declares, same optionality, no differing default. `check:inherited-inputs` skips them on the leaf's own `*(optional)*` marker without comparing the ancestor, so its stated reason — that an override changes the contract — does not hold here | pre-existing | Fixed #622 — leaf declarations deleted. The guard's carve-out still needs the ancestor comparison |
| F11 | Medium | `no-duplicate-technique-steps` | `activities/01-start-work-package.yaml`, `activities/15-codebase-comprehension.yaml` | 01: two steps bind `issue-reference-detection` with no condition separating them on the path where the verification gate never fires. 15: an unrolled prologue duplicating the loop body it precedes | pre-existing | Fixed #622 — gate added; prologue folded into the loop |
| F12 | Medium | `rule-binds-beyond-its-operation`, `runtime-rules-only` | `techniques/analyse-challenge/TECHNIQUE.md` Rules | `structure-enforces-convergence` assigns call-site authors a duty the contract is not delivered to; `parameterize-dont-fork` is an authoring standard filed as a runtime rule | pre-existing | Fixed #622 — both deleted with the group's restructure |
| F13 | Medium | `output-without-destination`, `pass-orchestration-in-technique` | `techniques/finalize-documentation/revise-session-metrics.md` | No activity binds it; its whole Protocol applies the meta operation of the same name; its two outputs re-export that operation's products | pre-existing | Fixed #622 — file deleted |
| F14 | Medium | `no-user-env-mutation` | `activities/01-start-work-package.yaml`, `activities/06-plan-prepare.yaml` | Validate messages directing mutation of state outside the working tree: configure git signing, authenticate gh, ensure the GPG agent is running | pre-existing | Fixed #622 — diagnostic only |
| F15 | Medium | Activity-Level Constructs (construct inventory) | `activities/06-plan-prepare.yaml` | Two validate messages name another activity and a step inside it. The inventory states no activity file names another activity | pre-existing | Fixed #622 |
| F16 | Medium | `no-next-step-narration` | `activities/04-research.yaml` | Option descriptions narrate routing the loop and graph own: "carried to their handoff targets", "Reopen the loop … the next pass incorporates it" | pre-existing | Fixed #622 |
| F17 | Medium | `no-resource-caller-backlink` | `resources/pr-description.md`, `resources/review-mode.md` | Bind-topology narration: "(strategic-review binds `update-pr::render` with `final`)"; "category techniques fetch only their own category section" | pre-existing | Fixed #622 |
| F18 | Medium | `canonical-fact-home` | `activities/10-post-impl-review.yaml`, `activities/12-strategic-review.yaml`, `techniques/strategic-review/TECHNIQUE.md` | Two activities bind `summarize-architecture`, so the create path writes the summary twice. The bind at 10 is gated on `skip_architecture_summary`, which no checkpoint effect, set action or technique output writes. The strategic-review contract declares the artifact although no operation in that group writes it | pre-existing | Fixed #622 (contract) and #623 (producer, gate, variable) — strategic review keeps it |
| F19 | Medium | `stale-restatement-after-change` | `README.md` | "Requirements Elicitation (03) and Implement (08) stand down in review mode, **their steps** and inbound transitions gated on `is_review_mode`" — neither activity carries a step-level gate on that variable | pre-existing | Fixed #622 |
| F20 | Low | `no-duplicated-guidance` | `resources/readme.md` | Third sentence restates the two above it | pre-existing | Fixed #622 |
| F21 | Medium | `canonical-fact-home`, `artifact-not-buried` | 8 group `TECHNIQUE.md` files | Each restates an artifact filename its own operation declares, under a `#### <id>_artifact` heading. `parseEntrySubsections` reserves only `artifact` and `audience`, so these parse as components, never reach the synthesised contract, and no guard compares them against the declaration they copy | pre-existing | Found during remediation. Fixed #622 |

### Withdrawn on adversarial re-derivation

Recorded so a later pass does not re-raise them.

| Candidate | Why it fell |
|---|---|
| `no-duplicate-technique-steps` on `create-component-worktree` / `create-review-worktree`, `verify-github-issue` / `link-pr-to-ticket-github`, `review-over-engineering` / `re-review-over-engineering` | Mutually-exclusive `when` branches and distinct-purpose invocations at different pipeline points — both named carve-outs |
| `no-set-of-technique-output` on the value-less `set` actions in 01 | Carve-out (b): caller-specific derivation from a generic tool-wrapper op |
| `technique-stage-agnostic` as a High against every "the activity" mention | A corpus sweep found the bare mention in eight workflows, so it is closer to convention than defect. F7 was narrowed to clauses naming a caller construct and downgraded to Medium |
| Re-entry replay at `submit-for-review.provide-input` re-running the DCO gate and push | A claim about what the engine does on re-entry, settled by the resolver rather than the YAML. The resolver was not opened, so no finding was recorded |
| F21 as "nine artifacts escaping `check:audience` entirely" | The first reading held the container headings to be the sole declarations. The e2e snapshot shows the filenames reaching the contract; the real declarations sit on the operation files, and the container copies are inert. The finding survived in the corrected form above |

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | Creation Rules | `not-applicable` — governs authoring `anti-patterns.md`, which this audit does not edit |
| Anti-Patterns | Coupling Anti-Patterns | `blocked` — whole-file on the 16 activities, `workflow.yaml` and the 4 READMEs; the 115 technique and 37 resource bodies by targeted scan and spot read only |
| Anti-Patterns | Technique Protocol Anti-Patterns | `blocked` — same scope. `procedure-in-capability` specifically: the hyperlink and brace scan over every `## Capability` returned zero corpus-wide and was never confirmed against a known positive, so it is an untested empty result |
| Anti-Patterns | Output Economy Anti-Patterns | `blocked` — the template-shape entries need the 37 resource template bodies read whole |
| Anti-Patterns | Tool-Technique-Doc Consistency | `blocked` — return-shape and bootstrap-path entries need the harness tool surface read directly, which this pass did not open |
| Anti-Patterns | Canon Hygiene Anti-Patterns | `blocked` — needs every technique Protocol read whole against the resource it cites |
| Anti-Patterns | Authoring Guidance (MR) | `blocked` — needs the resource bodies read whole |
| Design Principles | Non-Destructive Updates | `not-applicable` — no restructuring under audit at the base ref |
| Design Principles | Confirm Before Irreversible Changes; Impl Before Confirmed Approach; Accept Correction; Scope Reverify Completion | `not-applicable` — session-conduct stances with no authored construct on this surface |
| Convention Conformance | Reference Conventions | `blocked` — naming, version format and routing shape compared against siblings; field ordering across 171 files was not |
| Guards | `option-coverage` walk | `blocked` — three runs started, none reached a verdict. Also unrun by #622, which shipped stating so |

24 of 171 surface files were read whole. The remainder were reached by targeted structural scan and spot read, which is why six of the catalogue's thirteen families cannot be reported as swept.

## Sources

| Label | Path |
|---|---|
| Guard suite, base ref | `npm run check:all` — 36 pass, 0 fail |
| Guard suite, both branches | `npx tsx scripts/check-all.ts --root <worktree> --corpus-only` — 31 of 32 at every commit |
| Artifact sub-section parser | `src/loaders/markdown-technique-loader.ts` `parseEntrySubsections` — settles F21 |
| Artifact contract composer | `src/tools/workflow-tools.ts` `composeActivityArtifacts` — settles the corrected F21 reading |
| Inherited-input carve-out | `scripts/check-inherited-inputs.ts` — settles F10 against the guard's own stated reason |
| Coverage-walk assertions | `tests/e2e/option-coverage.test.ts`, `tests/e2e/option-coverage.json`, `tests/e2e/snapshot.test.ts` — settle F3 |
| Prior pass | [2026-09-05 register](../2026-09-05-canon-audit-work-package/findings-register.md), reconciled in [previous-pass-reconciliation.md](./previous-pass-reconciliation.md) |
