# Field Shapes Validation

Source: `c05a6a1818495506695592729273db9d8a14aa19`. Baseline: `d22b9a1919f1ba8bfe60017e420b7d9527519dd0`.

## Scope and Disposition

All 564 original named fields across 36 files have a recorded disposition. The resulting corpus has 516 named fields. The ledger identifies 19 single-use rule entries inlined at their owners, 23 shared policy entries under subject-owned Guidance, explicit shape clarifications, consolidated value/document constraints, one removed implied input and the distinct Lane result contracts. Six newly named fields are recorded separately. The three older unheaded verification definitions are consolidated into named Criterion, Instrument and Revision definitions.

The sweep covers all 58 Work Planner Markdown documents through inventory, incoming references, schema consumers and targeted long/mixed/action-language review. A direct-reference count of zero does not establish unused content: kind templates, whole Fields sections and shared-family constraints also consume schema. Every field is a value or a data/document shape, with valid-state constraints kept alongside it; behavioral rules are not modeled as caller-supplied values.

## Concrete Contracts

Lane reads provide one flat JSON object with assignments/problems; unit validation adds lane; admission adds admitted. Null lane alone is inconclusive. The assignments map is body-wide, findings from unrelated rows remain visible and can coexist with admitted true, and any nonempty problems array yields exit 1. Argument/input failures may precede JSON output. Actual inline field examples are executed through the enriched documented commands, including valid and malformed unlaned cases.

Start Evidence is the actual input record; its capacity/order/refusal rules belong to Check Dispatch Start. Queue Status Scope has no supplying parameter and is removed as an implied input; the command's explicit jurisdiction rule remains. Body and diagram constraints describe their actual document members. Labels and theme-board title shapes have concrete value homes. Auto-close confirmation, criteria readiness/ticking, debt, recommendation and review-repair actions sit at their owning capabilities. Shared policies retain their subject anchors under Guidance.

## Preservation

The reproducible comparison finds 117 byte-identical HTML invocation blocks, including the authoring example, and nine byte-identical literal Template fields. All 116 command specifications remain. No runtime script changes. Original field conditions are retained, consolidated or relocated with a ledger destination; no compatibility headings or aliases remain. Final whitespace checks pass. Section comparison exits 1 for the intentional additions/removals/moves and records those classifications in section-comparison.log; it is not treated as an unchanged-section claim.

## Verification

- Full Work Planner suite: 947 tests run, 946 passed and one opt-in check skipped.
- Shared checker suite: 280 passed.
- Installed model: 58 Markdown files, zero findings.
- Documented command tests include executable examples for all three Lane outputs and null/finding discrimination.
- Prerequisite checks include shared Guidance references and reject missing or surplus declared dependencies; two body prerequisites whose only consumers moved are removed.
- Four fresh readers exercise Lane, Advance, Understand and delivery-debt continuations, including an independent repeat and ten actual Lane command executions. Task outcomes and inherited disclosure/policy findings are separate in reading-checks.md.

Semantic field classification is an authoring review, not a claim that the structural checker proves prose semantics. No live tracker or GitNexus correctness, complete progressive-disclosure conformance or current integration-agent-review approval is claimed. The existing integration PR remains draft. Inherited prerequisite cleanup has an E02 home; other recorded policy ambiguities need a separate scope decision.

## Reproduction

From the product checkout, run `python3 <this-record>/verify.py` through the project's sandbox helper. It reads the saved pre-sweep inventory and dispositions from this record, checks the working corpus and baseline Git revision, and writes fresh ledger/preservation outputs under `/tmp`. Runtime suites and exact commands are retained in their logs.

The commands used were:

| Working directory | Command |
| --- | --- |
| Product checkout / skills/work-planner | `/home/mike1/projects/dev/md-composer/scripts/sbx python3 -m unittest discover -s test` |
| Product checkout | `/home/mike1/projects/dev/md-composer/scripts/sbx python3 -m unittest discover -s skills/test -p test_check_skill_files.py` |
| Product checkout | `/home/mike1/projects/dev/md-composer/scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner` |
| Product checkout | `/home/mike1/projects/dev/md-composer/scripts/sbx python3 skills/scripts/check_skill_files.py --compare d22b9a1919f1ba8bfe60017e420b7d9527519dd0 HEAD skills/work-planner` |

The permission profile required escalation for sandbox namespace creation and writes to this retained product/engineering worktree. These were execution-environment permissions, not application or tracker writes.
