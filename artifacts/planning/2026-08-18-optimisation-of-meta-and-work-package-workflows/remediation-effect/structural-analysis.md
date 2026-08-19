---
target: /home/mike1/projects/dev/workflow-server (server tree at 1297e655; `workflows` submodule at 2e8b6297, superproject pin 72db28ae)
subject: the `meta` and `work-package` definition trees, evaluated for the time and token cost of one run
analysis_date: 2026-08-18
lens: L12 structural (meta-conservation law)
analysis_focus: Remediation Effect — server PRs #467/#471 and definition PRs #468/#470, merged 2026-08-17/18
gitnexus: unavailable for this target; graph-verification steps skipped, structural context gathered by direct measurement
---

# Structural Analysis: Remediation Effect

## Structural Context (measured)

No graph index was available, so every figure below was taken from the tree at hand: a live
benchmark walk, the per-activity delivery-cost log the server emits, direct scans of the corpus
through the server's own loader and producer index, and `git` against both repositories.

### What the four pull requests actually changed

Measured with `git diff` across the merge bases rather than from the merge commits' combined diffs.

| Tree | Range | Files | Insertions | Deletions |
|---|---|---|---|---|
| server | `5e627648..1297e655` (PRs #467, #471) | 36 | 1,558 | 244 |
| `workflows` | `34cd5429..2e8b6297` (PRs #468, #470) | 12 | 141 | 70 |
| **combined** | | **48** | **1,699** | **314** |

The brief states 42 files, 1,861 insertions, 297 deletions. My count disagrees on all three; both
figures are given. The per-PR `--stat` sums (30+14 server, 4+8 corpus files; 1,716 insertions;
331 deletions) match neither, because eight server files appear in both PRs.

### Corpus shape, counted directly

Counted by parsing every activity YAML under each tree, recursing into `kind: loop` bodies.

| | meta | work-package |
|---|---|---|
| activity files | 5 | 15 |
| steps, all kinds | 44 | 266 |
| technique steps | 23 | 176 |
| action steps | 14 | 31 |
| checkpoint steps | 5 | 44 |
| loop steps | 2 | 15 |
| steps carrying `when:` | 19 | 83 |
| steps carrying `condition:` | 7 | 48 |
| steps carrying either | 26 | 128 |
| technique steps gated (own gate or an enclosing one) | 12 | 91 |
| files / bytes on disk | 171 / 297,551 | 168 / 634,102 |

The brief's figures for activities, technique steps, checkpoints and `when:`-gated steps all
reproduce exactly. The brief's gate counts understate the gated population, because the corpus also
carries 7 meta and 48 work-package `condition:` gates: 26 and 128 gated steps rather than 19 and 83.

Against the same trees at the pre-remediation pin (`workflows@1921a6e5`), the definition PRs added
four technique steps to work-package (172 → 176), three of them gated (88 → 91), and one action step
to meta. **The remediation left the corpus with more gated steps than it found.**

The server registers 18 tools across 55 TypeScript files and 12,628 lines, unchanged in count.

### The delivery trajectory, re-measured

`npm run bench:token -- --label=verify --context-mode=fresh --gate`, run today against this
checkout, completed the same 12-activity `work-package` path under the same `skip-optional` robot
policy and reproduced the committed baseline **to the character**: 1,302,319 delivery characters,
`deliveryCostIndex` 100, regression 0.0%, gate PASS.

| Recording | Corpus | `get_activity` | `get_workflow` | `get_resource` | `get_technique` | Total |
|---|---|---|---|---|---|---|
| 2026-07-16 (A0) | `a1409d5b` | 687,936 | 59,455 | 448,084 | 160,057 | **1,355,532** |
| 2026-08-17 pre-remediation | `1921a6e5` | 987,370 | 108,280 | 527,683 | 156,959 | **1,780,292** |
| after `ab810342` (server delivery) | `34cd5429` | 518,185 | 108,280 | 527,683 | 141,991 | **1,296,139** |
| after PR #468 (`cf4d0774`) | `cf4d0774` | 518,679 | 108,280 | 527,683 | 142,118 | **1,296,760** |
| after PR #470 (`72db28ae`) — today | `72db28ae` | 520,075 | 108,356 | 527,683 | 146,205 | **1,302,319** |

Today's call profile: 242 tool calls — 1 `start_session`, 1 `get_workflow`, 12 `next_activity`,
12 `get_activity`, 24 `get_technique`, 162 `get_resource`, and 10 yield/respond/resume triples.
History records 66 `technique_bundled`, 24 `technique_fetched`, 146 `resource_fetched`, 265 ledger
keys of which 77 are `resource:*`, and **0 unchanged answers on either the resource or the technique
channel**.

## The 26.8% fall, attributed

Total movement from the pre-remediation recording is **−477,973 characters, −26.85%**. It decomposes
by call, and the decomposition is not what the programme's shape suggests.

| Call | Delta | Share of the fall |
|---|---|---|
| `get_activity` | −467,295 (−47.33%) | **97.8%** |
| `get_technique` | −10,754 (−6.85%) | 2.2% |
| `get_workflow` | +76 (+0.07%) | — |
| `get_resource` | **0 (0.00%)** | **0%** |

`get_resource` is byte-identical across the remediation: 527,683 characters over 162 calls, 146
recorded fetches, 77 distinct ledger keys. That channel is 40.5% of today's delivery and **not one
character of it moved**. 85 of the 146 fetches are repeats that still deliver a full body, because
`unchangedResourceAnswers` is 0.

`get_workflow` also did not move. It stands at 108,356 against July's 59,455 — the +82.1% regression
the prior report attributed to the workflow bundle is fully resident.

By commit, the whole fall is one commit:

- `ab810342` "Read the gates the server can answer, send each block once, and run the cost gate" —
  1,780,292 → 1,296,139, **−484,153 (−27.20%)**.
- PR #468 (`cf4d0774`) — **+621**.
- PR #470 (`72db28ae`) — **+5,559**.

The two definition pull requests are net cost-**positive** by 6,180 characters (+0.48%). They bought
correctness, and they were priced at merge by the gate the same programme installed.

Inside the −484,153, the dominant term is measurable from the server's own delivery-cost log line.
The invariant worker bundle costs, per activity of today's walk: 35,204 / 24,311 / 620 / 620 / 620 /
620 / 543 / 543 / 543 / 543 / 543 / 543 = **65,253 characters total**. The prior report measured the
same bundle on the same 12-activity path at **422,448**. So CTX-01 alone accounts for roughly
**357,195 characters — 74.7% of the whole fall and 76.4% of the `get_activity` fall**. The residual
`get_activity` movement, about 110,100 characters, sits against CTX-02's predicted 100,123 characters
of byte-identical intra-response repetition. The two named Context Economy items are essentially the
entire result.

## Disposition of the prior report's 52 findings

Measured against the **current build**, not against the prior report's own text.

| | HIGH | MEDIUM | LOW | Total |
|---|---|---|---|---|
| CLOSED | 4 | 2 | 0 | **6** |
| PARTLY ADDRESSED | 4 | 7 | 4 | **15** |
| UNTOUCHED | 7 | 18 | 6 | **31** |
| **Total** | **15** | **27** | **10** | **52** |

### Mechanisation Potential — 1 closed, 0 partial, 11 untouched

| ID | Verdict | Evidence |
|---|---|---|
| MECH-01 (H) | UNTOUCHED | Zero `npx tsx scripts/` invocations in `workflows/meta` or `workflows/work-package`. The three files carrying one are `workflow-design/techniques/yaml-authoring.md`, `workflow-design/techniques/audit-schema-validation.md`, `workflow-authoring/techniques/workflow-definition/audit-schema-validation.md`. |
| MECH-02 (H) | UNTOUCHED | `delivered_artifact` still has exactly two references corpus-wide, both inside `meta/techniques/workflow-engine/sync-progress-status.md` (lines 32, 54). No call site binds it. |
| MECH-03 (H) | **CLOSED** | `work-package/techniques/naming-conventions.md` v1.1.0 carries a five-row total table and a `{$branch_type_prefix}` step-local, read by step 4. |
| MECH-04 (M) | UNTOUCHED | No status-policy tool; 18 registrations unchanged. |
| MECH-05 (M) | UNTOUCHED | No mint tool. |
| MECH-06 (M) | UNTOUCHED | `review-mode-detection.md` unchanged; the ambiguity flag still gates its own confirm. |
| MECH-07 (M) | UNTOUCHED | `scripts/check-resource-anchors.ts` unchanged; unanchored links still skipped. |
| MECH-08 (M) | UNTOUCHED | |
| MECH-09 (M) | UNTOUCHED | |
| MECH-10/11/12 (L) | UNTOUCHED | |

### Context Economy — 2 closed, 3 partial, 4 untouched

| ID | Verdict | Evidence |
|---|---|---|
| CTX-01 (H) | **CLOSED** | `src/tools/workflow-tools.ts:877` `mayReferBack`; the invariant bundle collapses for a returning identity in every mode. Measured 422,448 → 65,253 on the 12-activity path. |
| CTX-02 (H) | PARTLY | The response-local half is unconditional (`src/utils/delivery.ts:109-129`, `src/tools/workflow-tools.ts:1040-1041, 1059-1063`). The hoist-to-sibling-block half — a further 76,359 characters — is not built; `projectTechnique` still merges each ancestor group's rules into every technique. |
| CTX-03 (M) | PARTLY | The "machinery is off in production" half is answered for the invariant blocks and for intra-response repetition. Per-entry keys for merged rules and inherited-input lists are unchanged (the `note`/`items` split at `delivery.ts:159-185` predates the remediation). Measured: 0 unchanged answers on either channel. |
| CTX-04 (M) | UNTOUCHED | `work-package/techniques/implement-task.md:50` and `review-test-suite.md:71` still link the Rust resource unconditionally. |
| CTX-05 (M) | UNTOUCHED | Containment still compares string offsets. |
| CTX-06 (M) | UNTOUCHED | `meta/techniques/workflow-engine/TECHNIQUE.md` still 8,286 bytes. |
| CTX-07 (M) | **CLOSED** | `readTechniqueWithSource` / `composeTechniqueWithSource` (`src/loaders/technique-loader.ts:105-197, 594-646`); `workflow-tools.ts:1017, 1072` qualifies against `techniqueWorkflowId`. Covered by `tests/borrowed-technique-resolution.test.ts`. |
| CTX-08 (L) | PARTLY | The reported spend is fixed: `spentChars` opens at `workerBundleChars` (`workflow-tools.ts:967`). The budget is retained and still cannot bind — measured maximum `spent_chars` 91,516 against `eager_budget_chars` 640,000, 7.0× slack. |
| CTX-09 (L) | UNTOUCHED | |

### Orchestration Topology — 1 closed, 4 partial, 6 untouched

| ID | Verdict | Evidence |
|---|---|---|
| TOP-01 (H) | PARTLY | Built (`src/utils/gate-liveness.ts`, `workflow-tools.ts:964-1010`). Measured effect on the benchmark walk: **+2 bundled steps of 82 gated technique steps on the path, and one fewer `get_technique` call**. Detail in the next section. |
| TOP-02 (H) | UNTOUCHED | 49 checkpoints across the two trees, unchanged. No batched-presentation tool. |
| TOP-03 (H) | UNTOUCHED | `13-submit-for-review.yaml` not split; the await-review loop is intact. |
| TOP-04 (M) | UNTOUCHED | No dead-step pruning. `docs/resource_resolution_model.md:256` now claims a false-gated step ships "nothing", which is wrong: the step's YAML body still travels in the activity payload. |
| TOP-05 (M) | PARTLY | Server side built: `_meta.batch` at the boundary (`workflow-tools.ts:744-757`), and `deliveredChars` counts lazy fetches (`src/utils/batch.ts:98-121`). Corpus side absent: neither `next_activity` call site passes `context_tokens` (`dispatch-activity.md:50`, `continue-batch.md:46`), and the worker still reads `may_continue` from the open-time `get_activity` reading (`activity-worker.md:38, 54, 84`). |
| TOP-06 (M) | **CLOSED** | All four defects repaired in `01-start-work-package.yaml` and `13-submit-for-review.yaml`, plus a new guard (`scripts/check-decision-order.ts`, registry entry `scripts/guards.ts:99-106`). |
| TOP-07 (M) | UNTOUCHED | No concurrency construct in the schema. |
| TOP-08 (M) | PARTLY | The bundler now recurses into loop bodies and the note states the once-per-iteration contract (`workflow-tools.ts:998, 1184`). The 29 duplicate bindings are unchanged, and PR #470 added a second binding of `issue-reference-detection`. |
| TOP-09 (M) | UNTOUCHED | `checkpointResponses` still keyed by activity+checkpoint with no state fingerprint (`workflow-tools.ts:1406-1440`). |
| TOP-10 (L) | UNTOUCHED | |
| TOP-11 (L) | PARTLY | The wrong-activity half is closed: `activity_id` on `get_technique` with a hard mismatch error (`src/tools/resource-tools.ts:640, 653-661`). The identity-inference half is not merely untouched but **widened** — see Regressions. |

### Redundant Work — 1 closed, 5 partial, 4 untouched

| ID | Verdict | Evidence |
|---|---|---|
| RED-01 (H) | **CLOSED** | `.github/workflows/verify.yml:82-83` runs `bench:token --label=ci --context-mode=fresh --gate`; the baseline was re-recorded; the gate passes today at 0.0%. |
| RED-02 (H) | UNTOUCHED | `11-validate.yaml` producing steps still gated `project_type == 'rust-substrate'`. |
| RED-03 (H) | PARTLY | `client_workflow_completed` given a producer (`meta/activities/03-dispatch-client-workflow.yaml:98-102`), and `post_jira_comment` replaced by `post_summary_approved` with a true-setting option. A producer-aware scan still finds **4 defaulted work-package variables read by a gate with no producer site anywhere**: `validation_passed` (2 reads), `has_open_questions`, `skip_architecture_summary`, `stealth_mode` (22 reads). A document-level scan finds 8 variables whose only definition-level write equals their default (3 meta, 5 work-package), down from 10. |
| RED-04 (M) | UNTOUCHED | No definition-reachability guard; technique-file counts unchanged at 150 (meta) and 112 (work-package). |
| RED-05 (M) | PARTLY | One instance fixed (the branch prefix). The binding guard still accepts declaration as production; no no-writer rule was added. |
| RED-06 (M) | UNTOUCHED | |
| RED-07 (M) | PARTLY | The census script is documented and aliased (`npm run sessions:census`, `docs/development.md` § Sessions in flight). Terminal-activity binding unchanged. |
| RED-08 (M) | UNTOUCHED | |
| RED-09 (L) | PARTLY | `dispatch-prism` now binds `handle-sub-workflow`. Four empty `actions: []` remain in work-package (`01-start-work-package.yaml:294`, `11-validate.yaml:47`, `13-submit-for-review.yaml:41` and `:360`) plus one in prism, and no guard rejects an empty action list. |
| RED-10 (L) | PARTLY | The triage corpus stamp is now compared and reported: running the guard prints *"verdicts were made against corpus 3569e93786d3, the checkout is at 2e8b62970eea — 183 corpus commit(s) since"* (`scripts/check-binding-fidelity.ts:751-768`). No history cap; a completed child's state is still inlined in its parent. |

### Change Economics — 1 closed, 3 partial, 6 untouched

| ID | Verdict | Evidence |
|---|---|---|
| ECO-01 (H) | UNTOUCHED | No `server_root` in any response, no guard-runner tool. |
| ECO-02 (H) | **CLOSED** | `workflow-design/techniques/audit-schema-validation.md` v1.2.0: both guards now take `--root`, and the non-existent `--update-baseline` flag is replaced by the triage instruction. |
| ECO-03 (H) | UNTOUCHED, and sharper | The walk is now bit-exactly reproducible (0%, not 0.1%), so the 1% threshold is **13,023 characters of deliberate slack, not a noise floor**. The instrument could resolve a single character and is configured not to. |
| ECO-04 (H) | PARTLY | See the version-drift section below. |
| ECO-05 (M) | PARTLY | The batched landing was actually performed, and `docs/development.md` now states the re-record procedure. The ceremony itself is unchanged. |
| ECO-06 (M) | UNTOUCHED | `DEFAULT_BATCH_HEADROOM_FRACTION = 0.35`, `DEFAULT_BATCH_MAX_ACTIVITIES = 3` (`src/config.ts:164-165`), unchanged. The 40-line comment recording the evidence was **deleted** and replaced by a pointer to `docs/dispatch_model.md`; no re-measurement was recorded. |
| ECO-07 (M) | UNTOUCHED | |
| ECO-08 (M) | PARTLY | The corpus stamp is compared. The orchestration spine still carries zero structured step bindings; the binding guard's parse domain is unchanged. |
| ECO-09 (M) | UNTOUCHED | |
| ECO-10 (L) | UNTOUCHED, and measurable | 70 triage entries, **70 of them "harmless"**, 0 fix-later, 0 live-bug, 0 untriaged — against a register whose own note defines the two other verdicts precisely so that acceptance and defect stop being the same silence. |

## Does `gate-liveness.ts` reduce permanently-lazy step counts?

It reduces them by two steps on the walk that gates the programme, and its ceiling is unreachable
under the protocol the corpus actually executes.

**Measured on the 12-activity walk.** Summing the server's per-activity `Activity delivery cost` log
line across the path:

| | Count |
|---|---|
| technique steps in the twelve activities | 146 |
| ungated (bundled under the old predicate too) | 64 |
| gated | 82 |
| gated and bundled — `gateAnswer` returned `true` | **2** |
| gated and pruned — `gateAnswer` returned `false` | 4 |
| gated and left lazy — `gateAnswer` returned `undefined` | **76** |

`technique_bundled` rose from 64 (the ungated set on today's corpus) to 66; `get_technique` calls
fell from 25 to 24. The two steps are `post-impl-review::structural-analysis-inline`
(`problem_complexity != 'complex'`, bound by a checkpoint effect in `design-philosophy`) and
`post-impl-review::architecture-summary` (`skip_architecture_summary != true`, a seeded default).
**6 of 82 gated steps got an answer: 7.3%.** TOP-01 projected 44 work-package steps and 6 meta steps
moving from guaranteed-lazy to bundleable.

**Corpus-wide ceiling**, computed by running the server's own `buildProducerIndex`,
`variablesWrittenIn` and `gateAnswer` over every activity with a bag holding only the declared
defaults:

| | meta | work-package |
|---|---|---|
| technique steps | 23 | 176 |
| ungated | 11 | 85 |
| gated | 12 | 91 |
| gated and vetoed by a same-activity write (unanswerable whatever the bag holds) | **11** | **34** |
| gated and answerable if the bag held a value | 1 | 57 |
| answered on defaults alone: true / false / unanswered | 1 / 0 / 11 | 1 / 3 / 87 |

So the prior report's "89 of 174 work-package steps and 12 of 23 meta steps, permanently lazy"
becomes, on today's build: **34 of 176 and 11 of 23 are permanently lazy by construction**, and 57
and 1 are conditionally recoverable. The permanently-lazy meta count falls from 12 to 11.

**Why the 57 are not recovered.** Two independent reasons, both measured:

1. *Nothing relays the writes.* The server's bag is populated only by `seedDefaults` at creation and
   by checkpoint `setVariable` effects applied inside `respond_checkpoint`. Technique outputs and
   `action: set` targets reach the server only through `next_activity`'s `variables_changed`
   parameter — and **neither of the corpus's two `next_activity` call sites passes it**
   (`meta/techniques/workflow-engine/dispatch-activity.md:50`,
   `meta/techniques/workflow-engine/continue-batch.md:46`). The worker compiles the map
   (`finalize-activity.md:72`) and the orchestrator drops it. This is not a benchmark artifact: it
   is the protocol.
2. *The predicate demands positive proof where the runtime does not.* `gateAnswer` returns
   `undefined` for any `!=` comparison whose variable is absent (`gate-liveness.ts:99-100` collects
   `cmp` paths regardless of operator; `:161-163` withholds on any absent value), while both
   reference evaluators answer such a gate confidently as true. The corpus spells "not in that mode"
   exactly that way. Measured: **13 work-package technique steps** are undecided solely for this
   reason and would all answer `true` — `plan-prepare::update-pr`, `strategic-review::refresh-pr-body`,
   `strategic-review::apply-cleanup`, `submit-for-review::dco-sign-off`, `submit-for-review::push-commits`,
   `submit-for-review::update-description`, `submit-for-review::instruct-merge-strategy` among them.

The helper that would widen the predicate is in the same 175-line module —
`unboundPositiveReads` (`gate-liveness.ts:86-131`) — and **it has zero callers under `src/`**. Its
only non-test consumer is the e2e walker (`tests/e2e/walker.ts:20, 446`).

## Does the delivery-cost gate run, and can it resolve what it guards?

**It runs.** `.github/workflows/verify.yml:82-83`. The corpus is checked out at the superproject's
pinned gitlink first (lines 41-52), so a delta is attributable to the tree under review. `npm run`
propagates the script's exit code; the script exits 3 on gate failure and 2 on an incomplete walk,
so both fail the job. Running it here reproduces the fixture exactly and passes.

**Its resolution is a policy choice, not a measurement limit.** The walk is deterministic to the
character — the re-run returned 0%, not 0.1%. The 1% threshold therefore admits **13,023 characters
of unreported growth per merge**, which is more than the entire measured saving from the flagship
gate-liveness change and more than twice the largest mechanisation candidate. The instrument can see
a one-character change and is configured to ignore anything under 13,023.

**Three narrower limits, each measured.**

- It walks `work-package` only (`scripts/run-token-benchmark.ts:384`). `meta` — 5 activities, 23
  technique steps, 5 checkpoints, 291 KB — is not gated at all, and the CI invocation does not pass
  `--workflow`.
- The baseline it compares against lives in the same tree and is re-recorded by the same commit that
  moves it, which is documented as the intended workflow (`docs/development.md` § The gate runs on
  every pull request). The ratchet is self-serve; what enforces it is review of the fixture's
  `description` field.
- The corpus-mismatch check is report-only (`run-token-benchmark.ts:550-553`). My local run emitted
  *"Corpus mismatch: reference recorded at workflows@72db28ae, this walk ran workflows@2e8b6297"* and
  passed. In CI the pin makes them agree; locally the attribution guarantee is advisory.

## Workflow-version drift on resumed sessions

**Partly closed.** `start_session`'s resume branch now computes `versionDrift`, late-seeds the
declared defaults the bag lacks without overwriting any value already present, and re-stamps
`workflowVersion` (`src/tools/resource-tools.ts:277-315`). A test copies the fixture corpus, bumps
its version, adds a declaration and asserts both the seed and the re-stamp
(`tests/variable-seeding.test.ts:417-490`). The pre-landing census is documented
(`docs/development.md` § Sessions in flight).

Four gaps remain, and the first is the one the prior report named as the whole problem:

1. **The drift is still silent.** No warning, no `validation` entry, no history event. The response
   reports `workflow.version` — the *new* value — and the file is re-stamped in place, so after the
   call nothing anywhere records that a version change occurred. The success signal and the
   no-change signal remain the same value.
2. **Only `start_session` checks.** A worker resuming after a gate calls `resume_checkpoint`; a child
   is created by `dispatch_child`. Neither compares versions (`workflowVersion` appears at
   `resource-tools.ts:280, 304, 342, 555, 599` — the last two are creation paths).
3. **The seed covers workflow-level declarations only**, and only those carrying a `defaultValue`.
   A declaration without one, and any activity-scoped state, still arrives absent.
4. **A changed default is not applied.** The filter is `state.variables?.[name] === undefined`, so a
   variable whose declared default moved from `false` to `true` keeps the old seeded value forever —
   correctly, since it may be a decision, but indistinguishably from one.

## Regressions the remediation introduced

1. **Fresh-mode collapse on identity alone.** `mayReferBack = bundle !== 'full' && (referenceMode ||
   hasDispatch(state, scope))` (`workflow-tools.ts:877`). Before, `context_mode: fresh` never emitted
   a marker. Now the second delivery to any `agent_id` the server has met collapses the worker
   bundle, its `rules`, and `activity_rules`, in every mode. The corpus mitigates by convention — a
   replacement worker mints a new identity (`dispatch-activity.md:55, 93`) — but
   `dispatch-activity.md:56` explicitly reuses `{worker_agent_id}` via `continue-agent` "when the
   harness still reports the worker live". A context that was summarised or compacted while live
   keeps its identity and receives a marker for bytes it no longer holds. This is TOP-11's second
   half, promoted from a persistent-mode hazard to an every-mode one. The ledger is dropped only on
   an explicit mode change to `fresh` (`resource-tools.ts:289, 297-303`), which a compaction is not.
2. **Presence in `step_techniques` no longer implies "ungated".** The note
   (`workflow-tools.ts:1184`) still says *"Engage the inlined steps strictly in step order"* and
   enumerates only the reasons a step may be **absent**. It never says a **present** entry may carry
   a gate that has since answered differently. Previously the map contained only ungated steps, so
   the imperative was safe. `docs/resource_resolution_model.md:263` states the correct rule; the
   wire note the worker actually reads does not.
3. **A `false` answer can be wrong about the run.** `gateAnswer` reads `state.variables`, which never
   receives `action: set` writes. `start-work-package` sets `gitnexus_indexed: true` via
   `action: set` (`01-start-work-package.yaml:164-168`), the variable is declared with
   `defaultValue: false` (`work-package/workflow.yaml:540-543`), and
   `post-impl-review::gitnexus-detect-changes-preflight` is gated `gitnexus_indexed == true`. The
   server therefore answers **`false`** for a gate the run answers **`true`**, and records it as
   `lazy_gate_false` — "a gate this activity reads as no". Today the only cost is a lazy fetch. The
   same predicate is what TOP-04's dead-step pruning would be built on, and there it would delete a
   step the run must execute.
4. **The batch-policy evidence was deleted, not relocated with its numbers.** The 40-line comment at
   `src/config.ts:158-198` recording the measurements behind 0.35 and 3 was replaced by a four-line
   pointer. The values are unchanged and ECO-06's re-measurement was not done, so the dial is now
   both unturned and unexplained at the site that defines it.
5. **The new #469 instrument cannot separate its own false positives.** `gatesReadUnbound`
   (`tests/e2e/walker.ts:440-448`) records a gate only when the variable is in `decidedLater` — the
   set of names the activity's *checkpoints and `set` actions* bind. Technique outputs are not in
   that set, and the walker executes no technique, so the committed snapshot records **20 entries for
   `start-work-package` on the primary walk** (12 × `issue_platform`, 8 × `is_review_mode`) that are
   walker artifacts rather than defects. They are indistinguishable in the artifact from a real
   ordering defect, which is the exact failure the instrument was built to end.
6. **`check-decision-order` scans top-level steps only.** `steps.forEach(...)` over `def?.steps` with
   `steps.slice(0, index)` (`scripts/check-decision-order.ts:187-194`) — no recursion into
   `kind: loop`. work-package carries 15 loop steps and meta 2; a checkpoint inside a loop body, or a
   reader inside one, is invisible to the guard. It is also single-activity: a checkpoint in
   activity 5 deciding a value read in activity 3 is out of scope.
7. **The guard's largest exemption re-admits RED-03.** `defaultedVariables`
   (`check-decision-order.ts:159-171`) exempts any variable carrying a `defaultValue`, on the reason
   that "the earlier read has the default to read". But when the default is `false` and the reader is
   gated on `true`, the earlier read is skipped and the later answer changes nothing — precisely the
   class RED-03 named. 103 of work-package's declared variables carry defaults.

## Claim

**The remediation removed 477,973 characters from a walk without removing a single round trip that a
decision-timing choice had created, and its own flagship mechanism — the server answering gates it
holds the variables for — is inert for 92.7% of the gated steps it was built for, because no call
site in the corpus relays the writes the server would need. The deepest structural problem is not
that mechanisms go unwired. It is that this system's two halves — a server that owns state and a
corpus that owns protocol — each hold exactly half of every capability, and nothing in the build can
fail when only one half lands.**

Falsifiable in three ways, all checkable in this tree:

- If the problem were "unwired mechanisms", wiring `gate-liveness` would have moved the number. It
  moved it by 2 bundled steps and one `get_technique` call.
- If the halves were independently verifiable, some check would fail when a server capability lands
  without its protocol. `npm run check:all` passes 27 of 28 (the one failure is an untracked local
  probe file), the vitest suite passes, and the delivery gate passes at 0.0% — with
  `_meta.batch` on `next_activity` read by nothing, `unboundPositiveReads` called by nothing under
  `src/`, and `variables_changed` passed by nothing.
- If it were a corpus problem, the definition PRs would carry the saving. They cost +6,180
  characters.

## Dialectic

**The defender.** The claim is supported by the strongest available evidence: a bit-exact
reproduction. Three capabilities landed in the same week, each fully implemented, tested, and
documented server-side, and each with a corpus-side half that did not land. `_meta.batch` is
computed and returned; `dispatch-activity.md:50` calls `next_activity { session_index, activity_id,
step_manifest }` and `continue-batch.md:46` adds only `agent_id`. `activity-worker.md:84` still
instructs the worker to read `may_continue` from the `get_activity` response, and
`dispatch-activity.md:97` still *documents as correct* the open-time reading TOP-05 was raised to
replace. That is not an omission; it is a contradiction between two files in one corpus, and no
guard among 28 compares a tool's parameter list to the prose that calls it.

**The attacker.** The claim overreaches by treating a design decision as a defect. Passing
`variables_changed` on `next_activity` writes worker-derived values into a sealed session file the
server is the authority for; the corpus withholding them may be deliberate distrust, and
`dispatch-activity.md:71` says exactly that — where session record and envelope disagree, the
envelope governs *and the discrepancy is logged*. Further, the attacker points out that the
remediation delivered a 26.8% fall, which is the largest single movement in this system's recorded
history, and did it in one commit. A claim whose evidence is "the biggest win ever recorded came
from the wrong half" is a claim about attribution, not about structure. And CTX-01 — the item that
produced 74.7% of the saving — required no corpus change at all, which is a counter-example to the
"two halves" claim, not an instance of it.

**The prober.** Both take for granted that "delivery characters on the 12-activity walk" is the
resource being conserved. It is not what the system spends. Today's walk issues 242 tool calls and
10 human checkpoint triples; the prior report priced one checkpoint at seven hops and one dispatch at
a measured mean of 87 seconds. The 477,973 characters are roughly 119,000 tokens — real, but a
fraction of one worker context. The 30 checkpoint calls and 12 dispatches are wall-clock and human
attention. Both parties accept the instrument's frame because it is the only instrument, and the
instrument measures the one quantity that a single-half change can move. The defender's evidence and
the attacker's counter-example are the same fact seen through a meter that cannot see round trips.

**Where the claim lands.** The prober is right that the resource is misnamed, and that changes the
claim. The transformed claim:

> Every capability in this system is split between a server that holds state and a corpus that holds
> protocol. Delivered bytes can be reduced from the server half alone; **round trips cannot** — every
> round trip exists because a reading was taken at one moment and needed at another, and the moments
> are named in the corpus. The one instrument in the repository measures bytes. So the half that can
> act alone is exactly the half the instrument can see, and the programme will keep converging on
> byte reductions while the round-trip count stays flat, reporting success each time.

The evidence for the transformed claim is in the trajectory: 26.8% of the bytes gone, and the call
profile essentially unchanged — `get_resource` 162 → 162, `get_activity` 12 → 12, `next_activity`
12 → 12, `get_technique` 25 → 24, `yield`/`respond`/`resume` 11 triples → 10. Total calls fell from
246 to 242 — **four calls of 246, 1.6%** — against a 26.85% fall in bytes. Three of those four are
the dropped checkpoint triple, and it came from a **definition** change (`project_type ==
rust-substrate` on the build-artifact gate), which cost bytes.

**The gap between the original and transformed claim is the diagnostic.** The original blamed a
process failure ("halves land alone"). The transformed one identifies a *selection pressure*: the
instrument admits only single-half changes, so single-half changes are what get built. The original
claim would be fixed by discipline. The transformed one would not.

## Concealment Mechanism

**This codebase conceals its real problems by making the incomplete state of a capability
indistinguishable from its complete state, at every observation point it offers.**

Three concrete forms, each verified here:

- *An optional parameter is a silent half-landing.* `context_tokens` on `next_activity`
  (`workflow-tools.ts:529-531`) is `.optional()`. Omitted, the `_meta.batch` block is simply absent
  (`:744`). Absent is also what a terminal activity returns. There is no shape of response that says
  "the caller did not ask".
- *An `undefined` gate answer is both "unknowable" and "unrelayed".* `gateAnswer` returns
  `undefined` when a variable is absent from the bag. It cannot distinguish a variable no producer
  exists for from one whose producer ran and whose write nobody forwarded. 76 of 82 gated steps on
  the measured walk are in that bucket; 57 of 91 corpus-wide are the second kind.
- *An empty finding list is both "clean" and "not looked at".* All 70 binding-fidelity verdicts are
  "harmless"; `check-decision-order` reports OK while never entering a loop body; the anchor guard
  reports clean while skipping 514 unanchored links.

**Applying the mechanism to the remediation itself.** Every artifact the remediation produced to
prove its work reports the incomplete state as the complete one. The delivery gate passes at 0.0%.
The guard sweep passes. `lazy_gate_unanswered: 76` is written to a log line that no benchmark, no
snapshot and no test reads — I had to grep the harness's stderr to obtain it. `gatesReadUnbound` is
in the committed snapshot with 20 entries and no way to tell which are real. The remediation's own
evidence base has the property it was built to remove.

## Improvements

### Improvement 1 — a change that would pass review and deepen the concealment

**"Make the batch reading unmissable: default `context_tokens` on `next_activity` from the session."**

```ts
// next_activity, replacing the guard at workflow-tools.ts:744
const declaredTokens = context_tokens ?? lastDeclaredContextTokens(state, agent_id);
if (agent_id && declaredTokens !== undefined && !isTerminal) {
  const bound = batchBound(declaredTokens, { /* … as today … */ });
  const stand = batchState(state, agent_id, bound);
  meta['batch'] = { /* … as today … */, may_continue: batchRefusal(...) === undefined };
}
```

`lastDeclaredContextTokens` reads the window the same scope declared on its most recent
`get_activity` — a value the server already receives and could record. This is a genuinely good
change by every local standard. It removes an optional parameter as a failure mode, needs no corpus
edit (which the prior report ranks as the cheapest class), is backward compatible, is about ten lines
plus one recorded field, and closes TOP-05 on the server side completely. It would pass review in a
paragraph.

**What it conceals.** `_meta.batch` would now be present on essentially every `next_activity`
response — and *still read by nothing*. The corpus reads `may_continue` from `get_activity`
(`activity-worker.md:38`) and carries it forward through `finalize-activity`'s
`batch_may_continue`. After the change, the boundary reading exists, is populated, is correct, and
is discarded, while every response carries visible evidence that the capability shipped. The one
observable that currently distinguishes "built but not adopted" from "adopted" — the block's absence
— is removed. This is exactly the concealment mechanism, applied deliberately and defensibly.

**Three properties of the problem visible only because I tried to strengthen it:**

1. **The corpus cannot be made to read a value by making the value available.** Adoption requires an
   edit to `activity-worker.md`, `finalize-activity.md` and `dispatch-activity.md#97`, whose own
   prose currently *asserts* the open-time reading is correct. A server-side improvement cannot
   retract a claim made in a definition file. The two halves are not merely separate; one of them
   contains normative statements about the other's behaviour that the other cannot edit.
2. **The absence of a response field is this system's only cross-half liveness signal.** Nothing else
   reports whether a capability is consumed: history events record deliveries, not reads; the
   benchmark records characters, not fields; the guards read files, not traffic. Every improvement
   that fills in a field destroys the only evidence that the field is unread.
3. **The batch reading is not one value but two, and only one of them is a server property.** The
   server can compute what a context has been *delivered*. What it needs to bound is what a context
   *holds* after compaction, summarisation, and the agent's own reading. `batchState` marks
   `scope === state.agentId` exempt outright (`batch.ts:154`), which is a confession: for the
   commonest topology the bound is not computed at all. Improving the reporting of a quantity does
   not improve the quantity.

### Diagnostic applied to Improvement 1

**What it conceals:** that the batch bound is advisory in both directions. Its number becomes more
prominent and its authority does not change.

**What property of the original problem is visible only because Improvement 1 recreates it:** the
original problem is that a *reading* and its *use* are separated by a boundary that carries no
obligation. Improvement 1 recreates it one level up — it moves the reading closer to the use and
adds no obligation, so the gap persists at the same size, now with better instrumentation. **The
recreated property: this system has no construct that makes a produced value's consumption
mandatory.** Techniques declare inputs and outputs; steps bind them; but a *tool response field* has
no declared consumer anywhere in the schema, and `check-binding-fidelity`'s parse domain covers
step bindings, not response fields. That is why `delivered_artifact` (MECH-02) can be declared,
branched on, and never bound by any call site while 28 guards pass — and it is the same shape as
`_meta.batch`.

### Improvement 2 — addressing the recreated property

**"Declare tool-response fields as bindable outputs, and guard that every declared field has a
reader."**

Give each tool's `_meta` block a declared field list in the schema, extend
`check-binding-fidelity`'s producer/consumer model to treat a response field as a producer and a
prose citation of it (`\`may_continue\``, `` `batch_may_continue` ``) as a consumer, and fail on a
declared field no corpus text reads. On this tree it would immediately report `_meta.batch` on
`next_activity`, `lazy_gate_unanswered`, `lazy_gate_false` and `worker_bundle_chars` on the delivery
log line, and — retroactively — `delivered_artifact`'s missing binding. Roughly 150 lines against
the existing guard, one registry entry, one schema addition.

### Diagnostic applied to Improvement 2

**What it conceals:** that "a corpus file mentions the field" and "a run reads the field" are
different propositions. The guard would go green the moment someone writes the field's name into a
technique's prose. `dispatch-activity.md:97` already mentions `batch_may_continue` — and describes
the *wrong* reading. Improvement 2 would pass on that sentence. It converts an absent-consumer defect
into a wrong-consumer defect, which is strictly harder to detect, because now something *is* there.

**What the second diagnostic makes visible:** every verifier available in this repository is an
authoring-time reader of files. `docs/development.md` and the prior report both say so. So any
obligation the system can express is an obligation about *text*, and any obligation about *behaviour*
must be re-encoded as an obligation about text before it can be checked — at which point it checks
the encoding rather than the behaviour. Improvement 2 is not a weak version of the right check; it is
the strongest check the substrate admits.

## Structural Invariant

**Every property this system can verify is a property of one file at one moment. Every property that
costs it money is a relation between two agents across a turn boundary. No improvement changes
which of the two the verification substrate can address, because the substrate is a file reader by
construction — and the one instrument that is not a file reader, the delivery-cost benchmark, is a
robot walk that binds no technique output, so the only cross-turn state it can exhibit is the state
the server would have anyway.**

Evidence that this survived the remediation intact: 28 guards, all file readers. One walk-based
instrument, deterministic to the character, which does not relay `variables_changed` and therefore
measures the server talking to itself. The remediation added a guard (`check-decision-order`, a file
reader, top-level steps only) and a snapshot field (`gatesReadUnbound`, recorded from the same
technique-free walk). The invariant is a property of the problem space: verifying a cross-turn
relation requires an instrument that spans turns, and this system's only such instrument is a
simulation of one of the two parties.

### Inverting the invariant

Make the impossible property — verifying a cross-turn relation — trivially satisfiable. The design
that does it: **make the server the only party that holds state, and make every step's inputs and
outputs pass through it.** Concretely: `next_activity` and `respond_checkpoint` become the only
writers, every technique output is a declared server-side write refused if unbound, and every gate
is evaluated server-side at the moment of reading. Then a cross-turn relation is an intra-process
relation, checkable by a unit test. The parts exist — `applyVariableWrites`, `buildProducerIndex`,
two condition evaluators, the delivery ledger, the seal.

**The new impossibility the inversion creates: the agent can no longer be the thing that decides.**
Every value the server must hold has to arrive in a shape the server can validate, which means every
judgement — "the problem is complex", "the review found actionable issues", "the mode is ambiguous" —
must be reduced to a declared enum before it crosses the boundary. This system's whole value
proposition is that judgement stays with the agent and structure stays with the server; the corpus
says so in 37,962 and 79,032 words. Under the inversion, the 91 gated work-package technique steps
become 91 places where an agent's reading must be pre-encoded, and the 44 checkpoints become the only
remaining places judgement enters — which is precisely the "gate-delimited segment as the delivery
unit" alternative the prior report considered and rejected at two to four times the saving.

## Conservation Law

**THE UNRELAYED-READING LAW.** *Every reading this system takes is produced in one agent's turn and
consumed in another's. The turn boundary conserves total unrelayed readings: a change that moves a
reading's producer closer to the server removes it from the corpus's relay obligation and adds it to
the server's validation obligation, and a change that moves it closer to the agent does the reverse.
Bytes can be freed on either side independently; **readings cannot be created or destroyed by either
side alone, only re-homed** — and an unrelayed reading is paid for exactly once, as a round trip.*

The remediation is a clean test. It re-homed **zero** readings (no `variables_changed` relay was
added, no gate moved server-side in the sense of receiving its inputs) and freed 477,973 bytes. Round
trips fell by four calls of 246 (1.6%) — one checkpoint triple and one technique fetch — and the
triple came from a definition edit that added bytes. Bytes moved; readings did not.

### Producer / clearer ledger

The conserved resource is **an unrelayed reading**: a value written in one turn that a later turn's
gate, bundle decision or bound needs. A *producer* creates one. A *clearer* ends its lifecycle by
delivering it to the party that needs it. An unmatched producer means the reading is re-established
by a round trip, or silently read as its default, on some reachable termination path.

| # | Resource instance | Producers (every site) | Clearers (every site) | Termination paths traced | Verdict |
|---|---|---|---|---|---|
| R1 | Technique output value (e.g. `gitnexus_indexed`, `issue_platform`, `validation_passed`) | Technique execution in a worker turn; `finalize-activity.md:72` folds it into the envelope's `variables_changed` | `next_activity`'s `variables_changed` → `applyVariableWrites` (`workflow-tools.ts:600-605`) | normal completion: **no clearer** — `dispatch-activity.md:50` and `continue-batch.md:46` omit the parameter. early return / error / batch refusal: no clearer. teardown: no clearer. | **UNMATCHED on every path.** 206 distinct produced names in work-package, 477 producer sites, none relayed. |
| R2 | `action: set` target (e.g. `gitnexus_indexed`) | `action: set` executed by the worker (`01-start-work-package.yaml:164-168` and 30 other sites) | same `variables_changed` channel | all paths: **no clearer** | **UNMATCHED on every path.** Consequence measured: the server answers `false` for `gitnexus_indexed == true` where the run answers `true`. |
| R3 | Checkpoint decision (`setVariable` effect) | `respond_checkpoint` option effect | `applyVariableWrites` inside the same call (`workflow-tools.ts:1712-1716`) | normal: matched. `condition_not_met`: no write, nothing produced. auto-advance: matched (default option's effects applied unchanged). | **MATCHED.** The one reading class that is relayed — and the only class `gateAnswer` ever answers from. |
| R4 | Declared default | `seedDefaults` at creation (`resource-tools.ts:356`), at child dispatch (`:483`), and now at version drift (`:281-286`) | the bag itself | fresh: matched. resume with drift: matched. resume without drift: matched (already present). `resume_checkpoint` / `dispatch_child` on a drifted definition: **no clearer** | **PARTLY MATCHED.** Gap 2 of the version-drift section. |
| R5 | Batch standing (`may_continue`) | `batchState` at `get_activity` (`workflow-tools.ts:1332-1339`); `batchState` at `next_activity` (`:750-756`) | worker reads the `get_activity` copy (`activity-worker.md:38, 54`) and relays it as `batch_may_continue` | normal: the **open-time** reading is cleared; the boundary reading has **no clearer** — no corpus text reads `_meta.batch` and no call site sends `context_tokens`. refusal: cleared by the refusal message. | **UNMATCHED for the boundary producer.** The stale reading it was built to replace is the one still consumed. |
| R6 | Gate answer at delivery (`true`/`false`/`undefined`) | `gateAnswer` per technique step (`workflow-tools.ts:993-999`) | `true` → the bundle; `false`/`undefined` → the counters `lazyFalseGates` / `lazyUnansweredGates` | normal: the `true` branch is cleared into `step_techniques`. The counters go to `logInfo` (`:1352-1354`) and to **no `_meta` field, no history event, no benchmark metric, no test**. | **UNMATCHED for 80 of 82 answers on the measured walk.** The counters are produced 12 times per walk and consumed zero times. |
| R7 | Delivered-content hash | `recordDeliveries` on every delivery path | `deliveredHash` lookup gated by `mayReferBack` / `referenceMode` | returning identity: matched. new identity: correctly not matched (full delivery). **same identity, replaced or compacted context**: produced, matched against, and the bytes are not there. | **UNMATCHED on the compaction path.** 265 ledger keys per walk; the corpus's only defence is prose at `dispatch-activity.md:55, 93`. |
| R8 | Corpus revision a verdict was made against | `corpusSha` in `binding-fidelity-triage.json:3`; `workflowsRev` in the benchmark fixture | `triageStampNote` (`check-binding-fidelity.ts:751-768`) — reports, never fails; `resolveCorpusRev` in the benchmark — reports, never fails | all paths: **reported, never enforced** | **MATCHED as a report, UNMATCHED as an obligation.** Currently reads 183 corpus commits of drift on 70 verdicts. |
| R9 | Unbound-positive-read list | `unboundPositiveReads` (`gate-liveness.ts:86-131`) | `tests/e2e/walker.ts:446`, filtered to `decidedLater` | e2e walk: partly cleared (20 of the recorded entries are walker artifacts). **production delivery: no caller under `src/`** | **UNMATCHED in production.** The widening the delivery layer needs is implemented and reachable only from a test. |

**Verdict: the conservation law does not hold.** Six of nine resources have an unmatched producer on
a normally-reachable termination path (R1, R2, R5, R6, R7, R9), and two more are partial (R4, R8).
R1 and R2 together are the whole of the unrealised gate-liveness ceiling: 57 of 91 work-package
gated technique steps are answerable *iff* R1/R2 are cleared, and they are cleared nowhere.

## Meta-Law

### Applying the diagnostic to the conservation law itself

**What the Unrelayed-Reading Law conceals about this specific problem:** it says readings can only be
*re-homed*, which frames the corpus and the server as two accounts of one balance sheet. That framing
hides the fact that **the two halves do not disagree about the readings — they disagree about which
moment counts as "now".** The server's bag is a snapshot at activity open. The corpus's protocol is a
sequence of moments inside the activity. `variablesWrittenIn` (`gate-liveness.ts:67-76`) collapses an
entire activity to one point in time: any variable written *anywhere* in the activity vetoes every
gate reading it, regardless of position. `check-decision-order` does the exact opposite: it exists
solely to enforce *position within the activity*, requiring the deciding checkpoint to precede its
readers.

These two rules, both shipped in the same week, are in direct opposition. The better the corpus
satisfies the guard — decide early, decide in-activity, put the checkpoint above its readers — the
more variables land in `variablesWrittenIn` for that activity, and the more steps
`gateAnswer` refuses to answer. `start-work-package` is the measured proof: it is the activity PR #470
reordered to satisfy the guard, and of its 32 technique steps, 11 are ungated, **21 are self-write-vetoed,
and 0 are answerable-if-bound**. It is the heaviest activity in the corpus and gate-liveness can never
recover a single step of it.

**The structural invariant of the law**: any accounting that treats the corpus and the server as two
accounts of one resource must pick a time granularity, and there is only one granularity both parties
share — the activity. The server delivers per activity; the corpus decides per step. So every
cross-half reasoning is forced to round step-granular facts up to activity granularity, which is
exactly where the information is lost.

**Inverting that invariant**: make delivery step-granular — a `get_step` that composes one step's
technique at the moment the worker reaches it, with the bag as it stands. Every gate is then decided
at the true moment, `variablesWrittenIn` disappears, and all 91 gated work-package steps become
answerable. **The new impossibility: there is no bundle left to save.** Eager bundling *is* the
practice of delivering ahead of the moment; a step-granular delivery is 176 round trips instead of 12,
which is precisely the round-trip cost the transformed claim says dominates.

### The meta-law

**THE ROUNDING LAW.** *In this system, delivery cost and decision accuracy are read at two different
time granularities — the activity and the step — and every mechanism must round one to the other.
Rounding step facts up to the activity buys bundling and loses gate answers; rounding activity
delivery down to the step buys gate answers and loses bundling. The saving from any bundling change
is therefore bounded above by the number of gated steps whose deciding write lands in a **different**
activity from their read — a static, countable property of the corpus that no server change can
alter, and that the corpus's own correctness guard actively drives toward zero.*

This is not a generalisation. It is a specific number in this corpus, and it predicts specific,
falsifiable outcomes:

**Concrete testable prediction.** The static count today is **57 in work-package and 1 in meta**
(measured above: gated technique steps whose gate reads no bag entry the same activity produces).
Therefore:

1. **Relaying `variables_changed` on `next_activity` — a two-word edit to
   `dispatch-activity.md:50` and `continue-batch.md:46`, no server change — will move `technique_bundled`
   on the benchmark walk from 66 toward the low 90s and `get_technique` calls from 24 toward the
   mid-teens.** No amount of further work on `gate-liveness.ts` will do this, because 34 of the 91
   are vetoed regardless of the bag.
2. **The ceiling will fall as `check-decision-order` is satisfied.** Every future fix that moves a
   checkpoint above its readers inside one activity converts an "answerable-if-bound" step into a
   "self-write-vetoed" one. PR #470 already did this: it moved `platform-selection` above 12 readers
   of `issue_platform` in `start-work-package`, and those 12 steps are now permanently unbundleable.
   Prediction: **each further decision-order fix reduces the bundling ceiling by the number of
   in-activity readers it moves the checkpoint above**, and the delivery gate will report this as
   flat or slightly improved, because withheld steps cost nothing in bytes on the walk that gates it.
3. **The delivery gate will never fail on any of it.** The gate measures bytes over a walk whose bag
   holds only defaults and checkpoint effects. A change that alters 57 gate answers moves bytes only
   if those steps' techniques enter the bundle, and on the gated walk they cannot, because their
   inputs are never relayed. **The instrument that guards the programme is structurally blind to the
   programme's largest remaining item.** Test it directly: relay `variables_changed`, re-run
   `bench:token --gate`, and the gate will pass — while `technique_bundled` rises by roughly 25 and
   round trips fall by roughly 8.

## Bug Table

`F` = fixable (the conservation law says a matching clearer can be added). `S` = structural (the law
predicts the defect returns in another form, because it is a property of the two-granularity split).
Every unmatched producer from the ledger appears here.

| # | Location | What breaks | Severity | Class | Ledger row |
|---|---|---|---|---|---|
| B1 | `meta/techniques/workflow-engine/dispatch-activity.md:50`; `continue-batch.md:46` | Neither `next_activity` call site passes `variables_changed`, so no technique output and no `action: set` write ever reaches the server bag. 477 producer sites in work-package, 206 distinct names, zero relayed. Directly causes 57 of 91 gated steps to stay lazy. | HIGH | **F** | R1, R2 |
| B2 | `src/tools/workflow-tools.ts:993-999` + `work-package/workflow.yaml:540-543` + `01-start-work-package.yaml:164-168` | `gateAnswer` returns `false` for `gitnexus_indexed == true` at `post-impl-review`, because the bag holds the seeded `false` while the run set `true`. A *wrong* answer, not a conservative one. Harmless today; fatal under TOP-04 pruning. | HIGH | **F** | R2 |
| B3 | `src/tools/workflow-tools.ts:877` | `mayReferBack` collapses the worker bundle on `agent_id` alone in every mode. A live-but-compacted worker keeps its identity (`dispatch-activity.md:56` reuses it via `continue-agent`) and receives markers for bytes it no longer holds. Ledger cleared only on an explicit mode change to `fresh` (`resource-tools.ts:289`). | HIGH | **S** | R7 |
| B4 | `src/tools/workflow-tools.ts:1184` | `step_techniques_note` tells the worker to "engage the inlined steps strictly in step order" and enumerates only reasons for **absence**. A present entry may now carry a gate. The correct rule is stated only in `docs/resource_resolution_model.md:263`, which the worker never receives. | HIGH | **F** | R6 |
| B5 | `src/tools/workflow-tools.ts:744` + `activity-worker.md:38, 54, 84` + `dispatch-activity.md:97` | `_meta.batch` at the activity boundary is produced and read by nothing; the corpus still consumes the stale open-time reading and its prose asserts that reading is correct. TOP-05 half-landed. | MEDIUM | **S** | R5 |
| B6 | `src/tools/workflow-tools.ts:1352-1354` | `lazy_gate_unanswered` / `lazy_gate_false` / `worker_bundle_chars` are emitted to `logInfo` only — absent from `_meta`, from history events, from the benchmark metrics and from every test. Obtaining them required grepping harness stderr. | MEDIUM | **F** | R6 |
| B7 | `src/utils/gate-liveness.ts:86-131` | `unboundPositiveReads` has zero callers under `src/`. The delivery predicate demands positive proof where both reference evaluators answer confidently on `!=`, costing 13 measured work-package steps that would all answer `true`. | MEDIUM | **F** | R9 |
| B8 | `scripts/check-decision-order.ts:187-194` | The guard iterates top-level `steps` only — no recursion into `kind: loop`. 15 loop steps in work-package, 2 in meta are unscanned. It is also single-activity, so a cross-activity ordering defect is out of scope. Reports OK. | MEDIUM | **F** | — |
| B9 | `scripts/check-decision-order.ts:159-171, 191` | The `defaultValue` exemption re-admits RED-03: when the default is `false` and the reader is gated on `true`, the earlier read is skipped and the checkpoint's answer changes nothing. 103 of work-package's declared variables carry defaults. | MEDIUM | **S** | — |
| B10 | `tests/e2e/walker.ts:440-448`; `tests/e2e/__snapshots__/snapshot.test.ts.snap:50-70` | `gatesReadUnbound` filters on `decidedLater`, which excludes technique outputs, and the walker runs no technique — so 20 committed entries for `start-work-package` (12 `issue_platform`, 8 `is_review_mode`) are walker artifacts, indistinguishable in the artifact from real defects. | MEDIUM | **S** | — |
| B11 | `src/tools/resource-tools.ts:277-315` | Version drift is detected, seeded and re-stamped **silently**: no warning, no `validation` entry, no history event, and the response reports only the new version. The success and no-change signals remain identical. | MEDIUM | **F** | R4 |
| B12 | `src/tools/resource-tools.ts` (`resume_checkpoint`, `dispatch_child` paths) | Only `start_session` compares versions. A worker resuming after a gate, and a child dispatched under a drifted parent, take no late seed. | MEDIUM | **F** | R4 |
| B13 | `src/tools/resource-tools.ts:281-286` | The late seed covers workflow-level declarations carrying a `defaultValue` only, and skips any name already present — so a changed default never applies, indistinguishably from a preserved decision. | LOW | **S** | R4 |
| B14 | `scripts/run-token-benchmark.ts:384` + `.github/workflows/verify.yml:83` | The CI gate walks `work-package` only. `meta` — 5 activities, 23 technique steps, 291 KB — is ungated. | MEDIUM | **F** | — |
| B15 | `scripts/run-token-benchmark.ts:173, 352` | With a bit-exactly reproducible walk (measured 0.0%), the 1% threshold is 13,023 characters of deliberate slack, larger than the whole measured gate-liveness saving and than the largest mechanisation candidate. | MEDIUM | **F** | — |
| B16 | `scripts/run-token-benchmark.ts:550-553` | The corpus-mismatch check is report-only. My run emitted the mismatch banner and still passed. Locally the gate's attribution guarantee is advisory. | LOW | **F** | R8 |
| B17 | `docs/resource_resolution_model.md:256` | The doc claims a `false`-gated step ships "nothing". The step's YAML body still travels in the activity payload; only the technique protocol is withheld. TOP-04 is untouched. | LOW | **F** | — |
| B18 | `meta/techniques/workflow-engine/sync-progress-status.md:32, 54` | `delivered_artifact` still has no producer: two references corpus-wide, both inside the declaring file. The documented repoint policy never fires. Unchanged by the remediation, and 28 guards pass. | MEDIUM | **S** | R1 |
| B19 | `work-package/workflow.yaml` + `11-validate.yaml` | Four defaulted work-package variables are read by a gate with no producer site anywhere: `validation_passed` (2 reads), `has_open_questions`, `skip_architecture_summary`, `stealth_mode` (22 reads). `validation_passed` is the safety-floor case RED-05 named. | MEDIUM | **F** | — |
| B20 | `scripts/binding-fidelity-triage.json` | 70 of 70 verdicts are "harmless"; 0 fix-later, 0 live-bug. The stamp note now reports 183 corpus commits of drift against those verdicts. A register in which nothing is ever classified as debt has stopped distinguishing — and the drift is now measured rather than merely suspected. | LOW | **S** | R8 |
| B21 | `src/config.ts:158-198` (deleted) | The comment recording the measurements behind `DEFAULT_BATCH_HEADROOM_FRACTION = 0.35` and `DEFAULT_BATCH_MAX_ACTIVITIES = 3` was replaced by a pointer, and ECO-06's re-measurement was not performed. The dial is now unturned and unexplained at its definition site. | LOW | **F** | — |
| B22 | `src/utils/batch.ts:154` | `batchState` marks `scope === state.agentId` exempt from both limits, so on a solo session — the topology the benchmark walks and the one every measurement in this report uses — the bound is not computed at all. | LOW | **S** | R5 |
| B23 | `01-start-work-package.yaml:294`; `11-validate.yaml:47`; `13-submit-for-review.yaml:41, 360`; `prism/activities/00-select-mode.yaml:11` | Four work-package `actions: []` steps (plus one in prism) remain after `dispatch-prism` was fixed; no guard rejects an empty action list. Each carries a gate and cannot act. | LOW | **F** | — |
| B24 | `src/tools/workflow-tools.ts:964-1010` vs `src/utils/gate-liveness.ts:67-76` | `variablesWrittenIn` is activity-granular: a variable written anywhere in the activity vetoes every gate reading it, at any position. `start-work-package` — the activity PR #470 reordered — has 21 of 32 technique steps self-write-vetoed and 0 answerable. The correctness guard and the bundling predicate pull in opposite directions. | HIGH | **S** | R6 |
| B25 | environment, not the repository | `npm run check:all` fails locally on `source-encoding` because of untracked probe files left in the checkout root (`.probe-blocks.ts`, `.probe-delivery.ts`, `.probe-timing.ts`, `scratch-lens14.ts`, `scratch-reach.ts`, `scripts/tmp-gate-census.ts`). CI checks out clean and passes. The stray `scripts/tmp-gate-census.ts` sits inside the guarded script directory. | LOW | **F** | — |

**Fixable: 16. Structural: 9.** The structural set is exactly the set the Rounding Law predicts:
every one of B3, B5, B9, B10, B13, B18, B20, B22, B24 is a case where a fact is true at one time
granularity and has to be reported at another, and the reporting site rounds. None of them is
resolved by better implementation at the site where it appears.
