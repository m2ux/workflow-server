# Retained Preparation Reuse

## Decision and Evidence

The user approved planning this follow-up in E02 on 2026-11-06. The preservation review identifies a pre-existing route ambiguity at `e76308e672cc04d94b47891946bfbdc5331184b3`: Deliver resumes a retained preparation through Unit Dispatch; Unit Dispatch accepts the retained record/context but then calls Create Task Worktree, whose Add Task Worktree command creates a branch with `git worktree add -b`.

The existing correction is issue #1631 / PR #1645, currently open and unmerged, with head `7d7247529525eda7f799eea4b2dec779fea36909`. It already distinguishes new creation from retained validation, captures the preparation head and provides a Delivery Branches checker. E02 consumes and reconciles that work rather than creating a second implementation. Refresh these identities and behavior before dispatch; no merge or implementation is authorized by this planning update.

## Ownership and Sequence

- The new W10 work item extends `workspace:skills/work-planner/protocols/unit-dispatch.md`: it owns selection of the new/retained route, result routing and continuation. Delivery Branches remains the one home for checkout identity, creation and read-only validation. Dispatch Batch owns the existing admission/start gate.
- W10 owns AC14–AC16, within the three-criterion task bound. It follows W09 because it consumes the completed separation diagnostics to check the composed route's before-use context, and it depends explicitly on external issue #1631 for the existing reusable validation capability.
- Existing W01–W09 identities, coverage, dependencies, joins, blank lanes and Done cells remain intact. In particular the W06/W07/W08 atomic unit and E01 W08 producer edge are preserved. The epic keeps priority 6 and the initiative's epic order does not change.
- The W02 ownership audit records this observed route as a concrete candidate. W03/W05 apply generic/ownership changes before W09 and W10. W10 does not introduce a kind-specific case or duplicate the callee's parameter inventory.
- Inspect the upstream tests and reuse their instruments. A defect in the code supplied by PR #1645 belongs to that PR; W10 reconciles its calls with the separated protocol and verifies the composition. If the integrated route already passes, retain the acceptance evidence rather than adding a redundant path.

## Regression Matrix

| Scenario | Required observation |
| --- | --- |
| New unit | Creation occurs once, and its exact full head is captured in the preparation before it can be retained. |
| Valid retained preparation | The registered worktree, task branch and full recorded head match; tracked and untracked status is clean; validation reuses that checkout without creation, reset or cleanup. |
| Multiple epic bases | Validate every retained checkout independently; any mismatch blocks the whole unit before execution. Include a path containing spaces. |
| Missing/wrong registration or foreign repository | Unit blocker; no replacement worktree, deleted files or worker start. |
| Wrong branch, detached HEAD or different/missing/abbreviated preparation head | Unit blocker; branch, HEAD, contents and hold are retained. |
| Tracked changes, staged changes or untracked files | Unit blocker; before/after repository and file snapshots are identical. |
| Capacity-only wait followed by available capacity | Same record, captured unit context and verified hold; refreshed publication, current batch, actual session inventory and free capacity precede exactly one start. |
| Competing session or changed hold | Existing start/hold guard rejects the resume; no duplicate worker and no automatic release. |
| Conditional reading path | Completed prerequisite diagnostics and route checks verify required common/selected context before use for both new and retained entries, with no new circular preload or duplicated I/O declarations. |

Use actual local git repositories for checkout identity and mutation assertions. Protocol checks must observe which capability is selected; helper-only passing tests cannot prove that a retained entry avoids creation. Fixture execution belongs in the fixing PR and includes its document, checkout, command, planner/shared and installed-model checks. This plan claims no implementation or live dispatch validation.

## Publication and Limits

The engineering draft and work item are pushed before the issue links them. Format, criterion coverage, dependency and component checks use the current live initiative/sibling snapshots. The dependency checker treats external #1631 as an external issue and does not prove its delivery; its open state and unmerged PR are recorded above. Before dispatch, require its producing capability to be present and verified, beyond an issue-state claim alone. Read back the saved epic exactly, retaining its title, open state and complete labels.
