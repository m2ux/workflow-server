---
metadata:
  version: 1.0.0
---

## Capability

Base contract inherited by sibling techniques.

## Inputs

### target-content

The code or text to analyze — a file path or inline content.

### target-type

*(optional)* Whether the input is 'code' or 'general'.

#### default

code

### output-path

*(optional)* Directory to write analysis artifacts.

#### default

.

## Rules

### complete-execution

Every step in the lens prompt must be executed. Do not skip or summarize operations — the depth comes from the full chain.

### evidence-required

All findings must cite specific code or text: file paths, function names, line ranges, specific passages. Abstract claims without evidence are not findings.

### tool-usage

Dispatch all workers via harness-compat spawn-agent. Never use continue-agent on a prior worker — each dispatch is a fresh isolated context.

### model-selection

Lens workers use the model defined in the lens YAML frontmatter. Synthesis and coordination steps use sonnet.
