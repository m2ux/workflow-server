# Draft amendment for epic #397 — handed up, not posted

Drafted by the implement-activity worker, which is barred from GitHub writes. Whoever posts this
reconciles the wording against the live body text: this draft states the positions the delivered work
establishes, and it was written from the planning record rather than against the current body prose.

Two changes are owed. The epic states a cycle policy the platform now contradicts, and it carries an
acceptance criterion keyed to a count that no longer decides anything.

---

## Change 1 — the cycle policy

**Replace the passage requiring the loader to reject a reference cycle.**

Proposed text:

> ### Repeated references are tolerated, not rejected
>
> When one technique's instructions name another technique, and following those names eventually leads
> back somewhere the walk has already been, the walk carries on. It does not stop, and it does not
> treat the repetition as a fault. Each body is handed over the first time it is reached, and a second
> route to the same body adds nothing, so the walk records the repeat and continues. The name for this
> is revisit tolerance.
>
> The reason is categorical rather than a judgement about how much repetition the corpus happens to
> contain. Handing over a body is a question of what can be reached, not a calculation whose inputs
> have to settle: no technique in a closure computes a value another technique in that closure then
> consumes. A body is therefore complete the first time it arrives, and would be identical the second
> time. Rejecting the repeat would buy nothing and would refuse work that is correctly written.
>
> The corpus makes the point concretely. The index-freshness check and the indexing operation each
> name the other, and the freshness check also names itself, retrying after the indexing it triggered.
> All three are correct as authored, and both arms are guarded in prose — one optional, one
> branch-conditional — which is why the corpus loads today and why the repetition is invisible until
> something actually follows the names. A policy that failed the load on repetition would reject all
> three.
>
> Measured over the delivered corpus, walking every one of 572 technique files as a starting point:
> 230 bodies handed over, 110 edges reaching a body already handed over, 9 of those naming the
> technique they sit in, and 0 references resolving to no file. Every walk terminates.

## Change 2 — the acceptance criterion keyed to an edge count

**Replace the criterion asserting a number of resolved edges with one asserting a published counting
grammar and a fixture behind each of its terms.**

Proposed text:

> ### Acceptance: the counting rules are published, and each is pinned
>
> Counting the calls one technique makes to another turns out to require decisions, not just a
> scanner. Whether a connecting word such as "via" marks a call or merely a cross-reference, whether a
> citation carrying a heading anchor counts, whether a two-part reference naming a group and then an
> operation is one call or two — each answer changes the total, and each is defensible. A number
> reported without those decisions stated cannot be reproduced or argued with.
>
> Acceptance is therefore that ten counting decisions are published with the answer each is fixed to,
> and that each one is pinned by a test corpus built so the count under the published answer differs
> from the count under the alternative. Changing a decision then changes a fixture rather than only a
> number, which is what stops a total from drifting silently.
>
> The counts at the delivered corpus commit, each with the basis it was measured on: 351 raw link
> occurrences, 254 of them references the grammar could resolve, 198 of those admitted as calls by the
> published list of five invoking words, over 101 calling files reaching 73 distinct callees, with 0
> references resolving to no file.
>
> **Coverage is published beside the total, because the two are different facts.** The five invoking
> words admit 198 of the 254 resolvable references — 78%. The remainder are real callers that the
> grammar does not admit, and a clean report over a region never examined must not read as a report
> that examined it. A decision to retire an operation needs someone to read the corpus, not this
> number.
>
> **A caller that picks its callee at run time is counted separately, and that count is not zero.**
> Where a call names its destination through a placeholder the author left unwritten, the corpus has
> none: 0. But a callee can also be chosen where the activity is written rather than where the
> instructions are — supplied as the value of a step's input — or drawn from a table that maps a
> setting to the file serving it. Those measure 8 and 4 respectively, 12 together. No widening of the
> word list or the link rules would ever reach them, because they are addressed in a different plane
> from a link in prose. Both figures are published so the zero is never read alone.

## What these changes do not claim

- They do not assert that the count of calls is complete. It is reproducible, which is a different and
  weaker property, and the coverage figure is what keeps the difference legible.
- They do not close the two open findings about which doors exist and how the delivery counter
  behaves. Deciding which counter a folded body draws on leaves both untouched.

## Investigation detail

Measurements, bases and the per-term fixtures:
[planning folder for 2026-08-15-handling-inline-techniques](.).
