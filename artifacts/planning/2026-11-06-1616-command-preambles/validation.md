# Command Preamble Verification

## Result and Source

All 116 Work Planner command specifications open with an imperative action and linked provided outputs and recipient in their preamble. The invocation follows conditions and usage. Compute Dispatch Status includes the missing/failing agent-review gate in the opening paragraph, matching the requested example. The owning Spec Layout guideline states this rule once.

- Original: `e76308e672cc04d94b47891946bfbdc5331184b3`.
- Revised: `beb5c86f9682ebb70918ff4de20b2c140d71464f`.
- Scope: 25 command-owning Markdown files and Work Planner's guideline, 26 files total.

## Preservation

The comparison verifies every original specification against the revised source:

- All 116 invocation payloads are byte-identical, including parameter links, nullable-value quotes, optional flags, escaped backslashes and output redirections.
- Each specification has the identical Markdown-link multiset, including input/output/transformation roles. Every linked output formerly following an invocation appears in its first paragraph; no trailing result paragraph remains in a command specification.
- Every command's existing usage, authorization, checkout declaration, REST gap, precondition and result-handling detail remains byte-identical. Compute Dispatch Status's sole guard paragraph moves into its preamble with its text intact.
- Original descriptions are rewritten as imperative instructions. Compound actions, missing-result states, conditional files and failure outputs were read individually; 52 compound/conditional preambles received specific grammatical refinements. This is human semantic review, not a general automatic grammar classifier.
- All existing Fields content and all content before Commands, including procedures, operations, caller selections and their result continuation, remain byte-identical in each of the 25 files. There are no moved files, new call paths, script changes, added compatibility paths or new runtime dependencies.
- Each invocation is rendered with the locally available `markdown_it` CommonMark reader and contains no blockquote. No remote Markdown preview, live tracker write or graph operation is part of this check.

## Verification

| Check | Result |
| --- | --- |
| Command inventory and preservation | 116 passed, 25 owning files |
| Complete Work Planner suite | 943 tests: 942 passed, 1 opt-in skip |
| Shared checker suite | 277 passed |
| Installed model | 58 Markdown files, zero findings |
| Whitespace | `git diff --check` passed before commit |

The rule maps to review through the existing guideline rule mapping. Existing shared validation checks command placement and contextual roles; this change adds no hardcoded list of natural-language verbs to the production checker. The verb check in the evidence script applies only to this reviewed migration inventory.

## Disclosure Boundary

This edit changes preamble placement and mood within the same command specifications. Entry points, prerequisite lists, command identities, operation calls, Fields and I/O links are preserved. The existing reader, checkout and command-behavior tests run in the full suite. It does not establish fresh-context consistency or live GitHub/GitNexus correctness; the prerequisite and retained-preparation follow-ups already planned in E02 remain separate work.

## Reproduction

From the product checkout at the revised source, run the recorded `verify-preambles.py` with the absolute path to this record's `before.json` as its single argument. It uses the exact original git revision for Fields/caller comparisons, reads the current installed skill and writes its machine-readable and readable results under `/tmp`. The inventory, final preambles, source hashes and test logs are linked from README.md.
