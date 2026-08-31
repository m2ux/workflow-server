## Summary

The workflow definitions — the workflows, activities, techniques, and resources held in the `workflows` submodule — still owe four pieces of work that were left behind when earlier issues closed with their pull requests only partially merged. Everything else those issues left behind is finished and recorded; what remains is one unblocked defect sweep, one nearly-unblocked conversion, and two migrations that cannot start until schema decisions land on the server side. This epic covers one work item per remainder.

The server half of the same inheritance was tracked in #365; its live remainder now sits in #402. #343 decides which items ride together in a pull request and in what order.

## The four remainders

**Five known content defects have never been fixed.** An earlier review found them, and no backlog item ever owned them, so they are still present verbatim: an environment assignment placed after the `nice` command — which is not valid shell — in the cargo check operation and its siblings; a test-thread budget stated one way in the cargo group rule and another way in the check and clippy operations; a first step in the create-issue operation that contradicts its own scoping; a concurrency instruction in the suite runner that is in tension with the group's foreground-only rule; and a checkpoint message that interpolates `{problem_complexity}` while its default option sets a variable named `path_gating_complexity`, so the message renders with a hole in it. The companion lint that would catch the fifth kind automatically already exists — the binding-fidelity guard walks checkpoint messages and gate expressions — so this item is purely the five fixes.

**The fragment conversion was never finished.** Shared boilerplate is supposed to be written once as a fragment and referenced from everywhere that needs it. Exactly three inline copies of the orchestration-model block remain, in the prism, prism-audit, and remediate-vuln workflow definitions, and some fragment bodies duplicate each other. A third piece — letting activity rules reference a fragment at all — needs a schema change and waits on the server half.

**Sixty-seven step conditions are written in the dialect that may not survive.** The schema has two ways to write a step condition, the server side owns the decision about which one survives, and the corpus keeps growing on the undecided dialect: roughly 67 sites across 18 activity files today, 32 of them in one workflow, against 17 when the debt was first measured. Once the target shape is fixed this is a mechanical find-and-replace; it is recorded here so it is not forgotten at the moment the schema actually moves — and so the count stops growing unwatched.

**One cleanup can only happen at a breaking version.** The retire sweep of constructs already registered for removal has nothing to do until a schema major is cut; it is recorded so it is not lost.

## The work

**W1 — Fix the five content defects.** A single corpus pull request; each fix is small and none is blocked. The suite-runner tension overlaps the shared-homes epic's fan-out work item (#399 W1), which retargets the same call site — whichever lands second inherits the other's resolution.

**W2 — Finish the fragments.** Convert the three remaining inline orchestration-model copies to fragment references and dedupe the fragment bodies. The activity-rules reference remains listed here but gated: it starts when the schema change lands via #402 W2.

**W3 — Migrate the step conditions.** The merge decision has landed on the server side; what still blocks the sweep is that a checkpoint gated the surviving way cannot yet be dismissed (#402 W1). When that lands, sweep the roughly 67 sites in one mechanical pass. Until then the only live action is watching the count.

**W4 — Retire sweep at the next schema major.** Dormant by design; executes when a major is cut.

## Why now is cheap

W1 has been findable-but-unowned through two review generations — the defects are enumerated, quoted, and located, so the sweep is reading and fixing, not investigating. W2's two live bullets touch three named files. And the two gated items cost nothing to hold here, while forgetting them costs a stale corpus at exactly the moment the schema moves: the condition-dialect debt has already quadrupled since it was first measured.

## Acceptance criteria

- [ ] All five content defects are fixed in the definitions, and the binding-fidelity guard confirms the checkpoint-message mismatch is gone.
- [ ] No inline copy of the orchestration-model block remains; fragment bodies are deduplicated.
- [ ] When the schema change for rule references lands, activity rules in the corpus use fragment references where a fragment exists.
- [ ] When the condition merge is decided, zero sites remain on the retired dialect, in one migration pass.
- [ ] The retire sweep executes with the next schema major, against the already-complete register.

## Non-goals

- No server work — the ledger, schema, and guard changes this epic depends on are #365's; this epic is definitions only.
- No re-litigation of the completed inheritance: the delivery-rule relaxation, the submodule-aware commit path, the cost record on close-out, and the fix-later burn-down are done and recorded in the planning folder, not re-opened here.
- No new condition-dialect sites where the structured form suffices — growth of the W3 count is a cost this epic exists to stop.

## Tracking

Each work item is delivered as its own pull request when picked up; gates are stated per item:

- [ ] W1 — five content defects (unblocked)
- [ ] W2 — fragment conversion and dedupe (unblocked); activity-rule references (gated on #402 W2)
- [ ] W3 — step-condition migration (gated on the checkpoint-dismissal change in #402 W1)
- [ ] W4 — retire sweep (gated on the next schema major)

This epic consolidates the corpus half of #189, #232, #323, and #324 (superseded); routing stays with #343, and the server half's live remainder stays with #402 (#365 carries the history).

## Investigation detail

Full record — the pre-restatement body verbatim with its done-ledger and per-item provenance, the map from each work item back to its source issue and item id, and the first plain enumeration of the five defects with pointers into the review evidence:
**[engineering/artifacts/planning/2026-08-02-corpus-backlog-restatement](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-corpus-backlog-restatement)**


