---
Lens: 08 scarcity ("What runs out?")
Dimension: Change Economics
Target: workflow-server — workflows/meta/** and workflows/work-package/**, priced against src/** and scripts/**
Input priced: mechanisation-potential/DEFINITIVE-FINDINGS.md (MECH-01 … MECH-12)
Evaluation Date: 2026-08-17
---

# Portfolio Scarcity — Change Economics of the Twelve Mechanisation Opportunities

This document runs lens 08 `scarcity` over the twelve mechanisation candidates and over the change surface they imply. It does not re-derive the candidates. It prices them, names what each one assumes will never run out, designs the two inversions that gamble on the opposite scarcities, states the conservation law, and predicts what stays immovable.

## 1. The three implementation surfaces, measured

The brief names three surfaces. They are not comparable in cost, and the differences are not the ones the candidate report assumes.

### Surface A — a new tool in `src/tools/`

There is no per-tool file. Eighteen tools live in two functions: fourteen registrations in `src/tools/workflow-tools.ts` (1,877 lines, 102,681 bytes) and **four**, not two, in `src/tools/resource-tools.ts` (944 lines, 48,825 bytes) — `start_session` (line 103) and `dispatch_child` (line 418) via `server.registerTool`, `get_technique` (line 603) and `get_resource` (line 826) via `server.tool`. The grounding figure of "16 registered MCP tools (14 workflow, 2 resource)" undercounts by two, and the two it misses are the two that matter most to this portfolio: the session opener and the child dispatcher.

That undercount is itself a change-economics datum. `tests/docs-drift.test.ts:85` forbids MCP tool tallies in every user-facing document precisely because they drift — the regex catches "registers 16 tools" and "sixteen tools" alike. The guard has already retired the documentation cost of adding a tool; the count still drifted, in this evaluation's own grounding, because the guard's scope excludes `tests/` and planning artifacts.

Marginal cost of tool nineteen:
- one function body appended to a 944- or 1,877-line file, and a choice between two registration APIs already in use side by side in the same file;
- if it writes to the session, one member added to `HistoryEventTypeSchema` in `src/schema/state.schema.ts` — a **closed** `z.enum` of roughly thirty members, currently ending at `batch_refused`;
- a test in `tests/mcp-server.test.ts` plus, if it participates in a walk, the e2e harness;
- **zero** documentation-tally cost, by the guard above.

Its unique property, and the reason it is the only viable surface for several candidates: **a tool reaches the agent no matter where the server's filesystem is.** See scarcity S1.

### Surface B — a script under `scripts/`

Twenty-six `check-*.ts` guards total 5,113 LOC. Median around 160; range 68 (`check-checkpoint-entry.ts`) to 825 (`check-binding-fidelity.ts`). The registry in `scripts/guards.ts` makes a new guard a six-field `GuardSpec` entry (`id`, `script`, `npmScript`, `scope`, `json`, `proves`); `scripts/check-all.ts` and `scripts/check-delta.ts` walk the list, so nothing has to be remembered. `tests/guard-registry.test.ts` (87 lines) then asserts the entry names a script that exists, an npm script that exists, a unique id, a non-empty `proves`, and that no `check:*` in `package.json` escapes the registry.

Measured guard-test sizes: `tests/resource-anchors.test.ts` 15 lines, `tests/review-mode-gating.test.ts` 30, `tests/binding-fidelity.test.ts` 99, `tests/technique-template.test.ts` 128, `tests/set-action-values.test.ts` 170.

So a new **guard** costs roughly 160 LOC of script, a 6-line registry entry, one `package.json` line, and 15–170 lines of test. That is the cheapest new capability in the repo, and the candidate report is right to treat MECH-01's enforcement guard as inexpensive.

But: **all twenty-six guards are read-only and repo-scoped.** Not one script in `scripts/` writes into a user's planning folder. The mutating scripts that do exist — `generate-schemas.ts`, `generate-site-data.ts`, `stamp-corpus-baseline.ts` — write repo build artifacts. MECH-04 (a Progress-cell writer) and MECH-05 (an atomic artifact mint) need a class of script with **zero precedent in the repository**: one that mutates the user's work product. That is not a 160-LOC guard; it is a new trust boundary.

### Surface C — a definition edit in the 907 KB corpus

`workflows/` is a **git submodule** (`.gitmodules`: `url git@github.com:m2ux/workflow-server.git`, `branch workflows`). The superproject records `acbbf1bc9b44622a76e23363fc96adbb109e9947`; the working tree currently sits at `34cd5429` (`workflows/v0.28.0-118-g34cd5429`), 118 commits past the tag. `tests/e2e/__snapshots__/corpus-sha.json` records `acbbf1bc…` — consistent with the recorded pointer, and deliberately distinguishable from the working tree, which is exactly the state that stamp exists to disambiguate.

A one-line definition edit is therefore: a commit in the `workflows` submodule, a pointer bump in the server repo, re-baselining `tests/e2e/__snapshots__/snapshot.test.ts.snap` (72,408 bytes) if any walk output moves, and `npm run baseline:stamp`. Plus the walk time: `tests/e2e/budgets.ts` sets `PER_WALK_MS = 45_000` with the note that a GitHub runner is roughly 4× slower than local and that `definition-lint` already went 60s → 120s as the corpus grew and timed out anyway.

**A definition edit is the surface the candidate report treats as free, and it is the one with the longest round trip.**

One cost that is *not* incurred, and should be recorded as already paid: a definition edit is safe against sessions in flight. The delivery ledger in `src/utils/delivery.ts` maps content key → **sha256 of the payload last delivered in full**, and reference collapse compares hashes, not ids. A technique body edited on disk mid-session produces a different hash and delivers in full to a resuming worker. No candidate in the portfolio carries stale-body risk for a live session.

## 2. Per-opportunity change economics

| ID | Surface | Build cost | Guard/test protecting it | Live-session exposure | Measurable today | Sequence |
|----|---------|-----------|--------------------------|----------------------|------------------|----------|
| MECH-01 | Definition edit (`TECHNIQUE.md`) **+ one addressing capability** (see S1) | Convention: ~1 paragraph. Guard: ~160 LOC + registry entry + npm line + ~30-line test. Addressing: unbudgeted | New guard is its own protection; `guard-registry.test.ts` enforces registration | None | No — nothing measures whether a step invokes or restates | **Blocked on S1.** Cannot precede MECH-04/07/08 |
| MECH-02 | Definition edit — one prose Apply line, `commit-and-persist.md:22` | ~20 words | **None.** `check-binding-fidelity.ts` orphan-input (lines 662–674) iterates `step.technique` YAML bindings; `sync-progress-status` has 19 corpus references and **zero** YAML step bindings | None (adds a value, breaks nothing) | No | **First.** Cheapest correctness fix in the set |
| MECH-03 | Definition edit — `naming-conventions.md:45` table | ~2 table rows | None; no guard checks table totality over an enum | None (branch already minted is unaffected) | No | **First.** Independent |
| MECH-04 | **New mutating script** (no precedent) or new tool | ~200–300 LOC + first-of-class write path into a planning folder + test | None today | Progress README is written by the server's neighbour, not the server — no seal interaction, but the file is user work product | **Partly.** `record_usage` rows count the applications; nothing scores their correctness | After MECH-02 (needs `delivered_artifact` bound) |
| MECH-05 | **New tool** — atomicity spans agent tool calls, which only a single server-side operation closes | ~150–250 LOC in `resource-tools.ts` + one `HistoryEventTypeSchema` member + test | None | Server gains write authority over artifacts, adjacent to the `session.json` + `.session-token` seal pair it writes under `PLANNING_FILE_MODE` | Dispatch/char accounting yes; race incidence no | After MECH-02 — the report notes the wrong instance path lands in a Progress link once MECH-02 lands |
| MECH-06 | Definition edit + **extend an existing guard** | `scripts/check-review-mode-gating.ts` already exists (236 LOC) with an `ACCEPTED_HEADLESS_AUTO_ADVANCE` list; the contradiction assertion is a run-time gate, i.e. a YAML edit | The guard covers auto-advance reachability, **not** classification correctness | 85 `is_review_mode` references, 52 `when:` gates, 29 checkpoint conditions across 11 of 15 activities — the largest definition blast radius in the set | No | Independent; highest blast radius, so sequence after the cheap wins |
| MECH-07 | **Half definition, half script.** `--root` already exists | `scripts/workflows-root.ts` supports `--root`, `--root=`, and `WORKFLOWS_DIR`, precedence documented. Cheap half ≈ one registry entry. But `requireWorkflowsRoot` rejects a root holding no `workflow.yaml`/`activities`/`techniques` — a planning folder holds none, so aiming the guard at one **fails the reachability assertion**, not the link check | `check-resource-anchors.ts` (151 LOC) walks anchored links only | None | No | Cheap half after MECH-01's addressing; ref-relative resolution is genuinely new code |
| MECH-08 | Script (read-only, repo-precedented) or tool | ~120–180 LOC | None | None | No | Independent, low risk |
| MECH-09 | Definition edit (split) + script for the three mechanical corrections | `verify-artifact-conforms.md` is 834 words, the largest technique named. Split is a substantial rewrite | None | 25 corpus references | No | After MECH-01 |
| MECH-10 | Definition edit (step split) | Small | None | Bounded — output is a gate recommendation | No | Last |
| MECH-11 | Six definition edits | ~30–60 words saved per step, corrected downward by the input | None | None | **Yes, and it will read as noise** — `bench:token` counts delivered characters and the technique is delivered either way | Last, per the input's own recommendation |
| MECH-12 | Definition edit or leave | Negligible | None | None | No | Leave |

Two structural facts fall out of the table.

**Eleven of twelve candidates are protected by no guard at all.** The single exception, MECH-06, is protected by a guard that checks a different property (auto-advance reachability) than the one that fails (classification correctness). The 26-guard suite reads the corpus at authoring time; every candidate whose defect manifests during a run — MECH-02's unbound input, MECH-04's misapplied cell, MECH-05's lost race, MECH-06's confident misclassification — is invisible to it by construction.

**Only three of twelve are measurable with the instrumentation present**, and one of those three (MECH-11) is measurable in a way that will report approximately zero.

## 3. What this system assumes will never run out

### S1 — Filesystem co-location of the server checkout with the agent's working directory

**This is the strongest finding in the document, and it reprices MECH-01, the candidate report's headline.**

Every script invocation in the entire 21-tree corpus is a bare relative path. There are exactly three, in two workflows:

```
workflows/workflow-design/techniques/audit-schema-validation.md:24,30,34
workflows/workflow-design/techniques/yaml-authoring.md:52
workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:22,23
```

`npx tsx scripts/check-all-refs.ts` resolves only when the agent's cwd is a workflow-server checkout. A grep for `server_root`, `serverRoot`, `server_checkout` across `src/`, `workflows/meta`, `workflows/work-package` and `workflows/workflow-design` returns three hits, all inside `src/utils/path-presentation.ts`, none exposed to a worker in any tool response.

And `path-presentation.ts` exists **because the server's filesystem is routinely not the agent's**. Its header states the case plainly: under Docker the server binds `$HOST_PROJECTS_ROOT` to a container projects root, default `/var/lib/workflow-server/projects`, and `planning_folder_path` in tool responses is rewritten to the host bind so agents can open files at all. The server already knows the two namespaces differ. It rewrites one path for the agent — the planning folder — and no other.

So the candidate report's core finding needs a mechanical correction. It says mechanisation adoption "tracks what a workflow is about rather than what its steps do," and attributes the correlation to authorial framing. The scarcity reading is that **subject matter determines whether `scripts/` is on the worker's filesystem at all.** `workflow-design` and `workflow-authoring` are exactly the two workflows whose target repo is always this repo, which is exactly the condition under which a bare `scripts/…` path resolves. `meta` and `work-package` run against arbitrary target repos, where it does not.

This changes the price of MECH-01 from "state one convention" to "state one convention, and first provide an address a worker can use to reach the guards." Three ways out, in ascending cost:

1. Expose a `server_root` (host-presented, through the existing `path-presentation` map) in the `discover` or `start_session` response, so a step can say `npx tsx {server_root}/scripts/check-all-refs.ts`. Cheapest: one field, reusing machinery already written and tested.
2. Register the corpus-scoped guards behind one MCP tool — `run_guard { id, root }` — walking `GUARDS` from `scripts/guards.ts`. The registry, the `--json` finding protocol in `scripts/guard-protocol.ts`, and the exit-code contract (`EXIT_CLEAN` / `EXIT_FINDINGS` / `EXIT_UNMEASURED`) already exist, so this is a thin tool over shipped code, ~150 LOC, and it is namespace-proof.
3. Ship the guards as an installable package the target repo depends on. Highest cost, and it multiplies version skew across 21 trees.

**The corpus's testable prediction should be sharpened.** The report predicts script invocation correlates with subject matter across `prism`, `work-packages`, `requirements-refinement` and `codebase-wiki`. The scarcity hypothesis predicts it correlates with *co-location*. The two agree on all four, because all four are repo-tooling-or-domain in the same direction. The distinguishing test is a workflow whose subject is repository tooling but whose normal target is a **different** repository — subject matter predicts invocations, scarcity predicts none.

### S2 — The agent's context window

Assumed inexhaustible by the corpus prose; explicitly bounded everywhere in the server. `src/utils/batch.ts` derives a `budgetChars` from `DEFAULT_BATCH_HEADROOM_FRACTION = 0.35` and caps distinct activities at `DEFAULT_BATCH_MAX_ACTIVITIES = 3`. `src/config.ts` records that admission is checked before delivery, so an admitted activity can carry a batch past the budget "by up to one heavy activity, 261,827 characters on measured content." `tests/bootstrap-budget.test.ts` caps the pre-decision fixed block at 110,000 characters.

The economics consequence is blunt: **context is not what mechanisation buys.** MECH-11's saving was already corrected downward to 30–60 words per step because the technique file is delivered either way. Run `bench:token` over the whole MECH-11 batch and the delta will sit inside the 1% default regression threshold — the gate cannot distinguish the change from noise. Mechanisation buys correctness and turns, not bytes, and the portfolio should be argued on that basis.

### S3 — Dispatches and turns

The batch bound caps one worker context at three activities, so a 15-activity work-package run needs at least five worker contexts. `scripts/run-batch-benchmark.ts` prices what a dispatch costs and is explicit that the server-side saving is a wash: reference delivery composes every payload in full and then hashes it, so a batch does slightly *more* server work to put fewer bytes on the wire. The saving is dispatches, priced from a measured spawn cost — default `--spawn-seconds=87`, the mean of four setup-walk dispatches on the profiled 27 July 2026 run (77, 65, 42, 165 seconds).

Nothing in the twelve candidates removes a dispatch.

### S4 — Wall-clock patience for the test suite

`PER_WALK_MS = 45_000`, multiplied by walk count per hook, with the CI runner 4× penalty folded in. Every walk replays a full multi-activity session against the live corpus, so **every definition edit pays test time proportional to the corpus**. The corpus is 907 KB across the two workflows in scope and growing. The budget file's own history — a per-hook literal raised 60 → 120s, then timed out anyway — is the record of this resource running out once already.

This is the cost the candidate report never charges. MECH-09's split of an 834-word technique and MECH-06's touch on 85 references across 11 of 15 activities are the two that will move walk outputs and force a 72 KB snapshot re-baseline.

### S5 — Maintainer attention across 21 definition trees

`scripts/binding-fidelity-triage.json` is 28,404 bytes: 69 entries, 12 named rationales, stamped at `corpusSha 3569e937`. **All 69 verdicts are `harmless`.** Zero `fix-later`, zero `live-bug` — even though the file's own note defines all three and explains that the scheme exists so that "harmless" and "live bug" are no longer the same silence.

Two readings, and the difference is a change-economics decision:

- The corpus genuinely carries no live binding bugs. Then MECH-02 — a declared input with no producer — should have appeared, and did not, because the guard's parse domain excludes it (see S7).
- Triage attention was spent once, at one corpus SHA, and has not been re-spent. The 69 entries are a snapshot of a judgement, not a standing verdict.

Either way, the input's own shift prediction is the attention bill: "drift moves from silent to reported; the triage file grows before it shrinks." MECH-01's proposed guard is the largest such addition in the portfolio — it would flag every protocol step across 262 technique files whose procedure exists in `scripts/`, and each flag needs a human verdict before the guard can go green. **Budget the triage backlog as part of MECH-01's build cost, not as a follow-on.**

### S6 — The batch bound, which is the one scarcity that is a dial

`BATCH_HEADROOM_FRACTION` is clamped to `[0, 1]` and `BATCH_MAX_ACTIVITIES` to `[1, 100]`, both settable by environment variable at `src/config.ts:642-643`. The comment above the defaults records that "the bundling fraction of 0.80 would admit thirteen of fifteen activities into one context," and that both values "are revised from `batch_refused` counts and per-activity usage rows over real runs, where the context establishment a byte count cannot see is finally visible."

So: turning the dial from 0.35/3 to 0.80/13 takes a 15-activity run from ≥5 worker contexts to 2, saving roughly 3 × 87s ≈ 261 seconds of spawn wall-clock and three context establishments, at **zero build cost, zero corpus edit, zero test risk.** It is by a wide margin the cheapest lever in the portfolio, and none of the twelve candidates touches it.

The honest qualification, which is why this is a finding and not a recommendation: **the dial has already been turned to 0.80/13 and turned back.** It was revised down on evidence the byte count cannot see. So the finding is not "raise it" — it is that the portfolio contains a lever whose cost is zero and whose evidence is a year old relative to the instrumentation now present, and that re-running `bench:batch` and `run-profile` against a current run costs less than MECH-12 and could dominate the entire mechanisation programme.

### S7 — Guard reach: the assumption that bindings live in YAML

`check-binding-fidelity.ts` implements five checks: `arg-conformance`, `read-resolution`, `binding-resolution`, `dead-output`, `orphan-input`. The `orphan-input` check (lines 662–674) is precisely the one that would catch MECH-02 — "a bound op's OWN declared input with no producer in the binding workflow" — and it iterates step bindings drawn from `step.technique` in activity YAML.

`sync-progress-status` carries **19 references across the corpus and not one YAML step binding.** Every invocation is prose: `commit-and-persist.md:22`, `dispatch-activity.md:48,60,61`, `workflow-orchestrator.md:41`, `finalize-activity.md:80`, plus the policy prose in `planning-readme.md`. Measured for contrast: work-package activity YAML carries 181 `technique:` bindings, meta's carries 24 — but the entire `workflow-engine` group, which is the orchestration spine of both workflows, is bound from prose.

So MECH-02 is invisible **not because the check is missing but because the binding is outside the check's parse domain.** The guard suite assumes bindings are structured. The orchestration spine is not. That is a scarcity of parse domain, and it is why the report's "single `step.technique.inputs` rename" remedy is mis-sited: there is no `step.technique.inputs` to rename. The edit is one prose Apply argument list in `commit-and-persist.md:22`, which is cheaper — and, because it stays in prose, remains unguarded after the fix.

### S8 — The un-metered correctness of a written value

Four instruments price this system: `bench:token` (delivered characters by session mode), `bench:dispatch` (a re-dispatch, read from `activity_dispatched.chars` and `technique_fetched`/`technique_bundled`/`resource_fetched` `chars` + `delivery`), `bench:batch` (per-activity versus batched delivery), `run-profile` (a real run's transcripts, reconciling usage at 2.09× main-and-worker over the 27 July 2026 run). `record_usage` adds one `activity_usage` history row per activity a dispatch covered.

All five measure **delivery**. None measures **correctness**. There is no instrument in this repository that can report a wrong Progress cell, a duplicated artifact instance, a mis-joined rename row, or a 404 in a published planning folder. Every one of the twelve candidates' *savings* is priceable and roughly none of their *risks* is.

## 4. The inversion: a design gambling on the opposite scarcities

The present design bets that agent context, turns and wall-clock are cheap, and that server code and maintainer attention are expensive. Hence: procedures live in prose; all eighteen tools are session control-plane; all twenty-six guards are read-only and corpus-scoped; the server writes exactly two files into a user's planning folder (`session.json` and `.session-token`, under `PLANNING_FILE_MODE`).

### Inversion A — the work plane

Bet the other way: agent turns and correctness are scarce, server code is cheap.

**Concrete result.** Add four tools to `resource-tools.ts` (the smaller file, 944 lines, and the one that already hosts the two non-control-plane-shaped registrations):

- `apply_progress_policy { planning_folder_path, activity_id, target_status, item_match, delivered_artifact }` → the 5×5 legal-write matrix and the three-row item-link reconciliation, executed once in TypeScript instead of ~30 times by hand per 15-activity run (MECH-04).
- `write_artifact { planning_folder_path, artifact_prefix, content }` → find-or-update as one operation, closing the mint race by construction rather than by more careful prose (MECH-05).
- `diff_surface { repo, base, head }` → the rename-aware `--name-status` × `--numstat` join with a null representation for binary files (MECH-08).
- `check_planning_links { planning_folder_path, publish_ref }` → anchored and non-anchored link resolution, the latter against a git ref via `git cat-file -e {ref}:{path}` (MECH-07).

Estimated 400–600 LOC total, four members added to the closed `HistoryEventTypeSchema`, four test files at the observed 100–170-line scale. Every one of them sidesteps S1 entirely: a tool call reaches the agent whatever namespace the server occupies, and `planning_folder_path` is the one path the server already rewrites for the host.

**New trade-offs, named.**

1. *The server acquires write authority over user work product.* It writes two files today. This gives it four more writers, into artifacts a reader consumes. The seal model — content-hashed, with "modified outside the server" as its failure message — now has to distinguish the server's own artifact writes from tampering.
2. *Degradability is spent.* Prose runs on any harness. A tool call runs only against this server. `audit-schema-validation.md` step 3 is the corpus's proof that a scripted step can stay readable as its own contract and degradable at once; a tool call is not degradable in that way, because there is no command a reader can run instead.
3. *Contract restatement does not fall.* 87 references to `write-artifact` and 25 to `verify-artifact-conforms` each state the contract locally, before and after.
4. *Tool schemas are context.* Every worker's context establishment — the 87-second spawn — rebuilds the tool schema set. Four more tools makes every dispatch slightly more expensive, against a saving measured in dispatches avoided. The two effects are the same currency and point opposite ways, and no instrument in the repo separates them.

### Inversion B — spend nothing, turn the dial

Bet that maintainer attention is the binding scarcity and everything else is abundant.

**Concrete result.** Touch no definition file. Set `BATCH_MAX_ACTIVITIES=13` and `BATCH_HEADROOM_FRACTION=0.80`. A 15-activity run drops from ≥5 worker contexts to 2: about 261 seconds of spawn wall-clock and three context establishments saved, per run, forever, for one environment variable pair. Then re-run `bench:batch` and `run-profile` against a real run to see whether the reason the dial was turned back still holds.

**New trade-off, and it is the one that already bit.** The bound measures characters; the resource it protects is the worker's usable context, which includes context establishment a byte count cannot see. Raising the fraction trades a measurable saving for an unmeasurable risk — a worker admitted its thirteenth activity is inside the byte budget and may be outside its real one, and the failure mode is a degraded worker rather than a `batch_refused` event, so the instrument that would catch it is the one the change disables.

**This inversion beats the entire MECH-10/11/12 tail on cost-to-saving by an order of magnitude and should be sequenced ahead of it.**

## 5. The conservation law

The input already names two: Contract Restatement Conservation and Blast-Radius Conservation. The scarcity lens produces a third, and it is the one that constrains how each candidate must be built.

> **Conservation of reader-verified decisions.** Every value this system produces is verified in exactly one of three places: at authoring time by a guard, at run time by a gate or checkpoint, or after the fact by a reader. Mechanisation moves a value's *producer*. It does not move its *verifier*. A computed value with no diff is checked by a reader exactly as a hand-derived value with no diff is, so the count of reader-verified decisions is conserved across every design — unless the mechanisation emits a diff.

Current operating point, counted: five of the twelve candidates produce values whose only verifier is a reader.

| Candidate | Value | Why only a reader checks it |
|---|---|---|
| MECH-02 | Progress item link | No expression reads it |
| MECH-04 | `rows_updated` | A count, not a diff — a cell written against policy is indistinguishable from a correct one |
| MECH-05 | duplicate numbered instance | Detected on the *next* write and logged to the assumptions log, not resolved |
| MECH-07 | `broken_artifact_links` | Nothing in the run re-reads the published folder |
| MECH-09 | in-place corrections | Mutates already-persisted artifacts with no diff recorded |

Scripting MECH-04 without changing `rows_updated` from a count to a diff leaves that number at five. The law's corollary is therefore a build constraint the input states for one candidate and needs for all five:

> **Every mechanisation in this portfolio must return a diff, not a count.** The diff is what converts a reader-verified decision into a run-time or authoring-time one. Without it, the mechanisation buys accuracy of derivation and nothing else.

That is the whole payoff structure. Determinism of the *producer* is free once you write the code; verifiability of the *product* costs one extra return field, and it is the field the corpus consistently omits.

## 6. Unmovable in six months, regardless of redesign

1. **The 87-second dispatch.** It is the harness's context establishment — system prompt, project instructions, tool schemas — rebuilt before the worker's first server call. `run-batch-benchmark.ts` states outright that nothing headless can observe it, because there is no agent to spawn. No change to `src/` or `scripts/` shortens it. Only fewer dispatches help, which is the batch bound, which was already set to 0.80/13 and revised down.

2. **Test time proportional to corpus size.** `PER_WALK_MS` × walks × 4 for CI. Every definition edit replays full sessions against the live corpus. The only escape is a partial-walk mode that no candidate proposes and that would trade the property the walk exists to prove.

3. **The submodule round trip.** `workflows` and `.engineering` are separate branches of the same remote, by design. A definition edit is a submodule commit, a pointer bump, a possible 72 KB snapshot re-baseline, and `npm run baseline:stamp`. This is deliberate architecture, not friction to be removed.

4. **Contract restatement at the call site.** Already conserved by the input's own law. In scarcity terms: even a perfect tool leaves 87 statements of `write-artifact`'s contract and 25 of `verify-artifact-conforms`'s, because the caller must say what it is asking for.

5. **Triage attention as the gate on new guards.** 69 entries adjudicated once, at one corpus SHA, every verdict `harmless`. A new guard produces findings before it produces signal, and the findings need a human. This is the resource that decides whether MECH-01's guard ships, and it is not purchasable with code.

6. **The prose binding domain.** 19 references to `sync-progress-status`, zero YAML step bindings; the whole `workflow-engine` group invoked from prose against 181 structured bindings in work-package activities and 24 in meta's. Until the orchestration spine's invocations move into YAML, no guard among the 26 can see them — and moving them is a re-architecture of the orchestrator technique, not a mechanisation. Six months is not long enough.

7. **The absence of a correctness instrument.** Four benchmarks and `record_usage` measure delivery. Building a correctness instrument means defining a ground truth for a Progress cell, an artifact link and a change surface, which is a larger programme than all twelve candidates combined. In six months this system will still be able to price every one of these savings and none of these risks.

## 7. Sequencing that falls out of the pricing

1. **Re-measure the batch bound** (`bench:batch`, `run-profile` against a current run). Zero build cost; potentially the largest saving in the portfolio; independent of everything below.
2. **MECH-02 and MECH-03.** Two definition edits, roughly 20 words and 2 table rows. Both fix reachable defects. Neither is guarded before or after, which is a known and accepted residue.
3. **Resolve S1** — decide the addressing mechanism for `scripts/` from a worker context. Recommended: expose a host-presented `server_root` through the existing `path-presentation` map, which is the cheapest of the three options and reuses tested machinery. **Everything below this line is blocked on it.**
4. **MECH-01's convention and guard**, with the triage backlog budgeted into the build rather than deferred.
5. **MECH-05, then MECH-04.** MECH-05 must be a tool (atomicity spans agent tool calls). MECH-04 depends on MECH-02's binding. Both must return diffs, per the conservation law.
6. **MECH-07's cheap half**, noting that `requireWorkflowsRoot` will reject a planning folder as a corpus root — the `--root` flag exists but the reachability assertion has to learn a second root shape before it can be aimed at one.
7. **MECH-08, MECH-09, MECH-06.** MECH-06 last among these: 85 references across 11 of 15 activities is the largest definition blast radius in the set, and the walk snapshot re-baseline it forces is the most expensive.
8. **MECH-10, MECH-11, MECH-12.** The input already sequences these last. Add: MECH-11's saving is below the noise floor of the only instrument that could measure it, so do not gate it on a benchmark.
