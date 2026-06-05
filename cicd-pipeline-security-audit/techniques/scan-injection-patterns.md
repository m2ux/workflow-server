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

### workflow-files

List of workflow file paths to scan

### reconnaissance-data

Pre-classified trigger, permission, and checkout data for the workflow files

### ai-config-inventory

*(optional)* AI configuration files found in the submodule

## Protocol

### 1. Load Patterns

- Use attached [injection-pattern-catalog](../resources/injection-pattern-catalog.md) (injection-pattern-catalog) for grep patterns, untrusted context lists, and detection heuristics
  - If the [injection-pattern-catalog](../resources/injection-pattern-catalog.md) cannot be loaded, fall back to the built-in pattern definitions
- Scope the scan to the `workflow-files` paths, and load the `reconnaissance-data` so each file's pre-classified triggers, permissions, and checkout behavior is available to the pattern checks below
  - If a workflow file cannot be read, record it as unscanned and flag it in the coverage report

### 2. P1 Expression Injection

- Search run: blocks for ${{ }} expressions
- Cross-reference each expression against the untrusted context variable list
- Distinguish safe contexts (if: conditions, action version pins) from unsafe contexts (shell interpolation, script content, action inputs that reach shell)
- For each unsafe expression, document the source context variable and the sink (run block, script, action) using the structured finding format (see [sub-agent-output-schema](../resources/sub-agent-output-schema.md))
- Expressions in if: conditions, env: key-value (not interpolated into shell), and action version pins are safe and should not be flagged

### 3. P2 Pwn Request

- Identify workflows with pull_request_target trigger
- Check for checkout of PR head (ref: github.event.pull_request.head.sha or head.ref)
- Check for code execution after checkout (run:, uses: with local action, build commands)

### 4. P3 Comment Trigger

- Identify workflows triggered by issue_comment or pull_request_review_comment
- Check for author_association filtering (MEMBER, OWNER, COLLABORATOR)
- Flag workflows that execute privileged operations on any commenter's trigger

### 5. P4 Excessive Permissions

- Flag workflows with contents: write, pull-requests: write, or no permissions block
- Check whether write permissions are justified by the workflow's purpose

### 6. P5 Fork Execution

- Identify checkout of fork/PR code in any trigger context
- Check for subsequent execution commands (run:, build, test, go run, npm, cargo, python)
- Trace whether secrets are accessible in the execution context

### 7. P6 Ai Config

- Using the `ai-config-inventory`, check whether AI config files (CLAUDE.md, AGENTS.md, .cursorrules) exist in the submodule
- Verify they are listed in CODEOWNERS with mandatory review protection

### 8. P7 Dangerous Execution

- Search run: blocks for curl|bash, wget|sh, eval, and base64 decode + execute patterns
- Search referenced shell scripts for the same patterns
- Flag dynamic script generation (echo commands building scripts then executing them)

### 9. Assemble Results

- Collect every flagged item, observation, and per-file/per-pattern scan confirmation into `scan-results`, emitting the structured artifact for this submodule

## Outputs

### scan-results

Structured findings for this submodule

#### artifact

[`s{n}-{submodule}.json`](../resources/sub-agent-output-schema.md#schema)

#### findings

Each with pattern_id, source, sink, severity_hint, file, lines, evidence

#### observations

Items without clear source-to-sink flow

#### coverage

Per-file, per-pattern scan confirmation

## Rules

### source-sink-required

Every finding MUST identify both the source and the sink

### evidence-required

Every finding must include the vulnerable code snippet

### chain-tracing

For P2 and P5, trace the complete chain from trigger through checkout to execution
