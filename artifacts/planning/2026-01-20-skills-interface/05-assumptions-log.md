# Assumptions Log

## Work Package: Skills Interface for Workflow Execution

**Date:** 2026-01-20
**PR:** #2
**Issue:** #1

---

## Assumptions Made

### A1: Skill Path Resolution

**Context:** Need to locate skill JSON files from the loader module.

**Assumption:** Use `import.meta.url` to resolve project root and locate `prompts/skills/` directory, following the pattern established in existing loaders.

**Status:** ✅ Confirmed - Tests pass, skills load correctly.

---

### A2: Intent JSON Structure

**Context:** Need a format for intent definitions that is token-efficient and agent-comprehensible.

**Assumption:** Follow the concept-rag pattern but adapt for workflow-specific needs:
- `problem` field describes user goal
- `recognition` array for matching user input
- `skills.primary` and `skills.supporting` for skill references
- `flow` array for step-by-step execution guidance
- `context_to_preserve` for state management hints

**Status:** ✅ Confirmed by user during requirements elicitation.

---

### A3: Single Primary Skill

**Context:** Determining how intents map to skills.

**Assumption:** All three intents (start-workflow, resume-workflow, end-workflow) share the same primary skill (`workflow-execution`) since they all involve workflow execution with different entry/exit points.

**Status:** ✅ Confirmed - Skill covers all workflow lifecycle scenarios.

---

### A4: IDE Setup Entry Point

**Context:** Determining what resource agents should fetch on startup.

**Assumption:** IDE setup should reference `workflow://intents` as the primary entry point (not skills directly), since intents are the problem-domain layer that maps to skills.

**Status:** ✅ Confirmed - Updated from skills to intents when intents layer was added.

---

### A5: Directory Structure

**Context:** Where to store skills and intents files.

**Assumption:** Follow concept-rag structure:
- Skills in `prompts/skills/`
- Intents in `prompts/intents/`
- IDE setup in `prompts/ide-setup.md`

**Status:** ✅ Confirmed - Consistent with reference implementation.

---

### A6: MCP Resource URIs

**Context:** Naming convention for new MCP resources.

**Assumption:** Use `workflow://` scheme with hierarchical paths:
- `workflow://intents` - intent index
- `workflow://intents/{id}` - individual intent
- `workflow://skills` - skill listing
- `workflow://skills/{id}` - individual skill

**Status:** ✅ Confirmed - Consistent with existing `workflow://guides` pattern.

---

## Summary

All assumptions were validated through:
1. User confirmation during requirements elicitation
2. Successful test execution (69 tests passing)
3. Consistency with existing patterns in codebase and concept-rag reference

No assumptions required correction during implementation.
