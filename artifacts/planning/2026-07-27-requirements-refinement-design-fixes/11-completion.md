# Workflow Design: requirements-refinement — Complete

> Update · 2026-07-27 · `requirements-refinement` v1.1.0 → **v1.2.0**

## Summary

The `requirements-refinement` workflow had never been audited against the workflow-design canon. This session read all 21 of its files against the design principles and the anti-pattern catalogue, then fixed the violations in place across 16 files, leaving purpose, activity list, and topology unchanged. What changed is how the definition states itself: the correction cap now lives only in the construct the engine evaluates, every gate message is a statement whose decision sits in `options[]` with a resolvable link, every artifact announcement interpolates a declared path output instead of a hand-typed filename, and the documentation describes the definition that exists. Three preference questions were deliberately left for a human, and two High findings are structural limits of the current schema rather than defects this pass could close.

Delivery is [PR #318](https://github.com/m2ux/workflow-server/pull/318) against `workflows`, open and awaiting review — **not merged**.

## What Was Delivered

Sixteen files modified; none created, none deleted. Per-file deltas: [scope manifest](06-scope-manifest.md) · [file review note](06-file-review-note.md).

- **Activities (5 modified + index):** `01-intake-and-analyze` (both gate messages became linked statements; two announcements interpolate path outputs; two confirmed-option descriptions dropped route narration), `03-update-specification` (announcement states the pass and links `{working_specification_path}`), `04-validate-specification` (gained the validation-report announcement; the `correction_iteration < 3` transition literal became the cap's sole home), `05-finalize-specification` and `06-report-failure` (gate messages became linked statements; announcements link their staged artifacts). `activities/README.md` names artifacts by identifier rather than an unprefixed literal filename.
- **Techniques (7 modified):** the container `TECHNIQUE.md` dropped the shared `max_correction_iterations` input and its default; all six leaves declare the path outputs their activities interpolate; `update-specification` declares `correction_iteration` as an output and lost its prose increment; `finalize-specification` and `report-failure` lost their "Present …" phases, so presentation belongs to the activity; `validate-specification`'s four verdict Output descriptions now state what each value is. Three rules were **removed** as restatements of a home they already cite — `validate-specification`'s entire `## Rules` section, `analyze-source::every-normative-statement-is-mapped`, and `update-specification::one-advance-per-correction-pass` — leaving both those techniques with no `## Rules` section at all.
- **Resources:** none changed. All four templates were out of scope; their missing sibling frontmatter is deferred as F-7.
- **Variables / rules:** `workflow.yaml` went from 14 variables to 20 — `max_correction_iterations` **removed**, seven `*_path` variables **added** so the ten announcement interpolations resolve against declarations. Version banner to 1.2.0. The five `rules.activity` entries are **unchanged**: all five are inventoried removals still awaiting approval.

## Design Decisions

Statements live at their canonical homes: [assumptions log](03-assumptions-log.md) (A-1 … A-10) and the [planning README Design Decisions table](README.md#design-decisions).

One drafting-time decision has no other home:

- **Context:** A-9 justified adding a `## Rules` section to `update-specification` on the grounds that the correction-pass invariant was a real invariant worth stating. **Decision:** when the anti-pattern pass two activities later flagged that same rule as `no-one-step-rules`, the rule was deleted rather than rewritten, leaving the file with no `## Rules` section. **Rationale:** the invariant it stated is now carried by the declared `correction_iteration` output, so restating it is a second home for a fact the signature owns. **Alternatives:** rewrite the rule to cover more than one step (no such invariant exists in this technique), or keep it and accept the anti-pattern.

## Scope Outcome

All 16 manifest items delivered ([manifest](06-scope-manifest.md)); file scope is clean at 16/16 with no change outside the manifest. Two record-keeping exceptions:

- **Removals applied without an inventory row.** The three rule deletions applied at `post-update-review` are not carried as rows in the [removals inventory](05-impact-analysis.md#3-removals-inventory), which stops at row 21 and states that none of rows 10–21 is applied. Under principle 10 the inventory is the approval basis, so it is no longer a complete record of what was removed.
- **Stale count in the manifest.** The manifest headline still reads 15 inventoried removals; the inventory now carries 21 rows plus three structural additions. The count should have been a pointer, not a restated number.

## Known Limitations & Deferrals

<!-- Canonical home. Other artifacts link here; do not duplicate this list elsewhere. -->

- **PR #318 is open, not merged** — merging is a separate human action. The parent repo's `workflows` submodule pointer is deliberately **not** advanced for that reason. (The parent also carries an unrelated pre-existing pointer diff, `b3dc2506` → `d9b30234`, which is not this session's.)
- **Correction cycle has no structural termination guarantee** (High, [P-1 / N-2](10-principle-findings.md)) — the 03⇄04 cycle is a cross-activity transition back-edge; `maxIterations` is activity-scoped to `kind: loop` and cannot bound it, and `action: set` is agent-executed so carries no stronger guarantee. The cap literal bounds the comparison; nothing bounds the increment. No in-scope fix; the structural alternative is inventoried as [impact row 23](05-impact-analysis.md#4-structural-additions-pending-gate-2).
- **Canonical-document integrity is prose-only** (High, [P-2 / N-1](10-principle-findings.md)) — stated across three rule homes with zero `action: validate` anywhere in the workflow. Inventoried as [impact row 22](05-impact-analysis.md#4-structural-additions-pending-gate-2).
- **Three design judgements are approved-as-held, not resolved** — A-3 dead-variable disposition, A-5 terminal acknowledgement gate, A-7 rework destination ([assumptions log](03-assumptions-log.md#open-assumptions)). Gate 2 recorded `approved` with no variable effects, so the approval covered the commit, not this batch. A-3 is machine-confirmed: four declared variables have no structural reader, and the binding-fidelity guard independently reports `source_coverage_complete` as still-live dead output.
- **Twelve inventoried removals remain unapplied** — rows 10–21, comprising the six A-3/A-5/A-7 rows, the five `rules.activity` entries, and the `validate-specification` Protocol 5 collapse. Each needs explicit approval before it can be applied.
- **Nine of thirteen follow-ups are open** ([register](03-follow-ups.md)) — F-1, F-2, F-3, F-5, F-7, F-8, F-9, F-12, F-13. F-12 and F-13 need a human design call; F-13 is additionally blocked on AP-80, which requires user confirmation that headless mode could not obtain. F-9 needs a baseline refresh in the parent repo, unrelated to this branch.
- **Two Medium enforcement gaps stay text-only** — the status-change confirmation clause across three homes, and the source-readable precondition with no failure arm ([enforcement findings](08-enforcement-findings.md)).
- **Defects in the host `workflow-design` workflow, surfaced by this run and not fixed here** — carry to a future session against `workflows/workflow-design/`:
  1. `context-loading` v1.3.0 says persist format-conventions in create mode only, but the step carries no `condition`.
  2. `persist-impact-analysis` binds `artifact_content: impact_analysis`, an output no technique declares.
  3. `apply-audit-fixes` declares `selected_findings` with `source: UNRESOLVED`.
  4. `stage-and-commit` binds `version-control::commit-regular-files` — explicitly non-submodule — with all three inputs UNRESOLVED, so it cannot commit workflow source that lives in the `workflows` submodule.
  5. `workflow-engine::create-readme` cites `[Template](planning-readme#template)` as a bare slug that only resolves as `meta/planning-readme`.
  6. This activity declares `artifacts[].name: COMPLETE.md` while its write step binds `bare_filename: completion.md`, so the close-out lands as `11-completion.md` and the seed README's `COMPLETE.md` link target is wrong.

## Lessons Learned

- **The removals inventory is built once but discovered continuously.** It was written at `impact-analysis` with 15 rows and grew to 21 across two later audit activities, then three further removals were applied with no row at all. An inventory that gates approval has to be re-opened by whatever step applies a removal.
- **Anti-patterns applied at write time would have saved a round trip.** The draft deliberately added a `## Rules` section that the anti-pattern pass deleted two activities later. The `apply-anti-patterns-when-authoring` rule exists precisely to prevent that, and it was not applied at drafting.
- **Headless mode silently converts design questions into deferrals.** Every gate that could have settled A-3, A-5, A-7, or F-13 was either gap-conditioned and did not fire, or fired without per-assumption effects. The session's honest output is therefore three open judgements rather than three decisions — not a fault in the audit, but a routing gap worth closing.
- **Machine confirmation changed a verdict.** One High finding was downgraded to Medium only because adversarial re-derivation reproduced the divergence but found no functional break; two others survived the same test. Re-deriving findings before reporting them was load-bearing, not ceremony.

## Workflow Retrospective

[activities: 8 of the design workflow's 9 (`04-pattern-analysis` does not apply in update mode) · messages: 1 total, 0 non-checkpoint · session quality: Minor friction]
[trace: not written — the orchestrator recorded no `_meta.trace_token` on any `next_activity` response, so `trace_tokens` is empty and the trace resolve was skipped per `resolve-trace-at-close-out`. No token-usage artifact.]

`skip-if-trivial` does not apply: human interaction was a single prompted response, but the run produced substantive mechanical signals — checkpoint anomalies, an inventory-discipline deviation, and five host-workflow defects — which the retrospective exists to capture.

### Observations

- [checkpoint-anomaly] 1 of the 4 nominally interactive gates fired: `approve-to-commit`. `design-intent-batch` is gap-only and `intent_needs_confirmation` was false; `preservation-check` was gated on `has_unflagged_removals` (false); `review-disposition` on `has_critical_finding` (false) — so a run holding three `open` assumptions reached commit without any of them being presented.
- [checkpoint-anomaly] `approve-to-commit` recorded `optionId: approved` with `variablesSet: {}` — the option set carries no per-assumption effect, so the gate that three artifacts call "the Gate 2 batch" cannot in fact resolve a batch. A-3/A-5/A-7 exited the session in the same state they entered it.
- [deviation] The removals inventory was authored once at `impact-analysis` (15 rows), extended at `validate-and-commit` (to 21), and then bypassed at `post-update-review`, where three rule deletions were applied with no row — while the inventory text still asserts none of rows 10–21 is applied. Root cause: `apply-audit-fixes` has no step that re-inventories a removal before applying it.
- [drift] `06-scope-manifest.md` restates the removal count as a literal 15 rather than pointing at the inventory, so it went stale the moment the inventory grew — a `single-source-and-link` violation in the workflow-design artifact set itself.
- [rework] `techniques/update-specification.md` gained a `## Rules` section at `scope-and-draft` under assumption A-9 and lost it at `post-update-review` under `no-one-step-rules`. The `apply-anti-patterns-when-authoring` rule was in scope at drafting and would have prevented the write.
- [host-defect] Five defects in `workflow-design` itself: an unconditioned create-mode-only step in `context-loading`; `persist-impact-analysis` binding an undeclared output; `apply-audit-fixes` declaring `selected_findings` with `source: UNRESOLVED`; `stage-and-commit` binding the explicitly non-submodule `commit-regular-files` with three UNRESOLVED inputs, so it cannot commit `workflows`-submodule source; and `create-readme` citing a bare `planning-readme#template` slug that only resolves as `meta/planning-readme`. Full list in [Known Limitations](#known-limitations--deferrals).
- [host-defect] This activity declares `artifacts[].name: COMPLETE.md` but binds `bare_filename: completion.md`, so the close-out cannot satisfy the seed README's `COMPLETE.md` link.
- [trace-redundancy] Every artifact write in this session landed through a `write-artifact` step whose `artifact_prefix` came from the server, yet three READMEs and manifests hand-wrote prefixes anyway (F-10 repaired eight such links). The prefix is available; the templates invite retyping it.

### Recommendations

1. **High:** A gate that is documented as resolving a batch of open assumptions must carry effects that resolve them → give `approve-to-commit` per-assumption options (or add a dedicated batch gate), and make `has_open_assumptions: true` open `design-intent-batch` regardless of `intent_needs_confirmation` (`workflow-design/workflow.yaml` checkpoints; `activities/06-scope-and-draft.yaml`, `activities/09-validate-and-commit.yaml`).
2. **High:** Audit fixes can remove content the approval inventory never listed → require `apply-audit-fixes` to add an impact row for any removal it applies, or refuse the fix (`activities/10-post-update-review.yaml`; `techniques/apply-audit-fixes.md`), and fix that step's `selected_findings: source: UNRESOLVED` declaration while there.
3. **Medium:** `stage-and-commit` cannot commit the very files this workflow edits → rebind it to a submodule-aware commit operation and resolve its three UNRESOLVED inputs (`activities/09-validate-and-commit.yaml`); the commits in this run had to be published outside the bound step.
4. **Medium:** The close-out artifact has two names → align `artifacts[].name` with the `bare_filename` binding in `activities/11-retrospective.yaml` and correct the planning-README seed link.
5. **Medium:** No trace token was recorded on any transition, so close-out had no mechanical trace to resolve → have the orchestrator record `_meta.trace_token` per `next_activity`, or drop the `resolve-trace-at-close-out` expectation.
6. **Medium:** Two further binding defects reachable from any run → `persist-impact-analysis` binds `artifact_content: impact_analysis`, an output no technique declares, and `context-loading`'s create-mode-only persist step carries no `condition`.
7. **Low:** `create-readme` cites `[Template](planning-readme#template)`, a bare slug that resolves only as `meta/planning-readme` → qualify the reference.
8. **Low:** Artifact templates should point at counts rather than restate them → the scope-manifest template's removal headline is the specific instance that went stale here.

**Key takeaway:** The audit machinery worked — 29 principles and the anti-pattern catalogue produced findings that survived adversarial re-derivation — but the decision machinery did not: every gate that could have converted a held judgement into a decision was either gap-conditioned shut or effect-less, so a clean audit closed with three questions still open and twelve approved-in-principle removals unapplied.

**Action required:** yes — file the eight recommendations above as issues against `workflow-design`; recommendations 1 and 2 are prerequisites for the next update-mode run to close its own judgements.
