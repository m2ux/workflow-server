# Placements

Each standalone issue, the work's new home, and whether the issue is kept as the task or epic issue.

## Unproduced reads

Ten issues become the rows of a new epic, `[I04:E13] Unproduced Reads: Every Value a Run Reads Has a Producer`, under I04 Technical Debt. Each is kept as its task issue.

| Issue | Row | Workflow | Ledger entries |
| --- | --- | --- | --- |
| #981 | W01 | cicd-pipeline-security-audit | 2 |
| #982 | W02 | meta | 1 |
| #984 | W03 | ponytail | 5 |
| #985 | W04 | prism | 10 |
| #986 | W05 | prism-update | 5 |
| #988 | W06 | substrate-node-security-audit | 6 |
| #989 | W07 | work-package | 6 |
| #990 | W08 | work-packages | 4 |
| #1247 | W09 | three gitnexus conformance specimens, plain-language, workflow-design | 17 |
| #987 | W10 | remediate-vuln | 47 |

- **The order is the cost of the row.**
  W01 through W09 are the small bindings; W10 is remediate-vuln, which carries forty-seven of the hundred and three entries and the work-package activities it embeds.
- **E07 ticked the guard, not the backlog.**
  `[I04:E07]` AC1 reads "the activity-variables guard reports no findings against the corpus", and it is ticked because the ledger suppresses every one. This epic empties the ledger, so the same silence holds with no suppression.

## Canon

| Issue | Placement | Kept |
| --- | --- | --- |
| #1004 | New task in `[I07:E02]` Canon Agreement (#940) | Kept as the task issue |
| #1005 | New task in `[I07:E02]` Canon Agreement (#940) | Kept as the task issue |

- **The guards read the carve-outs.**
  #1005's `omit-null-sections` guard reads the carve-out #1004 adds, so its row depends on #1004's.

## Test plan evidence

| Issue | Placement | Kept |
| --- | --- | --- |
| #1241 | W01 of a new epic `[I11:E11]` | Kept as the task issue |
| #1246 | W02 of the same epic | Kept as the task issue |

#1246 is one task issue carrying three criteria — the alignment repair, the diagnosis, and the public-reference check — rather than three rows, because one pull request on the skill delivers all three.

## Remaining

| Issue | Placement | Kept |
| --- | --- | --- |
| #1159 | New epic `[I04:E14]` Merge Gate | Kept as the epic issue |
| #1232 | New task in `[I08:E03]` Support Libraries (#882) | Kept as the task issue |
| #964 | New task in `[I00:E10]` Session Record (#533) | Kept as the task issue |
| #924 | Left standalone | Stays open |

- **#924 is a live fixture.**
  The `github-library-conformance` specimen names it as the throwaway issue its label-family and project-field writes target. It is not planned work and stays open while that specimen uses it.
- **#964 takes the detect option.**
  Recording a presentation event and flagging a hard-gate response with none before it is a session-record change. Enforcing through MCP elicitation holds only where the client supports it, and is not this task.
