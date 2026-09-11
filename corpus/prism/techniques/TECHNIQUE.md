---
metadata:
  version: 1.1.0
---

## Capability

Shared inputs and isolation, evidence, and write-discipline invariants for every prism analysis technique.

## Inputs

### target_content

The code or text to analyze — a file path or inline content.

### target_type

*(optional)* Whether the input is `code` or `general`.

#### default

`code`

### output_path

*(optional)* Directory to write analysis artifacts.

#### default

`.`

## Rules

### complete-execution

Every operation in the lens prompt is executed. Do not skip or summarize operations — the analytical depth comes from the full chain.

### evidence-required

All findings cite specific code or text: file paths, function names, line ranges, specific passages. Abstract claims without evidence are not findings.

### isolated-context

Each analytical pass is dispatched to a fresh sub-agent via [harness-compat](../../meta/techniques/harness-compat/TECHNIQUE.md)::[spawn-agent](../../meta/techniques/harness-compat/spawn-agent.md); never [continue-agent](../../meta/techniques/harness-compat/continue-agent.md) on a prior worker. A worker receives only the textual content provided in its prompt — never the generation history of a prior pass.

### artifact-mediated

Pass outputs travel between workers as filesystem artifacts addressed by path, never as inline analysis text. A worker reads prior-pass content from the artifact path and writes its own output to its target path.

### write-immediately

A worker with write access writes its artifact directly to the target path without asking permission or deferring. After writing, it reports the written path, the file size, and the format-validation status (`OK` or `FAIL`). A genuine operational barrier (missing directory, filesystem permission error, network unavailable) is surfaced as `[BLOCKER]: <issue>. Requires: <resolution>. Blocking: <progress>.`; uncertainty about whether to write is not a blocker.

### model-selection

Lens workers use the model declared in the lens resource's YAML frontmatter. Synthesis and coordination steps use Sonnet.
