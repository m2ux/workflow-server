# Change Brief — Git-Derived Host Repo Binding

**Workflow:** `meta` v5.11.0 (primary) · `work-package` v3.36.0 (secondary)
**Mode:** Update
**Date:** 2026-07-28
**Change categories:** Activity, Technique, Resource, Structural refactor
**Change request:** Derive the session's host-repo binding from git rather than from workspace prose, and repair the two latent variable defects sitting in the same seam.
**Baseline:** `workflows` @ branch `workflows`, commit `f84fe02b` — `meta`: 5 lifecycle activities, 122 techniques in 9 groups, 5 resources. `work-package`: 15 activities, 93 techniques in 16 groups, 31 resources. Blast radius is in the [impact analysis](01-impact-analysis.md).

---

## Purpose

A meta session binds its target repository from prose — the workspace `AGENTS.md`/`CLAUDE.md` or the user — and the server then maps that `owner/repo` onto a filesystem root by basename alone. When the named repo is a submodule of a superproject, the basename maps to a directory that is not the real checkout: the binding succeeds, an empty non-git directory is created, and the failure only surfaces later when the commit hook has no repo and the reviewer has no source. This run replaces the prose inference with a derivation from git, performed early enough to gate the binding rather than to explain it afterwards.

`meta` already owns monorepo detection, but it runs in activity `02-resolve-target` — after the session binding is committed — and it answers a different question: *which component* is being worked on, not *which host repo* the session belongs to. This run separates those two questions into two variables with two producers, adds a validation that fails a bad binding before artifacts exist, and repairs a name collision and an unbound input that make the current seam fragile.

| Goal | Meaning |
|------|---------|
| Derive the host repo from git | A new `version-control::resolve-host-repo` walks up from the workspace `git rev-parse --show-toplevel` through superprojects whose `.gitmodules` claims the child, and reads `owner/repo` from the outermost host's origin remote |
| Gate the binding, don't explain it | The derivation runs before the session binding is fixed, so a mismatch between the derived host and the basename-only server mapping raises a checkpoint instead of silently diverging |
| Separate host from component | A repo named in the request identifies the **component**; the host binding comes from git. The run states this invariant once and gives the two facts distinct variable names |
| Demote prose to fallback | `AGENTS.md`/`CLAUDE.md` and the user become the fallback for a workspace that is not a git repo or has no origin remote, not the primary source |
| Fail early on a stale binding | `02-resolve-target` validates that the repo root `work-package` resolves is the directory the session actually bound, catching a resume that carries a stale saved binding |
| Remove the two latent defects | `meta`'s `target_path` stops colliding by name with `work-package`'s, and `work-package`'s `discovered_path` gets an actual producer |

**Out of scope:**

- The server's basename-only multi-root mapping itself. This run asserts against it and raises a checkpoint on mismatch; it does not change the mapping.
- Any workflow other than `meta` and `work-package`. `remediate-vuln` borrows `work-package::repo-root-resolution` and is read for compatibility only.
- Retrofitting existing saved sessions that already carry a bad binding.

---

## Dimensions

Only the dimensions this run changes appear. Activity list and artifacts are unchanged — no activity is added or removed from either target, and neither target gains or loses a planning artifact.

| Dimension | This run's shape |
|-----------|------------------|
| **Activity model** | `meta/00-discover-session` gains a host-resolution step ahead of its transition to `initialize-session`; `meta/02-resolve-target` gains a binding-agreement validation. `work-package/01-start-work-package` gains an explicit input binding on its existing `resolve-repo-root` step. No step is removed from any activity. |
| **Checkpoints** | One new gate in `00-discover-session`: the derived host basename disagreeing with the bound `owner/repo` is a user decision, because the server's mapping cannot represent the divergence. `02-resolve-target`'s new validation is an assertion, not a gate — it fails the run rather than asking. The existing `workflow-selection`, `resume-session` and `submodule-selection` gates keep their current shape. |
| **Variables** | Four new facts from the host derivation (`target_repo` bound from git, `host_repo_path`, `is_monorepo_host`, `component_hint`); one new field on the request-context map (`mentioned_repo`); one rename (`meta`'s `target_path` becomes `component_path`, ending the collision with `work-package`'s same-named worktree path); one previously unproduced input (`discovered_path`) given a real producer. |
| **Techniques** | One addition — `version-control::resolve-host-repo`. Edits to `workflow-engine::extract-identifying-context` (emit `mentioned_repo`), `version-control::select-target-component` (consume it as component context only; rename its output), `version-control::detect-repo-type` (the seam's other producer of the renamed variable), `workflow-engine::start-session` (repo input becomes derived-with-fallback) and `work-package::repo-root-resolution` (document the generalised ascent its single-level test becomes). |
| **Resources** | `meta/resources/bootstrap-protocol.md` step 2 is rewritten from "resolve from `AGENTS.md`/`CLAUDE.md` or the user" to a derivation, with prose demoted to fallback. This is the only resource in scope. |
| **Rules** | `version-control::TECHNIQUE.md` gains one rule beside `infrastructure-submodule-paths` stating the host/component invariant once, so the two facts cannot be re-conflated by a later edit. `02-resolve-target`'s activity rules are restated against the renamed variable. |

---

## Open judgements

| # | Judgement | Why it is open | Effect if decided either way |
|---|-----------|----------------|------------------------------|
| 1 | Where `resolve-host-repo` actually runs | The request places it in `00-discover-session`, but `start_session` is called at bootstrap step 3 — before any meta activity executes — and `repo` is required on that call. A step inside activity 00 cannot inform the meta session's own binding, only the client session created in `01-initialize-session`. Rewriting bootstrap step 2 (goal 4) needs the derivation at bootstrap time. | Bootstrap-only: the meta binding is fixed but activity 00 has no bag copy of the derived facts. Activity-only: the client binding is correct but the meta session can still bind wrongly, and bootstrap step 2's rewrite has nothing to call. Both: correct at both moments, at the cost of one duplicated derivation. |
| 2 | Whether `extract-identifying-context` stays gated on resume intent | `00-discover-session` runs that step only `when: resume_intent_requested == true`. So `identifying_context` is unbound on a fresh run today, and `mentioned_repo` would reach `select-target-component` only on resume runs — which is not where the reported failure happened. | Leave the gate: `mentioned_repo` is dead on the path that broke, and `component_hint` from git carries component pre-selection alone. Ungate it: pre-selection works on fresh runs, but the step's cost is paid on every run and its other outputs enter the bag earlier than today. |
| 3 | Which `{target_path}` readers follow the rename | `commit-and-persist` and `agent-conduct` read `{target_path}` and describe it as *the submodule* — `meta`'s meaning — but by the time they run in a client workflow, `work-package` has overwritten it with the feature worktree path. Renaming `meta`'s producer forces each reader to declare which fact it wants. | Repoint them at `component_path`: matches their prose, changes where commits are made today. Leave them on `target_path`: preserves current runtime behaviour, leaves their prose describing a variable they no longer receive. |
| 4 | Whether `mentioned_repo` participates in saved-session matching | `match-saved-session` scores `identifying_context` overlap to pick a session to resume. A new field silently joins that scoring. | Include it: a repo mention helps disambiguate sessions. Exclude it: resume scores stay comparable to previously saved sessions, and the field is component context only, as the invariant states. |
| 5 | Whether the run may commit outside the `workflows` submodule | The request scopes edits to the submodule, but `tests/e2e/__snapshots__/corpus-sha.json` pins the corpus at `f84fe02b` and both walk tests cover `meta`, so re-baselining writes server-repo files plus a submodule pointer bump. | Two-repo scope: the walk stays green in the same change. Submodule-only: the walk goes red until a separate server-repo change lands. |
| 6 | Whether `detect-repo-type` is renamed with `select-target-component` | The request names only `select-target-component`'s output, but `detect-repo-type` is the seam's other producer — it sets the same variable to `.` for a regular repo. | Rename both: the variable has one meaning and one name. Rename one: two producers write two differently-named facts that downstream readers must union. |

### Resolutions

All six were resolved before drafting, at the `scope-confirmed` gate. None remains open.

| # | Resolved | Reason it went that way |
|---|----------|-------------------------|
| 1 | Both sites | `start_session` needs `repo` at bootstrap step 3, so bootstrap step 2 derives it there; `00-discover-session` applies the same technique again so the facts reach the client session and the mismatch gate. Bootstrap-only leaves the gate with no values; activity-only leaves the bootstrap rewrite with nothing to call. |
| 2 | Keep the resume gate | `component_hint` from git already covers fresh runs and is the better component signal. Ungating would pay the step's cost on every run and land its other outputs earlier, changing saved-session matching well outside this run's purpose. |
| 3 | Repoint all three readers | `commit-and-persist`, `agent-conduct` and `cargo-operations/preflight` all describe the submodule in prose, so `component_path` is the fact they mean. Leaving two `meta` techniques reading a name `meta` no longer declares would turn working references into dangling ones — a regression this change would otherwise introduce. |
| 4 | Exclude from resume scoring | A component fact must not steer which host session resumes. Achieved structurally: `mentioned_repo` is emitted as a sibling of `identifying_context` rather than a field inside it, so the exclusion cannot erode into a caveat. |
| 5 | Out of scope | The run's edit surface is a checkout of the `workflows` repo alone, so `tests/e2e/__snapshots__/*` is not reachable from it. The walk stays red until a separate server-repo change bumps the submodule pointer and re-baselines. |
| 6 | Rename both producers | One fact, one name. Leaving one producer on the old name would force downstream readers to union two names — the defect being fixed. Covered by inventoried removal 6. |

---

## Confirmation ask

Approving this brief commits the run to editing `meta` and `work-package` under the derivation-first shape above — a new `version-control::resolve-host-repo`, a host/component split stated once as a rule, prose sources demoted to fallback, a binding-agreement validation in `02-resolve-target`, and the `component_path` rename — and to resolving the six judgements above before drafting, since judgements 1, 3 and 5 each change which files the manifest must contain.
