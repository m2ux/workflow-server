# Deferred Items

> Out-of-scope deferrals · `meta` update · 2026-07-27

Conscious out-of-scope items surfaced while specifying [the conditional session resume change](03-design-specification.md). In-task work still owed inside this session belongs in a follow-ups register, not here.

| ID | Surfaced at | Item | Why deferred | Status |
|----|-------------|------|--------------|--------|
| X-1 | requirements-refinement | `saved_planning_slug` is set by `discover-session` but never read — `initialize-session` passes `client_planning_slug` to `create-session`, and `derive-planning-slug` is skipped when `is_resuming` is true, so a resumed run supplies no slug at all | A separate defect in the resume *hand-off* path, downstream of the search this change gates | deferred |
| X-2 | requirements-refinement | 77 of 128 planning folders carry no `session.json`; the scan opens each one regardless | Corpus hygiene and scan-cost work independent of the intent gate | deferred |
| X-3 | requirements-refinement | The saved-session scan remains agent-executed rather than a server-side indexed lookup | A platform change well beyond the requested gating | deferred |
