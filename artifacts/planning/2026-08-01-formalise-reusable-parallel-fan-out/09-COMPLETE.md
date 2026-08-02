# Complete — Formalise reusable parallel fan-out

**Date:** 2026-08-01  
**Issue:** [#382](https://github.com/m2ux/workflow-server/issues/382)  
**Workflows PR:** [#385](https://github.com/m2ux/workflow-server/pull/385) (`workflow/meta-formalise-reusable-parallel-fan-out` → `workflows`)  
**Related server:** [#383](https://github.com/m2ux/workflow-server/pull/383) when-expression / OR keep-sites  

---

## Delivery

| Item | Result |
|------|--------|
| Process-unit coordination | Activity pattern `meta/activities/patterns/06-process-unit-fan-out` (seed → execute/wait-all/gather → `unit_results`) |
| Strategy technique `unit-fan-out` | Removed (`coordination-in-technique` — coordination is activity-owned) |
| `cargo-operations::run-suite` | Pure combine over gathered `unit_results` |
| `work-package` validate | Mirrors process-unit spine; step gates on inline `when:` |
| Agent / lens parallel | Patterns 01–05; `independent-lenses` atomic; activity owns dispatch |
| Canon | §2 layer map, §34 pattern homes; smells `prose-based-dispatch-patterns`, `container-names-inheriting-ops`, `coordination-in-technique`; hard-ban `technique-references-technique` retired (technique cites allowed); AP numbers renumbered contiguously; principle-anchor consumers retargeted |
| PR #383 keep-sites | Integrated workflows pin `d891ed73` (four OR gates → parenthesized `when:`) |
| Definition guards | Green on edit worktree; `check:when` PASS via #383 tree against this surface |

## Limitations

- Host server must carry [PR #383](https://github.com/m2ux/workflow-server/pull/383) (or equivalent) before corpus pin is fully enforceable under default `check:all` on main.
- Server parser support for technique→technique resolution is a follow-up on the host (not this workflows PR).
- Optional `dispute-analysis` dual-dispatch still deferred.
- Loop/checkpoint gates remain structured `condition:` where the schema requires that field.
- Live `scatter-gather.md` still carries a coordination Capability body (definition debt toward full activity-only coordination).

## Retrospective

1. **`pass-orchestration-in-technique` false negative** — quality-review walked Protocol “formalisation” as success without Detect for multi-op Protocol Apply façades; corrected bind graph is activity steps only ([10-ap114-redesign-note.md](10-ap114-redesign-note.md)).
2. **§ renumber blast radius** — inserting Activities Coordinate as §2 broke numbered principle anchors in consumer techniques; `check-resource-anchors` caught it on resume.
3. **Cross-PR corpus divergence** — OR keep-sites on #383 vs this branch required an explicit merge so fan-out does not reintroduce structured OR trees on the same steps.
