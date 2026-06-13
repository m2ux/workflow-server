---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
---

## Capability

Apply all seven CI/CD injection detection patterns (P1-P7) — derived from the hackerbot-claw campaign and GitHub's script injection documentation, each identifying a specific source-to-sink vulnerability class — to GitHub Actions workflow files, tracing data flow from attacker-controlled input (source) to privileged execution (sink) and documenting the complete chain.

## Inputs

### submodule

Directory name of the submodule being scanned.

### scanner_number

The 1-based scanner agent ordinal (the numeric part of the `S1`-`Sn` designator).

### workflow_files

List of workflow file paths to scan

### workflow_inventory

Complete [inventory of workflow files](../resources/intermediate-artifact-schemas.md#workflow-inventory) with pre-classified trigger, permission, and checkout data.

### ai_config_inventory

*(optional)* AI configuration files found in the submodule

## Protocol

### 1. Load Patterns

- Load the [injection-pattern-catalog](../resources/injection-pattern-catalog.md) for grep patterns, untrusted context lists, and detection heuristics.  
  > If the [injection-pattern-catalog](../resources/injection-pattern-catalog.md) cannot be loaded, fall back to the built-in pattern definitions.
- Scope the scan to the `{workflow_files}` paths and load `{workflow_inventory}` so each file's pre-classified triggers, permissions, and checkout behavior is available to the pattern checks below.  
  > If a workflow file cannot be read, record it as unscanned and flag it in `{scan_results.coverage}`.

### 2. P1 Expression Injection

- Search `run:` blocks for `${{ }}` expressions
- Cross-reference each expression against the untrusted context variable list
- Distinguish safe contexts (`if:` conditions, action version pins) from unsafe contexts (shell interpolation, script content, action inputs that reach shell)
- For each unsafe expression, document the source context variable and the sink (`run:` block, script, action) into `{scan_results.findings}`
- Treat expressions in `if:` conditions, `env:` key-value (not interpolated into shell), and action version pins as safe contexts — exclude them from P1 findings.

### 3. P2 Pwn Request

- Identify workflows with `pull_request_target` trigger
- Check for checkout of PR head (`ref: github.event.pull_request.head.sha` or `head.ref`)
- Check for code execution after checkout (`run:`, `uses:` with local action, build commands)  
  > A `pull_request_target` trigger alone is not a finding; it becomes one only when combined with fork code checkout and execution.

### 4. P3 Comment Trigger

- Identify workflows triggered by `issue_comment` or `pull_request_review_comment`
- Check for `author_association` filtering (MEMBER, OWNER, COLLABORATOR)
- Flag workflows that execute privileged operations on any commenter's trigger

### 5. P4 Excessive Permissions

- Flag workflows with `contents: write`, `pull-requests: write`, or no permissions block
- Check whether write permissions are justified by the workflow's purpose

### 6. P5 Fork Execution

- Identify checkout of fork/PR code in any trigger context
- Check for subsequent execution commands (`run:`, build, test, `go run`, `npm`, `cargo`, `python`)
- Trace whether secrets are accessible in the execution context

### 7. P6 Ai Config

- Using `{ai_config_inventory}`, check whether AI config files (`CLAUDE.md`, `AGENTS.md`, `.cursorrules`) exist in the submodule
- Verify they are listed in `CODEOWNERS` with mandatory review protection, and check whether any workflow loads them as trusted context.  
  > When no `CODEOWNERS` file exists, flag every AI config file.

### 8. P7 Dangerous Execution

- Search `run:` blocks for `curl|bash`, `wget|sh`, `eval`, and `base64` decode + execute patterns
- Search referenced shell scripts for the same patterns
- Flag dynamic script generation (`echo` commands building scripts then executing them)

### 9. Assemble Results

- Collect every flagged item, observation, and per-file/per-pattern scan confirmation into `{scan_results}`, emitting the structured artifact for this submodule

## Outputs

### scan_results

Structured findings for this submodule, conforming to the [scanner output schema](../resources/sub-agent-output-schema.md#schema).

#### artifact

`s{scanner_number}-{submodule}.json`

#### findings

Each with pattern_id, source, sink, severity_hint, file, lines, evidence

#### observations

Items without clear source-to-sink flow

#### coverage

Per-file, per-pattern scan confirmation

## Rules

### all-seven-patterns-applied

All seven detection patterns (P1-P7) are applied to every workflow file in scope; no pattern is skipped for any file.

### source-sink-required

Every finding identifies both the source (attacker-controlled input) and the sink (privileged execution point), with the affected file path and line range.

### evidence-required

Every finding includes the vulnerable code snippet as evidence.

### chain-tracing

For P2 and P5, trace the complete chain from trigger through checkout to execution.
