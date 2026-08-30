# Runner — decision record

Companion to [README.md](README.md), for [#523](https://github.com/m2ux/workflow-server/issues/523).
What was settled about the runner's design, what remains open, and the reason in each case — since the
reason is what a later reader needs in order to reopen one honestly.

The proposal itself is in [README.md](README.md); the evidence behind these choices is in
[investigation.md](investigation.md), [protocol-verification.md](protocol-verification.md) and
[cost-model.md](cost-model.md).

## Settled

Settled on 2026-08-30.

**A step's declared outputs are applied and written when the step finishes.** More than half of all
conditions read a value an earlier step of the same activity produced, so without this the runner can
decide only the minority fed by earlier activities and the rest stay with an agent. The cost is real and
has to be paid first: roughly 1,085 writes per run instead of 79, against a session store that currently
reads and parses every session file on every call. An index or a cache is a prerequisite, not a
follow-up.

**A brief composed at run time is a first-class prompt, not an opaque string.** The 22 sites that compose
their own briefs are also the sites that fan out widest, so relaying untouched text would leave the
largest dispatches outside every guarantee the runner otherwise gives. Roughly 25 brief-composing
techniques change to declare structured output rather than free text, and in exchange there is one prompt
shape and one set of checks.

**The server sends conditions, not verdicts, and a missing value fails a positive test loudly.** Verdicts
computed when an activity opens are stale by its second step, which is the problem being solved rather
than a detail. Evaluating at the step is the only point the answer is correct. Absence keeps its meaning
for negative and presence tests, because the corpus deliberately spells "not in that mode" as a value
nobody set — so the rule applies to positive reads only, and the two collectors that currently disagree
about inequality have to be reconciled before it lands.

**The orchestration workflow keeps its four working activities and loses its loop.** Session discovery,
initialisation, target resolution and close-out are ordinary work with side effects and stay activities
the runner executes. The client-dispatch activity is the loop the runner becomes, so it is deleted rather
than left unreachable. The bootstrap is rewritten to point an agent at the runner instead of at a
procedure to follow, and the guard that keeps that procedure self-contained goes with it.

**Committing and writing the progress table stay agent work, dispatched as ordinary units.** Both look
mechanical and are not: a commit message and a progress summary are prose a person reads. Keeping them as
techniques holds the line that the runner never composes text, and keeps git out of the runner entirely.
The price is two dispatches at each activity boundary that a code path would not need.

**The binding-resolution work lands before the runner, as its own change.** A bare supplied value becomes
a literal always, a reference is always braced, and the two placeholder grammars unify on the dotted
form. That is 193 sites migrated plus a guard, and it closes an existing silent fault where 17 dotted
placeholders report as resolved while naming no producer. Doing it first means the runner never infers;
doing it later would mean shipping a component whose argument is that it removes guessing, with a
near coin-flip heuristic on 85% of its inputs.

**The runner writes artifacts; a technique declaring one says where its output belongs.** This removes 45
invocations, one technique file and the whole class of defect where an agent writes under the wrong name,
and it halves document traffic — content still returns from whoever wrote it, but no longer goes out
again as an input. Twenty sites that read back a written path need rewiring, and the runner gains
filesystem access it would otherwise not need.

## Still open

These were not settled and are not blocked by anything above.

1. **Does equality coerce numerically the way ordering already does, or does the write path enforce the
   declared type?** A number arriving as text currently satisfies an ordering test and fails an equality
   one. Picking neither leaves the runner acting on that difference across 81 equality comparisons.
2. **Where does a repeat-until loop keep its continuation condition?** All 19 such loops carry a
   structured condition the schema describes as an entry gate, and both mechanical readers treat it as
   one. The unused early-exit field is the right shape, so this is a rename rather than an addition.
3. **Are value-setting actions re-authored as technique outputs?** Of 84, only 28 carry a value a program
   could apply, and the construct is already slated for removal — so building an interpreter for them
   would institutionalise something on its way out.
