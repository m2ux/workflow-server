# Scope Manifest — Planning Retrospective Findings (Iterate Lap 2)

**Target:** `workflow-design` v1.30.0 (primary, draft) · `work-package` v3.34.0 (secondary) · **Mode:** update
**Basis:** [design specification](03-design-specification.md) · [impact](05-impact-analysis.md)
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-21-planning-retrospective-findings/` ✅ · folder layout unchanged

In-place step/condition/transition edits for post-update auto-remedia, gated satellite persists, persist-path migration, and AP-98 message rewrite. Intentional removals: **3** ([impact §3](05-impact-analysis.md)); A-12 open for Gate 2.

`file_count` = **9**

---

## File manifest

| # | Path (under worktree root) | Type | Action | One-line change |
|---|-------------------------------|------|--------|-----------------|
| 1 | `workflow-design/activities/10-post-update-review.yaml` | activity | modify | Gate expressiveness/conformance persists; remove `post-update-disposition`; add QR-style remedia while-loop; rebind snapshot to `write-artifact`; dirty→intake / remedia-success→re-commit transitions (A-12) |
| 2 | `workflow-design/activities/08-quality-review.yaml` | activity | modify | Rebind `persist-compliance-report` → `write-artifact` (`compliance-review.md`) |
| 3 | `workflow-design/activities/09-validate-and-commit.yaml` | activity | modify | Rebind `save-compliance-report` → `write-artifact` (`compliance-review.md`) |
| 4 | `workflow-design/techniques/persist-report.md` | technique | remove | Retire separate writer after all binds migrate to `write-artifact` |
| 5 | `work-package/activities/14-complete.yaml` | activity | modify | AP-98: `retrospective-confirm.message` status-only (drop next-step clause) |
| 6 | `workflow-design/workflow.yaml` | workflow | modify | Version bump; drop “post-update findings disposition” from headless rule; add `needs_recommit` if remedia-success path needs it |
| 7 | `workflow-design/activities/README.md` | readme | modify | Post-update blurb: auto-remedia, no disposition ask |
| 8 | `workflow-design/README.md` | readme | modify | Drop `persist-report` catalog row / tree entry |
| 9 | `workflow-design/techniques/README.md` | readme | modify | Drop `persist-report` from Reporting group |

**Out of scope this pass:**
- Re-opening lap-1 retrospective themes already committed (unless they regress)
- MCP server source (`src/`, `schemas/`)
- Activity add/remove/reorder
- Soften alternatives for remedia (mandate: always fix; never ask)
- Closing A-12 at draft time — prefer remedia → `validate-and-commit`; Gate 2 confirms

---

## Structural design

```
{worktree}/                    # unchanged top-level layout
├── workflow-design/
│   ├── workflow.yaml          # version + headless rule + optional needs_recommit
│   ├── activities/
│   │   ├── 08-quality-review.yaml
│   │   ├── 09-validate-and-commit.yaml
│   │   ├── 10-post-update-review.yaml   # primary structural change
│   │   └── README.md
│   ├── techniques/
│   │   ├── persist-report.md  # REMOVE
│   │   └── README.md
│   └── README.md
└── work-package/
    └── activities/
        └── 14-complete.yaml   # message-only
```

**Flow:** Topology unchanged at activity level. Inside `post-update-review`: remove disposition checkpoint; after summarize + snapshot, when findings remain run `while` remedia (apply → re-audit → reassess); clean (never dirty) → retrospective; remedia success → `validate-and-commit` (A-12 draft); remedia still dirty → `intake-and-context` (no ask).

| Pattern | This change |
|---------|-------------|
| Count-gated satellite persist | `*_finding_count > 0` on post-update expressiveness/conformance (mirror QR) |
| QR-style remedia while-loop | `audit-fix-cycle` shape: apply + re-audit + reassess, `maxIterations` bound |
| Bound `write-artifact` | Report snapshots bind `manage-artifacts::write-artifact` directly; retire `persist-report` |
| Soft-gate message hygiene | AP-98: status-only `retrospective-confirm.message` |
| Auto-escalate | Dirty after remedia → `intake-and-context` via transition, not checkpoint options |

---

## Drafting order

1. **`10-post-update-review.yaml`** — gates, remedia loop, transitions, write-artifact snapshot (shapes the rest)
2. **Persist-path siblings** — QR + validate-and-commit rebinds; delete `persist-report.md`
3. **`14-complete.yaml`** — AP-98 message rewrite
4. **workflow.yaml + READMEs** — version, headless rule, catalog cleanup

**Rationale:** Activity structure first so catalog/README deletions match the retired writer; message and orientation edits last.
