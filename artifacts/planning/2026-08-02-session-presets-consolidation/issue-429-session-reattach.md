# Capture: issue #429 — Session reattach: resuming a run rebuilds its workflow instead of continuing it

Body verbatim as of 6 August 2026 (filed 4 August 2026; subsumed into #401 as W3 and closed on 6 August 2026). It joins this epic because the fault lives in the throwaway-session-then-promote machinery W2 retires, and because W2 already names a saved session that might be the one to resume as an open decision the bootstrap has to return rather than decide for itself.

Its own investigation folder — the measured damage, each constraint with its evidence, and the corpus-side gate semantics — stays where it was written: [`2026-08-04-session-reattach`](../2026-08-04-session-reattach/README.md).

---

## Summary

Opening a session a second time into the same planning folder is how a run is resumed. When that happens the server builds a brand-new child workflow and writes it over the folder's `session.json`, discarding whatever the earlier run had recorded. The caller is handed back the same identifier the previous child had, so nothing in the response suggests anything was lost, and the run restarts at the first activity having reported the work it was resuming.

The fix needs a way for a dispatch to attach to a child that is already there. A first attempt at that landed on the batched-dispatch branch and was taken back out — two review rounds found six separate faults in it, each one only visible once the previous was fixed. The measurements and traces from those rounds are below, because they are what the design has to answer.

## What happens today

A meta session opens with no planning folder, so the server keeps it in a temporary one. The first `dispatch_child` promotes that temporary session onto a stable folder named by the planning slug, and embeds the child workflow inside the promoted file.

On a resume the same sequence runs again. `start_session` makes a *new* temporary meta session, and promotion asks for the folder for that same slug — which already exists, holding the previous run's session. Promotion then writes the new meta session over it, with a freshly built child inside.

The child's identifier is derived from the folder plus the path to the slot it occupies. Both runs put their child in the same slot, so both derive the same identifier. The caller receives it, the identifier resolves, every subsequent call succeeds — against an empty session. Measured on a real work-package: cursor `second-activity` and one completed activity before, cursor empty and none after, five history events reduced to two, same identifier throughout.

Nothing reports this. The response carries no indication a session was replaced, and no guard or test covers the second-dispatch path.

## What a fix has to get right

Each of these was found by review, and each is a fault a straightforward reattach walks into.

**A session that cannot be read is not a session that is absent.** Promotion writes *over* the folder, so treating an unreadable file as "nothing here" destroys the work it holds. The likeliest cause is a rotated server key, which leaves the content perfectly intact — the file is fine and only the signature no longer matches. Refusing the dispatch costs the caller one call; continuing costs them the run.

**Whether a child has finished is not recorded where it looks.** The embedded reference carries a status, but that status is only ever changed by the branch that notifies a *persistent* parent. A dispatched child has no parent link, so its reference reads `running` for ever. Read that and a completed workflow is resumed onto its close-out activity and runs it a second time — observed on the real corpus, with completion recorded twice. The child's own state is where completion lives.

**A cursor can point somewhere that cannot be entered.** Four workflows park a finished session on a terminal marker. `next_activity` accepts that marker and re-announces completion, but no activity is declared under it, so the worker's fetch is refused and the loop can neither move on nor finish, because only a worker's result moves the pointer. A cursor naming an activity the workflow no longer declares fails the same way, and the error names the identifier it could not find rather than the one to use.

**The identifier is recorded in two places and only one is used to resolve it.** A resume has to refresh the copy inside the child's own state; refreshing only the reference hands back an identifier that resolves to nothing while the stale one still works. This only shows up once the folder has moved, which is exactly the case the refresh exists for.

**A run abandoned at a checkpoint is the most likely thing to resume, and the hardest.** The pending checkpoint survives, and every tool then refuses until it is answered. Every step in the dispatch loop that could answer one is gated on a worker's result, and there is no worker yet, so nothing in the corpus can clear it. This is what a run left overnight looks like.

**Order inside the folder is load-bearing.** Because an identifier is derived from the slot a child sits in, carrying children forward has to keep each one where it was. Moving one changes the identifier its worker authenticates with.

Two smaller ones: the arguments a caller passes on a resume — the repository, the delivery mode, the agent identity — are silently ignored if the saved child is adopted whole, and a child resumed after its workflow's version has moved keeps the old version, so the drift warning arrives on a later call rather than at the dispatch. And the previous meta session's own history is lost even when the child's is preserved.

## Scope of change

The server's child-dispatch path, which is where the folder is read and written; the operation that wraps it, so the cursor it reports is a declared output; and the meta dispatch loop, so priming distinguishes a resumed cursor from a first activity. A guard would help: nothing today covers a second dispatch into an occupied folder, which is why this went unnoticed.

## Acceptance criteria

- [ ] A second dispatch into a folder holding a running child of the same workflow continues that child, with its cursor, completed activities and variables intact.
- [ ] A dispatch into a folder whose session cannot be read is refused, naming the reason, and leaves the file untouched.
- [ ] A finished child is not resumed; a new one starts beside it and every prior child keeps its slot.
- [ ] A cursor that cannot be entered — a terminal marker, or an activity the workflow no longer declares — does not strand the run.
- [ ] A child left at a checkpoint can be resumed, or the dispatch says plainly that it cannot and why.
- [ ] The identifier handed back resolves, including after the folder has moved.
- [ ] A resumed run is visible in the response and in the folder's history, distinguishable from a first dispatch.

## Non-goals

Resuming through a persistent parent, which appends a second child rather than continuing the first. That path overwrites nothing, so it loses no work, and the bootstrap does not take it.

## Investigation detail

The full record is in [`.engineering/artifacts/planning/2026-08-04-session-reattach/`](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-04-session-reattach/README.md) — the measured damage, each constraint with the evidence behind it, and the corpus-side gate semantics already verified against the when-expression evaluator.

The reverted attempt itself is on the batched-dispatch branch: the reattach in `2d43bd5f`, the corpus side in `636e7b15`, and the fixes those rounds produced in `323f0f5f`, `eea3a732`, `86b8abe3` and `e3fb9a47`. The reverts state what each fault was and why the direction was wrong.


