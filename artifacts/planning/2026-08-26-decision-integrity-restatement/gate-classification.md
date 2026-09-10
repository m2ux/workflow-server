# Gate classification register

Every soft checkpoint in the corpus, with the reason its softness is legitimate or the reason it is
hard. A gate is soft when it declares `defaultOption` and `autoAdvanceMs`; that pair is the whole of
softness, and a gate declaring neither waits for an explicit selection.

The test applied is the one the review-mode gating guard already states: a default that **records** a
judgement the run can stand behind is legitimate softness; a default that **creates, publishes,
pushes, approves, attests, or admits work into a later stage** is a decision no agent takes on the
user's behalf, so that gate is hard. Where the gate's subject is content the resolving dispatch itself
authored, the same test applies to the author of the work under review.

## Hardened — the default would authorise

| Gate | Workflow · activity | What the default did |
|---|---|---|
| `file-index-table` | work-package · post-impl-review | Certified the provenance attestation covering every block of the diff the same activity had just reviewed — 42 blocks on the run that surfaced it — with no confirming reader |
| `scope-confirmed#{scope_round}` | workflow-authoring · scope-and-draft | Admitted the scope manifest the preceding step wrote into the drafting loop |
| `issue-review` | work-package · start-work-package | Created a tracker issue from a draft the same activity composed |
| `classification-and-path-confirmed` | work-package · design-philosophy | Selected the workflow path from a classification the preceding step produced, skipping activities |
| `review-outcome` | work-package · submit-for-review | Declared an external pull-request review approved |
| `post-summary-review` | work-package · assumptions-review | Posted a resolution summary the run authored to an external tracker |
| `findings-delivery` | work-package · strategic-review | Decided which findings a posted review carries. It also declared the retired blocking directive alongside the pair, so its two softness signals disagreed |
| `verification-result` | prism-update · verify | Admitted the update to submission. It declared the directive with no pair, and its option offered a thirty-second proceed that nothing performed |

## Soft — the default records

| Gate | Workflow · activity | Why softness holds |
|---|---|---|
| `comprehension-sufficient` | work-package · codebase-comprehension | Accepts the remaining open questions and clears the comprehension loop; records a sufficiency judgement and mutates nothing outside the run |
| `elicitation-complete` | work-package · requirements-elicitation | Closes elicitation once every question domain is covered; records completion |
| `context-scope-declaration` | work-package · research | Fires only where run evidence could not derive the scope, and defaults to the declared repo-only fallback; records a provenance value |
| `research-convergence` | work-package · research | Records that research has converged; carries no effect |
| `ticket-completeness` | work-package · design-philosophy | Records that the ticket's gaps are understood and the run proceeds with them; carries no effect |
| `approach-confirmed` | work-package · plan-prepare | Records agreement with the prepared approach; carries no effect, and the plan is re-presented at the commit gate |
| `block-interview#{current_block_index}` | work-package · post-impl-review | Records the issue found in one already-flagged block; the flagging decision is taken at the now-hard `file-index-table` |
| `analysis-reviewed` | plain-language · source-analysis | Records acceptance of the source analysis; carries no effect |
| `draft-reviewed` | plain-language · draft | Records acceptance of the draft; carries no effect, and evaluation follows regardless |
| `evaluation-reviewed` | plain-language · evaluate | Defaults to the non-approving option and sets the revision flag, so an unattended run revises rather than accepts. This inverted default is the pattern for a gate that must stay soft |
| `scope-confirmed` | midnight-system-review · scope-intake | Records scope acceptance before analysis; carries no effect |
| `plan-confirmed` | meta · plan-and-execute pattern | Records plan acceptance in a reusable pattern; carries no effect |

## Soft, and reaching no headless run

Two work-package gates default to creating something external, which the test would make hard. Both are
conditioned so that only a create run reaches them, and a create run is not headless — `headless_mode`
becomes true where review mode is settled. Their subject is also not the resolving dispatch's own
work: each asks whether to perform an external action, not whether the run's own output is sound. They
stay soft, and this row is the record of why.

| Gate | Workflow · activity | Reason |
|---|---|---|
| `github-issue-missing` | work-package · start-work-package | Default mirrors a Jira ticket into a GitHub issue. Gated `is_review_mode != true` |
| `pr-creation` | work-package · start-work-package | Default proceeds with branch and pull-request creation. Gated `is_review_mode != true` |

## Left to the deprecated tree

`workflow-design` carries eleven soft gates, four of them the self-attestations this epic named:
`spec-confirmed`, `impact-and-preservation-confirmed`, `scope-and-structure-confirmed` and
`batch-review-attested`, alongside `design-context`, `patterns-confirmed`, `draft-attestation`,
`file-approach-confirmed`, `file-review`, `scope-verified` and `validation-passed`. That workflow's own
README records that the defects its replacement exists to fix are present in it and are not being
repaired — including the two commit-gate auto-advances that select *proceed to commit* while files are
failing schema validation. Its presentation licence is collapsed with the others so the corpus holds
one presentation rule; its gates are left to retire with the tree.
