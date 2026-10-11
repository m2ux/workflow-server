---
metadata:
  version: 1.1.0
---

## Capability

Assess how far a multi-package initiative has already got: the completion state of each previously identified package and what has changed since the last session

## Outputs

### analysis_document

[Completion analysis](../../resources/completion-analysis-guide.md#4-document-findings) of the initiative's existing progress.

#### artifact

`01-COMPLETION-ANALYSIS.md`

#### audience

`human`

## Protocol

### 1. Assess Existing Progress

- Apply the [completion analysis](../../resources/completion-analysis-guide.md#analysis-steps) procedure
- Locate existing planning artifacts in `{planning_root}`
  > When no prior planning artifacts are found, report that no prior work exists — the initiative starts from context rather than completion.
- Assess completion state of each previously identified work package
- Identify changes since last session from git log and issue trackers

### 2. Document Analysis

- Write `{analysis_document}` to `{planning_folder_path}` using the [completion analysis findings](../../resources/completion-analysis-guide.md#4-document-findings) section
- Distil the documented findings into `{key_findings}` and the suggested approach into `{planning_recommendation}`
