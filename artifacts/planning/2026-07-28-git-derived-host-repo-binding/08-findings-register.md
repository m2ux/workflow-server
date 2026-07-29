# Findings Register — git-derived host-repo binding

**Date:** 2026-07-29 · **Mode:** Update · **Remediation round:** 2 (final — the transition caps at `remediation_round < 3`)
**Base ref:** `f84fe02b12f9617f401767b9b96f329d8c13225c` (merge base of `workflow/meta-git-derived-host-repo-binding` with `origin/workflows`)
**Targets:** `meta`, `work-package`, `workflow-design`, `workflow-authoring`, `remediate-vuln` — widened in round 2 by operator decision so MH-5 could complete; see [Divergence 4](#divergence-4--the-target-set-was-widened-in-round-2-to-complete-mh-5)

Canonical home for this run's audit findings, coverage divergences and accepted exclusions.

- **Edit surface**: `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-git-derived-host-repo-binding` — **45** changed files vs the base ref (**43** modified, **2** added), diff-confirmed at `87c26fff`; round 1 landed as `9eea56c6`, round 2 adds **34** (33 modified + 1 new) as `86920547`, and `87c26fff` closes WL-3 / WL-6 without adding a file
- **Changed by target (cumulative)**: `meta` 19 · `work-package` 20 · `workflow-design` 2 · `workflow-authoring` 2 · `remediate-vuln` 2
- **Count corrected in the round-2 verification pass.** The headline previously read **44** with a per-target line of `meta` 20 / `remediate-vuln` 1 — internally inconsistent, because that breakdown itself summed to 45. Re-counted from `git diff --name-status` against the base ref: `meta` is 19 (not 20) and `remediate-vuln` is 2 (not 1, because `01-start.yaml` from round 1 and `workflow.yaml` from round 2 are both changed). The two added files are `meta/techniques/version-control/resolve-host-repo.md` (the new technique, round 0) and `meta/techniques/README.md` (ML-7, round 2)
- **Workflow versions**: every target whose files changed carries a minor bump — `meta` 5.11.0→5.12.0, `work-package` 3.36.0→3.37.0, `workflow-design` 1.30.0→1.31.0, `workflow-authoring` 1.0.0→1.1.0, `remediate-vuln` 2.0.0→2.1.0. Verified in round 2's pass; no changed target is missing a bump
- **Criteria units**: 44 walked, 4 not-applicable, 0 blocked
- **Guard suite**: 16 of 17 pass; `binding-fidelity` rejects **1** file, and it lies outside every target. In-target rejections stay at **0** across both remediation rounds
- **Known findings**: 74 keys loaded, 0 matched a finding raised here

Severity: `Critical` = schema-invalid or structurally broken construct that must not be committed.
Attribution is measured against the base ref: **new** arrived with this change, **pre** pre-existed it.

Every `Critical` and `High` row was **independently re-derived** from the construct it cites, refuting by
default — in round 0, again in round 1 against the post-remediation files, and again in round 2. Verdicts:
`confirmed` (reproduced), `downgraded` (evidence supports a lesser issue), `withdrawn` (not reproduced —
drives no edit), `closed` (the cited construct no longer reproduces the violation). Surviving `Medium` and
`Low` rows were spot-confirmed against their cited constructs, which narrowed several citations recorded
below.

## Summary

| Severity | Open | Closed in R1 | Closed in R2 | Closed outside sweep | Known |
|----------|-----:|-------------:|-------------:|---------------------:|------:|
| Critical | 0 | 2 | 0 | 0 | 0 |
| High     | 0 | 6 | 1 | 0 | 0 |
| Medium   | 4 | 24 | 6 | 0 | 0 |
| Low      | 4 | 5 | 4 | 2 | 0 |
| **Total** | **8** | **37** | **11** | **2** | **0** |

The decision surface entered round 1 at 58, left it at 21, and left round 2 at 10. Two `Low` rows then
closed **outside the sweep** — by direct user decision after the disposition, not through the criteria
walk — so the surface closes at **8 open, 50 closed** of 58. Rows sum across the four columns to 58.
**Both Criticals were closed by re-derivation rather than by assertion**, and round 2 closes the last
`High`, so `has_critical_finding` is false and no `High` remains.

The final 8: **4 `Medium`** (MH-4, MM-16, MM-20, MM-23 — all in `meta`) and **4 `Low`** (MM-12, MM-21 in
`meta`; WL-4, WL-5 in `work-package`).

Round 2 closed, in register order: **MH-5** (High), **MM-4 · MM-6 · MM-8 · MM-15 · MM-17 · MM-25**
(Medium), **ML-1 · ML-4 · ML-5 · ML-7** (Low). Each is evidenced in
[Closed in round 2](#closed-in-round-2).

**MH-5 completed library-wide**, not confined to the declared targets — a rename stopping at
`work-package` would have left three other workflows reading an id that no longer exists. Completing it is
what widened the target set ([Divergence 4](#divergence-4--the-target-set-was-widened-in-round-2-to-complete-mh-5)).

**Three open items are not reachable from this run's edit surface** and cannot close here — MH-4's three
harness strings, the e2e walk snapshots, and the Output half of MM-20. All are recorded under
[Accepted exclusions](#accepted-exclusions--not-reachable-from-this-edit-surface). **This change is not
self-contained**: it lands correct in the definition library and leaves obligations in the
`workflow-server` repository.

The four surviving `Low` rows and MM-16 / MM-23 ship **open** by design: round 2 is the last round the
workflow grants, and each remaining row needs a structural decision (an activity split, a new formal gate,
an id rename with its own blast radius) rather than a remediation edit. They are recorded, not lost — and
WL-4 / WL-5 now carry the investigated reason they cannot close, not a bare deferral.

## Round-2 verification pass

**No `High` row was open to re-derive** — round 2 closed the last one (MH-5), so the re-derivation set for
this pass is empty and no finding was eligible to drive a further edit. What the pass did instead was
verify the **closure claims** that this run's design reversals rest on, and re-confirm the four surviving
`Medium` rows. Nothing was withdrawn, downgraded or raised; the decision surface is unchanged at **10**.

| Claim verified | Method | Result |
|---|---|---|
| MH-5 — the `repo_root` alias is gone library-wide, one deliberate survivor | `grep -rnw repo_root` over the worktree | **Reproduced.** Exactly **1** hit, `workflow-design/resources/anti-patterns.md:716`, and it is the AP-52 illustrative bad-example line as claimed — criteria-home content, not a reference to the id |
| MH-8 — `is_monorepo_host` was deleted, not declared | `grep -rn is_monorepo_host` | **Reproduced.** Zero hits |
| WC-1 — `discovered_path` was retired, not given a source | `grep -rn discovered_path` | **Reproduced.** Zero hits |
| MH-4 — three server strings still teach the retired provenance | read each cited line | **Reproduced verbatim.** All three still say "from the user or workspace AGENTS.md", and `workflow-tools.ts:326` is confirmed to sit inside the `discover` return assembly |
| MM-16 · MM-20 · MM-23 | spot-confirm cited construct and finding class | **All three confirmed**; MM-23's citation narrowed below |

The three grep-based closures matter beyond their own rows: MH-8 and WC-1 are the two **in-manifest design
reversals**, so the manifest reconciliation depends on them being real deletions rather than renames that
left residue. They are.

**MM-23's citation was incomplete and is narrowed here.** The round-1 note said the only `validate` actions
in `meta` are `02-resolve-target.yaml:52-66` and `03-dispatch-client-workflow.yaml:10`. A fourth exists at
`meta/activities/patterns/04-isolated-fan-out.yaml:30`. It does not constrain commit or branch location
either, so **the finding stands unchanged** — but the enumeration behind it was not exhaustive, and a later
pass should inherit the corrected list rather than the original one.

---

## Findings

### Target: `meta`

Consumer surface: 435 references from 115 files across 15 other workflow directories reach 78 `meta`
files; 11 resolve into a file this run changed. Those 11 sites were walked.

Open: 0 Critical · 0 High · 4 Medium · **2** Low. (An earlier revision of this line read `4 Low`, which
double-counted: `meta` carries two open `Low` rows, MM-12 and MM-21, and the other two sat in
`work-package`. Corrected in the round-2 verification pass.)

#### Open — Medium

The **Correction** column carries round-1 spot-confirmation results; several citations narrowed as
remediation closed some of a finding's sites but not all.

| # | Entry | Site(s) — as confirmed in round 1 | Note | Correction | Attr |
|---|---|---|---|---|---|
| MH-4 | `no-duplicated-guidance` | `src/tools/resource-tools.ts:106`; `src/tools/workflow-tools.ts:326`; `src/utils/session/scope.ts:239` — all in the **server** repo | **Downgraded from High.** Three harness strings still teach the retired provenance ("pass `repo` … from the user or workspace AGENTS.md"). `workflow-tools.ts:326` sits inside the `discover` return, so the first surface an orchestrator reads contradicts the new contract | **Definition half closed**: full statements went 4 → 1. The rule now has one named home, `prose-sources-are-fallback-only` (`resolve-host-repo.md:49-51`); `bootstrap-protocol.md:17` and `start-session.md:22` are pointers; `meta/workflow.yaml:40` no longer states it. Downgraded because what remains is stale documentation outside the audited target surface, not duplicated guidance within it | new |
| MM-16 | `pass-orchestration-in-technique` | `commit-and-persist.md` Protocol steps 1, 4, 5 | `Apply` / `::` op invocations inside one technique bound as a single step at `03-dispatch-client-workflow.yaml:58`, so each op could be its own step | confirmed unchanged through both rounds. **Not attempted in round 2**: the fix is an activity-level split of one bound step into several, which redesigns the post-activity hook's orchestration rather than editing a construct. Round 2's edits to this file (MM-6/8/17/25, ML-4/5) left the invocation count unchanged | pre |
| MM-20 | `describe-tool-value` | `start-session.md` Outputs; `bootstrap-protocol.md:22-23` | mechanics in place of value, and the declared Outputs are incomplete | **Half closed in round 2, half structurally blocked.** The underselling half is closed: the Capability now names the value returned, and `bootstrap-protocol.md` documents the real response shape including `repo_unbound`. The Outputs half **cannot** close — declaring `workflow` / `context_mode` / `migrated` / `repo_unbound` as technique Outputs raised **4 new `dead-output` rejections**, because `start_session` runs *before* the session bag exists so nothing downstream can consume them. Suppressing them would require editing `scripts/binding-fidelity-triage.json`, which is outside the edit surface and is the suppression this run's guard-integrity check forbids. See [Accepted exclusions](#accepted-exclusions--not-reachable-from-this-edit-surface) | pre |
| MM-23 | `structure-backed-constraints` | `agent-conduct.md:96-98`; restated at `commit-and-persist.md:46` | the `orchestrator-component-path-scope` MUST/NEVER commit-location rule has no checkpoint, `condition` or `validate` backing it | confirmed. The only `validate` actions in `meta` are `02-resolve-target.yaml:52-66` (binding agreement, resumed binding, git-tree presence) and `03-dispatch-client-workflow.yaml:10` — none constrains commit or branch location, and no checkpoint or condition references commit scope. **Not attempted in round 2**: backing it means authoring a new formal gate over commit location, a design addition the change brief does not carry | new |

#### Open — Low

| # | Entry | Site(s) — as confirmed in round 1 | Attr |
|---|---|---|---|
| MM-12 | `boolean-id-shape` — downgraded from Medium in round 0. `host_binding_mismatch` names the prohibited state; not an outlier, since `workflow_match_ambiguous` shares both the shape and the `setVariable … false` approval | `meta/workflow.yaml:50-53`; `resolve-host-repo.md:34`; read at `00-discover-session.yaml:14`, set at `:25` | new |
| MM-21 | `no-technique-resource-dual-home` — downgraded from Medium in round 0. The dual home holds and each side links the other; "character-for-character" was refuted | `bootstrap-protocol.md:20` / `start-session.md:52-55` | pre |

Both surviving `meta` Lows need an id rename or the removal of one of two documentation homes — structural
decisions, not remediation edits. **Not attempted in round 2** for that reason, and recorded here so a
later pass inherits the citation rather than re-deriving it.

#### Closed in round 2

Every row below was verified against the post-edit construct, and the whole guard suite was re-run after
the last edit: **16 of 17 pass, in-target rejections 0, `binding-fidelity` unchanged at 194 violations
(70 harmless, 123 fix-later, 0 live bugs, 1 untriaged)**, with `scripts/binding-fidelity-triage.json`
verified untouched.

| # | Severity | What closed it | Verification |
|---|---|---|---|
| MH-5 | High | The `repo_root` → `host_repo_path` rename was completed **library-wide** — 80 occurrences across **23** files in 5 workflow directories. The alias is gone at its root: `work-package/workflow.yaml` declared *both* ids, so the fix was a **merge**, not a rename, and `repo-root-resolution.md` lost the Protocol step whose entire content was copying one id onto the other | `grep -rn '\brepo_root\b'` over the tree returns **one** hit, and it is not a reference to the id — see the exclusion note below. `repo-root-resolution.md` now declares `host_repo_path` as an input only (no input∩output collision), outputs just `component_name` / `component_path`, and its Capability is rescoped off the repo root it no longer produces. `identifier-qualification` passes, so `host_repo_path` is an accepted qualified id at every new site |
| MM-4 | Medium | All four `meta/activities/README.md` sites rewritten: the checkpoint roster with firing conditions deleted (:15), both near-verbatim activity-`outcome` restatements deleted (02 and 04), and the prose activity sequence replaced by a pointer to the `meta/README.md` index table | The README now carries purpose and connections only. Each deleted block was the kind AP-40's test names — it would have had to be edited whenever the YAML changed |
| MM-6 | Medium | Both remaining files cleared. `commit-and-persist.md:22`'s hyperlink vanished with the declaration itself (hoisted under MM-25); `start-session.md`'s `repo` entry now cites the origin remote instead of linking `resolve-host-repo`, and `context_mode` no longer links `dispatch-activity` | No I/O entry in either file hyperlinks a producing or consuming technique |
| MM-8 | Medium | Same two files. `start-session.md`'s `repo` names an intrinsic origin (the host's origin remote), which AP-42 exempts; `mark_progress_na` no longer describes itself as a "Flag from the workflow bag" | No surviving I/O entry names a workflow-internal producer |
| MM-15 | Medium | The three projection steps collapsed. Protocol went from 6 steps to 3 work phases, each emitting its ids **by reference** to the Output criteria — the form AP-111 explicitly permits — with the identity criteria left on the Outputs that own them | The verbatim duplication between step 6 and the `host_binding_mismatch` Output is gone, as is the standalone "Set `{host_repo_path}` to the final toplevel" projection |
| MM-17 | Medium | The indented `-` sub-bullet became a `>` continuation note under its primary instruction, in the exact form AP-59 prescribes (two trailing spaces, then `> `) | The loader no longer reads the caveat as a disconnected peer step |
| MM-25 | Medium | `host_repo_path` + `component_path` hoisted to `meta/techniques/TECHNIQUE.md`, which gained the `## Inputs` section it had been claiming to hold, and both cited per-technique declarations were deleted | Guard-verified rather than assumed: `binding-fidelity` held at 194 with 0 live bugs after the hoist, so inheritance supplies both ids to the 15 other workflows that bind `meta` ops. `technique-template` and `identifier-qualification` also pass. **Deliberately narrowed** — the `detect-repo-type.md` and `list-submodules.md` declarations were left in place because they are MH-2's round-1 closure evidence |
| ML-1 | Low | All three avoidance-voice sites restated in positive present: the `00-discover-session` outcome drops "no search performed otherwise", and both `meta/README.md` clauses now say what owns the content rather than what not to do | No definition prose in the cited files frames itself against a prior design |
| ML-4 | Low | Both invocations moved to parenthesised argument lists with *italic* argument names, per principle 16 | Measured before editing: only **4** lines library-wide used the offending form and 2 were these, so the fix introduces no lone-wolf convention |
| ML-5 | Low | The one-step `no-stale-remote` rule was deleted and its unique content — that Engineering links and resume assume the remote holds the commit — folded into the step it constrained | AP-25's fix exactly: guidance into the step's prose, rule deleted. Nothing the rule said was lost |
| ML-7 | Low | `meta/techniques/README.md` created, mirroring the `work-package/techniques/README.md` orientation shape | The in-repo asymmetry is gone. Written to orient and link only — no inventory counts, no duplication of the `meta/README.md` techniques table — so it does not trade ML-7 for an MM-4-class finding. `site-links` and `resource-anchors` confirm its `#techniques` anchor resolves |

**MH-5's one surviving occurrence is a deliberate exclusion.**
`workflow-design/resources/anti-patterns.md:716` keeps the token `` `repo_root` `` because it is an
*illustrative bad example* inside AP-52 `brace-declared-ids` — the line demonstrating a "disguised id in
backticks without braces". It is criteria-home content, not a reference to the id, and renaming it would
corrupt the canon entry. This is why the rename covers **23** files, not the 24 that carry the string.

**One clause of MH-5's prescribed fix was not taken.** The register's Fix read "hoist the host-root concept
to one shared id **and drop the representation suffix**". The hoist is done; the suffix is not.
`host_repo_path` retains a `_path` ending that AP-66's own Detect calls a representation proxy. Dropping it
would mean renaming the id round 1 had *already* established across `meta`, widening the blast radius past
the set the operator authorised, and `_path` endings are established library convention
(`planning_folder_path`, `target_path`, `provenance_log_path`) which `identifier-qualification` accepts. The
alias defect MH-5 was raised for — one concept under two ids, plus the copy step — is fully resolved. The
residual suffix is recorded here as the open remainder rather than claimed closed.

**MH-5's "and the assertion" clause was deliberately not taken either.** Round 1 recorded that a single id
"would remove both the copy step and the assertion", citing `meta/activities/02-resolve-target.yaml:56-61`.
Re-read at that location, the gated step is `validate-resumed-binding`: "The saved client session's repo
root MUST name `{host_repo_path}`." That compares **external saved state** against the derived host, so a
single id does not remove it — and it is precisely the stale-resume check the change request asked for
(request item 4). Round 1's claim is **falsified on this sub-point**; the assertion stays.

#### Closed in round 1 — `meta`

Each Critical and High row below was re-derived against the post-remediation file before being marked
closed; Mediums and Lows were spot-confirmed.

| # | Severity | What closed it | Verification |
|---|---|---|---|
| MC-1 | Critical | `work-package/workflow.yaml:103,109` now declares `host_repo_path` and `component_path`, and both are produced in activity 01 (`derive-host-repo`, `resolve-repo-root`) before activity 11 runs | preflight's bare-string bind at `11-validate.yaml:28` now same-name binds against declared variables. `binding-fidelity`'s two `orphan-input` rejections are gone. Residual note, not a finding: `host_repo_path` carries no `defaultValue`, so it resolves via the runtime producer rather than statically |
| MH-2 | High | `detect-repo-type.md` gained `## Inputs` declaring `host_repo_path`, its Capability was rescoped off "the working directory", and Protocol anchors `.gitmodules` at `{host_repo_path}`. The second site `list-submodules.md` received the same treatment | Both files re-read in full; both now declare the input and anchor the read at the derived host root, so a session opened inside a component no longer classifies the component's own structure |
| MH-6 | High | The activity-level `rules:` block was deleted from `02-resolve-target.yaml` — entry 1 restated the formal `validate` 20 lines later, entry 2 restated what the bound techniques already apply | `grep -rn "rules:" */activities/*.yaml` across all 112 activity files returns **zero** hits library-wide, so the anomaly is gone rather than relocated |
| MH-7 | High | `agent-conduct.md:96-98` no longer interpolates `{host_repo_path}/{component_path}`; the commit-location rule is stated relationally ("the component directory (the submodule) … the host repo where that directory lives") | The file interpolates neither name, so its absent `## Inputs` is now consistent. The seven consumer sites outside `meta` — four in `workflow-design`, three in `work-package` — no longer receive unresolvable reads |
| MH-8 | High | `is_monorepo_host` was **deleted**: declaration, Output heading, and the Protocol step that set it | `grep -rn "is_monorepo_host"` returns zero hits. All three gates in `02-resolve-target.yaml` (:18, :22, :29) compare `is_monorepo`, which has a declared producer in `detect-repo-type` — and that producer's root is now the derived host (MH-2). The `dead-output` rejection is cleared |
| MH-1 | Medium (downgraded from High in round 0) | The dangling `target-path-scope` citation and the rule-key inventory in `meta/README.md` were both rewritten | `grep -rn 'target-path-scope' meta/` returns nothing; the only surviving occurrence is the rule's own heading `agent-conduct.md:96`. Closed alongside MM-4's `meta/README.md` half |
| MH-3 | Medium (downgraded from High in round 0) | `bootstrap-protocol.md` step 2's inlined derivation was completed with the origin-URL forms `owner/repo` correctness depends on | The pre-session surface now carries what it needs without loading a technique that requires a `session_index` not yet in existence |
| MM-1, MM-2, MM-3, MM-5, MM-7, MM-9, MM-10, MM-11, MM-13, MM-14, MM-18, MM-19, MM-22, MM-26, MM-27, MM-28 | Medium | Description hygiene, brace-declared ids, prose-gate → formal gate, stage-agnostic technique text, next-step narration, and duplicated-guidance repairs across `meta/workflow.yaml`, `00-discover-session.yaml`, `02-resolve-target.yaml`, `resolve-host-repo.md`, `select-target-component.md`, `extract-identifying-context.md`, `match-saved-session.md`, `start-session.md`, `bootstrap-protocol.md` and both READMEs | Spot-confirmed against each cited construct |
| ML-2, ML-3, ML-6 | Low | `procedure-in-capability`; the `missing-prerequisites` / `missing_prerequisites` output-name mismatch; role prescriptions inside variable descriptions | Spot-confirmed |

**MM-24** remains **withdrawn** by round-0 re-derivation — the `agent-conduct.md` rule-id rename reuses an
established in-repo convention and leaves nothing dangling — and **MR-1** was resolved during an earlier
activity. Neither drives an edit.

---

### Target: `work-package`

Consumer surface: 50 references into 16 `work-package` files from the other 15 workflow directories.
**Round 0 recorded none as reaching a changed file; round 1 refuted that** — see
[Divergence 3](#divergence-3--round-0s-work-package-consumer-surface-was-wrong-and-round-1-acted-on-it).

Open: 0 Critical · 0 High · 0 Medium · **2** Low. Every `work-package` Critical, High and Medium is closed,
and two of the four `Low` rows closed after the sweep ended — see
[Closed outside the sweep](#closed-outside-the-sweep--wl-3-and-wl-6).

#### Open — Low

Both surviving rows were investigated after the disposition rather than deferred unexamined. **Each is open
because closing it is a design change, not because nobody looked.** The evidence below is the reason, and it
is what a later pass should inherit.

| # | Entry | Site(s) — as confirmed in round 1 | Why it stays open | Attr |
|---|---|---|---|---|
| WL-4 | `no-valueless-control-set` | `01-start-work-package.yaml:154-157,541-543` — `action: set` steps carrying the whole derivation in `message:` with no `value:` | **No `value:` expression can carry these.** Both steps bind values that arrive from a *tool response* — `planning_folder_path` from the `get_workflow` summary, and the review-mode outcome list — not from an expression over the bag. Closing it means converting both steps to techniques (so the response has a declared producer) or accepting the prose as-is. A design change | pre |
| WL-5 | `no-duplicate-technique-steps` | `01-start-work-package.yaml:561-571,572-574` — `derive-branch-name` and `compute-canonical-target-path` both bind `naming-conventions`, whose single run produces both outputs | **The duplication is load-bearing.** `derive-branch-name` is gated `is_review_mode != true`; `compute-canonical-target-path` is ungated. Merging them either loses `target_path` in review mode — which `06-plan-prepare.yaml:16` validates non-null — or lets `naming-conventions` overwrite the `branch_name` review mode took from the PR. Separately, `06-plan-prepare.yaml:17` names the `compute-canonical-target-path` step id in its message, so deleting that step dangles a cross-file reference | pre |

Both are **pre**-existing, both sit in one file, and neither is in this run's scope manifest. `work-package`'s
`01-start-work-package.yaml` is the single most consumer-exposed activity file in the library, which is why
the bar for editing it beyond this change's own needs is high.

#### Closed outside the sweep — WL-3 and WL-6

**Provenance stated plainly: these two did not go through the criteria walk.** They were closed by direct
user decision after `audit-disposition#2` resolved, outside the workflow's remediation loop, and are
recorded here so the register remains the accurate decision surface rather than a snapshot of the sweep.
Their evidence is the validator and guard suite only — no re-derivation and no criteria-walk pass stands
behind them.

| # | Severity | What closed it | Verification |
|---|---|---|---|
| WL-3 | Low | **Both** sites trimmed to cause plus action. The Jira `cloudId` message dropped its trailing "The cloudId is a runtime prerequisite … without first loading atlassian-operations"; the commit-signing message dropped "in your environment via your preferred scope (system, global, or local)" | Diff-verified at `87c26fff`: both `message:` strings now state the failure and the action and stop. `01-start-work-package.yaml` is the only file the commit touches (+2/−3) |
| WL-6 | Low | The outcome line "A canonical, writable location is established for every artifact this work package will produce" was **removed** from the `outcome:` block, leaving three genuine deliverables | Diff-verified at `87c26fff`. The plumbing fact no longer sits in outcome position |

Guard evidence for the pair, as reported by the orchestrator that applied them:
`validate-workflow-yaml` against `work-package` **PASS**; `check-all` **16 pass / 0 fail / 1 unmeasured**
(`workflow-yaml`, which needs a single workflow dir); `binding-fidelity` moved **194 → 193** triaged with
**no live defects**, and `scripts/binding-fidelity-triage.json` was left untouched — so this pair is also a
real repair rather than a suppression.

Because `01-start-work-package.yaml` was already in the changed set, these edits **do not widen the file
count**: the change remains **45** files vs the base ref, now at `87c26fff`.

#### Closed in round 1 — `work-package`

| # | Severity | What closed it | Verification |
|---|---|---|---|
| WC-1 | Critical | The offending bind is **gone**. Rather than give `discovered_path` a source, round 1 retired the variable and split the step in two: `derive-host-repo` binds the shared `version-control::resolve-host-repo`, then `resolve-repo-root` assembles component identity | `grep -rn "discovered_path"` returns zero hits library-wide, and the declaration was removed from `work-package/workflow.yaml`. Every input the new pair declares — `host_repo_path`, `component_hint` — is declared in `work-package/workflow.yaml` and produced upstream, so no interpolation resolves to nothing |
| WH-1 | High | `repo-root-resolution.md`'s Protocol no longer re-authors the superproject ascent; it delegates via its `host_repo_path` input and keeps only caller-specific component assembly | The duplicated recipe is gone from the Protocol, and `01-start-work-package.yaml:158-163` binds the shared meta op first, then the local technique — closing the round-0 objection that the carve-out did not apply because the activity bound the local name |
| WH-3 | High | The four worker-directed rules — `safety-floor-never-simplified`, `report-before-apply`, `leanness-reported-honestly`, `complementary-not-duplicative-with-strategic-review` — moved from `rules.workflow` to `rules.activity` at `work-package/workflow.yaml:22-26` | **Harness-confirmed rather than assumed.** `src/tools/workflow-tools.ts:964-976` shows `rules.activity` is exactly the worker-facing channel, delivered as the `activity_rules` block on `get_activity`, while `rules.workflow` is orchestrator-only. The rules now reach the worker they command, and `09-lean-coding-audit.yaml` receives the safety floor's definition. Schema-valid: `workflow-yaml` reports 16 workflows valid |
| WH-2 | Medium (downgraded from High in round 0) | The `repo-root-resolution.md` input description no longer names its internal producer down to activity, step and session | Spot-confirmed against the rewritten description |
| WM-1, WM-2, WM-3 | Medium | Rationale in description; the three-sentence variable description at `work-package/workflow.yaml`; the "at session bootstrap" stage reference | Spot-confirmed |
| WM-4 | Medium | Closed by the same edit as WC-1 — the `{host_repo_path}/{component_path}` template whose absoluteness was a text-only precondition no longer exists, so the legal-but-violating state (`component_path` defaulting to `.`) can no longer interpolate to `/.` | The bind was deleted, not merely re-worded, so the constraint has nothing left to encode |
| WL-1, WL-2 | Low | Avoidance voice ("not a path the user typed") and `procedure-in-capability` in `repo-root-resolution.md` | Spot-confirmed |

---

## Accepted exclusions — not reachable from this edit surface

This run's edit surface is a checkout of the `workflows` repository alone. Three open obligations lie
outside what it can resolve and **cannot close in this change**. The close-out will carry them forward as
deferrals; they are recorded here as the exclusions the audit accepted.

| Item | Location | Why it cannot close here |
|---|---|---|
| MH-4 residue — three strings teaching the retired prose provenance | `src/tools/resource-tools.ts:106`, `src/tools/workflow-tools.ts:326`, `src/utils/session/scope.ts:239` | Server source, outside the `workflows` checkout. `workflow-tools.ts:326` is inside the `discover` return, so an orchestrator reads the superseded rule before any session exists — the highest-value part of the fix is the part this change cannot make |
| e2e walk snapshots | `tests/e2e/__snapshots__/corpus-sha.json`, `snapshot.test.ts.snap`; the walks themselves at `tests/e2e/all-paths-walk.test.ts` and `tests/e2e/all-workflows-walk.test.ts` | Re-baselining requires a submodule pointer bump, which only a server-repo change can make. **Verified in round 2's pass, not assumed:** `corpus-sha.json` pins `corpusSha: f84fe02b…` — byte-identical to this change's base ref — and `git submodule status` still reports the `workflows` submodule at `f84fe02b…`, not at the branch commit `86920547`. So the server repo has not yet seen any of these 45 files. Both walk tests enumerate `meta`, whose activity files this change edits, so the walk stays red until the pointer moves. `corpus-sha.json`'s own note names the procedure: update it "in the same commit that bumps the workflows submodule and re-baselines the walk (`npm run baseline:stamp`)". Recorded as an accepted exclusion in the [scope manifest](06-scope-manifest.md) |
| MM-20's Output half — `workflow`, `planning_slug`, `repo_unbound`, `context_mode`, `migrated` | `meta/techniques/workflow-engine/start-session.md` Outputs | **Tested, not assumed.** Declaring them raised 4 new `dead-output` rejections: `start_session` executes *before* the session bag exists, so no activity gate, condition or same-named input can consume them. Only `planning_slug` had a consumer and it is now declared. Closing the rest needs either a harness change or a new consumer — and suppressing them would mean editing `scripts/binding-fidelity-triage.json`, outside this surface and the suppression the guard-integrity check forbids. The **value** half closed instead: the real response shape, `repo_unbound` included, is documented in `bootstrap-protocol.md`, which is where a pre-session reader actually looks |

None is a coverage gap: all three were walked, all three are understood, and all three have a named home
for the follow-up work.

---

## Coverage

`walked` means the unit's criteria were applied to every changed file across the targets, read in full
and against the base-ref diff, plus the 11 consumer-surface sites, with sibling-convention comparison
against the 14 reference workflows. Whole-surface mechanical coverage comes from the guard suite, which
runs tree-wide.

**No unit is `blocked`, so this walk records no missing coverage** and `has_coverage_gap` is false.
Three divergences follow.

### Divergence 1 — the enumeration denominator was overstated by 2

The `anti-patterns` unit count of `13` is the raw `## ` heading count, not the anti-pattern category
count: it counts `Creation Rules` (authoring meta-guidance) and `Authoring Guidance (MR)` (a separate
4-entry `MR-n` series) as if they were AP categories. The real figure is **11**. Re-verified in round 1
directly against the criteria home.

| Home | Units as swept | Real units | walked | not-applicable | blocked |
|---|---:|---:|---:|---:|---:|
| `workflow-design/anti-patterns` | 13 | **11** | **10** | 1 | 0 |
| `workflow-design/design-principles` | 30 | 30 | 27 | 3 | 0 |
| `workflow-design/schema-construct-inventory` | 6 | 6 | 6 | 0 | 0 |
| `workflow-design/convention-conformance` | 1 | 1 | 1 | 0 | 0 |
| **Total** | **50** | **48** | **44** | **4** | **0** |

The miscount is self-consistent in outcome — one of the two non-categories, `creation-rules`, is itself
the unit the walk marked `not-applicable` — so no criteria surface went unexamined and no verdict depends
on the denominator. Two cautions for a later pass: the `anti-patterns` figure is granularity-sensitive in
a way the others are not (11 categories versus **130** individual `AP-nn` entries, so a per-anti-pattern
claim needs a different denominator), and `design-principles`' 30 is correct only at principle
granularity — its raw `## ` count is 31, because `Overview` is not a principle.

### Divergence 2 — the four `not-applicable` units, each an evidenced negative

| Unit | Reason it does not reach this surface |
|---|---|
| `anti-patterns#creation-rules` | Governs how anti-pattern entries themselves are authored. No file in scope is a criteria home: `grep -rn "^### AP-"` over the changed files and consumer sites returns zero hits; all 130 entries live in `workflow-design/resources/anti-patterns.md`, which this change does not touch and no changed file references |
| `design-principles#2-internalize-before-producing` | Governs the authoring session's order of work, not authored artefacts. No construct in scope carries evidence of pre- or post-internalisation ordering |
| `design-principles#23-close-the-loop` | No recommendation-shaped deliverable in scope; the one analysis-to-action seam the change adds (`host_binding_mismatch` → checkpoint) terminates in an explicit `abort-binding` stop gate |
| `design-principles#28-creation-guide-for-generated-documents` | No changed technique persists a planning artifact — no `#### artifact` declaration exists in any changed file |

### Divergence 3 — round 0's `work-package` consumer surface was wrong, and round 1 acted on it

Round 0 recorded that none of the 50 inbound references reached a file this run changed, and that
`repo-root-resolution` was bound only by `work-package`'s own `01-start-work-package`. That is
**refuted**: `remediate-vuln/activities/01-start.yaml:44` is a second consumer, binding
`work-package::repo-root-resolution` through an `inputs` deviation.

The consequence was live rather than theoretical. Round 1's WH-1 fix replaced that technique's
`discovered_path` input with `host_repo_path`, which would have left the `remediate-vuln` bind supplying
an input the technique no longer declares. The bind was corrected in the same round
(`discovered_path: target_path` → `host_repo_path: target_path`).

This is a **coverage divergence corrected inside the run**, not a coverage gap — the miss was found and
repaired before commit, which is why no unit is marked `blocked`. Its *scope* consequence is separate: the
repair edited a file the manifest listed as out of scope, on a rationale the change has since superseded.
That belongs to the [scope manifest](06-scope-manifest.md) and is recorded there, not here.

### Divergence 4 — the target set was widened in round 2 to complete MH-5

`target_workflow_ids` entered round 2 as `[meta, work-package]` and leaves it as
`[meta, work-package, workflow-design, workflow-authoring, remediate-vuln]`. The widening is an **operator
decision**, taken specifically so MH-5 could complete, and it is sourced from this activity's envelope
rather than written from the orchestrator.

The reason is arithmetic, not preference. `repo_root` occupied 24 files: 19 in `work-package`, 3 in
`workflow-design`, 1 in `workflow-authoring`, 1 in `remediate-vuln`. A rename confined to the declared
targets would have left three workflows reading an id that no longer exists — strictly worse than the
naming defect it was fixing. The 5 out-of-target files are **not** incidental drive-by edits. Round 2's
verification pass separated them into **4 that carry the rename** — the consumer half of the same
contract — and **1 that is a version bump only**, a distinction the earlier text collapsed by describing
all 5 as rename sites:

| File | Why the change reaches it |
|---|---|
| `workflow-design/techniques/prepare-workflow-branch.md` | **Rename.** Declares the id as an optional input and passes it into `work-package::manage-git::create-worktree` — a live cross-workflow bind on the renamed contract |
| `workflow-design/workflow.yaml` | **Rename** (+ version bump). `target_path`'s description contrasts itself against the id by name |
| `workflow-authoring/techniques/workflow-definition/derive-workflows-target-path.md` | **Rename.** Declares the id as an **output** and reads it twice; same host-root concept, derived from planning-folder ancestry |
| `remediate-vuln/workflow.yaml` | **Rename** (+ version bump). Declares the id as a workflow variable, and `gitnexus_indexed`'s description names it |
| `workflow-authoring/workflow.yaml` | **Version bump only** — `1.0.0`→`1.1.0`, carrying no rename. It changed because its sibling technique above did, under the library convention that a workflow's version rises when its files change. Diff-verified: the bump is the file's only changed line |

The four rename files were each read before editing and confirmed to denote the same host/outermost-repository
concept, so the rename is a genuine hoist rather than a textual sweep.
`workflow-design/resources/anti-patterns.md` was read and **excluded** — see the MH-5 closure note.

**The pre-existing manifest divergences still ride in the envelope**, because `verify-scope-manifest` has
now been gated off for three consecutive entries and no artifact has picked them up:

1. `remediate-vuln/activities/01-start.yaml:44` — edited in round 1. **The manifest's out-of-scope
   rationale for this line is falsified**: it rested on the claim that `repo-root-resolution` had no
   consumer outside `work-package`, which [Divergence 3](#divergence-3--round-0s-work-package-consumer-surface-was-wrong-and-round-1-acted-on-it)
   refuted. The line is in scope on the merits and the rationale needs restating, not re-justifying.
2. `work-package/activities/11-validate.yaml:33` — edited in round 1, outside the manifest.
3. `meta/techniques/version-control/list-submodules.md` — edited in round 1, outside the manifest.
4. Manifest row 1 said declare `is_monorepo_host`; round 1 **deleted** it instead (MH-8).
5. Manifest rows 2 / 9 / 16 said give `discovered_path` a source; round 1 **retired** the variable instead
   (WC-1).
6. **New in round 2**: the 5 out-of-target files above, plus `meta/techniques/README.md` created for ML-7,
   none of which appear in the manifest's file list.

7. **The manifest's denominator is stale.** `06-scope-manifest.md` declares **19** entries; the change is
   **45** files. The gap is not undisclosed work — every increment above is accounted for in this register —
   but the manifest's file list no longer describes the change it governs.

All seven are recorded divergences against the manifest, not undisclosed edits. The manifest is the
canonical home for the file list, so this register states the divergences and does **not** carry the
reconciled list: that is `verify-scope-manifest`'s output, and it belongs in `06-scope-manifest.md`.

**Status of that gate.** `verify-scope-manifest` is gated on `remediation_selected != true`, which held
false through the first two entries of this activity and therefore skipped it twice. It becomes reachable
in this third entry only *after* the `audit-disposition#2` gate resolves the round to a non-remediating
disposition. Until it runs, the divergences above are carried by this register alone — which is why they
are recorded here in full rather than by reference.

---

## Guard results

`npx tsx scripts/check-all.ts --root <target_path>` — 17 guards, **16 pass, 1 fail**, independently re-run
after round 2's final edit. `validate-activities.ts` reports 112 passed / 0 failed. `validate-workflow-yaml.ts`
was run **per target** across all five (each reports 1 workflow valid), and tree-wide `workflow-yaml`
reports 16 workflows valid.

`binding-fidelity` totals moved from 198 violations at round 0 (70 harmless, 123 fix-later, 0 live bugs,
4 untriaged) to **194** at round 1, and **hold at 194** (70 harmless, 123 fix-later, **0 live bugs**,
**1 untriaged**) through round 2 — across 34 further changed files, including an 80-occurrence rename and
a shared-input hoist that 15 other workflows inherit.

| Round 0 rejected file | Round 1 | Round 2 |
|---|---|---|
| `meta/techniques/version-control/resolve-host-repo.md` — `dead-output is_monorepo_host` | **cleared** (MH-8) | still clear |
| `meta/techniques/cargo-operations/preflight.md` — `orphan-input component_path`, `orphan-input host_repo_path` | **cleared** (MC-1 / WC-1) | still clear after the MM-25 hoist deleted both declarations |
| `substrate-node-security-audit/techniques/write-report.md:90` — `read-resolution {target_path}` | **still rejected** | **still rejected** — outside all five targets |

**In-target rejections went 3 → 0 in round 1 and remain 0.** The one remaining rejection,
`substrate-node-security-audit/techniques/write-report.md:90`, lies outside every target, is pre-existing
drift against the base ref, and is not fixable by this change.

#### Re-run at the branch tip `87c26fff`

The suite was re-run tree-wide against the final commit, and the figures above **hold exactly**:
`17 guard(s) — 16 pass, 1 fail, 0 unmeasured`, the single failure being `binding-fidelity`, whose sole
untriaged violation is the same out-of-target `write-report.md:90`. `binding-fidelity` totals
**194** (70 harmless, 123 fix-later, **0 live bugs**, 1 untriaged). `activities` reports 112 passed / 0
failed and `workflow-yaml` reports 16 workflows valid.

**One reported figure did not reproduce, and ground truth is recorded instead of it.** The orchestrator that
applied the WL-3 / WL-6 closure reported `check-all` as *16 pass / 0 fail / 1 unmeasured* with
`binding-fidelity` moving *194 → 193*. Re-run tree-wide, the result is 16 pass / **1 fail** / 0 unmeasured
at **194**. The divergence is a scope artefact, not a disagreement about the files: that run passed a
single-workflow-directory `--root`, which leaves `workflow-yaml` unmeasurable (it needs one workflow dir)
and narrows `binding-fidelity`'s file set so the out-of-target `substrate-node-security-audit` rejection
falls outside it. Tree-wide is the figure this register carries, because `fail_count` and the guard verdicts
are claims about the whole library surface.

Round 2 used the guard suite as a **decision instrument**, not only as a post-hoc check: the MM-20 Output
declarations and the MM-25 hoist were each applied, measured, and then kept or reverted on the evidence.
MM-20's additions raised 4 rejections and were withdrawn; the hoist raised none and was kept.

`scripts/binding-fidelity-triage.json` was verified **untouched**, so the improvement is a real repair and
not a suppression.

### On the non-zero `fail_count`

`fail_count` is **1**, and it is **not** an in-target failure — it is the single out-of-target file above.

No `condition`, gate or `transition` in this activity reads `fail_count`. It appears only in the
`audit-disposition` checkpoint's message text. A non-zero value is therefore **informational here and does
not block attestation on its own**; the blocking conditions were `has_critical_finding` (false) and
`open_finding_count > 0` (true, at 10 when the disposition was taken, now **8**). This is recorded
explicitly so the disposition was taken with the distinction visible, rather than the count being read as a
silent blocker or waved through unexamined.

`fail_count` is unchanged at 1 across both remediation rounds **and at the `87c26fff` tip**, and it is the
same out-of-target file every time, so the count carries no signal about this change. It is **not fixable
here** and is not carried forward as an obligation of this run: the file belongs to
`substrate-node-security-audit`, which is outside all five targets.

---

## Known

74 keys were loaded and compared; **none matched a finding raised above**, so the decision surface is
unchanged by them. They remain readable as suppressions so a later pass can ask whether each acceptance
still holds.

| Source | Keys | Class | Verdicts |
|---|---|---|---|
| `scripts/binding-fidelity-triage.json` | 63 | `dead-output` | 32 `meta` (harmless), 31 `work-package` (fix-later) |
| `scripts/binding-fidelity-triage.json` | 8 | `read-resolution` | 1 `meta`, 7 `work-package` (harmless) |
| `scripts/check-review-mode-gating.ts` `ACCEPTED_HEADLESS_AUTO_ADVANCE` | 3 | `review-mode-headless-auto-advance` | `work-package::codebase-comprehension::comprehension-sufficient`, `work-package::requirements-elicitation::elicitation-complete`, `work-package::research::context-scope-declaration` |

Keys are class-keyed rather than entry-keyed, because both sources name a violation class rather than a
criteria entry. The `audience` and `identifier-qualification` guards are hard-zero with no baseline, and
the planning folder held no prior findings register, so neither contributed keys.

---

## Sources

| Label | Path |
|---|---|
| Change brief | [`01-change-brief.md`](01-change-brief.md) |
| Impact analysis | [`01-impact-analysis.md`](01-impact-analysis.md) |
| Scope manifest | [`06-scope-manifest.md`](06-scope-manifest.md) |
| Session index | [`README.md`](README.md) |
| Edit surface | `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-git-derived-host-repo-binding` — round 1 at `9eea56c6`; round 2 at `86920547`; **WL-3 / WL-6 closure at `87c26fff`**, the branch tip. Pushed to `origin/workflow/meta-git-derived-host-repo-binding`. Verified directly: the worktree is clean and the branch is level with its upstream, so all 45 files are already published and no source work is pending a commit |
| Harness under co-change | `/home/mike1/projects/dev/workflow-server/src` — evidence for MH-4, MM-17, MM-19, MM-20, WH-3 |
