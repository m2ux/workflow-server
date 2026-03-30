# Workflow Retrospective — Multi-Agent Schema Formalisation

**Date:** 2026-03-30  
**Workflow:** work-package (v3.4.0)  
**Activities completed:** 13

---

## What Went Well

**1. Structured assumption management resolved all questions before implementation.**  
27 assumptions across 6 phases were tracked, classified, and resolved — every single one through either code analysis or user decisions. Zero open assumptions at implementation time meant zero surprises during coding. The implementation was a clean execution of a fully-specified design.

**2. The interview-style elicitation was highly efficient.**  
Presenting 8 focused questions with concrete options (grounded in codebase analysis) produced clear, actionable decisions in a single round. The user's decisions diverged from the agent's proposals on 4 of 6 assumptions — demonstrating that the interview format surfaced genuine design preferences rather than rubber-stamping agent recommendations.

**3. Codebase comprehension paid dividends.**  
Existing comprehension artifacts (workflow-server.md, zod-schemas.md, json-schemas.md) provided a strong baseline. The new schema-focused artifact identified the critical insight about `additionalProperties: false` requiring explicit JSON Schema property declarations, the dual-schema system (Zod vs JSON Schema validation scopes), and the `.refine()` type change risk — all of which directly informed implementation.

**4. Implementation was minimal and focused.**  
27 source lines, 1 tool line, 14 test cases. No new files created. No new dependencies. No loader changes. The strategic review confirmed 8/8 files on-scope with zero cleanup needed.

**5. Multi-workflow analysis revealed scope beyond expectations.**  
The design-philosophy analysis discovered that 8/10 workflows (not just work-package) have multi-agent rules across 3 distinct patterns. This expanded the design from "orchestrator/worker schema" to a general-purpose per-workflow role vocabulary — a stronger, more useful design.

## What Could Improve

**1. Activity count is high for a schema-addition work package.**  
13 activities for a 27-line schema change feels disproportionate. The full-workflow path (chosen by the user after complexity override) added elicitation, research, and comprehension activities that produced useful context but whose output was largely confirmatory rather than revelatory. A skip-optional path (the agent's original recommendation) would have been 7-8 activities with the same implementation outcome.

**2. TOON migration coordination was unclear until late.**  
The fact that TOON files live in a separate git worktree (`workflows` branch) wasn't discovered until the planning-phase assumptions (PA-01). This should have been identified during the comprehension activity. The implementation handled it correctly, but earlier discovery would have improved the plan.

**3. Research yielded limited novel insights.**  
The knowledge base had minimal directly-relevant content (SPEM role definitions, POSA coordination patterns). Web research confirmed the design was sound but didn't change any decisions. For a project-internal schema extension, research may be skippable in future unless external standards are involved.

## Lessons Learned

1. **Per-workflow role vocabulary is a novel pattern.** No surveyed framework uses it. This makes it both a differentiator and a risk — there's no external validation beyond our own analysis. Monitor adoption and extension pressure.

2. **User decisions can fundamentally reshape the design.** 4/6 assumption decisions diverged from agent proposals. The resulting design (simpler placement, no persistence, required field, per-workflow vocabulary) is coherent and arguably better than the agent's original proposal. The structured assumption review process enabled this.

3. **Atomic implementation is essential for required fields.** Schema + TOON + tests must all change in the same build. The dependency graph in the work package plan (T1→T2→T9-T18) correctly identified this constraint. Future required-field additions should follow the same pattern.

4. **`.strict()` alignment matters.** The initial implementation passed without `.strict()` on the new schemas. Two tests caught the gap, revealing that Zod's default strip-unknowns behaviour doesn't match the JSON Schema `additionalProperties: false` policy. Always add `.strict()` when JSON Schema uses `additionalProperties: false`.

## Key Statistics

| Dimension | Value |
|-----------|-------|
| Activities executed | 13 |
| Assumptions tracked | 27 (0 open) |
| User decisions captured | 14 (6 assumptions + 8 elicitation) |
| Industry frameworks compared | 6 |
| Files changed | 8 source + 10 TOON |
| Source lines added | 27 |
| Test cases added | 14 |
| Tests passing | 262/262 |
| Reviews | 2 approvals (code + strategic) |
| Commits | 20 (all GPG-signed) |
