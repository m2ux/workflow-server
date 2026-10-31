# E09 producer availability

Consumer starting commit: `b0294e20074f715286d7c13451d3df30764d3273`, branch `i11/e09/workspace`, repository `m2ux/workflow-server`.

- E08 W02 links merged [PR #1164](https://github.com/m2ux/workflow-server/pull/1164), merged directly into `workspace` at `5808135bd68505c3e39769eab294a6440bb9592a` on 2026-10-06. The live E08 issue records W02 Done and AC3–AC5 checked. `git merge-base --is-ancestor 5808135bd68505c3e39769eab294a6440bb9592a b0294e20074f715286d7c13451d3df30764d3273` exits 0. The consumer contains reservation parsing in `skills/work-planner/scripts/format.py`, reservation writes/held-row reporting in `deliver.py`, and the dispatch procedure in `modes/deliver-mode.md`.
- E17's reviewed-handoff output is integrated by [PR #1484](https://github.com/m2ux/workflow-server/pull/1484), whose merge is the consumer starting commit. `agent_review.py`, the Agent Review artifact, Review Pull Request and Epic Integration protocols are present; they identify both head and base and block missing/stale evidence. W03 must preserve that gate while updating current activity.

The next serial unit is cut from the latest epic base and verifies ancestry from this starting commit. These named producer outputs are available in the evaluated consumer revision; producer-epic closure is not substituted for output availability.
