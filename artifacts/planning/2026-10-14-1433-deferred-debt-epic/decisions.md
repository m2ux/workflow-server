# Decisions

## How AC3 is met

AC3 requires that a final epic whose rows change workflow definitions carries the corpus audit criterion, as a run of `format.py` over such an epic reports. `check_corpus_audit` measures reach from the base of each pull request naming the epic: an epic with a pull request targeting the corpus branch, through an epic base, an initiative branch or the long-lived branch itself, is reported where its criteria name no canon audit.

**The relocation is the fix, and `format.py` is unchanged.** The check never fired on a debt epic because a standing initiative ranked below the board's planned work never delivered, so no pull request ever named its epics. A final epic of the source initiative delivers inside that initiative, so its first corpus-targeting pull request fires the check, and the epic cannot close while the criterion is missing. [T4](deferred-debt-epic.md#t4--a-deferred-debt-epic-reaching-the-corpus-states-the-audit) runs the check over such an epic.

### Options weighed

- **Declare the branches in the epic body.**
  The epic would state the long-lived branches its rows change, and `format.py` would require the criterion from that declaration before any delivery. It reports earliest, and it costs a new section in the epic template, a new parse, and a declaration an author can get wrong — a second statement of something the pull request bases already say.
- **Require the criterion of every final epic.**
  `format.py` would key on the epic being its initiative's deferred-debt epic and demand the audit criterion unconditionally. It needs no new body signal, and it contradicts the guide's own rule that a row changing only the engine, continuous integration or the workspace does not bring the criterion.
- **The relocation alone.**
  No new signal and no new rule: the final epic is an epic, and the check that binds every other epic binds it. The report arrives at the first corpus-targeting pull request rather than at planning time, which is when the guide already says definitions change.

## What is not carried over

The standing arrangement's priority rule, its empty opening Work Breakdown and its "a board carries at least one, and takes more" clause have no counterpart. Being the initiative's last epic is what holds the clear-up behind the work in flight, so nothing ranks it separately, and an initiative that defers nothing raises no epic at all. No board carried a standing technical-debt initiative when this landed, so no rows were migrated.
