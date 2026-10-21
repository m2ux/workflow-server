# Work Package Techniques

These techniques support the work package from requirements and planning through implementation, review, and close-out. Shared contracts provide the context and rules used across related techniques.

| Name | Description |
|------|-------------|
| [Shared contract](TECHNIQUE.md) | Inputs and rules inherited by the workflow techniques |
| [analyse-challenge](analyse-challenge/TECHNIQUE.md) | Adversarial challenge of a concern set and the fold of its findings back into that set — the shared contract both techniques work over. |
| [challenge](analyse-challenge/challenge.md) | Adversarial challenge perspectives over the current concern set for the combine step. |
| [combine](analyse-challenge/combine.md) | Challenge findings folded into the concern set, with the convergence and residue flags that fold implies. |
| [apply-review-fixes](apply-review-fixes.md) | User-selected code-review findings and/or test improvements implemented and committed as one atomic step. |
| [assess-prism-value](assess-prism-value.md) | A recommendation, with its reason, on whether a change warrants the full prism pipeline or the single inline structural pass. |
| [assess-ticket-completeness](assess-ticket-completeness.md) | Tracker-ticket quality across problem, goal, scope, acceptance criteria, and user stories — gaps and optional refactor. |
| [codebase-comprehension](codebase-comprehension/TECHNIQUE.md) | Progressive codebase comprehension over a cumulative corpus artifact and a session-local log. |
| [deep-dive](codebase-comprehension/deep-dive.md) | Targeted investigation of a selected codebase area, recorded in the comprehension log with its settled outcomes promoted to the corpus artifact. |
| [revise-questions](codebase-comprehension/revise-questions.md) | The authoritative open questions on the comprehension log. |
| [survey](codebase-comprehension/survey.md) | Initial mental model of the codebase area — architecture, abstractions, design rationale, and domain mapping. |
| [conduct-retrospective](conduct-retrospective/TECHNIQUE.md) | Conduct workflow retrospective to capture lessons learned and prepare for next work package |
| [retrospective](conduct-retrospective/retrospective.md) | Close-out retrospective — session history, friction (user-message and mechanical), lean session-trace, and work-package status (implementation merge or review-mode audit). |
| [select-next](conduct-retrospective/select-next.md) | Identify the next work package and prepare context for the transition. |
| [create-adr](create-adr.md) | An Architecture Decision Record for the work package, numbered next in the record directory and opening at Proposed. |
| [create-issue](create-issue/TECHNIQUE.md) | Shared contract for raising a tracker issue: what the issue is about, what kind of change it records, and the identity the run carries forward once it exists. |
| [create-github](create-issue/create-github.md) | A GitHub issue raised for the work package, labelled for the kind of change it records and verified to exist. |
| [create-jira](create-issue/create-jira.md) | A Jira issue raised for the work package in its project, typed for the kind of change it records. |
| [create-test-plan](create-test-plan.md) | Create test strategy and test plan with cases and acceptance criteria |
| [dco-provenance](dco-provenance/TECHNIQUE.md) | DCO compliance and AI provenance tracking for the work package — the record of which assistant did what, and the human certification that closes it. |
| [append-task-row](dco-provenance/append-task-row.md) | Per-task row in `provenance-log.md` (canonical header on first write). |
| [record-attestation](dco-provenance/record-attestation.md) | Human DCO attestation recorded once per work package in `provenance-log.md`. |
| [design-philosophy](design-philosophy/TECHNIQUE.md) | Structured design framework — problem classification, complexity, and workflow-path choice. |
| [classify](design-philosophy/classify.md) | Classify the problem as specific (cause known/unknown) or inventive (improvement/prevention) and assess its complexity. |
| [define](design-philosophy/define.md) | Define a clear problem statement with system understanding, impact, success criteria, and constraints. |
| [determine-path](design-philosophy/determine-path.md) | The rationale behind the selected workflow path, and the comprehension pass every path carries. |
| [document](design-philosophy/document.md) | Design philosophy artifact — problem statement, classification, complexity, and workflow-path rationale. |
| [finalize-documentation](finalize-documentation/TECHNIQUE.md) | The documentation a closing work package leaves behind, and the planning-folder context every technique here writes into. |
| [create-complete-doc](finalize-documentation/create-complete-doc.md) | Work package's single terminal close-out artifact — delivered work, coverage, limitations, and the open work its registers hold. |
| [ensure-docs](finalize-documentation/ensure-docs.md) | Ensure public/exported APIs in the diff carry inline documentation. |
| [finalize-test-plan](finalize-documentation/finalize-test-plan.md) | Finalize the test plan by linking each test case to its actual source location. |
| [gather-open-work](finalize-documentation/gather-open-work.md) | The work still open at close-out that no register entry holds, sorted into in-task follow-ups and out-of-scope deferrals. |
| [render-token-usage](finalize-documentation/render-token-usage.md) | Sole cost home for a run — the token-use and cost-estimate artifact, reconciled against the run's actual dispatch count, with a one-line README link. |
| [update-adr](finalize-documentation/update-adr.md) | Update the work package's ADR to Accepted, recording the implementation outcome. |
| [findings-classification](findings-classification.md) | Single-scale severity classification for review or validation findings, tiered for delivery against the reachability each finding states, with routing flags for downstream fix cycles. |
| [implement-task](implement-task.md) | Implement a single task by writing code changes |
| [implementation-analysis](implementation-analysis/TECHNIQUE.md) | Current-implementation effectiveness analysis — baseline metrics and the gaps the change closes. |
| [analyze](implementation-analysis/analyze.md) | Effectiveness, baseline metrics, and gaps of the current implementation against success criteria. |
| [document](implementation-analysis/document.md) | Create the analysis-document artifact capturing the current state, baseline metrics, and identified gaps. |
| [ingest-assumption-surfaces](ingest-assumption-surfaces.md) | Append the bound assumption surfaces into the assumptions log. |
| [issue-reference-detection](issue-reference-detection.md) | Whether the user supplied an issue reference, with platform and id when present (`#N` GitHub, `PROJ-N` Jira). |
| [issue-type-detection](issue-type-detection.md) | The work-type category of an already-tracked issue, with an ambiguity flag when its own signals do not settle one category. |
| [locate-contract-tests-worktree](locate-contract-tests-worktree.md) | The branch and directory for contract-test files. |
| [manage-artifacts](manage-artifacts/TECHNIQUE.md) | Shared contract for a workflow's planning-folder artifacts — prefixing, organization, and output discipline. |
| [verify-artifact-links](manage-artifacts/verify-artifact-links.md) | Link integrity across a planning folder, measured as a reader following the published links would experience it. |
| [write-artifact](manage-artifacts/write-artifact.md) | Planning-folder artifact write keyed on bare filename — one numbered instance per logical artifact (find-or-update). |
| [manage-git](manage-git/TECHNIQUE.md) | Shared contract for the work package's git work: which checkout each class of technique runs in, what a code commit carries, and which shell reaches a remote. |
| [artifact-commits](manage-git/artifact-commits.md) | Commit planning artifacts in the engineering checkout with the canonical message pattern, rebasing onto sibling work-package commits to avoid push rejections. |
| [commit-paths](manage-git/commit-paths.md) | Stage and commit selected paths on the edit-side feature branch (code commits, not planning-folder artifact commits). |
| [detect-merge-strategy](manage-git/detect-merge-strategy.md) | Query GitHub for the component repository's allowed merge strategies (specifically, whether squash merging is enabled). |
| [instruct-merge-strategy](manage-git/instruct-merge-strategy.md) | Advisory merge guidance for the PR. Branch commits are unsigned. The merge commit is signed, and creating it prompts the user to sign. Read-only; no merge is performed. |
| [remove-worktree](manage-git/remove-worktree.md) | Tear down a worktree created earlier in the work package. |
| [restore-paths-from-ref](manage-git/restore-paths-from-ref.md) | Restore selected worktree paths to match a base git ref (whole file or interactive hunks), then stage the restores. |
| [sync-branch](manage-git/sync-branch.md) | Feature branch kept current with the default branch. |
| [update-repo-submodules](manage-git/update-repo-submodules.md) | Refresh the monorepo's submodules to their tracked remote HEADs, with locking and skip-if-recent semantics to coordinate concurrent invocations from sibling work packages. |
| [verify-commit-signatures](manage-git/verify-commit-signatures.md) | Feature-branch GPG signature hygiene before push — every commit signed. |
| [verify-feature-branch](manage-git/verify-feature-branch.md) | Confirmation that the target path is on a feature branch rather than main or master. |
| [verify-remote-private](manage-git/verify-remote-private.md) | Configured push remote confirmed private before an upcoming push. |
| [manage-registers](manage-registers/TECHNIQUE.md) | The work package's two open-work registers — the single home each keeps for its class of outstanding item, one entry per item. |
| [append-deferred-item](manage-registers/append-deferred-item.md) | The out-of-scope deferrals register, carrying one entry per item consciously placed beyond this work package. |
| [append-follow-up](manage-registers/append-follow-up.md) | The in-task follow-ups register, carrying one entry per piece of work still owed inside this work package. |
| [merge-contract-tests](merge-contract-tests.md) | Bring the contract-test files from the contract-tests worktree into the feature worktree. |
| [name-edit-target](name-edit-target.md) | Name the primary symbol a task changes. |
| [naming-conventions](naming-conventions.md) | Derive the feature branch name and the canonical worktree target path for a work package from naming conventions, keeping the worktree aligned with the server's planning folder. |
| [plan-prepare](plan-prepare/TECHNIQUE.md) | Implementation planning — design approach, work-package plan with a contract per task, and actionable TODO tasks. |
| [create-todos](plan-prepare/create-todos.md) | The plan's task breakdown carried into the harness TODO list implementation is tracked against. |
| [plan](plan-prepare/plan.md) | Work-package plan artifact — task breakdown, a contract per task, dependencies, ordering, and recorded design decisions. |
| [project-type-detection](project-type-detection.md) | Auto-detect the project type of the target component from its build manifest, so downstream work can shape comprehension, validation, and review to the technology stack. |
| [raise-deferred-items](raise-deferred-items/TECHNIQUE.md) | Deferred-items register entries carried into the issue tracker. |
| [collect](raise-deferred-items/collect.md) | The deferred-items register read for entries that name no issue yet. |
| [record](raise-deferred-items/record.md) | A deferred-items register entry naming the issue raised for it. |
| [record-change-scope](record-change-scope.md) | Add the symbols and flows a diff touches to the task record. |
| [repo-root-resolution](repo-root-resolution.md) | Component identity for this work package, assembled from the derived host repository. |
| [requirements-elicitation](requirements-elicitation/TECHNIQUE.md) | Discover and clarify requirements through structured sequential conversation. |
| [create-document](requirements-elicitation/create-document.md) | Create the requirements document artifact capturing elicited requirements, success criteria, scope boundaries, and assumptions. |
| [discuss](requirements-elicitation/discuss.md) | The baseline elicitation builds its questions on — the stakeholder discussion where one was held, and the recorded limitation where none was. |
| [elicit](requirements-elicitation/elicit.md) | Requirements, success criteria and scope boundaries elicited across the question domains, with the question-and-response record behind them. |
| [pose-question](requirements-elicitation/pose-question.md) | The next question for one elicitation domain, narrowed to what the record does not already answer. |
| [record-answer](requirements-elicitation/record-answer.md) | The elicitation record extended with one question and the answer given to it. |
| [select-domains](requirements-elicitation/select-domains.md) | The question domains this run elicits across, drawn from the reference and narrowed to what the stakeholder discussion left open. |
| [research](research/TECHNIQUE.md) | Knowledge-base and external research synthesized against work-package requirements. |
| [document](research/document.md) | Create the research artifact capturing the synthesized findings, applicable patterns, and risks. |
| [reconcile](research/reconcile.md) | Research-reconcilable candidates closed until only irreconcilable residue remains. |
| [research](research/research.md) | Best practices, patterns, and resources gathered from the knowledge base and the web. |
| [synthesize](research/synthesize.md) | Synthesize the knowledge base and web findings against the work package requirements, mapping applicable patterns to specific needs. |
| [triage](research/triage.md) | Open research candidates classified as reconcilable-by-research or irreconcilable for the reconcile loop. |
| [resolve-artifact-publish](resolve-artifact-publish.md) | Resolve the engineering checkout's publish branch and the planning-folder files that ride on it, for artifact hyperlink construction. |
| [respond-to-pr-review](respond-to-pr-review.md) | Systematic response to PR review comments — analysis through posted replies. |
| [review-assumptions](review-assumptions/TECHNIQUE.md) | The assumption lifecycle a work package runs on: what an assumption is, the categories it is classified into, and the log that holds its outcome. |
| [assemble-one](review-assumptions/assemble-one.md) | Judgement-augmentation context for the single open assumption under discussion, as an individual drill-down. |
| [assemble-open-set](review-assumptions/assemble-open-set.md) | Judgement-augmentation context over the whole residual open-assumption set, ordered so a stakeholder settles the highest-impact decision first. |
| [collect](review-assumptions/collect.md) | Assumptions from the work classified against the bound assumption categories in the assumptions log. |
| [reconcile](review-assumptions/reconcile.md) | Code-analyzable assumptions closed via targeted analysis. |
| [record](review-assumptions/record.md) | Assumption outcomes and stakeholder responses recorded in the assumptions log. |
| [review-baseline-state](review-baseline-state.md) | Review-mode baseline for PR evaluation — expected changes against requirements and the base↔PR authored surface. |
| [review-code](review-code.md) | Rust/Substrate code review of implementation changes for architecture, error handling, safety, and Substrate patterns. |
| [review-diff](review-diff.md) | Conduct structured manual diff review using external side-by-side diff tool with indexed block references |
| [review-existing-feedback](review-existing-feedback.md) | Prior PR feedback accounted for in the review verdict — dispositions and blocker-class rating caps. |
| [review-mode-detection](review-mode-detection.md) | Whether the request is review of an existing PR, with PR/branch/ticket identity when so. |
| [review-outcome-analysis](review-outcome-analysis.md) | Recommended PR review outcome from received comments — approve, minor inline fixes, or significant changes. |
| [review-summary](review-summary.md) | Consolidated review summary in the consolidated review format. |
| [review-test-suite](review-test-suite.md) | Test-suite quality and coverage review — gaps, assertion quality, isolation, and anti-patterns. |
| [run-contract-tests](run-contract-tests.md) | Run the merged contract tests against the implementation in the feature worktree. |
| [stakeholder-overview](stakeholder-overview.md) | Two-paragraph plain-language overview for non-technical stakeholders in a named README section. |
| [strategic-findings-analysis](strategic-findings-analysis.md) | Severity and go/no-go recommendation for strategic-review findings (fix now vs accept and proceed). |
| [strategic-review](strategic-review/TECHNIQUE.md) | Scope-disciplined strategic review of the implementation — findings, changes-folder hygiene, and cleanup of investigation artifacts. |
| [apply-cleanup](strategic-review/apply-cleanup.md) | Approved cleanup on source, with changes-folder fragment committed on the feature branch. |
| [changes-folder](strategic-review/changes-folder.md) | Target repository `changes/` changelog fragment for this work package when the repo uses that convention. |
| [defer-findings](strategic-review/defer-findings.md) | Every finding in the strategic review document that does not recommend keeping the change, as an out-of-scope deferral. |
| [document-findings](strategic-review/document-findings.md) | Strategic review document with findings typed from the review-scope pass, or a clean-review result. |
| [recommend-cleanup](strategic-review/recommend-cleanup.md) | Review-mode cleanup recommendations in the strategic review document — advisory only; source unchanged. |
| [resign-commits](strategic-review/resign-commits.md) | Feature-branch commits re-signed so every commit carries a valid GPG signature. |
| [review-scope](strategic-review/review-scope.md) | Scope-discipline and artifact-hygiene findings across the feature-branch diff for the strategic review document. |
| [verify-fragment](strategic-review/verify-fragment.md) | Whether the work-package change fragment under the target path references the issue. |
| [summarize-architecture](summarize-architecture.md) | Create high-level architecture summary with Mermaid diagrams for management stakeholders |
| [surface-assumptions](surface-assumptions.md) | Assumptions surfaced from the bound source and categories. |
| [task-completion-review](task-completion-review.md) | Post-task self-review for symbol provenance and code/test/documentation quality — catches fabricated symbols early. |
| [update-pr](update-pr/TECHNIQUE.md) | PR finalization for review — body update and ready mark, or consolidated review-mode commentary. |
| [create-pr](update-pr/create-pr.md) | Draft PR linked to the issue and assigned to the current GitHub user. |
| [mark-ready](update-pr/mark-ready.md) | Mark the PR ready for review once its description is finalized. |
| [post-review-comment](update-pr/post-review-comment.md) | Confirmed consolidated review summary posted verbatim to the PR as a pull-request review. |
| [render](update-pr/render.md) | PR description body from the selected template, sourced from planning artifacts. |
| [verify-body](update-pr/verify-body.md) | PR-body-conformance verdict for the rendered PR description (conforms flag and findings). |
| [validate-build](validate-build/TECHNIQUE.md) | Triage validation failures and aggregate cross-check results. |
| [analyze-failure](validate-build/analyze-failure.md) | Identify the root cause of a single failed validation check. |
| [apply-fix](validate-build/apply-fix.md) | Concrete fix for a failed validation check, ready for re-validation. |
| [verify-contract-tests-fail](verify-contract-tests-fail.md) | Confirm the contract tests written for the current task fail against the base tree. |
| [write-contract-tests](write-contract-tests.md) | Write integration tests for one plan task from its Contract alone. |

## Shared techniques bound by this workflow

Techniques a shared namespace holds — `meta` (`workflow-engine`), `git`, `github`, `atlassian` and `gitnexus` — are referenced by qualified id from this workflow.

[`variable-binding`](/meta/techniques/variable-binding.md) rides every activity's delivery as part of the worker contract. The cross-cutting meta strategy technique [`scatter-gather`](/meta/techniques/scatter-gather.md) is declared at activity level, not bound per step.

The [shared routines](../routines/README.md) combine reusable activity steps.
