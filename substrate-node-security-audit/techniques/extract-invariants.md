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

### function-registry

Registry of priority functions to analyze, classified by type and priority

### source-files

Source files containing the functions

## Protocol

### 1. Extract Per Function

- For each priority-1 function, enumerate: (a) Preconditions — what must be true about inputs; (b) Postconditions — what must be true after execution; (c) Cross-function invariants — what must hold between this function and its inverse; (d) Data source invariants — what must be true about external data consumed.

### 2. Produce Table

- Output a structured table: | Function | Invariant | Category (pre/post/cross/data) | Expected Enforcement | Found? | Evidence |

## Outputs

### invariant-table

Structured invariant table.

- **invariant_table**: one row per function-invariant pair with category, expected enforcement, and evidence
