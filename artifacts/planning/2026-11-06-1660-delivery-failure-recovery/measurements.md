# E04 Overview Measurements

## Evidence Boundary

The graph reports no affected execution process for the changed delivery sections. The overview therefore supplies a measured, strictly nested fixture-call sequence and labels operational states as source-derived; it represents neither as a production delivery-agent sequence or a generated GitNexus Process trace.

The structural diagram represents indexed section containment. The functional sequence represents only nested `CALLS` entry order along one actual verification path, with no sibling ordering or return edges invented. Repository Graph's Flow Trace step runs for each reported affected flow; with none reported, that iteration is empty. Limited process coverage remains explicit rather than being filled by an invented flow.

## Revision and Freshness

- Checkout: `/home/mike1/projects/dev/workflow-server/.worktrees/pr/1660`, detached and clean.
- Head: `ff94f4a28ee0134a10f46ba571a9795f5e6841f1`.
- Base: `9a924cfdda903ca64257449d8b5bf2ff762725ce`.
- GitNexus storage: `/tmp/deliver17-20261106/gitnexus-e04`, selected explicitly on every invocation.
- CLI: 1.6.12. The coordinator's index run used `analyze --index-only --workers 2`.
- Before/after status: head and index both `ff94f4a`, all 202 covered files match, status up to date. Raw receipts: `status-before.txt`, `status-after.txt`.
- Changed surface: seven files, 102 symbols, zero affected processes. A diff-hunk intersection over indexed node ranges identifies exactly 102 symbols, each with an exact `context --uid` response and none unavailable. `context-summary.json`, `changed-symbols.json` and `contexts/000.json` through `contexts/101.json` retain those receipts.
- Every changed-symbol context reports no containing process. No relevant reported process is therefore available for the requested Flow Trace step.

## Section Structure

The component diagram selects these direct `CodeRelation.type = CONTAINS` edges from `section-edges.json`:

| Source Section | Target Section |
| --- | --- |
| `Section:skills/work-planner/protocols/epic-integration.md:L7:Procedure` | `Section:skills/work-planner/protocols/epic-integration.md:L48:3. Merge or Hand Off` |
| `Section:skills/work-planner/protocols/epic-integration.md:L7:Procedure` | `Section:skills/work-planner/protocols/epic-integration.md:L74:4. Confirm the Result` |
| `Section:skills/work-planner/protocols/epic-integration.md:L48:3. Merge or Hand Off` | `Section:skills/work-planner/protocols/epic-integration.md:L54:Human Handoff` |
| `Section:skills/work-planner/protocols/epic-integration.md:L48:3. Merge or Hand Off` | `Section:skills/work-planner/protocols/epic-integration.md:L58:Harness Denial` |
| `Section:skills/work-planner/protocols/epic-integration.md:L48:3. Merge or Hand Off` | `Section:skills/work-planner/protocols/epic-integration.md:L62:GitHub Refusal` |
| `Section:skills/work-planner/protocols/epic-integration.md:L48:3. Merge or Hand Off` | `Section:skills/work-planner/protocols/epic-integration.md:L70:Confirmed Merge` |

Seven unique nodes and six direct containment edges are shown. The subgraph names the indexed Epic Integration root section. No directory-derived architectural boundary or prose cross-link is asserted as a graph call.

## Nested Fixture Path

The sequence selects these direct `CodeRelation.type = CALLS` edges from `call-edges.json`:

| Nested Entry | Caller UID | Callee UID |
| --- | --- | --- |
| 1 | `Method:skills/work-planner/test/test_hotfix_readiness.py:HotFixReadiness.test_changed_head_after_ready_restores_before_repair#0` | `Function:skills/work-planner/test/test_hotfix_readiness.py:walk` |
| 2 | `Function:skills/work-planner/test/test_hotfix_readiness.py:walk` | `Function:skills/work-planner/test/test_plan_mode.py:section` |
| 3 | `Function:skills/work-planner/test/test_plan_mode.py:section` | `Function:skills/scripts/check_skill_files.py:parse` |
| 4 | `Function:skills/scripts/check_skill_files.py:parse` | `Function:skills/scripts/check_skill_files.py:scan_blocks` |

Five unique participants and four direct call edges are shown. Nesting fixes the entry order along this selected path. This is not a claim about ordering among the other calls that each function makes, the complete test trace or production tracker operations.

The shared parser's own context reports several pre-existing checker processes. Those are not reported as affected by the change and do not trace the selected fixture path. They supply no substitute production flow. The coordinator also observed an unrelated sync result for a fuzzy merge-operation query; that result is excluded.

## Operational States

The five explicit hot-fix states come from the pinned Deliver Mode's Verify Hot-Fix Readiness, Restore Hot-Fix Draft and Repair Hot-Fix Findings sections at lines 226–258. Transitions are source review evidence, explicitly separate from graph process measurements. They cover current-state failure, successful readiness, selected restoration, confirmed draft, unresolved restoration and repair continuation.

## Coverage Limits

- The index contains 5,551 nodes, 14,909 edges, 199 clusters and 312 generated flows at the coordinator's analysis run.
- Process generation reports 161 dropped entry-point candidates, 606 skipped callees and 21 budget-cut walks. An absent flow cannot establish absence of the corresponding code path.
- Section `context` output omits containment relations; raw Cypher confirms them. Empty section caller/callee output therefore supplies no evidence that its document structure is absent.
- The measured graph supplies no semantic call edges for the prose's artifact links. The overview uses pinned source links to explain those contracts and does not fabricate graph interactions.
- All measurements and files remain outside the reviewed checkout. Publication and PR/body changes belong to the coordinator.

## Overview Checks

`check_overview.py` confirms every diagram containment/call edge against its captured graph relation, the four-edge nested ordering, all source permalinks at the full head with valid line ranges, and the exact index revision. The three diagrams contain seven, five and five explicit elements respectively. `overview-check.json` retains the checked counts. The detached checkout remains clean.

A Mermaid renderer is not installed in this environment. Fences, declared nodes, measured topology and source links are checked; no rendered-layout claim is made.
