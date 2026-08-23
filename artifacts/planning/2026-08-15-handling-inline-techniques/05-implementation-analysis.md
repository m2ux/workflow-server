# Implementation Analysis — Handling Inline Techniques

> 2026-08-22 · [#397](https://github.com/m2ux/workflow-server/issues/397) · Complete

Baselines for the six deliverables, taken first-hand. Server figures are measured at the package's own
branch head `3cf1d7f5`; corpus figures at `34cd5429`, the commit the earlier activities measure at, with
the drift against the pinned and current commits stated. Every count names its unit.

**Provenance, stated once.** The package's worktree pins the `workflows` submodule at `1921a6e5` and the
measurement commit `34cd5429` is 5 commits ahead of it. The submodule is not provisioned in that worktree,
so a guard run there measures nothing. Both are recorded at [IA-1](02-assumptions-log.md#log); the second
is why the figures below come from a provisioned checkout rather than from the worktree.

## Implementation Review

### Existing Location

| Component | Path | Description |
|-----------|------|-------------|
| Shared composition | `src/loaders/technique-loader.ts` | `composeLoaded` is the single composition routine; `resolveTechniques` (bundle door) and `composeTechniqueWithSource` (step-bound door) both call it |
| Ancestry resolution | `src/loaders/technique-loader.ts` | Ancestors are the `pathSegments` prefixes of the callee id, loaded from one techniques directory — the argument W0 corrects |
| Markdown parse | `src/loaders/markdown-technique-loader.ts` | `rewriteResourceLinks` is the only body text rewrite in the loader; a technique link passes through verbatim |
| Fragments | `src/loaders/fragment-resolver.ts` | Two fragment kinds, rule text and checkpoint bodies; non-recursion asserted by comment, enforced by the types |
| Activity door | `src/tools/workflow-tools.ts` | `get_activity` — takes `context_tokens`, runs the outbound resource scan, bundles eagerly |
| Step-bound door | `src/tools/resource-tools.ts` | `get_technique` — no budget parameter, no resource scan, single-body response |
| Orchestrator door | `src/tools/workflow-tools.ts` | `get_workflow` — no `context_tokens`, no `agent_id`, no resource scan; the third door [F-2](04-kb-research.md#findings) names |
| Baseline lists | `src/loaders/core-ops.ts` | The hand-maintained stand-in for the missing delivery |
| Delivery ledger | `src/utils/delivery.ts` | Whole techniques keyed by identifier, named blocks by content hash |
| Link classifier | `src/utils/resource-ref.ts` | `extractResourceIds` — the grammar a technique scan would sit beside |
| Guard registry | `scripts/guards.ts` | 29 entries: 26 corpus-scoped, 3 repo-scoped |

### Usage Patterns

**How it is used today:** an agent receives composed technique bodies through one of three doors. A
technique named inside another technique's protocol arrives only if it happens to be listed in the role
baseline for the caller's door; otherwise the reference reaches the agent as prose and the agent reads the
file off disk or improvises.

**Call frequency:** 135 logical call sites across 79 caller files reach 64 distinct callees. The heaviest
single caller reaches 12 further techniques under the published grammar.

### Dependencies

**Depends on:** `composeLoaded` for every delivered body; the delivery ledger for deduplication across
doors; `context_tokens` for the only budget that exists.

**Depended on by:** `resolveTechniques` carries 3 direct callers and reaches both delivery doors, the
`refs` guard and three benchmark harnesses. `stealth-isolation` is the only guard that reads a composed
protocol, so it is the first thing a composition change perturbs.

### Architecture

**Existing patterns.** The resource pipeline is a complete fold pipeline pointed at a different reference
kind: scan the projected text, resolve, load, deduplicate, charge a budget, warn on a miss, attach bodies.
It exists at the activity door only. Nothing anywhere in the reference or composition path follows a
reference discovered during resolution, so there is no traversal to cycle-detect and no cycle detection —
the sole cycle defence in the tree guards a hand-edited session file.

**Known technical debt.** Three resolution sites pick the techniques directory for ancestor composition;
two use the requested workflow id and one uses the workflow the callee was actually found in. The
`check-branch-as-step` guard exists on disk with no registry entry, so it runs only from its own test.

## Effectiveness Evaluation

### What's Working Well

| Capability | Evidence | Confidence |
|------------|----------|------------|
| One composition routine behind both bundling doors | `composeLoaded` is the single implementation, asserted in its own doc comment and reached from both wrappers | HIGH |
| Content-keyed deduplication already spans doors | A whole technique is keyed `technique:<id>` and constructed byte-identically at the activity and step-bound doors | HIGH |
| Deliver-each-body-once is existing behaviour | The resource loop gathers identifiers into a set before loading; the ledger stages a hash per body and consults it before staging the next | HIGH |
| Unmeasured is distinguished from clean, by design | `UnreachableCorpusError` renders as a dedicated exit code, and `check-all` reports UNMEASURED separately and fails the job | HIGH |
| Triage carries reasons rather than a regenerable total | 69 entries, each with a verdict and a named rationale; no guard in the registry asserts a total | HIGH |

### What's Not Working

| Issue | Evidence | Impact |
|-------|----------|--------|
| Ancestor contracts resolve from the caller's tree | Two of three resolution sites pass the requested workflow id where the callee's own source workflow is available on the adjacent line | HIGH |
| The unbudgeted channel throttles the budgeted one | The eager counter opens at the serialised size of the operations bundle, so an oversized bundle can leave zero room for step techniques and zero for resources | HIGH |
| Budget-displaced steps are invisible rather than deferred | The technique loop breaks before the resource scan, so a displaced step contributes nothing even to the deferred-reference list | MEDIUM |
| An anchorless dangling link is checked by nothing | Only 2 guards test whether a corpus link target exists; one requires an anchor and the other covers a single file | HIGH |
| A local guard run can read clean without measuring | 9 of 26 corpus guards resolve their root permissively and cannot emit the unmeasured exit | MEDIUM |
| Two link grammars claim the same string | The parse-time rewrite's docstring states a bare `<op>.md` technique link is left untouched; the delivery-time predicate claims it as a resource id | MEDIUM |
| Full delivery loads resource bodies only to discard them | The full-mode branch loads every linked resource purely to emit warnings, then attaches nothing | LOW |

### Workarounds in Place

- The `core-ops.ts` baseline lists — 11 of the orchestrator list's 20 entries exist because a technique
  names them from prose and no door delivers them.
- Reading a callee off disk mid-protocol, observed once in the ordinary course of running this workflow.

## Baseline Metrics

All corpus rows measured 2026-08-22 by one scanner over an extracted tree, under the grammar SC-3
publishes: invoking verb `apply` **matched case-insensitively** and followed by whitespace anywhere
earlier on the line, unanchored relative link to a technique file, inside a Protocol section, fences
skipped, `resources/` excluded, qualified `group::op` pairs collapsed to one logical call site. Server
rows read at `3cf1d7f5`.

**The case term's value is stated here rather than left to be discovered.** Every figure in this table
reproduces only under the case-insensitive reading; read case-sensitively for a literal lowercase
`apply`, the same corpus gives 69 raw occurrences and 52 logical call sites against the 172 and 135
below. The corpus carries 238 capitalised `Apply` to 59 lowercase, which is why the term is not
cosmetic. This is recorded under [Counting this area](#counting-this-area) as a third and independent
argument for fixtures over a term list.

| Metric | Current Value | Measurement Method | Date Measured |
|--------|--------------|-------------------|---------------|
| Technique files | 571 at `34cd5429`, 572 at current corpus head | File walk under `*/techniques/` | 2026-08-22 |
| Raw link occurrences | 172 | Qualifying links, uncollapsed | 2026-08-22 |
| Container halves of qualified pairs | 37 | Links to `TECHNIQUE.md` followed by `::` and a second link | 2026-08-22 |
| Logical call sites | 135 | Raw occurrences after collapsing qualified pairs | 2026-08-22 |
| Deduplicated caller-callee pairs | 121 (144 uncollapsed) | Distinct (caller file, callee file) | 2026-08-22 |
| Caller files / distinct callees | 79 / 64 | Distinct paths | 2026-08-22 |
| Intra-group call sites | 69 | Caller directory equals callee directory | 2026-08-22 |
| Residual container targets | 2, both `version-control::infrastructure-submodule-paths` | Container-target sites surviving the collapse | 2026-08-22 |
| Unresolvable targets | 1, in `prism-update/techniques/submit-update.md` | Callee path absent from the tree | 2026-08-22 |
| Guard disposition worklist | 94 logical call sites | 135 minus the converted 41 | 2026-08-22 |
| Converted population | 41 = 23 cross-group + 18 intra-group | GitNexus 38 + Atlassian 3 | 2026-08-22 |
| Distinct operations behind the 23 | 11, all GitNexus | Distinct callee files among cross-group converted sites | 2026-08-22 |
| Heaviest closure | 46,865 bytes / 14 members uncollapsed; 40,671 / 12 collapsed | Stop-at-revisit traversal per caller | 2026-08-22 |
| Deepest traversal queue | 26 entries with anchored links uncollapsed; 25 uncollapsed; 21 collapsed | Queue entries including revisits | 2026-08-22 |
| Heaviest closure, protocol text | 18,602 characters over 14 members, 8.2x the caller's 2,273 | Protocol sections only, the scan's actual input | 2026-08-22 |
| Eager delivery budget | 640,000 characters at 200,000 declared tokens | `context_tokens` x 0.8 headroom x 4 chars-per-token | 2026-08-22 |
| Batch budget, same declaration | 280,000 characters (0.35 headroom) | The second budget from the same parameter | 2026-08-22 |
| Heaviest closure against budget | 7.3% uncollapsed, 6.4% collapsed | Closure bytes / 640,000 | 2026-08-22 |
| Orchestrator baseline entries | 20, of which 11 carry a non-delivery attribution | Entry count and comment read first-hand | 2026-08-22 |
| Worker baseline entries | 8, of which 1 carries the same argument from a stub | Entry count and comment read first-hand | 2026-08-22 |
| Guard registry | 29 entries (26 corpus, 3 repo); 1 guard unregistered | Registry array | 2026-08-22 |
| Guards asserting a total | 0 | Registry sweep; the only count assertion is a positive floor | 2026-08-22 |
| Binding-fidelity triage | 69 entries; 38 unconsumed-output, 35 under one rationale | Triage file at `3cf1d7f5` | 2026-08-22 |
| Registered MCP tools | 18 | Registration sites across both registrars | 2026-08-22 |
| Benchmark scenarios for a referenced technique | 0, and no scenario construct exists | Four harnesses, all configured by ad-hoc flags | 2026-08-22 |
| Cross-door identity tests | 0 | No test compares a bundled entry against a step-bound fetch | 2026-08-22 |

### Key Findings

- **The census reproduces.** 172 raw occurrences, 37 container halves, 135 logical call sites, 121
  deduplicated pairs and 69 intra-group sites all reproduce exactly, as do the per-group figures for
  `github-cli-protocol` (39), GitNexus (38, of which 15 intra-group), `workflow-engine` (22, of which 21),
  `harness-compat` (12), `version-control` (6), `manage-git` (4), Atlassian (3) and `cargo` (1), the 2
  residual container targets and their identity, and the single dangling target. **The worklist total of 94
  and the converted population of 41 both reproduce.**
- **The largest group in the corpus was missing from the breakdown above.** `github-cli-protocol` holds
  **39 logical call sites**, more than GitNexus's 38, and it was absent from this list until the
  implementation activity re-measured. It converts nothing — it is shell-backed — so all 39 sites sit
  inside the guard's disposition worklist, where they are the largest single block at **39 of 93, a 42%
  share**. The omission is recorded rather than quietly repaired because of what it demonstrates: the seven
  groups originally listed sum to 87 of 135, and **a breakdown missing its largest row still sums
  plausibly to a reader who does not know what is absent.** Every other enumerated breakdown in this
  document should be read with that in mind; the three re-checked at the implementation activity — the
  core-operations entries (20 orchestrator, 8 worker), the guard registry (29 entries, 1 unregistered) and
  the registered tool count (18) — all reproduce.
- **Totals reproduce where membership does not.** Between the pinned corpus and the measured corpus the
  totals are identical and 2 call sites differ in identity. Between the measured corpus and the current
  head, 19 site identities change, the total moves 135 to 134, and the worklist moves 94 to 93.
- **The conversion is smaller in tools than in call sites.** The 23 sites that become tool calls resolve
  to 11 distinct operations, so the server's tool surface grows from 18 to at most 29 rather than to 44.
- **SC-7's headroom figure moves under a convention SC-3 itself mandates.** The heaviest closure is 46,865
  bytes over 14 members with a qualified `group::op` pair counted as two edges, and 40,671 bytes over 12
  members once that pair collapses to one call as SC-3's ninth term directs. Both reproduce exactly; the
  two members between them are group `TECHNIQUE.md` files. Both sit inside the 640,000-character budget, at
  7.3% and 6.4%, so **feasibility is untouched** — what moves is which figure the criterion asserts, and a
  lone number here is what this area has been burned by repeatedly.

## Gap Analysis

| ID | Gap | Current State | Desired State | Impact | Priority |
|----|-----|---------------|---------------|--------|----------|
| G1 | Ancestry resolves from the caller's tree (SC-1) | 2 of 3 resolution sites pass the requested workflow id; 1 passes the callee's source workflow | All three pass the callee's home tree | A borrowed or cross-workflow callee silently composes against the wrong container contracts | HIGH |
| G2 | No cross-door identity test, and the doors differ at the payload (SC-1) | Two near-neighbour tests stop at provenance fields and ledger semantics | One test asserting inputs, outputs, rules and protocol across both doors | SC-1's verification does not exist, and the assertion must target the shared projection rather than the response | HIGH |
| G3 | A tenth grammar term is owed in the guard (SC-3, SC-5) | Nine terms published; the tenth is settled at the analysis gate and not yet in SC-3 or the guard's grammar | Ten terms published, each pinned by a fixture | Bin attribution moves GitHub 38/39 and domain 11/10 while the worklist total holds at 94; SC-5's repair changes the answer mid-change | HIGH |
| G4 | SC-7's asserted bytes carry no grammar term | 46,865 bytes stated without the convention that produces it | The figure stated with its term, and the container-delivery question settled | The same closure is 40,671 bytes under the package's own published grammar | HIGH |
| G5 | SC-7's verification names a construct that does not exist | Four benchmark harnesses, no scenario mechanism, 7 enumerated hot resources all non-technique | A scenario mechanism, then a referenced-technique scenario in it | SC-7's verification is a harness change, not a table row | MEDIUM |
| G6 | The third door has no per-technique ledger key (SC-7a, SC-10) | `get_workflow` collapses the whole bundle under one content hash, all-or-nothing, and takes no `context_tokens` or `agent_id` | A decision on whether the third door delivers folded bodies, and against which counter | SC-7a's collapse "at both doors" has no key to collapse against at the door the 11 attributed entries reach | HIGH |
| G7 | The two delivery channels are coupled (SC-7, F-3) | The eager counter opens at the operations bundle's serialised size, measured after marker collapse | A charging rule that states which counter a folded body draws on, given the coupling | A folded body competes with step techniques whichever channel it is charged to, and coverage depends on delivery history | HIGH |
| G8 | SC-10's attributed population and its documentation disagree (SC-10) | 11 of 20 orchestrator entries attributed; the worker's role entry carries the same argument; a design document enumerates 14 refs, omitting 6 of the 11 | One stated population and one accurate document | Retirement is per-entry against a list two homes describe differently | MEDIUM |
| G9 | The conversion's internal split is stated wrongly (SC-13) | SC-13 records 15 vanishing and 26 becoming tool calls | 18 vanishing and 23 becoming tool calls | All 3 Atlassian sites are intra-group; the total of 41 is unaffected | MEDIUM |
| G10 | Dangling links and unprovisioned corpora both read clean (SC-5, SC-12) | 2 guards test link-target existence, 1 of them anchor-only; 9 of 26 corpus guards cannot report unmeasured | Existence checked for anchorless links; every corpus guard able to report unmeasured | The dangling target survives because nothing looks, and a local run cannot prove otherwise | HIGH |
| G11 | The stealth scan is scoped to one technique and one workflow (SC-9) | Per reachable step it composes one technique and scans its protocol, for one workflow chosen by flag | The scan running over the delivered closure across the corpus | SC-9 is a scope change on two axes; its cost evidence stays n=2 | MEDIUM |
| G12 | SC-7a's denominator does not reproduce (SC-7a) | 81 distinct techniques asserted; the published grammar gives 64, with 64 to 87 across variations | A denominator re-derived at the delivered commit through the loader | The 31-of-81 dual-reach ratio is the figure the keying decision rests on | MEDIUM |
| G13 | The test baseline moves underneath the package (SC-12) | A sibling branch rewrites the suite and already carries coverage and a triage entry this baseline lacks | A stated test baseline commit and a merge order | Whether F-4's untested-extractor gap is open at delivery depends on merge order | MEDIUM |

### Two constraints the plan inherits

**"Within the existing delivery budget" is a weaker guarantee than it reads.** SC-7's phrase names a budget
that is already partly spent when the first step technique is considered. The eager counter opens at the
serialised size of the operations bundle — the channel that has no budget and no per-item cap — so the
uncapped channel draws down the capped one before any technique body is bundled, and because that seed is
measured after unchanged-marker collapse, how much room remains depends on what this agent context has
already been delivered. Two consequences the plan carries rather than rediscovers: a folded body competes
with step techniques whichever of the two channels it is nominally charged to, and eager coverage is
delivery-history dependent, so the same activity can bundle a different number of steps on a second visit.
This is [F-3](04-kb-research.md#findings) and [F-2](04-kb-research.md#findings) resolving into one question
about one counter, which is why [G6](#gap-analysis) and [G7](#gap-analysis) are answered together or not
at all.

**The six-deliverable surface is reviewable; the hazard is ordering, not size.** The measured risk is that
the conversion removes 41 of 135 logical call sites from the corpus the new guard asserts totals over, so a
guard baselined before the conversion lands is green against a corpus the same change is still editing, and
a reviewer cannot separate a guard defect from a legitimate re-baseline. SC-13 already keys its re-baseline
to the delivered corpus commit, so the criterion answers this without a scope change. What `plan-prepare`
turns it into is commit sequencing: land the corpus-affecting work — the conversion, and SC-5's repair of
the dangling target — before the commit that baselines the guard's published totals, and take the corpus
submodule pin to the delivered commit in between. Splitting the pull request is not required and is not
recommended; sequencing the commits inside it is.

## Opportunities for Improvement

### Quick Wins

1. **W0 as a two-argument change.** Both defective sites have the provenance-correct value in scope on the
   adjacent line, and the third site already demonstrates the correct form — Expected impact: SC-1's
   behaviour with no new machinery; Effort: minimal, the specification section and test dominating.
2. **Register the orphaned guard.** One registry entry brings `check-branch-as-step` into CI — Expected
   impact: a written guard actually runs; Effort: one line.
3. **Correct SC-13's split and SC-7a's denominator in place.** Both are restatements against measurements
   already taken — Expected impact: two fewer figures that will not reproduce; Effort: minimal.

### Structural Improvements

1. **Settle the charging rule with the coupling in view.** The unbudgeted bundle seeds the budgeted
   counter, so F-2 and F-3 are one question about one counter — Expected impact: SC-10 can retire per door
   without a regression path; Effort: a design decision plus the door work it implies.
2. **One classifier over the link space.** Hold the shared grammar module narrower than either consumer and
   let it own the technique-versus-resource partition — Expected impact: closes the spelling-dependent
   blind spot before a second scan is built on it; Effort: moderate, and it is SC-2's module either way.

### Optimization Opportunities

1. **Stop loading resource bodies to discard them.** Full delivery pays the I/O to warn and attaches
   nothing — Expected impact: removes I/O proportional to the linked-resource count; Effort: small.

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria). This document
contributes baselines and gaps. Two analysis-derived targets, each mapped to a gap:

- **The guard's asserted totals are baselined at the delivered corpus commit, after the conversion commit**
  (G3, G9) — the conversion moves the totals the guard asserts, so a baseline taken before it is green
  against a corpus the same change is still editing.
- **Every corpus guard can report unmeasured** (G10) — 9 of 26 cannot today, and the package's own
  worktree is the case that proves why it matters.

### Measurement Strategy

- **Call-site totals:** one scanner, the published grammar's terms as named parameters, run at the
  delivered corpus commit. Each term pinned by a fixture, since two of the published terms overlap and a
  total cannot show that.
- **Closure and budget:** stop-at-revisit traversal per caller, reporting delivered bytes, member count
  and queue depth, with the collapse convention stated beside each figure.
- **Before and after:** the corpus figures in the Baseline Metrics table re-run at the delivered commit;
  the drift measured here is the expected magnitude, so a larger move is a signal rather than noise.
- **Delivery cost:** `bench:token --gate` already fails on a 1% delivery-character regression, so SC-7's
  scenario lands inside an existing gate once a scenario mechanism exists (G5).

## Counting this area

The standing practice is that a count is restated with its unit or re-derived before anything is planned
against it. This activity re-derived the corpus census in full, plus six figures the record carries
individually. **The census reproduces exactly.** Of the six, two reproduce once the grammar term behind
them is named, one is superseded and three are corrected. One new free term surfaced.

| Figure as carried | Unit as carried | Re-derived | Verdict |
|---|---|---|---|
| 46,865-byte heaviest closure, 14 members | bytes, closure members | Reproduces exactly with qualified pairs uncollapsed; 40,671 bytes over 12 members under the published grammar | Reproduces, under a term the published grammar reverses |
| Deepest walk queues 26 entries | queue entries | 26 with anchored links and pairs uncollapsed; 25 uncollapsed; 21 under the published baseline | Reproduces, under two terms simultaneously |
| 81 distinct techniques an inline call reaches | distinct techniques | 64 under the published grammar; 64 to 87 across single-term variations | Superseded; reproduces under none of the variations run |
| 15 intra-group calls vanishing, 26 becoming tool calls | logical call sites | 18 and 23 — all 3 Atlassian sites are intra-group | Corrected; the total of 41 and GitNexus's 15 both stand |
| Four documented narrowings in the binding guard | narrowings | 3 documented; the producer test's order-blindness is unstated in the file | Corrected |
| `context_tokens` appears only in the `get_activity` handler | handlers | Two handlers take it as a parameter; it is absent from `get_workflow` | Corrected; the substantive claim stands |

The census is the first set of figures in this package to survive re-derivation unchanged, which is worth
stating because it tells a later reader which numbers have earned trust and which carry a history.

**As of the planning pass, eight figures have moved under a definition or unit change, and exactly two sets
have survived re-derivation: this census, and the closure byte measurements.** The eighth is [F-7](04-kb-research.md#findings)'s
obligation trade of 2 entries against 14, whose unit is unstated: counting rule sub-headings within a
`## Rules` section at corpus `34cd5429` gives 13 entries across the two containers outside the caller's
ancestry and 19 own-rule entries across the 12 closure members, reproducing neither of F-7's 3 and 9. The
trade is kept as attributed and the non-reproduction is reported rather than reconciled, the direction it
establishes — a large multiple — not being in question. The decisions that rested on it were settled on the
byte figures instead, which are first-hand: 40,671 bytes of operation bodies, 5,580 of inherited rules text,
46,865 for whole container bodies. A later reader should treat the census and the byte figures as load-bearing
and every inherited entry count as owing a unit before anything is planned against it.

### The first prediction this package made that came true

Re-measured at the implementation activity against corpus commit `7f37a2bd`, the drift stated above is
confirmed on all three of its claims: **19 call-site identities change, the logical total moves 135 to 134,
and the worklist moves 94 to 93**, with the converted population holding at 41. The whole census
reproduces at the new pin.

This is worth its own heading. Eight figures in this package have moved under a definition or unit change,
and every entry in the table above is a re-derivation of something already recorded — a backward check.
This is **the first forward prediction the artifacts made that survived measurement at a commit taken after
the prediction was written.** It is evidence the grammar work is doing what it was bought for: a census
stated with its terms is a census that can predict, where a census stated as a bare total can only be
re-argued.

### The case term, and a third route to fixtures

The case term was in the published list of terms and its **value** was still unstated, so the same
published grammar admitted 172 raw occurrences or 69 depending on a reading the list did not fix. The
term's presence in the list did not prevent the ambiguity — which is the point. The two routes already
recorded reach the fixtures conclusion from the grammar's internal structure and from corpus drift; this is
a third, reached from a term that was named, published, and still under-determined. A fixture carrying a
capitalised `Apply` fails when the case reading changes; a list entry reading "case sensitivity of the
invoking verb" does not, because it names the question without committing to an answer.

### The tenth term

**Whether a call site whose target does not resolve counts as a call site, and which callee bin owns it.**
SC-3 publishes it, settled at the `analysis-assumption-interview` gate and recorded at
[IA-11](02-assumptions-log.md#log). Two reasons. SC-5 repairs the dangling target in the same change that
introduces the guard, so the answer changes *during* the delivery — the exact circumstance in which an
unstated term becomes two defensible readings of one guard run. And each of the nine terms before it was
found by measuring rather than by reading, every one of them having read complete beforehand; a tenth found
the same way earns the same treatment.

**The tenth term does not change the size of the job.** The worklist total is **94 logical call sites**
under either reading, and the converted population is **41** under either, because the site the term moves
travels between bins rather than into or out of the worklist. What moves is bin attribution: GitHub between
38 and 39, domain between 11 and 10. After SC-5's repair the site resolves and the bins settle at 39 and 10.

### Fixtures rather than totals, reached twice by independent routes

The case for pinning each grammar term with a fixture instead of an asserted total now rests on two
measurements that share no method.

The first is the ninth term's overlap, established by elicitation: container-target inclusion and counting
unit are largely measuring one form, the qualified `group::op` pair, so a published list of terms cannot
show that two of its entries are the same term seen twice.

The second is corpus drift, measured here. Between the commit this branch pins and the commit the figures
are taken at, **every total is identical while 2 call-site identities differ**. Between that commit and the
current corpus head, **19 identities change**, the logical call sites move 135 to 134 and the worklist 94 to
93. So a guard asserting totals alone passes over a corpus it has never seen, and does so in the ordinary
case rather than a contrived one.

One route reaches the conclusion from the grammar's internal structure and the other from the corpus's
movement over seven days. **Two independent routes to one conclusion is corroboration**, and it is stronger
than either measurement alone: a fixture set fails when a term's meaning changes *and* when the corpus
underneath it changes, where a total fails for neither reason reliably.

One figure this activity did not replicate: SC-9's scan cost of 22.3 ms against 0.29 ms remains sample-size
two and unreplicated, as [RS-7](02-assumptions-log.md#log) routed here. The scan's **input** is replicated
exactly — 46,865 bytes of file, 18,602 characters of protocol over 14 members — but the timings need a
built closure and a run against the guard's four patterns, which is code work inside the delivery. Recorded
as unreplicated rather than carried as confirmed.

## Sources of Evidence

| Source | Type | What It Showed |
|--------|------|----------------|
| Corpus at `1921a6e5`, `34cd5429` and current head | Scripted measurement | Census reproduction, drift, closure cost, the tenth term |
| `src/loaders/technique-loader.ts` | Code | One composition routine, three ancestry-resolution sites, two of them defective |
| `src/tools/workflow-tools.ts`, `src/tools/resource-tools.ts` | Code | Three doors, one budget, the counter coupling, the payload difference between doors |
| `src/loaders/core-ops.ts` | Code | 20 and 8 entries; 11 plus 1 attributed; one non-runtime consumer |
| `src/utils/delivery.ts` | Code | Identifier keying across doors, content keying for blocks, no per-technique key at the third door |
| `src/utils/resource-ref.ts` | Code | The claiming predicate and the bound the slash count puts on its reach |
| `scripts/guards.ts` and the guard scripts | Code | 29 entries, 1 unregistered, 0 asserting a total, 9 unable to report unmeasured |
| `scripts/binding-fidelity-triage.json` | Triage | 69 entries; 38 unconsumed-output, 35 under one rationale |
| `tests/`, `scripts/run-*-benchmark.ts` | Tests | No cross-door identity test; no scenario construct |

**Note on length.** This runs past the guide's ~150-line budget. Three sections carry the overrun and each
is the deliverable rather than commentary: Baseline Metrics, because the measurements are the payload;
Counting this area, because this package has now had eight counts move under a definition change and a
measurement compressed to its conclusion is the failure that produced them; and the two constraints under
Gap Analysis, because both are conclusions `plan-prepare` would otherwise have to rediscover from the same
evidence.

**Status:** Ready for plan-prepare activity
