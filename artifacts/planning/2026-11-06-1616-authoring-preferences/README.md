# Work Planner Authoring Preferences — November 2026

> Guideline consolidation · Created 2026-11-06

## Executive Summary

The user requests durable authoring preferences from this conversation in Work Planner's guidelines, excluding transient corrections that do not help create canonical files. The reviewed starting head is `7beaf46c621bae84872573adab8c4e1eecc2254d`.

Keep the latest settled preferences, strengthen missing authoring instructions and consolidate repeated rules at their owning scope. Update the matching rule registry. This changes authoring guidance alone; it does not implement delivery behavior, the E02 audit, E04 recovery fixes or future performed-operation verification.

## Preference Dispositions

| Durable preference | Owning guideline and disposition |
| --- | --- |
| One subject's state and operations have an artifact home; SOLID boundaries | Artifacts / One Shape and Prose API: small public capabilities, one reason to change and consistent interface contracts. Keep kind extension in Common File and A New Kind. |
| Purpose, linked definitions and steps each state their own information | Procedure / Openings: purpose once, actions in steps, linked shapes at Fields. Remove duplicate opening rules from family-specific guidance. |
| Contextual I/O is complete and derivable; separate inventories duplicate it | Prose / Contextual Contracts: field links at actual use, no parallel inventories, no repeated annotated parameters, and an explicit completeness review. |
| Nested calls carry selections and continuation, not copied contracts | Same Contextual Contracts owner; remove the duplicate Artifact Operation Inputs rule and link to contract/routing owners from Prose API. |
| Input/output/transformation roles use symbolic link titles, including called procedures/protocols | Retain the Link Roles citation to rules.md, which remains the single semantic definition. Superseded arrows and visible word tags stay excluded. |
| Prose provides concrete results | Move Provided Output from Artifacts to Procedure / Provided Results so the instruction covers every procedure. |
| Child headings refine the parent without repeating its title | Titles / Action Titles; remove the narrower duplicate from Numbered Steps. |
| Multiple step items all use bullets; one item uses plain text | Procedure / Separate Actions already captures the settled preference. |
| Commands own invocation grain; substantive operations orchestrate | Operations / One Command and One Home remain. Put forwarding/single-caller composition at the Artifact Operation Scope owner alone. |
| Commands precede Fields | Existing mode, protocol and artifact section layouts remain authoritative. |
| Imperative command preamble links outputs and recipient; lists follow the box | Operations / Spec Layout retains the latest layout. |
| Bold linked placeholders, necessary quoting and readable continuations | Parameter Placeholders and Spec Layout retain the rules; make the copyable HTML placeholder specimen use encoded angle brackets and remove the redundant redirection-encoding instruction. |
| Value examples live inline with their field description as eg plus code spans | Concrete Examples already captures same-line placement, compact JSON and structural-fence exceptions. |
| Checkout context belongs to an operation or command input | Execution retains the scoped canonical contract. |
| Fields state shapes/invariants; transformations belong to operations | Artifacts / No Procedure in Fields distinguishes valid conditional constraints from evidence-to-decision or execution behavior. |

## Exclusions

One-file demos and preview/push sequencing were local review choices. Merge conflicts, particular row numbers/dependencies, issue updates, reservation dates and broken examples were task-specific fixes. Lane table syntax, automatic dispatch and retained/recovery behavior belong to their artifact or delivery owners, not general authoring guidance. The proposed arrow treatments were superseded by link-title roles. Future operation verification is not declared implemented. Existing fidelity/revision obligations remain; no new corpus-wide audit is imposed for creating one file.

## Validation Plan

Check the guideline/rule registry, section/link validity and no stale duplicate rules. Run the installed model and existing document checks. Confirm that operational Markdown, commands, Fields, templates, runtime rules and execution paths are untouched. This documentation-only consolidation needs no new tests or live workflow. Commit and push the existing style branch.

## Links

| Resource | Link |
| --- | --- |
| Style PR | https://github.com/m2ux/workflow-server/pull/1641 |

## Validation

Source: `4a23a4f50064c37b8ac45b842b8aa0f40c0a3937`. Only guidelines.md and rules.json change. Procedure openings and concrete-result wording have shared owners; nested contracts and forwarding composition lose duplicate rules. Existing latest command/list/field-example/checkout rules remain. Field boundaries preserve named Commands ownership, and the encoded placeholder specimen is copyable into the enriched HTML style. Two retired rule keys are removed and two shared Procedure keys registered; the model reports no unregistered or ambiguous rule.

The installed checker covers 58 Markdown files with zero findings. All fourteen existing document checks pass, and whitespace validation passes. Operational Markdown, invocation bytes, templates, runtime rules and execution paths are untouched, so this consolidation makes no live-workflow or full-corpus SOLID-compliance claim. E02/E04 implementation scope is not changed. The preference table and exclusions above are the durable-versus-transient disposition record.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Source](source.json) | Exact baseline/head and two-file scope |
| [changes.json](changes.json) | Guideline consolidation inventory or existing validation evidence |
| [document-tests.log](document-tests.log) | Guideline consolidation inventory or existing validation evidence |
| [model.log](model.log) | Guideline consolidation inventory or existing validation evidence |
