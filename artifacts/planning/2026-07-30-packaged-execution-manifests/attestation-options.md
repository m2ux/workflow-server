# Attesting stepwise fidelity over a packaged execution manifest

Exploration notes, 2026-07-30. Nothing here is decided.

## 1. What the per-call drum-beat actually buys

Separating the jobs the current call pattern does, because they have different fates under
packaging:

| Job | Mechanism | Fate under packaging |
|-----|-----------|----------------------|
| **Delivery** | `get_activity`, `get_technique { step_id }`, `get_resource` | Eliminated — that is the point |
| **Hard sequence gate** | L2 checkpoint gate: `bcp` in the HMAC-signed token blocks `next_activity` | **Survives**, provided checkpoints stay live calls |
| **Token integrity** | L1 HMAC-SHA256 on every call | **Survives** untouched |
| **Step accounting** | L5 `step_manifest` completeness / order / non-empty output | Survives structurally, but becomes free prose the agent can author at the end |
| **Consumption evidence** | L5 technique-fetch fidelity: manifested step with no `technique_fetched` / `technique_bundled` event in the visit → warning | **Lost** |
| **Mechanical audit** | L7 trace events per tool call | **Thinned** to ~2 events per activity |
| **Human-in-the-loop** | `yield_checkpoint` → `present_checkpoint` → `respond_checkpoint` | Inherently interactive; cannot be pre-packaged |

Two observations follow.

**The stepwise accounting is already advisory.** L3, L4, L5 and L6 warn; they do not block.
`docs/workflow-fidelity.md` Limitations says it plainly: *"the manifest validates that the agent
reported each step, not that it performed the work."* So "we lose the stepwise accounting
mechanism the server mandates" is not quite the situation — what is mandated is *reporting*, and
reporting survives packaging. What is lost is the corroborating evidence that made a false report
detectable.

**Consumption evidence was already half-gone.** `bundleTechniques.maxChars` inlines step
techniques into `get_activity`, and per the activity schema, *"bundled deliveries are recorded as
`technique_bundled` history events and satisfy the manifest fidelity check."* So bundling already
downgraded the check from **content was consumed** to **content was available**. Packaging is the
same move at larger scale, not a new category of loss.

**The trace loss is the underrated one.** L7 resolution is proportional to call frequency. Its
documented value — *"the last call before silence identifies where an agent got stuck"*, per-step
timing, orchestrator-vs-worker attribution — degrades directly. If an activity emits two events,
a stalled walk tells you only *which activity*, not *which step*. Any packaging design should
answer this explicitly (see §4.4).

## 2. Rejected: signed filesystem-watcher

<a id="rejected-signed-filesystem-watcher"></a>

The proposal: ship a signed, tamperproof binary the agent must run before starting; it watches
the filesystem and attests to progress.

**2.1 Wrong observable.** A filesystem watcher observes file mutations. Most workflow steps
produce no distinctive mutation — they are reasoning, repository reads, calls to other MCP
servers, condition evaluations, routing decisions. The steps that *do* write artifacts are
written by the agent, so the watcher can only confirm "a file with plausible content appeared."
An agent that writes every artifact in declaration order at the end, with sleeps between writes,
is indistinguishable from one that walked the workflow. The watcher attests to **outcomes**, and
does so worse than a direct outcome check would (§4.3).

**2.2 Observer integrity ≠ observation integrity.** Code signing guarantees the binary's code
has not been altered. It guarantees nothing about the truthfulness of what that code observes.
The agent controls the entire environment under observation. A perfectly sealed attester can only
sign *"I saw these file events at these times"* — a statement that is cheap to make true
falsely.

**2.3 It is client-side DRM.** The pattern — trusted code enforcing policy on hardware the
adversary controls — has no solution. The current architecture works *because* the server is a
separate trust domain holding a capability the agent cannot manufacture: the next activity's
content. Packaging voluntarily surrenders that leverage. A local binary cannot recreate it,
because whatever it holds, it holds on the agent's machine.

**2.4 The threat model is mis-specified.** This is the load-bearing objection. The adversary is
not a motivated human attacker circumventing controls. It is **a lazy or context-truncated LLM**
— an agent that skips a step because its window summarised the instruction away, or takes a
shortcut because the shortcut looked reasonable. Against that adversary:

- *hard to do accidentally* is sufficient;
- *detectable post-hoc* is sufficient;
- cryptographic unforgeability is overkill, and the signing is theatre — it defends against a
  threat that is not present while costing real complexity and a hard runtime dependency.

Naming the threat model correctly is what unlocks the cheaper designs below.

## 3. What is actually achievable

Stated bluntly, so the design does not chase an impossibility:

- **Execution cannot be verified.** No mechanism available to a server on the other side of a
  tool boundary can prove an agent performed cognitive work. This is already true today and is
  not made worse by packaging.
- **Reading can be verified.** Deliver something unpredictable; require it back.
- **Ordering can be verified.** Chain the unpredictable things so element *K* is uncomputable
  without element *K−1*.
- **Outcomes can be verified.** Inspect the artifacts against the activity's declared `outcome[]`.
- **Presence of a human cannot be verified.** Unchanged from today (L2 Limitations).

The design target is therefore: *recover read-evidence and order-evidence at the activity
boundary, add outcome-evidence, and accept that execution-evidence never existed.*

## 4. Candidate mechanisms

### 4.1 Witness chain (primary recommendation)

Embed a server-minted, unpredictable witness in each step's slot in the delivered package, and
require it back in the step manifest.

```
package step K  →  { step_id, body, witness_seed_K }        # seed unpredictable, per-session
agent reports   →  { step_id, output, step_witness }
where             step_witness_K = HMAC(session_secret, witness_seed_K ‖ w_{K-1} ‖ digest(output_K))
                  w_0 = HMAC(session_secret, activity_id ‖ package_version)
```

Verified server-side in one call at the activity boundary. What it establishes:

| Property | How |
|----------|-----|
| The agent **read** step K's package slot | It could not otherwise produce `witness_seed_K` — the seed is session-minted, not derivable from definition files |
| Steps were processed **in order** | `w_K` is uncomputable without `w_{K-1}` |
| Outputs were **committed before** the next step | `digest(output_K)` is bound into `w_K`, so outputs cannot be back-filled into a tidier narrative afterwards |
| The package was **not stale** | `package_version` in the chain seed; a witness computed against a superseded package fails (addresses Q5) |

Cost: one extra string field per manifest entry, no extra tool calls. This is a strict *upgrade*
on today's L5, which accepts unverified prose. It uses machinery the server already has — trace
tokens are HMAC-signed, self-contained, chain-resistant attestations, so the primitive and the
key management exist (`src/trace.ts`, `~/.workflow-server/secret`).

Limits to state honestly: it does not prove the step's *work* happened, and an agent that reads
the whole package up front then walks it in order produces a valid chain regardless of whether it
reasoned about each step. It defeats *skipping* and *reordering*, which is the observed failure
mode.

### 4.2 Sealed sequential release (optional local component)

If a local component is still wanted, this is the shape that earns its place — not a watcher but
a **verifying release cache**. Step bodies are delivered sealed; the local component decrypts
step K only on presentation of `w_{K-1}`.

This relocates the sequencing gate from the server to the client, so it costs **zero
round-trips** while preserving sequential disclosure. It is trivially breakable by anyone who
owns the machine — and irrelevant, because per §2.4 the adversary is not trying. Its value is
making accidental skipping *structurally impossible* rather than merely detectable.

Weigh against: a hard binary dependency, per-platform builds, and a new failure mode (component
absent or crashed → walk cannot proceed). Probably not worth it if §4.1 lands.

### 4.3 Outcome attestation at the boundary

Independent of procedure: at `next_activity`, validate the activity's artifacts against its
declared `outcome[]` — required files present under `{planning_folder_path}`, required sections
non-empty, README Progress row consistent with the claimed transition.

Procedural bookkeeping catches the failure nobody has (a fabricated call sequence). This catches
the failure everybody has: **a step was skipped, so the artifact is thin.** It is cheap, needs no
new protocol, and is complementary to §4.1 — witnesses attest to *process*, outcome checks attest
to *product*.

Requires `outcome[]` to become machine-checkable, which today it is not ("Advisory — the server
does not reconcile them against `activity_manifest` outcomes"). That is a definition-corpus change
as much as a server change, and should be scoped as such.

### 4.4 Client-side event log, replayed at the boundary

Direct mitigation for the L7 trace loss. The agent (or the §4.2 component, if it exists) appends
a line per step to a local log — step id, timestamp, witness — and the whole log rides along on
`next_activity` to be folded into the trace as synthetic events. Restores per-step timing and
sequencing in the audit surface. It is *agent-authored*, so it is evidence of the same grade as
the semantic trace the docs already describe as agent-dependent — but chaining it to §4.1's
witnesses makes fabrication meaningfully harder than prose is.

### 4.5 Spot-audit escalation

Do not pay for verification uniformly. Default to packaged delivery plus §4.1. Escalate an
activity to strict per-step mode when a suspicion signal fires — witness mismatch, outcome gap,
artifact below a size floor, validation warnings accumulating — or at random with some
probability. Amortises cost; the deterrent is that the agent cannot know which activity is
audited.

## 5. The fork that blocks design

Packaging converts **MCP round-trips into file reads**. That is a clear win on call count and
latency. It is a **regression on context**, because progressive disclosure exists precisely to
keep unread content out of the window — a packaged manifest the agent reads in full costs more
context than the lazy path it replaced, not less.

So the two plausible motivations point at opposite designs:

- **Round-trip / latency pain** → package aggressively, add §4.1, accept the context cost.
- **Context pain** → packaging is the wrong lever entirely. The right levers are the ones prior
  art already pursued: reference delivery, `#section` resource refs, `context_mode: persistent`
  (see [2026-07-16-token-usage-reductions](../2026-07-16-token-usage-reductions/README.md), which
  reports ~74% of step content already bundled).

And before either: **measure.** `inspect_session` records per-activity usage and fetch counts;
`get_trace` resolves the call sequence. The prior expectation worth testing is that the call
budget is dominated not by content delivery at all, but by:

1. `commit-and-persist` — a git commit **and push** after every completed activity, for two
   scopes (component + engineering artifacts);
2. `sync-progress-status` — README Progress writes at dispatch, complete, blocked, and skip
   moments;
3. checkpoint round-trips — `yield` → `present` → `AskQuestion` → `respond`, per checkpoint;
4. the per-activity disposable-worker topology itself, which re-pays bootstrap on every activity.

None of those are addressed by packaging execution manifests. If they dominate, this feature
optimises the wrong term.

## 6. Provisional recommendation

1. **Instrument first.** Establish the call distribution per activity across a representative
   walk. Answer Q1/Q2 before committing to a design.
2. **If round-trips are the pain:** package per activity, and add the **witness chain** (§4.1) as
   the fidelity replacement. It is the only mechanism here that answers the original question
   without pretending to solve an unsolvable one.
3. **Add outcome attestation** (§4.3) regardless of the packaging decision — it is the highest-
   value check available and is orthogonal to delivery mode.
4. **Keep checkpoints as live calls.** They are the only hard sequence gate; packaging must stop
   at the checkpoint boundary, which naturally partitions a walk into packageable segments.
5. **Drop the signed watcher.** If a local component is still wanted, make it a sealed sequential
   release cache (§4.2), not an attester.
