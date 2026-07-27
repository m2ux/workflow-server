# Scope Manifest — Conditional Session Resume

**Target:** `meta` v5.8.0 · **Mode:** update
**Basis:** [design specification](03-design-specification.md) · [impact](06-impact-analysis.md)
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-27-conditional-session-resume` ✅ (branch `workflow/meta-conditional-session-resume`) · folder layout unchanged

Six existing files are modified and two leaf files are created — one `workflow-engine` operation and one resource. Intentional removals: **4** ([impact §3](06-impact-analysis.md#3-removals-inventory)).

`file_count` = **8**

---

## File manifest

Paths are relative to `meta/` inside the worktree (the `workflows` library root).

| # | Path (under `meta/`) | Type | Action | One-line change |
|---|----------------------|------|--------|-----------------|
| 1 | `workflow.yaml` | workflow | modify | Declare boolean `resume_intent_requested` (`defaultValue: false`); bump `version` to 5.9.0 |
| 2 | `activities/00-discover-session.yaml` | activity | modify | Add `detect-resume-intent` step, gate the search trio on `resume_intent_requested`, derive `has_saved_state` in `record-match`, replace activity rule 1; bump `version` |
| 3 | `techniques/workflow-engine/detect-resume-intent.md` | technique | create | New operation — input `user_request`, output `resume_intent_requested`; Protocol cites the lexicon resource |
| 4 | `techniques/workflow-engine/scan-saved-sessions.md` | technique | modify | Candidate filter reads the client workflow id at its recorded nesting depth; bump `metadata.version` |
| 5 | `resources/resume-intent-lexicon.md` | resource | create | New resource — the continuation-phrase vocabulary the detection Protocol matches against |
| 6 | `resources/README.md` | readme | modify | Resource Index gains a `resume-intent-lexicon` row |
| 7 | `activities/README.md` | readme | modify | `00. Discover Session` entry states the intent precondition in place of the "even when the user said 'start'" clause |
| 8 | `README.md` | readme | modify | Flow-legend edge label carries the new variable; activity-table role text; header version reads v5.9.0 |

**Out of scope this pass:**

- `techniques/workflow-engine/extract-identifying-context.md` — detection stays a separate operation, so its `user_request` contract is unchanged.
- `activities/01-initialize-session.yaml` — reads `is_resuming`, which the `resume-session` checkpoint still sets.
- `src/schema/activity.schema.ts` (parent repo, outside the workflows component) — its `when` doc example stays syntactically valid; touching it would drag the parent repo into this worktree.
- The deferrals recorded in [deferred items](05-deferred-items.md).

---

## Structural design

```
meta/   # unchanged topology; two new leaves marked +
├── workflow.yaml
├── README.md
├── activities/
│   ├── 00-discover-session.yaml
│   ├── 01-initialize-session.yaml … 04-end-workflow.yaml
│   ├── patterns/
│   └── README.md
├── techniques/
│   └── workflow-engine/
│       ├── detect-resume-intent.md        +
│       └── scan-saved-sessions.md
└── resources/
    ├── resume-intent-lexicon.md           +
    └── README.md
```

**Flow:** Lifecycle topology is untouched — `00`→`01`→`02`→`03`, `04` terminal; only `discover-session`'s internal step sequence changes.

| Pattern | This change |
|---------|-------------|
| Atomic technique per capability | Intent detection is its own `workflow-engine` operation, not a second output on `extract-identifying-context` |
| `when:` gate on non-checkpoint steps | The search trio gains `when: resume_intent_requested == true`, the live form in `meta` |
| Vocabulary as a cited resource | The continuation-phrase list is `resources/resume-intent-lexicon.md`, referenced from Protocol by file-relative link |
| Flat-file technique/resource lookup | Both new leaves resolve without index registration; `resources/README.md` is documentation, not a registry |
| Constraint encoded as structure | The precondition is a declared variable plus step gates, with the activity rule restating it in prose |

---

## Drafting order

1. **`workflow.yaml`** — the gate variable must be declared before any step reads it.
2. **Techniques and resource** (`detect-resume-intent.md`, `resume-intent-lexicon.md`, `scan-saved-sessions.md`) — the operation and vocabulary the activity binds to.
3. **Activity** (`00-discover-session.yaml`) — binds the new operation and applies the gate, so it lands once its referents exist.
4. **READMEs** (`resources/README.md`, `activities/README.md`, `README.md`) — orientation follows the definitions it describes.

**Rationale:** Each tier's references resolve against content already written, so no draft cites a file that does not yet exist.
