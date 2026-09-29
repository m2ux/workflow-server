# Walk B — Design Principles 25–47 plus overview; Convention Conformance

Canon read at #970 head 0d56c951. Covering entries followed: 25 → AP-110, AP-114; 26 → AP-114, AP-158; 27 → AP-115, AP-123; 28 → AP-116; 30 → AP-46; 31 → AP-59; 32 → AP-134, AP-139; 33 → AP-145; 36 → AP-157; 37 → AP-42; 38 → AP-160; 39 → AP-156; 44 → AP-134, AP-139; 45 → AP-152. For 29, 34, 35, 40–43, 46 and 47 no entry cites the principle, so the principle's text was applied as written. Engine claims were checked against /home/mike1/projects/dev/workflow-server/.worktrees/schema-description-hygiene (src/tools/workflow-tools.ts, src/loaders/workflow-loader.ts, schemas/*.json).

## Units

- Overview (design-principles `# Overview`) — walked
- 25. Bind Sibling Techniques as Steps — walked (the engine techniques' Apply chains, in resume-worker, dispatch-activity and continue-batch, are the siblings' shared form, so they count as convention and are not recorded)
- 26. A Technique Is a Reading — walked
- 27. State Contract Contribution — walked
- 28. Creation Guide for Generated Documents — walked
- 29. Cite Resource Policy; Do Not Restate It — walked (the `[<Guide name>](…#template)` link text across the workflow-design techniques is the siblings' shared form, so it is not recorded)
- 30. Resources Stay Abstract — walked
- 31. Isolate Conditional Branches as Notes — walked
- 32. Cite Resources at Section Grain — walked
- 33. Pre-Session Prose Stands Alone — walked (none of the 54 files is delivered by `discover` before a session exists)
- 34. Edit the Owner — walked
- 35. Prefer Removing the Thing That Needs a Prohibition — walked
- 36. A Technique Names Only What Its Reader Holds — walked (links to techniques inside rules that invoke nothing are a form shared across meta workflow-engine, so they count as convention and are not recorded)
- 37. An I/O Contract Names the Value — walked
- 38. A Relocation Records the Outcome It Keeps — walked
- 39. A Phase Heading Names the Outcome — walked (sentence-case headings with articles are the workflow-engine siblings' shared form, so they are not recorded)
- 40. Fan-Out Lives at the Layer That Runs the Work — walked
- 41. A Phase States Answers the Tool Has Returned — walked
- 42. A Routine Holds the Codified Path — walked
- 43. A Workflow Borrows Activities — walked
- 44. A Resource Splits for Section Delivery — walked
- 45. A Rule States One Invariant — walked
- 46. A Consumer Binds the Contract — walked
- 47. A Calibrated Surface Extends by Wrapping — walked
- Convention Conformance (whole file, `## Reference Conventions`) — walked

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| B1 | Contract | Medium | 34. Edit the Owner | corpus/meta/techniques/workflow-engine/respond-checkpoint.md:24 (`### effects`, the owner) | The owner now defines `{effects}` as the whole reply: `resolved_option`, `effect` (`setVariable` plus `exit`), `exit {id, next_activity, ends_activity}` and `dismissed`. Every reader still restates the old contract, "Variable updates carried by the resolved checkpoint": activity-worker.md:26, resume-from-checkpoint.md:18, resume-worker.md:26, compose-prompt.md:22. activity-worker.md and resume-from-checkpoint.md were touched and bumped, but their `effects` entries were left as they were. | diff (changed I/O contract) | Rewrite each reader's `### effects` to name the value the owner now declares (the resolved checkpoint's reply), without copying its field list, and bump the two closure files |
| B2 | Contract | Medium | 34. Edit the Owner | corpus/meta/techniques/workflow-engine/TECHNIQUE.md:38 (`variable-mutation-source`) | The rule was extended to "three sources only". finalize-activity.md:48 (`#### variables_changed`) keeps the restated count "one of the two sanctioned state-mutation sources". The PR removed the same count from variable-binding.md:67 ("one of the sanctioned") but left this copy. | diff | Drop the count from finalize-activity.md:48, as variable-binding.md:67 does |
| B3 | Contract | Medium | 26. A Technique Is a Reading ("The tool schema owns the remaining parameters") | corpus/meta/techniques/workflow-engine/yield-checkpoint.md:27 (Protocol 1, second bullet) | "plus `message` and at least two `options`, each with an `id` and a `label`". This restates the `yield_checkpoint` schema (`options` `.min(2)`, `id`/`label` required; workflow-tools.ts:2417-2422). AP-114 and AP-158 do not reach it. | diff | Keep the obligation (an undeclared decision carries a message and options) and drop the shape the schema owns |
| B4 | Hygiene | Low | 31. Isolate Conditional Branches as Notes (AP-59 for the in-sentence clause) | corpus/meta/techniques/workflow-engine/yield-checkpoint.md:26-27 | Line 26 adds the in-sentence caveat "omit it when those steps produced nothing". Line 27 writes the undeclared-decision branch as a peer bullet beside the call that line 26 states unconditionally ("with the id alone"), so the loader reads that branch as a second step. | diff | Keep the call as the bullet, and write the omit-when caveat and the undeclared-decision case as `  > - When …` notes under it |
| B5 | Hygiene | Low | Overview ("Each heading is one invariant") | corpus/canon/resources/design-principles.md:189 (`## 43.` body) | "…; a run of steps several activities share is a routine." restates principle 42's invariant (design-principles.md:185, "the home for a sequence … that several sites share"), so heading 43 carries two invariants | diff | Replace the routine clause with a link to [A Routine Holds the Codified Path](#42-a-routine-holds-the-codified-path) |
| B6 | Hygiene | Low | 45. A Rule States One Invariant | specimen corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md:24-26 (`### local-marker`) | "A rule this workflow alone declares, so a bare reference to it resolves only against this workflow." This describes the rule itself and states no constraint. AP-152's Detect covers several constraints and does not reach zero. | diff | State one invariant the probe holds (the marker's resolvability stays in the README) |
| B7 | Hygiene | Low | 30. Resources Stay Abstract (AP-46) | corpus/workflow-design/resources/impact-analysis.md:11 | "Human gate at impact-and-preservation." names the host checkpoint that gates the resource. The workflow-authoring twin (resources/impact-analysis.md:11) already dropped it. | pre-existing | Delete the gate clause |
| B8 | Hygiene | Low | 30. Resources Stay Abstract (AP-46) | corpus/workflow-design/resources/design-assumptions.md:62 (Rules, first bullet) | "including when collect/record ops are borrowed from work-package" names the bind topology of the ops that fill the log | pre-existing | Delete the bind clause and keep the filename rule |
| B9 | Hygiene | Low | 30. Resources Stay Abstract (AP-46) | corpus/workflow-design/resources/format-conventions.md:10 | "keep short for human skim at literacy gates" names the gates that present the artifact | pre-existing | State what the artifact is, and leave the gate to the activity |
| B10 | Hygiene | Low | Convention Conformance (twin divergence) | corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md:52 (`### 3. Check Exit Integrity`), whose `impact_analysis` is "Shaped by [Template](../../resources/impact-analysis.md#template)" | The PR renamed the check and updated the workflow-design twin template (workflow-design/resources/impact-analysis.md:58, "Exits and graph / `initialActivity` / reachability"). The template this live technique cites, workflow-authoring/resources/impact-analysis.md:58, still reads "Transitions, entry activity, reachability". | diff | Align the workflow-authoring template row with the check and the twin, and bump that resource |
| B11 | Hygiene | Low | Convention Conformance (step structure) | specimen corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml:14-15 | This `kind: technique` step has no `id`. It is the only one in the corpus that omits one; every other `kind: technique` step (754) declares an `id`. The schema allows the omission (activity.schema.json:197), and the README does not name it as a case. | diff | Give the step an `id`, or name the default-id case in the README |
| B12 | Hygiene | Low | Convention Conformance (checkpoint structure; AP-99 is the smell) | specimen activities/01-probe.yaml:18, activities/02-gate-exit.yaml:25 | `message: "Is the probe recorded?"`, `message: "End this activity here?"`. These are the only two checkpoint messages in the corpus phrased as questions. | diff | State the subject as a statement and leave the decision to the option labels |
| B13 | Hygiene | Low | Convention Conformance (documentation structure) | specimen corpus/specimens/schema-hygiene-conformance/README.md:9 | The only section is `## Cases`. The sibling specimens carry either `## The form` / `## What the run does` / `## Copying from it` (mvw, namespace-conformance) or Overview / Workflow Flow / The shape it demonstrates / File Structure. The specimens folder README says an author copies from each specimen. | diff | Add the copy-from section in the siblings' shape, or record in the README why this specimen has none |
| B14 | Hygiene | Low | Convention Conformance (field ordering) | specimen corpus/specimens/schema-hygiene-conformance/workflow.yaml:24-25 | `activities:` sits before `initialActivity`/`graph`. The only other workflow that borrows, remediate-vuln/workflow.yaml:201, lists `activities:` after `graph`. | diff | Move `activities:` after `graph` |

No finding is rated High, and no High was withdrawn or downgraded.

## Files

- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/canon/resources/anti-patterns.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/canon/resources/design-principles.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/canon/resources/schema-construct-inventory.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/codebase-wiki/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/activities/patterns/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/resources/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/resources/workflow-canonical.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/variable-binding.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/TECHNIQUE.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/activity-worker.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/respond-checkpoint.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-from-checkpoint.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/take-activity.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/yield-checkpoint.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/ponytail/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/prism-audit/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/prism-audit/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/substrate-node-security-audit/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/work-package/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/work-packages/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-authoring/resources/elicitation-guide.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-authoring/resources/update-mode-guide.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-authoring/techniques/workflow-definition/impact-analysis.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/activities/05-impact-analysis.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/activities/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/design-assumptions.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/elicitation-guide.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/format-conventions.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/impact-analysis.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/pattern-analysis.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/structural-inventory.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/resources/update-mode-guide.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/TECHNIQUE.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/audit-rule-enforcement.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/impact-analysis.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/pattern-analysis.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/workflow-design/techniques/scope-definition.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/docs/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/routines/activity-loop.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/resume-worker.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/compose-prompt.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/present-checkpoint-to-user.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/agent-conduct.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/corpus-schema-hygiene/corpus/meta/techniques/workflow-engine/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/README.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/01-probe.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/activities/02-gate-exit.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/techniques/hygiene-probe.md — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/corpus/specimens/schema-hygiene-conformance/workflow.yaml — read
- /home/mike1/projects/dev/workflow-server/.worktrees/specimen-schema-hygiene/walks/roster.json — read
