# Scope Manifest — Git-Derived Host Repo Binding

**Targets:** `meta` v5.11.0 → v5.12.0 (primary) · `work-package` v3.36.0 → v3.37.0 (secondary) · `workflow-design` v1.30.0 → v1.31.0 · `workflow-authoring` v1.0.0 → v1.1.0 · `remediate-vuln` v2.0.0 → v2.1.0 · **Mode:** Update
**Basis:** [change brief](01-change-brief.md) · [impact analysis](01-impact-analysis.md) · findings in [findings register](08-findings-register.md)
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-git-derived-host-repo-binding` — branch `workflow/meta-git-derived-host-repo-binding` cut from `origin/workflows` @ `f84fe02b`, now at `87c26fff`

**Delivered: 45 files — 2 created, 43 modified, 0 removed.** Planned at confirmation: 19 files. Canonical home
for this run's file manifest, structural design and drafting order.

## Reconciliation status

`verify-scope-manifest` is gated `remediation_selected != true`. Two remediation rounds held that false, so
the gate skipped on three consecutive entries into `validate-and-commit` and this manifest went un-reconciled
while the change grew from 19 files to 45. **This section is that reconciliation, run against the branch tip.**

Both directions were checked, per `both-directions-or-neither`:

| Direction | Result |
|---|---|
| Every manifest entry → the worktree | **19 of 19 delivered.** Each file exists, each recorded action (1 create, 18 modify) was the action performed. **5 entries describe a design the run later superseded** — recorded as supersessions below, not as outstanding work |
| The worktree → the manifest | **26 files changed that no entry named.** All 26 are accounted for below; none is an undisclosed edit. 23 are propagation of one rename, 3 are not |
| **Net** | **45 of 45 entries delivered, 0 outstanding** |

The 19 → 45 growth is not scope creep in the ordinary sense. It is almost entirely **one finding**: MH-5
required the `repo_root` → `host_repo_path` merge to complete library-wide, because stopping at the declared
targets would have left three other workflows reading an id that no longer exists. The operator widened
`target_workflow_ids` from two to five specifically to authorise it.

---

## File manifest — planned (19)

Paths are relative to the edit-surface root; the leading segment is the workflow id. **Delivered** records
whether the entry landed as written; ⚠ marks an entry whose design the run superseded.

| # | Path | Kind | Action | One-line change | Delivered |
|---|------|------|--------|-----------------|-----------|
| 1 | `meta/workflow.yaml` | root | modify | Declare `host_repo_path`, `is_monorepo_host`, `component_hint`, `component_path`, `host_binding_mismatch` and `mentioned_repo`; retire the `target_path` declaration and reword the prose mention in `planning_folder`'s description; stop `target_repo`'s description citing `AGENTS.md`; bump to 5.12.0 | ⚠ **superseded** — 5 of the 6 ids declared as planned; `is_monorepo_host` was **deleted** instead (S-1) |
| 2 | `work-package/workflow.yaml` | root | modify | Give `discovered_path` a definite source and description now that a producer exists; bump to 3.37.0 | ⚠ **superseded** — `discovered_path` was **retired**, not sourced (S-2). The file instead declares `host_repo_path` and `component_path`, and the `repo_root` alias it also declared was merged away (S-3) |
| 3 | `meta/techniques/version-control/resolve-host-repo.md` | technique | create | The git ascent through claiming superprojects, the origin-remote read, and the basename assertion; outputs `target_repo`, `host_repo_path`, `is_monorepo_host`, `component_hint` | ⚠ **superseded** — created as planned, but the `is_monorepo_host` output was **deleted** (S-1). Ascent, origin read and assertion all landed |
| 4 | `meta/techniques/version-control/TECHNIQUE.md` | technique | modify | Add the host-vs-component invariant as a rule beside `infrastructure-submodule-paths`, stated once | ✓ |
| 5 | `meta/techniques/version-control/select-target-component.md` | technique | modify | Rename the declared output to `component_path`; consume `mentioned_repo` and `component_hint` as component context only | ✓ |
| 6 | `meta/techniques/version-control/detect-repo-type.md` | technique | modify | Rename the declared output to `component_path` — the seam's second producer, set to `.` for a regular repo | ✓ |
| 7 | `meta/techniques/workflow-engine/extract-identifying-context.md` | technique | modify | Emit `mentioned_repo` from PR/issue URLs as a declared output | ✓ |
| 8 | `meta/techniques/workflow-engine/start-session.md` | technique | modify | `repo` becomes derived-first via `resolve-host-repo`, with workspace prose and the user demoted to fallback | ✓ |
| 9 | `work-package/techniques/repo-root-resolution.md` | technique | modify | Generalise the single-level parent test to the multi-level ascent; restate the `discovered_path` contract now that it is bound | ⚠ **superseded** — the ascent moved to the shared `resolve-host-repo` (delegated, not re-authored); there is no `discovered_path` contract to restate (S-2), and the Protocol step that copied `repo_root` onto `host_repo_path` was deleted (S-3) |
| 10 | `meta/techniques/workflow-engine/match-saved-session.md` | technique | modify | State that `mentioned_repo` is excluded from `identifying_context` overlap scoring, so a component fact cannot pick a host session | ✓ |
| 11 | `meta/techniques/workflow-engine/commit-and-persist.md` | technique | modify | Repoint its three `{target_path}` reads at `component_path`, the fact its prose already names | ✓ |
| 12 | `meta/techniques/agent-conduct.md` | technique | modify | Repoint the commit-location assertion at `component_path` | ✓ |
| 13 | `meta/techniques/cargo-operations/preflight.md` | technique | modify | Repoint the build-script inspection at `component_path` | ✓ |
| 14 | `meta/activities/00-discover-session.yaml` | activity | modify | Add the host-resolution step ahead of the transition to `initialize-session`, and the basename-mismatch checkpoint | ✓ |
| 15 | `meta/activities/02-resolve-target.yaml` | activity | modify | Add the binding-agreement validation; rename five `target_path` references | ✓ |
| 16 | `work-package/activities/01-start-work-package.yaml` | activity | modify | Give `resolve-repo-root` the explicit `discovered_path` binding it has never had | ⚠ **superseded** — the step was **split** into `derive-host-repo` (binding the shared `resolve-host-repo`) then `resolve-repo-root`; no `discovered_path` binding exists to add (S-2) |
| 17 | `meta/resources/bootstrap-protocol.md` | resource | modify | Rewrite step 2 from a prose lookup to the derivation, prose demoted to fallback | ✓ |
| 18 | `meta/README.md` | readme | modify | Rename four `target_path` references | ✓ |
| 19 | `meta/activities/README.md` | readme | modify | Rename two `target_path` references, prose and diagram | ✓ |

### Supersessions

A superseded row is one the audit **improved on**, not one the run failed to deliver. Each is traceable to
the finding that reversed it; all three reversals are verified by tree-wide grep in the
[register's round-2 verification pass](08-findings-register.md#round-2-verification-pass).

| Id | Rows | Planned | Delivered instead | Driven by |
|---|---|---|---|---|
| S-1 | 1, 3 | Declare `is_monorepo_host` as a new boolean and produce it | **Deleted** — declaration, Output heading and the Protocol step that set it. All three gates in `02-resolve-target.yaml` compare `is_monorepo`, which already has a declared producer whose root is now the derived host | MH-8. `grep` returns zero hits; the `dead-output` guard rejection cleared |
| S-2 | 2, 9, 16 | Give the unbound `discovered_path` input a definite source and bind it | **Retired** — the variable is gone rather than sourced. Its job was split into a shared producer plus local component assembly, so no caller has to supply a path at all | WC-1. `grep` returns zero hits library-wide |
| S-3 | 2, 9 | *(not planned)* — the manifest did not see the alias | `work-package/workflow.yaml` declared **both** `repo_root` and `host_repo_path`, and `repo-root-resolution.md` carried a Protocol step whose only content was copying one onto the other. Completing MH-5 was therefore a **declaration merge**, not a rename | MH-5. One deliberate survivor, an illustrative bad example in the anti-patterns canon |

---

## Delivered beyond the manifest (26)

### Rename propagation — 23 files

MH-5's merge reaches these. Verified mechanically: each file's diff touches `repo_root` or `host_repo_path`
(`git diff -G`), and each was read before editing to confirm it denotes the same host/outermost-repository
concept. Most also carry the minor version bump the library convention requires.

`meta/techniques/TECHNIQUE.md` · `meta/techniques/version-control/list-submodules.md` ·
`work-package/activities/06-plan-prepare.yaml` · `work-package/activities/README.md` ·
`work-package/techniques/codebase-comprehension/survey.md` ·
`work-package/techniques/manage-git/TECHNIQUE.md` · `work-package/techniques/manage-git/artifact-commits.md` ·
`work-package/techniques/manage-git/create-worktree.md` ·
`work-package/techniques/manage-git/detect-merge-strategy.md` ·
`work-package/techniques/manage-git/remove-worktree.md` ·
`work-package/techniques/manage-git/restore-paths-from-ref.md` ·
`work-package/techniques/manage-git/update-repo-submodules.md` ·
`work-package/techniques/naming-conventions.md` · `work-package/techniques/project-type-detection.md` ·
`work-package/techniques/publish-review-artifacts.md` · `work-package/techniques/review-summary.md` ·
`work-package/techniques/update-pr/TECHNIQUE.md` · `work-package/techniques/update-pr/render.md` ·
`workflow-design/techniques/prepare-workflow-branch.md` · `workflow-design/workflow.yaml` ·
`workflow-authoring/techniques/workflow-definition/derive-workflows-target-path.md` ·
`remediate-vuln/activities/01-start.yaml` · `remediate-vuln/workflow.yaml`

Three of the 23 carry a second, substantive edit beyond the rename:

| Path | Additional change | Driven by |
|---|---|---|
| `meta/techniques/TECHNIQUE.md` | Gained the `## Inputs` section it had been claiming to hold, hoisting `host_repo_path` and `component_path` so the 15 other workflows that bind `meta` ops inherit them | MM-25 |
| `meta/techniques/version-control/list-submodules.md` | Declares `host_repo_path` as an input and anchors the `.gitmodules` read at the derived host root, so a session opened inside a component no longer enumerates the component's own structure | MH-2 |
| `remediate-vuln/activities/01-start.yaml` | Its cross-workflow bind into `work-package::repo-root-resolution` was repaired: `discovered_path: target_path` → `host_repo_path: target_path`. Without this the bind would supply an input the technique no longer declares | WC-1 / WH-1 consumer repair |

### Not rename propagation — 3 files

| Path | Action | Change | Driven by |
|---|---|---|---|
| `meta/techniques/README.md` | **create** | Techniques-directory orientation page mirroring `work-package/techniques/README.md`. Written to orient and link only — no inventory counts and no duplication of the `meta/README.md` techniques table, so it does not trade one finding for another | ML-7 |
| `work-package/activities/11-validate.yaml` | modify | The toolchain-prerequisite validate message restated as cause plus consequence ("Toolchain prerequisites are unmet, so the validation suite cannot run") rather than a bare instruction | Round-1 message-economy fix |
| `workflow-authoring/workflow.yaml` | modify | **Version bump only**, `1.0.0` → `1.1.0`, carrying no rename — its sibling technique changed, and library convention raises a workflow's version when its files change. Diff-verified: the bump is the file's only changed line | Convention |

---

## Out of scope this pass

**Three of the original rationales are falsified and are restated here on the merits.** A falsified rationale
is not re-justified: where the reason no longer holds, the file is recorded as in scope.

| Item | Original rationale | Status |
|---|---|---|
| `remediate-vuln/activities/01-start.yaml` | "Read for compatibility only. It declares its own `target_path`, so its `discovered_path: target_path` binding is unaffected by `meta`'s rename" | **Falsified — now in scope.** The rationale rested on `repo-root-resolution` having no consumer outside `work-package`; this file is a second consumer. The binding was not unaffected: retiring `discovered_path` would have left it supplying an input the technique no longer declares, so it was repaired in round 1 |
| `work-package/activities/06-plan-prepare.yaml` | "Validates `work-package`'s own `target_path` and `repo_root`; neither name changes" | **Falsified — now in scope.** `repo_root` *did* change. Its `repo_root != null` validate and message are now `host_repo_path != null`. Found by this reconciliation's worktree → manifest direction, not by either remediation round |
| `meta/techniques/version-control/list-submodules.md` | *(not listed — the manifest neither included nor excluded it)* | **In scope.** Edited in round 1 as MH-2's second site, and again by the rename |
| `tests/e2e/__snapshots__/corpus-sha.json`, `snapshot.test.ts.snap` | Server-repo files, unreachable from an edit surface that is a checkout of the `workflows` repo alone | **Holds — and is now evidenced.** `corpus-sha.json` pins `f84fe02b`, byte-identical to this change's base ref, and the server's `workflows` submodule pointer is still `f84fe02b`. Both walk tests enumerate `meta`, whose activities this change edits, so the walk stays red until a separate server-repo change bumps the pointer and re-baselines. See [register exclusions](08-findings-register.md#accepted-exclusions--not-reachable-from-this-edit-surface) |
| The server's basename-only multi-root mapping | This run asserts against it and gates on mismatch | Holds |
| Pre-existing undeclared-variable failures outside the renamed fact (`matched_session`, `current_activity`, `worker_yielded_checkpoint`, `worker_result`, `user_selection`) | Unrelated pre-existing drift | Holds |
| `work-package`'s doubled `naming-conventions` binding | Unrelated pre-existing drift | **Holds, and is now explained.** Investigated as WL-5: the duplication is load-bearing — the two steps have different review-mode gating, and merging them either loses `target_path` in review mode or overwrites the `branch_name` review mode takes from the PR |
| Ungating `extract-identifying-context` from resume intent | Judgement 2 declined it | Holds |
| `substrate-node-security-audit/techniques/write-report.md:90` | *(not originally listed)* | **Out of scope.** The single guard rejection (`fail_count` = 1) is pre-existing drift against the base ref in a workflow outside all five targets, and is not fixable by this change |

---

## Structural design

```
meta/                                          # layout unchanged
├── workflow.yaml                              # contract: 5 facts added, target_path retired
├── README.md
├── activities/
│   ├── README.md
│   ├── 00-discover-session.yaml               # + host-resolution step, + basename-mismatch gate
│   └── 02-resolve-target.yaml                 # + binding-agreement validation
├── resources/
│   └── bootstrap-protocol.md                  # step 2 derives instead of reading prose
└── techniques/
    ├── README.md                              # NEW — techniques orientation page
    ├── TECHNIQUE.md                           # + Inputs: host_repo_path, component_path (hoisted)
    ├── agent-conduct.md
    ├── cargo-operations/preflight.md
    ├── version-control/
    │   ├── TECHNIQUE.md                       # + host-vs-component invariant rule
    │   ├── resolve-host-repo.md               # NEW — the derivation
    │   ├── select-target-component.md
    │   ├── detect-repo-type.md
    │   └── list-submodules.md                 # + Inputs, read anchored at the host root
    └── workflow-engine/
        ├── extract-identifying-context.md
        ├── start-session.md
        ├── match-saved-session.md
        └── commit-and-persist.md

work-package/                                  # layout unchanged
├── workflow.yaml                              # repo_root alias merged away; host_repo_path + component_path
├── activities/
│   ├── 01-start-work-package.yaml             # resolve-repo-root split: derive-host-repo, then assembly
│   ├── 06-plan-prepare.yaml                   # validate repointed at host_repo_path
│   └── 11-validate.yaml                       # prerequisite message restated
└── techniques/                                # + 14 files carrying the merged id

workflow-design/ · workflow-authoring/ · remediate-vuln/   # consumer half of the merged contract
```

**Flow:** Transition topology is unchanged in all five targets — no activity is added, removed or reordered,
and no `transitions[]` block is edited. Inside `00-discover-session` the new host-resolution step and its
mismatch gate sit ahead of the existing transition to `initialize-session`; `02-resolve-target` gains
assertions, not a gate.

| Convention | This change |
|------------|-------------|
| File naming | `resolve-host-repo.md` and `techniques/README.md` are kebab-case `.md` in existing directories; no activity file is added, so `NN-name.yaml` is untouched |
| Field ordering | New technique files open `id`, `version`, `capability`, matching their siblings |
| Version format | Semantic minor bumps on all five targets, verified present on each: 5.11.0→5.12.0, 3.36.0→3.37.0, 1.30.0→1.31.0, 1.0.0→1.1.0, 2.0.0→2.1.0 |
| Transition patterns | Unchanged; no activity-level `transitions[]` is edited |
| Checkpoint structure | The basename-mismatch gate is an inline `kind: checkpoint` step with `message`, `options` and effects, matching the gates already in `00-discover-session` |
| Technique structure | Both new files carry the normative template; the new invariant is a `TECHNIQUE.md` rule anchor, not a `group::op` citation. `technique-template` passes tree-wide |
| Shared inputs | Ids two or more `meta` techniques consume are declared once on `meta/techniques/TECHNIQUE.md` and inherited, rather than repeated per technique |

---

## Drafting order

The order the change was actually drafted in. Rows 1-19 are the planned entries; the propagation and
remediation work followed, because it was the audit that discovered it.

1. **Contracts** (rows 1-2) — the new facts declared before any file binds against a name.
2. **New technique** (row 3) — the producer the activity step and the bootstrap rewrite both call.
3. **Group rule** (row 4) — states the host/component invariant the remaining technique edits are written against.
4. **Producer techniques** (rows 5-7) — both producers of the renamed fact changed together, so it never carries two names.
5. **Consumer techniques** (rows 8-13) — each declares which of the now-distinct facts it wants.
6. **Activities** (rows 14-16) — bindings written once their techniques and contracts are settled.
7. **Resource** (row 17) — step 2 cites the technique at its landed path.
8. **READMEs** (rows 18-19) — describe the tree as it finally reads.
9. **Remediation round 1** — the two Criticals and six Highs, including retiring `discovered_path` and deleting `is_monorepo_host`, plus the cross-workflow bind repair.
10. **Remediation round 2** — the `repo_root` merge completed library-wide across 23 files, the shared-input hoist, and the remaining description-hygiene work.
11. **Post-disposition** — two `Low` rows closed directly by the user, outside the sweep.
