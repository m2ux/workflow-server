# F23 validation

Candidate: [07956cf6cd0e5dc130eeb0230e4ee8940a6894fb](https://github.com/m2ux/workflow-server/commit/07956cf6cd0e5dc130eeb0230e4ee8940a6894fb), target workspace. All fixtures use synthetic issue records and temporary local Git repositories; no private inputs or remote service calls are required.

## T1

Result: pass. From skills/work-planner/test, run:

    python3 -m unittest -v test_deliver.ProducerOutputs test_board.RowPrerequisites

The [focused log](regressions.txt) records 24 passing checks at c67ad13692b278dbdef431ac8c295dac8771907e. The same focused checks pass at the candidate head within the 66-check [review result](review-checks.txt). The direct-commit parser retains engineering while product PRs retain their product branch. A pushed engineering commit satisfies a consumer whose product base lacks it. A rogue consumer engineering ref cannot shadow the canonical remote branch. Missing commits, local-only engineering commits, absent remote engineering refs and product-only producer merges remain blocked. A mixed row requires both engineering and product outputs. Foreign direct commits without checkout ancestry remain unverified.

Before the correction, the updated delivery module ran 115 checks with five failures: engineering availability, rogue-ref shadowing, missing remote engineering, unpublished engineering accepted through product ancestry, and mixed-output resolution. After the correction, all 115 delivery checks passed.

## T2

Result: pass at runtime baseline [c67ad13692b278dbdef431ac8c295dac8771907e](https://github.com/m2ux/workflow-server/commit/c67ad13692b278dbdef431ac8c295dac8771907e). From that checkout, run:

    python3 -m unittest discover -s skills/work-planner/test

The [suite log](suite.txt) records 1204 tests in 51.971 seconds, passing with one skip. The skipped check is the opt-in live Development-link exercise, which requires a named live issue and draft pull request. The suite includes board, delivery, dispatch, sync, document contracts, linked guidance and catalogue checks. The exact candidate diff passes git diff --check.

Connected-source review follows deliver.survey through Board.outputs_available, Board.delivered_outputs and Outputs.read/consumer, with Board.integrated retaining the separate foreign-PR route. The reader reuses sync.RECORDS_BRANCH; direct links use origin/engineering and product links preserve their consumer-base ancestry. Producer Outputs, parser comments and reader comments state those rules. The source comments and Producer Outputs state the branch rules. The review correction below accounts for the dispatch module guidance. The configured planning-records branch and Task Delivery remain the owning declarations.

## T3

Result: pass at 07956cf6cd0e5dc130eeb0230e4ee8940a6894fb. A connected-code review found that the dispatch module docstring still described every output as requiring ancestry on the consumer epic base. Its guidance now states that direct commits reach the remote planning-records branch and product outputs reach the consumer product base, or the long-lived branch while no base exists.

From skills/work-planner/test, run:

    python3 -m unittest -v test_deliver.ProducerOutputs test_board.RowPrerequisites test_documents test_command_contracts

The [review log](review-checks.txt) records all 66 checks passing in 2.931 seconds. deliver.py --help exits successfully; the existing argparse configuration renders option help without the module docstring. AST comparison after removing the module docstring proves executable statements match c67ad13692b278dbdef431ac8c295dac8771907e exactly. Every other source file matches that baseline. The candidate diff passes git diff --check. The full 1204-test suite evidence remains attributed to the runtime baseline; no full-suite rerun is claimed for this prose-only correction.

## Limits

The automated checks use local Git and fixture tracker records. The optional live Development-link test was not run. No model evaluation or external publication evaluation is required. Exact-head hot-fix review and merge readiness are separate delivery gates.
