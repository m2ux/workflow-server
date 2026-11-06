# Independent Diagram Contract Reader Result

## Provenance and scope

- Candidate installed source: /home/mike1/projects/dev/workflow-server/.worktrees/i17/e02/w12-diagram-fidelity-governs-readable.
- Exact HEAD before reading and after output: 409637f7a81d601d7c1fe525acf4e9295ee87b85; matches candidate.txt.
- sha256sum -c packet-manifest.sha256 passed for all six listed fixtures before source reading: reader-packet.md, reader-scenarios.json, captured-graph.json, captured-status.txt, e04-section-edges.json and candidate.txt.
- Output scope is the requested bounded Structure excerpts and freshness continuation. No claim of a complete Change Overview execution or published overview is made.
- Independent reasoning used the source route and supplied actual historical topology, not tests, validation.md, expected-observations.md or another reader's analysis. No delegation, tracker write, source edit or network operation occurred.
- All candidate reads and result writes ran through /home/mike1/projects/dev/md-composer/scripts/sbx with escalated bubblewrap namespace execution, from /tmp/e02-w12. The source checkout remained read-only; only /tmp was writable inside that sandbox.

## Context actually read

Candidate source, at the verified SHA:

- AGENTS.md, whole. Its referenced .project/main/AGENTS.md is absent in this candidate checkout; the read reported that absence. This exercise edits no component source.
- skills/work-planner/SKILL.md, rules.md, conventions.md and modes/understand-mode.md, whole.
- skills/work-planner/protocols/change-overview.md, whole, including its Prepare the Evidence, Write the Overview and later publication route. Publication is outside the packet's authorized scope.
- skills/work-planner/artifacts/architecture-overview.md, whole: actual Template, Diagrams, Code References, Measurements, Pull Request Head and Overview File included.
- skills/work-planner/artifacts/repository-graph.md, whole: measurement steps, freshness handling, actual commands and field contracts included.
- skills/work-planner/artifacts/pull-request.md: Read Pull Request State (155–169), Save Pull Request Snapshot (449–455; the selected read also displayed 445–447), Fetch Pull Request Files (525–535), Verified Head (609–611), Changed Paths (697–699).
- skills/work-planner/artifacts/delivery-branches.md: Create Pull Request Worktree (97–135), Fetch Review Head (262–270), Add Review Worktree (284–294), Read Checkout Revision and Read Checkout Status (312–326), Review Worktrees (355–359), Worktree Result (437–439). A heading-only search located these sections before the bounded reads.
- A targeted diagram-reference search covered the artifacts, protocols and references directories. The searched techniques directory does not exist; this did not prevent following the actual source links.

Archived source, separate from candidate instruction provenance:

- git show ff94f4a28ee0134a10f46ba571a9795f5e6841f1:skills/work-planner/protocols/epic-integration.md, whole. Its headings and line locations match the supplied graph labels and code references. Reading this document does not turn its numbered headings into an observed operational trace.

Supplied evidence, whole:

- reader-packet.md, candidate.txt, reader-scenarios.json, packet-manifest.sha256, captured-status.txt, captured-graph.json and e04-section-edges.json.

## Evidence used and its limits

- PR1660 historical graph head: ff94f4a28ee0134a10f46ba571a9795f5e6841f1; supplied comparison base: 9a924cfdda903ca64257449d8b5bf2ff762725ce.
- captured-status.txt identifies detached review checkout .worktrees/pr/1660, indexed commit and current commit ff94f4a, matching indexed/current analyzer runner identities, content matching all 202 covered files, and up-to-date status at the captured time (11/6/2026, 12:29:22 PM).
- This is archived freshness at its captured revision. I ran no live GitNexus operation and make no assertion about the repository's current live graph or PR state.
- e04-section-edges.json is the original eleven-row CodeRelation CONTAINS response. I cross-checked every supplied scenario edge against its named source/target/relation rows.
- captured-graph.json supplies the twelve named sections and eleven edges. reader-scenarios.json supplies the selected node sets, changed-node membership, source paths/lines, requested/indexed heads and permalink base.
- The packet supplies changed-node membership; I did not independently run Change Surface to derive it. The original containment receipt does not itself establish that membership or supply ordered production flows.
- No production component dependency or functional flow is supplied. The excerpts therefore name and show section containment only. They do not satisfy the evidence requirement for a complete production component/sequence account.

## Governing contract and decisions

- [Change Overview](https://github.com/m2ux/workflow-server/blob/409637f7a81d601d7c1fe525acf4e9295ee87b85/skills/work-planner/protocols/change-overview.md#L42-L57) delegates diagram validity to the owner artifact and requires measured areas/relationships and measured sequence order.
- [Diagrams](https://github.com/m2ux/workflow-server/blob/409637f7a81d601d7c1fe525acf4e9295ee87b85/skills/work-planner/artifacts/architecture-overview.md#L93-L111) makes five to ten elements a readability target, permits fewer without padding, calls for conceptual splitting when more are needed, and requires changed/context fills to remain consistent.
- [Code References](https://github.com/m2ux/workflow-server/blob/409637f7a81d601d7c1fe525acf4e9295ee87b85/skills/work-planner/artifacts/architecture-overview.md#L113-L115) requires head-pinned line anchors. Every section reference in A and B points to the supplied archived PR head, not the candidate instruction SHA or a moving branch.
- [Freshness](https://github.com/m2ux/workflow-server/blob/409637f7a81d601d7c1fe525acf4e9295ee87b85/skills/work-planner/artifacts/repository-graph.md#L33-L47) discards stale measurements and requires reindexing and affected measurements again. [Change Overview's freshness result](https://github.com/m2ux/workflow-server/blob/409637f7a81d601d7c1fe525acf4e9295ee87b85/skills/work-planner/protocols/change-overview.md#L14-L35) returns an unresolved blocker before writing.
- I added no consumer-owned size policy. Subgraph nesting represents the supplied CONTAINS relationships, whose name is stated with each excerpt. It adds no operational arrow, call order or directory-derived component boundary. Measured containing sections count once as their subgraphs, rather than being duplicated as extra nodes inside invented containers.

## Actual results and topology

- reader-A.md: populated. N7 Epic Integration contains N11 Procedure. Two measured elements, one relation, both changed and green. One subgraph and one node faithfully show the entire selected tree. No padding is needed.
- reader-B.md: populated as three views split at supplied section concepts. Summary: N7 contains N11; N11 contains N0 Prepare the Evidence, N1 Refresh and Validate, N2 Merge or Hand Off and N3 Confirm the Result (six measured elements/five relations). Refresh detail: N1 contains N4 Changed Branch Content and N6 Current Review Handoff (three/two). Merge detail: N2 contains N10 Human Handoff, N9 Harness Denial, N8 GitHub Refusal and N5 Confirmed Merge (five/four).
- B preserves all twelve unique sections and all eleven supplied relationships. N1, N4 and N6 are grey; N0, N2, N3, N5, N7, N8, N9, N10 and N11 are green. N1 and N2 repeat across summary/detail solely as the same measured parents, with the same names/fills. No filler section or dependency is introduced.
- reader-C.md: exact stop result, no Structure population. Requested head d237c3c20f8d6cb94d9a5cdb3b426cbca307a904 differs from indexed head ff94f4a28ee0134a10f46ba571a9795f5e6841f1. Captured freshness at ff94f4a does not establish freshness at d237c3.
- C continuation: if the requested revision represents a changed PR head, refresh Read Pull Request State and rebuild matching detached review-checkout evidence; apply Measure Repository Change at that verified requested head/base; reindex, confirm freshness and repeat discarded surface/symbol/flow measurements before population. No stale measurements are reused by merely changing code links. The bounded offline exercise stops with this continuation rather than mutating the index or repository.

## Owner template diagram counts

Counted the actual Mermaid declarations in architecture-overview.md, not a hypothetical populated example:

| Template | Actual elements | Actual relationships |
| --- | --- | --- |
| Structural, lines 22–39 | Caller, Entry, Store: three nodes; Area: one grouping subgraph (four declarations if groups are included) | Two directed, labelled interaction edges |
| Functional, lines 54–67 | Caller actor, Entry participant, Store participant: three participants | Four ordered messages |

- Both examples have fewer than five nodes/participants; even counting the structural subgraph yields four. That fits the owner's explicit allowance for a faithful diagram below its readability target. No minimum or filler is justified.
- The template is schematic: placeholder labels do not establish actual system measurements. Its Entry has changed green fill and Store context grey; Caller has no explicit fill in this template. The functional template specifies no fill styling. I do not treat these omissions as permission to omit the explicit changed/context styling from populated structural excerpts.
- A complete architecture overview still calls for structural and functional diagrams; the packet requests only bounded structural excerpts, and the supplied containment evidence cannot justify filling Behaviour with a fabricated production sequence.

## Integrity and limitations

- Final git rev-parse HEAD matches candidate.txt; git status --porcelain=v1 is empty, matching the pre-read empty readback.
- All authored files are under /tmp/e02-w12: reader-A.md, reader-B.md, reader-C.md and reader-result.md. No source changes or commits exist for this read-only exercise.
- No invented/padded elements, inferred production calls, fabricated ordered flows, live freshness claims or full-procedure execution claims are present. Mermaid text was populated and inspected; I did not render it in a browser or run an external rendering tool.
- One result-write attempt was blocked by a shell hook treating literal Markdown backticks as shell substitution. No command ran or file was written by that attempt. The retry used literal Python content without shell-sensitive characters and succeeded; no action remains blocked by that hook.
