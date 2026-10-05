# Option coverage

Roster walk on the current `i10/workflows` tree. Exit 1. 104 of 296 declared options (35%) over 16 workflows, 88 activities entered, 79 checkpoints short.

45 of those checkpoints are already named in `walks/option-coverage.json`. 34 are short and have no entry there:

- ambiguous-name-case/rename-ambiguous-symbol.accept-edit-list
- assumptions-review/settle-assumptions.interview.batch-gate
- assumptions-review/settle-assumptions.interview.interview.decision#{assumptions_review_settle_assumptions_interview_current_assumption.id}
- complete/deferred-item-raise#{current_deferred_item.id}
- design-philosophy/classification-confirmed
- design-philosophy/workflow-path-selected
- gate-exit/stop-here
- lean-coding-audit/audit-findings-confirmed
- lean-coding-audit/safety-floor-cleared
- low-rating-case/gate-low-rated-symbol.accept-blast-radius
- multi-verb-case/gate-multi-verb-route.accept-consumer-surface
- negative-case/gate-absent-route.accept-consumer-surface
- negative-case/gate-unresolved-symbol.accept-blast-radius
- negative-case/rename-absent-symbol.accept-edit-list
- pin-checkouts/readying.accept-discard
- plan-prepare/approach-confirmed
- plan-prepare/research-convergence
- positive-case/gate-held-route.accept-consumer-surface
- positive-case/gate-resolved-symbol.accept-blast-radius
- positive-case/rename-held-symbol.accept-edit-list
- post-impl-review/block-interview#{current_block_index}
- post-impl-review/file-index-table
- post-impl-review/local-validation-permission
- post-impl-review/rationale-attestation
- prism-decision/full-prism-decision
- requirements-elicitation/domain-question#{current_domain}
- requirements-elicitation/elicitation-complete
- requirements-elicitation/stakeholder-discussion-held
- start-work-package/issue-review
- start-work-package/issue-type-selection
- start-work-package/issue-verification
- start-work-package/platform-selection
- start-work-package/pr-creation
- submit-for-review/review-summary-approval

The assertion body (which of `unexpected`, walk errors, stale, now-uncovered, or now-covered failed) was not retained. These 34 are the short checkpoints the exemption list does not name.
