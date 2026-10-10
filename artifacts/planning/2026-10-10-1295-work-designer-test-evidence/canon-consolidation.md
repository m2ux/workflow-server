# Workflow Canon Consolidation

## Scope

PR 1295 houses a general work-design assistant under Workflow Canon with Author, Audit, Review and Revise modes. Project variants supply concrete canon homes, branch roles and validation commands. The separate Work Designer entry point is removed. Shared skill guidelines govern every mode and reference.

Implementation: [c1f580fd21737fd3fba26c7c0d14ce47686eb0ba](https://github.com/m2ux/workflow-server/commit/c1f580fd21737fd3fba26c7c0d14ce47686eb0ba). The accompanying [evidence snapshot](canon-consolidation-evidence.json) records final file hashes and the trial baselines.

## Tasks

- [x] Inspect both skills, shared guidelines, callers and existing checks.
- [x] Consolidate modes, project configuration and command prerequisites.
- [x] Verify links, metadata, existing tests and fresh-agent reading paths; record limitations.
- [ ] In progress: commit, publish the evidence and update the PR body.

## Validation Plan

- Validate local Markdown targets and fragments, frontmatter and mode summaries across the changed skills.
- Run Workflow Canon's edit-guard suite and relevant Work Planner regression checks.
- Trace each mode's required context and conditional paths, including command conventions and variant selection.
- Exercise each changed mode in an independent fresh context with a realistic task and bounded authority; inspect tool results for missing context, unrelated sections, repeated reads, truncation and task correctness.
- Report structural results separately from live observations; claim no token savings without a comparable baseline and no consistency from single trials.

## Reading Routes

| Request | Required Context | Conditional Context |
| --- | --- | --- |
| Author a definition | Entry point; Author; canon prerequisites; terms, criteria, scope and checks; selected Author configuration; design flow and walk rules | Bound construct units, affected consumers and selected checks; Audit before committing a definition |
| Audit definitions | Entry point; Audit; canon prerequisites and project selection; terms, criteria, scope and checks; selected Audit configuration; walk rules; report context | Selected canon units and checks, prior residual, workflow report delivery or standalone layout |
| Answer one canon question | Entry point; Audit; canon prerequisites and terms; selected project homes | The requested entry and its prerequisites; no full walk, report ledger or checks |
| Review an integration | Entry point; Review; common command conventions; selected Review configuration; coverage guide and report template | Affected branch products, source sections, validation operations and dependency closure |
| Revise the skill | Entry point; Revise; complete shared/local guidelines; command conventions; selected Revise configuration | Changed homes and consumers, selected check operations, planning and delivery within authority |

Every command route reaches shared conventions before operation specifications. Selecting workflow-server also reaches its bounded command conventions, including Locations and Invocation Sources. Canon checks have their own common section because Review and Revise do not invariably need those checks. Report bands, severity, row fields and coverage occupy one parent section; workflow report delivery and standalone layout are separate choices.

## Structure and Regression

- All 823 local links and heading fragments pass across 49 Markdown files in Workflow Canon, Work Planner and their shared guidelines.
- The four modes have prerequisites and rules sections. Rules precede Dependencies in the entry point, and all local targets resolve after removing the separate Work Designer folder.
- Workflow Canon's 36 edit-guard tests pass. Its three scripts, three test files and hook registration retain their original bytes.
- Work Planner's 294 tests pass, including shared mode-summary and linked-result delivery checks. The first run rejected two summary phrases; the corrected descriptions pass the repeated suite.
- The copied integration-review template, coverage guide, planning guide and Review procedure preserve their content and authority at their new locations.
- Corpus lookups specify their working directory; guard commands have one operation home and explicit corpus selection. The session census supplies its planning root, verified against the installed command interface. Commit guidance stages every changed home and consumer, including removed paths.
- Staged whitespace validation passes. The final skill tree contains no references to the retired Work Designer skill.

## Metadata

Repository frontmatter validation passes: the name matches the directory, the description is 441 characters and names all four modes, and the hook resolves to its retained script.

The installed generic skill validator rejects the existing `hooks` field. The repository's shared skill guidelines explicitly support this field. This optional validator remains a compatibility limitation; its rejection is preserved, and the hook is validated against the repository contract and existing regression suite.

## Live Results

Trials use fresh independent agents with only the skill, realistic task, raw inputs and authority limits. Nova is a disposable project with two documented criteria, a producer, a consumer and a sibling. Its base checker succeeds; the candidate renames only the producer output and breaks the consumer. Revision trials use isolated worktrees. The Review trial is intentionally limited to planning against PR metadata captured before this consolidation.

| Trial | Task Result | Context Observation |
| --- | --- | --- |
| Author | Draft changes both producer and consumer; base and complete scratch draft pass, producer-only negative control fails; fixture remains clean | Shared conventions arrive once before operation specs; selected canon context and complete design-flow/walk guides arrive; no truncated output |
| Audit | Finds the closure-only stale consumer, verifies base/head attribution, covers the prior residual and preserves the fixture | Shared conventions arrive once; canon context, report sections and standalone layout arrive; no truncated output |
| Review | Selects workspace coverage, excludes broad engine/corpus/container suites and reports the two defects still present at the captured historical head | Shared and variant conventions arrive; a broad range also loads unrelated Author configuration; two truncated outputs and a repeated planning section. Some repeated source text is legitimate inspection of the historical review subject |
| Revise, first trial | Makes only the requested template-heading edit; 36 hook tests pass; reports the initial summary-test and generic-validator failures | Both complete guideline files arrive; project conventions precede project check specs; one truncated output; coverage and branch guidance exceed the narrow edit's needs |
| Revise, repeat | Makes only the same heading edit; 3 summary tests and 36 hook tests pass; local links and project frontmatter pass | Shared and project conventions arrive once before their operation specs; both whole guideline files arrive; one truncated output and unnecessary coverage/branch guidance remain |
| Canon question | Correctly applies the unused-output exclusion and stops without an audit | Bounded canon prerequisites, terms, selection and identity reads; no full canon walk or report layout; no truncated output |
| Ambiguous selection | Identifies both matching Nova variants and reports the required choice without starting a conformance audit | Reads the available identities; does not enter either variant's mode configuration or criteria; no truncated output |

The initial Author/Audit and first Revise runs started before the two summary-only corrections. The Review run started after those corrections. Final documentation also clarifies guard exit-status ownership and removes duplicate guard invocation text. Snapshot hashes distinguish these source states; unchanged operation and mode reads remain comparable. The first Revise fixture deliberately retains its original baseline so its observed failures are not erased.

## Limits

The live evidence is Partial. Correct task results do not establish strict reading-boundary compliance: Review and both Revise trials still expose unrelated or repeated content and truncation. The Audit result also calls both criteria walked; its clean manual Responsibility check has no recorded positive calibration, despite the walk guide's hand-check requirement. That coverage claim is not accepted as proof of complete behavioral conformance.

No comparable token baseline was run, and these observations support no token-savings claim. The complete workflow-server Author/Audit canon and live host-hook registration were not exercised end to end; their routes were inspected and the existing hook regression suite ran. Review planning uses captured metadata and preserved evidence, so its verdict applies to that historical head rather than the final consolidation commit. Remote CI and live services are outside these fixtures.
