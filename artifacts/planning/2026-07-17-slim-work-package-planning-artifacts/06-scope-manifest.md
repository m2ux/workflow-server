# Scope Manifest — slim work-package planning artifacts

**Target:** `work-package` v3.30.0 · **Mode:** update
**Basis:** [design specification](03-design-specification.md) · [impact analysis](05-impact-analysis.md)
**Worktree:** `/home/mike1/projects/main/workflow-server/workflows` ✅ · folder layout unchanged

All entries are **modify**. No create / remove / rename. Topology unchanged. Intentional removals: **5** ([impact §3](05-impact-analysis.md#3-removals-inventory)).

`file_count` = **4**

---

## File manifest

| # | Path (under `work-package/`) | Type | Action | One-line change |
|---|-------------------------------|------|--------|-----------------|
| 1 | `activities/10-post-impl-review.yaml` | activity | modify | Link `{change_block_index}` in `file-index-table` message, drop the corrections-location parenthetical; fold the stale-filename clause out of `rationale-confirmed-with-issues` |
| 2 | `activities/13-submit-for-review.yaml` | activity | modify | Link `{provenance_log_path}` in `dco-sign-off-confirmation`; collapse context bullets + 6-item certify list to the 3 load-bearing certify items |
| 3 | `activities/04-research.yaml` | activity | modify | `research-convergence` message: drop the sentence restating what "converged" means |
| 4 | `activities/02-design-philosophy.yaml` | activity | modify | `proceed-with-gaps` option description: one clause instead of two |

**Out of scope this pass:** `workflow.yaml` (version bump at commit only); 7 confirm-only audited persist techniques — no drift found, no edits; remaining ~145 files (11 other activities, 81 other technique leaves, 27 resources, README) — unaffected.

---

## Structural design

```
work-package/             # unchanged
├── workflow.yaml          # untouched this pass (version bump at commit)
├── README.md
├── activities/            # 15 activities — edit 4 listed above, no add/remove/reorder
├── techniques/            # 7 audited (no drift, no edits)
└── resources/             # unchanged
```

**Flow (unchanged):** message/description-only edits inside four existing activities — no activity, transition, checkpoint, option, or variable change.

| Pattern | This change |
|---------|-------------|
| Output Economy | Checkpoint messages/descriptions tightened to decision-facing content only |
| Single source / link | `{change_block_index}` / `{provenance_log_path}` rendered as links where the variable already exists; no restatement |
| Additive topology | Zero activity/transition/checkpoint/option/variable changes; 5 intentional content removals |

---

## Drafting order

1. **Activities (1–4)** — checkpoint message/description edits only; each file's patch version bumps alongside its edit

**Rationale:** The confirm-only technique audit already found no drift, so drafting starts and ends at the four checkpoint-linked activity files — no technique, resource, or `workflow.yaml` changes this pass.
