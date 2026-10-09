# Canon audit — artifact destination CI repair

**Status:** finished. **Base:** `032597956b37a81602a0f19b17342a53c3391a95` (workflows). **Surface:** three touched files, zero additional closure files; three read whole. **Verdict:** Live 0 · Contract 0 · Hygiene 0 introduced. No unread paths or blocked units. All 54 corpus guards pass.

## Scope

| Path | Membership and evidence |
| --- | --- |
| `corpus/specimens/artifact-destination-conformance/activities/01-write-bound.yaml` | Whole activity read. Removes an unproduced boolean declaration and explicitly binds the defaulted destination input. Reads, technique binding, exit and outcome agree. |
| `corpus/specimens/artifact-destination-conformance/activities/02-write-unbound.yaml` | Whole activity read. Removes an unproduced boolean declaration. Planning-folder read, existing technique, exit and outcome retain the destination behavior. |
| `walks/roster.json` | Whole roster read. One checkpoint-free specimen enters the documented exemption set. |

Repository: `.worktrees/fix/corpus-artifact-conformance`. Server: `.worktrees/verify/949-main` at `c1a97f236e20db64c8d36ba919ef0e7a4c1b671e`.

Read the specimen's workflow, root README, activity README, technique container, both leaf techniques, technique README, resource README and report guide in full. The graph enters `write-bound`, then `write-unbound`, then terminates; there is no second entry or checkpoint. The two real products remain `bound_report` and `unbound_report`, with their existing artifact declarations. The removed booleans have neither technique producers nor consumers. Corpus-wide reference search found no other workflow consumer or reference to either deleted name. No technique I/O contract changes, so no extra contract closure is added.

Reference conventions are the existing specimen itself and the checkpoint-free exemptions already in the roster. The current server's `check-identity-binds.ts` explicitly excludes defaulted and optional inputs from redundant-bind findings: an explicit binding makes the activity's read contract consult the value. `record-bound-artifact` declares a default, so its new binding belongs to that exemption. The server's `all-workflows-walk.test.ts` indexes all workflows and uses graph-mode traversal; the roster reason accurately claims activity entry, without claiming execution of the artifact-writing steps.

## Canon walk

Applied all 47 Design Principles, all 166 anti-pattern entries and 12 family headings, Reference Conventions, the 60 guard registry entries and the schema-field home to the three-file surface. The canon homes have no diff from the versions read fully in the preceding advisory audit in this session. Server registry, schemas and the defaulted-input exemption also remain the same.

- **Both activities:** field order, kebab identities and semantic versions match the construct convention. Each binds one existing technique; no new prose procedure, checkpoint, loop, fan, shadow state, set action, rule or artifact declaration is introduced. Each default exit is covered by the graph. Removal of the boolean declarations removes false state promises; the actual report outputs, destinations and user value survive on their existing techniques. Neither removed name is used in messages, input binds, conditions, outcomes or graph routing. No relocation occurs.
- **Bound activity:** explicit `artifact_destination` interpolation is produced by the workflow default or session binding. It is spent by the named input and lands on the existing defaulted technique contract. There is no same-step set, unproduced read or body duplication. The activity remains a binding site; interpretation and artifact writing remain in the technique.
- **Unbound activity:** `planning_folder_path` remains the declared read consumed by the existing technique. The leaf artifact still defaults to session planning placement. Removing an unused completion boolean changes no routing or destination decision.
- **Roster:** the new id resolves to the actual specimen. Both activity files contain no checkpoint, so there is no uncovered decision hidden by the exemption. Existing roster members and reasons are preserved. The reason's graph-walk claim was checked at its test consumer.

Creation Rules and their nine subheadings are not applicable because no canon home changes. Technique-only and resource-only tests have no touched technique or resource; the files read to resolve binds supply context without entering the contract-change closure. No touched README, routine, bootstrap, tool signature or artifact template exists. The remaining units were walked against the complete activity bodies and roster, as above. No open manual finding or new pattern-based guard candidate results.

## Verification

The [guard log](canon-guards.log) records all 54 corpus guards passing, zero failures and zero unmeasured. The six server-repository guards are not applicable to this corpus change: `site-links`, `svg-layout`, `source-encoding`, `agent-instruction-homes`, `lockfile-denylist`, `generated-schemas`. This accounts for all 60 registry units.

The delivery agent reports roster validation exit 0 and the specimen graph walk passing (one selected test, 64 unrelated tests skipped). `git diff --check` passes, independently confirmed at audit close; the final diff still contains exactly the three enumerated files. These local results clear the definition commit gate. They do not assert remote CI completion or live execution of artifact-writing steps.

## Snapshot follow-up

CI reached the work-package snapshot suite after the definition repair. Three baseline comparisons fail: the default policy, full-workflow policy, and declared/executed-step inventory. Independent inspection attributes all observed changes to already-merged `b78277f6210dde7dc9c50261dd6091135d1148a5`, whose `persist-activity` routine replaces `commit-source` with `prepare-source-commit`, `commit-source-submodule`, `commit-source-files`, and `push-source-branch`.

That is three additional declared steps at each of two materializations inside `post-impl-review`. CI therefore reports exactly the expected declared count increase, 132 to 138 for that activity and 450 to 456 overall. The three conditional source steps add six pending gates, 66 to 72. The default/full-policy snapshots rename the old missing-input site and enumerate the three additional sites under both `commit-activity-artifacts` and `persist-the-fan`. Executed steps remain 215, unparsed gates remain zero, and all terminal-path and artifact assertions pass in the failing run. The test source expressly pins both inventories to the corpus and calls for regenerating snapshots after a corpus change. This evidence supports a baseline update; it supplies no reason to change production source or the routine.

**Follow-up status: finished; snapshot commit gate clear.** Independently reviewed the complete generated diff of `walks/snapshot.test.ts.snap`: it changes only the two policies' missing-input site lists and pending-gate counts, plus the two declared-step totals predicted above. There are no changes to execution counts, routing, terminal outcomes, artifact assertions or other snapshot entries. Regeneration reports exactly three snapshots updated and all 23 tests passing in `/tmp/corpus-repair-snapshots.log`. The independent full graph walk reports all 65 tests passing in `/tmp/corpus-repair-all-walks.log`. The baseline update is justified by the existing routine declaration; no source change is required. The finished definition audit above applies to its original three-file surface, with this generated baseline as one additional reviewed evidence file.
