# Requirements Elicitation

## Problem Statement

The current workflow system uses discrete markdown files with graphical flowcharts to guide AI agents. While human-readable, this approach has limitations:

- **Discoverability:** Agents must know file paths to access workflows
- **Interoperability:** No standard protocol for workflow access
- **Execution:** Flow logic embedded in prose, not machine-parseable
- **State Management:** No structured way to track progress

## Goals

1. Improve workflow discoverability via MCP protocol
2. Enable programmatic access to workflow structure
3. Separate flow orchestration (JSON) from guidance content (markdown)
4. Maintain human-readable documentation

## Stakeholders

- **AI Agents:** Primary consumers of workflow definitions
- **Developers:** Maintain and extend workflows
- **Users:** Interact with agents following workflows

## Scope

### In Scope

- MCP server for workflow access
- Workflow schema with phases, steps, checkpoints, decisions, loops
- Migration of `work-package.md` to JSON format
- Unit and integration tests

### Out of Scope (Future)

- Client-side state persistence implementation
- Condition evaluation engine
- Real-time workflow execution monitoring
- Multi-agent coordination

## Success Criteria

1. MCP server operational with 6 tools
2. Workflow schema validated with Zod
3. work-package workflow migrated (11 phases)
4. Test suite passing (50+ tests)

## Decisions

### Implementation Language
**Decision:** TypeScript
**Rationale:** MCP SDK maturity, type safety with Zod, ecosystem alignment

### State Management
**Decision:** Client-side
**Rationale:** Simpler server, agent controls execution, no server state to persist

### Condition DSL
**Decision:** Shallow AND/OR with simple comparisons
**Rationale:** Sufficient for workflow logic, avoids complex expression parsing

### Guide Content Delivery
**Decision:** URLs only, not served directly
**Rationale:** Agents can fetch content; keeps MCP responses lightweight

### Repository Structure
**Decision:** Orphan branch for workflow data
**Rationale:** Separate versioning for code and data
