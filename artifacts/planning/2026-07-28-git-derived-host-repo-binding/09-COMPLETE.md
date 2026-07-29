# Workflow Authoring: `meta` — Complete

> Update · 2026-07-29

**Targets:** `meta` v5.11.0 → v5.12.0 (primary) · `work-package` v3.36.0 → v3.37.0 (secondary) · `workflow-design` v1.30.0 → v1.31.0 · `workflow-authoring` v1.0.0 → v1.1.0 · `remediate-vuln` v2.0.0 → v2.1.0
**Branch:** `workflow/meta-git-derived-host-repo-binding` @ `87c26fff` · **Base:** `workflows` @ `f84fe02b`
**Pull request:** [#345](https://github.com/m2ux/workflow-server/pull/345) — open, ready for review, 45 changed files

## Summary

A `meta` session used to bind its target repository from prose — the workspace `AGENTS.md`/`CLAUDE.md` or the user — after which the server mapped that `owner/repo` onto a filesystem root by basename alone. For a repo that is a submodule of a superproject the basename resolved to a directory that was not the real checkout: the binding succeeded, an empty non-git directory appeared, and the failure surfaced only later when the commit hook had no repo and the reviewer had no source.

This run replaced that inference with a derivation from git, placed early enough to **gate** the binding rather than explain it afterwards, and split the conflated "which host repo?" and "which component?" questions into two facts with two producers and two names.

## What Was Delivered

- **Activities (modified):** `meta/00-discover-session` gains the host-resolution step and a basename-mismatch checkpoint ahead of the transition to `initialize-session`; `meta/02-resolve-target` gains binding-agreement and stale-resume validations; `work-package/01-start-work-package` splits `resolve-repo-root` into a shared derivation plus local component assembly; `work-package/06-plan-prepare` and `11-validate` have validations repointed.
- **Techniques (created):** `meta/techniques/version-control/resolve-host-repo.md` — the superproject ascent, the origin-remote read, and the basename assertion.
- **Techniques (modified):** `version-control/TECHNIQUE.md` (the host-vs-component invariant, stated once), `select-target-component.md`, `detect-repo-type.md`, `list-submodules.md`, `extract-identifying-context.md`, `match-saved-session.md`, `start-session.md`, `commit-and-persist.md`, `agent-conduct.md`, `preflight.md`, `repo-root-resolution.md`, plus 14 further `work-package` technique files and 3 files in other workflows carrying the identifier merge.
- **Techniques (modified — inheritance):** `meta/techniques/TECHNIQUE.md` gained the `## Inputs` section it had been claiming to hold, hoisting `host_repo_path` and `component_path` so the 15 workflows that bind `meta` ops inherit them rather than redeclaring them.
- **Resources (modified):** `meta/resources/bootstrap-protocol.md` — step 2 derives rather than reading prose, with prose demoted to fallback.
- **Variables (added):** `host_repo_path`, `component_path`, `component_hint`, `host_binding_mismatch`, `mentioned_repo`.
- **Variables (removed):** `meta`'s `target_path` declaration (retired), `is_monorepo_host` (never shipped — deleted during remediation), `work-package`'s `discovered_path` (retired), and `work-package`'s duplicate `repo_root` declaration (merged into `host_repo_path`).
- **Rules (added):** the host-vs-component invariant on the `version-control` group contract; `prose-sources-are-fallback-only` on `resolve-host-repo`.
- **Documentation (created):** `meta/techniques/README.md`. **(modified):** `meta/README.md`, `meta/activities/README.md`, `work-package/activities/README.md`.

## Design Decisions

The run's decisions live in their canonical homes and are not restated here:

| Where | What it holds |
|---|---|
| [Change brief](01-change-brief.md) | Purpose, the six changed dimensions, and the six open judgements with their resolutions |
| [Impact analysis](01-impact-analysis.md) | Blast radius, integrity verdicts, removals inventory |
| [Scope manifest](06-scope-manifest.md) | File manifest, the five supersessions, structural design, drafting order |
| [Findings register](08-findings-register.md) | All 58 findings, coverage divergences, accepted exclusions, guard results |

One drafting-time decision has no other home. **The identifier merge was completed library-wide rather than confined to the declared targets.** `repo_root` occupied 24 files across five workflows; renaming only within `meta` and `work-package` would have left three workflows reading an id that no longer exists — strictly worse than the naming defect being fixed. The operator widened `target_workflow_ids` from two targets to five specifically to authorise this. One occurrence was deliberately preserved: `workflow-design/resources/anti-patterns.md:716`, an illustrative *bad example* inside AP-52, where renaming would corrupt the canon entry.

## Scope Outcome

Delivered against the [confirmed manifest](06-scope-manifest.md): **45 of 45 entries delivered, 0 outstanding**, after the manifest was reconciled from its original 19 planned files. Exceptions:

| Drift | Detail |
|---|---|
| 26 files changed that no entry planned | 23 are propagation of the identifier merge, 3 are not (`meta/techniques/README.md` created, `work-package/activities/11-validate.yaml`, and `workflow-authoring/workflow.yaml` as a version bump only). Classified by diff evidence, not assertion |
| 5 entries describe a superseded design | The audit improved on the plan three times: `is_monorepo_host` **deleted** rather than declared; `discovered_path` **retired** rather than given a source; and the `repo_root`/`host_repo_path` pair proved to be a **declaration merge**, not a rename. Recorded as S-1/S-2/S-3 |
| 3 out-of-scope rationales falsified | `remediate-vuln/activities/01-start.yaml` and `work-package/activities/06-plan-prepare.yaml` are in scope on the merits; `list-submodules.md` was never classified either way. Each is restated rather than re-justified |

No enumeration unit was blocked, and all inventoried removals were approved, so nothing was preserved against a withheld approval.

## Known Limitations and Deferrals

<!-- Canonical home. Other artifacts link here; this list is not duplicated elsewhere. -->

**This change is not self-contained.** It lands correct in the definition library and leaves two obligations in the `workflow-server` source tree, outside this run's edit surface — a checkout of the `workflows` lineage alone. The `workflows` submodule pointer in the server tree still reads `f84fe02b`, so none of these 45 files is yet visible to the server.

- **Deferred — the e2e walk snapshots must be re-baselined.** `tests/e2e/__snapshots__/corpus-sha.json` pins `corpusSha: f84fe02b…`, byte-identical to this change's base ref, and both `tests/e2e/all-paths-walk.test.ts` and `tests/e2e/all-workflows-walk.test.ts` enumerate `meta`, whose activity files this change edits. **The walk stays red until a server-repo change bumps the submodule pointer and re-baselines.** Closing it: `corpus-sha.json`'s own note prescribes the procedure — update it in the same commit that bumps the submodule and runs `npm run baseline:stamp`.
- **Deferred — three harness strings still teach the retired provenance** (finding MH-4). Each still says the repo comes "from the user or workspace `AGENTS.md`": `src/tools/resource-tools.ts:106`; `src/tools/workflow-tools.ts:326`, **the urgent one**, sitting inside the `discover` return so the first surface an orchestrator reads contradicts the new contract before any session exists; and `src/utils/session/scope.ts:239`. Closing it: a server-repo change rewriting all three to name the git derivation, with prose as fallback.
- **Limitation — 8 findings remain open** (0 Critical, 0 High, 4 Medium, 4 Low), each recorded with its citation and the investigated reason it cannot close. Every one needs a structural decision rather than a remediation edit: an activity-level step split (MM-16), a new formal gate over commit location (MM-23), an id rename with its own blast radius (MM-12), removing one of two documentation homes (MM-21), converting valueless `set` steps to techniques (WL-4), or unpicking a load-bearing duplication (WL-5).
- **Limitation — MM-20's Output half is structurally blocked, not merely deferred.** Declaring `workflow` / `context_mode` / `migrated` / `repo_unbound` as technique Outputs was attempted and measured: it raised 4 new `dead-output` rejections, because `start_session` runs *before* the session bag exists so nothing downstream can consume them. The value half closed instead. Closing the rest needs a harness change or a real consumer — not a definition edit.
- **Limitation — two findings were closed outside the criteria walk.** WL-3 and WL-6 were closed by direct decision after the audit disposition, evidenced by the validator and guard suite only, with no re-derivation behind them. A reviewer should weight them accordingly.
- **Limitation — one guard rejection persists and is not this run's to fix.** `substrate-node-security-audit/techniques/write-report.md:90` (`read-resolution {target_path}`) is pre-existing drift against the base ref in a workflow outside every target. It is the whole of `fail_count: 1`.
- **Limitation — the merged id keeps a representation suffix.** `host_repo_path` retains a `_path` ending that AP-66's own Detect calls a representation proxy. Dropping it would re-rename an id round 1 had already established across `meta`, widening the blast radius past the authorised set, and `_path` endings are established library convention. The alias defect itself is fully resolved.

## Run Retrospective

**1. The scope check was gated by the same flag that meant there was more scope to check.** `verify-scope-manifest` carries `when: … remediation_selected != true`. Two remediation rounds held that true, so the gate skipped on three consecutive entries into `validate-and-commit` while the change grew from 19 files to 45. The perverse incentive is structural: *the more remediation a run does, the longer its scope reconciliation is deferred* — precisely inverted, since remediation is what makes the manifest stale. The divergences survived only because each round hand-carried them in an envelope. Worth considering an ungated reconciliation, or one gated on entering remediation rather than on leaving it.

**2. Both-directions scope checking earned its rule in a single line.** `work-package/activities/06-plan-prepare.yaml` had been excluded from scope because "neither `target_path` nor `repo_root` changes" — but `repo_root` did change, and its validate now reads `host_repo_path != null`. Two full remediation rounds missed it. Only the worktree → manifest direction found it, which is exactly what `both-directions-or-neither` exists to force.

**3. Cheap arithmetic went unchecked for two rounds.** The register's headline said 44 changed files while its own per-target breakdown summed to 45; `meta` was recorded as 20 files when it was 19, `remediate-vuln` as 1 when it was 2, and the `meta` findings section claimed 4 open `Low` rows when it held 2. Every one of these was a `git diff --name-status` away. Numbers that are trivially re-derivable are the numbers least likely to be re-derived, because they look settled.

**4. A guard figure without its scope is not a figure.** The pair-closure run reported `check-all` as 16 pass / 0 fail / 1 unmeasured with `binding-fidelity` at 193; tree-wide the same tip gives 16 pass / **1 fail** / 0 unmeasured at **194**. Both are accurate for the `--root` they were run against. Guard counts should travel with the scope that produced them, or a later reader reconciles two true numbers as a contradiction.

**5. Two techniques land different facts in the same three variable names.** `scope-verification` declares `total_count` / `addressed_count` / `unaddressed_count` for *manifest entries*; the same names arrived in the bag holding *findings* counts (58 / 48 / 10). The `approve-to-commit` gate interpolates them as "manifest entries are delivered", so before this activity's reconciliation ran the gate would have told the user "48 of 58 manifest entries" for a 19-entry manifest. This is a real defect in the definitions, not a reporting quirk, and it is invisible while both producers happen to run in the same order.

**6. The audit outperformed the plan three times, and the manifest had nowhere to put that.** S-1, S-2 and S-3 are all cases where remediation found a *better* answer than the confirmed manifest specified — deleting a variable rather than declaring it, retiring an input rather than sourcing it, merging two declarations rather than renaming one. The manifest schema can record delivery and drift but has no vocabulary for "superseded by a better design", so the improvements initially read as divergences to be explained rather than as wins.

**7. A finding's Fix text under-described the work.** MH-5 was raised and carried for two rounds as a *rename*. It was actually a declaration merge: `work-package/workflow.yaml` declared both ids, and `repo-root-resolution.md` carried a protocol step whose only content was copying one onto the other. The distinction mattered — a rename would have left the alias intact — and it surfaced only when round 2 opened the file to do the work.

**8. What worked: the guard suite used as a decision instrument rather than a post-hoc check.** Round 2 applied MM-20's Output declarations, measured 4 new `dead-output` rejections, and reverted them; it applied the MM-25 hoist, measured no regression, and kept it. Both calls were made on evidence within the round. `scripts/binding-fidelity-triage.json` was verified untouched throughout, so the improvement is a repair rather than a suppression — a claim worth being able to make mechanically.
