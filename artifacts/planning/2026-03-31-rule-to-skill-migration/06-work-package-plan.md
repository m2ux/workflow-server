# Work Package Plan

**Work Package:** Rule-to-Skill Migration (#88)  
**Created:** 2026-03-31  
**Activity:** Plan & Prepare (06)

---

## Approach Summary

Migrate ~140 duplicated behavioral rules from workflow TOON files and `meta/rules.toon` into formalized skill+resource sets, slim the `start_session` response, deprecate the redundant `workflow-execution` skill, and exclude meta from `list_workflows`. The migration preserves behavioral equivalence through a phased approach that extracts skills before removing rules.

**Design principle**: Extract-then-remove. Skills are created/augmented first, then the source rules are removed. This ensures agents always have access to behavioral constraints during the transition.

---

## Implementation Tasks

### Phase 1: Skill Extraction & Merge (workflow data changes)

All Phase 1 changes are in the `workflows/` worktree.

#### Task 1.1: Absorb workflow-execution into execute-activity and remove from meta
**Files**: `meta/skills/01-workflow-execution.toon`, `meta/skills/05-execute-activity.toon`  
**Action**: Review `01-workflow-execution.toon` for any tool definitions not already in `05-execute-activity.toon`. Merge unique content (tool call sequence, template tools) into execute-activity's `tools` section. **Delete** `01-workflow-execution.toon` from `meta/skills/`. This removes a shallow API reference that execute-activity fully supersedes.  
**Estimate**: 15-20m  
**Risk**: Low — execute-activity already supersedes workflow-execution. Verified no activity references it as primary/supporting skill (A-06-03).

#### Task 1.2: Move orchestrate-workflow from meta to work-package
**Files**: `meta/skills/04-orchestrate-workflow.toon` → `work-package/skills/{NN}-orchestrate-workflow.toon`  
**Action**: Move `04-orchestrate-workflow.toon` out of `meta/skills/` into `work-package/skills/`. It encodes the persistent-worker orchestration model — NOT universal. If `work-packages/` workflow also uses this model, copy there too. Update any skill numbering to fit the target workflow's convention. **Delete** the file from `meta/skills/`.  
**Why**: `meta/skills/` is auto-ingested by ALL workflows on first `get_skills` call. A persistent-worker orchestration protocol in meta would conflict with prism's disposable-worker model and audit workflows' concurrent-dispatch model.  
**Estimate**: 15-20m  
**Risk**: Medium — must verify no other workflow depends on loading orchestrate-workflow from meta. Prism and audit workflows have their own orchestration rules inline; they do NOT reference the orchestrate-workflow skill.

#### Task 1.3: Merge worker-execution rules into execute-activity
**Files**: `meta/skills/05-execute-activity.toon`, all workflow.toon files with worker rules  
**Action**: Identify worker-execution rules in workflow.toon files (work-package rules 12-13, prism-specific worker rules). Add any missing behavioral constraints to execute-activity's `rules` section as named key-value entries. Worker-execution is model-agnostic (applies to all workers regardless of orchestration model). execute-activity stays in meta — it IS universal.  
**Estimate**: 20-30m  
**Risk**: Low — worker behavior is consistent across models.

#### Task 1.4: Merge workflow-fidelity and implementation-workflow into execute-activity
**Files**: `meta/rules.toon` (sections workflow-fidelity, implementation-workflow), `meta/skills/05-execute-activity.toon`  
**Action**: Extract the 4 workflow-fidelity rules and 5 implementation-workflow rules from `meta/rules.toon`. Add as named rules in execute-activity. These are model-agnostic execution constraints.  
**Estimate**: 15-20m  
**Risk**: Low.

#### Task 1.5: Create version-control-protocol skill
**Files**: New `meta/skills/{NN}-version-control-protocol.toon`  
**Action**: Extract the 14 version-control rules from `meta/rules.toon` (commitStandards, branchManagement, destructiveOperations, preCommitVerification). Structure as skill with named rules and protocol sections for commit workflow, branch management, and pre-commit verification.  
**Estimate**: 20-30m  
**Risk**: Low — self-contained extraction.

#### Task 1.6: Create engineering-artifacts-management skill
**Files**: New `meta/skills/{NN}-engineering-artifacts-management.toon`  
**Action**: Extract the 14 engineering-artifacts rules from `meta/rules.toon` (overview, critical, rules, submoduleCommitWorkflow, regularFileCommitWorkflow, commonPaths). Structure as skill with protocol for submodule vs regular file commits, error handling for the two-step commit workflow.  
**Estimate**: 20-30m  
**Risk**: Low — self-contained extraction.

#### Task 1.7: Create github-cli-protocol skill
**Files**: New `meta/skills/{NN}-github-cli-protocol.toon`  
**Action**: Extract the 10 github-cli rules from `meta/rules.toon` (guidance, userApprovalRequired, avoid, mutatingOperations, readOperationsOk). Structure as skill with protocol for mutating vs read operations, GraphQL deprecation workarounds.  
**Estimate**: 15-20m  
**Risk**: Low — self-contained extraction.

#### Task 1.8: Remove duplicated orchestration rules from workflow.toon files
**Files**: All workflow.toon files with orchestrator-discipline rules  
**Action**: For each workflow, identify rules that duplicate orchestration concepts already covered by the workflow's execution model declaration or the existing `orchestrate-workflow` skill. Remove duplicates while preserving model-specific rules (e.g., prism isolation model, audit concurrent dispatch). Keep the EXECUTION MODEL declaration in each workflow since it declares which model the workflow uses.  
**Estimate**: 30-45m  
**Risk**: Medium — must preserve model-specific semantics. Rule-by-rule comparison required.

#### Task 1.9: Remove duplicated worker rules from workflow.toon files
**Files**: workflow.toon files with worker-execution rules  
**Action**: Remove worker rules that are now covered by execute-activity's expanded rules section. Preserve workflow-specific constraints.  
**Estimate**: 20-30m  
**Risk**: Low — worker rules are model-agnostic.

### Phase 2: Slim meta/rules.toon (workflow data changes)

#### Task 2.1: Slim meta/rules.toon
**Files**: `meta/rules.toon`  
**Action**: Remove migrated sections (workflow-fidelity, implementation-workflow, version-control, engineering-artifacts, github-cli, orchestration). Retain session-protocol (11 rules), guardrail sections (code-modification, file-restrictions, communication, documentation, task-management, error-recovery, context-management, build-commands, domain-tool-discipline = 29 rules), and add a bootstrap section with instruction to call `get_skills`.  
**Estimate**: 15-20m  
**Risk**: Low — sections simply removed.

### Phase 3: Server Code Changes

#### Task 3.1: Exclude meta from list_workflows
**Files**: `src/loaders/workflow-loader.ts`  
**Action**: Add `META_WORKFLOW_ID` constant and filter check in `listWorkflows()` function, matching the pattern already used in `skill-loader.ts`. One-line change: skip entries where `entry === META_WORKFLOW_ID`.  
**Estimate**: 5-10m  
**Risk**: Very low — pattern already established in 4 places in skill-loader.ts.

#### Task 3.2: Update tests
**Files**: `tests/rules-loader.test.ts`, `tests/mcp-server.test.ts`, `tests/skill-loader.test.ts`  
**Action**: Update test expectations for slimmed rules.toon (fewer sections, updated section count). Update any tests that reference workflow-execution skill. Add test for meta exclusion from listWorkflows.  
**Estimate**: 20-30m  
**Risk**: Low — tests assert on structure, not individual rule content.

### Phase 4: Documentation & Cleanup

#### Task 4.1: Update workflow README files
**Files**: `meta/README.md`, `meta/skills/README.md`  
**Action**: Update documentation to reflect new skill inventory, deprecated workflow-execution, slimmed rules.toon structure.  
**Estimate**: 10-15m  
**Risk**: Very low.

---

## Task Dependencies

```
Task 1.1 (absorb workflow-execution) ──┐
Task 1.2 (move orchestrate-workflow) ──┤
Task 1.3 (merge worker rules)  ────────┤
Task 1.4 (merge fidelity/impl) ────────┼─→ Task 1.8 (remove orch dupes) ──┐
Task 1.5 (version-control skill) ──────┤   Task 1.9 (remove worker dupes) ─┤
Task 1.6 (eng-artifacts skill) ────────┤                                   │
Task 1.7 (github-cli skill) ───────────┘                                   │
                                                                           ↓
                                                              Task 2.1 (slim rules.toon)
                                                                           │
                                                                           ↓
                                                              Task 3.1 (meta exclusion)
                                                              Task 3.2 (update tests)
                                                                           │
                                                                           ↓
                                                              Task 4.1 (update READMEs)
```

Tasks 1.1–1.7 are independent and can be done in parallel.  
Tasks 1.8–1.9 depend on 1.1–1.7 (skills must exist/move before removing source rules).  
Phase 2 depends on Phase 1 completion.  
Phase 3 depends on Phase 2 (tests validate the new state).

**meta/skills/ net changes**: -2 files (01-workflow-execution.toon deleted, 04-orchestrate-workflow.toon moved out). Remaining: 00-activity-resolution, 02-state-management, 03-artifact-management, 05-execute-activity, 06-knowledge-base-search, 07-atlassian-operations, 08-gitnexus-operations. Plus new universal skills: version-control-protocol, engineering-artifacts-management, github-cli-protocol.

---

## Estimates Summary

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1: Skill extraction & relocation | 1.1–1.9 | 3–4h |
| Phase 2: Slim rules.toon | 2.1 | 15-20m |
| Phase 3: Server code | 3.1–3.2 | 25-40m |
| Phase 4: Documentation | 4.1 | 10-15m |
| **Total** | **13 tasks** | **4–5h** |

---

## Scope Boundaries

### In Scope
- P1–P2 skill extractions from meta/rules.toon and workflow.toon files
- Deprecation of workflow-execution skill
- Slimming meta/rules.toon
- Excluding meta from list_workflows
- Test updates
- Documentation updates

### Out of Scope (deferred to future work packages)
- P3 skill extractions (version-control-protocol, github-cli-protocol are included; human-interaction-protocol, workflow-authoring-discipline are deferred)
- Creating family-specific orchestration skills for prism and audit workflows (rules stay workflow-level for now)
- Removing guardrail rules from rules.toon (they stay)
- Restructuring start_session response shape (rules field remains, just slimmed content)
- Schema changes

### Deferred Decision
- Whether prism-specific skills (analytical-isolation, report-formatting) go in `prism/skills/` vs `meta/skills/` — deferred to a follow-up work package focused on prism-family consolidation
