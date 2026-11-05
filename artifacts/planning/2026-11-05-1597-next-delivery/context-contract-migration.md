# Contextual Contract Links

The approved example uses Markdown link titles: input and output roles are attached to Field links at their actual uses. Every linked callable operation carries the operation title. Output statements use Provide. Separate Inputs/Outputs declarations are absent.

## Ownership

- rules.md defines the three role meanings once in a small Link Roles section, reached through the existing entry-point rule read.
- guidelines.md links that definition and owns authoring requirements, complete contextual contract coverage and the single-item/multiple-item step layout.
- The declared shared checker validates role targets and contextual operation links; source readers retain their independent interface, prerequisite, command reach and checkout checks.
- Contract extraction for verification of a performed operation remains a future feature. This change supplies the notation and validates the authored skill.

## Migration

- Inventory all operations before editing. The starting artifact inventory contains 237 operations in 35 files, 757 declared input references and 357 declared output references; declarations are evidence to reconcile, not a complete semantic oracle.
- Link inputs at the step that consumes them and outputs at the step that provides them. Inspect commands, calls, conditions and result handling for implicit values the declarations missed. Add explicit Provide steps and owning Fields where needed.
- Tag links to actual callable operations throughout the skill, including mode/protocol entry points and local callable procedures; ordinary document and Field references keep their roles.
- Preserve command/template payloads, prerequisites, operation identities, conditions, caller responsibility, lane schema and existing meaningful assertions. Update readers and fixtures with the authored model, with no obsolete declaration path or model bypass.
- The correction stays on the open E01 integration branch. Withdraw ready/In Review during implementation and publish fresh exact-head evidence before handoff.

## Required Verification

- Enumerate expected inputs/outputs independently from the resulting annotations, using the original inventory and semantic review of each operation's actual steps, commands and calls. Every expected role must be present in prose and resolve to its Field; an implied value or command-only link is insufficient.
- Verify all linked operation targets and titles. Keep literal command/template content opaque to role interpretation.
- Run the complete Work Planner and affected shared-checker suites, ordinary installed check and payload/prerequisite preservation audits. Review changed files for DRY, SOLID and stale descriptions.
- Exercise changed reading routes with fresh independent readers and retain exact observations and evidence limits. Refresh the measured overview and integration review for the final head.

## Progress

- [x] Publish and approve the one-file notation example.
- [x] Inventory the starting artifact declarations and identify the rule home.
- [x] Migrate prose, model, readers and guidelines together.
- [x] Verify semantic coverage, regressions and independent reading observations, preserving the Partial disclosure limits.
- [x] Commit and push the product correction; publish exact-head integration review and handoff evidence.

## Current Evidence

Commit `00ec0b9dd516cf6031d44c1ac2184ca95d1e0a01` carries 237 operations, 817 retained input obligations and 357 output obligations, 651 tagged callable links and 204 byte-preserved HTML invocations. The final 115-file manifest matches the validated source. Work Planner runs 934 tests (933 pass, one opt-in skip); shared checker runs 262 passing tests; the ordinary installed check reports 58 files and zero findings. See [coverage audit](context-contract-audit.json) and [reading review](context-reading-review.md).
