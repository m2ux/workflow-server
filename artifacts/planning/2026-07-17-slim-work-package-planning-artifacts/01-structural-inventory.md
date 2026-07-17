# Structural Inventory — `work-package` v3.31.0

| Entity | Count |
|---|---|
| Files (total) | 153 |
| Activities | 15 |
| Techniques (leaf `.md`) | 88 (+16 grouped under `TECHNIQUE.md` containers) |
| Resources (`.md`) | 28 |
| Checkpoints (`kind: checkpoint`) | 39 |
| Transitions (`- to:`) | 27 |
| Steps (all kinds) | 246 |
| Loop steps | 19 |
| Workflow variables | 108 |

## Checkpoint-linked artifacts (target of this update)

Checkpoint `message` fields overwhelmingly link **zero or one** artifact each — only 2 of 39 checkpoints stack 2+ peer links in the message body itself (`10-post-impl-review.yaml#file-index-table`, `13-submit-for-review.yaml#dco-sign-off-confirmation`). The cognitive-load problem is less about link-stacking in messages and more about the **linked artifacts themselves**: persist techniques across `implementation-analysis/`, `research/`, `review-assumptions/`, `strategic-review/`, `design-philosophy/`, and `finalize-documentation/` write large, narrative artifacts that a checkpoint then asks the user to evaluate. Confirmed in requirements-refinement (next activity) via a per-technique audit of persist steps against the workflow-design precedent shape.

## Precedent shape (workflow-design update, PR #254)

Output Economy applied to artifact *contracts* (technique persist steps) and *primary-link gates* (checkpoint messages), not topology. Scope was 14 files, no activity/transition changes.
