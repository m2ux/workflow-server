# Command Layout Plan

## Scope

Apply the reviewed board-delivery example throughout Work Planner on i17/e01/workspace. Shared checker changes are limited to supporting that declared model; other skills retain their declarations.

## Layout

- Commands precedes Fields in every mode, protocol and artifact that owns command specifications.
- One named command specification owns its enriched HTML invocation, input/output role links, preconditions, optional arguments and provided result.
- Procedures retain numbered steps, calls, selection, sequencing, decisions, retries and result handling. Nested calls have no duplicate input/output contract or parameter inventory.
- Command links use Run; artifact operations use Apply; mode, protocol and child-procedure links use Follow. All called transformations retain the ƒ link title.
- Shell continuation backslashes use HTML entities so rendered commands retain single line breaks. Field examples remain fenced data at their owning field.

## Operation Boundaries

- Subsume the eighteen audited forwarding operations into their callers by linking their command specification directly.
- Subsume Plan Board Changes, Plan Board Queue, Plan Available Work, Check Agent Review, Reserve Task Rows and Release Task Rows only with their guards and internal-computation semantics retained once in the command specification or owning field.
- Preserve substantive operations that coordinate several commands, user decisions, persistence and confirmation.
- Preserve lane ownership in lane.md and its implementation module. Internal lane calls describe computation, not extra CLI execution by the agent.

## Verification

- Preserve the command payloads, field contracts, templates, prerequisite reach and conditions against the recorded baseline; inspect each intentional difference.
- Update declarations, rules and meaningful checker/document/checkout tests together. Reject invocations outside Commands and duplicate nested IO declarations.
- Run the Work Planner suite, shared checker suite, installed skill checker and whitespace checks.
- Perform independent fresh-context reading checks for board, revision and graph scenarios, with repeated affected routes. Record limitations and avoid unsupported performance claims.
- Commit and push distinct implementation and correction changes on the existing branch. Publish the audit and validation evidence on engineering.
