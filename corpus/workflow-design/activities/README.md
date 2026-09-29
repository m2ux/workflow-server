# Workflow Design Activities

> Part of the [Workflow Design Workflow](../README.md)

Activities that guide an agent from free-form description to validated, committed workflow files and a closing retrospective. `requirements-refinement`, `pattern-analysis`, `impact-analysis`, and `scope-and-draft` are mode-dependent (skipped in review mode); `pattern-analysis` is also skipped in update mode. `post-update-review` runs only in update mode as an automatic post-commit compliance audit. `retrospective` is the terminal activity in every mode.

Heading numbers below match on-disk `NN-` file prefixes (gaps at 02/07 are intentional).

This file is an orientation map. Authoritative definitions live in the per-activity YAML linked from each section below.

---

### 01. Intake and Context

Classify the request as create, update or review, identify the target workflows, confirm intent with the user when the request leaves it unclear, seed the planning folder (create/update), and internalize the schemas and YAML conventions the drafting needs.

Definition: [`01-intake-and-context.yaml`](./01-intake-and-context.yaml). Leads to [Requirements Refinement](#03-requirements-refinement), or directly to [Quality Review](#08-quality-review) in review mode; a rejected review target set runs it again.

---

### 03. Requirements Refinement

Turn the request into a design specification — elicited dimension by dimension on create, synthesized from the change request on update — then surface the design assumptions it rests on and settle every one that an audit can resolve, leaving only genuine design judgements open for approval before commit.

Definition: [`03-requirements-refinement.yaml`](./03-requirements-refinement.yaml). Skipped in review mode; leads to [Pattern Analysis](#04-pattern-analysis) (create) or [Impact Analysis](#05-impact-analysis) (update).

---

### 04. Pattern Analysis

Extract structural and content patterns from comparable existing workflows and persist the comparison, so the new workflow aligns with its siblings. Create mode only.

Definition: [`04-pattern-analysis.yaml`](./04-pattern-analysis.yaml). Leads to [Scope and Draft](#06-scope-and-draft).

---

### 05. Impact Analysis

Assess the impact of proposed changes against an existing workflow's files, exits and graph, and references, and inventory any content the change removes so every removal is one the user approved. Update mode only.

Definition: [`05-impact-analysis.yaml`](./05-impact-analysis.yaml). Leads to [Scope and Draft](#06-scope-and-draft).

---

### 06. Scope and Draft

In create/update modes, prepare a dedicated workflows worktree on `{workflow_branch}`, define the complete file manifest and structural design, then draft, review and schema-validate every file the manifest names under `{target_path}`. The value is a complete, pre-approved scope and a set of drafted files that are reviewed, attested and schema-valid.

Definition: [`06-scope-and-draft.yaml`](./06-scope-and-draft.yaml). Skipped in review mode; leads to [Quality Review](#08-quality-review).

---

### 08. Quality Review

Audit the drafted content, or in review mode each target workflow, against the design principles, anti-patterns and conventions, and resolve the fixable findings in place. The passes, the fix cycle and the review-mode report live in [`08-quality-review.yaml`](./08-quality-review.yaml). The value is workflow content checked against the canon, with its fixable findings resolved, before it is committed.

Definition: [`08-quality-review.yaml`](./08-quality-review.yaml). Leads to [Validate and Commit](#09-validate-and-commit).

---

### 09. Validate and Commit

Validate every file against its schema, verify the scope manifest is addressed, and generate or update the README set; then, in create/update modes, take the stakeholder approval, commit from the session `{target_path}` worktree and open a pull request against the `workflows` branch (`publish-workflow-pr`). In review mode it saves and commits the compliance report.

Definition: [`09-validate-and-commit.yaml`](./09-validate-and-commit.yaml). Terminal in create and review modes; leads to [Post-Update Review](#10-post-update-review) in update mode.

---

### 10. Post-Update Review

Automatic post-commit compliance audit of the updated workflow: reload the committed state, audit it, remediate remaining findings automatically, and publish the remediation to the open pull request. The audit passes and the remediation cycle live in [`10-post-update-review.yaml`](./10-post-update-review.yaml). Update mode only.

Definition: [`10-post-update-review.yaml`](./10-post-update-review.yaml).

---

### 11. Retrospective

Terminal activity for every mode. It conducts a session retrospective (`conduct-retrospective`) of prioritized workflow improvements and writes one `COMPLETE.md` close-out document. In create/update modes that document is the completion summary (`create-completion-doc`) — what was delivered, links to the design decisions, scope outcome, and known limitations — with the retrospective as its section; in review mode it is the retrospective alone. The activity optionally tears down the session worktree the run created.

Definition: [`11-retrospective.yaml`](./11-retrospective.yaml). Terminal in all modes.
