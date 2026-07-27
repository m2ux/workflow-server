# Schema Expressiveness Findings — `work-package`

**Mode:** update · **Date:** 2026-07-27
**Pass:** expressiveness
**Target:** `work-package` v3.35.4

Walked every prose passage in the four drafted files against the [schema construct inventory](../../../../workflows/workflow-design/resources/schema-construct-inventory.md) and the Schema Expressiveness / Description Hygiene anti-pattern families. No prose was found substituting for a checkpoint, loop, decision, transition, variable, or artifact construct — the change adds no behaviour and no step. All three findings are condition-expression and description-hygiene defects introduced by this change's own edits.

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| F-1 | High | `bind-protocol-locals`-adjacent (AP-128 `unproduced-value-read`): the publish-ref guard reads `{artifact_publish_ref}` "when it is bound", but the variable declares `defaultValue: ""` (`workflow.yaml:341`), so it is *always* bound. The guard cannot discriminate the seeded empty default from a produced SHA, making the branch fallback unreachable and the first render emit an empty ref. AP-128's Fix is explicit: "Do not substitute a `defaultValue` a reader cannot distinguish from a produced value." Confirms the intent recorded at [A-5](03-assumptions-log.md) ("genuinely unbound at first render") and the emptiness the drafted Inputs entry states. | `techniques/review-summary.md` § Protocol 2 | Test the discriminating shape — `when it is non-empty` — so the two-arm fallback stays reachable. **Applied.** |
| F-2 | Medium | AP-126 `variable-description-one-line`: the redrafted description runs two sentences, and the second ("Empty before the publish step runs") is both a restatement of `defaultValue: ""` and a sequencing tail — the two shapes AP-126's Detect names. | `workflow.yaml` `variables[]` · `artifact_publish_ref.description` | Reduce to one line naming the value and its two shapes; drop the emptiness/sequence tail. **Applied.** |
| F-3 | Low | AP-119 residue: the Inputs entry may state emptiness (explicitly permitted — "meaning, shape, allowed values, emptiness"), but "at first render, before the publish step has run" narrates step ordering that the activity's `steps[]` owns, not the bind contract. | `techniques/review-summary.md` § Inputs · `artifact_publish_ref` | Keep the emptiness declaration, drop the ordering clause. **Applied.** |

**Finding count:** 3

## Notes

- F-1 is the pass's material finding: it is the one defect that would have defeated goal **G-1** ("publish ref resolves") at the first of the two `review-summary` renders, despite `check-binding-fidelity` reporting 0 NEW. The guard resolves a *declared* symbol, so no binding guard can see it — it is an agent-audited semantic, exactly as [format conventions](01-format-conventions.md) anticipates.
- Re-audited after the fix cycle: 0 findings remaining. `validate-workflow-yaml` and `check-technique-template` both pass, and `check-binding-fidelity` is unchanged at `0 NEW, 22 fixed`.
