# Knowledge Base & Web Research

**Work Package:** Rule-to-Skill Migration (#88)  
**Created:** 2026-03-31  
**Activity:** Research (04)

---

## Research Questions

1. How should extracted rule groups be structured as skills?
2. What should the minimal `start_session` bootstrap response look like?
3. What migration ordering minimizes risk?
4. What should `meta/rules.toon` look like after migration?
5. How to verify behavioral equivalence?

---

## Internal Codebase Research

### Finding 1: Existing Skill Structure Provides a Clear Template

The codebase has 9 universal skills in `meta/skills/` and 24 workflow-specific skills in `work-package/skills/`. Both follow the same schema with these key fields:

| Field | Purpose | Relevance |
|-------|---------|-----------|
| `id`, `version`, `capability` | Identity (required) | Every extracted skill needs these |
| `protocol` | Phase-keyed procedure steps | Formalizes what rules currently express as prose |
| `rules` | Named key-value domain rules | Direct mapping from workflow rule arrays |
| `inputs` / `output` | Expected context and produced artifacts | May not apply to all extracted rule groups |
| `resources` | Resource indices this skill depends on | Can attach guides, checklists, templates |
| `tools` | Tool definitions with when/params/returns | Tool-specific behavioral constraints |
| `errors` | Error recovery strategies | Already present in some rule prose |

**Key insight**: Skills use `rules` as flat key-value pairs (`{ "rule-name": "rule text" }`), while workflow.toon `rules[]` uses ordered string arrays. The extracted skills should use the key-value format for named addressability. Workflow-level rule arrays that remain should stay as string arrays (different schema context).

### Finding 2: Layered Skill Resolution Already Supports the Architecture

`readSkill()` in `skill-loader.ts:101-134` implements a 3-tier lookup: (1) workflow-specific → (2) universal (`meta/skills/`) → (3) cross-workflow scan. Skills placed in `meta/skills/` are automatically available to all workflows without any explicit declaration. This means:

- Extracted skills placed in `meta/skills/` are immediately available
- No workflow TOON changes are needed to *access* the skills (only to remove the duplicated rules)
- Workflow-specific overrides are possible if a workflow needs a variant

### Finding 3: The Chicken-and-Egg Problem with start_session Slimming

`start_session` returns 85 rules (16 sections) that tell agents HOW to interact with the server (token protocol, resource usage, step manifests). But some of these rules govern how to call `get_skills` itself. If we move all rules into skills, agents won't know the protocol for loading skills until they load skills — a bootstrap paradox.

**Resolution**: The `session-protocol` section (11 rules about token usage, step manifests, resource access) MUST remain in `start_session`. Everything else can migrate to skills. The minimal bootstrap instruction becomes: "Call `get_skills(workflow_id)` to load behavioral protocols. Skills are automatically included based on your workflow."

### Finding 4: meta/rules.toon Current Inventory (16 Sections, 85 Rules)

| Section | Rules | Migration Path |
|---------|-------|---------------|
| session-protocol | 11 | **Keep in start_session** — bootstrap dependency |
| workflow-fidelity | 4 | Merge into `orchestrate-workflow` or new `workflow-fidelity` skill |
| code-modification | 6 | New skill: `code-modification-discipline` |
| implementation-workflow | 5 | Merge into `execute-activity` protocol |
| file-restrictions | 4 | New skill: `file-restrictions` or merge with code-modification |
| communication | 6 | **Keep as guardrails** — too generic for a skill |
| documentation | 5 | **Keep as guardrails** — applies everywhere |
| task-management | 12 | **Keep as guardrails** — IDE concern |
| error-recovery | 9 | **Keep as guardrails** — universal behavior |
| version-control | 14 | New skill: `version-control-protocol` |
| engineering-artifacts | 14 | New skill: `engineering-artifacts-management` |
| github-cli | 10 | New skill: `github-cli-protocol` |
| context-management | 7 | **Keep as guardrails** — IDE concern |
| orchestration | 9 | Merge into existing `orchestrate-workflow` skill |
| build-commands | 2 | **Keep as guardrails** — too small for a skill |
| domain-tool-discipline | 4 | **Keep as guardrails** — pure safety constraint |

**Summary**: ~45 rules migrate to skills, ~29 stay as guardrails in a slimmed rules.toon, ~11 stay for session protocol.

### Finding 5: Workflow-Level Rule Duplication Map

| Rule Group | Duplicated In | Approx Rules | Best Skill Location |
|------------|---------------|--------------|---------------------|
| Orchestrator discipline | work-package, prism, prism-audit, prism-evaluate, cicd-audit, substrate-audit | ~24 | Merge into `meta/skills/orchestrate-workflow` |
| Worker execution | work-package, prism, prism-audit, prism-evaluate, cicd-audit | ~12 | Merge into `meta/skills/execute-activity` |
| Analytical isolation | prism, prism-audit, prism-evaluate | ~10 | New skill: `prism/skills/analytical-isolation` |
| Prism report formatting | prism, prism-audit, prism-evaluate | ~19 | New skill: `prism/skills/report-formatting` |
| Security audit pipeline | cicd-audit, substrate-audit | ~13 | New shared skill or cicd-specific |
| Worker permissions (prism) | prism, prism-audit, prism-evaluate | ~9 | Include in analytical-isolation |

### Finding 6: list_workflows Meta Exclusion Is Trivial

`listWorkflows()` in `workflow-loader.ts:119-157` has no filtering. Adding a `META_WORKFLOW_ID` check (matching the pattern already used in `skill-loader.ts` at 4 call sites) is a one-line change. No schema or configuration changes needed.

---

## Web Research

### Finding 7: MCP Best Practice — Dynamic Loading Over Monolithic Payloads

Industry best practice for MCP servers (2026) strongly recommends **dynamic tool/capability loading** over upfront monolithic payloads. Loading all tool definitions wastes 30-50% of the context window before the agent processes the first message. The recommended pattern is to load only the capabilities needed for specific workflows.

**Source**: "MCP Best Practices: 12 Rules for Production Deployment" (Apigene, 2026)

This directly validates our approach: moving from an 85-rule monolithic `start_session` payload to on-demand skill loading via `get_skills` aligns with the industry direction.

### Finding 8: Tool Organization — Namespace and Workflow Alignment

MCP best practices recommend organizing tools around workflows rather than individual API operations, and using namespace organization as servers scale. The workflow-server's existing `meta/skills/` vs `{workflow}/skills/` hierarchy already follows this pattern. The extracted skills should maintain this namespace discipline:

- **Cross-cutting protocol skills**: `meta/skills/` (orchestrator-discipline, worker-execution)
- **Domain-specific skills**: `{workflow}/skills/` (analytical-isolation in prism)

---

## Synthesis

### Recommended Skill Structure for Extracted Rule Groups

Each extracted rule group should follow this template:

```
id: {skill-name}
version: 1.0.0
capability: {One-line description of what constraints this skill enforces}

description: {2-3 sentences explaining why these constraints exist and when they apply}

protocol:
  {phase-name}[N]:
    - {Imperative bullet: what the agent must do}

rules:
  {rule-name}: {Rule text}

errors:
  {error-case}:
    cause: {What triggers this}
    recovery: {How to recover}
```

**Key decisions:**
- `protocol` sections formalize the *procedure* (ordered steps the agent follows)
- `rules` section captures *constraints* (named, addressable guardrails)
- Not every extracted group needs `tools`, `inputs`, or `output` — these apply only when the skill governs specific tool usage patterns
- Resources should be used for lengthy reference material (checklists, templates, guides) that would bloat the skill file

**CORRECTION (stakeholder):** P1 orchestrator-discipline should NOT merge into a single universal `orchestrate-workflow` skill. Three orchestration models exist (persistent-worker, disposable-worker, concurrent-dispatch). Orchestration discipline must be family-specific. Additionally, `workflow-execution` (01) should be absorbed into `execute-activity` (05) or deprecated — it's a shallow API reference fully superseded by execute-activity's behavioral protocol.

### Recommended start_session Slimming Approach

**Option B (selected): Retain session-protocol, remove everything else.**

```
start_session response:
  rules:
    sections[2]:
      - id: session-protocol  (11 rules — token, step manifest, resource usage)
      - id: bootstrap
        rules[1]:
          - "Call get_skills(workflow_id) to load behavioral protocols for your workflow.
             Workflow-level skills are auto-included on the first call."
  workflow: { id, version, title, description }
  session_token: <token>
```

This preserves the bootstrap protocol (agents need to know HOW to call `get_skills`) while moving domain rules to skills. Estimated payload reduction: ~75 rules removed from initial response.

### Recommended Migration Ordering

**Phase 1: Extract skills (low risk, high value)**
1. Create P1 universal skills: merge orchestrator-discipline into `orchestrate-workflow`, merge worker-execution into `execute-activity`
2. Remove duplicated rules from workflow.toon files
3. Validate: all tests pass, agent behavior unchanged

**Phase 2: Extract remaining skills (medium risk)**
4. Create P2 skills: analytical-isolation, prism-report-formatting (prism-specific), engineering-artifacts-management, dispatch-verify-merge-pipeline
5. Create P3 skills: version-control-protocol, github-cli-protocol, human-interaction-protocol
6. Remove remaining duplicated workflow rules

**Phase 3: Architecture changes (requires careful sequencing)**
7. Slim `meta/rules.toon` to session-protocol + bootstrap instruction
8. Update `start_session` to return slimmed payload (no code change needed if rules.toon is simply reduced)
9. Exclude meta from `list_workflows` (one-line filter in `workflow-loader.ts`)
10. Update tests to expect new response shape

**Rationale**: Extracting skills first ensures the formal definitions exist before we remove rules. Architecture changes come last because they affect the bootstrap contract.

### Behavioral Equivalence Verification

1. **Rule-by-rule mapping**: Create a traceability matrix — each original prose rule maps to a specific skill rule or protocol step
2. **Test suite**: Existing tests in `rules-loader.test.ts` and `mcp-server.test.ts` verify structure; update expectations
3. **Integration testing**: Run `start_session` → `get_skills` flow and verify all behavioral constraints are discoverable
4. **Diff analysis**: Compare total rule surface area before and after migration — no rule should be lost, only relocated

### Risks and Anti-Patterns

| Risk | Impact | Mitigation |
|------|--------|------------|
| Rules lost during extraction | Agents miss constraints, behavioral regression | Traceability matrix, diff analysis |
| Skill granularity too fine | Too many small skills, discovery overhead | Group related rules into coherent skills |
| Skill granularity too coarse | Monolithic skills that are hard to compose | Keep skills focused on a single responsibility |
| start_session too minimal | Agents can't bootstrap without rules | Keep session-protocol section intact |
| Breaking existing agent implementations | Agents that parse start_session rules fail | Gradual migration, keep rules.toon valid |

---

## Applicable Patterns

1. **Extraction Refactoring** — Extract duplicated prose into formal, reusable definitions (skill = "extract method" for behavioral protocols)
2. **Layered Resolution** — Universal defaults overridable at workflow level (already implemented in skill-loader)
3. **Bootstrap Protocol** — Minimal initial handshake that teaches agents how to discover capabilities on-demand
4. **Traceability Matrix** — Map every original rule to its destination in the new architecture

---

## Open Questions for Plan-Prepare

1. Should orchestrator-discipline rules be *merged* into the existing `orchestrate-workflow` skill (which already has similar content in its `rules` section) or created as a *separate* skill? Merging reduces skill count but enlarges an already large skill (164 lines).
2. Should prism-specific skills (analytical-isolation, report-formatting) go in `prism/skills/` (scoped to prism family) or `meta/skills/` (universal)? They're used by 3 prism-family workflows but not by others.
3. For the ~29 rules staying as guardrails in rules.toon: should they remain as a single rules.toon file or be split into a separate "guardrails" skill that's returned alongside session-protocol?
