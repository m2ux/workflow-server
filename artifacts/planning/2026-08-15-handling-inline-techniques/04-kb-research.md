# Knowledge Base Research — Handling Inline Techniques

> 2026-08-17 · [#397](https://github.com/m2ux/workflow-server/issues/397) · Complete

Research was bought at the classification gate on a narrow brief: corroborate the chosen design against
outside practice, and probe for what seven doctrine rounds and four comprehension passes did not reach.
It does not re-derive settled ground.

Four design choices are corroborated, one of them qualified. The probe returned eight findings, of which
**F-1 changed an acceptance criterion**: SC-3 now requires the guard to publish all seven terms of its
grammar rather than the verb list alone. Three of the record's own figures were re-derived and all three
reproduce exactly, which is the evidence the rest of the probe rests on.

## Research Approach

| Activity | Technique Used | Results Summary |
|----------|----------------|-----------------|
| identify-patterns | `pattern-research` over the concept-rag index | **No relevant content.** Gap recorded below |
| Web research | Official specifications and primary project sources | Four corroborations, one of them qualified |
| Corpus re-derivation | Scripted measurement at corpus commit `34cd5429` | Six findings; two prior figures reproduced exactly |

**Knowledge base gap.** The indexed library is general software engineering — architecture patterns,
databases, DevOps, security, distributed systems. Four searches (scope and name binding; transitive
include resolution with cycle detection; shared-grammar single source of truth; lint baseline practice)
returned nothing above noise, and the two language-design titles in the catalogue retrieved front matter
rather than their scoping chapters. This problem — reference resolution inside a delivery pipeline — has
no coverage in the library. External corroboration therefore rests entirely on the web pass, and every
finding below cites a primary source.

## Applicable Design Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| Lexical (defining-site) scope over dynamic (call-site) scope | Common Lisp; Emacs Lisp | W0's home-tree ancestry is lexical scope under another name, and the language record is one-directional | HIGH |
| Cycle-tolerant reference linking via a visited set | ECMAScript module linking; JSON Schema `$ref` | Corroborates stop-at-revisit, and supplies the principled reason the doctrine record argues only on cost | HIGH |
| One grammar module shared by the checker and the runtime | `rustc_lexer`, shared by rustc and rust-analyzer | Corroborates SC-2 directly, including its stated motive | HIGH |
| Normative grammar published with an executable conformance fixture set | CommonMark | Qualifies SC-3: the durable artefact is the fixture set, not an asserted total | HIGH |

### Lexical scope is the corroborated default, and the trade is asymmetric

W0 resolves cross-workflow ancestry as *contract follows the file's home tree*. Stated in language terms
that is lexical scope; executing-workflow ancestry is dynamic scope. The record here is unusually settled:
Common Lisp makes lexical the default and requires dynamic binding to be declared explicitly, and Emacs
Lisp — the best-known dynamic-by-default survivor — added lexical binding in Emacs 24 and now
[documents it as the preferred mode](https://www.gnu.org/software/emacs/manual/html_node/elisp/Variable-Scoping.html).
[Monnier and Sperber's history of the language](https://dl.acm.org/doi/pdf/10.1145/3386324) (PACMPL, 2020)
records that migration as a correction rather than a preference. The commentary is blunter: dynamic scope
for ordinary bindings is "widely regarded as a mistake … virtually no other languages have adopted it",
and the compromise everyone converged on is lexical everywhere with dynamic available on explicit
declaration. W0 has picked the side of that trade the record favours, and the option it declined is the
one languages have spent forty years backing out of.

### Cycle tolerance has a principled reason the doctrine record does not give

The cycle correction is argued in the record on measurement: stop-at-revisit terminates everywhere and
costs the same as a traversal that cannot meet a cycle. That is true and it is now reproduced (below).
It is also the weaker of the two available arguments, because a cost argument is contingent on the corpus.

The stronger argument is categorical, and outside practice states it. Normative reference-resolution
algorithms tolerate cycles; normative *evaluation-order* algorithms must reject them. ECMAScript module
linking is the sharpest case: the specification defines a
[Cyclic Module Record](https://tc39.es/ecma262/multipage/ecmascript-language-scripts-and-modules.html)
and links the graph by depth-first search carrying a `[[Visited]]` set and a `[[DFSAncestorIndex]]`, so
that interdependent modules transition together as a strongly connected component — cycles are a
supported case in the spec text, not an error. JSON Schema is the same:
[recursive `$ref` is valid](https://ajv.js.org/guide/combining-schemas.html) provided the validator
tracks what it has entered, and implementations do exactly that, either with a visited structure or by
compiling the first encounter to a label and later encounters to a jump. Build systems fail on cycles for
the opposite reason: they must produce a total order over work whose inputs depend on outputs.

Delivery is a reachability problem, not an evaluation problem — nothing in a folded closure computes a
value another member consumes. That is why stop-at-revisit is correct here independently of the corpus,
and it is worth carrying into the specification amendment, because a rule justified only by measurement
invites re-litigation the next time the corpus changes.

### The shared grammar module has a direct precedent, motive included

SC-2 requires the reference grammar to live in one module consumed by both the guard and, later, fold
delivery. Rust does exactly this: `rustc_lexer` was extracted from the compiler specifically so that
[rustc and rust-analyzer tokenise identically](https://rust-lang.github.io/rfcs/2912-rust-analyzer.html),
with the crate deliberately held to pure lexing so that compiler-specific concerns cannot leak in and
fork it. The motive is the one SC-2 states — a checker and a runtime that disagree about what a token is
will disagree about everything downstream — and the structural lesson is that the shared module has to be
kept *narrower* than either consumer wants, which is also what SC-2's "no anchor slugger" clause enforces.

## Findings

Ranked by consequence. Each figure names its unit; each is re-derived at corpus commit `34cd5429`, the
commit comprehension measured, using scripts held in this session's scratch and reproducible from the
definitions stated inline.

### F-1 · The edge grammar has seven loose terms, not one — actioned into SC-3

This is the finding that earns the activity, and it is the one that changed a criterion. The record
establishes that the edge definition is under-specified in one term — which words count as an invoking
verb — and quantifies a 59% spread across five verb lists while "holding every other stated criterion
fixed". SC-3 was written to close exactly that term: the guard publishes a normative grammar, "the verb
list included".

The verb list is not the only loose term, and it is not the loosest. Holding a stated baseline fixed
(verbs `{apply}`; verb anywhere earlier on the line; unanchored `.md` relative link; inside a Protocol
section; fences skipped; `resources/` excluded; unit = deduplicated caller-callee file pair) and varying
exactly one term at a time:

| Term varied | Edges (deduplicated caller-callee file pairs) | Change |
|---|---|---|
| **Baseline** | 142 | — |
| Verb matched case-sensitively (lowercase `apply` only) | 58 | **−59%** |
| Verb list widened to `{apply, invoke, run, follow, use}` | 186 | **+31%** |
| Verb required to be adjacent to the link | 98 | **−31%** |
| Unit switched to link occurrences | 170 | **+20%** |
| Group-container (`TECHNIQUE.md`) targets not counted as calls | 117 | **−18%** |
| Section scope widened from Protocol sections to the whole file | 163 | **+15%** |
| Self-edges not counted | 140 | −1% |
| Anchored links counted as edges too | 143 | +1% |

Six terms move the count by 15% or more, and case sensitivity alone moves it by 59% — the same magnitude
as the verb-list spread the record identifies as *the* finding. The corpus writes `Apply` capitalised at
the head of a protocol bullet far more often than lowercase mid-sentence, so a guard matching the verb
case-sensitively sees 58 edges where a case-insensitive one sees 142.

Two things follow. First, the axis both comprehension artifacts do state and quantify — anchored versus
unanchored links, the "conservative versus permissive reading" — turns out to be the *least* material of
the eight at 1%, while four unstated terms are each an order of magnitude more material. The existing
record names the cheap axis and one of the expensive ones. Second, and this is the consequence for
acceptance: **a guard could satisfy SC-3 as originally written — publish a verb list, assert a total — and
still leave its grammar under-specified in exactly the way that made the 118-edge criterion
unfalsifiable.** A criterion that names one term of a seven-term grammar does not fix the grammar.

**Disposition.** Settled at the convergence gate: SC-3 requires the guard to publish all seven terms —
verb list, case sensitivity, verb-to-link adjacency, counting unit, container-target inclusion, section
scope, and anchoring — with the totals asserted. The two terms that move the count least are named
alongside the five that move it most, which is the right call: a term's materiality is a property of
today's corpus, and the reason to fix a term is that it is a free parameter, not that it currently matters.

CommonMark is the external precedent, and it is close. Markdown's original prose grammar admitted
incompatible readings and implementations diverged accordingly; the fix was not a published count but
[a precise specification carrying roughly 600 embedded examples that double as conformance tests](https://spec.commonmark.org/0.30/).
A total is a summary of a grammar, and a summary cannot disambiguate the grammar that produced it — so
SC-3's verification should pin each term with fixtures, which is what makes a re-derivation reproducible
by construction rather than by agreement.

**Scanner validation.** The scanner behind the table independently reproduces three figures the record
carries. The single real dangling target: the pull-request-creation apply in `prism-update/submit-update`,
whose relative path climbs one directory too many. The heaviest closure at **46,865 bytes over 14
members** — exact, under the anywhere-on-line convention, which is how the adjacency term was identified in
the first place. And the corpus-wide link total at **822 occurrences across 192 files** — exact, the figure
the record singles out as the one that reproduces.

That third reproduction took one correction worth recording, because it is the same defect class again. The
822 figure reproduces only when **anchored links are counted**; excluding them gives 721 occurrences across
179 files. So the calibration figure the record holds up as reproducible is measured under the *opposite*
anchoring rule to the edge count stated beside it in the same table. It is harmless here — 822 is a
calibration figure and no criterion is keyed to it — but it is a seventh term-slippage in this area, and it
is the reason the calibration initially appeared not to reproduce. Two incidental facts fell out: no
technique link in the corpus sits inside a fenced block, so the fence rule is currently a no-op; and
dropping the `resources/` exclusion takes the count to 1,476 across 347 files, which is the margin the
resource and technique grammars are competing over in F-4.

**Why the spread survives scanner error.** The sensitivity table is a set of ratios between runs of one
scanner with one parameter changed, so a systematic bias in link detection, path resolution or
section-finding cancels rather than propagates. The three exact reproductions validate those shared
components; the table needs only that they behave identically across rows, which is weaker.

### F-2 · SC-10 retires eleven entries whose only door is one the fold design does not cover

SC-10 removes every `core-ops.ts` baseline entry attributed to inline-reference non-delivery, once the
reference that stood in for it delivers instead. The attributed entries are in the **orchestrator**
baseline. The orchestrator baseline is consulted at exactly one place in the server, inside the
`get_workflow` handler; the worker baseline is consulted inside `get_activity`. The two roles use disjoint
doors, and the core-ops comments say so outright — one of them notes that orchestrators "are barred from
`get_activity`", which is why the entry exists at all.

Comprehension's question 8 models two delivery doors, the activity bundle and the lazy step fetch, and
establishes that the second needs two contract additions before it can carry a folded body — a budget
input and a multi-body response shape. `get_workflow` is not in that model. It is a third door, it takes
no `context_tokens` parameter at all, and it is the only door the eleven attributed entries reach.

So on the current evidence, SC-10 withdraws the compensation at a door where SC-7's delivery has neither
been designed nor costed. Either W3a carries a third door's worth of work that no deliverable names, or
SC-10's retirement outruns SC-7's delivery for those eleven entries. This is a collision between two of
this package's own criteria, and the two-door framing is why four comprehension passes did not surface it.

### F-3 · "Within the existing delivery budget" names two channels that behave differently

SC-7 requires referenced bodies to arrive "within the existing delivery budget". There are two candidate
channels and they are not alike.

The eager step-technique channel is budgeted: the budget is the caller's declared `context_tokens` scaled
by a headroom fraction and a chars-per-token factor, technique bodies draw on it first and eagerly bundled
resource bodies draw on the same counter, and both stop at the first item that would overflow. The
operations bundle — the union of declared operations, the workflow-level inherited list and the role
baseline — has **no budget and no per-item cap at either door**; it is composed and serialised in full,
and the only thing that ever shrinks it is the repeat-delivery unchanged-marker collapse.

The eleven entries SC-10 retires are delivered today through the unbudgeted channel. If a folded body is
charged to the budgeted channel, the retirement moves those bodies from a channel that cannot drop content
to one that drops content by design at the first overflow — a regression path with no flag behind it, and
one the "W3a is additive delivery" reassurance (RE-12) does not cover, because RE-12 was established about
the delivery and not about the retirement. Which channel a folded body is charged to is a decision SC-7
does not make.

### F-4 · The resource and technique link classifiers do not partition the link space

W3a adds an outbound technique-reference scan over the same projected text the resource scan already reads.
The two grammars overlap, and the overlap is live today.

The resource extractor claims, from any markdown link, both anything under a `resources/` segment and any
other destination matching a slug pattern carrying no double colon. The deciding predicate is anchored at
`^[a-z0-9]` and matched case-insensitively, so **a leading `.` is what excludes a link, and nothing else
is**: `./sibling.md` and `../../meta/techniques/foo.md` are skipped, while `sibling.md` is claimed. The
parse-time rewrite's own docstring names that exact bare shape as a technique link it deliberately leaves
untouched, so the two modules disagree about the same string. There is no test file over the extractor —
its only references in the tree are its definition, its one caller, and a benchmark script.

The exposure is wider than the bare-filename case, because the pattern's character class admits `/`. Any
relative technique path written without a leading dot is claimed — a workflow-qualified path as readily as
a sibling filename — and the case-insensitive match means bare `TECHNIQUE.md` group-container links are
claimed too. I measured only the no-slash subset: **39 bare technique-link destinations in the corpus, of
which 1 sits in a file the loader composes as a technique** (a workflow-design technique linking a sibling
as `yaml-authoring.md`); the other 38 are in `techniques/README.md` files, which are not composed and so
are latent rather than live. The slash-bearing subset is unmeasured.

The consequence is that **two spellings of the same call classify differently**, on a leading dot. The live
instance produces a spurious unresolvable-resource warning today. After W3a the collision has a worse
shape: a technique-reference scan built on the relative-link grammar either claims what the resource scan
also claims, or is written to yield to it — in which case bare-form calls are invisible to the guard while
dot-slash-form calls are caught, which is a spelling-dependent blind spot in the check SC-3 exists to make
total. That makes this a term of the same grammar RC-1 just closed: whether a leading dot is required is a
free parameter, and F-1's seven terms do not include it.

Comprehension recorded the spurious warning and routed it to follow-ups, noting that settling it touches
the same module a technique-reference scan would. What it did not ask is whether adding the second scan
without first settling the partition creates the asymmetry above. SC-2's single-definition requirement is
about not growing a second anchor slugger beside #398's; it does not require the technique grammar and the
resource grammar to be one classifier over the link space.

### F-5 · SC-3's mechanism is the one this repo already tried and retired

The repo has a settled convention for a guard that meets known debt, and it is not an asserted total. Debt
is triaged per finding in a checked-in JSON file carrying a verdict and a named rationale per entry, with
the rationale's definition enforced by a test, the whole thing gated in CI, and staleness reported so a
triage cannot outlive its finding. Three separate homes state that there is deliberately no regenerate
flag — the guard offers read-only flags that print untriaged and stale findings, and classification stays
a human act. One of those homes records why: a regenerable baseline "carried no reasons, so it absorbed
real defects silently", and names the two defects it absorbed.

No guard in the registry asserts a total today; SC-3 would be the first. And SC-3's verification clause —
totals "fail the assertion until re-baselined" — is a regenerable baseline with the reason field removed,
which is the mechanism this repo retired and documented its reasons for retiring. External practice
converges on the same correction from the other direction: the ratchet pattern's defining property is
that counts may only move one way, so the shape SC-3 is reaching for is
[a monotonic ratchet](https://github.com/imbue-ai/ratchets), not a bidirectional gate. SC-3 states no
direction. The cheap fix is to key SC-3's verification to the existing per-finding triage convention plus
a fixture set per F-1, rather than to a total plus a re-baseline.

### F-6 · One count correction, and it is a denominator

RE-7 records the retirement as countable at "11 of the 28 orchestrator-baseline entries". The 11 is right.
The 28 is the total across **both** role baselines: the orchestrator baseline is 20 entries and the worker
baseline is 8. So the attributed share is **11 of 20 orchestrator entries (55%)**, not 11 of 28 (39%).
SC-10's own verification method says "11 entries in the orchestrator baseline list", which is correct as
written — the defect is confined to the assumptions-log row, and it is the seventh count in this area to
move under a unit or definition change.

Two adjacent facts, both bearing on SC-10's countability. The worker baseline's single role-delivery entry
carries the same non-delivery argument in its comment, sourced from a stub naming it rather than from
another technique's protocol — so the attributed population is arguably 12 across both roles rather than
11 in one, and RE-7 dismissed it as "a different gap" without that comment in view. And the server's own
resource-resolution document describes the orchestrator baseline as 14 entries, omitting 6 of the 11
attributed ones; SC-10 will touch that document.

### F-7 · Rule propagation over a folded closure is undecided

A technique's rules are obligations on the agent, and the bundle already auto-includes the rules of every
technique it touches. Nothing in SC-7 or SC-7a says whether a folded callee's rules join the caller's rule
set. Measured on the heaviest caller: its obligation set today is **2 rule entries**, both inherited from
its own two ancestor containers. Folding its 14-member closure would bring **9 further own-rule entries
plus 3 from two ancestor containers the caller's own ancestry does not include** — 14 entries in total, a
sevenfold increase, importing rules from container trees the caller is not in. Either answer is defensible;
neither is recorded. SC-7a decides how annotations travel and SC-1 decides the callee's own ancestry, so
this is the third carriage question and the only one still open.

### F-8 · The engine-layer exclusion is nearly a no-op, and its own terms are incomplete

Probed as a suspected coverage problem and **falsified**, which is worth recording because it removes a
risk rather than adding one. The exclusion is directional — the doctrine record's row 19 excludes engine
groups as fold targets *from product callers* and keeps intra-engine folds legal, having explicitly
considered and rejected excluding engine-internal folds too. Measured, product-to-engine edges are **3 of
111 pairs** under the adjacent convention and **6 of 186** under the anywhere-on-line convention, so 97%
of edges survive the exclusion under either. It costs almost nothing and truncates almost nothing.

Two residues. The heaviest closure, which supplies SC-7's 46,865-byte headroom figure and SC-9's scan-cost
figures, belongs to an engine caller and is 10-of-14 engine members — so the delivery and scan evidence is
drawn from the caller class the exclusion permits in full. Given the 97% survival that is a fair sample
rather than a biased one, but it should be stated rather than assumed. And the exclusion's terms do not
say which callers count as "product": two of the three product-to-engine edges originate in
`meta/techniques/orchestration-patterns/`, which is neither engine nor a product workflow. SC-11's canon
amendment has to write that boundary down, and today the exclusion exists only in planning artifacts —
not in the design canon, not in the specification, not in the server.

## Risks and Anti-Patterns

| Risk | Source | Mitigation |
|------|--------|------------|
| A published grammar that fixes one term reproduces the unfalsifiable-criterion failure one term over | F-1; CommonMark precedent | Closed — SC-3 strengthened to publish all seven terms (RC-1). Verification by fixtures remains open |
| A retired baseline entry outruns the delivery replacing it, at a door with no fold path | F-2 | Establish which doors SC-7 delivers at before SC-10 removes anything; retire per door, not per entry |
| A regenerable total absorbs real defects silently | F-5; the repo's own retired baseline | Key acceptance to the existing per-finding triage convention; if a total is kept, make it monotonic |
| Two scans claiming the same link produce a spelling-dependent blind spot | F-4 | Define the technique and resource grammars as one classifier over the link space, with the bare-slug case decided |

## Recommended Approach

1. **Primary pattern — one narrow shared grammar module, consumed by checker and runtime.** SC-2 as
   written, with the `rustc_lexer` lesson applied: hold the module narrower than either consumer wants.
   Extend its remit to the link-kind partition of F-4, so the technique and resource classifiers cannot
   disagree about a string.
2. **Publish the whole grammar, not one term of it — settled.** SC-3 is strengthened to require the guard
   publish every term it quantifies over: verb list, case sensitivity, verb-to-link adjacency, counting
   unit, container-target inclusion, section scope, and anchoring, with the totals asserted. Settled by the
   user at the convergence gate and carried into requirements through the reopened elicitation activity.
   The open half is verification: F-5 argues the totals should be pinned by a fixture set and the repo's
   per-finding triage convention rather than by a re-baseline, and that remains a planning choice.
3. **Carry the categorical argument for cycle tolerance into the specification.** Delivery is reachability,
   not evaluation; that is why stop-at-revisit is right, and it does not decay when the corpus changes.
4. **Settle door coverage before retirement.** F-2 and F-3 are one question asked twice: which doors deliver
   a folded body, and against which counter. Answer it before SC-10 removes a baseline entry.
5. **Risks to monitor:** rule propagation (F-7) is undecided and grows the heaviest caller's obligation set
   sevenfold; the engine exclusion's "product" boundary (F-8) is undefined for `meta` callers that are not
   engine.

## Web Research Findings

### Search Queries Used

| Query | Sources Consulted | Key Findings |
|-------|-------------------|--------------|
| Cyclic module linking, visited sets | TC39 ECMAScript spec | Cycles are a specified, supported case; DFS with `[[Visited]]` and SCC grouping |
| Recursive `$ref` resolution | JSON Schema spec issues, Ajv | Recursive refs valid where the validator tracks entry; label-and-jump compilation |
| Shared lexer between compiler and tooling | Rust RFC 2912, `rustc_lexer` docs | Extracted from rustc specifically to prevent divergence with rust-analyzer |
| Lexical versus dynamic scope, historical record | GNU Emacs manual, HOPL IV history | Lexical is the corroborated default; the dynamic default was migrated away from |
| Lint baseline and ratchet practice | Ratchet implementations, engineering write-ups | The defining property is monotonic direction, which SC-3 lacks |
| Ambiguous prose grammar, conformance suites | CommonMark spec | The durable fix is a fixture set, not a count |

### External Documentation

| Source | URL | Key Insights | Relevance |
|--------|-----|--------------|-----------|
| ECMAScript spec, Scripts and Modules (living standard) | [tc39.es](https://tc39.es/ecma262/multipage/ecmascript-language-scripts-and-modules.html) | Cyclic Module Record; DFS with `[[Visited]]`, `[[DFSAncestorIndex]]`, SCC co-transition | HIGH |
| Ajv, Combining schemas (current) | [ajv.js.org](https://ajv.js.org/guide/combining-schemas.html) | Circular `$ref` valid for recursive types where the validator handles entry | HIGH |
| Rust RFC 2912, rust-analyzer (accepted 2020) | [rust-lang.github.io](https://rust-lang.github.io/rfcs/2912-rust-analyzer.html) | `rustc_lexer` shared so compiler and IDE tokenise identically | HIGH |
| `rustc_lexer` crate docs (current) | [doc.rust-lang.org](https://doc.rust-lang.org/stable/nightly-rustc/rustc_lexer/index.html) | Module deliberately held to pure lexing to prevent fork | MEDIUM |
| GNU Emacs Lisp Reference Manual, Variable Scoping (current) | [gnu.org](https://www.gnu.org/software/emacs/manual/html_node/elisp/Variable-Scoping.html) | Lexical binding added in Emacs 24, now the preferred mode | HIGH |
| Monnier and Sperber, Evolution of Emacs Lisp (PACMPL, 2020) | [dl.acm.org](https://dl.acm.org/doi/pdf/10.1145/3386324) | The lexical migration recorded as a correction | HIGH |
| CommonMark spec (0.30 / current 0.31.x, 2024) | [spec.commonmark.org](https://spec.commonmark.org/0.30/) | ~600 embedded examples doubling as conformance tests | HIGH |
| Ratchets, progressive lint enforcement (2024–2025) | [github.com/imbue-ai/ratchets](https://github.com/imbue-ai/ratchets) | Per-rule budgets that may only decrease | MEDIUM |
| Notion, custom ESLint ratcheting (2025) | [notion.com](https://www.notion.com/blog/how-we-evolved-our-code-notions-ratcheting-system-using-custom-eslint-rules) | Per-file counts in a checked-in file, CI-enforced non-increasing | MEDIUM |

### Alignment with KB Research

No knowledge-base findings to align — the library has no coverage of this problem domain, and the gap is
recorded above rather than papered over.

## Open Research Candidates

Every candidate below is a disposition rather than a fact. The facts are settled in the findings, by
measurement or by code; what remains is what the package does about them, which no further research can
answer, with one exception at RC-7 which is a measurement rather than a decision. RC-1 was answered at the
convergence gate; the remaining six carry handoff targets.

| ID | Candidate | Classification | Rationale | Outcome |
|----|-----------|----------------|-----------|---------|
| RC-1 | Whether SC-3 is amended to require a grammar total over its terms, verified by fixtures rather than by an asserted total | Irreconcilable | An acceptance-criterion change; the evidence is complete and the choice is the stakeholder's | **Resolved** — settled by the user at `research-convergence` as a criterion edit |
| RC-2 | Which delivery doors SC-7 covers, and whether SC-10's retirement is sequenced per door | Irreconcilable | A scope and design decision; the door inventory and budget behaviour are established from code | Irreconcilable (stakeholder) |
| RC-3 | Which counter a folded body is charged to — the unbudgeted operations bundle or the budgeted eager channel | Irreconcilable | A design decision; both channels' behaviour is established from code | Irreconcilable (stakeholder) |
| RC-4 | Whether the technique and resource grammars are unified into one link classifier in W2, or the collision is left to follow-ups | Irreconcilable | A scope decision; the collision and its live instance are established | Irreconcilable (stakeholder) |
| RC-5 | Whether a folded callee's rules join the caller's obligation set | Irreconcilable | A design decision with no recorded position; the cost is measured at F-7 | Irreconcilable (stakeholder) |
| RC-6 | Whether SC-10's attributed population is 11 orchestrator entries or 12 across both roles | Irreconcilable | Turns on whether role delivery counts as inline-reference non-delivery — a definitional call, not a researchable fact | Irreconcilable (stakeholder) |
| RC-7 | SC-9's stealth-scan cost figures are sample-size two and were not re-derived here | Irreconcilable | Not a research question — replication needs a built closure and a run against the guard's own patterns, which is code work rather than published knowledge | Irreconcilable (code-analysis) |

**RC-1 · how it was settled**
Resolved by the user at the `research-convergence` gate, as a criterion edit rather than a further research
pass — every axis was already measured, so there was nothing left to research. **SC-3 is strengthened to
require the guard publish the full grammar** — verb list, case sensitivity of the invoking verb,
verb-to-link adjacency, counting unit, container-target inclusion, section scope, and anchoring — with the
totals asserted. All seven terms measured at F-1 are named, including the two that move the count least.
The criterion edit lands in [03-requirements-elicitation.md](03-requirements-elicitation.md#success-criteria)
through the elicitation activity, which is reopened to carry it; it is not restated here.

**RC-2 and RC-3 · why research cannot resolve them**
Both are the same question — where a folded body arrives and what it is charged against. The door
inventory, the budget derivation and the absence of a budget on the operations bundle and on `get_workflow`
are all established from the server source. Choosing among the options is design work for the planning
activity, and RC-2 additionally bears on whether the four-deliverable scope is still the right cut.

**RC-4, RC-5 and RC-6 · why research cannot resolve them**
Each is a scope or definitional decision on established evidence. RC-4 and RC-5 are cheap to answer at
planning; RC-6 is a one-line correction either way, and the assumptions-log denominator is corrected at
F-6 regardless of how it is answered. RC-4 additionally carries a term into RC-1's closed grammar question:
whether a leading dot is required of a technique-link destination is a free parameter that F-1's seven
terms do not cover, so if the grammar is to be total that eighth term is owed too.

**RC-7 · why research cannot resolve it**
It is a replication, not a question. The figures are attributed to comprehension rather than claimed here
and no finding in this document depends on them, but SC-9's acceptance does, and re-deriving them needs a
closure built and scanned rather than a source consulted. Routed to code analysis; recorded at
[RS-7](02-assumptions-log.md#log) as partially validated with the residue named.

## A note on length

This runs to roughly 400 lines against the research guide's ~120-line budget, and the overrun is stated
rather than left to be noticed. Two things drive it. The activity carries two passes with different jobs —
external corroboration of four settled choices, and a probe for what the record missed — and collapsing
them would file the corroboration and the findings it licenses in different places. And the findings are
measurements: F-1's value is the sensitivity table, F-2's and F-3's is the door-and-counter inventory, and
a measurement compressed to its conclusion is a claim a reader has to take on trust, which is the failure
this area has produced seven times.

What the budget does prohibit is quoted passages longer than the findings they support, and there are none:
the longest quotation is a nine-word fragment from a guard comment. The compression available without
losing evidence is in the pattern write-ups rather than the findings.

**Status:** Complete
