# Scope Manifest — Git-Derived Host Repo Binding

**Target:** `meta` v5.11.0 → v5.12.0 (primary) · `work-package` v3.36.0 → v3.37.0 (secondary) · **Mode:** Update
**Basis:** [change brief](01-change-brief.md) · [impact analysis](01-impact-analysis.md)
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-git-derived-host-repo-binding` — present, on branch `workflow/meta-git-derived-host-repo-binding` cut from `origin/workflows` @ `f84fe02b` (the baseline the impact analysis pins)

19 files: 1 created, 18 modified, 0 removed. Preserved instead of removed: 0 — all six inventoried removals are approved.

The six judgements the brief left open are resolved in [Resolutions](01-change-brief.md#resolutions). Their effect on this table: judgement 3 adds rows 11-13, judgement 4 adds row 10, judgement 5 keeps the server-repo snapshots out (see *Out of scope*), and judgements 1, 2 and 6 add no row.

---

## File manifest

Paths are relative to the edit-surface root; the leading segment is the workflow id.

| # | Path | Kind | Action | One-line change |
|---|------|------|--------|-----------------|
| 1 | `meta/workflow.yaml` | root | modify | Declare `host_repo_path`, `is_monorepo_host`, `component_hint`, `component_path`, `host_binding_mismatch` and `mentioned_repo` — six, not the four the brief anticipated: the mismatch gate needs a declared boolean to gate on, and `mentioned_repo` is emitted as a sibling of `identifying_context` rather than a field inside it so that judgement 4's exclusion from resume scoring is structural rather than a caveat; retire the `target_path` declaration (line 82) and reword the second, prose-only mention inside `planning_folder`'s description (line 71); stop `target_repo`'s description (line 38) citing `AGENTS.md` as its source; bump to 5.12.0 |
| 2 | `work-package/workflow.yaml` | root | modify | Give `discovered_path` a definite source and description now that a producer exists; bump to 3.37.0 |
| 3 | `meta/techniques/version-control/resolve-host-repo.md` | technique | create | The git ascent through claiming superprojects, the origin-remote read, and the basename assertion; outputs `target_repo`, `host_repo_path`, `is_monorepo_host`, `component_hint` |
| 4 | `meta/techniques/version-control/TECHNIQUE.md` | technique | modify | Add the host-vs-component invariant as a rule beside `infrastructure-submodule-paths`, stated once |
| 5 | `meta/techniques/version-control/select-target-component.md` | technique | modify | Rename the declared output to `component_path`; consume `mentioned_repo` and `component_hint` as component context only |
| 6 | `meta/techniques/version-control/detect-repo-type.md` | technique | modify | Rename the declared output to `component_path` — the seam's second producer, set to `.` for a regular repo |
| 7 | `meta/techniques/workflow-engine/extract-identifying-context.md` | technique | modify | Emit `mentioned_repo` from PR/issue URLs as a declared output |
| 8 | `meta/techniques/workflow-engine/start-session.md` | technique | modify | `repo` becomes derived-first via `resolve-host-repo`, with workspace prose and the user demoted to fallback |
| 9 | `work-package/techniques/repo-root-resolution.md` | technique | modify | Generalise the single-level parent test to the multi-level ascent; restate the `discovered_path` contract now that it is bound |
| 10 | `meta/techniques/workflow-engine/match-saved-session.md` | technique | modify | State that `mentioned_repo` is excluded from `identifying_context` overlap scoring, so a component fact cannot pick a host session |
| 11 | `meta/techniques/workflow-engine/commit-and-persist.md` | technique | modify | Repoint its three `{target_path}` reads at `component_path`, the fact its prose already names |
| 12 | `meta/techniques/agent-conduct.md` | technique | modify | Repoint the commit-location assertion at `component_path` |
| 13 | `meta/techniques/cargo-operations/preflight.md` | technique | modify | Repoint the build-script inspection at `component_path` |
| 14 | `meta/activities/00-discover-session.yaml` | activity | modify | Add the host-resolution step ahead of the transition to `initialize-session`, and the basename-mismatch checkpoint |
| 15 | `meta/activities/02-resolve-target.yaml` | activity | modify | Add the binding-agreement validation; rename **five** `target_path` references — activity description (4), activity rule (7), submodule-selection message (39), option description (43), validation message (58) |
| 16 | `work-package/activities/01-start-work-package.yaml` | activity | modify | Give `resolve-repo-root` the explicit `discovered_path` binding it has never had |
| 17 | `meta/resources/bootstrap-protocol.md` | resource | modify | Rewrite step 2 from a prose lookup to the derivation, prose demoted to fallback |
| 18 | `meta/README.md` | readme | modify | Rename four `target_path` references |
| 19 | `meta/activities/README.md` | readme | modify | Rename two `target_path` references, prose and diagram |

**Reconciled against the edit surface.** Every count above was re-derived from the worktree rather than carried over. Two corrections to the impact analysis's figures: `02-resolve-target.yaml` holds five `target_path` sites, not four, and `meta/workflow.yaml` holds two, the second being prose inside another variable's description. Confirmed as stated: `meta/README.md` 4, `meta/activities/README.md` 2, `commit-and-persist.md` 3, `agent-conduct.md` 1, `preflight.md` 2, and both renamed producers 3 each. All five new identifiers (`component_path`, `host_repo_path`, `is_monorepo_host`, `component_hint`, `mentioned_repo`) are unused tree-wide, so no rename collides. `resolve-host-repo.md` is absent from `version-control/`, so row 3 is a true create. `discovered_path` appears only at `work-package/workflow.yaml:514`, four sites in `repo-root-resolution.md`, and `remediate-vuln/activities/01-start.yaml:44` — never in `01-start-work-package.yaml`, which confirms the unbound-input defect.

**Out of scope this pass:**

- `tests/e2e/__snapshots__/corpus-sha.json` and `snapshot.test.ts.snap` — server-repo files, not reachable from this run's edit surface, which is a checkout of the `workflows` repo alone. The walk stays red until a separate server-repo change bumps the submodule pointer and re-baselines.
- `remediate-vuln/activities/01-start.yaml` — read for compatibility only. It declares its own `target_path`, so its `discovered_path: target_path` binding is unaffected by `meta`'s rename.
- `work-package/activities/06-plan-prepare.yaml` — validates `work-package`'s own `target_path` and `repo_root`; neither name changes.
- The server's basename-only multi-root mapping. This run asserts against it and gates on mismatch.
- The pre-existing undeclared-variable failures outside the renamed fact (`matched_session`, `current_activity`, `worker_yielded_checkpoint`, `worker_result`, `user_selection`) and `work-package`'s doubled `naming-conventions` binding.
- Ungating `extract-identifying-context` from resume intent.

---

## Structural design

```
meta/                                          # layout unchanged
├── workflow.yaml                              # contract: 4 facts added, target_path retired
├── README.md
├── activities/
│   ├── README.md
│   ├── 00-discover-session.yaml               # + host-resolution step, + basename-mismatch gate
│   └── 02-resolve-target.yaml                 # + binding-agreement validation
├── resources/
│   └── bootstrap-protocol.md                  # step 2 derives instead of reading prose
└── techniques/
    ├── agent-conduct.md
    ├── cargo-operations/preflight.md
    ├── version-control/
    │   ├── TECHNIQUE.md                       # + host-vs-component invariant rule
    │   ├── resolve-host-repo.md               # NEW — the only file created
    │   ├── select-target-component.md
    │   └── detect-repo-type.md
    └── workflow-engine/
        ├── extract-identifying-context.md
        ├── start-session.md
        ├── match-saved-session.md
        └── commit-and-persist.md

work-package/                                  # layout unchanged
├── workflow.yaml                              # discovered_path gains a source
├── activities/01-start-work-package.yaml      # resolve-repo-root gains its binding
└── techniques/repo-root-resolution.md         # single-level test → multi-level ascent
```

**Flow:** Transition topology is unchanged in both targets — no activity is added, removed or reordered, and no `transitions[]` block is edited. Inside `00-discover-session` the new host-resolution step and its mismatch gate sit ahead of the existing transition to `initialize-session`; `02-resolve-target` gains an assertion, not a gate.

| Convention | This change |
|------------|-------------|
| File naming | `resolve-host-repo.md` is kebab-case `.md` inside an existing technique group; no activity file is added, so `NN-name.yaml` is untouched |
| Field ordering | The new technique opens `id`, `version`, `capability`, matching its `version-control/` siblings |
| Version format | Semantic minor bumps — `meta` 5.11.0 → 5.12.0, `work-package` 3.36.0 → 3.37.0 — additive with one rename |
| Transition patterns | Unchanged; no activity-level `transitions[]` is edited |
| Checkpoint structure | The basename-mismatch gate is an inline `kind: checkpoint` step with `message`, `options` and effects, matching the gates already in `00-discover-session` |
| Technique structure | `resolve-host-repo.md` carries Capability / Protocol / Inputs / Outputs and is bound via `step.technique`; the new invariant is a `TECHNIQUE.md` rule anchor, not a `group::op` citation — the malformed form the impact analysis flags on `infrastructure-submodule-paths` |

---

## Drafting order

1. **Contracts** (rows 1-2) — the four new facts must be declared, and `discovered_path` given a source, before any file binds against a name.
2. **New technique** (row 3) — the producer both the activity step and the bootstrap rewrite call; every reference to it dangles until it lands.
3. **Group rule** (row 4) — states the host/component invariant the remaining technique edits are written against.
4. **Producer techniques** (rows 5-7) — the renamed output and the new field, both producers of the renamed fact changed together so it never carries two names.
5. **Consumer techniques** (rows 8-13) — each declares which of the now-distinct facts it wants.
6. **Activities** (rows 14-16) — bindings written once their techniques and contracts are settled.
7. **Resource** (row 17) — step 2 cites the technique at its landed path.
8. **READMEs** (rows 18-19) — describe the tree as it finally reads.
