# Delivery budget, measured on a live instance

Whether a role-facing delivery needs a bound, what the bound should be, and what it costs to
leave one off — answered from eight deliveries on a running server rather than from composition
arithmetic. The question was put as three parts: do we need to constrain delivery budget, if so
how and by how much, and what follows from not doing so.

A second question rode alongside it: whether caching large responses locally removes the need for
a bound. Two caches were in scope — the server's own delivery ledger, which replaces a payload a
context already holds with a short marker, and client-side prompt caching, which makes re-reading
cached bytes cheap. Both were measured or reasoned about against the measurements. Neither answers
the budget question, for a reason the numbers make plain.

## What was run

An experiment sidecar, reached over its MCP namespace, not over HTTP by hand.

| Piece | Value |
|---|---|
| MCP URL | `http://127.0.0.1:32772/mcp` |
| Engine pin | `73845077-dirty` — budget surface byte-identical to `origin/main` |
| Corpus pin | `0d0d4b9d` |
| Image | `workflow-server:exp-budget` |
| Smoke walk | `mvw`, session `WRGDKG`, planning `2026-09-21-mvw-7` |
| Measurement walk | `work-package`, session `VXLK55`, planning `2026-09-21-work-package` |

The minimum viable workflow walked first and held: a session opened, one activity dispatched
through one routine and one technique, and the worker received its activity. The instance can
dispatch, so later readings are about delivery size rather than about a broken engine.

The measurement walk drove `work-package` — fifteen activities, and the workflow the batch figures
in `src/config.ts` were calibrated against. Deliveries were measured; the work the activities
prescribe was not performed, because what is under measurement is the handover, not the labour.

Every figure below is the server's own `delivery cost` log line. Where the client also reported a
size, the server's figure sits at or just above it, the difference being protocol metadata that
rides beside the text.

## The eight deliveries

`ctx` is the window the caller declared. `over` is the multiple of the 60,000-character bound.

| # | Call | Workflow | Mode | ctx | Chars | Over |
|---|---|---|---|---|---|---|
| 1 | `start_session` | `mvw` | full | — | 3,310 | — |
| 2 | `get_workflow` | `mvw` | full | — | 109,218 | 1.82× |
| 3 | `get_activity` | `mvw` | full | 200k | 46,919 | — |
| 4 | `get_workflow` | `work-package` | full | — | 145,799 | 2.43× |
| 5 | `get_activity` #1 | `work-package` | full | 200k | 158,630 | 2.64× |
| 6 | `get_activity` #2 | `work-package` | reference | 200k | 93,668 | 1.56× |
| 7 | `get_activity` #3 | `work-package` | reference | 200k | 100,800 | 1.68× |
| 8 | `get_activity` | `work-package` | full | 20k | 72,586 | 1.21× |

Six of eight exceeded the bound. On `work-package` every delivery did, five for five. The two that
fit were the bootstrap reply and the worker delivery for a workflow whose entire protocol is one
sentence.

The client refused all six oversized results and wrote each to a file. That is the behaviour #847
priced as "one round trip that keeps everything", and it is accurate: nothing was lost. It was,
however, the condition under which an agent cannot read its own contract inline.

## There is a floor, and it sits above the bound

The orchestrator delivery splits into the contract it is held to and the workflow it is driving.

| Workflow | Activities | Contract | Definition | Total |
|---|---|---|---|---|
| `mvw` | 1 | 108,591 | 548 | 109,218 |
| `work-package` | 15 | 127,405 | 18,315 | 145,799 |

Between a one-activity workflow and a fifteen-activity one the definition grew thirty-three fold
and the contract grew seventeen per cent. The `harness-compat` namespace is byte-identical in both
at 31,304 characters. So roughly 108,000 characters arrive before any workflow-specific content
exists, and the 60,000-character bound is fifty-five per cent of the floor it is meant to bound.

The minimum viable workflow states this most sharply. Its own definition is 548 characters. The
contract delivered alongside it is 108,591 — a hundred and ninety-eight times the workflow it
serves.

## Which mechanisms bind

**The response bound — 60,000 characters — reports and does not decide.** This is by design and
recently so. #847 removed the passes that dropped operation bodies to fit the limit and kept the
limit "to measure the whole tool result and log a response that exceeds it. It stops deciding what
to drop." The code matches: on the orchestrator path the comparison feeds a warning, and on the
worker path the inlining tests read the eager budget alone. Nothing in the eight deliveries was
shed to fit this figure.

**The eager bundling budget — window × 0.80 × 4 — is inert at a real window and useless at a small
one.** At a declared 200,000 tokens the budget is 640,000 characters and the three worker
deliveries spent 122,146, 73,379 and 84,755 — nineteen per cent at its highest. At a declared
20,000 tokens the budget is 64,000 and 63,062 was spent, so it did bind; what it shed was every
step technique, `bundled_steps` falling to zero, and the delivery still came to 72,586 characters.
That is a hundred and fifty per cent of the window the caller declared. The parameter is a
non-constraint where it has room and an ineffective one where it does not.

**The two batch bounds expired on the same activity, so neither did independent work.** Delivered
characters ran 156,702, then 248,037, then 346,121 against a 280,000-character budget, while the
activity count ran one, two, three against a cap of three. `may_continue` turned false once both
were spent at once. The character budget is also tested before a delivery rather than after, so at
248,037 it admitted a delivery that carried the total 66,121 characters past the budget — twenty-four
per cent over the figure it exists to hold.

**The fan bound was not exercised.** No fanning exit lies on this path. `src/config.ts` already
records that this figure is a substitution from the standalone activity benchmark with no measured
fanned payload behind it, and that remains true.

**Usage recording is measurement, not constraint, and degrades cleanly.** `record_usage` was never
called; `inspect_session view:usage` returned no rows and named the activities holding none. Nothing
depended on it.

## What the ledger does, precisely

The same worker identity took three activities. The contract collapsed as the ledger intends.

| | Activity 1 | Activity 2 | Activity 3 |
|---|---|---|---|
| Mode | full | reference | reference |
| Contract chars | 57,329 | 6,804 | 1,148 |
| Fixed chars | 29,750 | 10,147 | 7,908 |
| Repeat text inside the response | 42.9% | 10.3% | — |
| Response total | 158,630 | 93,668 | 100,800 |

By the third activity the contract is ninety-eight per cent elided, on nine unchanged markers. The
mechanism works, and it is worth keeping.

It does not answer the budget question, for three reasons the table shows. It returns nothing on a
first delivery, which is where the largest single response sits. It never brought any response
under the bound. And the residue after collapse is each activity's own step techniques and bundled
resource bodies, which are first deliveries every time.

Client-side prompt caching is weaker still against this question, because it addresses a different
cost. Cached bytes are cheap to re-read and occupy the window exactly as dearly as uncached ones.
The cost measured here is first-delivery occupancy, which caching of any kind leaves untouched.

## The duplication is intended, and its remedy is already named

Inside a single response, text repeats. Counting only byte-identical copies, 44,502 characters of
the `mvw` contract are text delivered more than once — 41.0 per cent of the bundle — and 54,656 of
`work-package`'s, 42.9 per cent. The largest contributors are inherited rule blocks re-expanded
under every technique that inherits them:

| Repeat chars | Copies | Block |
|---|---|---|
| 8,202 | 7 | `foreground-always` |
| 7,196 | 8 | `resource-section-or-whole` |
| 5,355 | 8 | `resource-loading-via-tool` |
| 5,082 | 8 | `agent-id-scopes-delivery` |
| 4,800 | 7 | `inherited_inputs` |
| 4,795 | 8 | `fetch-costs-what-it-delivers` |

This is not accretion and not an oversight. #847 considered exactly this and removed the pass that
replaced a repeated block with a content hash, keeping "the duplicate copies composition makes. A
whole body that repeats is correct; a fragment is not." The reasoning holds: a hash standing for a
block inside the same response names nothing a reader can fetch, because a block of a body is not
an item with an identity. `src/utils/delivery.ts` states the invariant — a marker stands for a whole
item, and no key names a field of a body.

Both caches are blind to this text for structural reasons. The ledger keys whole items, so a rule
block repeated inside six techniques has no key of its own. Prompt caching deduplicates across
requests, not within one payload.

#847 also names the fix and defers it: "Resolving inheritance by reference instead of by copying
would remove the duplication at source. It is new mechanism, so it is out of scope here." That
sentence is the most useful thing in the record, because it is the only lever the measurements
support.

## Against the cost that was accepted

#847 accepted a specific price: opening calls rising from just under 60,000 characters to
63,292–89,548, and the heaviest worker delivery from 55,666 to 114,445.

| Reading | Accepted | Measured | Variance |
|---|---|---|---|
| Opening call, upper bound | 89,548 | 145,799 | +63% |
| Heaviest worker delivery | 114,445 | 158,630 | +39% |

The trade #847 made was thirteen fetches per orchestrator that may never happen, against one round
trip that keeps everything. Nothing in these measurements overturns that trade. What they show is
that it is now being paid at a price well past the one it was agreed at, on a corpus that has since
grown, and that the growth lands in the material that is forty-one per cent duplicated.

#836 asked whether a delivery that has spent every shed stage should shed further, observed that the
original choice rested on a belief that a client refuses an oversized result when in fact it pages
it to a file, and noted that "nobody has compared them." It was closed as not planned. This walk is
that comparison: the paging behaviour is real, it keeps everything, and it costs a round trip plus a
full-context read on six of eight deliveries.

## What the evidence supports

Answering the three parts directly.

**Does delivery budget need constraining?** Yes, but the need is not for a bound on the response.
A bound cannot hold a delivery whose mandatory floor exceeds it, which is why the present one
reports rather than decides, and why re-instating shedding would reproduce the fragmentation #847
removed for good reasons. What needs constraining is the size of the contract itself.

**How, and by how much?** Resolving inherited rules and inherited input declarations by reference
at composition time, rather than copying them into every technique that inherits them, is worth
44,502 characters on `mvw` and 54,656 on `work-package`. Applied, `work-package`'s opening call
falls from 145,799 to roughly 91,000 and the heaviest worker delivery from 158,630 to roughly
104,000 — inside and just above the envelope #847 priced, with nothing withheld from anyone and no
reader left holding a fragment. It is new mechanism, which is what #847 called it, and it is the
only change these measurements argue for.

**What follows from not doing so?** Six deliveries in eight refused and paged to a file; every
delivery of the real workflow so refused. A worker declaring a 20,000-token window receiving
roughly 30,000 tokens, with every step technique already shed. A batch budget overshot by
twenty-four per cent because it is tested before the delivery that breaches it. None of these is
fatal and none is theoretical.

Two parameters are candidates for retirement on this evidence rather than on argument. The eager
bundling headroom fraction constrains nothing at a realistic window and cannot protect a small one.
The batch character budget and the batch activity cap expired together, so the walk gives no
instance of the character budget doing work the count does not. A second walk on a workflow with
heavier activities would test whether they ever separate, and that walk has not been run.

## What this walk did not establish

- The fan width bound, which no activity on this path reaches.
- Whether the batch character budget and activity cap ever bind independently.
- Any effect of the deliveries on the quality of work performed, since the activities' work was not
  carried out.
- Behaviour on a corpus other than `0d0d4b9d`, or a client with a result ceiling other than this
  one's.

## Reproducing it

Reload the sidecar against an engine checkout and a dedicated corpus worktree, confirm `/ready`,
then drive `mvw` and `work-package` over the MCP namespace, reading each `delivery cost` log line
from `docker logs workflow-server-exp`. The duplication figures come from segmenting a saved
response on its technique keys, hashing every block under `rules:` and `inherited_inputs:`, and
charging `(copies - 1) x size` for each byte-identical group, so variant blocks contribute nothing.
