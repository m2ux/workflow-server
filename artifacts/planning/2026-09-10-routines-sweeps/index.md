# Routines sweeps: index of what was measured and what to act on

Six sweeps and their refutation passes over the [routines proposal](../2026-09-03-routines/README.md),
taken before any of its nine stages is scheduled. The proposal describes a construct that is not built;
these documents establish what the construct would supersede, what it would merely narrow, what looks
superseded and is not, and which of the proposal's own claims the repository falsifies.

## Start here

| Artifact | What it holds | Use it for |
|---|---|---|
| [The verified outcome](README.md) | The ten plan defects that change what a stage delivers, the removals in four clusters, what narrows, the keep list, and the sequencing against stages 0 through 8 | Deciding what to do. Every claim traces to a verification below |

**Read its first section before scheduling any stage.** Two of stage 8's four named reference sites no
longer exist, stage 4 is costed for a change that landed with stage 0, and three acceptance criteria
cannot be satisfied by the mechanism they name.

## Measurements the work rests on

Read from the repository rather than from the proposal, so each holds until the code moves — and each
closes with the commands that re-take its own figures.

| Artifact | What it establishes | Use it for |
|---|---|---|
| [Guard obligations](ground-truth/guard-obligations.md) | Every registered guard: what it demands, whether it is hard zero or carries a ledger and on which branch that ledger lives, its exemption surface, and the four ways a migration puts it in the blast radius | Knowing which guards need changing rather than merely leaving green, and which rules a routine body breaks by construction |
| [The mechanisms a routine retires](ground-truth/fragment-mechanism.md) | The fragment mechanism, the duplicated runs at the grain a routine would carry them, the declarations a signature subsumes, and the prose-encoded runs | Sizing stages 5 and 6. The fourth population is a judgement about prose and is marked as the weakest |
| [Stage 0's landed state](ground-truth/stage-0-state.md) | What stage 0 did and what it left behind, plus the key list the stale sweep runs on | Reading stage 0 as complete, and settling gap 4 of the proposal's own review by measurement |

## Before removing anything

Every candidate was put to an agent instructed to refute it from the repository rather than to confirm
it from the sweep's reasoning, with a standing instruction to take the weaker verdict where the
evidence for the stronger one was thin. So a surviving verdict carries a blast radius you can act on,
and a withdrawn one is recorded rather than dropped.

| Surface | What it settles |
|---|---|
| [The corpus definitions](verification/corpus-vocabulary.md) | What comes out of the definition files name by name, which declarations a signature subsumes, and the two gate decisions that change behaviour at a live site whichever way they go |
| [The server code](verification/server-code.md) | Which code the construct supersedes and which it merely sits beside — and the two headline defects: the load path the design diagram draws does not exist, and a routine binding a technique with interpolating prose has free variables |
| [The rules and the canon](verification/canon-rules.md) | Which of the fragment guard's nine rules genuinely lose their subject, which canon rows gain a clause rather than losing one, and the merge change the plan costs twice |
| [The documentation and the site](verification/docs-and-site.md) | Every published claim the construct falsifies, which stage falsifies each, and the pinned coverage entries and schema pointers a deletion moves |
| [The proposal itself](verification/design-itself.md) | Where the design adds a second path or a prohibition that a removal would obviate, and which of its load-bearing claims the repository refutes |
| [Statements a change falsifies, by key](verification/stale-restatement.md) | The occurrence counts a change manifest should carry, corrected — and the fifty-one statements the key list itself does not reach |
| [The completeness pass](verification/completeness.md) | What surface, claim, count, stage and guard nobody covered; which figures moved while the work was in flight; and which reading the repository supports where two documents disagree |

## The sweeps, kept for their withdrawals

The candidate sets before refutation sit under [sweeps/](sweeps/), one per surface. They are kept
because a withdrawn candidate is evidence: five candidates were withdrawn whole and nineteen claims
inside surviving candidates were refuted, and the shapes those errors shared are what the verifications
warn the next reader about — a construct charged to a stage that never converts the file it lives in,
an addition counted as a narrowing, an enumeration silent about routines read as one made false by
them, and a library with no caller read as dead code.

## What this folder does not do

These are the sweep-shaped activities only. Four neighbouring activities from the parallel-activities
work are not here, and each would stand on its own:

- **A permutation matrix** of every legal form of a routine reference against every refusal, each
  classified by where a test can provoke it. The refusal surface is large and stated only where it
  arises, and the guard ground truth touches this from one side.
- **The illegal forms assigned to named test files**, with case counts and a fixture root, which is
  what would make the stage 3 and 4 criteria costable rather than aspirational.
- **The pointer-bump manifest** — what one commit must carry when the corpus and the server move
  together. The guard ground truth measures the mechanics; nothing assembles the commit.
- **A substitutes table** for the properties no test reaches, which the proposal's own record of what
  its prototype did not test already half carries.

Nothing here is committed. The verdicts are recorded against server `9ca71c19` and corpus `2b8b7215`
for the sweeps, `c1c9682d` / `26e79d8a` for the verifications, and `ee95e4cd` / `a4a5d88b` for the
completeness pass — 23 and 28 commits past the baseline, which is how two of the plan defects were
found.
