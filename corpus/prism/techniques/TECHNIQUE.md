---
metadata:
  version: 1.2.0
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

### repo_name

*(optional)* Name of the indexed graph covering the target, which every graph read addresses. Empty where no graph covers the target, which is the condition a graph read falls back from.

#### default

`""`

## Rules

### complete-execution

Every operation in the lens prompt is executed. Do not skip or summarize operations — the analytical depth comes from the full chain.

### evidence-required

All findings cite specific code or text: file paths, function names, line ranges, specific passages. Abstract claims without evidence are not findings.

### isolated-context

Each analytical pass runs in a context that has never seen a prior pass, and no pass is continued on the worker that produced the one before it. A worker receives only the textual content its prompt carries — never the generation history of a prior pass. Which dispatch instrument delivers that isolation is the binding activity's to choose.

### artifact-mediated

Pass outputs travel between workers as filesystem artifacts addressed by path, never as inline analysis text. A worker reads prior-pass content from the artifact path and writes its own output to its target path.

### write-immediately

A worker with write access writes its artifact directly to the target path without asking permission or deferring. After writing, it reports the written path, the file size, and the format-validation status (`OK` or `FAIL`). A genuine operational barrier (missing directory, filesystem permission error, network unavailable) is surfaced as `[BLOCKER]: <issue>. Requires: <resolution>. Blocking: <progress>.`; uncertainty about whether to write is not a blocker.

### model-selection

Lens workers use the model declared in the lens resource's YAML frontmatter. Synthesis and coordination steps use Sonnet.
