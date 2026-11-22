# F23 validation

Candidate: [c67ad13692b278dbdef431ac8c295dac8771907e](https://github.com/m2ux/workflow-server/commit/c67ad13692b278dbdef431ac8c295dac8771907e), target workspace. All fixtures use synthetic issue records and temporary local Git repositories; no private inputs or remote service calls are required.

## T1

Result: pass. From skills/work-planner/test, run:

    python3 -m unittest -v test_deliver.ProducerOutputs test_board.RowPrerequisites

The [focused log](regressions.txt) records 24 passing checks. The direct-commit parser retains engineering while product PRs retain their product branch. A pushed engineering commit satisfies a consumer whose product base lacks it. A rogue consumer engineering ref cannot shadow the canonical remote branch. Missing commits, local-only engineering commits, absent remote engineering refs and product-only producer merges remain blocked. A mixed row requires both engineering and product outputs. Foreign direct commits without checkout ancestry remain unverified.

Before the correction, the updated delivery module ran 115 checks with five failures: engineering availability, rogue-ref shadowing, missing remote engineering, unpublished engineering accepted through product ancestry, and mixed-output resolution. After the correction, all 115 delivery checks passed.

## T2

Result: pass. From the candidate checkout, run:

    python3 -m unittest discover -s skills/work-planner/test

The [suite log](suite.txt) records 1204 tests in 51.971 seconds, passing with one skip. The skipped check is the opt-in live Development-link exercise, which requires a named live issue and draft pull request. The suite includes board, delivery, dispatch, sync, document contracts, linked guidance and catalogue checks. The exact candidate diff passes git diff --check.

Connected-source review follows deliver.survey through Board.outputs_available, Board.delivered_outputs and Outputs.read/consumer, with Board.integrated retaining the separate foreign-PR route. The reader reuses sync.RECORDS_BRANCH; direct links use origin/engineering and product links preserve their consumer-base ancestry. Producer Outputs, parser comments and reader comments state those rules. A search of the affected skill finds no surviving branch-less direct-commit or all-consumer-base claim. The configured planning-records branch and Task Delivery remain the owning declarations.

## Limits

The automated checks use local Git and fixture tracker records. The optional live Development-link test was not run. No model evaluation or external publication evaluation is required. Exact-head hot-fix review and merge readiness are separate delivery gates.
