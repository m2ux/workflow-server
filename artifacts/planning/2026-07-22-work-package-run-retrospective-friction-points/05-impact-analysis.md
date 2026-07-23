# Impact Analysis — Pass B (#270)

> Blast radius and preservations for the Pass B (#270) update to `work-package` + `meta`, on branch `workflow/work-package-review-mode-friction-271` (PR [#274](https://github.com/m2ux/workflow-server/pull/274)). Links [design specification](03-design-specification.md) (change goals) and [structural inventory](structural-inventory.md) (baseline); does not restate them.

## Impact Classification

| File | Classification | Justification |
|------|----------------|---------------|
| `work-package/activities/13-submit-for-review.yaml` | **directly modified** | Gains publish-before-post steps and `artifact_publish_ref` Plan/Reports links; rating-cap carve-in + review-type options on the review-summary approval |
| `work-package/resources/review-mode.md` | **directly modified** | Holds the hardcoded `/blob/main/` links; updated to consume `artifact_publish_ref` |
| `work-package/techniques/review-summary.md` | **directly modified** | Produces `artifact_publish_ref`; rating-cap self-refutation carve-in + review-type options |
| `work-package/techniques/update-pr/post-review-comment.md` | **directly modified** | Builds Plan/Reports links from `artifact_publish_ref` at post time |
| `work-package/resources/publish-review-artifacts.md` (or the publish step within `13-submit-for-review`) | **directly modified / added** | Publish-before-post ordering — push review artifacts to the publish ref before the comment posts |
| `meta/techniques/workflow-engine/commit-and-persist.md` | **directly modified** | Carve `submit-for-review` out of blanket `commit-after-activity` ordering |
| `work-package/workflow.yaml` | **indirectly affected** | Adds the `artifact_publish_ref` variable; version bump; possible `commit-after-activity` scoping cross-ref in `rules[]` |
| `work-package/REVIEW-MODE.md`, `README.md`, `activities/README.md` | **indirectly affected** | Orientation docs referencing submit-for-review / review-summary-approval may need pointer alignment (no body changes expected) |

## Integrity Checks

- **Transition integrity** — no activities added, removed, or reordered; `initialActivity` and every `transitions[].to` unchanged. `13-submit-for-review` keeps its id and position. **No broken chains.**
- **Reference integrity** — all touched technique/resource files exist and resolve (verified against the workflows library checkout): `resources/review-mode.md`, `techniques/review-summary.md`, `techniques/update-pr/post-review-comment.md`, `meta/techniques/workflow-engine/commit-and-persist.md`. `submit-for-review` is referenced by `12-strategic-review.yaml` (incoming transition), `workflow.yaml`, and orientation docs — all preserved.
- **Variable integrity** — new `artifact_publish_ref` variable is additive; it must be declared on `work-package/workflow.yaml` `variables[]` before any gate/checkpoint references it. No existing variable's type changes; no existing `condition.variable` / `effect.setVariable` keys are altered.

## Side-Effect Trace

- Adding the `artifact_publish_ref` variable → must be declared in `workflow.yaml` and seeded (SHA preferred, branch fallback) before `13-submit-for-review` reads it.
- Adding publish-before-post steps to `13-submit-for-review` → requires the `commit-after-activity` carve-out so the generic post-activity commit does not preempt the in-activity publish ordering (cross-cutting; touches `meta`).
- Adding checkpoint options to review-summary approval → new `effect.setVariable` keys (review-type / rating-cap) must resolve to declared variables.

## Removals Inventory

**`removal_count` = 1** — the hardcoded `/blob/main/` link construction in `work-package/resources/review-mode.md` (and mirrored in `post-review-comment.md`) is **replaced** by `artifact_publish_ref`-based links.

| Removed | Preserved |
|---------|-----------|
| Hardcoded `/blob/main/` ref in Plan/Reports link building | The link-building step itself, its anchor targets, and the surrounding publish/post procedure — only the ref source changes |

No files are removed. No sections are dropped; the change is otherwise additive.

## Preservations

- Pass A (#271) surfaces already on the branch.
- The activity graph shape, workflow identity/tags, and the `meta` dispatch model.
- All existing transition, technique, resource, and variable wiring not listed above.
