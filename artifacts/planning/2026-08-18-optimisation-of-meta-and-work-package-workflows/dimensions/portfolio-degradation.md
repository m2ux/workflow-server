# Redundant Work — Degradation

Redundant work in these two trees is not a static tax. It is a population with a birth rate and no death rate, and the mechanism that decides whether a given file is checked is the same mechanism that decides whether a run reaches it. That coupling is the subject of this lens: what happens to the surplus when nobody touches it.

The build measured here is the corpus at `workflows@2e8b6297` (2026-08-18), server at `1297e655`, after PRs #467/#471 (server) and #468/#470 (definitions). All 28 registered guards pass in 2.4 s against it. Every count below is measured against that tree unless the sentence says otherwise.

---

## 1. The concrete problems

### 1.1 Sixty-two per cent of the shared library is outside binding resolution

`meta/techniques/` holds 139 operation files (excluding the 11 `TECHNIQUE.md` container contracts and 1 `README.md`). `work-package/techniques/` holds 94 (excluding 18 `TECHNIQUE.md` and 1 `README.md`). Classifying every one of those 233 files by the strongest reference that reaches it — a step binding or a `techniques[]` entry anywhere in the 17-workflow corpus, then the server's own hardcoded list, then an unborrowed pattern activity, then a bare inline markdown link, then nothing:

| Reached by | meta | work-package |
|---|---:|---:|
| An activity step binding or a `techniques[]` entry | 58 | 87 |
| Only `src/loaders/core-ops.ts` (a list in the server repo) | 14 | 0 |
| Only `meta/activities/patterns/` (which no workflow borrows) | 10 | 0 |
| Only an inline markdown link inside another file's prose | 36 | 4 |
| Nothing at all | 21 | 3 |
| **Total operation files** | **139** | **94** |

Only the first row is inside `check-binding-fidelity`'s resolution check — the guard that proves a technique reference points at a file that exists. That is 145 of 233 files, 62%. The other 88 are reached, if at all, by a mechanism no guard resolves.

The distinction between the rows matters more than the totals, because the rows have different decay behaviour:

- **The 14 server-tethered files** are load-bearing and invisible. `src/loaders/core-ops.ts` names 24 corpus technique refs as string literals — 8 in `CORE_WORKER_TECHNIQUES`, 16 in `CORE_ORCHESTRATOR_TECHNIQUES`. Six of them (`harness-compat::*`) are guarded by `check-harness-adapter-set`, which imports the constant directly (`scripts/check-harness-adapter-set.ts:40`). The other 18 are proved only by `tests/e2e/definition-lint.test.ts`, which walks `work-package` under six policies and asserts the server reported no unresolved refs. The file's own comment records that this rot has already happened once: "(The former 'persist'/'bubble-checkpoint-up' refs were stale — no such op files.)" (`src/loaders/core-ops.ts:33-34`).
- **The 10 pattern-only files** are the `orchestration-patterns` ops bound exclusively from `meta/activities/patterns/*.yaml`. Zero workflow.yaml in the corpus borrows a pattern activity — a grep for `meta/patterns` across all 17 `workflow.yaml` files returns nothing, while `remediate-vuln/workflow.yaml:326-340` shows the borrow mechanism working for 14 work-package activities. So these 10 files, 16,941 bytes of `orchestration-patterns/` and 11,673 bytes of `patterns/`, are bound only from definitions that never load.
- **The 40 inline-link-only files** are reachable by an agent that follows an "Apply [x](../path/to/x.md)" instruction in a delivered Protocol. The loader does not re-resolve inline references; they are shipped as text.
- **The 24 files reached by nothing** are 10,593 bytes / 1,428 words. Thirteen are Confluence and Jira list/search operations in `meta/techniques/atlassian-operations/`; the rest are single strays (`cargo-operations/build-dev.md`, `github-cli-protocol/add-labels.md`, `github-cli-protocol/update-pr-title.md`, `gitnexus-operations/rename.md`, `knowledge-base-search/broad-chunks-search.md`, `knowledge-base-search/load-domain-index.md`, `orchestration-patterns/invoke-as-tool.md`, `version-control/identify-path-type.md`) plus three in work-package.

Some of that dark set is a deliberate library. The binding triage says so in its own words: `shared-op-return-contract` — "Library ops are bound ad hoc by any workflow, so having no consumer inside the corpus is the expected state of a library." That rationale carries 35 of the 70 triage entries. The problem is not that a library exists; it is that "library" and "abandoned" have the same signature, and the guard has been told to treat that signature as acceptable.

### 1.2 The three work-package files reached by nothing are the losing halves of duplicated pairs

Four operation basenames exist in both trees, and three exist twice within work-package:

| Basename | Copies | Which copy is unreached |
|---|---|---|
| `revise-session-metrics.md` | `meta/techniques/workflow-engine/`, `work-package/techniques/finalize-documentation/` | the work-package copy |
| `push-commits.md` | `work-package/techniques/manage-git/`, `work-package/techniques/update-pr/` | the `update-pr` copy |
| `create-pr.md` | `meta/techniques/github-cli-protocol/`, `work-package/techniques/update-pr/` | both reached |
| `mark-ready.md` | `meta/techniques/github-cli-protocol/`, `work-package/techniques/update-pr/` | both reached |
| `analyze.md` | `meta/techniques/gitnexus-operations/`, `work-package/techniques/implementation-analysis/` | both reached |
| `document.md` | `design-philosophy/`, `implementation-analysis/`, `research/` | all three reached |
| `reconcile.md` | `research/`, `review-assumptions/` | both reached |

`work-package/techniques/finalize-documentation/revise-session-metrics.md` and `work-package/techniques/update-pr/push-commits.md` are two of the three work-package files nothing reaches. Both are the second copy of an operation that already exists elsewhere in the corpus. The first, worse, is that `finalize-documentation/revise-session-metrics.md` contains two inline links back to `../../../meta/techniques/workflow-engine/revise-session-metrics.md` — a file that duplicates its own name and delegates to the original.

The reached duplicates are worse than the unreached ones, because they diverge under load rather than sitting still. `meta/techniques/github-cli-protocol/mark-ready.md` and `work-package/techniques/update-pr/mark-ready.md` already differ on every structural axis: the meta copy declares an input (`pr_number`) and two flat outputs (`pr_url`, `pr_status`); the work-package copy declares no inputs, one output (`updated_pr`) with the same two values nested one level below it, and a Protocol whose entire body is "Apply [mark-ready](../../../meta/techniques/github-cli-protocol/mark-ready.md) with `repo_path` `{target_path}` and `{pr_number}`". Two contracts, two version numbers (1.1.1 and 1.1.1, coincidentally equal today), one operation. `create-pr.md` has already drifted further: meta at 1.1.1, work-package at 1.3.0, with different capabilities, different input sets, and different first Protocol steps.

### 1.3 The pattern exemplars are outside every guard

`meta/activities/patterns/` holds five activity YAML files plus a README, 11,673 bytes. `validate-activities` reports 117 activities; the corpus holds 122 `activities/**/*.yaml` files. The five it does not validate are exactly these, because the script reads `<workflow>/activities` non-recursively (`scripts/validate-activities.ts:109-110`) and cannot be pointed at the subdirectory at all — invoked against `workflows/meta/activities/patterns` it answers "A workflow directory must contain an 'activities' subfolder."

Two guards explicitly compensate. `check-binding-fidelity` recurses, with a comment naming the gap it closes: "this guard used to mirror that — which left `meta/activities/patterns/` completely unmeasured, so its step bindings and the outputs its loop conditions consume were invisible in both directions (#327 S2)" (`scripts/check-binding-fidelity.ts:433-436`). `check-set-action-values` recurses for the same stated reason (`scripts/check-set-action-values.ts:141-142`). The compensation is per-guard and manual: 26 other guards have not been told.

Injecting `kind: bogus-kind` into `meta/activities/patterns/01-orchestrator-workers.yaml` and running the full sweep against the mutated corpus produces **28 pass, 0 fail**. The directory whose purpose is to be copied by future authors is the one directory whose schema conformance nothing proves.

### 1.4 The anchor guard cannot see the link form the corpus mostly uses

`check-resource-anchors` states its own scope: "External links (scheme://), pure file links (no `#`), and non-`.md` targets are ignored" (`scripts/check-resource-anchors.ts:13`). Measuring relative `.md` links in the two trees:

| | meta | work-package |
|---|---:|---:|
| Markdown links total | 437 | 631 |
| Relative `.md` with an anchor (guarded) | 103 | 256 |
| Relative `.md` with no anchor (unguarded) | 276 | 264 |
| Cross-tree relative `.md` links | 0 | 139 |
| …of those, anchor-free | 0 | 129 |
| Targets that do not exist on disk today | 2 | 41 |

Corpus-wide, 272 markdown-link targets are bound by no step and linked only without an anchor. Every one of them is a pointer an agent is instructed to follow at runtime and that no tool proves resolves.

The cross-tree column is the concentrated risk. work-package reaches into meta by relative path 137 times and into `prism` twice, at depths of two and three `../` segments — `work-package/techniques/review-assumptions/reconcile.md` alone carries six such links into `meta/techniques/gitnexus-operations/`. 129 of the 139 carry no anchor. The injection matrix separates the two cases cleanly: renaming `meta/resources/writing-register.md` (linked from work-package **with** `#prose`) fails two guards; renaming a meta technique file that only anchor-free links reach fails none.

The 41 non-existent targets in work-package are mostly template placeholders (`NN-work-package-plan.md`, `{codebase_area}.md`) that resolve at runtime against a planning folder, and 3 of them carry anchors that the guard nonetheless passes. That is the same blind spot from the other side: a guard that ignores a whole link class also cannot tell a placeholder from a rotted path.

### 1.5 Two suppression files, no expiry, one of them 183 commits behind its subject

`scripts/binding-fidelity-triage.json` holds 70 entries, every one `harmless`: 38 `dead-output`, 23 `orphan-input`, 9 `read-resolution`. Thirty-three of the 38 dead-output entries are in `meta/` — the suppressions concentrate precisely in the library tree that section 1.1 shows is mostly unreached.

It pins `corpusSha: 3569e937`, a merge from 2026-07-31. Since then the corpus has moved 183 commits and 499 files, 7,525 insertions and 3,445 deletions. The guard notices and says so:

```
binding-fidelity: 70 violation(s) — 70 harmless, 0 fix-later, 0 live bug(s), 0 untriaged
binding-fidelity: triage verdicts were made against corpus 3569e93786d3, the checkout is at 2e8b62970eea — 183 corpus commit(s) since
binding-fidelity: OK — no live or untriaged binding defects (70 triaged as accepted debt)
```

That middle line does not survive the sweep. `check-all`'s table takes "the last non-empty stdout line" per guard (`scripts/check-all.ts:80-82`), which is the `OK` line. CI runs `npm run check:all`. The staleness signal exists, is correct, and is structurally invisible on the only path that runs in CI.

Two further leaks inside the same file:

- Sixty-eight distinct keys for 70 entries. `findingKey` strips a trailing `:<line>` and joins `(check, site, detail)` (`scripts/guard-protocol.ts:53-58`); `applyTriage` builds `new Map(triage.entries.map(e => [violationKey(e), e]))` (`scripts/check-binding-fidelity.ts:778`). Two entries — both `read-resolution` on `work-package/techniques/manage-git/TECHNIQUE.md`, for `{display_name}` and `{email}` — are shadowed by an identical key. A shadowed entry is not in the map, so it can never be reported stale. It is a suppression that outlives its subject by construction.
- Twelve rationales declared, eight used. `undeclared-seed`, `terminal-product-unconsumed`, `external-tool-syntax` and `test-fixture-pins-the-defect` describe nothing. The guard reports a stale *entry*; nothing reports a stale *rationale*.

`workflows/section-framing-triage.json` holds 107 entries, all `orientation-only`, all `harmless` — 24 in `work-package/resources/`, 3 in `meta/resources/`. The file declares a second verdict, `operative-owed-a-section`, for "real debt: suppressed here and counted". It has zero entries. The debt counter has never been used, so the file's only observable function is suppression.

The repo also contains the counter-example, which is what makes the asymmetry a finding rather than a preference. `tests/e2e/__snapshots__/corpus-sha.json` pins `72db28ae` — current — and a mismatch fails the test suite with both SHAs named (`docs/development.md:386-394`). Two corpus pins, opposite policies, same repository. `docs/development.md:396` describes the triage as carrying "69 verdicts"; it carries 70.

### 1.6 Gates that cannot move, and gates whose mover lives elsewhere

Evaluating every gate in both trees against the declared-default bag, and treating a gate as decidable only when no step, checkpoint effect, fragment effect, technique output or loop variable anywhere in the corpus writes any root it reads:

| | meta | work-package |
|---|---:|---:|
| Gate sites (`when`, step `condition`, fragment `condition`, transition `condition`) | 27 | 146 |
| Always true on defaults alone | 0 | 2 |
| Always false on defaults alone | 0 | 6 |

meta is clean: all 27 gates read something the workflow writes.

The six always-false gates in work-package split into two populations. Four read `stealth_mode` — declared at `work-package/workflow.yaml:570` with `defaultValue: false` and written by no work-package step. It is seeded by `remediate-vuln`, which borrows 14 work-package activities, and `check-stealth-isolation` proves the isolation property for that workflow. Those four are rare-but-load-bearing. Twenty-two gate sites in total read `stealth_mode`, so 22 conditions in work-package are decided by a contract with an owner in another tree and no declaration of that fact anywhere in work-package.

The other two are dead:

```
assumptions-review → plan-prepare       when needs_plan_revision == true
assumptions-review → assumptions-review when needs_further_discussion == true
```

(`work-package/activities/07-assumptions-review.yaml:141-152`.) Both variables are declared at `work-package/workflow.yaml:316` and `:320` with `defaultValue: false`; a corpus-wide grep finds them in exactly three places each — the declaration, the transition, and `remediate-vuln`'s inherited declaration. Nothing writes them. The rework transition out of assumptions review and the self-loop back into it cannot fire in any run of any workflow.

Of the two always-true gates, `submit-for-review [await-review] when: stealth_mode != true` is live for `remediate-vuln`. The other is not: `post-impl-review [architecture-summary] when: skip_architecture_summary != true` (`work-package/activities/10-post-impl-review.yaml:139`) reads a variable with no writer anywhere, in the negative form that absence satisfies. The gate is open on every run and cannot close. PR #468 closed four gates that could not open; three remain — two that cannot open and one that cannot close.

A fourth, `codebase-comprehension [comprehension-sufficient] condition: has_open_questions == true`, looks dead to a static producer scan and is not. Its writer is named by an argument:

```yaml
technique:
  name: analyse-challenge::run-loop
  inputs:
    convergence_flag: needs_comprehension
    residue_flag: has_open_questions
```

(`work-package/activities/15-codebase-comprehension.yaml:59-67`.) The loop writes whichever bag entry `residue_flag` names. Two of work-package's 146 gates depend on a producer that exists only as a string in an input map, and 11 declared variables appear in the corpus solely as technique-input values. No guard follows that indirection, in either direction.

### 1.7 The version field on every definition file is decorative half the time

Every technique file must carry `metadata.version` (`scripts/check-technique-template.ts:109`), and every technique delivery includes it (`src/loaders/technique-loader.ts:36`). Nothing checks that it moves when the body does. Counting, per file, commits that changed it against commits whose diff for that file also touched a `version:` line:

| | Files | Content commits | Commits that also bumped the version | Rate |
|---|---:|---:|---:|---:|
| meta activities | 10 | 53 | 31 | 58% |
| meta techniques | 150 | 726 | 385 | 53% |
| work-package activities | 15 | 170 | 95 | 56% |
| work-package techniques | 112 | 919 | 320 | **35%** |

Sixty of the 220 definition files with three or more commits have bumped their version at most once. `work-package/techniques/naming-conventions.md` has 13 commits and 2 version touches — one of them #468's. `work-package/techniques/assess-ticket-completeness.md`: 9 and 1. `work-package/techniques/codebase-comprehension/survey.md`: 9 and 1.

The same drift is visible at the workflow level, where it is checkable against a single line:

| Declaration | README claim |
|---|---|
| `work-package/workflow.yaml:3` → `3.44.0` | `work-package/README.md:3` → `v3.35.2` |
| `meta/workflow.yaml:3` → `5.22.0` | `meta/README.md:3` → `v5.12.0` |

Nine and ten minor versions behind respectively.

### 1.8 A 443-line parallel representation of the step graph, with a disjoint vocabulary

`work-package/activities/README.md` contains 15 mermaid flowcharts: 206 edges over 155 node ids and 173 distinct node labels. The YAML it describes holds 235 step ids across 15 activities and 25 transitions.

Eleven of the 173 diagram labels normalise to a real step id. Eighty-nine of the 235 step ids are traceable anywhere in the 443-line document, by any spelling. The diagram's naming vocabulary is independent of the definition's, so there is no mechanical way — and no cheap manual way — to establish whether a given chart is current.

The top-level chart in `work-package/README.md:43-86` is checkable, and diverges. It shows `design-philosophy` fanning through a `PATH{"workflow path?"}` diamond into four destinations; `work-package/activities/02-design-philosophy.yaml:149-151` declares exactly one transition, `codebase-comprehension`, default. It shows `PIR --> BLK{"critical blocker?"} -->|"yes"| IMP`; `post-impl-review` has one transition, to `validate`. It shows `REL --> RS` as requirements-elicitation's only exit; the YAML gives it three, including a self-loop. The review-mode flow line at `work-package/README.md:120` lists `start-work-package → design-philosophy → implementation-analysis → …`, an edge the transition table does not contain in any mode.

### 1.9 Three narratives of review mode, one definition

`work-package/README.md:95-125` describes review mode in prose (31 lines, including a nine-row override table). `work-package/REVIEW-MODE.md` describes it again in 12,846 bytes under 11 headings, including its own "Activity Overrides Summary" and "Review Mode Flow". `work-package/resources/review-mode.md` is the operational resource, 21,574 bytes under 40 headings, and is the only one of the three a run delivers. `REVIEW-MODE.md` is referenced exactly once in the corpus, from the README line that points at it. The behaviour it documents lives in 22 `stealth_mode` gates, an `is_review_mode` boolean, and `scripts/check-review-mode-gating.ts` — none of which read it.

### 1.10 A tombstone with no expiry

`work-package/resources/readme-deprecated-notice.md` is a redirect stub: "Consolidated into [readme](./readme.md) as of v2.0.0." It is referenced by no technique, no activity, no step, and no other resource — only by the index row in `work-package/resources/README.md:11` that lists it as a "Redirect stub". Its content last changed in `0195a44d` (#272). Its own text still explains a `START-HERE.md` → `README.md` rename. `check-artifact-guides` reports "every persisted artifact filename maps to a creation guide, none triaged as owing one" — a resource that guides nothing is not in its domain.

### 1.11 Twenty-seven bindings that resolve only because two names agree

`composeActivityTechnique` resolves a bare technique ref against `<activityId>::<op>` first, and on failure falls back to the ref as authored (`src/loaders/technique-loader.ts:631-646`). In work-package, 68 of 176 step bindings are bare. Splitting them by the route that actually resolves them: 27 resolve through the activity-group convention, 40 as a workflow-local standalone file, 1 through the meta shared layer.

The 27 span seven activities whose ids must equal a directory name under `techniques/`: `design-philosophy`, `requirements-elicitation`, `research`, `implementation-analysis`, `plan-prepare`, `strategic-review`, `codebase-comprehension`. Three basenames are duplicated across those directories — `document` in three of them, `reconcile` in two — so the identity of the file a bare ref reaches is decided entirely by the activity id.

Today the fall-through is safe: no workflow-local `document.md` or `reconcile.md` exists, so a broken shorthand errors. That safety is a property of what is absent, not of what is checked.

### 1.12 The delivery gate is a one-sided ratchet reading a pin nothing enforces

`scripts/fixtures/token-benchmark-baseline.json` records the reference walk: 1,302,319 delivery characters over 242 tool calls, `workflowsRev: 72db28ae`, `contextMode: fresh`. CI gates a regression beyond 1% (`.github/workflows/verify.yml:82-83`).

Three properties of that gate degrade rather than hold:

- **It is one-sided.** A regression beyond +1% fails; an improvement does not force a re-record. Twelve consecutive 0.9% increases compound to +11.4% without ever tripping it, and each one is individually defensible.
- **The corpus pin is advisory.** When the walk's corpus differs from the fixture's, the script emits "Corpus mismatch: reference recorded at workflows@X, this walk ran workflows@Y" — and the comment above it says why it stops there: "Reported, not enforced" (`scripts/run-token-benchmark.ts:547-553`). The gate still passes. Today the pin matches, because the superproject gitlink is `72db28ae` and the fixture says `72db28ae`. The corpus branch HEAD is `2e8b6297`.
- **The narrative reaches nobody.** The scorecard, including that warning, goes to stderr (`scripts/run-token-benchmark.ts:319`); CI discards stdout to `/dev/null` and keeps stderr, so the warning lands in the log of a job that reports success. Only the exit code is read.

The fixture also records the redundancy the walk currently pays: 162 `get_resource` calls against 77 distinct resource ledger keys, `unchangedResourceAnswers: 0`; and `technique_bundled: 66` alongside `technique_fetched: 24`, with the fixture's own description naming the cause — "a technique bundled into `get_activity` does not satisfy a later standalone `get_technique` for the same content", a full 4,054-character refetch. `get_resource` is 527,683 of the 1,302,319 characters, 40.5% of delivery.

---

## 2. Decay timeline

The timeline below assumes only neglect: no new features, no new defects, ordinary maintenance elsewhere in the repo, and the same authors continuing to edit whatever they happen to be working on. Each entry names the mechanism, not a guess about intent.

### At 6 months

| What changes | Mechanism | Evidence anchor |
|---|---|---|
| Every technique version is uninformative | Bumps land on 35–58% of content commits; the field is delivered on every fetch regardless | §1.7 |
| The binding triage pin passes 600 commits | 183 commits in 18 days; the note that reports it never reaches CI | §1.5 |
| The two README diagrams are unreconstructable | 206 edges, disjoint vocabulary, no guard; drift already present at four edges | §1.8 |
| Cross-tree link rot becomes routine | 129 anchor-free cross-tree links; a rename fails no guard | §1.4 |
| A second work-package op becomes a wrapper with a diverged contract | `create-pr` is already 1.1.1 vs 1.3.0 with different declared inputs | §1.2 |

At 6 months the dominant effect is that the *cheap* signals stop working. Nothing has broken; the tools that would tell you whether something has broken have stopped carrying information. The version field, the README diagrams and the triage stamp are all in this class: still present, still delivered, no longer true.

### At 12 months

| What changes | Mechanism | Evidence anchor |
|---|---|---|
| The dark set grows past 30 files without a single deletion | Only reference removal is required; 40 inline-link-only files are one prose edit away from joining it | §1.1 |
| `meta/activities/patterns/` no longer validates against the schema | 5 unvalidated files against an `activity.schema.json` that moves; an invalid step kind passes all 28 guards today | §1.3 |
| A stale `core-ops.ts` ref reaches a live run | 18 of 24 refs are proved only by an e2e walk of one workflow; the same rot occurred once already | §1.1 |
| The section-framing triage exceeds 150 entries with zero debt recorded | Every new anchored resource adds sites; only the `harmless` verdict has ever been used | §1.5 |
| The three dead gates acquire company | Two dead transitions and one permanently-open gate survived a remediation that specifically hunted this shape | §1.6 |
| `stealth_mode` becomes undocumented external state | 22 gate sites in work-package, zero writers in work-package, no declaration of the external owner | §1.6 |

At 12 months the effect moves from signals to structure. A schema change is the specific trigger for `patterns/`: `activity.schema.json` was last touched 2026-08-18 and has no reason to freeze, and the five exemplars have nothing checking them against it. The failure mode is not that the pattern files break — nothing runs them. It is that the next author who copies one inherits a shape the schema no longer accepts, and finds out at authoring time with no explanation of why the exemplar is wrong.

### At 24 months

| What changes | Mechanism | Evidence anchor |
|---|---|---|
| One of the duplicated pairs is edited on the wrong side | Four cross-tree and three within-tree duplicate basenames; the wrapper delegates by relative path, so the wrong edit still resolves | §1.2 |
| The bare-ref fall-through becomes a silent retarget | One new workflow-local `document.md` or `reconcile.md` converts an error into a different real file | §1.11 |
| A technique group name collides with a workflow id | The loader treats a leading `::` segment as a cross-workflow prefix when `workflows/<segment>/techniques` exists (`src/loaders/technique-loader.ts:136`, `:246`); 17 workflow ids and 26 group names, no collision today, nothing preventing one | §3.4 |
| Delivery has risen 10–25% without a red gate | One-sided 1% threshold, advisory corpus pin, stderr-only narrative | §1.12 |
| The triage files are load-bearing archaeology | 70 + 107 entries, all `harmless`, pins unenforced, 4 unused rationales, 2 shadowed keys; the judgements' authors are the only readers who could re-derive them | §1.5 |

At 24 months the failures are the ones that need the most context to diagnose and have the least of it left. The duplicated-pair edit is the canonical case: `work-package/techniques/update-pr/mark-ready.md` and `meta/techniques/github-cli-protocol/mark-ready.md` will both still resolve, both still be delivered, both still pass every guard, and a fix applied to one of them will simply not take effect for the callers of the other.

---

## 3. Silent-corruption paths

A path qualifies here when the failure produces a run that completes and an artifact that looks right. Ordered by how little has to happen first.

### 3.1 An anchor-free inline reference rots and the agent improvises

`work-package/techniques/codebase-comprehension/survey.md` instructs "Apply [query](../../../meta/techniques/gitnexus-operations/query.md)". The loader does not resolve inline references (`src/loaders/core-ops.ts:25-26` states this for the analogous server-side case). Rename or move that file and the delivered Protocol still contains the sentence, still contains the dead path, and still tells the worker to apply an operation. The worker has a capability name, a plausible tool, and no protocol. It produces a survey.

Measured exposure: 272 corpus-wide link targets that no step binds and that are linked only without an anchor; 129 of work-package's 139 cross-tree links. Confirmed by injection: renaming a technique file that only anchor-free links reach fails **0** of 28 guards, while renaming one a step binds fails `binding-fidelity`, and renaming one an anchored link reaches fails `resource-anchors`.

### 3.2 A gate loses its writer and reads as "not in that mode"

`gateAnswer` and `unboundPositiveReads` in `src/utils/gate-liveness.ts` document the shape precisely: "Such a gate is false for want of an answer rather than because the answer is no, and once its step is skipped the two are indistinguishable" (`:79-81`), and "Negative and presence forms are left out, because absence answers them: `x != true` and `notExists x` hold on a missing variable, which is how this corpus spells 'not in that mode'" (`:83-84`).

That convention is correct and it is also the corruption channel. Delete or rename a producer and every `!= true` gate downstream opens, every `== true` gate closes, and the run takes the path it would have taken in the other mode. It reports success. Three gates in work-package are in this state today — two closed, one open — and the closed ones are transitions, so the loss is a rework path the run cannot take rather than a step it skips.

The indirection makes it cheaper still. `residue_flag: has_open_questions` (`work-package/activities/15-codebase-comprehension.yaml:66`) means renaming `has_open_questions` in `workflow.yaml` requires a matching edit to a *string value* in an input map. Miss it and the comprehension sufficiency checkpoint stops firing. No guard resolves that edge.

### 3.3 A triage entry silently re-covers a different finding

`applyTriage` keys on `(check, site-without-line, detail)`. A `read-resolution` entry for `{email}` on `work-package/techniques/manage-git/TECHNIQUE.md` covers that finding at any line in that file. Rewrite the file so `{email}` is legitimately unbound in a *new* place and the old entry absorbs it: no untriaged finding, no stale entry, and a suppression whose recorded rationale describes a different site.

The two shadowed keys are the same mechanism at rest. Two entries collapse into one map slot; the loser is invisible to both the suppression pass and the stale pass, so the file carries a judgement that can never be reported obsolete.

### 3.4 A namespace collision retargets a reference to a different tree

`readTechniqueWithSource` decides whether `a::b` means "group `a`, op `b` in this workflow (then meta)" or "workflow `a`, technique `b`" by testing whether `workflows/a/techniques` exists (`src/loaders/technique-loader.ts:136`); `parseTechniquePath` repeats the test (`:246`). There are 17 workflow ids and 26 technique group names, with no overlap today and nothing enforcing that.

Add a workflow named `research`, `validate-build`, `manage-git` or `version-control` and every `<that-name>::<op>` reference in the corpus retargets from a group inside the referring workflow to the new workflow's technique tree. The reference resolves. It resolves to a different file. `check-all-refs` proves that `techniques[]` entries resolve, not that they resolve to what the author meant.

### 3.5 A borrowed activity carries a gate whose owner has changed its mind

`remediate-vuln` borrows 14 work-package activity files and seeds `stealth_mode`. Twenty-two gate sites in work-package read it. `check-stealth-isolation` proves "no leakage path found for 'remediate-vuln' (static)" — for that one workflow, statically.

Change a work-package gate's polarity, or add a mutating step without a `stealth_mode != true` guard, and the borrowing workflow's isolation property changes without a work-package author having any reason to think about it. The guard catches the static leakage shape. It does not catch a work-package gate that stops being conditional at all — which is what §1.6's always-true gate already is.

### 3.6 A CI pass that measures a corpus nobody asked about

`verify.yml` resolves the pinned gitlink and checks out that exact commit — deliberately, so "a delta is attributable to what this tree changed". The benchmark then compares against a fixture whose `workflowsRev` may or may not match, warns on stderr when it does not, and passes regardless. A green Verify job therefore has two possible meanings — delivery is within 1% of a comparable baseline, or delivery is within 1% of a baseline from a different corpus — and the only way to tell them apart is to read the log of a job that says it succeeded.

### 3.7 An exemplar teaches a shape the schema has rejected

`meta/activities/patterns/` is copied by design ("Borrow the activity into a client `workflow.yaml` `activities:` list", `meta/activities/patterns/README.md:31-36`). Nothing validates it. An `activity.schema.json` change that tightens a construct leaves five exemplars teaching the old form, and the corruption surfaces in whatever new workflow copies one — attributed to the new author, not to the exemplar.

---

## 4. Degradation model: where brittleness increases

Brittleness here is the derivative of *unverified surface* with respect to *edits elsewhere*. It is highest where a fact is asserted in two places, where a reference crosses a boundary a tool does not cross, and where a suppression has no expiry.

### 4.1 The five structural seams, ranked

| Seam | What holds it | Guard coverage | Brittleness |
|---|---|---|---|
| Server → corpus (`core-ops.ts`, 24 refs) | String literals in a different git branch | 6 of 24 by `check-harness-adapter-set`; the rest by one e2e walk of one workflow | **Highest.** A cross-repo edge whose only proof is a test that must reach every activity of `work-package` |
| work-package → meta by relative path (139 links) | Filesystem paths two or three `../` deep | 10 of 139 (`resource-anchors`, anchored only) | **High.** Volume × zero coverage; a meta reorganisation is undetectable from the meta side |
| work-package → ponytail / prism (6 step bindings) | `workflow/op` prefixed refs | `binding-fidelity` resolution | Low. Prefixed refs are resolved; this seam is healthy |
| remediate-vuln → work-package (14 activity files) | Numbered filenames | 3 guards fail on a rename (measured) | Low. The file-path borrow is well covered |
| Suppression files → corpus (177 entries) | `(check, site, detail)` keys and one advisory SHA | Stale-entry reporting; no pin enforcement, no rationale check, no shadow detection | **High.** Entries self-heal on deletion, not on rewrite |

The ranking is counter-intuitive in a useful way: the seams that look fragile — a workflow borrowing another's activity files by number, one tree binding another's ops by prefix — are the well-guarded ones. The unguarded seams are the ones expressed in prose.

### 4.2 Brittleness increases fastest in three places

**In `meta/techniques/`, because it is a library with no import list.** 58 of 139 ops are step-bound; 33 of the 38 `dead-output` suppressions are here. The tree's stated design — ops bound ad hoc by any workflow — means removing the last reference to an op produces no signal at all, and the guard has been configured to accept exactly that state. Every reference deleted anywhere in the corpus moves one more file from checked to unchecked, and the only counter-pressure is a human noticing.

**At each `TECHNIQUE.md` container contract, because inheritance is invisible at the call site.** meta declares 10 group contracts plus a root; work-package declares 17 plus a root, and the two roots have already diverged into different input sets (meta: `host_repo_path`, `component_path`, `planning_folder_path`; work-package: `planning_folder_path`, `requirements`, `problem_statement`, `target_path`, `branch_name`, `pr_number`, `component_git_dir`, `target_repo`). `check-inherited-inputs` proves no op redeclares what a container merges in. Nothing proves a container still needs what it declares, so a contract accretes inputs monotonically: an op that stops needing one leaves the declaration behind, and every sibling op keeps inheriting it.

**Wherever two representations of one graph exist.** `work-package/activities/README.md` (206 edges), `work-package/README.md`'s top-level chart (already 4 edges wrong), and `work-package/REVIEW-MODE.md` (a third narrative of a behaviour expressed in 22 gates). Each definition edit either updates all copies or increases divergence, and the vocabularies are disjoint enough that "did I update the diagram" is not a checkable question. Divergence in this class is strictly monotonic: there is no edit that reduces it except a deliberate reconciliation pass, and no signal that one is due.

### 4.3 What does *not* get more brittle

Worth stating, because it bounds the model. `meta`'s gate set is clean — 27 gates, 0 constant, every read has a writer. The activity-file borrow path fails loudly. Prefixed cross-workflow bindings resolve under `binding-fidelity`. Anchored links are proved. The e2e corpus pin fails on mismatch. The guard registry itself is closed: 26 `check-*.ts` guards plus `validate-activities` and `validate-workflow-yaml`, all 28 registered in `scripts/guards.ts`, none on disk and unregistered, and `check:all` exits 2 rather than 0 when a guard cannot measure. Those parts of the system resist neglect. The parts that do not are, without exception, the parts whose truth lives in prose or in a suppression file.

---

## 5. Tests that break by waiting

Each test below passes today and fails later with no new defect introduced — only elapsed time and ordinary work elsewhere. They are ordered by expected time-to-red.

### T1 — Version-field fidelity (fails within weeks)

For every file under `meta/techniques/`, `work-package/techniques/` and both `activities/`, assert that any commit changing the body also changes `version:`. Measured baseline: 385 of 726 (meta techniques), 320 of 919 (work-package techniques), 31 of 53 and 95 of 170 (activities). Asserting the current rate as a floor makes it a ratchet; asserting 100% makes it red on the next unversioned edit. Either way the trend is one-directional, because nothing in the system raises the rate.

### T2 — Triage pin distance (fails on schedule)

Assert `binding-fidelity`'s `corpusSha` is within N corpus commits of HEAD. At today's cadence — 183 commits in 18 days — N=50 goes red in under a week. The same assertion against `tests/e2e/__snapshots__/corpus-sha.json` stays green, which is the point: the test measures the policy difference, not the corpus.

### T3 — Every relative `.md` link resolves, anchor or not (fails on the next meta rename)

Drop the `no #` exclusion from `check-resource-anchors` and require the *file* to exist even when no anchor is cited. Current state: 540 anchor-free relative `.md` links in the two trees, 41 non-existent targets in work-package (39 anchor-free). The test needs a placeholder allowlist for the `NN-`/`{token}` forms; with that in place it is green today and red the first time anyone reorganises `meta/techniques/gitnexus-operations/`, which 29 anchor-free links from four trees depend on.

Confirmed by injection — the guard's current blind spot is real, not theoretical:

| Injected change | Guards that fail |
|---|---|
| Rename `meta/techniques/github-cli-protocol/view-pr.md` (step-bound) | 1 — `binding-fidelity` |
| Rename heading `## Template` in `meta/resources/planning-readme.md` (anchor-cited) | 1 — `resource-anchors` |
| Rename `meta/resources/writing-register.md` (anchor-cited from work-package) | 2 — `section-framing`, `resource-anchors` |
| Rename `work-package/activities/09-lean-coding-audit.yaml` (borrowed by path) | 3 — `stealth-isolation`, `refs`, `workflow-yaml` |
| `kind: bogus-kind` in `meta/activities/patterns/01-orchestrator-workers.yaml` | **0** |

### T4 — Schema conformance of every activity YAML on disk (fails on the next schema tightening)

Make `validate-activities` recurse, as `check-binding-fidelity` and `check-set-action-values` already do, and assert it reports 122 rather than 117. Green today: the five pattern files happen to conform. Red the first time `activity.schema.json` tightens a construct they use, with no author having touched them.

### T5 — Gate liveness as a hard zero (fails when a producer is renamed)

Assert that every gate in every workflow reads at least one root some site in that workflow's reachable graph writes, with an explicit allowlist for externally-seeded variables (`stealth_mode` today). Current state: 3 findings in work-package — `needs_plan_revision`, `needs_further_discussion`, `skip_architecture_summary`. Fix those and the test is green, and goes red the next time a producer is renamed without its readers, which is the exact class PR #468 remediated by hand.

`src/utils/gate-liveness.ts` already exports `variablesWrittenIn`, `unboundPositiveReads` and `gateAnswer`. The static form of the check is a consumer away.

### T6 — Suppression-file hygiene (fails as the file grows)

Three assertions on both triage files: distinct keys equal entry count (today 68 vs 70 — **red now**); every declared rationale is used by at least one entry (today 8 of 12 — **red now**); no entry is older than N corpus commits without re-affirmation. The first two are red on the current tree, which makes them a decay measurement rather than a prediction: they became red without anyone editing the guard.

### T7 — Diagram/definition correspondence (red now, worsens)

Assert every node label in a `work-package/activities/README.md` mermaid chart normalises to a step id, a technique ref, or an explicit `graph-only` allowlist entry. Today: 11 of 173 labels match, 89 of 235 step ids appear anywhere in the document. The number cannot improve without a reconciliation pass and falls with every step added or renamed.

### T8 — Delivery-cost drift as a cumulative bound (fails after ~12 accepted 0.9% changes)

Add a second gate alongside the per-change 1% threshold: total delivery may not exceed the *quarter-opening* recording by more than M%. The per-change gate is a local derivative; this one is the integral. Also make the corpus-pin mismatch fail rather than warn, so the gate cannot pass on an incomparable pair. Recorded trajectory — 1,355,532 (July) → 1,780,292 (pre-remediation, +31.3% in 32 days) → 1,302,319 (now) — is what the integral gate exists to catch; the per-change gate did not.

### T9 — Namespace disjointness (fails on the next workflow whose name reads like a capability)

Assert that no workflow directory name equals a technique group directory name anywhere in the corpus. Green today: 17 workflow ids, 26 group names, no overlap. It costs six lines and it closes §3.4 permanently, because the collision is decided by directory existence at resolution time and is otherwise undetectable.

---

## 6. The degradation law

**Verification is a function of binding, and binding only decays.**

Every guard in this repository defines its scan set from something a run reaches: a step binding (`binding-fidelity`, `refs`, `activity-technique-overlap`), a link that carries an anchor (`resource-anchors`, `section-framing`), a file in a non-recursive directory read (`validate-activities`), a triage key (`binding-fidelity`, `section-framing`), a policy walk (`definition-lint`). That is the right design — it is what makes 28 guards run in 2.4 seconds and what makes a finding actionable. It also means the guarded set is a subset of the reached set, and the reached set shrinks whenever a reference is deleted, renamed, softened from `::` to prose, or moved into a directory nothing loads.

The asymmetry is the law. Adding a file adds nothing to the guarded set until something binds it. Removing the last binding removes a file from the guarded set immediately, and produces no finding — because a guard that scans what is bound cannot report on what stopped being bound. So the unverified fraction of the corpus,

> 1 − (files a guard resolves) / (files on disk)

is monotonically non-decreasing under neglect. Today it is 88 of 233 operation files, 38%, plus 5 of 122 activity files, plus 272 markdown-link targets, plus 177 suppression entries with no expiry. Every one of those numbers can rise without an edit to a guard, and none can fall without a deliberate act.

Three corollaries follow, and each is measurable on this tree:

**Redundancy migrates from checked to unchecked, never back.** The 21 meta ops nothing reaches were reached once — `atlassian-operations` was written to be bound. They did not become wrong; they became invisible, and invisibility is what lets them become wrong later without a signal. The 40 inline-link-only files are one prose edit from joining them.

**A duplicate that both halves of a pair still resolve is more dangerous than one that has died.** `update-pr/mark-ready.md` and `github-cli-protocol/mark-ready.md` both resolve, both pass every guard, and hold different contracts. `finalize-documentation/revise-session-metrics.md`, which nothing reaches, is dead weight — 10,593 bytes across the whole dark set, an accounting problem. The live pair is a correctness problem that presents as a fixed bug that did not take.

**A suppression outlives its subject by default.** The stale-entry pass catches deletion. It does not catch rewriting, key collision, an unused rationale, or a pin 183 commits behind, and the one signal that does exist — the stamp note — is filtered out of the only path CI runs. The repo already holds the counter-design: `corpus-sha.json` fails on mismatch. The difference between the two files is a policy choice, not a technical limit.

The lever the law implies is narrow. Reducing the corpus does not help — deleting the 24 dark files leaves the ratio where it was, because the mechanism is not size. What moves the ratio is converting prose references into resolved ones (an anchor on each of 540 anchor-free links; a recursive read in `validate-activities`; a static gate-liveness consumer for the machinery `src/utils/gate-liveness.ts` already exports), and giving every suppression an expiry that fails rather than warns. Each of those is a small, closed change that converts a monotonic decline into a checkable invariant — which is the only kind of change that survives being left alone.
