# Work Package Resources

> Part of the [Work Package Implementation Workflow](../README.md)

The workflow includes 28 resources that provide templates, guidance, and reference material for skills and activities. Each resource lives under its own folder as `<id>/SKILL.md` and is loaded by id (e.g. `get_resource({ resource_id: "pr-description" })`). The numbering system is deprecated — resources are obtained by id only.

| Resource ID | Title | Purpose |
|-------------|-------|---------|
| `readme` | README Guide | Entry point and artifact index template for planning folders |
| `readme-deprecated-notice` | README Guide (deprecated) | **Deprecated** — consolidated into `readme` as of v2.0.0; retained as a redirect stub. New planning-folder work uses `id: readme`. |
| `github-issue-creation` | GitHub Issue Creation | Guide for creating well-structured GitHub issues |
| `jira-issue-creation` | Jira Issue Creation | Guide for creating Jira issues with proper field mapping |
| `requirements-elicitation` | Requirements Elicitation | Question domains and elicitation output template |
| `implementation-analysis` | Implementation Analysis | Analysis framework and document template |
| `knowledge-base-research` | Knowledge Base Research | Research methodology and concept-rag usage guide |
| `web-research` | Web Research | Web research methodology and synthesis template |
| `design-framework` | Design Framework | Structured design framework for problem classification |
| `wp-plan` | Work Package Plan | Plan document template with task breakdown format |
| `test-plan` | Test Plan | Test strategy and acceptance criteria template |
| `pr-description` | PR Description | PR description template with required sections |
| `assumptions-review` | Assumptions Review | Assumption collection, classification, and review protocol |
| `task-completion-review` | Task Completion Review | Post-task review checklist |
| `architecture-review` | Architecture Review | Architecture review criteria and checklist |
| `rust-substrate-code-review` | Rust Substrate Code Review | Rust/Substrate-specific code review criteria |
| `test-suite-review` | Test Suite Review | Test suite quality assessment framework |
| `strategic-review` | Strategic Review | Strategic review criteria for minimal focused changes |
| `architecture-summary` | Architecture Summary | Architecture summary template with UML diagram guidance |
| `workflow-retrospective` | Workflow Retrospective | Retrospective template and facilitation guide |
| `complete-wp` | Complete Work Package | Completion document template |
| `manual-diff-review` | Manual Diff Review | Manual diff review protocol with interview loop format |
| `tdd-concepts-rust` | TDD Concepts Rust | TDD best practices for Rust: Red-Green-Refactor, FIRST principles |
| `review-mode` | Review Mode | Complete guide for review mode behavior and PR review formats |
| `codebase-comprehension` | Codebase Comprehension | Comprehension techniques, artifact template, and deep-dive guidance from reverse engineering and code forensics literature |
| `assumption-reconciliation` | Assumption Reconciliation | Methodology for iterative assumption resolution through targeted code analysis |
| `gitnexus-reference` | GitNexus Reference | GitNexus knowledge graph tool workflows and query examples; includes a "Work-package Integration Patterns" section covering pre-edit impact analysis, post-edit detect_changes, diff-aware coverage mapping, orphan-symbol cypher, scope-discipline checks, cluster/process-driven diagrams, complexity/reversibility signals, and public-API doc enumeration |
| `pr-review-response` | PR Review Response | Guide for analyzing and responding to PR review comments |
