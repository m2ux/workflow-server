# Measured run analysis — does packaging pay for itself?

Basis: `review-midnight-node-pr-1877`, a full `work-package` review walk, 2026-07-28/29.
Source: [`14-token-usage.md`](file:///home/mike1/projects/dev/midnight-agent-eng/.engineering/artifacts/planning/2026-07-28-review-midnight-node-pr-1877/14-token-usage.md),
[`14-session-trace.md`](file:///home/mike1/projects/dev/midnight-agent-eng/.engineering/artifacts/planning/2026-07-28-review-midnight-node-pr-1877/14-session-trace.md),
and the `history` projections inside that run's `session.json` (meta `NJXMLK` + embedded client `NIWMUL`).

Figures below are marked **[M]** measured or **[E]** estimated. The estimates are needed because
the server's history records *that* content was delivered but not *how much* — see §5.

## 1. The run at a glance [M]

| Axis | Value |
|------|------:|
| Tool calls | 921 |
| Dispatches | 33 (12 of them resumes) |
| Subagent tokens | 4,130,657 |
| Agent time | 3h 51m (against 18h 54m wall-clock) |
| Ledgered activities | 11 client + 5 meta |
| Planning artifacts produced | 403 KB across 21 files |

Server history event counts, both sessions combined:

| Event | Count |
|-------|------:|
| `variable_set` | 129 |
| `technique_bundled` | 62 |
| `resource_fetched` | 30 |
| `technique_fetched` | 24 |
| `activity_entered` | 17 |
| `activity_exited` / `activity_usage` | 15 / 15 |
| `checkpoint_reached` / `checkpoint_response` | 10 / 10 |

## 2. How much of the 921 calls is workflow-server protocol? [E]

Reconstructed from the event counts plus the one-call-per-event tools they imply, with
`get_activity` / `get_workflow_status` inferred per dispatch and per orchestrator loop:

| Call | Count | Removed by packaging? |
|------|------:|-----------------------|
| `get_technique` | 24 | **yes** |
| `get_resource` | 30 | **yes** |
| `get_activity` | ~29 (≥1 per dispatch) | no — still needed to bind and verify the dispatch |
| `next_activity` | 17 | no — the attestation boundary |
| `yield` / `present` / `respond_checkpoint` | ~30 | no — inherently live |
| `get_workflow_status` | ~17 | no |
| `start_session` / `get_workflow` / `dispatch_child` / `inspect_session` | ~10 | no |
| **Server protocol subtotal** | **~157 (17%)** | |
| **Domain work** (Read, Grep, Bash, `gh`, other MCP) | **~764 (83%)** | no |

**The packageable subset is 54 calls — 5.9% of the run.**

That is the answer to Q2, and it is not the answer I predicted. My prior was that
`commit-and-persist` and `sync-progress-status` dominated. They don't; nothing in the server
protocol dominates. **83% of tool calls are the agent doing its actual job** — reading the diff,
grepping the codebase, running tests, querying `gh` and the RAG servers. That term is irreducible
by any protocol change.

## 3. How much of the 4.13M tokens is delivery? [E]

Sizing from the real corpus: `workflows/work-package/techniques` is 259 KB over 111 files
(~2.3 KB raw each, ~6 KB composed with group `TECHNIQUE.md` and rules); `resources` is 158 KB
over 32 files (~5 KB each).

| Payload | Estimate | Share of 4.13M |
|---------|---------:|---------------:|
| 86 technique deliveries (62 bundled + 24 fetched) @ ~6 KB | ~516 KB ≈ 130K tok | ~3% |
| 30 resource deliveries @ ~5 KB | ~150 KB ≈ 38K tok | ~1% |
| Ops/activity bundle, per dispatch (~35 KB × 33) | ~1.16 MB ≈ 290K tok | ~7% |
| **Total protocol payload** | **~460K tok** | **~11%** |

**And here is the decisive point: packaging removes none of it.**

A fresh disposable worker must have the activity's content *in its context window* to execute the
activity. Whether that content arrives over MCP or is read off the filesystem changes the
transport, not the presence. Packaging converts *N* MCP round-trips into *M* file reads at
approximately equal token cost — and plausibly **worse**, because the filesystem path forfeits the
two mechanisms that do cut tokens today: reference delivery (`src/utils/delivery.ts`) and
`#section` resource slicing.

The only way packaging saves tokens is if the agent reads *less* than it currently receives. That
is progressive disclosure — the thing packaging replaces.

## 4. Verdict on the feature as specified

**Packaged execution manifests buy ~6% fewer tool calls and ~0% fewer tokens.** Against that, they
cost: a new package format, a staleness/versioning protocol, loss of L5 technique-fetch fidelity,
further thinning of L7, and whatever attestation machinery is built to compensate.

**Recommendation: do not build it as a tool-call reduction.** The premise does not survive
measurement.

## 5. What the run says is actually expensive [M]

| Cost centre | Tokens | Share |
|-------------|-------:|------:|
| **12 resumed dispatches** | ~1,020,000 | **24.7%** |
| Out-of-band prism structural analysis | 176,215 | 4.3% |
| Abandoned first meta run (wrong repo binding) | 81,762 | 2.0% |
| Per-dispatch ops/activity bundle re-delivery, 33× [E] | ~290,000 | ~7% |

**Resumes are the single largest identified waste, four times bigger than everything packaging
could touch.** And the mechanism is structural, not incidental: `workers-need-full-delivery`
mandates `fresh` mode for every worker-dispatched session, so a resumed worker cannot use
reference delivery. Every resume re-pays the full activity bundle *and* re-reads whatever slice of
the 403 KB artifact corpus it needs to rebuild context.

Secondary: the disposable-worker topology pays cold-start 33 times. `context-travels-as-state`
routes prior context through artifacts, so each cold start means re-reading files — and this run's
artifacts include a 57 KB assumptions log, a 50 KB structural analysis and a 40 KB research
document.

## 6. What the run says about fidelity — worse than anything packaging threatens [M]

The attestation worry that opened this exploration is misdirected, because the existing
attestation surface is already failing in larger ways:

1. **`trace_tokens` resolved empty.** L7 produced *nothing* for this run. Per that run's own trace
   artifact, error counts and validation-warning clusters are "unavailable — read their absence as
   *not measured*." So §4-of-[attestation-options.md](attestation-options.md) worrying that
   packaging would thin the trace is moot: the trace was already zero-value.

2. **`activity_usage` fired 11 times against 33 dispatches.** The ledger has no representation for
   a resumed worker, an out-of-band dispatch, or an abandoned session. Cost accounting understated
   the run by a third.

3. **The out-of-band prism dispatch is invisible to the server** — and it produced CR-0 and B7,
   *the two Critical findings the review's verdict rests on*. The orchestrator dispatched real,
   verdict-determining work outside the activity loop and nothing recorded it.

4. **History records delivery without magnitude.** `technique_bundled` / `resource_fetched` events
   carry `techniqueId`/`resourceId`/`stepId` but no size field, so delivery cost cannot be
   measured from the ledger at all — hence the estimates in §3.

**The server cannot see roughly a third of the work.** Adding a witness chain to protect per-step
technique-fetch evidence would be sealing a 6% hole while a 33% hole stands open.

## 7. Revised direction

Packaging is not worthless — it is aimed at the wrong target. Reframed:

> **Not "reduce tool calls" but "make cold-start and resume rehydration cheap."**

An activity-scoped, planning-folder-resident package is precisely what a *resumed* or *re-dispatched*
worker needs to rebuild context without re-paying full delivery. That is a measured 25%-of-run
target rather than a 6% one.

And the fidelity objection largely dissolves under this framing: a resumed worker has **already
been gated into its activity by the server**. Re-supplying content to an already-gated worker
removes no gate. The witness chain (§4.1) becomes optional — useful for making "where was I?"
recoverable and verifiable, not load-bearing for enforcement.

Priority order the data supports:

| # | Work | Target | Basis |
|---|------|-------:|-------|
| P1 | Cheap resume rehydration — package or reference-deliver to a resumed worker rather than re-paying `fresh` full delivery | ~25% | §5 |
| P2 | Ledger the invisible third — record resumed dispatches, out-of-band dispatches, and per-event payload sizes | fidelity | §6.2–6.4 |
| P3 | Fix trace-token accumulation so L7 is non-empty at close-out | fidelity | §6.1 |
| P4 | Outcome attestation against `outcome[]` ([attestation-options.md §4.3](attestation-options.md)) | fidelity | orthogonal to delivery |
| — | ~~Packaged manifests for tool-call reduction~~ | ~6% | §4 — **dropped** |
| — | ~~Signed filesystem-watcher~~ | 0% | [attestation-options.md §2](attestation-options.md) — **dropped** |
