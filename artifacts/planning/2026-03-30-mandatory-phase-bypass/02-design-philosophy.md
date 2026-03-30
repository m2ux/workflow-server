# Design Philosophy

**Work Package:** Mandatory Phase Bypass Fix  
**Issue:** [#86](https://github.com/m2ux/workflow-server/issues/86) — Orchestrator and worker bypass mandatory workflow phases  
**Created:** 2026-03-30

---

## Problem Statement

The work-package workflow defines an orchestrator/worker execution model via prose rules in `workflow.toon` (rules #9, #10, #11). These rules reference two universal skills — `orchestrate-workflow` and `execute-activity` — that fully specify how each agent should behave. Both skills exist as well-defined TOON files in `workflows/meta/skills/` (04-orchestrate-workflow.toon v4.0.0 and 05-execute-activity.toon v2.0.0). Despite being formally specified with detailed protocols, mandatory phases, and explicit rules, neither skill is followed in practice.

The root cause is a **discoverability gap**: when the worker calls `get_skills(workflow_id, activity_id)`, the response includes only the activity-declared skills (primary + supporting). The `execute-activity` universal skill — which defines the mandatory bootstrap, trace-writing, and progress-update phases — is not included. The worker has no way to discover its execution protocol through the standard skill-loading API unless it explicitly calls `get_skill('execute-activity')`. Meanwhile, the `orchestrate-workflow` skill's `dispatch-activity` protocol tells the worker to call `start_session`, `next_activity`, and `get_skills` — but does not mention loading `execute-activity`.

This gap produces three observable failures:

1. **The orchestrator pre-digests worker instructions.** The `orchestrate-workflow` skill (rule: `skill-loading-boundary`) explicitly prohibits this: *"The orchestrator MUST NOT call get_skill or get_skills to pre-load skills for worker activities."* In practice, the orchestrator calls these tools anyway and injects summarized content into the worker prompt.

2. **Semantic traces are never written.** The `execute-activity` skill (lines 52-56) defines a mandatory `write-semantic-trace` phase with a complete specification: JSON file at `{planning_folder_path}/{artifactPrefix}-semantic-trace.json` capturing step outputs, checkpoint responses, decision branches, loop iterations, and variable changes. This phase has never executed because the worker never loads the skill that defines it.

3. **The worker skips mandatory phases.** The `execute-activity` skill defines a complete execution protocol: bootstrap-rules → bootstrap-activity → bootstrap-skill → check-mode → execute-steps → yield-checkpoint → execute-loops → produce-artifacts → update-readme-progress (MANDATORY) → write-semantic-trace (MANDATORY) → report-completion. Workers follow an ad-hoc subset of this protocol.

### System Context

The workflow server is an MCP server for AI agent workflow orchestration. It exposes structured workflow definitions (TOON format) through tools like `next_activity`, `get_skills`, and `get_skill`. Agents discover activities, load skill protocols, and execute steps based on the server's responses.

The orchestrator/worker separation exists because:
- Sub-agent `AskQuestion` calls do not surface to the user — only the top-level agent can interact
- Context separation prevents worker saturation from accumulating across activities
- The orchestrator handles checkpoint mediation while the worker handles domain execution

The enforcement layer (Layer 6 in workflow-fidelity.md) provides mechanical tracing but explicitly acknowledges: *"Semantic trace is agent-dependent — the agent-written semantic trace relies on agent discipline. The server cannot verify that the agent wrote it or that it is complete."*

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | High — core execution model violations undermine workflow reliability |
| Scope | All work-package workflow executions (every work package since inception) |
| Business Impact | No execution audit trail exists; workflow compliance cannot be verified; orchestrator/worker separation provides no actual benefit when violated |

---

## Problem Classification

**Type:** Specific Problem — Cause Known  

**Subtype:**  
- [x] Cause Known (direct fix)  
- [ ] Cause Unknown (investigate first)  
- [ ] Improvement goal  
- [ ] Prevention goal  

**Complexity:** Complex (user-selected full workflow path)  

**Rationale:** The root cause is identifiable: the `execute-activity` and `orchestrate-workflow` skills are referenced in prose rules but have no corresponding formal definitions (TOON files, IDE rules, or discoverable protocols). The semantic trace phase is architecturally designed but never implemented as executable steps. The user selected full-workflow complexity to ensure thorough requirements elicitation and research before implementation, given that the fix touches foundational workflow execution patterns.

---

## Workflow Path Decision

**Selected Path:** Full workflow (elicitation + research)

**Activities Included:**  
- [x] Requirements Elicitation  
- [x] Research  
- [x] Codebase Comprehension  
- [x] Implementation Analysis  
- [x] Plan & Prepare  

**Rationale:** User selected full workflow despite the cause being known. The rationale for this expanded path:
- The fix touches the foundational execution model — changes propagate to all future work packages
- Requirements elicitation will surface edge cases in orchestrator/worker interaction that may not be obvious from the issue alone
- Research will investigate how to properly formalize the orchestrate-workflow and execute-activity protocols within the existing skill schema
- The semantic trace format needs careful design to balance completeness with context-window overhead

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Scope boundary | Must NOT overlap with #65 (server-side structural enforcement) or #51 (checkpoint enforcement) |
| Schema stability | Must NOT modify the TOON schema or workflow-server source code unless explicitly approved |
| Backward compatibility | Existing skills and activities must continue to work unchanged |
| Context budget | Semantic trace format must be compact enough not to saturate the worker's context window |
| Skill schema | New skills must conform to the existing skill TOON schema (`schemas/skill.schema.json`) |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Worker self-bootstrap | Worker calls `next_activity` and `get_skills` itself | 100% of activity executions |
| Semantic trace production | Trace file exists in planning folder after activity | Every activity execution |
| Orchestrator discipline | Orchestrator passes only session token + context variables | No pre-digested content in worker dispatch |
| Phase completeness | All mandatory phases in execute-activity protocol are executed | No silent phase omissions |

---

## Notes

- The `executionModel` schema field (ADR-0002, #84/#85) now declares roles at the workflow level. The missing piece is the behavioral protocol for each role — what exactly does the orchestrator do at each transition, and what exactly does the worker do upon receiving a dispatch.
- The `workflow-fidelity.md` two-layer trace architecture provides the design target for the semantic trace. The gap is translating the architecture into executable skill steps.
- The `aid` (agent ID) field in session tokens already distinguishes orchestrator from worker calls, which means the server can attribute trace events to the correct agent. The semantic trace complements this by capturing the agent's reasoning and decisions.
