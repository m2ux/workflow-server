# I18 Review

Each finding from the draft review, with its resolution. No finding needed a user decision.

## Findings

1. **Criteria. AC3 missed record publication.**
   Problem: "every step that commits a file applies Engineering Branch's publish operation" fails for Plan Mode, which commits through Publish Planning Record. Resolution: AC3 reads "directly or through Publish Planning Record".
2. **References. A same-board pull request in References.**
   Problem: the format check reported the initiative's reference to #1716, which stands on board 17. Resolution: the reference is removed; R3 pins the revision #1716 leaves.
3. **Ordering. The layout check was numbered after a later-starting row.**
   Problem: the dependency check advised that the layout check (level 1) was numbered after the delivery-side owners (level 2). Resolution: the two rows swap numbers, W04 the layout check and W05 the delivery-side owners.
4. **Work items. Two work items named another task.**
   Problem: Work Item's Identity bars a work item from naming another task; W02 and W05 did. Resolution: each names the artifact or owners instead.
5. **Joins. Three candidate units were unaccounted for.**
   Problem: the dependency check printed W01–W03, W01–W05 and W03–W05 as candidate units. Resolution: [Split units](joins.md) gives one line for each with why it stays split, and the check reports none open.

## Checks After Resolution

- The format check reports no finding on the epic draft and none on the initiative draft.
- The dependency check reports no problem and no open candidate unit, as the [dependency report](dependencies.txt) shows.
