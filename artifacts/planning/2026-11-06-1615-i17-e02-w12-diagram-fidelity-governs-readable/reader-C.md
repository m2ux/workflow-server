# Scenario C — Freshness Blocker

No Structure excerpt is populated. Requested revision d237c3c20f8d6cb94d9a5cdb3b426cbca307a904 differs from indexed revision ff94f4a28ee0134a10f46ba571a9795f5e6841f1. The captured status verifies the index only at the latter archived revision. Those measurements cannot support the requested head.

Required continuation under candidate Work Planner:

1. Reconfirm PR1660's verified head and base with Read Pull Request State if the requested revision represents a changed PR head; rebuild review-worktree evidence using Create Pull Request Worktree at that verified head.
2. Apply Measure Repository Change in the matching review checkout. Read index status, index the verified requested head and confirm freshness.
3. Discard the stale measurements; repeat Change Surface against the same verified base, Symbol Context for affected changed symbols, and Flow Trace for any reported flows. Inspect every response's staleness evidence.
4. Resume overview population only with measurements current at that head; otherwise return the precise unresolved freshness blocker.

The offline, read-only exercise authorizes reporting this continuation, not index, worktree, tracker or network mutation. No stale graph is repurposed by changing its links to the requested SHA.

Source: protocols/change-overview.md:14-35; artifacts/repository-graph.md:11-47,109-127; artifacts/delivery-branches.md:97-135 at candidate 409637f7a81d601d7c1fe525acf4e9295ee87b85.
