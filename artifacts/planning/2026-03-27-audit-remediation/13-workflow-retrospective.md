# Workflow Retrospective — WP-01: Security Hardening

## What Went Well

1. **Clear findings from audit.** QC-003 and QC-004 were precisely specified with exact line numbers, making the fix scope unambiguous from the start. The audit's structural prism analysis paid dividends here.

2. **Focused scope.** Two findings, one primary file, one schema addition. The work package stayed tightly bounded with no scope creep. Strategic review confirmed all changes traced to the two findings.

3. **Fast iteration.** Simple complexity classification allowed skipping optional activities (elicitation, research). The entire work package — from start-work-package through complete — executed in a single session.

4. **Path validation design.** The `resolve() + startsWith(root + sep)` pattern is simple, correct, and covers the prefix-spoofing edge case that a naive `startsWith(root)` check would miss.

## What Could Improve

1. **Backward compatibility classification.** The `sessionTokenEncrypted` field was made required (`z.boolean()`) rather than optional (`z.boolean().optional()`). This was flagged in post-impl review as a potential backward-compat break for legacy state files. The decision to make it required was intentional (schema version bump), but it should have been surfaced as a stakeholder question rather than resolved as a code-level assumption. Backward compatibility decisions are stakeholder-dependent, not code-resolvable.

2. **Legacy fallback omission.** The original plan specified a `??` fallback to `variables['_session_token_encrypted']` for backward compatibility. The implementation omitted this, along with cleanup of the legacy flag on restore. Post-impl review caught these as F2/F3 findings. The implementation diverged from the documented plan.

3. **Test plan execution gap.** The test plan specified 15 tests but only 10 were implemented (0 of 5 flag migration integration tests). The gap was identified in test suite review. For future work packages, test implementation should be verified against the plan before marking implementation complete.

## Process Improvements for Future WPs

1. **Classify backward-compat decisions explicitly.** When an assumption involves "will this break existing data on disk?", tag it as stakeholder-dependent in the assumptions log, not just code-resolvable.

2. **Verify implementation against plan before post-impl review.** Add a checklist step between implement and post-impl-review that diffs the plan's task list against the actual changes.

3. **Flag migration tests need integration harness.** T3 tests require spinning up the MCP server or extracting the handler logic into testable functions. This is a test infrastructure gap that WP-09 should address.
