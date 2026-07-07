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

### 1. Map Trust Boundaries

- If GitNexus is unavailable (`gitnexus_available` is false), skip this step entirely.
- Use [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[cypher](../../../meta/techniques/gitnexus-operations/cypher.md) to find cross-community call edges: `MATCH (caller)-[:CodeRelation {type: 'CALLS'}]->(callee), (caller)-[:CodeRelation {type: 'MEMBER_OF'}]->(c1:Community), (callee)-[:CodeRelation {type: 'MEMBER_OF'}]->(c2:Community) WHERE c1 <> c2 RETURN c1.heuristicLabel, c2.heuristicLabel, caller.name, callee.name`. These edges represent trust boundary crossings where validation may be absent.
- Use [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../../meta/techniques/gitnexus-operations/impact.md)`(direction: 'upstream')` on each security-critical symbol identified during characteristic scanning to map its blast radius — every upstream caller is a potential attack vector. Record `{security_blast_radii}`: a map of symbol to `{ direct_callers, affected_processes, affected_modules, risk }`.
- Record `{trust_boundaries}`: an array of `{ from_community, to_community, crossing_symbols }`. Domains containing trust-boundary-crossing code will receive elevated risk during domain mapping.
