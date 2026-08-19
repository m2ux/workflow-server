---
target: /home/mike1/projects/dev/workflow-server
date: 2026-08-18
lens: reachability (30)
dimension: Redundant Work
subject: workflows/meta, workflows/work-package, src/, scripts/
corpus: workflows @ 2e8b62970eea (workflows/v0.28.0-123-g2e8b6297); server @ 1297e655
---

# Reachability over meta and work-package

## What this lens measured, and how

Every claim below is mechanical. Three probes were run against the checked-out corpus, all of
them through the server's own loaders rather than a re-implementation of them:

1. **Transition graph.** Every `transitions[].to` and every checkpoint `option.effect.transitionTo`
   in the 20 activity files of the two workflows, resolved against every activity `id:` the loader
   returns, then a breadth-first walk from each workflow's `initialActivity`.
2. **Technique-file reachability.** Every `step.technique`, every activity-level `techniques[]`
   entry and every `workflow.yaml` `techniques.{workflow,activity}` entry across all 21 workflow
   trees, resolved through `readTechnique`'s candidate order including the activity-group shorthand
   (`<activity>::<op>`), plus the two fixed core sets in `src/loaders/core-ops.ts` that the server
   bundles on every `get_workflow` and `get_activity`. The static edges seed a fixpoint that then
   follows relative markdown links and `group::op` identifiers out of every reachable body, because
   an agent can call `get_technique` for any id it learns from prose. `README.md` files are excluded
   as carriers: no tool delivers one.
3. **Gate liveness.** `src/utils/gate-liveness.ts` and `src/utils/binding-provenance.ts` applied
   directly — the same `gateAnswer`, `variablesWrittenIn` and producer scan the delivery path uses,
   over a bag seeded by `seedDefaults`.

**Deadness criterion.** A definition is called unreachable only when it has zero static edges *and*
zero identifier or link references from any body the server can deliver, across all 21 trees. Two
scopes are reported separately throughout: **corpus-wide** (all 21 workflows as roots) and
**in-run** (only meta and work-package as roots), because a file live in one and dead in the other
is a different problem from a file dead in both.

**The false-positive discipline.** Four classes were checked before any claim of deadness and are
called out at each site: a path taken only on error; a path taken only on resume; a path taken only
when another workflow borrows the same file; and a producer that exists but is invisible to static
analysis. Every one of those turned up real instances, and they are reported as live.

## Numbers

| Measure | meta | work-package | Total |
|---|---|---|---|
| Activities loaded | 5 | 15 | 20 |
| Activities unreachable from `initialActivity` | 0 | 0 | **0** |
| Transition edges declared | 4 | 27 | 31 |
| Transition edges that can never be taken | 0 | 2 | **2** |
| Steps | 44 | 266 | 310 |
| Technique steps | 23 | 176 | 199 |
| Gated steps (`when` and/or `condition`) | 26 | 132 | 158 |
| — carrying `when` | 19 | 83 | 102 |
| — carrying `condition` | 7 | 52 | 59 |
| Gates decided entirely by variables with no producer | 0 | 7 | **7** |
| — of those, dead in this workflow but live under a borrower | 0 | 4 | 4 |
| — of those, genuinely constant | 0 | 3 | **3** |
| Technique files (READMEs excluded) | 149 | 111 | 260 |
| Unreachable corpus-wide | 29 | 3 | **32** (15,682 B) |
| Unreachable in a meta/work-package run | 42 | 3 | **45** (31,171 B) |
| Resources (READMEs excluded) | 6 | 36 | 42 |
| Uncited corpus-wide | 0 | 1 | **1** (783 B) |
| Uncited in a meta/work-package run | 1 | 2 | **3** (6,748 B) |
| Artifact-declaring outputs | 1 | 26 | 27 |
| — read by a later activity | — | — | **4 of 27** |
| Exemplar activity YAMLs no transition reaches | 5 | 0 | **5** (7,474 B) |

All 28 guards pass in 1.8 seconds against the corpus carrying every finding below.

---

## Step 1 — Call graph and usage

### 1.1 Every activity is reachable; two edges out of one activity are not

Both transition graphs are fully connected from their entry point. meta's five activities form a
cycle — `discover-session → initialize-session → resolve-target → dispatch-client-workflow →
end-workflow`, with `end-workflow` offering a checkpoint option back to `dispatch-client-workflow`
and `discover-session` offering an abort option straight to `end-workflow`. Neither workflow has an
orphan activity, and neither has a dangling `to:` naming an activity that does not exist.

Two of work-package's 27 transition edges cannot be taken. Both leave `assumptions-review`:

- `assumptions-review → plan-prepare`, gated on `needs_plan_revision == true`
- `assumptions-review → assumptions-review`, gated on `needs_further_discussion == true`

Neither variable has a producer site anywhere in the workflow — no technique output, no output
remap, no checkpoint effect, no `action: set` target, no loop variable — and neither carries a
`defaultValue`. The activity document declares five exits; three of them can be reached. The two
that cannot are the plan-revision loop-back and the further-discussion self-loop, which is to say
the two edges that would let an assumptions review send work backwards. The prior evaluation raised
this class (RED-05) and it is unchanged: the binding guard accepts a declared workflow variable as
its own producer, so both edges pass every check in the suite.

Distinguishing test applied: neither variable is written by a technique bound anywhere in the two
trees, and neither is a session parameter (`user_request` is the only externally seeded name, from
`start_session` and inherited through `dispatch_child`). There is no error path and no resume path
that binds them.

### 1.2 The pattern library: five activity documents nothing reaches, and cannot reach

`workflows/meta/activities/patterns/` holds five exemplar activity documents — `orchestrator-workers`,
`supervisor`, `plan-and-execute`, `isolated-fan-out`, `lead-researcher` — totalling 7,474 bytes and
37 steps, with a 4,231-byte README beside them, 11,705 bytes in all.

Two independent facts make them unreachable:

- **No edge names them.** Their five ids appear nowhere in the corpus except in their own `id:`
  lines and their own descriptions. Across 21 workflow trees there is no `to:`, no `transitionTo:`
  and no `activities:` entry naming any of them, and no `.yaml` file anywhere contains the string
  `patterns/`.
- **The loader cannot see them.** `loadActivitiesFromDir` in `src/loaders/workflow-loader.ts` calls
  `readdir` once and filters each entry through `parseActivityFilename`. A directory entry has no
  `.yaml` extension, so `patterns` is skipped and its contents are never read. meta loads five
  activities, not ten.

They are not, however, structurally unreachable. `resolveActivityReference` accepts a path-shaped
string ref and joins it under the target workflow's `activities/`, so an explicit
`activities: ["meta/activities/patterns/03-plan-and-execute.yaml"]` entry in some workflow's
`workflow.yaml` would resolve and load. The README calls them "borrowable mid-phase patterns". The
accurate statement is therefore not that they are broken but that they are **inventory offered for
borrowing with zero borrowers**, and that the mechanism they are offered through is one no file in
the corpus exercises.

Their cost is not run payload — an unloaded activity file is never delivered. It is that five of
`orchestration-patterns`' fourteen operations are reachable *only* from these documents, and so
inherit their deadness (§1.3).

### 1.3 Thirty-two technique files no delivery path reaches

Corpus-wide, with all 21 workflows as roots and both core technique sets included, **32 of 260
technique files (12.3%) are reached by no static edge and named by no deliverable body** — 29 in
meta (13,209 bytes) and 3 in work-package (2,473 bytes).

**meta, by group:**

| Group | Dead / total ops | Bytes |
|---|---|---|
| `atlassian-operations` | 14 / 23 | 4,089 |
| `orchestration-patterns` | 5 / 14 | 5,019 |
| `knowledge-base-search` | 5 / 5 (whole group) | 1,902 |
| `github-cli-protocol` | 2 / 21 | 715 |
| `gitnexus-operations` | 1 / 17 | 574 |
| `cargo-operations` | 1 / 10 | 496 |
| `version-control` | 1 / 11 | 414 |

**work-package, all three:**

- `finalize-documentation/revise-session-metrics.md` (1,195 B) — a forwarder. Its three citers
  (`resources/session-trace.md`, `conduct-retrospective/retrospective.md`,
  `finalize-documentation/render-token-usage.md`) each link the *meta* op
  `workflow-engine::revise-session-metrics` directly. Nothing links or binds the work-package copy,
  whose whole body is a pointer at the file everyone already points at.
- `manage-git/squash-merge.md` (778 B) — zero references of any kind in 21 trees. Its capability,
  a local signed squash merge, is described from a different angle by
  `manage-git/instruct-merge-strategy.md`, which is bound and which the corpus states is advisory
  and performs no merge.
- `update-pr/push-commits.md` (500 B) — the forked twin of `manage-git/push-commits.md`. The one
  citation of that basename, `manage-git/commit-paths.md:50`, is the relative link
  `[push-commits](./push-commits.md)`, which resolves to the manage-git file. The two have already
  diverged: the manage-git copy declares the `push_remote` input that private-remote mode depends
  on, the update-pr copy does not. The unreachable copy is the one that would push to `origin`.

### 1.4 Why the Atlassian group died: the capability is live and the definitions are bypassed

Fourteen of the 23 `atlassian-operations` ops are unreachable, and the two halves have different
causes.

**Confluence — 8 of 9 ops, 2,114 bytes, capability unused.** `comment-confluence-page-footer`,
`comment-confluence-page-inline`, `create-confluence-page`, `list-confluence-page-descendants`,
`list-confluence-pages-in-space`, `list-confluence-spaces`, `search-confluence` and
`update-confluence-page` have zero references anywhere. Only `get-confluence-page` survives, and
only because the group contract's `verify-after-mutation` rule names it as an example. No workflow
in the corpus writes to Confluence. This is inventory for a product nobody uses.

**Jira — 6 of 14 ops, 1,975 bytes, capability on the hot path.** Four of the six describe exactly
the calls that `work-package/techniques/create-issue.md` makes, in the order it makes them, as raw
tool names in prose:

| Prose in `create-issue.md` | Op that describes the same call | Status |
|---|---|---|
| `getAccessibleAtlassianResources` (lines 48, 68, 101–102) | `resolve-cloud-id.md` (657 B) | never bound; reached only from the group contract's own rule |
| `getVisibleJiraProjects` (lines 69, 102–103) | `list-jira-projects.md` (173 B) | zero references |
| `getJiraProjectIssueTypesMetadata` (lines 103–104) | `list-jira-issue-types.md` (237 B) | named only by `create-jira-issue.md`, itself dead |
| `createJiraIssue` (lines 104–105) | `create-jira-issue.md` (732 B) | zero references |

That path executes on every run where `issue_platform == 'jira'` — seven gates in
`01-start-work-package.yaml` and one in `07-assumptions-review.yaml` turn on it. So 1,799 bytes of
operation definitions sit unreachable beside a four-call sequence that runs, with the sequencing
rules restated in the consumer's own prose.

The control is in the same file. Its GitHub branch reads
`- For GitHub: Apply [view-issue](../../meta/techniques/github-cli-protocol/view-issue.md)` — an
op reference — and that is why only 2 of `github-cli-protocol`'s 21 ops are dead, and why those two
(`add-labels`, `update-pr-title`) are capabilities the corpus genuinely does not use rather than
capabilities it inlines. **Deadness here tracks the citation style of one consumer, not the value of
the capability.**

The same shape explains `knowledge-base-search` entirely. All five files are unreachable, 1,902
bytes, and the group contract is 125 bytes carrying a `## Capability` heading and nothing else — no
inputs, no rules, a container with no contract. The capability is inlined at
`work-package/techniques/research/research.md:29`: "Fetch `concept-rag://activities` resource to
load its index."

And `version-control/identify-path-type.md` (414 B) computes submodule-versus-regular from
`git ls-tree` mode bits. `workflow-engine/commit-and-persist.md:27` decides the same question from
a rule naming literal paths, `version-control.infrastructure-submodule-paths`. The op that would
compute it is unreachable; the prose that guesses it is on the commit hook of every activity.

### 1.5 Thirteen files that are live corpus-wide and dead in these two workflows

Forty-five files are unreachable within a meta or work-package run; 32 are unreachable everywhere.
The 13-file, 15,489-byte difference is entirely explained by other workflows:

- `orchestration-patterns/{TECHNIQUE, dispatch-workers, gather-results}.md` — reached by
  `cicd-pipeline-security-audit` and `substrate-node-security-audit`
- `orchestration-patterns/{classify-request, compose-worker-brief, decompose-work-units,
  invoke-as-tool, plan-steps, synthesise-results}.md` — reached by `workflow-design`
- `gitnexus-operations/{read-cluster, read-process}.md` — reached by
  `substrate-node-security-audit`
- `version-control/derive-workflows-target-path.md` — reached by `workflow-authoring` and
  `workflow-design`
- `version-control/three-dot-name-status.md` — reached by `midnight-system-review`

These are correctly present in the shared meta layer and are not a finding. They are reported
because any prune driven by a meta-and-work-package-only reading would delete nine of the fourteen
`orchestration-patterns` ops that two security-audit workflows and the design workflow depend on.
**A reachability guard scoped per workflow would be wrong; the scope has to be the corpus.**

### 1.6 Every technique reference resolves

All 216 technique references declared in the two trees resolve through the loader. The one apparent
miss, `agent-conduct::orchestrator` in `meta/workflow.yaml`, is a group-prefix rule reference:
`resolveTechniques` expands it to the five rules named `orchestrator-*` in `agent-conduct.md`. The
`refs` guard reports the same, and it is right.

### 1.7 Rule-level reachability: three of fourteen cross-cutting rules reach no agent

`meta/techniques/agent-conduct.md` is 3,881 characters and holds 14 rules under the capability
"Cross-cutting behavioral boundaries for agents". Rules reach an agent only through a reference that
names them, individually or by group prefix. Resolving every reference in the corpus plus both core
sets in `src/loaders/core-ops.ts`:

- Delivered to the orchestrator: `orchestrator-*` (5), `checkpoint-discipline`,
  `operational-discipline-*` (3)
- Delivered to the worker: `checkpoint-discipline`, `operational-discipline-*` (3),
  `file-sensitivity`, `code-commentary-why-not-what`
- **Delivered to nobody: `communication-measured-language`, `communication-artifact-writing-register`,
  `attribution-prohibition`** — 3 rules, 559 characters

The third is the rule that forbids an artifact from narrating which tool produced it. The second is
the rule that binds human-audience artifacts to the Artifact Writing Register — and §3.3 shows the
register itself cannot be fetched from a work-package session. Both halves of that path are broken
independently.

This is not the "dead file" shape. The file is delivered on every activity; three of its rules are
simply not addressed by any reference, and the group-prefix mechanism scopes deliberately so that
worker and orchestrator rule sets do not leak into each other. The omission is that `communication`
and `attribution` are in neither set.

### 1.8 Implementation surface

`src/` holds 55 TypeScript files, 12,628 lines, 425 exported symbols, of which 267 are runtime
exports (function, const or class; Zod schema objects excluded because a sub-schema composed into a
parent in the same file is not dead).

Thirty-two of those 267 have no reference in any other `src/` file, any test or any script.
**Eleven are also unreferenced inside their own file** — nothing anywhere can execute them:

| File | Symbol |
|---|---|
| `src/schema/activity.schema.ts` | `validateActivity` |
| `src/schema/condition.schema.ts` | `safeValidateCondition` |
| `src/schema/state.schema.ts` | `validateState`, `safeValidateState`, `createInitialState`, `addHistoryEvent` |
| `src/schema/technique.schema.ts` | `validateTechnique` |
| `src/schema/workflow.schema.ts` | `validateWorkflow` |
| `src/utils/path-presentation.ts` | `checkoutBasenameFromRepo` |
| `src/utils/session/store.ts` | `_writeSealFromDiskForTests` |
| `src/utils/validation.ts` | `buildMeta` |

Eight of the eleven are throw-on-invalid twins of `safeValidate*` functions that are used; the
codebase settled on the Result-typed form and kept both. `_writeSealFromDiskForTests` is a test seam
with no test — a helper whose only justification is a caller that does not exist. The remaining 21
of the 32 are internal helpers that are exported without need; `src/tools/workflow-tools.ts` alone
exports seven `project*` functions used only by its own dispatch table.

`scripts/` holds 48 TypeScript files. Two committed files appear in neither `package.json` nor the
guard registry in `scripts/guards.ts`, and are named by no other file in the repository:
`analyze-io-protocol-refs.ts` (148 lines, whose own header states it is deliberately absent from the
registry) and `generate-session-token.ts` (210 lines, a legacy-folder migration utility). This is a
reduction on the prior evaluation: `count-workflow-sessions.ts` is now wired as the
`sessions:census` script. Two further files in the working tree, `tmp-gate-census.ts` and
`tmp-scarcity-probe.ts` (377 lines), are untracked residue from the previous evaluation and are not
repository surface.

---

## Step 2 — Stale and shadow state

### 2.1 Seven gates decided entirely by variables that have no producer

A gate whose every read names a variable with no producer site anywhere in the workflow is a
constant for the whole run: its value is fixed at session creation by the declared defaults.
work-package has seven such gates; meta has none.

**Constant true (2):**

| Site | Gate | Why |
|---|---|---|
| `post-impl-review#architecture-summary` | `skip_architecture_summary != true` | declared in `workflow.yaml`, no producer, no default; the read is `undefined`, so the negative comparison always holds |
| `submit-for-review#await-review` | `stealth_mode != true` | default `false`, no producer in this workflow |

`skip_architecture_summary` is the sharper of the two. It is declared, read once, and written
nowhere — so the step it guards runs on every path, and the guard is decoration. There is no option,
no checkpoint and no technique output that can set it, so no run can skip the architecture summary.

**Constant false (5):** four `stealth_mode == true` gates in `13-submit-for-review.yaml`
(`verify-push-remote`, `private-remote-confirmation`, `verify-push-signatures`, `push-confirmation`)
and one `has_open_questions == true` gate in `15-codebase-comprehension.yaml`
(`comprehension-sufficient`).

**Four of the five are load-bearing, and the discriminator is which workflow is running.**
`remediate-vuln` declares `stealth_mode` with `defaultValue: true`, sets it `true` again in its own
`01-start.yaml`, and borrows work-package's activity documents wholesale. In that session all four
gates open and the private-remote verification runs; the `stealth-isolation` guard exists to prove
exactly that path. Running the same probe against `remediate-vuln` confirms it: there,
`stealth_mode` has a producer and the four gates become runtime-variable, while 29 *other* gates in
the same borrowed files turn constant because remediate-vuln's variable set lacks producers
work-package has. Gate constancy is a property of the session's workflow, not of the activity file.

Within a work-package session the sixteen `stealth_mode` conjuncts — 4 positive, 12 negative across
five activities — are all decided the moment the session is created. That is a delivery fact, not a
correctness fault.

**One is genuinely constant, and its producer is invisible rather than absent.**
`has_open_questions` is declared in `work-package/workflow.yaml` with no `defaultValue` and has zero
producer sites. Its writer exists: `15-codebase-comprehension.yaml` binds
`analyse-challenge::run-loop` with the input `residue_flag: has_open_questions`, and
`analyse-challenge/combine.md:80` sets "the residue flag". The bag name travels as a step-binding
**input value**, and `buildProducerIndex` reads binding *output* remaps, technique-declared outputs,
checkpoint effects, `action: set` targets and loop variables — never input values. So the producer
is real at run time and absent from every static model, including the one the server now uses.

The consequence is concrete rather than theoretical. `gateAnswer` will return `false` for that
checkpoint on every work-package delivery: nothing in the activity writes `has_open_questions`
according to the producer scan, and the bag has no value for it, so the negative branch of the
"unbound read" test does not apply and the comparison is evaluated against a missing value. The
same indirection carries three more flags — `has_resolvable_assumptions`, `has_open_assumptions`
(six binding sites each) and `needs_comprehension` (one) — but each of those has an independent
direct producer elsewhere, so only `has_open_questions` is exposed.

### 2.2 What definition PR #468 closed, and what it left

PR #468 (`cf4d0774`, "Close four gates that cannot open") named four. Three of them are in scope
here and all three are confirmed closed:

- `client_workflow_completed` — meta now writes it from a new `record-client-completion` action step
  in `03-dispatch-client-workflow.yaml`, gated `when: current_activity == null`. meta's
  constant-gate count is now **zero**; the session-metrics revision the terminal activity binds can
  now execute.
- The branch-name prefix — `naming-conventions.md` now carries a total five-row mapping and a
  step-local `{$branch_type_prefix}`, so no run reaches branch composition with the prefix
  unresolved.
- `dispatch-prism` in `10-post-impl-review.yaml` — was an action step with `actions: []` and is now
  a technique step binding `workflow-engine::handle-sub-workflow`, with a declared `triggers:`
  entry. The complex-problem path is no longer inert.

The fourth was a `workflow-design` technique's script arguments, outside this lens.

**What remains, after that landing:** three genuinely constant gates in work-package
(`skip_architecture_summary != true`, `stealth_mode != true` at `await-review`,
`has_open_questions == true`), four cross-workflow-live constant gates, and the two dead transition
edges of §1.1. No gate in meta is constant.

### 2.3 Gates the delivery layer cannot decide

Server PR #467 wired `gateAnswer` into `get_activity`, so a gated technique step is now eagerly
bundled when its gate answers true and counted as `lazyFalseGates` or `lazyUnansweredGates`
otherwise. The predicate is sound: it returns `undefined` whenever the activity being delivered
itself writes a variable the gate reads, because the value at activity open is not the value at
step execution.

Measured against that predicate, with a bag holding the declared defaults plus every variable an
earlier activity produces:

| | meta | work-package |
|---|---|---|
| Gated technique steps (own gate, or inside a gated loop) | 12 | 91 |
| Answerable at activity open | 1 | 34 |
| Unanswerable — the same activity writes the read | 11 | 34 |
| Unanswerable — the read is neither defaulted nor produced earlier | 0 | 23 |

meta answers 1 of 12. Every one of its five activities is a self-contained probe-then-branch
sequence, so a gate reads what the activity just wrote — `resume_intent_requested` in
`discover-session`, `is_monorepo` in `resolve-target`, `checkpoint_pending` in
`dispatch-client-workflow`. This is not a defect and it is not fixable by bundling: the information
does not exist when the payload is assembled.

work-package answers 34 of 91. `01-start-work-package.yaml` alone contributes 21 of the 34
same-activity cases, because it detects review mode, issue platform, issue type, branch name and
worktree state and then branches on all five inside one activity. That single activity is where
gate-aware bundling has the least to work with and where the ordering work of PRs #470/#471 was
aimed.

### 2.4 An instrument that records twenty findings, all twenty of them harness artefacts

Server commit `2e502519` added `gatesReadUnbound` to the end-to-end walker: for each step it calls
`unboundPositiveReads` and records a `step:variable` pair when the named variable is decided by a
checkpoint of the same activity and is absent from the walk's bag.

The committed snapshots hold 79 such records across six walk policies. Six are non-empty, all in
`start-work-package`, carrying 20 distinct pairs on two variables: `is_review_mode` (11) and
`issue_platform` (9).

**All 20 name a variable that has a declared producer positioned before the reader.**
`review-mode-detection.md` declares `is_review_mode` as an output; `issue-reference-detection.md`
declares `issue_platform`. The walker's bag applies only explicit `action: set` values —
`walker.ts:454` — and never technique outputs, so `unboundPositiveReads` reports every gate on a
technique-produced variable. `activityDecidedVariables` is position-independent, so a read
positioned *after* the deciding checkpoint is recorded too.

The record is diagnostic: it is asserted only by snapshot equality, so nothing fails. The net
position is that the instrument built to separate "a gate that had nothing to read" from "a gate
that read no" currently emits 20 entries with a confirmed true-positive count of zero, and offers
the reader no way to tell which is which. That is the same shape the prior evaluation named for the
binding triage register, arrived at from the other direction.

Separately, the walk baseline's corpus stamp fails on the current checkout: the snapshots were
stamped at workflows `72db28ae` and the checkout is `2e8b6297`. The two trees are byte-identical
(`git diff` is empty), so the six walks are content-current and only the stamp is unrun — but the
test that exists to tell corpus drift from code regression is red, and it will stay red until
`baseline:stamp` runs in the merge commit.

---

## Step 3 — Structural deadness

### 3.1 Zombie Override: a forwarder, a fork and a phantom output

Three instances of a definition that shadows a live twin and is never invoked through it.

**The forwarder.** `work-package/techniques/finalize-documentation/revise-session-metrics.md`
(1,195 B) exists to say that the authoritative operation is the meta one. Its three citers all link
the meta file, not this one. `meta/activities/04-end-workflow.yaml:12` binds
`workflow-engine::revise-session-metrics` directly. The work-package copy declares two outputs —
`token_usage_document` and `session_trace_document` — that no step binding can ever produce, because
no step binds the file.

**The fork.** `update-pr/push-commits.md` and `manage-git/push-commits.md` share a basename and have
diverged. Only the manage-git copy is bound (`13-submit-for-review.yaml:175`); only the manage-git
copy declares `push_remote`, the input private-remote mode sets to keep commits off a public
destination. The unreachable copy hard-codes "the remote feature branch". The one relative link to
the basename resolves to the live file, so the fork is invisible to the link checker and to the
reader.

**The phantom output.** `work-package/techniques/strategic-review/TECHNIQUE.md:46` declares an
output `architecture_summary_doc` with `#### artifact: architecture-summary.md` and
`#### audience: human`. That declaration is a group contract, so it is composed into every one of
the group's seven operations. No operation in the group produces it. The file it names is written by
a different technique, the standalone `summarize-architecture.md`, under a different bag name,
`architecture_summary`. One artifact, two declared names, one producer, and the name with no
producer is the one seven operations inherit.

### 3.2 Phantom Configuration: artifacts with no in-run consumer, and why that is mostly correct

Twenty-seven outputs across the two trees declare an artifact filename. **Every one of them declares
`audience: human`.** Tracing each to its producing activity and looking for a reader in any later
activity — a technique input declaration, a `{name}` interpolation, a gate, a transition condition —
finds a later reader for **4 of 27**. Eight more are read only inside the activity that produced
them; the remaining fifteen are terminal.

This is not deadness and it must not be reported as such. An `audience: human` artifact's reader is
a person; the `audience` guard exists precisely so that reader is declared rather than assumed, and
it passes. The completion document, the token-usage artifact and the session trace are the outputs
of the run, not intermediate state.

The three cases inside that set that *are* reachability findings:

- `architecture_summary_doc` (§3.1) — a declared artifact with no producer at all.
- `summarize-architecture` is bound twice, at `post-impl-review#architecture-summary` and
  `strategic-review#create-architecture-summary`, and both bindings write
  `architecture-summary.md`. The second overwrites the first, and the first is behind the
  constant-true `skip_architecture_summary != true` gate, so both always run.
- `review-test-suite` is bound four times across two activities and declares two artifacts; neither
  is read by anything after `validate`.

No artifact in either tree declares `audience: agent`, so there is no case of state written for a
later agent that no later agent reads. That whole failure class is empty.

### 3.3 Orphaned Handler: resources the run cannot fetch

**One resource id extracted from a technique body in the two trees resolves to no file.**
`work-package/techniques/manage-artifacts/TECHNIQUE.md:95` writes
`[Artifact Writing Register](../../../meta/resources/writing-register.md)`.
`extractResourceIds` slices the href after its last `resources/` segment, yielding the bare slug
`writing-register` and dropping the `meta/` prefix; `qualifyResourceId` then leaves a bare id alone
because the technique's workflow and the delivering workflow are both `work-package`. The delivery
layer therefore looks for `work-package/resources/writing-register.md`, which does not exist, and
`readResourceRaw` has no meta fallback — it resolves only under `<workflowId>/resources/`.

The register is 2,155 bytes and lives at `meta/resources/writing-register.md`. `manage-artifacts` is
bound at seven steps across three activities, and its contract is the one that tells a worker where
every human-audience artifact's register lives. So the rule fires, the pointer is delivered, and the
content cannot arrive. This is the residue of the class the prior evaluation priced at 5,631
characters (CTX-07); server PR #467 closed the rest, and this one link shape — a cross-workflow
relative path rather than a wrong-workflow qualification — survives it.

**Three resources are cited by nothing a meta or work-package run delivers**, 6,748 bytes:

- `work-package/resources/readme.md` (641 B) and
  `work-package/resources/readme-deprecated-notice.md` (783 B) form a two-file redirect chain. The
  notice describes itself as a "redirect stub that points loaders at `readme`"; `readme` points at
  the meta template and the work-package seed profile. The only file citing either is
  `work-package/resources/README.md`, the human index, which no tool delivers. Corpus-wide, the
  notice is cited by nothing at all. Both are dead.
- `meta/resources/workflow-canonical.md` (5,324 B) is cited by `meta/README.md` and the repository
  README. It is an authoring ontology consumed by `workflow-design` and `workflow-authoring`, not
  run material, so it is out of scope for these two workflows rather than dead.

**One resource is reachable but unextractable.** `work-package/resources/readme-seed.md` (6,142 B)
is referenced only as a step-binding input value — `seed_profile: work-package/readme-seed` at
`01-start-work-package.yaml:495` and `12-strategic-review.yaml:61`. `extractResourceIds` scans
technique bodies for `resources: [...]` arrays and markdown links, and sees neither, so the file is
never eagerly bundled and never appears in a `resource_refs` list. The worker reaches it only by
taking the input value and calling `get_resource` with it. It works; it is invisible to every static
resource-reachability model, including the one used for this report before the binding values were
read by hand.

### 3.4 The one seeding path that only exists as an error branch

`workflow-engine::create-readme` is bound once in work-package, at `01-start-work-package.yaml:493`.
`verify-readme-conforms` is bound once, at `12-strategic-review.yaml:59`, and its protocol reads:
"Read `{planning_folder_path}/README.md`. If absent, re-apply
[create-readme](./create-readme.md) with the bound `{seed_profile}`".

That second path is reachable only on the error branch of a verification step eleven activities
later. It is live and correctly so — a resume into a folder whose README was never written needs it —
and it is called out here because it is the clearest example in the corpus of a path that a
naive reachability reading would call dead and that is in fact the recovery arm of the only
verification of the planning folder's entry point.

---

## What is dead, what only looks dead

| Claim | Verdict | Discriminator applied |
|---|---|---|
| 5 pattern activity YAMLs, 7,474 B | Unreached; borrowable by an explicit `activities:` path ref with zero borrowers | non-recursive loader plus a corpus-wide search for the five ids and for `patterns/` |
| 32 technique files, 15,682 B | Dead corpus-wide | zero static edges and zero identifier or link references in any deliverable body across 21 trees |
| 13 further technique files, 15,489 B | Live — reached only from five other workflows | corpus-wide root set, not a per-workflow one |
| 4 `stealth_mode == true` gates | Live — open on every `remediate-vuln` run | probe re-run against the borrowing workflow |
| `has_open_questions == true` gate | Constant false to every static model; live at run time | the producer travels as a step-binding input value the producer scan does not read |
| `skip_architecture_summary != true` | Constant true, no producer exists | zero producer sites, no default, one reader |
| 23 of 27 artifacts with no later reader | Correct — every one is `audience: human` | audience declaration, which the guard already enforces |
| `create-readme` via `verify-readme-conforms` | Live — an error-recovery branch | read the protocol rather than the binding graph |
| `writing-register` resource | Unreachable from work-package | extractor drops the `meta/` segment; `readResourceRaw` has no cross-workflow fallback |
| 20 `gatesReadUnbound` records | All harness artefacts | each named variable has a declared technique-output producer positioned before the reader |
| 11 src exports, 2 scripts | Dead | zero references in `src/`, `tests/`, `scripts/`, and none inside their own file |

## What a reachability guard would have to implement

Nothing in the 28-guard suite measures definition reachability, and the corpus passes all 28 while
carrying every finding above. `check-prism-lens-reachability.ts` is the closest precedent and proves
the shape is affordable — it is a per-workflow lens-routing check, not a corpus-wide edge walk.

A guard covering this lens needs four edge kinds that no existing guard implements, in this order of
difficulty:

1. **Static bindings with the activity-group shorthand.** A bare `technique: document` in activity
   `research` resolves to `research::document` first and `document` second. Reading only the literal
   string mis-reports 19 work-package files as dead; this analysis did exactly that on its first
   pass.
2. **The two core sets.** `CORE_ORCHESTRATOR_TECHNIQUES` and `CORE_WORKER_TECHNIQUES` in
   `src/loaders/core-ops.ts` are roots the definitions never name. Omitting them mis-reports the
   whole `harness-compat` group and six `workflow-engine` ops.
3. **Prose identifiers and relative links, to a fixpoint.** An agent can call `get_technique` for
   any id it reads. Excluding `README.md` as a carrier matters: it is what separates the
   `knowledge-base-search` group's true deadness from an apparent reference.
4. **Corpus scope, not workflow scope.** Nine `orchestration-patterns` ops are dead in meta and live
   in three other workflows.

Two properties the guard would report that no existing check can:

- a group contract declaring an output no operation in the group produces (§3.1);
- a resource id that the delivery path extracts and cannot resolve (§3.3), which is the one finding
  here that costs a running worker content rather than costing a maintainer attention.

## Standing conclusion

The reachable surface of these two workflows is sound. Every activity is reachable, every technique
reference resolves, no artifact is written for an agent that never reads it, and meta now has no gate
that cannot open. What remains is 32 unreachable technique files, 3 constant gates, 2 untakeable
transition edges, 3 undelivered conduct rules, 2 dead resources and 1 resource the delivery path
cannot fetch — 15,682 bytes of technique surface and 2,938 bytes of resource and rule surface, none
of it on the wire, all of it maintenance load.

The single strongest pattern is that deadness in this corpus is caused by inlining, not by
obsolescence. The Jira creation sequence, the knowledge-base search, and the submodule-path
predicate are all live capabilities whose operation definitions are unreachable because one consumer
restated the calls in prose instead of applying the ops. The same file's GitHub branch, written the
other way, keeps 19 of 21 `github-cli-protocol` ops alive. Deadness here is a citation style, and
the fix is a citation, not a deletion.
