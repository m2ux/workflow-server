---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 12
  legacy_id: 12
---

## Capability

For a set of priority functions, perform formal invariant extraction from source code: enumerate the four categories of invariants that must hold for correctness — preconditions, postconditions, cross-function invariants, and data source invariants — and produce a structured invariant table

## Inputs

### function_registry

Registry of priority functions to analyze, classified by type and priority

### source_files

Source files containing the functions

## Protocol

### 1. Extract Per Function

- For each priority-1 function in the `{function_registry}`, read its definition in the `{source_files}` and enumerate: (a) Preconditions — what must be true about inputs; (b) Postconditions — what must be true after execution; (c) Cross-function invariants — what must hold between this function and its inverse; (d) Data source invariants — what must be true about external data consumed.

### 2. Produce Table

- Collect the enumerated invariants into the `{invariant_table}`, a structured table: | Function | Invariant | Category (pre/post/cross/data) | Expected Enforcement | Found? | Evidence |

## Outputs

### invariant_table

Structured invariant table.

#### invariant_table

one row per function-invariant pair with category, expected enforcement, and evidence
