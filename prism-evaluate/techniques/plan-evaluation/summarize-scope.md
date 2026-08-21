---
metadata:
  version: 2.0.0
---

## Capability

Gathers the settled evaluation scope into one summary a reader can judge in a single pass.

## Outputs

### scope_summary

The evaluation scope in one piece: the target and its classified kind, the dimensions and their focus areas, the evaluation's stated goals, and the output directory.

## Protocol

### 1. Assemble the Summary

- Assemble `{scope_summary}` from `{target_path}`, `{target_type}`, `{dimensions}`, `{evaluation_description}`, and `{output_path}`.  
  > Where `{dimensions}` is unresolved, the summary names it as the open item rather than omitting the dimension section.
