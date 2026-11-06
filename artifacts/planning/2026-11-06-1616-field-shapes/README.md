# Field Shapes — November 2026

> Authoring review · Created 2026-11-06

## Executive Summary

Review every named Work Planner field against its represented value. A field describes a scalar, reference, document, collection or composite data object and its valid state. A policy, action, decision algorithm or refusal is not an input merely because it has a heading.

Place a rule used by one capability inline at that capability. Keep genuinely shared policy in its subject module under Guidance, with links from its consumers. Preserve templates, executable invocations, evidence gates, ordering, failure handling and existing data constraints. Specify Lane command outputs from the actual script, including nullability, findings and exit behavior. Update authoring guidance and verify affected reading paths. No runtime algorithm or deferred recovery feature is in scope.

## Review and Validation

Inventory all named Fields and their incoming links; account for whole-section schema consumers as well as direct references. Record every field's disposition and the destinations of relocated rules. Check links and role targets, exact invocation/template preservation, documented-command behavior, actual Lane output examples and the installed model. Run the existing planner suite and fresh independent reading checks for affected paths. Publish source and evidence on their existing branches and retain the draft PR.

## Links

| Resource | Link |
| --- | --- |
| Style PR | https://github.com/m2ux/workflow-server/pull/1641 |

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Field inventory](fields-before.json) | Complete pre-edit fields and incoming references |
| [Field ledger](field-ledger.json) | Disposition and source contract for all 564 original named fields |
| [New fields](new-fields.json) | Actual shapes of the six newly named fields |
| [Preservation](preservation.json) | Invocation/template identity and runtime-script preservation |
| [Verification script](verify.py) | Reproducible comparison with the pre-sweep commit |
| [Reading checks](reading-checks.md) | Four fresh readers, actual local Lane results and inherited evidence limits |
| [Installed model](model.log) | All Markdown checked against declarations and role contracts |
| [Shared tests](shared-tests.log) | Shared checker regression result |
| [Dispositions](dispositions.json) | Reviewed field destination and rationale map used by verification |
| [Planner tests](planner-tests.log) | Complete planner regression result |
| [Section comparison](section-comparison.log) | Intentional section changes against the baseline |
| [Validation](validation.md) | Exact source, preserved behavior, tests and limits |

## Result

The field-shape sweep is committed and pushed as `c05a6a1818495506695592729273db9d8a14aa19`. All 564 original named fields are accounted for; 19 single-use rules are inline and 23 shared policies have one Guidance home. Data fields describe actual values and result shapes, including three concrete Lane JSON contracts. Runtime scripts, every invocation block and all literal templates are preserved. The planner suite runs 947 tests with one opt-in skip, 280 shared tests pass, and the installed model reports zero findings. Independent reads recover relocated rules and reproduce Lane outputs; inherited disclosure and policy ambiguities remain explicit in the reading record. PR #1641 stays draft.
