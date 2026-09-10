# Branch instances: an index below the branch key

**Date:** 2026-09-08
**Amends:** [the specification](./README.md), sections 4.4 (rule L2), 6.1, 6.3 and 6.5.
**Status:** design, with one decision outstanding for the owner.

The specification was written before this refinement was raised, so its three designs never considered it. This document is the refinement, what it changes, what it costs, and the one question that decides whether it lands now or behind a later stage.

---

## 1. What is proposed

A branch key holds an ordered collection of visits rather than a single object. Where the specification lands `research`'s outputs as one object at `research_outputs`, this lands them at `research_outputs.0`, and a second visit lands at `research_outputs.1`. A join reads `{research_outputs.0.open_assumptions}`.

Two things follow, and only the second is new capability.

**Re-entry appends instead of replacing.** The specification states the position positively — a branch key holds the outputs of the most recent visit, and a join needing an earlier visit's values gathers them into a name of its own at that visit. With an index, no such gather is needed: every visit keeps its own slot, and a join that wants the latest reads the last index while one that wants all of them reads the collection.

**The same activity can be a branch more than once.** This is the larger prize and the reason the index is worth having. The specification's rule L2 rejects a fan that names one activity twice, so its fan is strictly N distinct activities. An index makes N instances of *one* activity representable — a genuine scatter over a work-unit list, which is what `scatter-gather` describes and what the graph currently cannot say at all.

---

## 2. What it costs to read, measured rather than assumed

**Nothing.** This was the open technical risk and it is closed.

Both dotted-path resolvers walk a path by bracket access after checking the current value is an object: `getVariableValue` in `src/schema/condition.schema.ts` and `getVar` in `src/schema/when-expression.ts`. An array satisfies `typeof x === 'object'`, and indexing one by its numeric string key returns the element, so both walk `research_outputs.0.open_assumptions` unchanged. Neither evaluator is touched.

The variable-name grammar is untouched too, and this is the part worth being precise about. A join declares `research_outputs` in its reads, and `ActivityVariablesSchema` types `reads` as an array of `VariableNameSchema` — which admits a snake-case noun phrase of at least two words or a listed bare-word exemption, and admits **no dots at all**. So a declared read can never carry a path, indexed or not. The index lives only in expressions, which is exactly the convention the corpus already follows: no activity in the corpus declares a dotted read, while expressions across the corpus dot into declared bases — `{current_assumption.id}`, `{candidate_component.path}`. An index is one more segment in that same position.

This is what makes the refinement cheap. Had the index been proposed as part of the declared name — `research.0` as a read — it would have required changing `QUALIFIED_DATA_ID_PATTERN`, which is shared with technique input and output ids through `check-identifier-qualification.ts`, and the blast radius would have exceeded the whole graph change.

---

## 3. What it changes in the specification

| Section | As written | Amended |
|---|---|---|
| 4.4, rule **L2** | A repeated branch id fails the load | A repeated branch id is legal, and is the case the index exists for. The message and the rule are withdrawn. |
| 6.1 | A branch key holds the most recent visit; writes assign and never merge, so a second visit replaces the object | A branch key holds visits in arrival order. The append is the server's, at the same single write site, so it is still not a merge policy — no two branches write one slot. |
| 6.3 | `applyVariableWrites` gains `under?: string`; the variable-set event names `key.member` | `under?: { key: string; index: number }`; the event names `key.index.member`, so the history says which instance a value landed in |
| 6.5 item 1 | `pathReads` records the full dotted reference, the head is the namespace test | Unchanged in shape. The head is still the branch key, so the namespace test is identical; the member test moves one segment right and skips a numeric segment |
| 6.5 item 3 | A dotted read whose head is a branch key must name a member that branch produces | Same, reading past the index. A read that omits the index is reported, naming the instance form — this is the one new diagnostic |
| 6.5, `fan-artifact-collision` | Two activities of one fan resolving one artifact filename | Widens to two *instances* of one activity, which collide on every artifact by construction unless the filename carries the instance |

That last row is the real work the index brings, and it is not a diagnostic change. Two instances of one activity run the same techniques and resolve the same artifact filenames, so same-activity fan-out needs artifact paths to carry the instance before it is usable. The specification's collision family reports it rather than solving it, which is correct for a fan of distinct activities and insufficient for a fan of instances. **Same-activity fan-out therefore depends on an artifact-naming decision this amendment does not make.**

---

## 4. The cost, and the decision it forces

For a fan of distinct activities — the only shape the specification admits, and the only shape any site in the corpus could use today — **the index is always `0`, and the activity name already distinguishes the branches.** Every read gains a segment that carries no information: `{research_outputs.0.open_assumptions}` where `{research_outputs.open_assumptions}` says the same thing.

So the index is ceremony on the common case, bought for a case the corpus has no instance of. The specification's own cost judge would call that speculative, and it would be right to.

Three ways to resolve it.

**A. Index now, uniformly.** Every branch key is a collection. Buys same-activity fan-out and append-on-re-entry immediately; costs a dead segment on every read for the foreseeable corpus, plus the artifact-naming decision before the capability it unlocks is usable.

**B. Index only where a branch id repeats.** The container is a bare map when the id appears once and a collection when it repeats. Buys both without the dead segment — and should be rejected. A join's read form would then depend on the fan's shape, so an activity borrowed into two workflows would need different reads in each, which is the failure the derived key was chosen to avoid.

**C. Land the specification as written; hold this amendment as the design that L2's relaxation requires.** Nothing is lost, because §6.1's stated position already covers re-entry, and the index becomes non-optional the day a fan needs a repeated id. This document is then the design for that day, with its read cost already proven zero.

**Recommendation: C**, on the grounds that the index's whole value is same-activity fan-out, and same-activity fan-out is blocked behind an artifact-naming decision regardless. Taking C costs one future migration of read forms if the corpus later wants instances — bounded, because §6.5's member-grain reporting names every affected read.

**But the decision is properly the owner's, and it turns on one question: is fanning the same activity over N work units in scope?** If it is, A is right and the artifact-naming decision joins the plan. If it is not, C keeps the common case clean.

---

## 5. What this amendment does not change

The two fixed decisions hold in every option. A fan destination is still a list and the join is still derived from convergence — the index sits inside the container and never appears in the graph. Branch writes are still namespaced per branch and gathered explicitly by a later activity — the index changes the container's shape, not who may write it or how a join reads it.

The prerequisite is unchanged: [#655](https://github.com/m2ux/workflow-server/issues/655), and specifically the compare-and-swap-with-retry form the specification asks for rather than a per-session write lock.
