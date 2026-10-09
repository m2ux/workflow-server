# Findings

What the measurements show about the integration branches, beyond the ticks they settled.

## F1. The role check cannot run

`guards/check-role-barred-calls.ts` imports `CORE_ORCHESTRATOR_TECHNIQUES` from `src/loaders/core-ops.js`, which exports no such name on `i04/main` or on `main`. The guard throws at module load, so the sweep records it as a failure rather than as findings, and its test file collects no tests.

The guard is the whole of [I04:E01] W01. Three of that epic's criteria — the check is registered and runs, it reports the routing defect at a commit carrying it and nothing against the current corpus, and a conditional clause is not read as prohibited — rest on a program that does not load. None can be ticked until the import is reconciled.

## F2. The E03 corpus change was reverted by a merge

`38e3a061`, the merge of #1187 into `i04/workflows`, is an ancestor of that branch's tip. The content it landed is not. `corpus/meta/routines/activity-loop.yaml` still gates `continue-batched-worker` on `worker_result.batch_may_continue`, and `finalize-activity.md` still folds `{batch_may_continue}` into the envelope. The last commits to touch the file are `6025a868` and `18f0eebc`, both from `workflows`; `i04/workflows` and `workflows` hold byte-identical copies.

A later merge of `origin/workflows` into `i04/workflows` resolved these files in favour of the `workflows` side. [I04:E03] was closed on the strength of ticks that the tip contradicts; it is reopened, with AC1, AC2 and AC4 unticked.

The general hazard: a merge from a long-lived branch into an integration branch can discard what the integration branch delivered, and nothing in the sync measures content — only that the merge commit is reachable.

## F3. A tick that stopped holding

[I04:E07] AC1 asks that the activity-variables guard report no findings against the corpus. #1155 cleared them on 2026-10-06. The sweep now reports 34 at the I04 tips and 5 at the long-lived tips, so 29 arrived with the I04 corpus after that clearance. AC1 is unticked.

## F4. The inherited-input guard is outside the sweep

`guards/check-inherited-input-never-spent.ts` exists and `guards/guards.ts` does not list it, which is why [I04:E09] AC8 is unticked and W07 is undelivered. Run directly it reports 39 sites across ten workflows. Four of E09's five per-workflow criteria fail on that; only the libraries criterion holds.

## F5. Test plans diverge from the template

Thirty-seven merged pull requests across both initiatives carry their test plan as a checklist plus a two-column `Test | Criteria` table. The template specifies one table with Test, Description, Coverage and Pass. `sync.py` reads the template's shape, finds no Coverage column, and reports roughly sixty disagreements that are one divergence. Left as written by decision D7.

## F6. The dependency checker misreads a multi-link row

`deps.py` reported eight unknown dependencies and Joins across I04. Every one is a row whose id cell carries two pull-request links — `[W02](…/pull/1208), [W02](…/pull/1209)`. `cells` strips each link to its text, so the cell reads `W02, W02`; the row filter then tests `re.fullmatch(r'W\d\d', …)` against the whole cell and skips the row. A skipped row is absent from the graph entirely, so the levels, the longest chains and the whole-epic report are computed over a table with holes in it. The plans are correct. I00, whose rows carry one link each, reports no problem.

Carried by #1264 under decision D9.

## F7. I04's delivered work bypassed the epic bases

Thirty task branches merged straight into `i04/main` and `i04/workflows`, which is where that work now sits. The Work Breakdown Guide expects a base per epic and one review pull request on it.

Under decision D10 the twenty bases now exist, cut from the integration tips, so they carry what was already merged and every further I04 task targets one. The work delivered before them keeps its review on #1225 and #1226, which merge the integration branches. An epic closing with an empty base leaves no review pull request of its own, and the initiative's two carry that epic's share.
