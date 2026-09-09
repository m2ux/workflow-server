# Work Package Resources

> Part of the [Work Package Implementation Workflow](../README.md)

Markdown resources for planning-folder templates, elicitation and review guidance, and close-out artifacts.

| Resource ID | Title | Purpose |
|-------------|-------|---------|
| `readme-seed` | README Seed | Progress inventory, classifier, mode-exclusion map for create-readme |
| `canonical-home-map` | Canonical Home Map | Which artifact homes each shared fact category, and the link-only slot every other template carries |
| `issue-creation` | Issue Creation | Body template, anti-patterns and section rules for a tracker issue on any platform |
| `jira-issue-creation` | Jira Issue Creation | What Jira adds — terminology, issue types, field arrangement, native markup, priority and labels |
| `requirements-elicitation` | Requirements Elicitation | Question domains and elicitation output template |
| `implementation-analysis` | Implementation Analysis | Analysis framework and document template |
| `knowledge-base-research` | Knowledge Base Research | Research findings artifact template and citation rules |
| `web-research` | Web Research | Web-research findings template appended to the research document |
| `design-framework` | Design Framework | TRIZICS solution-design methodology applied at plan time, plus the design-philosophy artifact template |
| `wp-plan` | Work Package Plan | Plan document template with task breakdown format |
| `test-plan` | Test Plan | Test plan templates and test-design principles |
| `pr-description` | PR Description | PR description templates, link-row rendering forms, and the conformance criteria a rendered body satisfies |
| `assumptions-review` | Assumptions Review | Assumption collection, classification, and document formats |
| `architecture-review` | Architecture Review | Architecture review criteria and checklist |
| `findings-report` | Findings Report | Shared finding layout, designator, severity and reachability contracts, and the report/method split every findings report follows |
| `symbol-provenance` | Symbol Provenance | What establishes provenance for a symbol named in code or documentation, and how each class of symbol is verified |
| `rust-substrate-code-review` | Rust Substrate Code Review | Rust/Substrate-specific code review criteria, field list and report templates |
| `test-suite-review` | Test Suite Review | Test suite quality assessment framework, field list and report templates |
| `strategic-review` | Strategic Review | Strategic review field list and report templates |
| `architecture-summary` | Architecture Summary | Architecture summary template with UML diagram guidance |
| `workflow-retrospective` | Workflow Retrospective | Retrospective methodology and section template |
| `complete-wp-guide` | Complete Work Package | Close-out document template and fill rules |
| `manual-diff-review` | Manual Diff Review | Lean-header and Block Rationale forms (`file:line` titles) — the report renders as a code-review.md section |
| `deferred-items` | Deferred Items | Register template — the single canonical home for out-of-scope deferred work that every other artifact links to |
| `follow-ups` | Follow-ups | In-task follow-ups register template (distinct from out-of-scope `deferred-items`) |
| `tdd-concepts-rust` | TDD Concepts Rust | TDD best practices for Rust: Red-Green-Refactor, FIRST principles |
| `review-mode` | Review Mode | Review comment template, per-category findings fragments, and the scales they share |
| `codebase-comprehension` | Codebase Comprehension | Comprehension techniques, corpus and log artifact templates, promotion criteria, and deep-dive guidance from reverse engineering and code forensics literature |
| `assumption-reconciliation` | Assumption Reconciliation | Assumptions-log integration and scorecard formats |
| `research-reconciliation` | Research Reconciliation | Research-candidate inventory shape, reconcilability statuses, and scorecard format |
| `pr-review-response` | PR Review Response | Response-format and review-document templates |
| `prior-feedback-triage` | Prior Feedback Triage | Creation guide: `prior-feedback-triage.json` — the disposition register the rating cap is computed from |
| `provenance-log` | Provenance Log | Creation guide: `provenance-log.md` — one appended row per task |
| `adr` | Architecture Decision Record | Creation guide: `NNNN-{decision_title}.md` — standard ADR form with at least one rejected alternative |

## Planning artifact to guide map

Which guide owns each persisted filename's shape.

| Bare filename | Guide |
|---------------|-------|
| `README.md` | [planning-readme](../../meta/resources/planning-readme.md) Template plus [readme-seed](readme-seed.md) |
| `requirements-elicitation.md` | [requirements-elicitation](requirements-elicitation.md) |
| `implementation-analysis.md` | [implementation-analysis](implementation-analysis.md) |
| `assumptions-log.md` | [assumptions-review](assumptions-review.md) |
| `test-plan.md` | [test-plan](test-plan.md) |
| `code-review.md` | [rust-substrate-code-review](rust-substrate-code-review.md#report-template) |
| `code-review-method.md` | [rust-substrate-code-review](rust-substrate-code-review.md#method-record-template) |
| `test-suite-review.md` | [test-suite-review](test-suite-review.md) |
| `test-suite-review-method.md` | [test-suite-review](test-suite-review.md#method-record-template) |
| `session-trace.md` | [session-trace](../../meta/resources/session-trace.md) |
| `change-block-index.md` | [manual-diff-review](manual-diff-review.md#file-index-generation) |
| `token-usage.md` | [token-usage](../../meta/resources/token-usage.md) |
| `provenance-log.md` | [provenance-log](provenance-log.md) |
| `NNNN-{decision_title}.md` | [adr](adr.md) |
| `architecture-summary.md` | [architecture-summary](architecture-summary.md) |
| `strategic-review-{n}.md` | [strategic-review](strategic-review.md) |
| `strategic-review-{n}-method.md` | [strategic-review](strategic-review.md#method-record-template) |
| `{codebase_area}.md` | [codebase-comprehension](codebase-comprehension.md#corpus-artifact-template) |
| `codebase-comprehension.md` | [codebase-comprehension](codebase-comprehension.md#comprehension-log-template) |
| `{YYYY-MM-DD}-pr{pr_number}-review-analysis.md` | [pr-review-response](pr-review-response.md) |
| `kb-research.md` | [knowledge-base-research](knowledge-base-research.md) |
| `design-philosophy.md` | [design-framework](design-framework.md) |
| `COMPLETE.md` | [complete-wp-guide](complete-wp-guide.md) |
| `work-package-plan.md` | [wp-plan](wp-plan.md) |
