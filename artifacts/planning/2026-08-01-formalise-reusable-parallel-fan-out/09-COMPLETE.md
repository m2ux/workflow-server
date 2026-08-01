# Workflow Authoring: meta — Complete

> Update · 2026-08-01

## Summary

Formalised reusable parallel fan-out under the workflows corpus: same-context process/shell units Apply the new meta strategy technique `unit-fan-out`; agent units keep scatter-gather / spawn-concurrent; workflow-design §33 and AP-140 lock the preference at write time. Free-prose call sites (`cargo-operations::run-suite`, prism `independent-lenses`) now Apply the unit-kind-correct contract. Published as PR [#385](https://github.com/m2ux/workflow-server/pull/385) against `workflows` (issue [#382](https://github.com/m2ux/workflow-server/issues/382)).

## What Was Delivered

- **Activities:** none (technique/resource-only change)
- **Techniques:**
  - **Added:** `meta/techniques/unit-fan-out.md` — ordered scatter → wait-all → ordered gather for same-context process units
  - **Modified:** `cargo-operations/run-suite.md` (Apply unit-fan-out; public I/O stable), `cargo-operations/TECHNIQUE.md` (group rule), `scatter-gather.md` (agent vs process boundary), prism `behavioral-pipeline/independent-lenses.md` (Apply scatter-gather / spawn-concurrent)
  - **Indexes:** `meta/techniques/README.md`, `meta/README.md`
- **Resources:** workflow-design `design-principles.md` (§33), `anti-patterns.md` (AP-140), `resources/README.md` (blurbs)
- **Variables and rules:** cargo group rule `multi-op-concurrent-fan-out`; scatter-gather boundary rule; no workflow-level variable model change

## Design Decisions

Canonical homes:

- Purpose and open judgements — [01-change-brief.md](01-change-brief.md)
- Impact / removals — [01-impact-analysis.md](01-impact-analysis.md)
- File manifest — [06-scope-manifest.md](06-scope-manifest.md)
- Corpus inventory — [06-migration-candidates.md](06-migration-candidates.md)
- Audit record — [08-findings-register.md](08-findings-register.md)

Drafting-time resolution with no other home: process contract is a **new** `unit-fan-out` strategy technique (not an extension of scatter-gather); prism lenses bind **agent** formal patterns only.

## Scope Outcome

Manifest delivered exactly for the in-pass set (10 of 11 planned rows). Optional row `prism/techniques/dispute-analysis.md` left undelivered by design (judgement #5 / accepted exclusion).

## Known Limitations and Deferrals

- **Deferred — dispute-analysis free “(can be parallel)”** — inventory follow-up; not pulled into this pass
- **Deferred — check.md diagnostics-shape note in run-suite** — orthogonal to fan-out formalisation
- **Limitation — bag primary remains `meta`** — multi-workflow co-edit (workflow-design, prism) under one worktree; update intake does not expand `target_workflow_ids`
- **Limitation — work-package validate bind site untouched** — run-suite public envelope byte-stable; no co-change required
- **Open findings:** 0 · **Blocked coverage units:** none · **Removals:** prose-only, approved

## Run Retrospective

- Full-corpus migration inventory caught prism free-prose that a meta-only scan would miss — keep inventory as a first-class drafting input on multi-workflow formalisation runs.
- Bag single-target update shape forced honest multi-workflow planning into the scope manifest rather than `target_workflow_ids`; that split is workable but easy to misread at gates that only print bag ids.
- AP id collision (AP-139 already taken) was caught in planning; numbering discipline belongs in the brief before drafting starts.
