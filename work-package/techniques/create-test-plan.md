---
metadata:
  version: 1.1.0
---

## Capability

Create test strategy and test plan with cases and acceptance criteria

## Inputs

### plan_tasks

Atomic task breakdown with dependencies and ordering for the work package

## Outputs

### test_plan_document

Test [strategy](../resources/test-plan.md#test-plan-structure) and acceptance criteria

#### artifact

`test-plan.md`

## Protocol

### 1. Load Guidance

- Take the artifact shape from the [test-plan templates](../resources/test-plan.md#templates) and the test-design principles from the same resource; the authoring rules below govern the content

### 2. Define Strategy

- Define test strategy for the work package (unit, integration, e2e), using the `{plan_tasks}` breakdown to scope coverage to each task and its dependencies
- If `{requirements}` are not available, prompt the user to complete elicitation before continuing with test planning
- Identify which `{requirements}` need which types of tests
- Determine test infrastructure needs (fixtures, mocks, test doubles)

### 3. Create Test Cases

- Create specific test cases for each requirement
- Include boundary conditions, error paths, and edge cases
- Link each test case to its requirement and acceptance criterion
- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../meta/techniques/gitnexus-operations/query.md)(query: `{$concept}`) to find existing test patterns for related concepts and [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md)(name: `{$symbol}`) to identify error-path callees as edge-case test candidates.

### 4. Write Artifact

- Create the `{test_plan_document}` artifact in `{planning_folder_path}`
- Structure with strategy, test cases, and acceptance criteria matrix

## Rules

### lifecycle-phases

Test plans have two phases: (1) Initial placeholder at PR creation — objectives only, no source links; (2) Finalized after implementation — hyperlinks to actual test source locations added by finalize-documentation technique.

### skip-conditions

Skip formal test plan for: simple bug fixes with obvious test cases, documentation-only changes, single-test changes, refactoring with existing coverage.

### structure-and-header

Required sections, in order: header link line (ADR, Ticket, PR — relative path for the same-repo ADR link), Overview, Test Cases, Acceptance Criteria Matrix (when requirements exist), Running Tests. The Overview lists only symbols central to the change (not every modified function), one line each, hyperlinked per [manage-artifacts](./manage-artifacts/TECHNIQUE.md#hyperlink-conventions).

### unified-test-case-table

One table for all test types — never split by type. Fixed column widths via `<div style="width:...px">`: Test ID 120px, Objective 350px, Steps 400px, Expected Result 350px, Type 50px.

### test-id-format

Test IDs are `PR<number>-TC-<sequence>` (01, 02, ...), hyperlinked to the test function definition line (`#L<line>`, not the first assertion). Manual tests (RPC endpoints, network behavior, UI verification) use plain-text non-hyperlinked IDs — no source to link. Temporarily disabled tests stay in the same table with a `**` suffix after the Test ID (suffix, not prefix, so the link keeps working), plus a `> [!NOTE]` below the table stating the reason and the specific re-enablement condition — no separate table for ignored tests.

### test-case-content

Objectives start with "Verify..." — never vague ("test the feature"). Steps are numbered, atomic, and verifiable, separated with `  <br>` (two trailing spaces + `<br>` for cross-renderer compatibility). Type is one of: Unit (isolated single function/method behavior), Integration (component interactions), E2E (complete user workflows), Performance (load/latency validation), Manual.

### acceptance-criteria-mapping

One matrix row per requirement (or per acceptance criterion when a requirement has several), referencing tests by their `PR###-TC-##` IDs. Every requirement maps to at least one test case; flag any gaps.

### content-boundaries

The plan covers validation only — no ADR content or implementation details. No References section (links are inline); never inline planning-artifact content or validation results — link the source artifact (manage-artifacts single-source-and-link). Running Tests commands are copy-pasteable, covering all-tests, module, and specific-test scopes, plus build verification if relevant.

### naming-and-storage

When promoted into project docs: file name `test-plan-<kebab-case-name>.md` matching the ADR name where possible, stored alongside the ADR or in the tests documentation folder. The PR description links the test plan on its artifact link line.
