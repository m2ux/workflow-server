# Work Package Implementation Workflow

> Defines how to plan and implement ONE work package from inception to merged PR. A work package is a discrete unit of work such as a feature, bug-fix, enhancement, refactoring, or any other deliverable change. **Supports review mode** for conducting structured reviews of existing PRs.

## Overview

This workflow guides the complete lifecycle of a single work package:
1. **Issue Management** → Verify/create issue, set up branch and PR
2. **Design Philosophy** → Classify problem, determine workflow path
3. **Requirements Elicitation** (optional) → Clarify requirements
4. **Research** (optional) → Gather best practices
5. **Implementation Analysis** → Understand current state
6. **Plan & Prepare** → Create implementation and test plans
7. **Implement** → Execute tasks with review cycles
7b. **Post-Implementation Review** → Manual diff review, code review, test review  
9. **Validate** → Run tests and verify build
10. **Strategic Review** → Ensure minimal, focused changes
11. **Finalize** → Complete documentation
12. **Update PR** → Push and mark ready for review
13. **Post-Implementation** → Handle reviews and retrospective

**Key characteristics:**
- Sequential flow with conditional branches
- Multiple feedback loops for quality gates
- 22 checkpoints across all activities
- Task implementation loop with reviews
- Manual diff review with interview-based finding collection
- **Review mode** for reviewing existing PRs (see [Review Mode](#review-mode) section)

---

## Review Mode

This workflow supports **review mode** for reviewing existing PRs rather than implementing new code. When activated, the workflow adapts its behavior using the formal `modes` and `modeOverrides` schema constructs.

**See [REVIEW-MODE.md](REVIEW-MODE.md) for complete documentation.**

Quick summary:
- Detected from user intent (e.g., "start review work package", "review PR #123")
- Skips elicitation and implementation phases
- Analyzes pre-change baseline from base branch
- Documents findings rather than applying fixes
- Generates structured PR review comments

## Workflow Flow

```mermaid
graph TD
    Start([Start]) --> IM[issue-management]
    IM --> DP[design-philosophy]
    
    DP --> PATH{workflow path?}
    PATH -->|full| REL[requirements-elicitation]
    PATH -->|elicit-only| REL
    PATH -->|research-only| RS
    PATH -->|direct| PP
    
    REL --> RS[research]
    RS --> IA[implementation-analysis]
    IA --> PP[plan-prepare]
    
    PP --> IMP[implement]
    IMP --> PIR[post-impl-review]
    PIR --> VAL[validate]
    
    VAL --> VD{validation result?}
    VD -->|pass| SR[strategic-review]
    VD -->|minor issues| IMP
    VD -->|major issues| PP
    
    SR --> SRD{review result?}
    SRD -->|pass| FIN[finalize]
    SRD -->|issues| PP
    
    FIN --> UPR[update-pr]
    UPR --> PI[post-implementation]
    
    PI --> PID{review changes?}
    PID -->|significant| PP
    PID -->|approved/minor| Done([Complete])
    
    style IM fill:#e3f2fd
    style DP fill:#e3f2fd
    style REL fill:#e3f2fd
    style IA fill:#e3f2fd
    style RS fill:#e3f2fd
    style PP fill:#fff3e0
    style IMP fill:#fff3e0
    style PIR fill:#fff3e0
    style VAL fill:#e8f5e9
    style SR fill:#e8f5e9
    style FIN fill:#fce4ec
    style UPR fill:#fce4ec
    style PI fill:#fce4ec
```

---

## Activities

### 1. Issue Management

**Purpose:** Verify or create an issue, then create feature branch and PR. Issues define the problem space and provide traceability from requirements through implementation. **In review mode:** Detects review requests, captures PR reference, and extracts associated Jira ticket.

**Primary Skill:** `issue-management`  
**Supporting Skills:** `git-workflow`, `pr-creation`, `artifact-management`

```mermaid
graph TD
    subgraph issue-management[Issue Management]
        s1([Detect project type])
        s2([Check for existing issue])
        s4([Check current branch])
        s5([Create/use branch])
        s6([Check for existing PR])
        s7([Create/use PR])
        s8([Initialize planning folder])
        
        cp1{Issue exists?}
        cp2{Platform?}
        cp3{On feature branch?}
        cp4{PR exists?}
        
        s1 --> s2 --> cp1
        cp1 -->|provide| s4
        cp1 -->|create| cp2
        cp1 -->|skip| s4
        
        cp2 -->|github| CreateGH([Create GitHub Issue])
        cp2 -->|jira| CreateJira([Create Jira Issue])
        
        CreateGH --> s4
        CreateJira --> s4
        
        s4 --> cp3
        cp3 -->|yes-use| s6
        cp3 -->|no-create| s5
        s5 --> s6
        
        s6 --> cp4
        cp4 -->|yes-use| s8
        cp4 -->|no-create| s7
        s7 --> s8
        
        s8 --> Next([→ design-philosophy])
    end
```

**Checkpoints:**
1. Issue Verification: "I didn't find an issue. Which option?"
2. Platform Selection: "Which platform should I create this issue in?"
3. Jira Project Selection: "Which Jira project?" (conditional - Jira only)
4. Issue Type: "What type of issue is this?"
5. Issue Review: "Here's the drafted issue. Does this look correct?"
6. Branch Check: "You're on branch X. Use existing or create new?"
7. PR Check: "Found existing PR #N. Use existing or create new?"
8. PR Creation: "Proceed to create feature branch and draft PR?"

---

### 2. Design Philosophy

**Purpose:** Classify the problem, assess complexity, and determine which optional activities are needed. **In review mode:** Assesses ticket completeness and always skips elicitation (requirements come from the ticket).

**Primary Skill:** `design-framework`

```mermaid
graph TD
    subgraph design-philosophy[Design Philosophy]
        d1([Define problem])
        d2([Classify problem type])
        d3([Assess complexity])
        d4([Determine workflow path])
        
        cp1{Problem classified?}
        cp2{Workflow path?}
        
        d1 --> d2 --> d3 --> cp1
        cp1 -->|confirmed| d4
        cp1 -->|revise| d1
        d4 --> cp2
        
        cp2 -->|full| Next1([→ requirements-elicitation])
        cp2 -->|elicit-only| Next1
        cp2 -->|research-only| Next2([→ implementation-analysis])
        cp2 -->|direct| Next3([→ plan-prepare])
    end
```

**Checkpoints:**
1. Problem Classification: "This appears to be a {type} with {complexity} complexity. Correct?"
2. Workflow Path: "Given the complexity, which path would you like?"

---

### 3. Requirements Elicitation (Optional)

**Purpose:** Discover and clarify what the work package should accomplish through stakeholder discussion and structured conversation.

**Primary Skill:** `requirements-elicitation`  
**Supporting Skill:** `artifact-management`

```mermaid
graph TD
    subgraph requirements-elicitation[Requirements Elicitation]
        r0([Stakeholder discussion])
        r1([Elicit requirements])
        r2([Collect assumptions])
        r3([Post to Jira])
        r4([Await stakeholder response])
        r5([Create requirements document])
        r6([Update assumptions log])
        
        cp0{Transcript provided?}
        cp1{Jira comment OK?}
        cp2{Stakeholder response?}
        cp3{Document review?}
        
        r0 --> cp0
        cp0 -->|yes| r1
        cp0 -->|skip| r1
        r1 --> r2 --> cp1
        cp1 -->|post| r3 --> r4 --> cp2
        cp1 -->|skip| r5
        cp2 -->|approved| r5
        cp2 -->|comment| r1
        cp2 -->|further discussion| r0
        r5 --> r6 --> cp3
        cp3 -->|proceed| Next([→ research])
        cp3 -->|revise| r5
    end
```

**Checkpoints:**
1. Stakeholder Discussion: "Please discuss with key stakeholders and provide the transcript"
2. Jira Comment Review: "Review the comment before posting to Jira" (Jira issues only)
3. Stakeholder Response: "Provide stakeholder feedback after they review the Jira comment"
4. Document Review: "Ready to proceed to Research?"

---

### 4. Research (Optional)

**Purpose:** Research knowledge base and external sources to discover best practices and patterns.

**Primary Skill:** `knowledge-research`

```mermaid
graph TD
    subgraph research[Research]
        rs1([Knowledge base research])
        rs2([Web research])
        rs3([Create research document])
        cp1{KB insights confirmed?}
        cp2{Web research confirmed?}
        
        rs1 --> cp1
        cp1 -->|confirmed| rs2
        cp1 -->|more| rs1
        rs2 --> cp2
        cp2 -->|confirmed| rs3
        cp2 -->|more| rs2
        rs3 --> Next([→ implementation-analysis])
    end
```

**Checkpoints:**
1. "Knowledge insights confirmed?"
2. "Web research findings confirmed?"

---

### 5. Implementation Analysis

**Purpose:** Analyze current implementation to understand effectiveness, establish baselines, identify opportunities. **In review mode:** Checks out base branch to analyze pre-change state, documents expected changes based on requirements.

**Primary Skill:** `implementation-analysis`  
**Supporting Skill:** `artifact-management`

```mermaid
graph TD
    subgraph implementation-analysis[Implementation Analysis]
        a1([Complete analysis])
        a2([Create analysis document])
        cp1{Analysis confirmed?}
        
        a1 --> a2 --> cp1
        cp1 -->|confirmed| Next([→ plan-prepare])
        cp1 -->|clarify| a1
    end
```

**Checkpoint:** "Implementation analysis complete. Ready to proceed to planning?"

---

### 6. Plan & Prepare

**Purpose:** Create the work package plan and prepare for implementation.

**Primary Skill:** `planning`  
**Supporting Skill:** `test-planning`

```mermaid
graph TD
    subgraph plan-prepare[Plan & Prepare]
        p1([Create work package plan])
        p2([Create test plan])
        p3([Sync feature branch])
        p4([Update PR description])
        p5([Create TODO list])
        cp1{Ready to implement?}
        
        p1 --> p2 --> p3 --> p4 --> p5 --> cp1
        cp1 -->|ready| Next([→ implement])
        cp1 -->|not-ready| p1
    end
```

**Checkpoints:**
1. "Approach confirmed?"
2. "Ready to implement?"

---

### 7. Implement Tasks

**Purpose:** Execute the implementation plan task by task with review cycles. **In review mode:** This activity is SKIPPED entirely—implementation already exists in the PR.

**Primary Skill:** `implementation`  
**Supporting Skill:** `assumptions-review`

```mermaid
graph TD
    subgraph implement[Implement Tasks]
        loop[[forEach: plan.tasks]]
        t1([Implement task])
        t2([Run tests])
        t3([Commit changes])
        t4([Review assumptions])
        
        cp1{Assumptions confirmed?}
        
        loop --> t1 --> t2 --> t3 --> t4 --> cp1
        cp1 -->|confirmed| loop
        cp1 -->|correction| t1
        
        loop -->|done| Next([→ post-impl-review])
    end
```

**Checkpoints:**
1. Task Progress: "Review assumptions. Are they confirmed?"

---

### 7b. Post-Implementation Review

**Purpose:** Review implementation quality regardless of whether code was newly written or adopted. Ensures manual diff review, code review, test suite review, and architecture summary are completed before validation.

**Primary Skill:** `manual-diff-review`  
**Supporting Skills:** `code-review`, `test-review`, `architecture-summary`

```mermaid
graph TD
    subgraph post-impl-review[Post-Implementation Review]
        pr1([Generate file index])
        pr2([User reviews in diff tool])
        pr3([Collect flagged rows])
        pr4([Interview loop])
        pr5([Compile manual review report])
        pr6([Automated code review])
        pr7([Test suite review])
        pr8([Architecture summary])
        
        cp1{Files flagged?}
        cp2{Code review confirmed?}
        cp3{Test quality acceptable?}
        cp4{Create arch summary?}
        
        pr1 --> pr2 --> cp1
        cp1 -->|yes| pr3 --> pr4 --> pr5
        cp1 -->|none| pr6
        pr5 --> pr6
        
        pr6 --> cp2
        cp2 -->|confirmed| pr7
        cp2 -->|revise| pr6
        
        pr7 --> cp3
        cp3 -->|acceptable| cp4
        cp3 -->|improve| pr7
        
        cp4 -->|yes| pr8 --> Next([→ validate])
        cp4 -->|skip| Next
    end
    
    skill1((manual-diff-review))
    skill2((code-review))
    skill3((test-review))
    pr1 -.-> skill1
    pr6 -.-> skill2
    pr7 -.-> skill3
```

**Artifacts:**
- `{NN}-change-block-index.md` - File index for cross-reference during manual review
- `{NN}-manual-diff-review.md` - Manual diff review findings
- `{NN}-code-review.md` - Automated code review report
- `{NN}-test-suite-review.md` - Test suite quality assessment
- `{NN}-architecture-summary.md` - C4 diagrams for stakeholders (optional)

**Checkpoints:**
1. File Index: "Review in your diff tool, then provide row numbers with issues"
2. Block Interview: "What's the issue with this change?" (repeats for each flagged row)
3. Code Review: "Code review findings confirmed?"
4. Test Quality: "Test quality acceptable?"
5. Architecture Summary: "Create architecture summary for stakeholders?"

---

### 8. Validate

**Purpose:** Validate implementation through comprehensive testing. All tests must pass. **In review mode:** Documents failures as review findings rather than fixing them.

**Primary Skill:** `validation`

```mermaid
graph TD
    subgraph validate[Verify & Validate]
        v1([Run all tests])
        v2([Verify build succeeds])
        v3([Check for linter errors])
        v4([Test suite review])
        
        dec{Validation result?}
        
        v1 --> v2 --> v3 --> v4 --> dec
        dec -->|pass| Next1([→ strategic-review])
        dec -->|minor issues| Next2([→ implement])
        dec -->|major issues| Next3([→ plan-prepare])
    end
    
    skill((test-review))
    v4 -.-> skill
```

**Decision:** Pass → strategic-review | Minor issues → implement | Major issues → plan-prepare

---

### 9. Strategic Review

**Purpose:** Ensure changes are minimal and focused. Validate the PR contains only required changes. **In review mode:** Documents cleanup recommendations rather than applying them.

**Primary Skill:** `strategic-review`

```mermaid
graph TD
    subgraph strategic-review[Strategic Review]
        sr1([Complete strategic review])
        cp1{Review findings confirmed?}
        dec{Review result?}
        
        sr1 --> cp1
        cp1 -->|confirmed| dec
        cp1 -->|needs-cleanup| sr1
        
        dec -->|pass| Next1([→ finalize])
        dec -->|issues| Next2([→ plan-prepare])
    end
```

**Checkpoint:** "Review findings confirmed?"

**Decision:** Pass → finalize | Issues found → plan-prepare

---

### 10. Finalize

**Purpose:** Finalize documentation after implementation is complete.

**Primary Skill:** `documentation`

```mermaid
graph TD
    subgraph finalize[Finalize]
        f1([Update ADR status])
        f2([Finalize test plan])
        f3([Create COMPLETE.md])
        f4([Ensure inline docs])
        
        f1 --> f2 --> f3 --> f4 --> Next([→ update-pr])
    end
```

**No checkpoints** - proceeds directly to update-pr.

---

### 11. Update PR

**Purpose:** Update PR with final implementation details and mark ready for review. **In review mode:** Generates consolidated review summary and posts PR review comments.

**Primary Skill:** `pr-management`

```mermaid
graph TD
    subgraph update-pr[Update PR]
        u1([Push all commits])
        u2([Update PR description])
        u3([Mark PR ready])
        cp1{PR description confirmed?}
        
        u1 --> u2 --> u3 --> cp1
        cp1 -->|confirmed| Next([→ post-implementation])
        cp1 -->|revise| u2
    end
```

**Checkpoint:** "PR description confirmed?"

---

### 12. Post-Implementation

**Purpose:** Complete post-implementation tasks including automatic ADR creation for moderate/complex implementations and handling PR review feedback.

**Primary Skill:** `retrospective`  
**Supporting Skill:** `pr-review-response`

```mermaid
graph TD
    subgraph post-implementation[Post-Implementation]
        adr([Create ADR])
        pi1([Await manual review])
        pi2([Process review comments])
        pi3([Capture session history])
        pi4([Workflow retrospective])
        pi5([Update work package status])
        pi6([Select next work package])
        
        cond{complexity?}
        cp1{Review received?}
        cp2{Review outcome?}
        
        cond -->|moderate/complex| adr --> pi1
        cond -->|simple| pi1
        
        pi1 --> cp1
        cp1 -->|yes-review| pi2
        cp1 -->|no-waiting| pi1
        
        pi2 --> cp2
        cp2 -->|approved| pi3
        cp2 -->|minor-changes| pi2
        cp2 -->|significant-changes| Back([→ plan-prepare])
        
        pi3 --> pi4 --> pi5 --> pi6 --> Done([Complete])
    end
    
    skill((pr-review-response))
    pi2 -.-> skill
```

**Steps:**
1. Create ADR (automatic, if complexity is moderate or complex based on design-philosophy assessment)
2. Await manual review
3. Process review comments
4. Capture session history
5. Workflow retrospective
6. Update work package status
7. Select next work package

**Checkpoints:**
1. "Has the PR received manual review feedback?"
2. "What is the outcome of processing review comments?"

---

## Skills Summary

| Skill | Capability | Used By |
|-------|------------|---------|
| `manual-diff-review` | Manual diff review with file index and interview loop (see `22-manual-diff-review.md`) | post-impl-review |
| `code-review` | Code review (see `16-rust-substrate-code-review.md` for Rust/Substrate) | post-impl-review, implement |
| `test-review` | Test suite quality review (see `17-test-suite-review.md`) | post-impl-review, validate |
| `pr-review-response` | Respond to PR review feedback | post-implementation |

## Schema Extensions

This workflow uses schema extensions for mode support:

| Schema | Extension | Purpose |
|--------|-----------|---------|
| `workflow.schema.json` | `modes[]` | Define workflow execution modes with activation, recognition, skip lists |
| `activity.schema.json` | `modeOverrides{}` | Define activity-level behavior for each mode |

See `../../schemas/workflow.schema.json` and `../../schemas/activity.schema.json` for full definitions.

---

## Resources

| Resource | Purpose |
|----------|---------|
| `24-review-mode.md` | Complete guide for review mode behavior and PR review comment formats |
| `16-rust-substrate-code-review.md` | Rust/Substrate code review criteria |
| `17-test-suite-review.md` | Test suite quality assessment |
| `22-manual-diff-review.md` | Manual diff review with interview loop |

---

## Variables

| Variable | Type | Description |
|----------|------|-------------|
| `issue_number` | string | GitHub or Jira issue number |
| `issue_platform` | string | Issue tracking platform (github/jira) |
| `pr_number` | string | Pull request number |
| `branch_name` | string | Feature branch name |
| `needs_elicitation` | boolean | Whether requirements elicitation is needed |
| `needs_research` | boolean | Whether research activity is needed |
| `complexity` | string | Problem complexity (simple/moderate/complex) - drives ADR creation |
| `validation_passed` | boolean | Whether validation activity passed |
| `review_passed` | boolean | Whether strategic review passed |
| `is_review_mode` | boolean | Whether this is a review of existing implementation |
| `review_pr_url` | string | URL of PR being reviewed (review mode only) |

---

## Feedback Loops

The workflow includes several feedback loops for quality assurance:

| From | To | Condition |
|------|----|-----------|
| validate | implement | Minor issues found |
| validate | plan-prepare | Major issues found |
| strategic-review | plan-prepare | Significant issues found |
| post-implementation | plan-prepare | Significant changes required |
