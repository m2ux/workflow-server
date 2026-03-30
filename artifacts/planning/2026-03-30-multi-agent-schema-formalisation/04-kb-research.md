# Research — Multi-Agent Schema Formalisation

**Activity:** research (v2.3.0)  
**Date:** 2026-03-30  
**Issue:** [#84](https://github.com/m2ux/workflow-server/issues/84)

---

## 1. Knowledge Base Findings

### 1.1 SPEM 2.0 Role Definitions (OMG formal-08-04-01)

The Software & Systems Process Engineering Meta-Model defines roles as first-class schema elements:

- **RoleDefinition**: A method content element describing competencies, skills, and responsibilities
- **RoleUse**: A reference to a RoleDefinition within a specific process context
- **Performer kinds**: RACI-VS pattern (Responsible, Accountable, Consulted, Informed, Verifies, Signs)

**Relevance to our design:** SPEM separates role definition (what the role IS) from role use (how the role PARTICIPATES in a process). Our schema mirrors this: `executionModel.roles[]` defines roles, while prose `rules[]` describe how roles participate. SPEM uses a global role vocabulary with per-process binding; we use a per-workflow vocabulary — a simpler but less reusable approach.

### 1.2 Distributed Computing Patterns (POSA Vol. 4)

The pattern language for distributed computing identifies delegation, coordination, and observer patterns. The orchestrator/worker pattern maps to POSA's **Coordinator** pattern (centralised control with delegation to specialised handlers).

**Relevance:** Validates the separation of orchestration from execution. Our schema declares the coordination structure (roles) while the orchestration logic remains in prose and skills.

---

## 2. Industry Framework Comparison

### 2.1 Agent Role Definition Schemas

| Framework | Core Identity | Behavioral Config | Extensibility |
|-----------|--------------|-------------------|---------------|
| **CrewAI** | role, goal, backstory | tools, allow_delegation, max_iterations, max_rpm | Open (additional attributes supported) |
| **AutoGen** | name, system_message | llm_config, human_input_mode, code_execution | Open (kwargs) |
| **LangGraph** | role, goal, backstory (CrewAI-compatible) | tools, memory, HITL config, MCP integration | Open (extensible nodes) |
| **AI-SDLC** | role, goal, backstory | tools, constraints, handoffs | Structured (explicit handoff contracts) |
| **MPLP** | Role module (schema-first) | JSON Schema Draft-07 data contracts | Schema-first (10 core modules) |
| **Our design** | **id, description** | **None (prose rules)** | **Strict (additionalProperties: false)** |

### 2.2 Key Industry Patterns

**Role-Goal-Backstory (RGB) pattern**: CrewAI established and LangGraph adopted a three-part identity pattern:
- **Role** ≈ our `id` — the agent's function
- **Goal** ≈ part of our `description` — what the agent aims to achieve
- **Backstory** ≈ part of our `description` — expertise context

Our `id` + `description` collapses goal and backstory into a single field. This is simpler but loses the semantic distinction between "what to achieve" (goal) and "why this agent is qualified" (backstory). Given our descriptive-only approach (no runtime enforcement), this distinction would be informational, not functional.

**Declarative agent configuration**: The 2026 trend is toward Markdown/YAML/JSON Schema declarations that separate "what" (role identity) from "how" (runtime behavior) from "when" (orchestration timing). Our TOON-based approach with JSON Schema validation aligns with this direction.

**Separation of role definition from role binding**: SPEM, MPLP, and AI-SDLC all separate declaring a role from assigning it to a process step. Our design follows this: roles are declared in `executionModel`, assigned to activities through prose rules. A future iteration could add structured role-to-activity binding (activity-level overrides, excluded by A-02).

---

## 3. Synthesis: Alignment with Our Design

### 3.1 Validated Design Choices

| Design Decision | Industry Alignment | Assessment |
|----------------|-------------------|------------|
| Per-workflow role vocabulary | **Unique** — most frameworks use per-agent configuration, not per-workflow. SPEM uses global vocabulary. | Novel but sound. Provides validation without cross-workflow coupling. |
| id + description only | **Simpler than industry norm** — frameworks use 3+ identity fields. | Sufficient for declarative-only use. Can extend later if needed. |
| Roles as declarations, not configurations | **Aligned** — MPLP and declarative plugin separate identity from capability. | Clean separation. Runtime config is out of scope. |
| No behavioral metadata | **Divergent** — all frameworks attach at least tools/constraints to roles. | Acceptable given descriptive-only approach. Prose rules carry this instead. |
| Strict schema | **Divergent** — most frameworks are permissive. | Consistent with workflow-server's own policy. Trade-off: slower evolution, stronger guarantees. |

### 3.2 Risks Identified

**R-01: Extension pressure.** The industry trend is toward richer role definitions (tools, constraints, handoffs, delegation policies). Our minimal design may need extension sooner than typical for a new schema construct. **Mitigation:** Out-of-scope table in 03-requirements-elicitation.md documents 7 future extension paths. The strict schema requires version bumps for extensions, which provides a controlled evolution mechanism.

**R-02: Semantic gap between declaration and behavior.** With roles defined only by id + description and all behavior in prose, there's no machine-readable link between "this role exists" and "this is what it does." Agents must read both `executionModel.roles` and `rules[]` to understand the execution model. **Mitigation:** This is the deliberate design choice (roster-only, Q1). The execution model provides discoverability ("is this a multi-agent workflow?") while prose provides detail. A future structured-constraints extension (Q3 out-of-scope) would close this gap.

**R-03: No standard for per-workflow role vocabularies.** No surveyed framework uses per-workflow role declaration. Most use per-agent configuration with no vocabulary validation. Our approach is novel. **Mitigation:** The pattern is internally consistent and the user explicitly requested it (A-03). The simplicity (unique ID validation only, Q7) limits the blast radius of this novelty.

### 3.3 Research Assumptions

All research assumptions were resolved — no open assumptions requiring user input:

| ID | Assumption | Resolution |
|----|-----------|-----------|
| RA-01 | Minimal id+description is a valid starting point | Confirmed — maps to the "role" component of the industry-standard RGB pattern. Goal and backstory are optional enrichments, not prerequisites. |
| RA-02 | Strict schema diverges from industry norms | Acknowledged — explicit trade-off the user accepted (Q8). Consistent with project policy. |
| RA-03 | Industry trend toward richer roles suggests future extension is likely | Accounted for — out-of-scope table documents 7 extension paths. Strict schema provides controlled evolution. |

---

## 4. Recommendations

No design changes recommended. The research validates the current design as a sound minimal starting point. The main risk (extension pressure) is already mitigated by documented extension paths. The per-workflow role vocabulary is novel but internally consistent with the project's schema philosophy.

The research confirms that the implementation should proceed as specified in 03-requirements-elicitation.md.
