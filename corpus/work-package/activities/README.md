# Work Package Activities

> Part of the [Work Package Implementation Workflow](../README.md)

This is the per-activity orientation map: each entry gives the activity's purpose, the value it delivers, how it connects to the rest of the workflow, and a link to its authoritative definition. The structured definition of each activity — its steps, checkpoints, loops, exits, and artifacts — lives in the corresponding `NN-<id>.yaml` file.

For the activity-to-activity flow diagram, the feedback loops, and review-mode behaviour, see the [workflow README](../README.md).

---

### 01. Start Work Package

Gives the work package its tracked, isolated home: a tracker issue, a dedicated git worktree at `{target_path}` holding the feature branch and draft PR, and the planning folder. In review mode that home is the existing PR's branch. Entry activity; leads to design-philosophy.

Definition: [`01-start-work-package.yaml`](./01-start-work-package.yaml)

---

### 02. Design Philosophy

Applies a structured design framework to classify the problem (type and complexity), reconcile early assumptions, and decide which optional discovery activities are needed. The complexity it sets drives ADR creation later in Complete. In review mode it also assesses ticket completeness. Its exit leads to codebase-comprehension, which then routes onward.

Definition: [`02-design-philosophy.yaml`](./02-design-philosophy.yaml)

---

### Codebase Comprehension (optional)

Builds or augments a durable mental model of the codebase sufficient to qualify the design assumptions raised in later activities. Produces persistent knowledge artifacts under the cumulative comprehension corpus that grow across successive work packages, and a session-local log of the questions and investigations behind them. Runs after design-philosophy and routes to elicitation, research, analysis, or plan-prepare depending on the chosen path.

Definition: [`15-codebase-comprehension.yaml`](./15-codebase-comprehension.yaml)

---

### 03. Requirements Elicitation (optional)

Discovers and clarifies what the work package should accomplish through a structured stakeholder conversation, so that planning starts from agreed requirements rather than guesses. Skipped in review mode (requirements come from the ticket). Leads to research or directly to implementation-analysis.

Definition: [`03-requirements-elicitation.yaml`](./03-requirements-elicitation.yaml)

---

### 04. Research (optional)

Gathers best practices, patterns, and reference material from the knowledge base and external sources to inform the plan, and reconciles or interviews any open assumptions surfaced along the way. Leads to implementation-analysis.

Definition: [`04-research.yaml`](./04-research.yaml)

---

### 05. Implementation Analysis (optional)

Analyzes the current implementation to understand effectiveness, establish baselines, and identify improvement opportunities — giving planning a grounded starting point. In review mode it analyzes the pre-change baseline from the base branch and documents the expected changes. Leads to plan-prepare.

Definition: [`05-implementation-analysis.yaml`](./05-implementation-analysis.yaml)

---

### 06. Plan & Prepare

Designs the approach and produces the work-package plan (task breakdown) and test plan, then prepares the branch and PR for implementation. This is the convergence point for all optional discovery paths, and the target that rework loops return to. Leads to assumptions-review.

Definition: [`06-plan-prepare.yaml`](./06-plan-prepare.yaml)

---

### 07. Assumptions Review

Settles the open assumptions the plan rests on before code is written. May loop back for further discussion, deeper comprehension, or plan revision; otherwise leads to implement.

Definition: [`07-assumptions-review.yaml`](./07-assumptions-review.yaml)

---

### 08. Implement

Executes the implementation plan task by task, turning the plan into committed, tested work. Skipped in review mode (the code already exists). Leads to lean-coding-audit.

Definition: [`08-implement.yaml`](./08-implement.yaml)

---

### 09. Lean-Coding Audit

Applies the ponytail lean-coding lens to the just-implemented change, so accepted simplifications land without breaching the safety floor and deliberate ones are tracked as debt. Complementary to strategic-review (leanness lens, not scope-vs-issue fit). In review mode findings are documented, not applied. Leads to post-impl-review.

Definition: [`09-lean-coding-audit.yaml`](./09-lean-coding-audit.yaml)

---

### 10. Post-Implementation Review

Reviews implementation quality, catching issues before validation. Each review states its findings in one report and records what it walked in a companion method record. The fix cycle belongs to create mode: on the review path an actionable finding is raised to the pull-request author rather than repaired here. A critical blocker routes back to implement for remediation; otherwise leads to validate.

Definition: [`10-post-impl-review.yaml`](./10-post-impl-review.yaml)

---

### 11. Validate

Validates the implementation against tests, build, format, and lint checks when the local environment can run them. In review mode it documents failures as findings and assesses coverage rather than fixing. Suite-only — build-dependent artifact hand-off lives in submit-for-review. Leads to strategic-review.

Definition: [`11-validate.yaml`](./11-validate.yaml)

---

### 12. Strategic Review

Reviews the change set to ensure it is minimal and focused — that the PR contains only what the solution requires — and produces the strategic review document, its method record and the architecture summary. In review mode it documents cleanup recommendations for the posted review without applying them. Leads to submit-for-review when the review passes, otherwise back to plan-prepare for rework.

Definition: [`12-strategic-review.yaml`](./12-strategic-review.yaml)

---

### 13. Submit for Review

Takes the DCO-signed change set to a ready PR with a finalized description, and sees reviewer feedback through. In review mode it delivers all findings as structured PR review comments and ends the workflow. In stealth mode there is no PR lifecycle: the verified, signed commits reach the consumer's private `push_remote`. Significant requested changes loop back to plan-prepare; otherwise leads to complete.

Definition: [`13-submit-for-review.yaml`](./13-submit-for-review.yaml)

---

### 14. Complete

The terminal activity: closes the work package with a close-out, a cost record and a retrospective in `COMPLETE.md` (plus an ADR for moderate or complex work), and selects the next work package. In review mode the branch the posted review links carries the close-out.

Definition: [`14-complete.yaml`](./14-complete.yaml)

---
