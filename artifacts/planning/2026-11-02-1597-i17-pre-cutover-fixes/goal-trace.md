# I17 Goal Trace

| Goal clause | Initiative criteria | Epics | Epic criteria | Source requirement |
| --- | --- | --- | --- | --- |
| Each fix found before the cutover is delivered in workflow-server | AC1 | E00 | AC1–AC8, one set per fix row | The user's goal, decision 2 |
| The extraction carries each fix | AC1 | E00 | AC1–AC8, held at the extraction source by I16 E00 W00's prerequisite | The user's goal, decision 2 |

No requirement source is marked; the criteria come from the confirmed goal.

## Gaps, Ranked

1. **Flagged. The extraction's pinned revision predates the fixes.** I16 E00's R2 and I16's evidence name workflow-server `785a5ee8c` as the extracted head. Once these fixes merge, the extraction is cut from a later commit. I16's prerequisite edge holds the order; re-pinning R2 and the evidence revision is I16's to make when W00 starts, and I16's issues are otherwise left unedited by decision.
2. **AC1's time bound rests on another initiative's edge.** The ancestry holds because I16 E00 W00 waits for this epic. The criterion states what this initiative achieves and names the extraction as its milestone, as the time-bound condition allows.
3. **Fixes found later.** A row added after the extraction starts is outside the goal, as the Non-Goals state.

## Outside Threats

- **Readers of what the plan changes.** Every workspace that installs the skill from `workspace` (md-composer, prosiform) takes the fixes on its next update; none depends on a planning branch, a discussion pull request or the title-prefix fetch.
- **Fail-closed paths.** The format check's label check keeps asking to decide a missing, repeated or descending label, so accepting gaps hides no other fault.
- **Instrument independence.** `git merge-base --is-ancestor` reads git history, independent of the skill it measures.
