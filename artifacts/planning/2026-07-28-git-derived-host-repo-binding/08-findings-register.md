# Findings Register — git-derived host-repo binding

**Date:** 2026-07-28 · **Mode:** Update · **Remediation round:** 1
**Base ref:** `f84fe02b12f9617f401767b9b96f329d8c13225c` (merge base of `workflow/meta-git-derived-host-repo-binding` with `origin/workflows`)
**Targets:** `meta`, `work-package` — one section each below

Canonical home for this run's audit findings, coverage divergences and accepted exclusions.

- **Edit surface**: `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-git-derived-host-repo-binding` — **22** changed files vs the base ref, diff-confirmed; remediation round 1 landed as `9eea56c6`
- **Changed by target**: `meta` 16 · `work-package` 4 · `remediate-vuln` 1 (consumer repair — see [Divergence 3](#divergence-3--round-0s-work-package-consumer-surface-was-wrong-and-round-1-acted-on-it))
- **Criteria units**: 44 walked, 4 not-applicable, 0 blocked
- **Guard suite**: 16 of 17 pass; `binding-fidelity` rejects **1** file, and it lies outside both targets
- **Known findings**: 74 keys loaded, 0 matched a finding raised here

Severity: `Critical` = schema-invalid or structurally broken construct that must not be committed.
Attribution is measured against the base ref: **new** arrived with this change, **pre** pre-existed it.

Every `Critical` and `High` row was **independently re-derived** from the construct it cites, refuting by
default — in round 0, and again in round 1 against the post-remediation files. Verdicts: `confirmed`
(reproduced), `downgraded` (evidence supports a lesser issue), `withdrawn` (not reproduced — drives no
edit), `closed` (the cited construct no longer reproduces the violation). Surviving `Medium` and `Low`
rows were spot-confirmed against their cited constructs, which narrowed several citations recorded below.

## Summary

| Severity | Open | Closed in R1 | Known |
|----------|-----:|-------------:|------:|
| Critical | 0 | 2 | 0 |
| High     | 1 | 6 | 0 |
| Medium   | 10 | 24 | 0 |
| Low      | 10 | 5 | 0 |
| **Total** | **21** | **37** | **0** |

The decision surface entered round 1 at 58 and leaves it at **21 open, 37 closed**. **Both Criticals are
closed by re-derivation rather than by assertion**, so no structurally broken construct remains and
`has_critical_finding` is false.

One round-1 recalibration moved a row between severities: **MH-4 is downgraded from High to Medium**,
because the duplication it cited is gone from the definition surface and only a server-repo co-change gap
remains. The open total is therefore unchanged at 21 while the mix shifts High 2 → 1 and Medium 9 → 10.

**Two open items are not reachable from this run's edit surface** and cannot close here — MH-4's three
harness strings and the e2e walk snapshots. Both are recorded under
[Accepted exclusions](#accepted-exclusions--not-reachable-from-this-edit-surface). **This change is not
self-contained**: it lands correct in the definition library and leaves obligations in the
`workflow-server` repository.

---

## Findings

### Target: `meta`

Consumer surface: 435 references from 115 files across 15 other workflow directories reach 78 `meta`
files; 11 resolve into a file this run changed. Those 11 sites were walked.

Open: 0 Critical · 1 High · 10 Medium · 6 Low.

#### Open — High

**MH-5 · `io-id-shape` · `meta/techniques/version-control/resolve-host-repo.md:26` vs `work-package/techniques/repo-root-resolution.md:22`** — **confirmed; evidence strengthened in round 1** · **new**

One concept, two ids. `host_repo_path` is "the outermost repository that claims the workspace checkout"
(`resolve-host-repo.md:28`); `repo_root` is the "repo root used for comprehension, GitNexus indexing …
and as the git directory for `git worktree add`" (`repo-root-resolution.md:24`).

Round 1 made the aliasing **explicit and unconditional**, which strengthens the finding rather than
clearing it. `repo-root-resolution.md:36` now reads:

> Set `{repo_root}` to `{host_repo_path}` — the host derivation has already ascended to the outermost
> superproject, so no further ascent is performed here.

A Protocol step now exists whose entire content is copying one id onto the other, with `host_repo_path`
declared as that technique's own input (:12-14). The runtime equality assertion also survives, relocated
into its own gated step at `meta/activities/02-resolve-target.yaml:56-61`. A single id would remove both
the copy step and the assertion.

*Why it stays open rather than being fixed*: the remedy is a library-wide rename of `repo_root` →
`host_repo_path` across `work-package` and every consumer. Round 1 judged a half-completed rename more
dangerous than the naming defect, and the surviving copy step keeps behaviour correct meanwhile. Recorded
as an accepted open finding awaiting a dedicated rename pass.
*Fix*: hoist the host-root concept to one shared id and drop the representation suffix, in one pass.

#### Open — Medium

The **Correction** column carries round-1 spot-confirmation results; several citations narrowed as
remediation closed some of a finding's sites but not all.

| # | Entry | Site(s) — as confirmed in round 1 | Note | Correction | Attr |
|---|---|---|---|---|---|
| MH-4 | `no-duplicated-guidance` | `src/tools/resource-tools.ts:106`; `src/tools/workflow-tools.ts:326`; `src/utils/session/scope.ts:239` — all in the **server** repo | **Downgraded from High.** Three harness strings still teach the retired provenance ("pass `repo` … from the user or workspace AGENTS.md"). `workflow-tools.ts:326` sits inside the `discover` return, so the first surface an orchestrator reads contradicts the new contract | **Definition half closed**: full statements went 4 → 1. The rule now has one named home, `prose-sources-are-fallback-only` (`resolve-host-repo.md:49-51`); `bootstrap-protocol.md:17` and `start-session.md:22` are pointers; `meta/workflow.yaml:40` no longer states it. Downgraded because what remains is stale documentation outside the audited target surface, not duplicated guidance within it | new |
| MM-4 | `readme-orients-not-transcribes` | `meta/activities/README.md:5,15,31` (and `:47`) | checkpoint roster with firing conditions (:15), near-verbatim restatement of activity `outcome` text (:31 vs `02-resolve-target.yaml:73`; :47 vs `04-end-workflow.yaml:45-46`), prose activity sequence duplicating the `meta/README.md:18-24` index table (:5) | **narrowed 5 sites → 3 homes, all in `meta/activities/README.md`.** Both `meta/README.md` sites are resolved: the rule-key inventory row no longer lists keys, and `grep -rn 'target-path-scope' meta/` returns nothing. Also re-cited: the restatement target is the activity **`outcome`** text, not an activity `rules:` block — MH-6's fix removed every such block library-wide | new |
| MM-6 | `technique-ref-in-io-contract` | `commit-and-persist.md:22`; `start-session.md:22,34` | I/O entry descriptions hyperlink a producing or consuming technique | **narrowed 5 sites → 2 files.** `preflight.md`, `select-target-component.md:26` and `extract-identifying-context.md:24` are resolved — the latter two now use a bare-text rule reference with no link | new |
| MM-8 | `io-agnostic-contract` | `commit-and-persist.md:22,30`; `start-session.md:22` | I/O entries naming a workflow-internal producer, or a flag described as coming "from the workflow bag" | **narrowed 4 sites → 2 files.** `preflight.md` names no producer in any entry; `select-target-component.md`'s remaining sources are external ("as derived from git"), which is the exempted origin | new / pre |
| MM-15 | `contract-not-procedure` | `resolve-host-repo.md:42,43,45` | Protocol steps that are projections of already-produced Outputs. Step 6 (:45) is verbatim its own Output declaration at :36 | **re-cited and widened.** Round 0 cited steps 4 and 6 at :47/:49; the remediation renumbered the Protocol, and step 3 (:42, projecting :28) is a third instance | new |
| MM-16 | `pass-orchestration-in-technique` | `commit-and-persist.md:34,35,38,39` | four `Apply` / `::` op invocations inside one technique bound as a single step at `03-dispatch-client-workflow.yaml:58`, so each op could be its own step | confirmed unchanged — round 1 did not touch this file | pre |
| MM-17 | `constraint-as-blockquote` | `commit-and-persist.md:35` | an indented `-` sub-bullet, which the loader reads as a disconnected peer step | confirmed. Loader-backed: `markdown-technique-loader.ts:192` captures indentation and never reads it. The intended `>` continuation form exists in-tree at `start-session.md:53-54` | pre |
| MM-20 | `describe-tool-value` | `start-session.md:36-48`; `bootstrap-protocol.md:20` | mechanics in place of value, and the declared Outputs are incomplete | confirmed against the actual response shape at `resource-tools.ts:382-403`, which returns a `workflow` metadata block, `planning_slug`, `repo_unbound`, `context_mode` and `migrated` beyond the three declared ids. `repo_unbound` is precisely the signal that this change's derivation-plus-fallback contract failed to bind, so its omission matters most | pre |
| MM-23 | `structure-backed-constraints` | `agent-conduct.md:96-98`; restated at `commit-and-persist.md:46` | the `orchestrator-component-path-scope` MUST/NEVER commit-location rule has no checkpoint, `condition` or `validate` backing it | confirmed. The only `validate` actions in `meta` are `02-resolve-target.yaml:52-66` (binding agreement, resumed binding, git-tree presence) and `03-dispatch-client-workflow.yaml:10` — none constrains commit or branch location, and no checkpoint or condition references commit scope | new |
| MM-25 | `hoist-shared-inputs` | `preflight.md:12-18`; `commit-and-persist.md:20-26` | the same `host_repo_path` + `component_path` pair declared on two techniques in two different groups | confirmed on all counts. `meta/techniques/TECHNIQUE.md` is 8 lines of Capability only, with no `## Inputs`, despite claiming to hold shared ones. Newly noted: the intermediate `cargo-operations/TECHNIQUE.md:10-18` *does* carry `## Inputs`, but declares `build_scope`/`features` — so the hoist target exists and simply omits this pair | new |

#### Open — Low

| # | Entry | Site(s) — as confirmed in round 1 | Attr |
|---|---|---|---|
| MM-12 | `boolean-id-shape` — downgraded from Medium in round 0. `host_binding_mismatch` names the prohibited state; not an outlier, since `workflow_match_ambiguous` shares both the shape and the `setVariable … false` approval | `meta/workflow.yaml:50-53`; `resolve-host-repo.md:34`; read at `00-discover-session.yaml:14`, set at `:25` | new |
| MM-21 | `no-technique-resource-dual-home` — downgraded from Medium in round 0. The dual home holds and each side links the other; "character-for-character" was refuted | `bootstrap-protocol.md:20` / `start-session.md:52-55` | pre |
| ML-1 | `avoidance-voice-in-definitions` | `00-discover-session.yaml:127` outcome ("no search performed otherwise"); `meta/README.md:52,90` ("do not restate that HOW here", "reference but do not restate them") | new / pre |
| ML-4 | `paren-invocation-args` | `commit-and-persist.md:34,38` — argument lists outside parentheses with backticked parameter names | pre |
| ML-5 | `no-one-step-rules` | `commit-and-persist.md:56-58` — `no-stale-remote` names the single step it constrains ("push is mandatory whenever step 5 stages changes") | pre |
| ML-7 | `complete-documentation-structure` | `meta/techniques/` has no `README.md`, while `work-package/techniques/README.md` does exist — so the asymmetry is in-repo, not only against the reference workflows | pre |

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

Open: 0 Critical · 0 High · 0 Medium · 4 Low. Every `work-package` Critical, High and Medium is closed.

#### Open — Low

| # | Entry | Site(s) — as confirmed in round 1 | Attr |
|---|---|---|---|
| WL-3 | `validate-message-economy` | `01-start-work-package.yaml:248` — trailing consequence essay after the cause. Second instance newly noted at `:186` ("Configure git signing in your environment … before re-running.") | pre |
| WL-4 | `no-valueless-control-set` | `01-start-work-package.yaml:154-157,541-543` — `action: set` steps carrying the whole derivation in `message:` with no `value:` | pre |
| WL-5 | `no-duplicate-technique-steps` | `01-start-work-package.yaml:561-571,572-574` — `derive-branch-name` and `compute-canonical-target-path` both bind `naming-conventions`, whose single run produces both outputs | pre |
| WL-6 | `outcome-names-value` | `01-start-work-package.yaml:793` — a plumbing fact (planning-folder binding) in outcome position among genuine deliverables | pre |

All four are **pre**-existing, all four sit in one file, and none is in this run's scope manifest. They
are recorded for a later pass over `01-start-work-package.yaml` rather than as residue of this change.

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

This run's edit surface is a checkout of the `workflows` repository alone. Two open obligations lie
outside it and **cannot close in this change**. The close-out will carry them forward as deferrals; they
are recorded here as the exclusions the audit accepted.

| Item | Location | Why it cannot close here |
|---|---|---|
| MH-4 residue — three strings teaching the retired prose provenance | `src/tools/resource-tools.ts:106`, `src/tools/workflow-tools.ts:326`, `src/utils/session/scope.ts:239` | Server source, outside the `workflows` checkout. `workflow-tools.ts:326` is inside the `discover` return, so an orchestrator reads the superseded rule before any session exists — the highest-value part of the fix is the part this change cannot make |
| e2e walk snapshots | `tests/e2e/__snapshots__/corpus-sha.json`, `snapshot.test.ts.snap` | Re-baselining requires a submodule pointer bump, which only a server-repo change can make. Recorded as an accepted exclusion in the [scope manifest](06-scope-manifest.md); the walk stays red until then |

Neither is a coverage gap: both were walked, both are understood, and both have a named home for the
follow-up work.

---

## Coverage

`walked` means the unit's criteria were applied to every changed file across both targets, read in full
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

---

## Guard results

`npx tsx scripts/check-all.ts --root <target_path>` — 17 guards, **16 pass, 1 fail**, independently re-run
in round 1. Both positional validators pass per target; `validate-activities.ts` reports 112 passed /
0 failed; `workflow-yaml` reports 16 workflows valid.

`binding-fidelity` totals moved from 198 violations (70 harmless, 123 fix-later, 0 live bugs, 4 untriaged)
to **194** (70 harmless, 123 fix-later, **0 live bugs**, **1 untriaged**).

| Round 0 rejected file | Round 1 |
|---|---|
| `meta/techniques/version-control/resolve-host-repo.md` — `dead-output is_monorepo_host` | **cleared** (MH-8) |
| `meta/techniques/cargo-operations/preflight.md` — `orphan-input component_path`, `orphan-input host_repo_path` | **cleared** (MC-1 / WC-1) |
| `substrate-node-security-audit/techniques/write-report.md:90` — `read-resolution {target_path}` | **still rejected** |

**In-target rejections went 3 → 0.** The one remaining rejection,
`substrate-node-security-audit/techniques/write-report.md:90`, lies outside both targets, is pre-existing
drift against the base ref, and is not fixable by this change.

`scripts/binding-fidelity-triage.json` was verified **untouched**, so the improvement is a real repair and
not a suppression.

### On the non-zero `fail_count`

`fail_count` is **1**, and it is **not** an in-target failure — it is the single out-of-target file above.

No `condition`, gate or `transition` in this activity reads `fail_count`. It appears only in the
`audit-disposition` checkpoint's message text. A non-zero value is therefore **informational here and does
not block attestation on its own**; the blocking conditions are `has_critical_finding` (false) and
`open_finding_count > 0` (true, at 21). This is recorded explicitly so the disposition is taken with the
distinction visible, rather than the count being read as a silent blocker or waved through unexamined.

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
| Edit surface | `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-git-derived-host-repo-binding` — remediation round 1 at `9eea56c6` |
| Harness under co-change | `/home/mike1/projects/dev/workflow-server/src` — evidence for MH-4, MM-17, MM-19, MM-20, WH-3 |
