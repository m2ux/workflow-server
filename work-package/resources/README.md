# Work Package Resources

> Part of the [Work Package Implementation Workflow](../README.md)

The workflow includes 27 resources that provide templates, guidance, and reference material for techniques and activities. Each resource lives as `resources/<id>.md` and is loaded by id (e.g. `get_resource({ resource_id: "pr-description" })`). The numbering system is deprecated — resources are obtained by id only.

| Resource ID | Title | Purpose |
|-------------|-------|---------|
| `readme` | README Guide | Entry point and artifact index template for planning folders |
| `readme-deprecated-notice` | README Guide (deprecated) | **Deprecated** — consolidated into `readme` as of v2.0.0; retained as a redirect stub. New planning-folder work uses `id: readme`. |
| `github-issue-creation` | GitHub Issue Creation | Guide for creating well-structured GitHub issues |
| `jira-issue-creation` | Jira Issue Creation | Guide for creating Jira issues with proper field mapping |
| `requirements-elicitation` | Requirements Elicitation | Question domains and elicitation output template |
| `implementation-analysis` | Implementation Analysis | Analysis framework and document template |
| `knowledge-base-research` | Knowledge Base Research | Research methodology and concept-rag usage guide |
| `web-research` | Web Research | Web-research findings template (protocol and rules live on research::research) |
| `design-framework` | Design Framework | TRIZICS solution-design methodology applied at plan time, plus the design-philosophy artifact template |
| `wp-plan` | Work Package Plan | Plan document template with task breakdown format |
| `test-plan` | Test Plan | Test plan templates and test-design principles (authoring rules live on create-test-plan) |
| `pr-description` | PR Description | PR description templates and link-row rendering forms (rules live on update-pr) |
| `assumptions-review` | Assumptions Review | Assumption collection, classification, and review protocol |
| `architecture-review` | Architecture Review | Architecture review criteria and checklist |
| `rust-substrate-code-review` | Rust Substrate Code Review | Rust/Substrate-specific code review criteria |
| `test-suite-review` | Test Suite Review | Test suite quality assessment framework |
| `strategic-review` | Strategic Review | Strategic review artifact template (procedure and rules live on the strategic-review ops) |
| `architecture-summary` | Architecture Summary | Architecture summary template with UML diagram guidance |
| `workflow-retrospective` | Workflow Retrospective | Retrospective section template (written into COMPLETE.md) |
| `complete-wp` | Complete Work Package | Close-out document template — the single terminal artifact |
| `manual-diff-review` | Manual Diff Review | Index-table, header, and report-section forms — the report renders as a code-review.md section (procedure and rules live on review-diff) |
| `deferred-items` | Deferred Items | Register template — the single canonical home for deferred work that every other artifact links to |
| `tdd-concepts-rust` | TDD Concepts Rust | TDD best practices for Rust: Red-Green-Refactor, FIRST principles |
| `review-mode` | Review Mode | Complete guide for review mode behavior and PR review formats |
| `codebase-comprehension` | Codebase Comprehension | Comprehension techniques, artifact template, and deep-dive guidance from reverse engineering and code forensics literature |
| `assumption-reconciliation` | Assumption Reconciliation | Assumptions-log integration and scorecard formats (classification and convergence rules live on review-assumptions::reconcile) |
| `research-reconciliation` | Research Reconciliation | Research-candidate inventory shape, reconcilability statuses, and scorecard format (enumerate/classify/converge rules live on research::triage and research::reconcile) |
| `pr-review-response` | PR Review Response | Response-format and review-document templates (protocol and rules live on respond-to-pr-review) |
