# Protocol Preservation Ledger

Source revision: `238b652aaa52057f66c86c9651c379296a7ba5b2`. The source snapshot is captured before edits. Converted family manifest: `fd0ad01dcc101d42d6eab4c32192f4140805d52c06db9db06834bd7be09e400c`.

## Mechanical Accounting

| Protocol | Steps | Existing links in original order | Prerequisites | Runs in | Commands and literal specimens |
| --- | --- | --- | --- | --- | --- |
| `change-overview.md` | 4 retained | 16 retained | Byte-identical | Byte-identical | None in either revision |
| `epic-integration.md` | 4 retained | 23 retained | Byte-identical | Byte-identical | None in either revision |
| `issue-closure.md` | 4 retained | 16 retained | Byte-identical | Byte-identical | None in either revision |
| `issue-delivery.md` | 5 retained | 19 retained | Byte-identical | Byte-identical | None in either revision |
| `review-pull-request.md` | 5 retained | 16 retained | Byte-identical | Byte-identical | None in either revision |
| `task-merge.md` | 5 retained | 21 retained | Byte-identical | Byte-identical | None in either revision |
| `unit-dispatch.md` | 5 retained | 28 retained | Byte-identical | Byte-identical | None in either revision |

## Operative Mapping

Every numbered source step retains its sequence position and governing text. All existing target links remain in their original order as a subsequence. Added retry links resolve only to targets already held by the same file; they introduce no new callee or prerequisite context. The following reviewed presentation changes account for text beyond headings, indentation and Run/Call-to-Apply changes:

- **Change Overview:** Read Pull Request State keeps the supplied identity/title/base/head request and the separate changed-path request. Changed-head retries, head-match gate, stale-index retry, changed-revision rebuild and unresolved freshness return use named conditional/continuation groups. Publication receives the returned file.
- **Epic Integration:** Both withdrawal operations remain before preparation and after any failed gate. Board absence remains the sole board-withdrawal exception. Repository setting, exact target/head, readiness, head-change refreshes, agent review, human handoff, changed-head refusal and repeated-refusal return remain explicit. Merge Delivery Pull Request receives every original evidence input and delivery kind.
- **Issue Closure:** Task/hot-fix completion remains an explicit conditional instruction. Epic and initiative completion each use one scoped condition and flush action bullets; Completion Result applies to every branch. Every linked epic is read afresh. Missing-evidence refresh/recheck and incorrect-link user-decision/removal/restart remain conditionally grouped; the common unmerged-link/criterion report follows those groups. Close Tracker Issue receives the same issue identity and successful delivery result.
- **Issue Delivery:** Record Hot-fix Delivery and Record Task Delivery receive the returned verified ids with their original evidence inputs. Remaining-criterion tick and retention share a conditional group; body publication follows it, using the retained epic body and each returned task body. Coverage disagreements remain reported without stopping links/criteria/Done recording.
- **Review Pull Request:** The absent-number locate/use branch is a named group, followed by the existing-review read. Population receives the prior body and actual task merges; publication receives its returned file, existing number or new epic identity and confirmed setting. Handoff retains register/publish/link/fetch/check and blocker handling.
- **Task Merge:** The hot-fix path retains its eligible closure, board settlement and early return. The normal task path calls Issue Closure for an eligible task, and the final post-integration path calls it for the epic. Whole-protocol calls, readiness condition, every-base-merged condition and initiative-sync boundary remain explicit.
- **Unit Dispatch:** Unit-of-rows criteria and unjoined-unit conditions share one scoped group. Task-row and hot-fix holds have separate named groups. New row reservation and saving run in order under one new-unit condition; retained holds, status/readback, competing-hold failure, capacity-only wait, actual-start gate, returned identity and explicit-release constraint remain.

## Isolation

Only the seven protocol source files differ from the unit base. Installed model/rule declarations, shared guidelines, other skills, server source, schemas and workflow YAML are untouched. Reader support is coordinated with the mode-family worker.
