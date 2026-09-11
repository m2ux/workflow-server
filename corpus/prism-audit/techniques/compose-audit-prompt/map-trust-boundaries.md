---
metadata:
  version: 1.0.0
---

## Capability

Map trust boundaries from the indexed graph: find cross-community call edges (where validation may be absent), compute the blast radius of each security-critical symbol, and record the trust-boundary crossings and blast radii that elevate domain risk.

## Outputs

### trust_boundaries

Array of trust-boundary crossings, each `{ from_community, to_community, crossing_symbols }`

### security_blast_radii

Map of each security-critical symbol to its blast radius `{ direct_callers, affected_processes, affected_modules, risk }`

## Protocol

### 1. Find the Boundary Crossings

- Query the indexed graph for call edges whose caller and callee sit in different communities, and record `{trust_boundaries}` from them — each crossing is a point where validation may be absent.  
  > Where the target carries no index, record `{trust_boundaries}` and `{security_blast_radii}` as empty; there is no graph to read them from.

### 2. Measure Each Blast Radius

- For each security-critical symbol the characteristic scan found, measure its upstream reach and record `{security_blast_radii}` — every upstream caller is a path an attacker could arrive by.
