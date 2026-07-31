# Scope Manifest — Periodic Email Check Workflow

**Target:** `periodic-email-check` v1.0.0 · **Mode:** Create
**Basis:** [change brief](01-change-brief.md)
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-periodic-email-check-workflow/` — present, on branch `workflow/periodic-email-check`

Eighteen files: seventeen created under `periodic-email-check/`, one modified (the library index row that makes the new workflow discoverable).

---

## Judgement closures this manifest rests on

The [change brief](01-change-brief.md) left eight judgements open and every dimension below purpose unshaped. The manifest below cannot exist without them closed, so each closure is recorded here against the dimension it unblocks. The brief remains the canonical home for the judgements themselves.

| # | Closure | Structural consequence |
|---|---------|------------------------|
| 1 | Report only — a pass classifies and records, and disposes of nothing | No disposition activity, no per-action approval gate, no undo path |
| 2 | Cadence is the caller's — a run is one pass, recurrence comes from whatever starts it | No schedule construct; the one soft gate carries `defaultOption` + `autoAdvanceMs` |
| 3 | Scope is a filter plus a cap — `mailbox_query` and `max_messages` | Single bounded pass; no paging activity |
| 4 | Rubric is a fixed, user-editable resource, not a learned judgement | `resources/attention-rubric.md`; no calibration gate and no rework loop |
| 5 | Output is a per-pass planning-folder artifact, with a closing message as the pointer | `triage-report.md` via `write-artifact`; no notification technique |
| 6 | Strictly read-only, including read state | `read-only-mailbox` as a universal rule; no write scope anywhere |
| 7 | The definition preflights the connector | `preflight-mailbox` plus a terminal decision branch in `open-pass` |
| 8 | A watermark file the workflow owns carries "since the previous pass" | `watermark_path` variable; `resolve-pass-window` reads it, `advance-watermark` writes it |

---

## File manifest

| # | Path (under `periodic-email-check/`) | Kind | Action | One-line change |
|---|-------------------------------------|------|--------|-----------------|
| 1 | `workflow.yaml` | root | create | Workflow identity, tags, the three rule buckets, the variable model, and `initialActivity: open-pass` |
| 2 | `activities/01-open-pass.yaml` | activity | create | Preflight the mailbox, confirm the subset, resolve the pass window; terminal branch when the mailbox is unreadable |
| 3 | `activities/02-classify-mail.yaml` | activity | create | Fetch the window's messages, then a `forEach` that places each one against the rubric and gathers the verdicts |
| 4 | `activities/03-record-pass.yaml` | activity | create | Compose and write the triage report, advance the watermark, close with the attention count |
| 5 | `activities/README.md` | readme | create | Activity orientation map and the transition diagram |
| 6 | `techniques/TECHNIQUE.md` | technique | create | Root base contract — `mailbox_query`, `max_messages`, `watermark_path`, and the read-only and citation rules |
| 7 | `techniques/preflight-mailbox.md` | technique | create | Probe mailbox readability and name the authorization step when it is unreadable |
| 8 | `techniques/resolve-pass-window.md` | technique | create | Read the prior watermark and fix the query, since-point and cap this pass covers |
| 9 | `techniques/fetch-messages.md` | technique | create | Read the window into one bounded digest per message |
| 10 | `techniques/classify-message.md` | technique | create | Place one message against the rubric and cite the clause the verdict rests on |
| 11 | `techniques/compose-triage-report.md` | technique | create | Fold the pass's verdicts into `triage-report.md` and count the attention items |
| 12 | `techniques/advance-watermark.md` | technique | create | Move the watermark to the newest message the pass classified |
| 13 | `techniques/README.md` | readme | create | Technique catalog with capability and artifact columns |
| 14 | `resources/attention-rubric.md` | resource | create | The attention classes, the test for each, and the rule for an unclear call |
| 15 | `resources/triage-report-format.md` | resource | create | The triage-report template and the rules its rows obey |
| 16 | `resources/README.md` | readme | create | Resource catalog and the cross-workflow load form |
| 17 | `README.md` | readme | create | Workflow orientation — purpose, concepts, activity table, technique table, resource pointers |
| 18 | `../README.md` | readme | modify | One row in the library index's Available Workflows table |

**Out of scope this pass:**

- Any mailbox write path — no send, label, archive, or read-state operation is authored (judgement 6).
- The recurring trigger that invokes a run (judgement 2 — the cadence lives with the caller).
- A shared mail-operations group under `meta/techniques/` — the mailbox read stays workflow-local until a second workflow needs it.
- Authorizing the Gmail connector, which is environment state rather than definition content.

---

## Structural design

```
periodic-email-check/
├── README.md
├── workflow.yaml
├── activities/
│   ├── README.md
│   ├── 01-open-pass.yaml
│   ├── 02-classify-mail.yaml
│   └── 03-record-pass.yaml
├── techniques/
│   ├── README.md
│   ├── TECHNIQUE.md
│   ├── preflight-mailbox.md
│   ├── resolve-pass-window.md
│   ├── fetch-messages.md
│   ├── classify-message.md
│   ├── compose-triage-report.md
│   └── advance-watermark.md
└── resources/
    ├── README.md
    ├── attention-rubric.md
    └── triage-report-format.md
```

**Flow:** a linear three-activity spine — `open-pass` → `classify-mail` → `record-pass` — with one terminal branch: an unreadable mailbox ends the pass in `open-pass` through the `mailbox-readability` decision, before anything is read.

| Convention | This change |
|------------|-------------|
| Activities `NN-name.yaml`, techniques and resources kebab-case `.md` | Followed for all seventeen new files |
| Semantic `X.Y.Z` versions | `1.0.0` on the workflow and on each activity and technique |
| Activity-level `transitions[]` with `to` / `isDefault` | Used on `open-pass` and `classify-mail`; `record-pass` is terminal and declares none |
| Inline `kind: checkpoint` steps with `message`, `options`, effects | One soft checkpoint, `pass-scope-confirmed`, in `open-pass` |
| Technique Capability / Inputs / Outputs / Protocol / Rules ordering, binding via `step.technique` | Followed; six standalone operations bound bare, as in `ponytail` |
| Root `TECHNIQUE.md` for shared inputs and rules | Carries the three scope inputs and the workflow invariants |
| Cross-iteration gather as a value-bearing `set` on the loop-body step | `message_verdicts` gathered on the `classify-message` step, as `workflow-authoring` does for `register_sections` |

---

## Drafting order

1. **Root definition** — `workflow.yaml` fixes the ids, the variable model and the rule buckets every later file binds against.
2. **Activities** — the three YAMLs fix which operations exist and what each one is handed, so the technique signatures are written against real bind sites.
3. **Techniques** — the base contract first, then the six operations in flow order, so each one's inputs are already produced upstream.
4. **Resources** — the rubric and the report format, written after the techniques that link into their anchors.
5. **READMEs** — the three folder indexes and the workflow README last, so each describes a tree that already exists.
6. **Library index** — the Available Workflows row last of all, once the workflow it points at is complete.
