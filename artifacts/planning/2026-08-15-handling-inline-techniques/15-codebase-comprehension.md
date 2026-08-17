# Codebase Comprehension — Technique References and Activity Bindings

> Handling inline techniques · 2026-08-15 to 2026-08-16 · four passes complete · coverage: server commits 3cf1d7f5 and c8dc480b, corpus commit 34cd5429

The questions these passes asked, the investigations that answered them, and what they left open. The settled facts live in two corpus artifacts — [technique-reference-resolution.md](../../comprehension/technique-reference-resolution.md) for how a reference written in a protocol is resolved and delivered, and [activity-technique-binding.md](../../comprehension/activity-technique-binding.md) for what an activity step's binding guarantees. This file holds the working behind both.

The pass did not start from nothing. A [2026-08-02 investigation](../2026-08-02-inline-technique-fold-investigation/README.md) already traced the composition pipeline, surveyed the guards and canon, and measured the corpus. This pass verified that work against current heads rather than repeating it, and spent its own effort on four things that investigation did not settle: whether the pipeline has drifted, whether the canon moved after the anti-pattern cohort that merged the day after, where a reference-following delivery would actually attach, and what the mechanical checks do when they meet a callee that has no bind site.

## Open Questions

Twenty-three questions have been worked across four passes, and all twenty-three are closed — the last one, the ledger keying, as a written-out decision for elicitation rather than an answer this reading could give. Five measurements were corrected after the pass that produced them, every one a unit or definition error; all five are recorded rather than overwritten, because the corrections turned out to be the more useful record.

Anchors below point into the pass that answered each question. The [second pass](#second-pass--2026-08-16) deepened the technique side; the [third](#third-pass--the-activity-layer--2026-08-16) opened the activity side and produced a second corpus artifact; the [fourth](#fourth-pass--the-questions-that-were-called-unanswerable--2026-08-16) closed the questions the third had called irreducible.

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 1 | Has the composition pipeline drifted since the August investigation traced it? | Resolved | No. Every cited function sits at the same line; the file is unchanged. | [Pipeline verification](#pipeline-verification--2026-08-15) |
| 2 | Did the anti-pattern cohort that merged on 3 August change the canon's stance? | Resolved | No entry changed. One new entry now governs inline call sites as a legitimate surface. | [Canon after the cohort](#canon-after-the-cohort--2026-08-15) |
| 3 | Where would a reference-following delivery attach — the loader, or the delivery doors? | Resolved | The doors, mirroring the resource scan. But that scan exists at one door only. | [Where a fold attaches](#where-a-fold-attaches--2026-08-15) |
| 4 | Does anything in the codebase already resolve references recursively? | Resolved | Nothing does, and no cycle detection exists anywhere. | [Where a fold attaches](#where-a-fold-attaches--2026-08-15) |
| 5 | What do the guards do when they meet a callee reached only from prose? | Resolved | The unconsumed-output check fires on the callee and is triaged as harmless. | [The check that fires away from the defect](#the-check-that-fires-away-from-the-defect--2026-08-15) |
| 6 | Are the August corpus measurements still good? | Resolved | Re-measured; counts restated, and one new defect has appeared since. | [Corpus re-measurement](#corpus-re-measurement--2026-08-15) |
| 7 | Does one artifact cover this area, or is it two? | Resolved | One. The value of the reading is the comparison between layers. | [Scope of the corpus artifact](#scope-of-the-corpus-artifact--2026-08-15) |
| 8 | Does a fold delivered only through the activity door leave the lazy door short, and does closing that mean lifting the resource scan to a shared place? | Resolved | Yes, and the blocker is contract rather than code: the technique tool takes no budget input and its response has no slot for a second body. | [What the second door needs](#what-the-second-door-needs--2026-08-16) |
| 9 | What does a transitive closure cost against the eager budget? No scenario measures it today. | Resolved | Measured: 169 edges over 87 callers, heaviest closure fourteen files at under 47 kB. | [Closure measurement](#closure-measurement--2026-08-15) |
| 10 | How is a folded callee keyed in the delivery ledger — as a technique, or as a block inside its caller? | Written out for the gate | Both options costed at each door; 31 of 81 inline-reached techniques are also step-bound, which is the population that decides it. | [The ledger-keying decision](#the-ledger-keying-decision-written-out--2026-08-16) |
| 11 | The stealth check is the only guard reading a composed protocol. What does running it over a folded closure cost? | Resolved | Built two closures and measured: 9.0x and 3.2x the protocol text, scanned in under 0.3 ms. Composition dominates by two orders of magnitude and is already paid. | [The reachable-text scan](#the-reachable-text-scan-measured--2026-08-16) |
| 12 | The corpus submodule is not checked out in this work package's worktree, so every corpus-scoped guard reports unmeasured there. | Resolved | Tooling exists; the defect is that an unprovisioned worktree reports unmeasured rather than failing loudly. Carried to follow-ups. | [Pedagogy](#pedagogy--2026-08-15) |
| 13 | The new conformance entry presupposes the construct the older entry forbids, and the doctrine record's open items do not name it for reconciliation. Omission, or deliberate? | Resolved | Oversight, established from history: the list predates the entry by under a day and has had no edit since. The two files are in different submodules. | [The omission, settled from history](#the-omission-settled-from-history--2026-08-16) |
| 14 | Does any value-named callee site other than the harness family have an enumerable set to close over? | Resolved | No. Of the tokens that look like one, only three name a callee; the harness pair alone has a table. | [Pedagogy](#pedagogy--2026-08-15) |
| 15 | The doctrine settles that reference cycles fail the load. Cycles already exist. Does the rule stand, or does traversal stop at a revisit instead? | Resolved on the facts | One real cycle and two self-references, all three correct as authored, touching three callers. Stop-at-revisit terminates everywhere and costs nothing. The disposition is a decision, but it is no longer an even one. | [The cycles, enumerated](#the-cycles-enumerated--2026-08-16) |
| 16 | Are value-named callees a single class beyond static reach, as the epic's acceptance criterion assumes? | Resolved | No — three shapes, and two of the three resolve. | [Value-named callees, swept deliberately](#value-named-callees-swept-deliberately--2026-08-16) |
| 17 | Is technique use "properly handled" at the activity layer, as the hoist proposal assumes? | Resolved | No. 82 of 748 bind sites omit a required own input of their callee — the same defect at about a fifth of the technique-side density. | [The number the pass turned on](#the-number-the-pass-turned-on--2026-08-16) |
| 18 | Why does the binding guard pass clean when those 82 sites exist? | Resolved | Four documented narrowings: own inputs only, seam-keyed not site-keyed, one site clears the seam, order-blind producers. | [Why the guard is clean](#why-the-guard-is-clean-and-the-sites-are-silent--2026-08-16) |
| 19 | Can the fragment mechanism carry a hoisted technique? | Resolved | No — strict two-key container, no reference field on a technique step, resolver visits checkpoints only. | [Fragments are not a substrate](#fragments-are-not-a-substrate--2026-08-16) |
| 20 | What can a hoist not express? | Resolved | Mid-protocol position, technique-local scratch state, mid-protocol gating, technique-determined repetition — each structural. | [What a hoist actually costs](#what-a-hoist-actually-costs--2026-08-16) |
| 21 | Does a guard exist that would confirm a hoist was done correctly? | Resolved | No. The container-contract guard's own header names that check as out of scope. | [The container contract](#the-container-contract-and-the-guard-that-is-missing--2026-08-16) |
| 22 | Can the guard's own unconsumed-input count be reconciled arithmetically with the site-level figure? | Resolved | Yes. Guard 22 = 20 like-for-like + 2 pattern-activity sites the loader never loads; model raises nothing the guard does not. | [The reconciliation, completed](#the-reconciliation-completed--2026-08-16) |
| 23 | Are a borrowed activity's bindings checked in the workflow that borrows them? | Resolved | No. 143 bind sites are only ever checked against the workflow that authored them — the case a producer check exists to catch. | [The reconciliation, completed](#the-reconciliation-completed--2026-08-16) |

## Deep-Dive Sections

### Pipeline verification — 2026-08-15

The August trace cited a dozen functions by line. Reading the loader at current head, every one of them is where the trace put it: the shared composition function, the ancestor protocol wrap, the reference-list resolver, the path parser, the body projection, the bundle formatter. The file has not been touched. The same holds for the schema: the technique object still rejects unknown fields and a protocol step is still a plain string, so there remains no slot a callee could occupy.

The one thing that did change is the corpus underneath. That matters more than it sounds, because every measured claim in the August investigation was taken against a corpus commit two weeks stale, and the guard suite cannot re-take them from this worktree at all — the submodule is not checked out here, which turns every corpus-scoped guard from a pass into an unmeasured result. A green local run in this worktree is not evidence.

### Canon after the cohort — 2026-08-15

The August survey was taken before the pull request that added four anti-pattern entries merged. Reading the catalogue now: the prohibition on technique-to-technique work calls is untouched, as are the two design principles that carry the same stance and the construct inventory row that maps the pattern away from the technique layer. The specification is likewise unamended, and still defines the call grammar in two subsections and sanctions an inline apply for error recovery in a third.

What is new is one entry that reads the other way. It requires that, for each protocol apply, the target's declared inputs be resolved and a required input the call site neither passes nor covers by a default be flagged. That is a conformance rule over inline call sites — it treats them as a governed surface with a totality contract, which only makes sense if they are expected to exist. It sits in the same file as the entry that forbids them, and the doctrine record's open items list the other two new entries for reconciliation in the canon pass and does not mention this one.

So the contradiction the epic exists to close has, since it was documented, acquired a third position: forbidden by the principles, specified by the grammar, and now also conformance-checked as legitimate.

### Where a fold attaches — 2026-08-15

The shared composition function is the wrong place. It merges ancestor contracts along a filesystem path and wraps the protocol with ancestor blocks, and both delivery doors depend on producing byte-identical output from it. A fold attached there would change what "composed" means for every consumer at once, including the one guard that reads composed protocols.

The right shape already exists one layer up, in the activity handler: scan the projected text of a composed technique for outbound references, resolve each, load it, deduplicate it, charge it against the budget, warn on a miss, and attach the bodies. That is the resource pipeline, and structurally it is a complete fold pipeline pointed at the wrong reference kind. The scan that feeds it skips any link containing a double colon — the single line a technique fold would invert.

Two properties of that pipeline complicate reuse.

It exists at one door only. The scan is called from the activity handler and nowhere else. A technique fetched lazily gets its resource links rewritten into loadable identifiers and the agent fetches them; the same technique bundled eagerly gets the bodies attached. Under progressive step-technique load a step outside the eager budget is served only by the lazy door, so a fold built on this pipeline as it stands would not reach exactly the steps whose references have no other delivery path today. That is question 8.

It never recurses. Ancestor composition walks a filesystem path and cannot cycle. Fragment resolution declares non-recursion as an invariant on the ground that a fragment body is plain content. The resource scan runs once per bundled technique and does not re-scan what it loaded. There is consequently no cycle detection in the codebase and no place one would currently be reached — so transitive folding is not an extension of an existing traversal, it is the first one.

### The check that fires away from the defect — 2026-08-15

The August survey predicted that an operation reached only through an inline apply would read as an unconsumed output, because the check computes consumption from activity bind sites. That prediction is confirmed on a live instance.

One wiki operation is invoked from exactly one place, an inline apply in a sibling technique's protocol, and no activity in any workflow binds it. The binding-fidelity check reports its declared output as consumed by nothing outside its own file. That report is in the guard's triage file, verdict harmless, under a shared-operation-return-contract rationale — the rationale carrying most of the suppressed entries of that class. A second wiki operation is in the file for the same reason.

The mechanism is worth stating precisely, because it is the strongest argument in this pass for why prose-invisible edges are more expensive than they look. The signal that a callee has no bind site is present and correctly raised. The check has no way to distinguish "this operation is reached from somewhere the checker cannot see" from "this operation returns a value for a caller the checker cannot see", so a reviewer reads it as the second and writes it off. Every such write-off removes the only evidence of the first.

### Corpus re-measurement — 2026-08-15

Measured with a script over the corpus at commit 34cd5429, fences skipped and links under a resources path excluded, so the counts below are reproducible and are superseded by any submodule bump.

The corpus is 571 technique files, up from 554 in August. Technique links appear 822 times across 192 files. Of those, the lines that pair a technique link with an invoking verb number 180 across 109 files, carrying 289 link occurrences between them, and 144 of those lines sit inside a Protocol section. The canonical qualified pair appears 117 times across 58 files; the parenthesised argument form appears at nine call sites, all of them calls into the graph-query operations. Fifteen technique links sit inside an interface section, where a catalogue entry forbids them.

The number that changed materially is dangling targets. August found none, with three apparent misses all false positives. There are now three misses of which two remain those false positives — illustrative placeholders in an artifact template — and the third is real: an apply of the pull-request creation operation whose relative path climbs one directory too many and resolves outside the corpus root. The same operation is applied correctly from a technique one directory deeper, which is how the mistake was made. No guard sees it, because the link carries no heading anchor and the anchor checker's pattern requires one.

That is a fourteen-day-old defect in a class the August survey reported as empty. It is the clearest available evidence for the rate at which this surface rots unattended, and it is a ready regression case.

### Scope of the corpus artifact — 2026-08-15

The artifact runs to roughly 310 lines against a budget of about 250, and the rule says an area needing materially more is two areas. There is an obvious split — the server's parse-compose-deliver path on one side, the guard registry on the other — and it was rejected. What a reader needs from this area is precisely the comparison across that seam: which properties the runtime relies on, which the guards prove, and where the two do not meet. The invariant table that carries the whole safety argument has one column on each side of the split. Splitting the artifact would put the question and its answer in different files.

### Closure measurement — 2026-08-15

Question 9 asked what following the call graph would cost, and no scenario measures it. Reading the corpus as a graph answers it directly.

An edge is an invoking verb plus an unanchored relative link to a technique file, inside a Protocol section. On that definition the graph has 169 edges across 87 calling files, and 33 of those callers reach further than one hop. The heaviest closure belongs to the workflow orchestrator: fourteen files, just under 47 kB, against its own 4 kB. Summed across every caller with no deduplication between them, all the closures together come to a little over half a megabyte — against a corpus of about one megabyte, which says most of the weight is a handful of shared engine operations reached from many callers. Content-keyed deduplication therefore decides whether that half-megabyte is paid once or eighty-seven times, and the ledger already does content-keyed deduplication.

Against the eager budget the cost is unremarkable. A caller declaring a 200,000-token context gets a budget of 640,000 characters; the heaviest closure in the corpus is seven percent of it.

Widening the edge definition to include anchored links — which name a rule rather than invoke an operation — raises the graph to 180 edges across 90 callers. The conservative figures are the ones above; both are stated because the difference is entirely the rule-citation class, and which of the two a guard should count is a design question.

### The gap, met while executing this activity — 2026-08-15

This pass hit the defect it was reading about, which is worth recording because it is a directly observed instance rather than a survey row.

The activity's loop binds an analysis loop operation as a step, so that operation arrived normally. Its protocol then names two callees inline — a challenge pass and a combine pass, both siblings in its own group. Neither is a step of this activity, neither is in the worker baseline, and the technique tool takes a step identifier, so no call could fetch them. Executing the step as written required reading the two files off disk.

That is the improvisation the baseline-list comments describe, observed once, in the ordinary course of running a workflow. It is also a ready regression case with a property the other named cases lack: the caller is itself correctly step-bound, so the failure is not a missing bind but a missing hop.

## Challenge Lenses

### Pedagogy — 2026-08-15

The lens asks whether the material teaches a reader who has neither the session nor the code open, and it landed on two things the reading had left implicit.

The first is that the corpus artifact said an inline reference resolves to nothing without ever saying what a reader should do when they meet one. There is an answer, and it is short: the callee's body may already have arrived, if the callee is named in the role baseline the response carries; otherwise there is no route at all, because the technique tool takes a step identifier and never a technique identifier. That is now stated in the artifact.

The second is question 14, which the lens resolved rather than deepened. A token sweep finds five identifiers shaped like a technique name, but two of them are not callees: one prism-update technique parses a table out of the file that identifier names, and another rewrites names inside it. The class of callees named by a value is three tokens, not five, and only the harness pair draws from a table the corpus enumerates — which is why the closure check that exists works for that family and has nothing to attach to for the other two.

Question 12 also resolved here. A provisioning script and its npm entry both exist, so the gap is not tooling. The gap is that an unprovisioned worktree turns every corpus-scoped guard into an unmeasured result rather than a failure, so a run can look clean because nothing ran. That is a reporting defect, and it moved to follow-ups.

### Rejected paths — 2026-08-15

The lens asks what was considered and dropped, and whether the reasoning survives. It confirmed three open questions as genuinely irreducible here — the one-door asymmetry, the cost of running the stealth check over a folded closure, and whether the unreconciled conformance entry is an omission — on the ground that each is a decision rather than a fact, and none is answerable from the code.

It weakened question 10. The ledger already carries both keying shapes: named blocks inside a technique are keyed by content hash, and a whole technique is keyed by its identifier. So the question is not open for want of information; two precedents exist and one has to be chosen. It stays open as a choice.

The lens surfaced one finding that reopens a settled decision, and it is the most consequential thing in this pass. The doctrine record fixes that reference cycles fail the load. Cycles already exist, and at least one is correct as authored: the index-freshness check applies the indexing operation when no index exists, the indexing operation applies the freshness check afterwards to confirm the result, and the freshness check applies itself on retry. Nothing is wrong with that authoring. A rule that fails the load on cycles would reject it, and the alternative — stop the traversal at a revisit, deliver each body once — is not recorded as having been weighed.

> **Corrected in the second pass.** This section originally read "six cycles under the conservative edge definition, thirteen under the permissive one" and placed three of them in the engine layer. Both figures were wrong: six counted callers reaching a cycle rather than cycles, and the scanner behind it miscounted edges. The corrected enumeration is in [The cycles, enumerated](#the-cycles-enumerated--2026-08-16). The conclusion the section drew survives the correction; the numbers supporting it do not.

That finding is measured, so its factual half is closed. Its disposition is a design call against a recorded decision, which puts it outside what this pass can settle.

## Second pass — 2026-08-16

The gate was answered `dive-deeper` against this log's own position that the remaining questions were irreducible. That position was half right. Four of them moved, one of them because the first pass had measured it wrong.

### The cycles, enumerated — 2026-08-16

The first pass reported six cycles. That was wrong twice, and both errors are worth recording because they are errors of measurement definition rather than of reading.

The first error was a category slip: six was the number of *callers whose closure reaches a cycle*, not the number of cycles. The second was a defect in the scanner. Its verb pattern tested for an invoking word at a word boundary, and a hyphen is a word boundary — so every prose citation of `dispatch-activity` registered as a `dispatch` verb, and every such citation became a call edge. Requiring the verb to be followed by whitespace removes it.

Corrected, and counting conservatively — invoking verb followed by whitespace, unanchored relative link to a technique file, inside a Protocol section — the graph is 168 edges over 87 callers and 132 nodes, and it contains one cycle and two self-references:

| Cycle | Edges | Verdict |
|-------|-------|---------|
| The index-freshness check and the indexing operation | The freshness check applies the indexing operation at two sites, when no index exists and when the index is stale; the indexing operation applies the freshness check after it exits, to confirm the result | Correct as authored — a retry-and-confirm pair |
| The index-freshness check on itself | Applies itself after re-indexing | Correct — retry after recovery |
| Cloud-site resolution on itself | Applies itself when a product tool ran before an identifier was resolved | Correct — error recovery, the shape the specification explicitly sanctions |

Three of the 87 callers have one of these inside their reach. All three cycle-bearing techniques are in shared tool-wrapper groups, not in the engine layer, so the doctrine's exclusion of engine techniques as fold targets does not remove any of them — and the index-freshness pair is the one product techniques reach most, applied from task implementation, diff review and test planning.

Counting permissively, with anchored links as edges, adds a fourth: activity dispatch and batch continuation. It is not a call. The line cites a named rule on the other file, and the canon's own mnemonic is that a double colon invokes while a dot names. It disappears under the conservative count, which is the sharpest available argument for stating the edge definition next to any figure.

### Stop-at-revisit, weighed — 2026-08-16

The doctrine record fixes that reference cycles fail the load, across seven review rounds, without the alternative appearing. Simulating it answers the question the record leaves open.

A traversal that skips a body it has already delivered terminates for every caller in the corpus; the deepest walk queues 26 entries; and the heaviest delivered closure is 46,865 bytes — identical to the figure for a traversal that cannot meet a cycle at all. The policy costs nothing.

It also is not new. The resource loop already gathers identifiers into a set before loading anything, and the ledger already stages a hash per body and consults both the committed ledger and the in-flight staging before adding the next. Delivering each body once is the existing behaviour; revisit-tolerance is that behaviour read as a traversal rule. So the choice is between a rule that rejects three callers over one correctly-authored retry relationship, and a rule that is already implemented one layer away for a different reference kind.

That does not make the decision, but it makes it lopsided, and the record should not continue to show the alternative as unweighed.

### What the second door needs — 2026-08-16

The asymmetry is real and its cause is the doors' contracts, not their implementations.

The activity tool requires the caller to declare its context window, and every budget in the bundling loop derives from that declaration. The technique tool has no equivalent parameter, so there is no quantity for a referenced body to be spent against. The activity response carries a sibling map for attached bodies and a note stating which delivery shape it used; the technique response is a single projection with nowhere to put a second body.

So lifting the scan is a port plus two contract additions — an input for the budget and a multi-body response shape — rather than a refactor. The alternative is to fold at the activity door alone and accept that a step outside the eager budget receives references without bodies, which is the population whose references have no delivery path today.

One thing already spans both doors and does not need building: the ledger names a technique by the same key whichever door delivered it, so deduplication works across them now.

### Value-named callees, swept deliberately — 2026-08-16

Every previously known instance had surfaced as a by-product of other work. Searching for the shape directly, rather than for the tokens that had already been noticed, splits the class three ways — and the epic's acceptance criterion, which asks for these sites to be reported as beyond static reach, holds for only one of the three.

The harness pair draws its callee from a table the corpus enumerates, at the spawn, resume and concurrent sites. Closure over that table is checkable and a guard already performs it.

The dispatched agent's technique and the analysis loop's technique are supplied as values by activity step bindings. The first is bound once, to the worker role technique. The second is bound at seven sites across the work-package activities, taking two distinct values, and both are ordinary resolvable references. These are beyond *file-local* reach, not beyond static reach: the calling technique cannot name the callee, but the activity binding the caller names it in plain text in its own definition. A checker that joins the token to its bind sites reaches them.

The third shape is genuinely out of reach and also out of scope: lens application in the analysis workflows and probe or pattern routing in the review workflows select a *resource* entry at run time, not a technique.

### What did not move — 2026-08-16

Two questions were worked and did not yield, and padding them would misrepresent the pass.

The cost of running the reachable-text check over a folded closure cannot be measured before a closure exists. What can be said is already said: that check is the only guard reading a composed protocol, so it is the one a change to composition perturbs first.

Whether the omission of the newer conformance entry from the doctrine record's reconciliation list is deliberate is an authorial question, and no reading of code or corpus answers it. Two facts did firm up around it: the newer entry landed four days after the older prohibition was last revised, and neither has any enforcement, so this is prose against prose rather than a checker overriding a rule.

### Deliberately not addressed — 2026-08-16

Two questions adjacent to all of the above are stakeholder decisions and were left alone: which parts of the delegation epic this package delivers, and whether the recorded doctrine is executed or reopened. Both belong to requirements elicitation.

## Third pass — the activity layer — 2026-08-16

The gate was answered `different-area`. The two passes before this one had read the technique side exclusively, and one of the two candidate answers to the whole package rests on a claim about the *activity* side — that technique use is properly handled there — which nobody had checked. This pass checked it. The settled facts are in a second corpus artifact, [activity-technique-binding.md](../../comprehension/activity-technique-binding.md); the working is here.

### The number the pass turned on — 2026-08-16

The technique-side figure is 56 inline call sites omitting a required callee input. The question was what the same measurement gives at the activity layer, because that decides whether hoisting fixes the contract problem or relocates it.

**Method.** Every workflow loaded through the server's own loader, so activities, loop bodies and borrowed activities are exactly what the runtime sees. Every `kind: technique` step's callee resolved through the server's own `composeActivityTechnique`, so reference precedence matches the runtime. An input counts as required when it declares no default and its description does not carry the optional marker — the same test the server's provenance resolver uses. A required input counts as satisfied when the step's binding supplies it, a workflow variable of that name is declared, a strictly earlier step produces it, or it is an ambient runtime id.

**Two defects in my own script, caught before the numbers were written down.** The first run reported 452 silent sites and 127 unresolvable callees. Both were wrong. The unresolvable ones were all in one workflow that borrows its activities, because I resolved against the borrowing workflow instead of the authoring one — the guard reports zero unresolvable, which is what flagged it. And I read the workflow variable list as an object when it is an array, so no workflow variable was ever counted as a producer. Corrected, unresolvable callees fall to zero, matching the guard.

**The result.** Of 748 technique bind sites, 469 leave at least one required input of their callee unsupplied when the whole composed signature is counted. That figure is not the comparable one: the great majority of those misses are container-contract inputs, which the server itself classifies as ambient session context rather than as gaps. Restricted to the callee's **own** declared inputs — the surface both the guard and the provenance resolver treat as checkable — the figure is **82 sites, 11% of all bind sites, carrying 109 missing required inputs between them**.

**Hand-verification, three sites, all confirmed.** A prism step binds the index-freshness operation as a bare string; that operation's sole own input is required and appears nowhere in the workflow. A design-philosophy step binds the assumption-recording operation passing two container inputs and omitting its one own input. A prism-audit step binds the sub-workflow handler passing one of its two own inputs and omitting the other.

So the answer to the question that prompted the pass is that the activity layer does **not** properly handle technique use in the sense the proposal assumes. Hoisting relocates the contract problem at roughly a fifth of its technique-side density, rather than eliminating it.

### Why the guard is clean and the sites are silent — 2026-08-16

Both are true simultaneously, and the reconciliation is the useful part. Run against this corpus the binding-fidelity guard reports 69 violations, all triaged as accepted debt, none live or untriaged. Its unconsumed-input check is narrower than the site question in four documented ways: it reads the callee's own inputs only and exempts container inputs as ambient; it keys findings on the operation-to-workflow seam rather than the site, so many steps omitting one input are one defect; it clears a seam outright when any single site supplies the input, on the ground that one site passing it proves the value reaches the operation by design; and its producer test is order-blind, accepting a producer that runs later.

None of those is a defect. The consequence is that a clean exit is evidence about seams and not about sites, and no mechanical answer to the site-level question exists today at either layer.

**What did not yield here.** I did not reproduce the guard's own count of 22 unconsumed-input findings from my figures. Doing it properly needs a two-phase pass to model order-blindness faithfully, and a half-modelled version would have been worse than none. The four mechanisms above are established from the code and comments; the exact arithmetic between 22 and my 46 uncleared own-input seams is not.

### What a hoist actually costs — 2026-08-16

Four things the technique layer expresses have no activity-layer equivalent, and each is structural rather than conventional.

A call between two protocol bullets cannot become a step between them: the step list is flat apart from loop bodies, a technique step has no field addressing a position inside a protocol, and protocol bullets are plain strings with no ids. Hoisting a mid-protocol call splits the host technique in two. Every value that crossed the split as a protocol-run-scoped local must then be promoted to a declared output of one half and an input of the other, turning scratch state into session-global state needing a corpus-unique name. A call gated on something known only mid-protocol cannot be gated at the activity layer at all, because gates read the bag and the bag is written only at activity boundaries — so gating it splits the activity, not just the step. And a call repeated a technique-determined number of times needs its termination condition externalised into a bag variable a loop can read.

The corpus has already paid that last cost once and documented the result: the analysis group declares its convergence and residue flags as both inputs and outputs precisely to externalise a technique-determined loop condition, and its own rule tells callers not to re-implement that loop per activity. That rule is a standing objection to the hoist proposal, written in the corpus before this package existed.

Scale: roughly 200 to 292 candidate call sites against 605 existing steps in 117 activities, before counting the technique splits each mid-protocol site requires.

### Fragments are not a substrate — 2026-08-16

The original investigation named the fragment resolver in scope without reading it. Read: a fragment is declared content spliced by reference before delivery, in exactly two kinds, rule text and checkpoint bodies. The container schema is strict over those two keys, a rule fragment is a string or list of strings, a checkpoint fragment is a strict object of decision fields, a technique step has no reference field, and the resolver visits no step kind but checkpoints. A fragment cannot carry a technique body, and the non-recursion invariant is guaranteed by the types rather than merely documented. Fragments are not available to a hoist.

### The container contract, and the guard that is missing — 2026-08-16

Container contracts are the largest part of most callees' interfaces: 35 of 59 group contracts declare inputs, 91 entries across 73 distinct ids, plus 54 more from workflow-root contracts. They merge into every descendant and are delivered under a marked inherited block.

The guard covering them checks one thing — a technique redeclaring an input its container already declares — and its own header names the mirror defect as out of scope: an input several techniques share that no container declares at all. That check does not exist. It is also the check that would tell anyone whether a hoist had been done correctly, which is worth stating plainly given the proposal on the table.

### Deliberately not addressed — 2026-08-16

Unchanged from the second pass: which parts of the delegation epic this package delivers, and execute-versus-reopen on the visibility rule. Both are stakeholder decisions for requirements elicitation, and this pass produced nothing that should move either.

## Fourth pass — the questions that were called unanswerable — 2026-08-16

Three of the four remaining questions were framed as irreducible. Three of them moved. What follows is what each took, because the effort is the finding as much as the answer is.

### The reconciliation, completed — 2026-08-16

**Method.** The guard's own finding collector imported and executed, not reimplemented, so the ground truth is the guard's code. The same corpus then walked through the server's loader, evaluated under rule-sets differing by one of the guard's four narrowings at a time. Seam identifiers normalised between the two, because the guard qualifies an operation by the workflow it was found in and the loader by the activity's source workflow — the same seam, two spellings.

**It reconciles.** Modelling the guard's rules gives 20 findings against its 22, with nothing raised by the model that the guard does not raise. The residue is exactly two, and both come from bind sites in the shared pattern-activity directory. The loader reads a workflow's activity directory without recursing, so it never loads those as activities; the guard walks them anyway. Those two findings are checked and never run.

**The ladder, one rule at a time.** From 20: including borrowed activities gives 37; dropping the sibling-clearing rule gives 59; requiring a producer to run before the step that reads it gives 46; keying on the site rather than the seam gives 73; counting container inputs alongside own ones gives 761.

So the guard corroborates the site-level figure rather than contradicting it. The two measure different things and the difference is now fully itemised.

**And the reconciliation found something.** The largest single step of that ladder — 20 to 37 — is not a narrowing but a blind spot. A workflow that borrows an activity runs its bindings in the borrower's scope, but the guard walks each workflow's own activity directory, so those bindings are only ever checked against the workflow that authored them. That leaves **143 bind sites unchecked in the scope they run in**, and it is precisely the case a producer check exists to catch: the borrowed activity assumes its home workflow's producers, and the borrower may not supply them.

### The reachable-text scan, measured — 2026-08-16

"Unmeasurable until a closure exists" was a reason to build one. I built two, using the stop-at-revisit rule, and ran the guard's four prohibited-invocation patterns over each.

The heaviest caller in the corpus reaches 15 techniques carrying 21,777 characters of protocol, nine times its own 2,412. Composing them takes 22.3 milliseconds; scanning them takes 0.29. A mid-weight caller reaches 6 members and 6,701 characters, 3.2 times its own, at 6.7 milliseconds to compose and 0.04 to scan. Neither matched a prohibited invocation.

The answer is that the scan is not the cost and never was. Composition dominates it by about two orders of magnitude, and composition is work the fold performs anyway — so scanning the closure is a rounding error on delivery. The measurement also corrected a figure I had been carrying: the heaviest closure is forty-seven kilobytes of *file*, but the scan reads protocols only, which is under half that.

Sample size is two, chosen as the extreme and a typical case. That does not generalise and does not need to: it converts an unbounded unknown into a bounded one.

### The omission, settled from history — 2026-08-16

The conformance entry landed on 3 August at 10:17, in a commit cataloguing two I/O-contract silences, on a branch about canon I/O entries. The doctrine record that plans the canon reconciliation has four commits in its entire history, all on 2 August, the last at 13:08 — and its open-items list was written in the first of those four and never touched again.

So the list predates the entry by under a day and has had no subsequent edit that could have picked it up. The decisive test is met in the direction of oversight: an omission that predates every later edit of the file is not a decision. The mechanism is visible too. The record names the two entries it does because those were in the pull request its author was tracking; the conformance entry arrived the next morning from an unrelated branch. And the two files sit in different submodules, so no single commit could ever have carried both.

This is a case where the history was decisive and the inference had been wrong. Recording it as authorial would have been a guess dressed as a finding.

### The ledger-keying decision, written out — 2026-08-16

Not resolved, because it is elicitation's to resolve; laid out so the gate is cheap.

Both key shapes already exist. A whole technique is keyed by its identifier and that key is shared across both delivery doors. Named blocks inside a technique are keyed by a hash of their own content, so a shared preamble collapses across techniques with different interfaces.

Keying a folded callee as a technique collapses it against a step-bound delivery of the same operation, at either door, and across two callers folding the same operation — at the price that the body must stay byte-identical, so it cannot carry the call site's own binding annotations. Keying it as a block inside the caller can carry those annotations, needs a new key namespace, and forfeits the collapse against a step-bound delivery.

**Method for the deciding figure.** Call edges taken as before; step binds resolved through the server's loader and compared by resolved file path so spelling differences collapse. Of the **81 distinct techniques an inline call reaches, 31 are also bound as an activity step somewhere** and 50 are reached only from prose. For those 31, the technique-keyed choice collapses against a bind that already happens and the block-keyed choice delivers the same body twice.

That is why it reads lopsided. It stays a genuine trade, because the annotation is the one thing a shared body cannot hold — and the existing separation of inherited blocks from their parent technique is precedent for carrying it separately rather than giving up the collapse.

### What still did not move — 2026-08-16

Nothing was left from the four. The reconciliation, the scan cost and the omission all closed; the keying question was converted from a question into a written decision, which is what was asked.

### A note on units, earned five times over — 2026-08-16

Five measurement defects have now been self-caught across four passes, and every one was a unit or definition error rather than a coding mistake: counting callers that reach a cycle as cycles; a verb pattern matching inside a hyphenated link label; resolving a borrowed activity against the borrower; reading a variable list as an object; and this pass, twice — counting link occurrences where the earlier figure counted distinct caller-callee pairs, and counting site-input pairs where the earlier figure counted sites.

The pattern is stable enough to state as a rule for whoever works this next. Every count in this area needs its unit named beside it — edges or occurrences, sites or seams or pairs, techniques or bind sites — because the same corpus supports numbers that differ by an order of magnitude under definitions that all sound the same in prose.

### Deliberately not addressed — 2026-08-16

Unchanged: epic scope, and execute-versus-reopen on the visibility rule.

### What elicitation inherits — 2026-08-16

Four things leave this activity as inputs rather than findings, and all four are stated in the corpus artifacts so they survive the session.

The opening framing has moved. Hoisting versus a canonical inline mechanism is not a choice between an option that avoids the contract problem and one that does not; both layers carry the same defect at different densities, and the live question is where the contract work lands.

The borrowed-activity gap is a scope decision, in or out, not an observation. It is independent of inline calls and touches the same guard.

The ledger-keying choice is costed at both doors with the deciding population measured, so it can be answered at a gate rather than investigated.

And any count carried forward from earlier work — including the edge and occurrence figures in the design-philosophy document, which came from the same class of one-off script as the five defects caught here — is re-derived or restated with its unit before anything is planned against it.

## Follow-up items (out of scope)

Three defects surfaced that belong to migration batches or adjacent work rather than to this reading.

The dangling pull-request-creation link is a one-segment path fix in a single file. It is left alone deliberately: repairing it before the guard exists removes the regression case that would prove the guard works.

A bare sibling technique link written without a leading dot-slash is misclassified as a resource identifier by the outbound scan, because the scan's exclusion covers double-colon paths and dot-slash prefixes but not a bare filename. The live instance links a workflow-design technique from another, and eager bundling of that technique emits a spurious unresolvable-resource warning. Settling it means tightening the scan's slug test, which is the same module a technique-reference scan would touch.

The unconsumed-output triage holds 38 entries, 35 of them under one rationale. Once bind sites for inline callees are visible, that file is worth re-reading end to end: the entries that were harmless because the operation is a shared return contract will separate from the entries that were harmless only because nobody could see the caller.

A worktree without its corpus submodule provisioned turns every corpus-scoped guard into an unmeasured result. The tooling to provision one exists; what is missing is that the unmeasured result reads like a clean one to anyone not watching exit codes. Worth a louder signal, and independent of this work package.

The binding guard walks bind sites in the shared pattern-activity directory, which the loader never loads as activities. Two of its current findings come from there. Small, and it cuts both ways — those activities are borrowable, so checking them is arguably right — but the divergence between what is checked and what runs should be deliberate rather than incidental.

Borrowed activities are checked only in the workflow that authored them, leaving 143 bind sites unchecked in the scope they run in. This is the largest single gap either artifact records and it is independent of inline calls entirely; it belongs to whoever owns the binding guard.

## Cost record is incomplete

The recorded figure for this activity is 268,872 tokens, and it understates the true cost by a margin nobody can now recover. Five of this activity's segments ended without the harness surfacing a usage figure — four resumes across the checkpoint gates, and the final segment, whose context was lost before it reported. Each of those is omitted from the ledger rather than entered as zero, since an activity with no entry is one whose harness reported nothing rather than one that cost nothing. Child agents spawned inside those unreported dispatches carried their own cost, and it is absent for the same reason.

Whoever writes the token-usage summary should carry this forward: the row for codebase-comprehension is a floor, not a measurement, and this was the most expensive activity of the run.
