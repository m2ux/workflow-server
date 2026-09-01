# Workflow Authoring: work-package, remediate-vuln — Complete

> Update · 2026-09-01

## Summary

Issue [#519](https://github.com/m2ux/workflow-server/issues/519) asked whether the shared-fragment construct earns its place. The answer this run delivers is a record rather than a migration: four of the six acceptance criteria are met at the corpus tip, and the two that are not belong to [#520](https://github.com/m2ux/workflow-server/issues/520). Neither target needed a definition change.

What the run does change is three files of shared canon, repairing two pre-existing defects its own criteria walk surfaced — the artifact writing register was unreachable from any workflow but `meta`, and the schema construct inventory had no row for checkpoint fragments. Published as [#541](https://github.com/m2ux/workflow-server/pull/541).

## What Was Delivered

- **Activities:** none created, none modified.
- **Techniques:** two modified — `meta/techniques/agent-conduct.md` and `meta/techniques/verify-artifact-conforms.md`, each having its writing-register citation requalified so the delivered resource id resolves under any host workflow.
- **Resources:** one modified — `workflow-design/resources/schema-construct-inventory.md` gains a workflow-level row for `fragments.checkpoints`.
- **Variables and rules:** none added, changed or removed. No graph, exit, checkpoint or variable moves, and no version is bumped.

Three files, `+3 / −2`, in two commits on `workflow/work-package-borrowed-gate-variables`.

## Design Decisions

- Purpose, the six criteria standings and the open judgements: [change brief](01-change-brief.md).
- Impact classification, integrity verdicts and the removals inventory: [impact analysis](01-impact-analysis.md).
- Findings, coverage and the exclusions carried: [findings register](09-findings-register.md).

One decision was taken during drafting and has no other home. The register fix could have been made in the server's link projection or in the citations themselves. It was made in the citations, because a bare resource id is the correct projection for a technique only ever delivered under its own workflow — the defect belongs to techniques delivered into other workflows, and the citation is the place that knows which it is. The corpus already agreed: thirty-two sibling citations across nine files were spelled the qualified way, and the two repaired here were the only two that were not.

## Scope Outcome

The manifest confirmed at the scope gate enumerated zero files; the run delivered three. Every one entered through remediation round 1 rather than through the scope gate, and no file under either target changed — which is what the original scoping concluded and what remains true. The [scope manifest](06-scope-manifest.md) records all three with their provenance and explains why the two directions of the scope check disagree by construction.

## Known Limitations and Deferrals

- **One finding stays open.** The binding-fidelity guard's triage baseline holds an entry for a `read-resolution` problem at `prism-update/workflow.yaml` that no longer occurs, so the guard stays red on a stale record. Its remedy is a file in the server repository, outside this run's edit surface, and is carried separately in [#525](https://github.com/m2ux/workflow-server/pull/525) — **open and unmerged at close-out**. This run did not fix it.
- **Coverage is partial.** The full-surface sweep is recorded `blocked` for both targets: 171 files under `work-package` and 14 under `remediate-vuln` were not walked, so the corpus is not evidenced clean beyond the rows the register carries. Nine units were walked against the round's own three files with twelve evidence rows.
- **The guard exclusions are stale-dated.** The 42 class-keyed exclusions in scope all rest on triage against corpus `3569e937`, which the guard itself reports as 287 commits behind this branch point. None suppressed a finding this run raised, but they are carried rather than relied on.
- **Two of the brief's judgements are carried open, not settled.** *Does the fragments construct survive, carrying checkpoints only?* and *Where may a shared checkpoint body live?* Both are answered under [#520](https://github.com/m2ux/workflow-server/issues/520), which specifies the replacement construct and owns the migration. The third judgement — whether a workflow borrowing a gate must declare that gate's effect variables — is settled: it must not, because resolving `remediate-vuln` returns 118 declarations covering all eight, the borrowed activities contributing their own.
- **No removal approval was needed.** The run removes nothing; both fixes are additive.

## Run Retrospective

**The per-target sweep cannot see a round that edits outside its targets.** The criteria walk scopes touched files to `{target_path}/{target_workflow_id}`, then closes over I/O-contract referencers of those touched files. A remediation round whose edits land outside every named target therefore produces an empty change surface for each target, and the walk has nothing to key Detect on — while the run is in fact changing files. Both targets reported empty surfaces while three files changed. The evidence in the register exists only because the round's own change surface was walked as a section of its own, outside the loop. Any run that repairs shared canon reached *from* its targets rather than owned *by* them will hit this. Worth either widening the surface to the files a round actually edits, or making the mismatch an explicit ledger row rather than something a worker has to notice.

**A claim travelled three dispatches before measurement caught it.** The original finding asserted that a `meta/`-qualified relative path "would be wrong on disk", and that assertion was carried forward into a later dispatch as something this context had established. It had not, and it was false — the qualified path resolves to the file that exists, and the corpus already used that spelling in thirty-two places. Acting on it would have meant cutting a branch from `main` and editing server source for a defect whose fix was two lines of corpus. What caught it was the re-derivation rule: reading the cited construct rather than the reasoning about it. What would have caught it sooner is treating a remedy claim with the same refute-by-default discipline the finding's own claim gets — the finding was re-derived, its proposed remedy was not.

**A gate fired that the dispatch did not expect, and yielding was right.** With one Low finding still open, `audit-disposition` met its condition a second time. The dispatch narrative assumed that gate was behind us. Calling `yield_checkpoint` and letting the server answer `yielded` against `replayed` cost one round trip and surfaced a decision that was genuinely unmade, rather than one assumed on the operator's behalf.

**A manifest confirmed before findings have a disposition cannot describe what remediation adds.** The scope gate ran before the criteria walk produced findings, so the confirmed manifest could not have named the three files. This is ordering, not error, but it means the scope check's second direction reports unplanned scope on any run where remediation is chosen. Reconciling the manifest at close-out worked; having the remediation round append to it as it goes would leave less to reconcile.
