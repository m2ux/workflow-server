# Resource Subsumption Analysis

**Date:** 2026-01-28

---

## Overview

This analysis examines whether workflow resources should be subsumed (partially or fully) into the Skill schema to provide better structured guidance for agent execution.

---

## Current Resource Architecture

### Resources Location
```
workflows/work-package/resources/
├── 00-start-here.md
├── 02-readme.md
├── 03-github-issue-creation.md    ← Subsumption candidate
├── 04-jira-issue-creation.md      ← Subsumption candidate
├── 05-requirements-elicitation.md
├── 06-implementation-analysis.md
├── ... (22 total resources)
```

### Current Skills Location
```
workflows/work-package/skills/
├── 00-code-review.toon
├── 01-test-review.toon
├── 02-pr-review-response.toon
```

### How Resources Are Used
1. `list_workflow_resources` returns resource index
2. `get_resource` fetches full markdown content
3. Agent reads prose and follows instructions

### How Skills Are Used
1. Activity references `skills.primary` and `skills.supporting`
2. `get_skill` returns structured skill definition
3. Agent follows structured `execution_pattern`, `tools`, `flow`

---

## Resource Classification

### Type 1: Reference Material
Content that provides background, examples, or templates but doesn't define a process.

**Examples:**
- `00-start-here.md` - Orientation content
- `02-readme.md` - Template for README files
- `12-assumptions-review.md` - Review checklist

**Subsumption Status:** ❌ Keep as resources. Reference material doesn't benefit from Skill structure.

### Type 2: Procedural Guides
Content that defines a repeatable process with specific steps and decision points.

**Examples:**
- `03-github-issue-creation.md` - Tool sequence, decision tree, templates
- `04-jira-issue-creation.md` - MCP tool sequence, validation steps
- `06-implementation-analysis.md` - Analysis process

**Subsumption Status:** ✓ Strong candidates for Skill conversion.

### Type 3: Checklists/Reviews
Content that defines verification criteria.

**Examples:**
- `13-task-completion-review.md`
- `14-architecture-review.md`
- `15-strategic-review.md`

**Subsumption Status:** ⚠️ Could be Skills if the review process is structured, otherwise keep as resources.

---

## Detailed Analysis: GitHub Issue Creation

### Current Resource Content

The resource `03-github-issue-creation.md` contains:

1. **Philosophy Section** (lines 1-60)
   - "Issues define problems, not solutions"
   - Forbidden content table
   - Where solutions belong

2. **When to Write Section** (lines 60-75)
   - Write issue when...
   - Skip issues for...

3. **Anti-Patterns Section** (lines 75-90)
   - Solution masquerading as problem
   - Vague problem statement
   - etc.

4. **Issue Structure** (lines 90-180)
   - Required sections template
   - Optional sections template

5. **Section Guidelines** (lines 180-340)
   - Problem statement guidance
   - Goal guidance
   - Scope guidance
   - User stories guidance

6. **Checklist** (lines 345-360)
   - Pre-submission verification

### What Could Be a Skill

```toon
id: github-issue-creation
version: 1.0.0
capability: Create well-structured GitHub issues that define problems without prescribing solutions

execution_pattern:
  preparation[2]:
    - Analyze user requirement
    - Determine if issue is needed (vs trivial fix)
  creation[4]:
    - Draft problem statement
    - Draft goal and scope
    - Draft user stories with acceptance criteria
    - Draft success metrics (if applicable)
  validation[2]:
    - Run checklist verification
    - Present draft for user approval
  submission[2]:
    - Create issue via gh CLI
    - Confirm creation and return URL

tools:
  gh_issue_create:
    when: User approves issue draft
    params: title, body, labels (optional)
    returns: Issue number and URL

flow[8]:
  - "1. Analyze requirement to determine if issue is warranted"
  - "2. If trivial (typo, formatting), skip issue creation"
  - "3. Draft Problem Statement: current state vs desired state"
  - "4. Draft Goal: one sentence, solution-agnostic"
  - "5. Draft Scope: explicit in/out boundaries"
  - "6. Draft User Stories with observable acceptance criteria"
  - "7. Run checklist: no solutions, testable criteria, clear problem"
  - "8. Present to user, await approval, then create"

errors:
  solution_in_issue:
    cause: Draft contains implementation details
    detection: "Mentions files, code, schema, algorithms"
    recovery: Reframe as problem statement - ask 'what user need does this solve?'
  vague_problem:
    cause: Problem statement too broad or unclear
    recovery: Add concrete examples of current failures
  missing_criteria:
    cause: User stories lack testable acceptance criteria
    recovery: Each criterion must be observable without knowing implementation

interpretation:
  forbidden_content[6]:
    - "Solution sections → move to planning docs"
    - "Implementation approach → move to PR"
    - "Technical approach → move to planning docs"
    - "Algorithms/patterns → move to ADRs"
    - "File/code locations → move to PR"
    - "Schema/data structures → move to ADRs"
```

### What Should Remain as Resource

1. **Extended examples** - The full good/bad example sections
2. **Template text** - The markdown template for copy-paste
3. **Anti-pattern descriptions** - Detailed explanations with examples
4. **Related guides links** - Navigation to other resources

### Proposed Hybrid Model

**Skill (github-issue-creation.toon):**
- Structured process definition
- Tool usage patterns
- Error recovery
- Concise flow

**Resource (03-github-issue-creation.md):**
- Full template text
- Extended examples
- Anti-pattern deep dives
- Philosophy/rationale

**Linkage:**
```toon
# In the skill file
resources[1]:
  - 03-github-issue-creation.md  # For templates and examples
```

---

## Detailed Analysis: Jira Issue Creation

### Current Resource Content

Similar structure to GitHub guide but includes:
1. **MCP Tool Sequence** (Pre-creation workflow)
2. **Jira-specific templates** (Bug, Story, Task)
3. **Jira markdown syntax** differences

### Skill Conversion

Most of the Jira guide is already highly procedural:

```
1. getAccessibleAtlassianResources → cloudId
2. getVisibleJiraProjects → projectKey
3. getJiraProjectIssueTypesMetadata → issueTypeName
4. lookupJiraAccountId → assignee_account_id (optional)
5. createJiraIssue → issue created
```

This is exactly what a Skill's `execution_pattern` captures.

### Proposed: jira-issue-creation.toon

```toon
id: jira-issue-creation
version: 1.0.0
capability: Create well-structured Jira issues using Atlassian MCP tools

execution_pattern:
  discovery[3]:
    - mcp_atlassian_getAccessibleAtlassianResources
    - mcp_atlassian_getVisibleJiraProjects
    - mcp_atlassian_getJiraProjectIssueTypesMetadata
  preparation[2]:
    - Determine issue type (Bug/Story/Task/Epic)
    - Draft issue content using template
  validation[1]:
    - Present draft for user approval (🛑 CHECKPOINT)
  creation[1]:
    - mcp_atlassian_createJiraIssue

tools:
  getAccessibleAtlassianResources:
    when: Starting Jira interaction
    params: none
    returns: cloudId
    next: getVisibleJiraProjects
  getVisibleJiraProjects:
    when: Need to identify target project
    params: cloudId, action="create"
    returns: Array of projects
    next: getJiraProjectIssueTypesMetadata
  # ... etc

flow[6]:
  - "1. Get cloud ID from getAccessibleAtlassianResources"
  - "2. 🛑 CHECKPOINT: Confirm project with user if not known"
  - "3. Get available issue types for project"
  - "4. Draft issue using appropriate template"
  - "5. 🛑 CHECKPOINT: Review draft with user"
  - "6. Create issue and report key/URL"

errors:
  project_unknown:
    cause: User hasn't specified which Jira project
    recovery: Present available projects, ask user to select
  issue_type_mismatch:
    cause: Wrong issue type for the work
    detection: Using Task for user-facing work, Story for technical debt
    recovery: Consult issue type selection guide in resource
```

---

## Implementation Recommendation

### Phase 1: Create New Skills

Create two new skill files:
- `workflows/work-package/skills/03-github-issue-creation.toon`
- `workflows/work-package/skills/04-jira-issue-creation.toon`

### Phase 2: Update Activity References

Update `01-issue-verification.toon`:
```toon
skills:
  primary: issue-management
  supporting[5]:
    - git-workflow
    - pr-creation
    - artifact-management
    - github-issue-creation  # NEW
    - jira-issue-creation    # NEW
```

Or create dedicated activities for issue creation.

### Phase 3: Refactor Resources

Trim resources to focus on:
- Templates (for copy-paste)
- Extended examples
- Deep-dive explanations

Remove procedural content that's now in Skills.

### Phase 4: Add Resource Links to Skills

Skills should reference their companion resources:
```toon
resources[1]:
  - 03-github-issue-creation.md
```

---

## Benefits of Subsumption

| Benefit | Description |
|---------|-------------|
| **Structured execution** | Agent follows `execution_pattern` vs parsing prose |
| **Error handling** | `errors` section provides recovery strategies |
| **Tool guidance** | `tools` section details when/how to use each tool |
| **Checkpoints visible** | `flow` shows decision points explicitly |
| **Versioning** | Skills have versions for evolution tracking |

## Costs of Subsumption

| Cost | Description |
|------|-------------|
| **Duplication risk** | Must keep skill and resource in sync |
| **Maintenance burden** | Two files to update vs one |
| **Reduced prose context** | Skills are terser, may lose nuance |

## Mitigation

- Skills reference resources for detailed content
- Resources marked as "companion to skill X"
- Clear ownership: Skills own process, Resources own examples

---

## Other Subsumption Candidates

### Strong Candidates

| Resource | Reason |
|----------|--------|
| `06-implementation-analysis.md` | Defines analysis process |
| `05-requirements-elicitation.md` | Defines elicitation process |

### Weak Candidates

| Resource | Reason to Keep as Resource |
|----------|---------------------------|
| `02-readme.md` | Template, not process |
| `10-test-plan.md` | Template with guidance |
| `11-pr-description.md` | Template with examples |

---

## Recommendations Summary

1. **Create Skills** for `github-issue-creation` and `jira-issue-creation`
2. **Keep Resources** as companion documents with templates and examples
3. **Link Skills to Resources** for extended content
4. **Update Activity** to reference new skills in `supporting` array
5. **Consider future subsumption** for implementation-analysis and requirements-elicitation
