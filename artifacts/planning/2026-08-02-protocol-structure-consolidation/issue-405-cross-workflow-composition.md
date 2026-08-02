# Capture: issue #405 — Cross-workflow composition: the two technique delivery paths disagree about which containers apply

Body verbatim as of 2 August 2026 (filed 2 August 2026; subsumed into #397 and closed the same day — the epic's tracking list carries it as the ancestry item that lands before W3a).

---

## Summary

A technique borrowed from another workflow — a meta operation used inside a product workflow's session — can reach the agent through two doors: bundled with the activity (the activity's technique list), or fetched for a bound step (which is also the path inline step bundling uses). The two doors compose the same file differently. One attaches the contributions of the technique's home containers — the shared rules its group declares. The other resolves ancestry against the borrowing workflow's own tree, where those containers don't exist, so the same rules silently don't travel. The specification holds a third position: it says only the executing workflow's containers ever apply. And the comments above the shared composition routine state that both doors produce identical results. Three authorities, three answers.

## What happens today

- Through the **activity bundle** door, a nested operation composes with the containers of the workflow where its file was found. A meta group operation arrives carrying its group's shared rules — for the graph-navigation group (`gitnexus-operations`) that is five rules, including the one requiring an index-freshness check before queries.
- Through the **step-bound fetch** door, ancestry is resolved against the executing workflow's techniques tree. The borrowing workflow has no group of that name, so the lookup finds nothing and the group's rules are silently absent from the delivery; the borrowing workflow's root contract applies instead.
- The **specification** documents executing-workflow-only ancestry — matching the second door and contradicting the first.
- The **composition routine's own comments** say the two doors produce identical inputs, outputs, rules, and protocol — contradicted whenever the reference crosses workflows.

Whether a shared operation arrives with its own invariants attached currently depends on which door it came through, and nothing tests either behavior cross-workflow.

## Two coherent end states

- **Contract follows the file's home tree.** A technique's containers are the ones physically above it — its group and its home workflow root — wherever it executes. Shared group invariants always travel. This is also the position the protocol-structure epic's fold doctrine already assumes for folded callees: container-inherited rules there mean the callee's home ancestry.
- **Contract follows the executing workflow.** The specification's current text: a borrowed technique takes only the borrowing workflow's containers. Then the activity-bundle door is the bug, and a shared group must restate every invariant in each operation file — which the input-hoisting convention exists to avoid.

Either way, all four authorities — both delivery doors, the specification, and the routine's comments — must end up saying the same thing, with a test that composes one cross-workflow reference through both doors and compares.

## Why now is cheap

The protocol-structure epic's fold work is about to build callee delivery on the assumption that a folded operation carries its home group's rules. Settling this first means the fold regularises one behavior instead of adding a third. The fix itself is confined to which techniques directory the composition routine resolves ancestors from, one specification section, and one test.

## Acceptance criteria

- [ ] One documented ancestry rule for cross-workflow references, applied identically by the activity-bundle path and the step-bound path.
- [ ] The specification's composition section states that rule, and the composition routine's comments match it.
- [ ] A test composes the same cross-workflow reference through both doors and asserts identical rules, inputs, outputs, and protocol.
- [ ] The graph-navigation group's five shared rules either travel through both doors or are explicitly restated where the chosen rule requires — no silent absence.

## Non-goals

- The technique-fold delivery mechanism itself — tracked on the protocol-structure epic (#397).
- Same-workflow composition, which is consistent today.

## Investigation detail

The discrepancy record, with the exact composition traces on both paths, is in the doctrine decision amendments in the epic planning folder:
**[engineering/artifacts/planning/2026-08-02-protocol-structure-consolidation](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-protocol-structure-consolidation)** (`doctrine-decision.md`, Amendments section)

