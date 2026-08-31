## Summary

The workflow definitions live on a branch of their own, deliberately, so that a change to what the workflows say is separate from a change to the code that runs them. The tests that exercise what the workflows say do not: they sit with the code. So do the files recording what those tests measured.

The consequence is that the corpus cannot check itself. A change to the definitions is reviewed on the branch holding them, where the only thing that can run is a set of guards borrowed from the code branch; everything else that measures the corpus — the walks, the coverage figure, the delivery cost — runs later, somewhere else, against a pointer that has moved. And because the measurement and its subject can drift apart, there is now a body of machinery whose whole purpose is to notice that they have.

## What happens today

Of 72 test files on the code branch, 16 read the real corpus. Those are tests of what the definitions do, not of what the server does, and they are the ones that cannot run where a definition changes.

Four recorded measurements sit beside them, each carrying the identifier of the corpus commit it was taken against, because nothing else ties the two together:

| Recording | Corpus it speaks for |
|---|---|
| the walk snapshots' stamp | `393e244b` |
| the delivery-cost fixture | `393e244b` |
| the binding-fidelity verdicts | `3569e93` — **249 corpus commits earlier** |
| the checkpoint-coverage expectations | stamped by the same mechanism |

That third row is the state of affairs in one line. It is a file of human judgements about definitions, sitting on the code branch, 249 corpus commits behind the definitions it judges. The guard that reads it prints the distance on every run, and has done for months, because the person who could act on it is working on the other branch.

**A definition change is measured two merges away from where it was made.** The corpus branch's own check runs the guards. The pull request that moves the code branch's pointer runs the fast suite and the guards. Neither runs the coverage walk. That happens only on a push to the code branch's main line — so a change that reduces coverage turns main red, having passed every gate that stood between it and there. The workflow file that arranges this says so plainly, and accepts it, because the alternative was a twenty-five minute wait in front of every pull request.

**And the boundary drops a class of check entirely.** A corpus pull request during recent work could not be verified at all: the definitions used a schema field that existed only on the code branch, so every schema-reading guard called the corpus invalid. The check was red for a reason that had nothing to do with the corpus, and went green when the code merged. Nothing was wrong and nothing could tell.

## The fix

**Stage one — decide the line, and state it.** The tests that live with the code are the ones exercising server machinery. The tests that exercise what a definition says belong with the definitions. This is one sentence in the contributing guidance and it settles every case below.

**Stage two — move the corpus-capability tests and their recordings to the corpus branch.** The 16 files, and the four recordings beside them. The corpus branch has no code to run them with, and does not need any: its existing check already borrows the code branch's tooling to run the guards, and would do the same for these. What it gains is the ability to answer a question about itself.

**Stage three — the stamps go.** A snapshot in the same commit as the corpus it describes cannot describe a different one. The corpus-commit fields, the freshness assertions, the re-stamping step, and the pointer-comparison check that exists because a merge can take a claim from one parent and its subject from the other — all of that is the cost of the separation, and it is refunded rather than rewritten.

**Stage four — give the machinery tests fixtures.** A few of the 16 read the real corpus only for convenience: a loader test loads `work-package` to prove the loader loads something. Those stay with the code and take a fixture, which is what a machinery test should have had anyway. The count of tests reading the real corpus from the code branch ends at zero, and that is the line being checkable rather than merely stated.

## Why now is cheap

The measurements are already taken, and this issue carries them. The corpus branch's check already borrows the code branch's tooling, so the mechanism the move depends on exists and is in use. And the recent work has just produced the clearest instance of the cost, in a pull request that could not verify itself.

The alternative is not free either. Every recording that stays on the code branch needs a stamp, every stamp needs a freshness check, and each of those is a place where the two can be separated silently — which is the thing the 249-commit drift shows already happening.

## Scope

The line, stated where contributors read it. The corpus-capability tests and their recordings moved to the corpus branch, with the check that runs them there. The stamp mechanism retired. The machinery tests that read the real corpus given fixtures.

## Acceptance criteria

- No test on the code branch reads the corpus, and something enforces that rather than stating it.
- A corpus pull request measures its own coverage, its own walks and its own delivery cost, before it merges.
- No recorded measurement carries a corpus commit identifier, because none needs one.
- A definition change that reduces coverage fails on the change, not on a later push to the code branch's main line.
- A corpus change can be verified without the code branch having merged anything first.

## Non-goals

This does not split the repository. The two branches stay as they are; what moves is which branch holds the tests that read the corpus.

This does not change what any check measures. The coverage figure, the walks and the delivery cost keep their current definitions and their current expectations — this is about where they run and what they are recorded beside.

This does not remove the guards from the corpus branch's check. They already run there and keep running there.

## Relationship to other issues

Scoping the coverage walk to the workflows a change can move (in flight) makes the current arrangement cheap enough to run on a pull request. That is worth having on its own terms, and it is also the interim: with the walk on the corpus branch, the scope would come from the change itself rather than from a diff of pointers.

## Investigation detail

The counts come from the code branch at the merge of the activity-variable-contract work: 72 test files, 16 reading the corpus through its root helper, 4 recordings carrying a corpus identifier, and the drift figure as the binding-fidelity guard reports it on any run.

