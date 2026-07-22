---
metadata:
  version: 1.1.0
---

## Capability

Resolve harness kind plus an operation kind to the harness-specific technique file and rule slice. Single authoritative map for harness-compat dispatch — callers must not duplicate the kind → file table.

## Inputs

### harness_kind

Identifier of the harness in use: `claude-code`, `cursor`, `cline`, or `generic`.

### operation_kind

Which slice to resolve — one of: `spawn`, `resume`, `concurrent`.

## Outputs

### harness_technique

Path to the harness-specific technique file (e.g. claude-code).

### harness_operation

The Rules section name within that file matching `{operation_kind}` (`spawn`, `resume`, or `concurrent`).

## Protocol

### 1. Map harness kind

- Map `{harness_kind}` to `{harness_technique}` (authoritative table — edit only here):
  - `claude-code` → [claude-code](./claude-code.md)
  - `cursor` → [cursor](./cursor.md)
  - `cline` → [cline](./cline.md)
  - `generic` → [generic](./generic.md)

### 2. Select rule slice

- Set `{harness_operation}` from `{operation_kind}` (`spawn` | `resume` | `concurrent`) — each harness technique exposes those three Rules sections (not sequenced Protocol phases).

### 3. Return resolution

- Return `{harness_technique}` and `{harness_operation}` for the caller to apply.
