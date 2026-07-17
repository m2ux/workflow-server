# Scope Manifest — slim workflow-design planning artifacts

**Target:** `workflow-design` v1.24.1 · **Mode:** update  
**Basis:** [03-design-specification.md](03-design-specification.md) · [05-impact-analysis.md](05-impact-analysis.md)  
**Worktree:** `/home/mike1/projects/main/workflow-server/workflows` ✅ · folder layout unchanged

All entries are **modify**. No create / remove / rename. Topology unchanged. Intentional removals: **12** ([impact §3](05-impact-analysis.md#3-removals-inventory)).

`file_count` = **14**

---

## File manifest

| # | Path (under `workflow-design/`) | Type | One-line change |
|---|---------------------------------|------|-----------------|
| 1 | `techniques/context-loading.md` | technique | Persist contracts: short tables; only what this change needs |
| 2 | `techniques/persist-design-specification.md` | technique | Spec shape = purpose + dimension deltas |
| 3 | `techniques/impact-analysis.md` | technique | Decision-facing report; skip unaffected per-file essays |
| 4 | `techniques/scope-definition.md` | technique | Lean manifest; minimal structural/drafting sections |
| 5 | `techniques/pattern-analysis.md` | technique | Leaner comparison artifact |
| 6 | `techniques/assemble-file-approach.md` | technique | Per-file delta only |
| 7 | `techniques/review-drafted-file.md` | technique | Delta / attestation focus |
| 8 | `techniques/compile-report.md` | technique | Rolled-up report; detail in satellites |
| 9 | `techniques/create-completion-doc.md` | technique | Close-out links decisions elsewhere |
| 10 | `resources/design-context-readme.md` | resource | Index: summary + links, not restatements |
| 11 | `resources/compliance-report.md` | resource | Finding tables; satellites for detail |
| 12 | `resources/completion-artifact.md` | resource | Keep close-out short; link decisions |
| 13 | `activities/01-intake-and-context.yaml` | activity | Change-request / literacy: one primary link |
| 14 | `activities/08-quality-review.yaml` | activity | Multi-link disposition → primary report |

**Out of scope this pass:** `workflow.yaml` (version bump at commit), `persist-report` / `summarize-findings` / `synthesize-update-specification` / `design-principles` (impact “possibly touched” only if draft finds a gap), all other activities/techniques/resources/README.

---

## Structural design

```
workflow-design/          # unchanged
├── workflow.yaml
├── README.md
├── activities/           # 9 activities — no add/remove/reorder
├── techniques/           # leaf .md — edit 9 listed above
└── resources/            # guidance .md — edit 3 listed above
```

**Flow (unchanged):** intake → requirements → (pattern \| impact) → scope-and-draft → quality-review → validate-and-commit → (post-update) → retrospective.

| Pattern | This change |
|---------|-------------|
| Output Economy | Planning artifacts and gate links stay decision-facing |
| Single source / link | README + messages link; do not restate |
| Additive topology | Zero activity/transition changes; 12 intentional content removals |

---

## Drafting order

1. **Techniques (1–9)** — persist/protocol contracts first (writers emit lean shapes)
2. **Resources (10–12)** — templates aligned to those contracts
3. **Activities (13–14)** — checkpoint messages: one primary link

**Rationale:** Contracts before templates before gate copy. No `workflow.yaml` or root README in the loop.
