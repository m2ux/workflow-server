# WP-02 Workflow Retrospective

## Process Summary

| Phase | Duration | Notes |
|-------|----------|-------|
| Design philosophy | ~5 min | Problem well-classified, skip-optional path correct |
| Codebase comprehension | ~10 min | Reading 5 schema files + cross-referencing. Key insight: condition evaluator uses `===` |
| Plan prepare | ~15 min | 13 tasks mapped to 15 findings. Test plan with 12 case groups |
| Assumptions review | ~5 min | 4 of 5 assumptions resolved internally. 1 required stakeholder input |
| Implementation | ~20 min | All 13 tasks executed. Straightforward schema edits |
| Post-impl review | ~10 min | Change block index, code review, test suite review |
| Strategic review | ~5 min | No scope issues |
| Completion | ~5 min | Artifacts and PR updated |

**Total:** ~75 min agentic time

## What Went Well

1. **Skip-optional path was correct.** The problem was well-defined with known fixes; no spike or prototyping needed.
2. **Assumption identification was thorough.** Surfacing A-001 early and deferring to stakeholder prevented rework.
3. **Cross-schema comprehension artifact** was valuable for understanding the `$ref` graph and `additionalProperties` policy patterns before making changes.
4. **All changes were additive or constraint-tightening** — no structural refactoring was needed, keeping the diff small and reviewable.

## What Could Improve

1. **Artifact numbering convention mismatch.** The README referenced `01-*` and `05-*` prefixes but the actual workflow used `02-*` and `06-*` prefixes. The README was updated but the initial mismatch caused minor confusion.
2. **JSON Schema-only test gaps.** The test suite validates Zod schemas but not JSON Schema files directly. A JSON Schema validation test (using ajv or similar) would provide direct coverage for these changes.
3. **Sub-module commit workflow** requires committing in the `.engineering` submodule before the parent repo. This two-step process is error-prone when forgotten.

## Process Recommendations

1. **For schema-only WPs:** Consider adding a JSON Schema validator test that loads each `.schema.json` file and validates sample documents. This would catch issues like QC-001 (missing `activities`) at test time rather than relying on audits.
2. **For `additionalProperties` changes:** A migration check script that validates existing TOON files against the updated schemas would catch non-conforming documents before they cause validation failures.
3. **Assumption workflow:** The pattern of identifying assumptions early, resolving internal ones via code investigation, and deferring stakeholder ones via issue comments worked well. Worth standardizing.
