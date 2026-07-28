# Findings Register — git-derived host-repo binding

**Date:** 2026-07-28 · **Mode:** Update
**Base ref:** `f84fe02b12f9617f401767b9b96f329d8c13225c` (merge base of `workflow/meta-git-derived-host-repo-binding` with `origin/workflows`)
**Targets:** `meta`, `work-package` — one section each below

Canonical home for this run's audit findings, coverage divergences and accepted exclusions.

- **Edit surface**: `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-git-derived-host-repo-binding` — 19 changed files, diff-confirmed against the base ref
- **Targets**: `meta` (153 surface files, 16 changed) · `work-package` (162 surface files, 3 changed)
- **Criteria units**: 44 walked, 4 not-applicable, 0 blocked — see [Coverage](#coverage) for a correction to the denominator
- **Guard suite**: 16 of 17 pass; `binding-fidelity` rejects 3 definition files
- **Known findings**: 74 keys loaded, 0 matched a finding raised here

Severity: `Critical` = schema-invalid or structurally broken construct that must not be committed.
Attribution is measured against the base ref: **new** arrived with this change, **pre** pre-existed it.

Every `Critical` and `High` row below was **independently re-derived** from the construct it cites,
refuting by default. Verdicts: `confirmed` (reproduced), `downgraded` (evidence supports a lesser
issue), `withdrawn` (not reproduced — drives no edit). Surviving `Medium` rows were spot-confirmed
against their cited construct, which corrected several citations recorded below.

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 2 | 0 |
| High     | 8 | 0 |
| Medium   | 33 | 0 |
| Low      | 15 | 0 |
| **Total** | **58** | **0** |

One finding was withdrawn by re-derivation (MM-24), taking the surface from 59 to 58. Three Highs
were downgraded to Medium and two Mediums to Low; downgraded rows stay on the decision surface.
**Both Criticals survived re-derivation, so nothing here is committable as it stands.**

---

## Findings

### Target: `meta`

Consumer surface: 435 references from 115 files across 15 other workflow directories reach 78 `meta`
files; 11 resolve into a file this run changed. Those 11 sites were walked.

Counts: 1 Critical · 6 High · 28 Medium · 9 Low.

#### Critical

**MC-1 · `unproduced-value-read` · `meta/techniques/cargo-operations/preflight.md` `## Inputs`** — **confirmed** · **new**

The change replaced preflight's single `target_path` input with `host_repo_path` + `component_path`
(`preflight.md:12,16`); neither carries a `#### default`. Its only bind site library-wide is the
bare-string bind at `work-package/activities/11-validate.yaml:28` — no `inputs` deviation — so both
inputs same-name bind against a bag that declares neither: `work-package/workflow.yaml` declares
`target_path` (:92), `repo_root` (:95), `component_name` (:98) and `discovered_path` (:514), and a
tree-wide grep finds `host_repo_path` / `component_path` anywhere in `work-package` only inside
description prose (`workflow.yaml:516`, `repo-root-resolution.md:14`) and the WC-1 template. The
rename converted a working bind into a broken one, and because the break is *implicit* same-name
binding it is invisible to a grep for the ids. Guard-confirmed: two untriaged `orphan-input`
rejections. `11-validate.yaml` appears in neither the scope manifest nor the approved out-of-scope list.
*Re-derived from*: `preflight.md` `## Inputs`, the `11-validate.yaml` bind, the `work-package/workflow.yaml` variable block.
*Fix*: declare and seed both ids in `work-package/workflow.yaml`, or supply them via a
`step.technique.inputs` deviation at the bind site.

#### High — confirmed

**MH-2 · `stale-restatement-after-change` + `technique-inputs-declared` · `meta/techniques/version-control/detect-repo-type.md:8,22`** — **confirmed** · **new**

The file has **no `## Inputs` section at all** (Capability → Outputs → Protocol). Capability still
scopes the question to "whether **the working directory** is a regular repo or a submodule monorepo"
(:8), and Protocol step 1 still anchors the read at "`.gitmodules` … at **the repo root**" (:22) —
after this change made `host_repo_path` the authoritative root and rewrote `02-resolve-target.yaml:7`
to "component_path is relative to host_repo_path". The diff did edit this file (8 lines, `target_path`
→ `component_path`), so the anchor claim was inside the edit's scope and was left behind.
*Consequence*: a session opened inside a component detects the **component's own** structure and
emits `component_path` relative to the wrong root — the exact failure this change exists to prevent.
*Same class, second site*: `meta/techniques/version-control/list-submodules.md:8,18` also declares no
`## Inputs` and reads `.gitmodules` with no root named at all. That file is **not** among the 19
changed files, so that site is **pre**, not new.
*Fix*: declare `host_repo_path` as an input on both techniques and anchor both `.gitmodules` reads to it.

**MH-4 · `no-duplicated-guidance` · git-derivation fallback rule in four definition homes plus three stale harness homes** — **confirmed** · **new**

The fallback rule — AGENTS.md/CLAUDE.md or the user apply *only* when the workspace is not a git repo
or the host has no origin remote — is stated in **full** at four homes, none of them a pointer:
`resolve-host-repo.md:24`, `bootstrap-protocol.md:17`, `start-session.md:22`, `meta/workflow.yaml:40`.
More seriously, three harness homes this change did not touch still teach the **retired** provenance:

| Harness site | Text |
|---|---|
| `src/tools/resource-tools.ts:106` | "Always pass `repo` as owner/repo (from the user or workspace AGENTS.md)" |
| `src/tools/workflow-tools.ts:326` | "repo_binding: required — pass repo … (from user or workspace AGENTS.md)" |
| `src/utils/session/scope.ts:239` | "Pass repo: \"owner/repo\" (from the user or workspace AGENTS.md)." |

`workflow-tools.ts:326` sits inside the `discover` return and is pushed immediately above the
bootstrap body (`:323-330`), so the **first surface an orchestrator reads teaches the superseded
rule**. This is a co-change gap reaching outside the workflows submodule.
*Fix*: keep `resolve-host-repo.md` as the one home, reduce the definition duplicates to pointers, and
update the three server-side strings.

**MH-5 · `io-id-shape` · `resolve-host-repo.md:26` vs `work-package/techniques/repo-root-resolution.md:18`** — **confirmed, scope narrowed** · **new**

One concept, two ids. `host_repo_path` is "the outermost repository that claims the workspace
checkout" (:28); `repo_root` is "the outermost monorepo root when the discovered path is a component"
(`repo-root-resolution.md:20`) — and `repo-root-resolution.md:29` states the computation is the same
ascent, "where it is stated canonically". Because `discovered_path` is built as
`{host_repo_path}/{component_path}`, ascending from it returns `host_repo_path` by construction, so
the two hold the same value in every run. `02-resolve-target.yaml:58` asserts that equality at
runtime, which is the tell: a single id removes the need for the assertion. The `-path` suffix on one
of the pair and not its synonym makes the suffix encode representation rather than the noun.
*Withdrawn half*: the claim that the drift repeats between `component_hint` and `component_name` is
**not reproduced**. `component_hint` is a *candidate signal* — unset when no ascent happened
(`resolve-host-repo.md:36,47`), used only to rank a pre-selection that "never resolves the
checkpoint" (`select-target-component.md:41`). `component_name` is the always-set resolved basename
(`repo-root-resolution.md:22`). A hint and a resolved name are different concepts; this half drives
no edit.
*Fix*: hoist the host-root concept to one shared id and drop the representation suffix.

**MH-6 · `no-activity-prose-rules` + `no-rule-protocol-restatement` · `meta/activities/02-resolve-target.yaml:6-8`** — **confirmed** · entry 1 **new**; the block and entry 2 **pre**

`grep "^rules:"` over every `*/activities/*.yaml` in the library returns **exactly this one file** —
no sibling activity anywhere carries an activity-level `rules:` block. Entry 1 (":7 — component_path
is relative to host_repo_path, and their join MUST resolve to a directory containing a working git
tree") restates the formal `validate` step 20 lines later at :63 ("Confirm
`{host_repo_path}/{component_path}` resolves to a directory containing a working git tree"), plus the
relativity already declared in `meta/workflow.yaml`'s `component_path` description. Entry 2 (":8 —
Exclude infrastructure submodules per version-control::infrastructure-submodule-paths") restates what
the bound techniques already apply themselves — `detect-repo-type.md:23` and `resolve-host-repo.md:45`
both invoke that rule.
*Fix*: delete entry 1, migrate or delete entry 2, leaving no activity `rules:` block.

**MH-7 · `bind-protocol-locals` · `meta/techniques/agent-conduct.md:98`** — **confirmed** · **new**

The renamed rule reads "commits MUST be performed inside the component directory
`{host_repo_path}/{component_path}`". `agent-conduct.md` declares **no `## Inputs`** and is delivered
into client-workflow contexts: **seven** of its consumer sites are outside `meta` — four in
`workflow-design` (`audit-conformance.md`, `reload-workflow.md`, `context-loading.md`,
`intake-classification.md`) and three in `work-package` (`rust-substrate-code-review.md`,
`architecture-review.md`, `respond-to-pr-review.md`). In none of those workflows is either name
declared or ambient: a tree-wide grep finds `host_repo_path` in `work-package` only in description
prose, and no occurrence at all in `workflow-design`. The pre-change designator `{target_path}` **was**
declared (`work-package/workflow.yaml:92`), so the rename converted one resolving read into two
non-resolving ones on a shared surface.
*Fix*: read a `{name}` declared or ambient at each consuming workflow, or drop the designator for role prose.

**MH-8 · dead output `is_monorepo_host` + `single-source-of-truth` · `meta/workflow.yaml:44`** — **confirmed** · **new**

A tree-wide grep for `is_monorepo_host` returns exactly three hits — the declaration
(`meta/workflow.yaml:44`), the Output heading (`resolve-host-repo.md:30`) and the Protocol set
(`resolve-host-repo.md:46`). **Nothing reads it.** Every gate that branches on the monorepo fact
compares a *different* variable, `is_monorepo` (`02-resolve-target.yaml:21,25,32`), declared at
`meta/workflow.yaml:95` and produced by `detect-repo-type` — whose root is undeclared (MH-2). The
monorepo fact now has two variables and the gates read the one whose root is wrong. Guard-confirmed:
untriaged `dead-output`.
*Fix*: keep one authoritative variable — bind `detect-repo-type` to the derived host root and gate on
the survivor, or delete the unread declaration and its Output.

#### Downgraded from High by re-derivation

**MH-1 · `stale-restatement-after-change` · `meta/README.md:81`** — **downgraded to Medium** · **new**

Reproduced as fact: a tree-wide grep for `target-path-scope` returns two hits — the renamed rule
`### orchestrator-component-path-scope` (`agent-conduct.md:96`) and this bare-text citation in a
README table. **No rule by the cited name exists**, so the citation dangles, and `meta/README.md` was
edited by this change (12 lines).
*Why downgraded*: the evidence supports a documentation-hygiene defect rather than a High. The site is
a rule-key inventory inside a README this register elsewhere treats as non-authoritative, it gates no
execution path, and MM-4 already marks that very inventory for deletion — which subsumes the fix. The
`resource-anchors` guard misses it only because it is bare text, not an `.md#anchor` link.

**MH-3 · `complete-bootstrap-path` · `meta/resources/bootstrap-protocol.md:14-18`** — **downgraded to Medium** · **new**

The filed claim — that *neither* hop is reachable from what the prior tools return — is **not
reproduced**. Step 2 (:14) inlines its own operative derivation ("ascend to the outermost repository
that claims the workspace checkout as a submodule, and read `owner/repo` from that host's origin
remote"), so the step is executable without loading the linked technique — even though
`get_technique` / `get_resource` do require a `session_index` that does not exist until step 3, and
`discover` returns only server/version/repo_binding plus the bootstrap body
(`src/tools/workflow-tools.ts:320-331`). The carry instruction at :18 likewise survives in practice:
:16 states that `00-discover-session` applies the same technique again, and an orchestrator holds the
derived fact in its own context rather than needing a `start_session` parameter for it.
*What does reproduce, and why it stays on the surface*: the inlined summary omits the origin-URL forms
that `owner/repo` correctness depends on — `resolve-host-repo.md:48` specifies accepting both the SSH
form `git@host:owner/repo.git` and the HTTPS form and dropping a trailing `.git`, none of which
reaches the pre-session surface. A real incompleteness on the one surface an orchestrator reads before
any session exists, at Medium rather than High.

#### Medium

Rows are as swept unless the **Correction** column says otherwise; corrections come from
spot-confirmation against the cited construct.

| # | Entry | Site(s) | Note | Correction | Attr |
|---|---|---|---|---|---|
| MH-1 | `stale-restatement-after-change` | `meta/README.md:81` | downgraded from High — see above | — | new |
| MH-3 | `complete-bootstrap-path` | `bootstrap-protocol.md:14-18` | downgraded from High — see above | — | new |
| MM-1 | `no-rationale-in-description` | `meta/workflow.yaml:56`; `extract-identifying-context.md:24`; `start-session.md:22`; `00-discover-session.yaml:28` | rationale / gating tails after the WHAT clause | narrowed to 4 sites — `bootstrap-protocol.md:16,18`, `match-saved-session.md:28` and `00-discover-session.yaml:17` are step bullets, a Protocol step and a checkpoint message, not `description` fields | new |
| MM-2 | `variable-description-one-line` | `meta/workflow.yaml:40,43,46,50,53,56` | each multi-sentence with a producer, consumer or gate tail | all six confirmed | new |
| MM-3 | `validate-message-economy` | `02-resolve-target.yaml:58` | trailing consequence paragraph after the cause; no fix command anywhere in the message | confirmed | new |
| MM-4 | `readme-orients-not-transcribes` | `meta/README.md:3,81`; `meta/activities/README.md:5,15,31` | rule-key inventory, checkpoint roster with firing conditions, near-verbatim activity `rules` restatement, count plus prose sequence duplicating the index table | all five confirmed | new |
| MM-5 | `stale-restatement-after-change` | `meta/README.md:20,40` | row 00's role and the `DS → INI` edge label left at the pre-change duty set | diff-confirmed: :20 and :40 untouched while sibling row 02 and the `RT` label *were* rewritten in the same diff | new |
| MM-6 | `technique-ref-in-io-contract` | `preflight.md:14`; `commit-and-persist.md:22`; `select-target-component.md:22`; `extract-identifying-context.md:24`; `start-session.md:22` | I/O descriptions hyperlink a producing or consuming technique | narrowed to 5 sites — `select-target-component.md:26` is a rule citation and `resolve-host-repo.md:28` carries no hyperlink | new |
| MM-7 | `procedure-in-io-contract` | `start-session.md:22`; `resolve-host-repo.md:36`; `select-target-component.md:22`; `extract-identifying-context.md:24`; `preflight.md:18` | sequencing, gating, ranking and prohibition duties inside I/O entries | all five confirmed | new |
| MM-8 | `io-agnostic-contract` | `preflight.md:14`; `commit-and-persist.md:22`; `select-target-component.md:32,36`; `start-session.md:22` | I/O entries naming a workflow-internal producer or the consuming `submodule-selection` checkpoint | `detect-repo-type.md:18` dropped — "left for submodule selection" does not name the checkpoint id | new / pre |
| MM-9 | `no-bind-mechanics-as-prose` | `start-session.md:22`; `resolve-host-repo.md:24` | fallback resolution as prose where it belongs in `variable-binding` or a declared `default` | re-cited from `resolve-host-repo.md:20` (a bare heading) to :24; the same file shows the declared form at :16-18 | new |
| MM-10 | `dotted-rule-address` | `resolve-host-repo.md:8,32,45`; `select-target-component.md:26`; `extract-identifying-context.md:24` | a `## Rules` entry cited with `::`, which addresses an operation; the correct dotted form is in use at `start-session.md:56` | re-cited — the `::` uses are at :32/:45, not :28/:41. Both cited rules are `###` entries under `## Rules` at `version-control/TECHNIQUE.md:36,40` | new |
| MM-11 | `brace-declared-ids` | `02-resolve-target.yaml:7,39,43`; `preflight.md:30`; `detect-repo-type.md:18`; `meta/workflow.yaml:88,101` | declared ids bare or backticked without braces | `:58` removed from the offender list — it braces correctly and is the contrast, with :63 | new / pre |
| MM-13 | `technique-stage-agnostic` | `select-target-component.md:41` | technique Protocol names the `submodule-selection` checkpoint the activity declares at `02-resolve-target.yaml:26` | confirmed | new |
| MM-14 | `session-interaction-in-technique` | `select-target-component.md:41`; `preflight.md:30` | Protocol prescribes human-facing option ordering that no declared output carries, and "surface it to the user" where the activity's `validate` owns delivery | both confirmed | new / pre |
| MM-15 | `contract-not-procedure` | `resolve-host-repo.md:47,49` | Protocol steps 4 and 6 are projections of already-produced outputs; step 6 is verbatim its own Output at :40 | re-cited from :43/:45 (a blank line and real procedure) to :47/:49 | new |
| MM-16 | `pass-orchestration-in-technique` | `commit-and-persist.md:34,35,38,39` | four `Apply` / `::` op invokes inside one technique bound as a step at `03-dispatch-client-workflow.yaml:58`, so each op could be its own step | corrected — these are steps 1, 4, 5 of six plus a fourth Apply at :35, not three contiguous phases | pre |
| MM-17 | `constraint-as-blockquote` | `commit-and-persist.md:35` | indented sub-bullet loads as a disconnected peer step | loader-confirmed: `markdown-technique-loader.ts:192` captures indentation in group 1 and never reads it; the correct `>` form at `start-session.md:53` folds in as continuation | pre |
| MM-18 | `no-duplicated-guidance` | `extract-identifying-context.md:24`; `match-saved-session.md:28`; `select-target-component.md:26`; `meta/workflow.yaml:53` | `version-control/TECHNIQUE.md:40-42` is the declared home, yet all four carry pointer *and* full restatement | confirmed, including the bidirectional pair between `extract-identifying-context` and `match-saved-session` | new |
| MM-19 | `no-false-resource-delivery` | `bootstrap-protocol.md:24` | claims the response carries "the workflow definition"; `workflow-tools.ts:402-419` returns metadata plus activity stubs mapped to `{id, name, required, artifactPrefix}` | harness-confirmed | pre |
| MM-20 | `describe-tool-value` | `bootstrap-protocol.md:24`; `start-session.md:36-48` | mechanics in place of value; Outputs are only `session_index`, `planning_folder_path`, `repo` | all three omissions confirmed against `resource-tools.ts:383-405` — `repo_unbound` (precisely the signal that this change's derivation-plus-fallback contract failed to bind), `planning_slug`, and the workflow metadata block | pre |
| MM-22 | `statement-not-question` | `00-discover-session.yaml:96` | message ends in `?` and re-asks what the option labels at :99/:105 already carry | confirmed | pre |
| MM-23 | `structure-backed-constraints` | `agent-conduct.md:96-98` | MUST/NEVER commit-location rule with no checkpoint, condition or validate backing it; `commit-and-persist.md:46` restates it, also unbacked | confirmed — a grep over `meta/activities/*.yaml` and `meta/workflow.yaml` finds no backing construct | new |
| MM-25 | `hoist-shared-inputs` | `preflight.md:12,16`; `commit-and-persist.md:20,24` | the same input pair declared on two techniques in two different groups | confirmed: `meta/techniques/TECHNIQUE.md` is 8 lines of Capability only, with no `## Inputs`, despite claiming to hold "Shared Inputs, Outputs, Rules, and Errors" | new |
| MM-26 | `state-contract-contribution` | `version-control/TECHNIQUE.md:8` | the group gained the `host-is-derived-component-is-named` invariant but the Capability is unchanged | diff-confirmed (version bump plus appended rule only). Re-cited — the advertisement is at `meta/README.md:3`, not :36, which is inside the Mermaid block | new |
| MM-27 | step-gate-as-prose | `02-resolve-target.yaml:54-58` | "on a resume the saved client `repo_root` MUST name that same directory" is a conditional inside an unconditional `validate` | all three parts confirmed — the step carries no `when`/`condition`, `is_resuming` is declared at `meta/workflow.yaml:82`, and siblings at :25 and :28-38 use the formal gate | new |
| MM-28 | `no-next-step-narration` | `00-discover-session.yaml:22,28`; `02-resolve-target.yaml:39` | routing narrated where `transitions` / `effect.transitionTo` / labels already own it | confirmed, including the factual error: :28 claims aborting means "no session and no planning folder is created", but `bootstrap-protocol.md:20` has already created and bound the meta session before this activity runs | new |
| MM-29 | `no-user-env-mutation` | `work-package/activities/11-validate.yaml:33` | the bind site's message directs the mutating fix: "Install missing toolchain prerequisites before validation" | **narrowed to the bind site.** The `preflight.md` half is refuted — :30 says "Do NOT attempt installation … surface it to the user", and the technique's product is a diagnostic array, not an install. `work-package/workflow.yaml:20`'s boundary is scoped to git config, so it is adjacent rather than the exact converse | pre |

#### Low

| # | Entry | Site(s) | Attr |
|---|---|---|---|
| MM-12 | `boolean-id-shape` — **downgraded from Medium.** `host_binding_mismatch` names the prohibited state and is approved by `setVariable … false`. Downgraded because the sibling-contrast premise is refuted: `workflow_match_ambiguous` (`meta/workflow.yaml:67`) has the same problem-state shape and the same `setVariable … false` approval, so this is not an outlier in its own activity family | `meta/workflow.yaml:54`; `resolve-host-repo.md:38` | new |
| MM-21 | `no-technique-resource-dual-home` — **downgraded from Medium.** The dual home holds, but "character-for-character" is refuted: exactly one sentence is verbatim across `start-session.md:55` and `bootstrap-protocol.md:20`; the rest is paraphrase | `start-session.md:52-56` | pre |
| ML-1 | `avoidance-voice-in-definitions` | `00-discover-session.yaml:125` outcome; `meta/README.md:9,14` | new / pre |
| ML-2 | `procedure-in-capability` | `resolve-host-repo.md:8` — Protocol imperatives restated plus a hyperlink in Capability | new |
| ML-3 | `technique-outputs-declared` | `preflight.md:30` returns `missing-prerequisites`; the declared output is `missing_prerequisites` | pre |
| ML-4 | `paren-invocation-args` | `commit-and-persist.md:34,38` — argument lists outside parentheses with backticked parameter names | pre |
| ML-5 | `no-one-step-rules` | `commit-and-persist.md:56-58` — `no-stale-remote` names the single step it constrains | pre |
| ML-6 | `role-rules-not-description` | `meta/workflow.yaml:53,88` — agent-behaviour prescriptions inside variable descriptions | new / pre |
| ML-7 | `complete-documentation-structure` | `meta/techniques/` has no `README.md`; 11 of 14 reference workflows carry one | pre |

#### Withdrawn by re-derivation

**MM-24 · `no-invented-naming` · `agent-conduct.md:96`** — **withdrawn** · drives no edit

The rename is real: the base ref reads `### orchestrator-target-path-scope`, the branch reads
`### orchestrator-component-path-scope`. But the cited class does not fit. The criteria entry carves
out reuse of an already-established in-repo convention, and the new slug reuses both the existing
`orchestrator-*-path-scope` pattern and the declared variable `component_path`
(`meta/workflow.yaml:99`); a repo-wide grep finds **zero** surviving references to the old slug, so
nothing was invented and nothing dangles. What remains is a rule-id rename, not an invented naming
convention. Whether that rename sits inside this run's approval record is a scope matter for the
[change brief](01-change-brief.md), and the incomplete-search evidence this row rested on is already
carried by MH-1.

#### Resolved during an earlier activity

**MR-1 · input optionality and default form · `resolve-host-repo.md:12-18`** — `workspace_path`
carried its default as trailing description prose with no optionality marker, diverging from the group
sibling form (`push-branch.md:22`) and from the `#### default` sub-section used across the reference
workflows. Rewritten to `*(optional)*` plus a `#### default` sub-section, which also cleared the
guard's `orphan-input workspace_path` rejection since the loader recognises `#### default` as a
producer. `check-technique-template` re-ran clean.

---

### Target: `work-package`

Consumer surface: the sweep ran over all 15 other workflow directories and found 50 references into
16 `work-package` files, **none** of which resolves into a file this run changed. The three changed
files are an activity YAML no other workflow borrows, a standalone technique bound only by
`work-package`'s own `01-start-work-package`, and `workflow.yaml`. An empty changed-file consumer
surface is the recorded result of the sweep, not an unrun sweep.

Counts: 1 Critical · 2 High · 5 Medium · 6 Low.

#### Critical

**WC-1 · `bind-protocol-locals` · `work-package/activities/01-start-work-package.yaml:163`** — **confirmed** · **new**

The `resolve-repo-root` step binds `discovered_path: "{host_repo_path}/{component_path}"`. Neither
name is declared in `work-package/workflow.yaml` (which declares `target_path` :92, `repo_root` :95,
`component_name` :98, `discovered_path` :514), neither is produced by any work-package step, and
neither is inherited — a child session's bag is seeded from its own declared `variables[]` plus
`user_request` alone, so a parent-session value cannot cross the boundary. The authored prose confirms
the cross-session reach it depends on: `repo-root-resolution.md:14` says the value comes "from **the
meta session's** `component_path`". Both interpolations therefore resolve to nothing. The co-change
set for this seam was walked — all three files were edited — but the declaration gap was not closed;
`work-package/workflow.yaml:516` only reworded `discovered_path`'s description.
*Re-derived from*: the bind at :163, the `work-package/workflow.yaml` variable block, and a tree-wide
grep showing both names appear in `work-package` only in description prose and this template.
*Fix*: declare `host_repo_path` and `component_path` in `work-package/workflow.yaml` and seed them
across the session boundary, or bind `discovered_path` from a value work-package already declares.

#### High — confirmed

**WH-1 · `duplicate-shared-capability` + `capability-group-placement` · `work-package/techniques/repo-root-resolution.md:29`** — **confirmed** · **new**

Protocol step 2 re-authors the git superproject-ascent recipe for a capability this same change
created as the shared meta op `version-control::resolve-host-repo`. The two texts are the same recipe:

- `repo-root-resolution.md:29` — "the path is a monorepo component when its parent directory is itself a git repository whose `.gitmodules` declares the path's basename as a submodule `path`. Repeat the test from that parent and keep ascending while it holds, so a component nested more than one level deep resolves to the outermost superproject"
- `resolve-host-repo.md:45` — "Ascend while the current toplevel's parent directory is itself a git repository whose `.gitmodules` declares the current toplevel's basename as a submodule `path`. Each successful test moves the current toplevel to that parent; the outermost superproject wins"

The file names the shared home itself: "This is the same ascent `meta`'s
`version-control::resolve-host-repo` performs at session bootstrap, where it is stated canonically."
The local novelty is only output naming. The carve-out for "the activity binds the shared op as its
own step" does not apply: `01-start-work-package.yaml:158-163` binds `name: repo-root-resolution`, the
local technique, not the shared op. `resolve-host-repo.md` is new in this change (+49 lines, no
base-ref ancestor), so the duplicate was authored knowingly.
*Fix*: delete the local recipe, bind `version-control::resolve-host-repo`, and keep only
caller-specific value assembly locally.

**WH-3 · `worker-rule-reach` · `work-package/workflow.yaml:21-24`** — **confirmed** · **pre**

Four rules — `safety-floor-never-simplified`, `report-before-apply`, `leanness-reported-honestly`,
`complementary-not-duplicative-with-strategic-review` — all command the worker that runs the
lean-coding audit, yet all four sit under `rules.workflow`. **The harness settles it**:
`src/tools/workflow-tools.ts:965` states that a worker receives activity-scoped rules plus
dual-audience `rules.universal`, and that "`rules.workflow` are orchestrator-only". So none of the
four reaches the agent it commands, while the worker-facing `09-lean-coding-audit.yaml:76` says
"Confirm the applied simplifications hold the safety floor" without the floor's definition ever
arriving.
*Correction to the sweep*: the claim that a library-wide grep returns this file alone holds for three
of the four keys, not all four — `safety-floor-never-simplified` also appears at
`ponytail/workflow.yaml:15`. That occurrence strengthens the finding rather than weakening it:
ponytail's version is explicitly structure-backed ("Backed by the safety-floor-cleared blocking
checkpoint and the safety_floor_cleared gate"), which is the shape this one lacks.
*Fix*: move worker-directed rules to `rules.activity` or the owning technique's `## Rules`.

#### Medium

| # | Entry | Site(s) | Note | Attr |
|---|---|---|---|---|
| WH-2 | `io-agnostic-contract` | `repo-root-resolution.md:14`, mirrored at `work-package/workflow.yaml:516` | **downgraded from High.** Reproduced verbatim — the input description names the internal producer down to activity, step and session: "Bound explicitly by `01-start-work-package`'s `resolve-repo-root` step from the meta session's `component_path`, absolutized against `host_repo_path` — not a path the user typed", which is not the exempted intrinsic or external origin. Downgraded for consistency: MM-8 rates this same class Medium on comparable sites and no aggravating factor distinguishes this one. *Fix*: describe what the value is — an absolute path to the component directory under inspection — and drop the internal source naming | new |
| WM-1 | `no-rationale-in-description` | `work-package/workflow.yaml:516`; `repo-root-resolution.md:14,29` | producer/consumer narration and cross-technique rationale where siblings at :505, :509, :512, :519, :522 are terse one-liners | new |
| WM-2 | `variable-description-one-line` | `work-package/workflow.yaml:516` | three sentences on one `description:`, with a bind-site tail and "Its basename becomes `component_name`" | new |
| WM-3 | `technique-stage-agnostic` | `repo-root-resolution.md:29` | "performs **at session bootstrap**" answers where in the workflow flow | new |
| WM-4 | `encode-constraints-as-structure` | `01-start-work-package.yaml:158-163` | absoluteness is a precondition in text only (`repo-root-resolution.md:14`), and a legal state violates it: `component_path` carries `defaultValue: .` (`meta/workflow.yaml:99-102`) and `host_repo_path` has no default, so the template can interpolate to `/.` or an unresolved token. The available structural form sits two steps later at `verify-signing-precondition` (:181-185, `action: validate`) | new |

#### Low

| # | Entry | Site(s) | Attr |
|---|---|---|---|
| WL-1 | `avoidance-voice-in-definitions` | `repo-root-resolution.md:14` — "not a path the user typed", negating the superseded definition | new |
| WL-2 | `procedure-in-capability` | `repo-root-resolution.md:8` — `{repo_root}` / `{component_name}` braces and a prohibition in Capability | pre |
| WL-3 | `validate-message-economy` | `01-start-work-package.yaml:248` — trailing consequence essay | pre |
| WL-4 | `no-valueless-control-set` | `01-start-work-package.yaml:147-157,538-543` — value-less control `set` carrying derivation HOW | pre |
| WL-5 | `no-duplicate-technique-steps` | `01-start-work-package.yaml:562,574` — two adjacent steps bind `naming-conventions`, whose single run produces both outputs | pre |
| WL-6 | `outcome-names-value` | `01-start-work-package.yaml:793` — pure-plumbing outcome | pre |

---

## Coverage

`walked` means the unit's criteria were applied to every file in scope — the 19 changed files across
both targets, read in full and against the base-ref diff, plus the 11 consumer-surface sites, with
sibling-convention comparison against the 14 reference workflows. Whole-surface mechanical coverage of
both targets' 315 files comes from the guard suite, which runs tree-wide.

**No unit is `blocked`, so this walk records no missing coverage.** Two divergences follow.

### Divergence 1 — the enumeration denominator was overstated by 2

Cross-checking the ledger against the criteria homes themselves shows the `anti-patterns` unit count
is wrong. `13` is the raw `## ` heading count, not the anti-pattern category count: it counts
`Creation Rules` (authoring meta-guidance, sitting under `# Overview` rather than `# Catalog`) and
`Authoring Guidance (MR)` (a separate 4-entry `MR-n` series) as if they were AP categories. The real
figure is **11**. The other three homes match exactly.

| Home | Units as swept | Real units | walked | not-applicable | blocked |
|---|---:|---:|---:|---:|---:|
| `workflow-design/anti-patterns` | 13 | **11** | **10** | 1 | 0 |
| `workflow-design/design-principles` | 30 | 30 | 27 | 3 | 0 |
| `workflow-design/schema-construct-inventory` | 6 | 6 | 6 | 0 | 0 |
| `workflow-design/convention-conformance` | 1 | 1 | 1 | 0 | 0 |
| **Total** | **50** | **48** | **44** | **4** | **0** |

The miscount is self-consistent in outcome — one of the two non-categories, `creation-rules`, is
itself the unit the walk marked `not-applicable` — so no criteria surface went unexamined and no
verdict above depends on the denominator. It is recorded because the ledger's arithmetic should be
right before a later pass diffs against it. Two cautions for that pass: the `anti-patterns` figure is
granularity-sensitive in a way the others are not (11 categories versus **130** individual `AP-nn`
entries, so a per-anti-pattern claim would need a very different denominator), and
`design-principles`' 30 is correct only at principle granularity — its raw `## ` count is 31, because
`Overview` is not a principle.

### Divergence 2 — the four `not-applicable` units, each an evidenced negative

| Unit | Reason it does not reach this surface |
|---|---|
| `anti-patterns#creation-rules` | Governs how anti-pattern entries themselves are authored. No file in scope is a criteria home: `grep -rn "^### AP-"` over the 19 changed files and 11 consumer sites returns zero hits; all 130 entries live in `workflow-design/resources/anti-patterns.md`, which this change does not touch and no changed file references. |
| `design-principles#2-internalize-before-producing` | Governs the authoring session's order of work, not authored artefacts. No construct in scope carries evidence of pre- or post-internalisation ordering. |
| `design-principles#23-close-the-loop` | No recommendation-shaped deliverable in scope; the one analysis-to-action seam the change adds (`host_binding_mismatch` → checkpoint) terminates in an explicit `abort-binding` stop gate. |
| `design-principles#28-creation-guide-for-generated-documents` | No changed technique persists a planning artifact — no `#### artifact` declaration exists in any of the 19 changed files. |

---

## Guard results

`npx tsx scripts/check-all.ts --root <target_path>` — 17 guards, 16 pass, 1 fail. Both positional
validators pass per target: `validate-workflow-yaml.ts` against `meta` (5 activities, 133 technique
files) and against `work-package` (111 technique files), and `validate-activities.ts` over the tree
(112 passed, 0 failed).

`binding-fidelity` rejects **3** definition files after the one resolvable failure was resolved
(198 violations total: 70 harmless, 123 fix-later, 0 live bugs, 4 untriaged).

| Rejected file | Guard finding | Register entry |
|---|---|---|
| `meta/techniques/version-control/resolve-host-repo.md` | `dead-output is_monorepo_host` | MH-8 |
| `meta/techniques/cargo-operations/preflight.md` (at its `work-package` bind) | `orphan-input component_path`, `orphan-input host_repo_path` | MC-1 / WC-1 |
| `substrate-node-security-audit/techniques/write-report.md:90` | `read-resolution {target_path}` | outside both targets; pre-existing baseline drift, not attributable to this change |

The two in-target rejections both require a design decision touching this run's open judgements — how
the derived host values cross the meta → client session boundary, and whether `is_monorepo_host` gains
a reader or is withdrawn. They are recorded here for disposition rather than suppressed into
`scripts/binding-fidelity-triage.json`; no entry was added to that file.

---

## Known

74 keys were loaded and compared; **none matched a finding raised above**, so the decision surface is
unchanged by them. They remain readable as suppressions so a later pass can ask whether each
acceptance still holds.

| Source | Keys | Class | Verdicts |
|---|---|---|---|
| `scripts/binding-fidelity-triage.json` | 63 | `dead-output` | 32 `meta` (harmless), 31 `work-package` (fix-later) |
| `scripts/binding-fidelity-triage.json` | 8 | `read-resolution` | 1 `meta`, 7 `work-package` (harmless) |
| `scripts/check-review-mode-gating.ts` `ACCEPTED_HEADLESS_AUTO_ADVANCE` | 3 | `review-mode-headless-auto-advance` | `work-package::codebase-comprehension::comprehension-sufficient`, `work-package::requirements-elicitation::elicitation-complete`, `work-package::research::context-scope-declaration` |

Keys are class-keyed rather than entry-keyed, because both sources name a violation class rather than a
criteria entry. The `audience` and `identifier-qualification` guards are hard-zero with no baseline,
and the planning folder held no prior findings register, so neither contributed keys.

---

## Sources

| Label | Path |
|---|---|
| Change brief | [`01-change-brief.md`](01-change-brief.md) |
| Impact analysis | [`01-impact-analysis.md`](01-impact-analysis.md) |
| Scope manifest | [`06-scope-manifest.md`](06-scope-manifest.md) |
| Session index | [`README.md`](README.md) |
| Edit surface | `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-28-git-derived-host-repo-binding` |
| Harness under co-change | `/home/mike1/projects/dev/workflow-server/src` — evidence for MH-4, MM-17, MM-19, MM-20, WH-3 |
