# Command List Placement — November 2026

> Style correction · Created 2026-11-06

## Executive Summary

The user requests every command-section bulleted list below its invocation box. Keep each imperative preamble and non-list prose in place, and move each complete list with its nested detail to the end of its command specification, preserving list order, text, links and all command bytes.

Update the existing Work Planner Spec Layout guideline to state this declared layout. It specializes the shared generic command layout for this skill. No other skill is revised. Read complete named specifications, including the moved conditions, under the existing linked-section rule.

## Validation Plan

Inventory every command list, compare exact list and invocation content, and check all headings, Fields and prerequisite sections. Verify that no command list precedes its invocation; run the installed model and existing documented-command/checkout checks. No new test infrastructure or reading path is needed for this formatting change. Commit and push on the current E01 branch.

## Links

| Resource | Link |
| --- | --- |
| Style PR | https://github.com/m2ux/workflow-server/pull/1641 |

## Result

Source: `7beaf46c621bae84872573adab8c4e1eecc2254d`, compared with `00694d77a4d0858a91e09bf4893cd2ee2cce5989`.

Moved all 197 pre-invocation bullets in 55 command specifications across 20 documents. The existing Work Planner Spec Layout rule states that every bulleted detail list follows its invocation box, while unbulleted context and REST gaps precede it. This is the skill's declared specialization of the shared layout.

All 116 command invocations, all headings, all 36 Fields sections, nine literal templates and every prerequisite section are byte-identical. Every nonblank line and the order of every bullet in affected documents is preserved. No command list remains before its invocation. Named-section boundaries, caller links and execution paths are preserved; the complete specification remains required context under the existing linked-section rule.

Validation: ten checkout-contract tests, twelve documented-command tests and fourteen document tests pass; installed model checks 58 files with zero findings; whitespace check passes. No executable, consumed template or test changes. These are local presentation/contract checks, with no live tracker/graph execution or new reading-conformance claim.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [changes.json](changes.json) | Placement inventory or reproducible preservation/check evidence |
| [preservation.json](preservation.json) | Placement inventory or reproducible preservation/check evidence |
| [verify.py](verify.py) | Placement inventory or reproducible preservation/check evidence |
| [model.log](model.log) | Placement inventory or reproducible preservation/check evidence |
| [checkout-tests.log](checkout-tests.log) | Placement inventory or reproducible preservation/check evidence |
| [command-tests.log](command-tests.log) | Placement inventory or reproducible preservation/check evidence |
| [document-tests.log](document-tests.log) | Placement inventory or reproducible preservation/check evidence |
