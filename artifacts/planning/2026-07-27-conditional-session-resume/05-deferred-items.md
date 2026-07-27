# Deferred Items

> Out-of-scope deferrals · `meta` update · 2026-07-27

Conscious out-of-scope items surfaced while specifying [the conditional session resume change](03-design-specification.md). In-task work still owed inside this session belongs in a follow-ups register, not here.

| ID | Surfaced at | Item | Why deferred | Status |
|----|-------------|------|--------------|--------|
| X-1 | requirements-refinement | `saved_planning_slug` is set by `discover-session` but never read — `initialize-session` passes `client_planning_slug` to `create-session`, and `derive-planning-slug` is skipped when `is_resuming` is true, so a resumed run supplies no slug at all | Undeferred and fixed in this change: gating the search is pointless while the hand-off it feeds cannot target the saved folder. `initialize-session` gained the complementary `adopt-saved-planning-slug` step; tracked as [F-7](11-follow-ups.md) and manifest row 9 | resolved |
| X-2 | requirements-refinement | 77 of 128 planning folders carry no `session.json`; the scan opens each one regardless | Corpus hygiene and scan-cost work independent of the intent gate | deferred |
| X-3 | requirements-refinement | The saved-session scan remains agent-executed rather than a server-side indexed lookup | A platform change well beyond the requested gating | deferred |
| X-4 | scope-and-draft | `check-binding-fidelity.ts` counts only `{token}` reads, structured-`condition` variables, and step bindings, so a variable consumed solely through a `when:` gate — the form the schema prefers on non-checkpoint steps — reads as a dead output | A guard change in the server repo, outside this workflow-definition change | deferred |
| X-5 | post-update-review | `anti-patterns.md` `## Authoring Guidance (MR)` now holds two AP-numbered audit entries (AP-126, AP-127) alongside its MR-numbered write-time guidance, because `## Creation Rules` → *Entry identity* requires the AP-XX designator to be monotonic in file order. The section boundary no longer matches its contents | Resolving it means renumbering entries or restructuring section boundaries across the catalogue — a `workflow-design` change of its own | deferred |
| X-6 | post-update-review | Each per-activity paragraph in `activities/README.md` enumerates that activity's step order and its checkpoints with their conditions, which `readme-orients-not-transcribes` flags. The shape is the house pattern for all five entries in `meta` and for `activities/README.md` across the library | A library-wide README convention change, far outside this change's target | deferred |
