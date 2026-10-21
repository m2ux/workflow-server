# Work Package Resources

These resources guide the work package’s planning, implementation reviews, and close-out, with templates for the artifacts that record its decisions and results.

| Name | Description |
|------|-------------|
| [README Seed](readme-seed.md) | Progress inventory, classifier, mode-exclusion map for create-readme |
| [Canonical Home Map](canonical-home-map.md) | Which artifact homes each shared fact category, and the link-only slot every other template carries |
| [Issue Creation](issue-creation.md) | Body template, anti-patterns and section rules for a tracker issue on any platform |
| [Jira Issue Creation](jira-issue-creation.md) | What Jira adds — terminology, issue types, field arrangement, native markup, priority and labels |
| [Requirements Elicitation](requirements-elicitation.md) | Question domains and elicitation output template |
| [Implementation Analysis](implementation-analysis.md) | Analysis framework and document template |
| [Knowledge Base Research](knowledge-base-research.md) | Research findings artifact template — knowledge-base and web findings in one list — and citation rules |
| [Design Framework](design-framework.md) | TRIZICS solution-design methodology applied at plan time, plus the design-philosophy artifact template |
| [Work Package Plan](plan-guide.md) | Plan document template with task breakdown format |
| [Test Plan](test-plan-guide.md) | Test plan templates and test-design principles |
| [PR Description](pr-description.md) | PR description templates, link-row rendering forms, and the conformance criteria a rendered body satisfies |
| [Assumptions Review](assumptions-review.md) | Assumption collection, classification, and document formats |
| [Architecture Review](architecture-review.md) | Architecture review criteria and checklist |
| [Findings Report](findings-report.md) | Shared finding layout, designator, severity and reachability contracts, and the one-report shape every findings report follows |
| [Symbol Provenance](symbol-provenance.md) | What establishes provenance for a symbol named in code or documentation, and how each class of symbol is verified |
| [Rust Substrate Code Review](rust-substrate-code-review.md) | Rust/Substrate-specific code review criteria, field list and report template |
| [Test Suite Review](test-suite-review.md) | Test suite quality assessment framework, field list and report template |
| [Strategic Review](strategic-review.md) | Strategic review field list and report template |
| [Architecture Summary](architecture-summary.md) | Architecture summary template with UML diagram guidance |
| [Workflow Retrospective](workflow-retrospective.md) | Retrospective methodology and section template |
| [Close-out](close-out-guide.md) | Close-out document template and fill rules |
| [Manual Diff Review](manual-diff-review.md) | Lean-header and Block Rationale forms (titles naming each change, linked to its line) — the report renders as a code-review.md section |
| [Deferred Items](deferred-items-guide.md) | Register template — the single canonical home for out-of-scope deferred work that every other artifact points at |
| [Follow-ups](follow-ups-guide.md) | In-task follow-ups register template (distinct from out-of-scope deferred items) |
| [TDD Concepts Rust](tdd-concepts-rust.md) | TDD best practices for Rust: Red-Green-Refactor, FIRST principles |
| [Review Mode](review-mode.md) | Review comment template, per-category findings fragments, and the scales they share |
| [Codebase Comprehension](codebase-comprehension.md) | Comprehension techniques, corpus and log artifact templates, promotion criteria, and deep-dive guidance from reverse engineering and code forensics literature |
| [Assumption Reconciliation](assumption-reconciliation.md) | Assumptions-log integration shape and resolution statuses |
| [Research Reconciliation](research-reconciliation.md) | Research-candidate inventory shape, reconcilability statuses, and scorecard format |
| [PR Review Response](pr-review-response.md) | Response-format and review-document templates |
| [Prior Feedback Triage](prior-feedback-triage-guide.md) | Creation guide: `prior-feedback-triage.json` — the disposition register the rating cap is computed from |
| [Provenance Log](provenance-log-guide.md) | Creation guide: `provenance-log.md` — one appended row per task |
| [Architecture Decision Record](adr-guide.md) | Creation guide: `NNNN-{decision_title}.md` — standard ADR form with at least one rejected alternative |

## Planning artifact to guide map

Which guide owns each persisted filename's shape.

| Bare filename | Guide |
|---------------|-------|
| `README.md` | [planning-readme](/meta/resources/planning-readme.md) Template plus [readme-seed](readme-seed.md) |
| `requirements-elicitation.md` | [requirements-elicitation](requirements-elicitation.md) |
| `implementation-analysis.md` | [implementation-analysis](implementation-analysis.md) |
| `assumptions-log.md` | [assumptions-review](assumptions-review.md) |
| `deferred-items.json` | [deferred-items-guide](deferred-items-guide.md) |
| `follow-ups.json` | [follow-ups-guide](follow-ups-guide.md) |
| `test-plan.md` | [test-plan-guide](test-plan-guide.md) |
| `code-review.md` | [rust-substrate-code-review](rust-substrate-code-review.md#report-template) |
| `test-suite-review.md` | [test-suite-review](test-suite-review.md) |
| `session-trace.md` | [session-trace](/meta/resources/session-trace.md) |
| `change-block-index.md` | [manual-diff-review](manual-diff-review.md#file-index-generation) |
| `token-usage.md` | [token-usage](/meta/resources/token-usage.md) |
| `provenance-log.md` | [provenance-log-guide](provenance-log-guide.md) |
| `NNNN-{decision_title}.md` | [adr-guide](adr-guide.md) |
| `architecture-summary.md` | [architecture-summary](architecture-summary.md) |
| `strategic-review-{n}.md` | [strategic-review](strategic-review.md) |
| `{codebase_area}.md` | [codebase-comprehension](codebase-comprehension.md#corpus-artifact-template) |
| `codebase-comprehension.json` | [codebase-comprehension](codebase-comprehension.md#comprehension-log-template) |
| `{YYYY-MM-DD}-pr{pr_number}-review-analysis.md` | [pr-review-response](pr-review-response.md) |
| `kb-research.md` | [knowledge-base-research](knowledge-base-research.md) |
| `design-philosophy.md` | [design-framework](design-framework.md) |
| `COMPLETE.md` | [close-out-guide](close-out-guide.md) |
| `work-package-plan.md` | [plan-guide](plan-guide.md) |
