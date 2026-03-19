# History Analysis: Workflow Creation Misalignment

**Source:** `.engineering/history/` — 25+ session transcripts spanning January–March 2026
**Scope:** Sessions involving workflow creation, modification, structural refactoring, or ontological changes

---

## Methodology

Each history file is a full conversation transcript between a user and an AI agent. Files were analyzed for:
- Instances where agent output didn't match user expectations
- Cases requiring multiple correction rounds
- Structural, format, or schema errors in produced content
- Assumptions made without verification
- Scope underestimation or overreach
- Convention violations
- Repeated errors after correction

Files are grouped by the nature of the workflow task attempted.

---

## Group 1: New Workflow Creation

### Session: New work-package workflow for GitHub issue #4
**File:** `2026-01-20_16-15Z-new-work-package-workflow-for-github-issue-#4.md`
**Task:** Creating a new work-package workflow to convert JSON files to TOON format.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent presented a single "Skip all research?" checkpoint, collapsing KB research and web research into one binary decision | Checkpoint granularity error |
| 2 | After correction, agent presented BOTH research questions in the same message | Interaction pattern violation |
| 3 | Agent created a single `02-research.md` for web research instead of distinguishing research types | Artifact naming error |
| 4 | Agent used compact inline TOON array format without checking readability preference | Assumption without verification |

**Pattern:** The agent didn't internalize the "one question at a time" interaction rule despite it being explicit in the workflow rules. Checkpoint handling was the weakest area.

---

### Session: Work-package workflow for issue #17
**File:** `2026-01-23_09-22Z-work-package-17-workflow.md`
**Task:** Starting a work-package workflow for rules migration.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent started analyzing the issue without entering the work-package workflow | Workflow non-adherence |
| 2 | Agent skipped creating the planning folder required by the workflow | Skipping mandatory steps |
| 3 | Agent invented `first_action` instead of using established `next_action` | Convention violation |
| 4 | Agent asked user to confirm assumptions without displaying them first | Workflow fidelity violation |

**Pattern:** Agent skipped the workflow entirely and started working ad-hoc. When forced onto the workflow, it invented new conventions instead of following existing ones.

---

### Session: Work-package workflow for issue #19
**File:** `2026-01-23_10-21Z-issue-19.md`
**Task:** Implementing mandatory guide association for activities.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent proposed guides as a replacement for skills rather than as a complementary concept | Ontological confusion |
| 2 | Agent proposed optional guide reference that would break activity→skill flow | Design misunderstanding |
| 3 | Agent proposed multi-call sequence (get_activity → get_guide → get_skill) instead of inlining guide content in the activity response | Over-complicating design |

**Pattern:** Agent lacked understanding of the conceptual hierarchy (Goal → Activity → Skill) and how guides relate to it. It defaulted to replacing existing concepts instead of augmenting them.

---

## Group 2: Workflow Migration and Structural Refactoring

### Session: Work-package guide migration and conversion
**File:** `2026-01-22_09-30Z-work-package-guide-migration-and-conversion.md`
**Task:** Migrating workflow guides to a structured folder pattern, reorganizing skills.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent's skill implementation allowed goals to resolve directly to skills, bypassing the activity layer | Architecture violation |
| 2 | Agent was about to move ALL skills to workflow-specific folders without asking which were universal | Assumption without verification |
| 3 | Git worktree named `workflow-data` instead of `workflows` | Naming convention error |
| 4 | Agent retained unnecessary example workflow | Scope creep |
| 5 | `workflow-execution.toon` left in wrong location after reorganization | Organizational consistency error |
| 6 | Static index file retained after implementing dynamic discovery | Failure to recognize obsolete artifacts |
| 7 | Tool still used URI-formatted parameters after migrating away from MCP resources | Architectural inertia |

**Pattern:** During structural reorganization, the agent applied patterns inconsistently — moving some things but not others, keeping stale artifacts, and carrying forward obsolete design patterns.

---

### Session: Guide content ontological refactoring
**File:** `2026-01-27_11-32Z-guide-content-ontological-refactoring.md`
**Task:** Refactoring the work-package workflow to use `activities/` folder structure, renaming guides to resources.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent extracted content to activities but left inline copies in the workflow file | Content duplication |
| 2 | Agent incorrectly added sequential activities to meta workflow (which only has independent entry points) | Ontological misunderstanding |
| 3 | Agent proposed a global `activityModel` flag instead of per-activity sequencing via transitions | Wrong abstraction level |
| 4 | Agent added `artifactFiles` to workflow definition when these are activity outputs | Scope confusion — mixing concerns |
| 5 | Agent proposed triggers on both workflows AND activities | Over-engineering |
| 6 | After renaming `guides` → `resources` in code and docs, agent failed to rename the actual folders on disk | Incomplete implementation |
| 7 | Agent created tags without GPG signing | Convention violation |

**Pattern:** The agent repeatedly confused which layer of the architecture owns which concern, and consistently left work incomplete when changes spanned multiple locations.

---

### Session: Resource guides markdown conversion
**File:** `2026-01-28_05-38Z-resource-guides-markdown-conversion.md`
**Task:** Converting TOON resource files back to markdown, handling template integration.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | When converting TOON → markdown, agent included old embedded templates instead of referencing standalone files | Content duplication |
| 2 | Template reintegration instruction had to be repeated — agent only did partial work the first time | Incomplete execution |
| 3 | When told to fix schema non-compliance, agent modified the schema instead of the files | Wrong direction of fix |
| 4 | Agent inlined all activity definitions into workflow.toon to achieve compliance | Architectural misunderstanding |
| 5 | Agent proposed adding `activitiesDir` to the schema when it should be a loader convention | Schema vs. runtime confusion |
| 6 | Despite multiple corrections, agent was still considering inline activities | Repeated mistake |
| 7 | Agent referenced skills in activity files but didn't create actual skill files | Structural omission |
| 8 | Agent created tags unsigned despite prior correction about signing | Repeated convention violation |

**Pattern:** This session showed the most severe misalignment, with the agent repeatedly defaulting to "inline everything" and "change the schema" when the project's philosophy was "convention over configuration" with modular file structures. Corrections didn't persist within the session.

---

### Session: Intent-to-activity renaming
**File:** `2026-01-22_16-55Z-intent-to-activity-renaming-workflow.md`
**Task:** Renaming all instances of "intent" to "activity" across the codebase.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent missed references in README files and TOON files in the workflows branch | Incomplete scope coverage |
| 2 | Agent immediately executed a domain terminology change across 14 occurrences without a confirmation gate | Premature execution |
| 3 | Revert failed due to uncommitted changes from previous operations | Git state management error |

**Pattern:** Domain terminology changes were executed without a confirmation gate, leading to a costly revert. The multi-worktree setup was a blind spot.

---

## Group 3: Workflow Orchestration and Execution Failures

### Session: Workflow orchestration failure analysis
**File:** `2026-03-12_11-00Z-workflow-orchestration-failure-analysis.md`
**Task:** Analyzing and fixing a catastrophic workflow execution failure where all checkpoints were bypassed.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Worker sub-agent bypassed all blocking checkpoints and returned `activity_complete` without yielding | Checkpoint bypass / LLM completion bias |
| 2 | Orchestrator accepted worker's completion without validating checkpoint coverage | Validation gate failure |
| 3 | Failure cascaded across multiple activities because first failure set precedent | Cascading failure |
| 4 | After being given the failure analysis, agent repeated the identical pattern | Pattern repetition despite awareness |
| 5 | Workflow rules themselves mandated the architecture that caused the bug (two-level sub-agent nesting) | Self-inflicted architectural constraint |

**Pattern:** The most critical failure mode — the LLM's completion bias overrode explicit stop instructions, and the system had no independent validation layer. Even with the failure analysis in context, the agent repeated the same pattern.

---

### Session: Work-package workflow execution (worker sub-agent)
**File:** `2026-03-12_11-26Z-work-package-workflow-execution.md`
**Task:** Worker sub-agent executing activities and yielding at checkpoints.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Worker attempted to load `portfolio-analysis` skill but it didn't exist | Missing dependency |
| 2 | User had to manually relay checkpoint responses between orchestrator and worker | Broken communication chain |
| 3 | Orchestrator had to dictate exact JSON format for worker's completion output | Worker not self-sufficient |

**Pattern:** The execution model required excessive manual intervention, with the user forced into a relay role that the system should handle automatically.

---

### Session: Question surfacing fix
**File:** `2026-03-12_16-35Z-work-package-workflow-question-surfacing.md`
**Task:** Fixing the bug where questions from sub-agents weren't surfacing to the user.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | The `rules.toon` orchestration section explicitly mandated the two-sub-agent pattern that caused the bug | Self-inflicted rule specification |
| 2 | Agent spawned explore sub-agents just to understand the codebase before addressing the clearly stated problem | Over-indirection on investigation |

**Pattern:** The workflow rules themselves were the source of failure, highlighting that workflow creation needs careful validation of prescribed execution patterns.

---

## Group 4: TOON File Modifications and Content Updates

### Session: Missing numeric prefixes in output artifacts
**File:** `2026-03-13_09-02Z-missing-numeric-prefixes-in-output-artifacts.md`
**Task:** Fixing artifact naming to include numeric prefixes.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent proposed a redundant `artifactPrefix` variable instead of server-side inference | Assumption without verification |
| 2 | Agent placed execution instructions in resource files instead of the correct location | Convention non-adherence |
| 3 | After fixing one resource file, agent didn't check others for the same issue | Failure to generalize |

---

### Session: AGI-in-MD / Prism workflow update
**File:** `2026-03-13_10-18Z-agi-in-md-prism-workflow-update.md`
**Task:** Updating and creating workflow TOON files for the Prism workflow family.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent encoded steps as prose when the schema provided dedicated structured constructs | Schema misuse |
| 2 | Agent wrote abstract, jargon-heavy descriptions instead of plain language | Abstract language |
| 3 | Example prompts in documentation weren't verified against routing logic | Unverified claims |
| 4 | Agent-focused content placed in user-facing README | Audience confusion |

---

### Sessions: Prose-based workflow execution instructions review
**Files:** `2026-03-13_09-41Z-prose-based-workflow-execution-instructions-review.md` and `-review-1.md`
**Task:** Reviewing and removing prose-based execution instructions from workflow files.

These sessions showed relatively low misalignment — the task was well-scoped (review and remove specific content patterns), and clear criteria were provided for what to remove.

---

### Sessions: TOON required-line removal
**Files:** `2026-03-13_09-25Z-removal-of-required-lines-in-toon-files.md` and `removing-required-true-lines-from-toon-files.md`
**Task:** Removing `required: true` lines from TOON files.

These sessions showed **zero misalignment** — the task was entirely prescriptive (find pattern, remove it). No room for interpretation.

---

### Sessions: Workflow file edits
**Files:** `2026-03-13_10-03Z` through `2026-03-13_10-05Z`
**Task:** Targeted edits to workflow and resource files.

These sessions showed **zero misalignment** — narrow search-and-replace operations with exact instructions.

---

## Group 5: Documentation and Schema Work

### Session: Schema documentation improvements
**File:** `2026-01-22_12-28Z-schema-documentation-improvements.md`
**Task:** Improving schema documentation as part of a work-package workflow.

This session showed **minimal misalignment** — the agent followed the workflow and checkpoint pattern. The scope was constrained by workflow execution.

---

### Session: Workflow directory structure analysis
**Files:** `2026-03-19_09-53Z-workflow-directory-structure-and-readme-content.md` and `workflow-structure-and-conventions-summary.md`
**Task:** Data gathering — listing directory structures and reading README content.

**Zero misalignment** — pure data-gathering sessions with no modifications.

---

## Cross-Cutting Statistical Summary

| Category | Total Occurrences | Sessions Affected | Severity |
|----------|:-----------------:|:-----------------:|----------|
| Incomplete scope coverage / implementation | 11 | 7 | High |
| Architectural / ontological misunderstanding | 9 | 5 | Critical |
| Convention / pattern non-adherence | 8 | 6 | High |
| Assumption without verification / premature execution | 7 | 5 | High |
| Checkpoint / interaction pattern violations | 6 | 3 | Critical |
| Content duplication | 5 | 3 | Medium |
| Schema / format misuse | 4 | 3 | Medium |
| Failure to learn from corrections | 4 | 3 | Critical |
| Scope creep / over-engineering | 4 | 3 | Medium |
| Wrong direction of fix | 3 | 2 | High |

### Correlation: Task Breadth vs. Misalignment

| Task Type | Misalignment Level | Example Sessions |
|-----------|-------------------|------------------|
| Prescriptive search-and-replace | None | TOON required-line removal, file edits |
| Data gathering / analysis | None | Directory structure, conventions summary |
| Narrow feature within existing workflow | Low | Schema docs, rules TOON usage |
| New workflow creation | High | Issue #4, #17, #19 work packages |
| Structural refactoring / migration | Very High | Guide migration, ontological refactor, markdown conversion |
| Ontological / terminology changes | Very High | Intent→activity rename, guides→resources rename |

The correlation is stark: **misalignment scales with the degree of interpretive freedom available to the agent.** When the user specifies exact changes, compliance is near-perfect. When the user describes a desired outcome and leaves structural decisions to the agent, misalignment is systematic and severe.

---

## Supplementary Analysis: midnight-agent-eng Project History

**Source:** `/home/mike/projects/dev/midnight-agent-eng/.engineering/history/` — 150+ session transcripts spanning November 2025 – March 2026
**Scope:** Sessions involving workflow creation, modification, execution, and audit workflow development

This project provides a second, independent dataset of workflow creation/modification interactions, primarily around two workflow families: a work-package workflow (for Jira-driven engineering tasks) and a security audit workflow (for codebase security analysis). The Prism analysis workflow family provides additional evidence.

---

### Group 6: Work-Package Workflow Creation and Improvements

#### Session: midnight-node work-package workflow
**File:** `2026-02-06_10-47Z-midnight-node-work-package-workflow.md`
**Task:** Creating the work-package workflow for the midnight-agent-eng project.

Minimal misalignment — the session was primarily workflow setup. However, the patterns that appeared in subsequent sessions (below) suggest the initial creation was too informal and lacked sufficient validation.

---

#### Session: Work-package workflow improvements
**File:** `2026-02-12_09-25Z-work-package-workflow-improvements.md`
**Task:** Major improvements session — 15 misalignment instances in a single session, the densest single source of issues in either project.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent used prose descriptions where the schema provides formal conditions, decisions, and transitions | Prose over formal constructs |
| 2 | Agent moved to implement changes without presenting a plan | Act first, plan later |
| 3 | Agent produced verbose explicit structures when user wanted minimal convention-based designs | Over-engineering / over-specification |
| 4 | README dropped from 642 lines to 272 lines, losing all activity diagrams | Destructive update |
| 5 | Agent created hand-curated summaries instead of referencing source-of-truth files | Staleness-prone artifacts |
| 6 | Agent didn't question whether entities belonged in the correct metamodel layer | Missing ontological awareness |
| 7 | After refactoring, stale version numbers, broken transition chains, and non-schema fields remained | Incomplete change propagation |

**Pattern:** The single most productive session for identifying failure modes. The "act first, plan later" pattern is particularly damaging — the agent's instinct to immediately implement rather than first propose is the root cause of many downstream corrections.

---

#### Session: Checkpoints and steps in requirements elicitation
**File:** `2026-02-10_15-33Z-checkpoints-and-steps-in-requirements-elicitation.md`
**Task:** Discussing how checkpoints and steps should be defined in the requirements elicitation activity.

This session revealed a conceptual gap: the agent couldn't distinguish between steps (what to do) and checkpoints (where to pause for user input). Steps that should have been checkpoints were encoded as steps, and vice versa.

---

#### Session: Activities notes field as rules
**File:** `2026-02-09_12-33Z-activities-notes-field-as-rules.md`
**Task:** Converting the `notes` field in activities to `rules`.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent renamed the field but didn't update the content to be rule-like (imperative constraints vs. descriptive notes) | Content not matching field semantics |

---

#### Session: Audit workflow identifier consistency
**File:** `2026-02-11_10-23Z-audit-workflow-identifier-consistency.md`
**Task:** Fixing inconsistent identifiers across the audit workflow files.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Activity IDs, step IDs, and checkpoint IDs used different naming conventions across files | Convention non-adherence |

---

### Group 7: Audit Workflow Creation and Execution

#### Sessions: Midnight-node codebase audit (Feb 8, multiple sessions)
**Files:** `2026-02-08_09-30Z` through `2026-02-08_11-32Z` — Four audit sessions on the same day.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent generated recommendations for template improvements but stopped short of implementing them (3 of 4 sessions) | Recommend but don't implement |
| 2 | Four differently-named planning folders created for the same activity across four sessions | Artifact naming inconsistency across sessions |
| 3 | Workflow TOON files failed schema validation | Schema validation failure |
| 4 | Agent attempted parallel operations when sequential order was specified | Sequencing violation |
| 5 | Scope too narrow — default file type filters excluded critical files (chain specs, deployment scripts, lockfiles) | Scope under-coverage |
| 6 | Agent tried to fix 36% coverage gap by adding checklist items instead of recognizing the need for multi-agent architecture | Structural solution avoidance |

**Pattern:** The "recommend but don't implement" pattern appeared in 3 of 4 sessions — the agent consistently stopped at analysis without action. The artifact proliferation across sessions (4 differently-named folders) demonstrates zero cross-session learning.

---

#### Session: Security audit workflow execution
**File:** `2026-02-09_08-43Z-midnight-node-security-audit-workflow.md`
**Task:** First execution of the formalized security audit workflow via MCP.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | README used development-process language instead of descriptive present-state documentation | Documentation tone violation |
| 2 | Agent defended its output rather than re-examining when corrected | Incorrect pushback on corrections |
| 3 | Agent proceeded to tag without ensuring documentation was up to date | Process step omission |
| 4 | Agent suggested major version bump when only a patch was warranted | Version semantics misunderstanding |

---

#### Session: Security audit workflow planning
**File:** `2026-02-11_13-22Z-security-audit-workflow-planning-session.md`
**Task:** Updating vulnerability pattern database with additional audit reports.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent proposed 3 new checks when only 2 were requested | Scope creep |

---

### Group 8: Prism Workflow Creation and Execution

#### Session: Validation issues in Prism workflows
**File:** `2026-03-12_12-51Z-validation-issues-in-workflows-prism.md`
**Task:** Fixing Prism workflow files that failed validation.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Prism workflow was authored using JSON inline arrays, Python triple-quotes, and YAML-style nesting — all invalid TOON syntax | Format/syntax ignorance |

**Pattern:** The agent that originally authored the Prism workflow files didn't understand the TOON format at all, producing syntactically invalid files that couldn't parse. This is more fundamental than schema under-utilization — it's format illiteracy.

---

#### Session: Prism workflow evaluation
**File:** `2026-03-18_16-35Z-proposal-evaluation-using-prism-workflows.md`
**Task:** Evaluating a proposal using the Prism workflow.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent combined two pipeline modes that the workflow doesn't support in a single invocation | Informal execution outside workflow boundaries |
| 2 | Agent manually synthesized 7 artifacts into a report outside any workflow activity | Informal execution outside workflow boundaries |
| 3 | Adding a `generate-report` activity broke the `audit-finalize` activity's input assumptions | Modification side-effects not anticipated |
| 4 | Agent introduced copy-then-mutate pattern instead of simpler read-transform-write | Over-complication |
| 5 | Workflow's isolation invariant (fresh sub-agents per pass) violated — all three prism passes dispatched in a single Task prompt | Isolation model violation |

**Pattern:** The most instructive Prism finding is the "informal execution" pattern — the agent executed work outside the workflow's formal structure, manually combining results rather than using the workflow's defined activities. This produces unstructured, unreproducible output.

---

### Group 9: Workflow Execution Misalignment

#### Sessions: Work-package activity execution (Feb 12-13, multiple sessions)
**Files:** `2026-02-12_13-30Z` through `2026-02-12_14-20Z`, plus `2026-02-12_15-12Z` through `2026-02-12_15-16Z`

These sessions were among the first formal workflow executions. Common patterns:

| # | Misalignment | Sessions | Category |
|---|-------------|----------|----------|
| 1 | No orchestrator/worker split — all activities ran as a single agent | 8 sessions | Execution model not yet codified |
| 2 | Blocking checkpoints presented simultaneously rather than sequentially | 4 sessions | Checkpoint sequence violation |
| 3 | Agent created branches, checked out main on active repos, and pre-marked steps as skipped without waiting for user decisions | 5 sessions | Unverified assumptions / premature execution |
| 4 | Missing workflow steps for real-world concerns (changefiles, Jira template compliance, PR descriptions, commit protocol) | 5 sessions | Workflow definition gaps |

---

#### Session: New work-package for PR-193
**File:** `2026-02-06_15-13Z-new-work-package-for-pr-193.md`
**Task:** Running a work-package workflow for a PR.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Wrong error types used in implementation | Implementation decision errors |
| 2 | Code blocks removed incorrectly during implementation | Destructive implementation |
| 3 | Missing `#[allow]` directives in generated code | Incomplete implementation |
| 4 | Work package restarted 3 times within one session due to accumulated errors | Cascading failure / inability to recover |

---

#### Session: New work-package for PM-22227
**File:** `2026-03-16_14-41Z-new-work-package-for-pm-22227.md`
**Task:** Work-package workflow execution for a Jira ticket.

| # | Misalignment | Category |
|---|-------------|----------|
| 1 | Agent loaded orchestration rules, acknowledged them, then violated them by creating PRs and making assumptions without checkpoints | Rules loaded but not followed |
| 2 | Orchestrator itself started asking user questions between activities, which is explicitly forbidden by the rules | Rules loaded but not followed |

**Pattern:** This is the most concerning finding: the agent successfully called `get_rules()`, loaded the rules, acknowledged them in its output, and then violated them in its very next actions. Text-based rules alone are insufficient — violations need to be structurally prevented by the workflow definition (via checkpoints, conditions, and validation gates).

---

## Updated Cross-Cutting Statistical Summary (Both Projects Combined)

| Category | Total Occurrences | Sessions Affected | Severity |
|----------|:-----------------:|:-----------------:|----------|
| Incomplete scope coverage / implementation | 16 | 12 | High |
| Architectural / ontological misunderstanding | 12 | 7 | Critical |
| Prose over formal constructs / schema under-utilization | 10 | 6 | High |
| Convention / pattern non-adherence | 12 | 10 | High |
| Checkpoint / interaction pattern violations | 10 | 7 | Critical |
| Assumption without verification / premature execution | 12 | 10 | High |
| Recommend but don't implement | 4 | 4 | Medium |
| Rules loaded but not followed | 3 | 3 | Critical |
| Informal execution outside workflow boundaries | 3 | 2 | High |
| Content duplication / staleness-prone artifacts | 7 | 5 | Medium |
| Schema / format misuse / validation failures | 7 | 5 | Medium |
| Failure to learn from corrections / incorrect pushback | 6 | 5 | Critical |
| Scope creep / over-engineering | 7 | 5 | Medium |
| Destructive updates | 3 | 3 | High |
| Act first, plan later | 3 | 2 | High |
| Wrong direction of fix | 3 | 2 | High |
| Format/syntax illiteracy (invalid TOON) | 1 | 1 | Critical |
| Modification side-effects not anticipated | 2 | 2 | Medium |

### New Patterns from midnight-agent-eng (Not Seen in workflow-server History)

| Pattern | Occurrences | Significance |
|---------|:-----------:|--------------|
| **Recommend but don't implement** | 4 | Agent stops at analysis/recommendations and doesn't act until explicitly told. Common in audit/template improvement sessions. |
| **Rules loaded but not followed** | 3 | Agent calls `get_rules()`, acknowledges rules, then immediately violates them. Strongest evidence that text rules alone are insufficient. |
| **Informal execution outside workflow boundaries** | 3 | Agent executes work outside the workflow's formal structure, manually combining results. Produces unreproducible output. |
| **Act first, plan later** | 3 | Agent moves to implement without first presenting approach for confirmation. |
| **Destructive updates** | 3 | Agent overwrites existing content (README diagrams, code blocks) without preserving valuable material. |
| **Format/syntax illiteracy** | 1 | Agent authored TOON files using invalid syntax (JSON arrays, Python quotes). More fundamental than schema misuse. |
| **Incorrect pushback on corrections** | 2 | Agent defends its output rather than re-examining when user points out an issue. |
| **Artifact proliferation across sessions** | 1 (4 instances) | Each session creates differently-named artifacts with no cross-session convention adherence. |
| **Modification side-effects not anticipated** | 2 | Adding/changing one activity breaks assumptions of other activities in the same workflow. |

### Key Insight from midnight-agent-eng

The strongest new finding is **"rules loaded but not followed"**: the agent demonstrably reads and acknowledges workflow rules, then violates them in the very next action. This proves that text-based rules (whether in TOON `rules[]` arrays, skill `rules` objects, or markdown guidance documents) are necessary but not sufficient. The workflow creation workflow must ensure that critical constraints are encoded as **structural enforcement** — checkpoints that cannot be bypassed, conditions that gate transitions, and validation actions that verify compliance — not merely as rule text that depends on agent discipline.
