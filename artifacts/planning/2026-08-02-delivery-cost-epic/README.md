# Delivery cost — epic tracking record

This folder is the investigation-detail home for the delivery-cost epic, which gives server-side performance work a shared home: the resolve work a delivery call does behind the scenes, the observability that says what each delivery cost, and the protocol guidance that keeps agents from paying for content they already hold.

## Tracked issues

| Work item | Issue | Capture in this folder | Prior records |
|---|---|---|---|
| W1 — resolve each technique once per delivery; W2 — one cost summary line per delivery; W3 — agent fetch guidance | #269 | [issue-269-provenance-caching.md](./issue-269-provenance-caching.md) | The issue's own investigation-detail link points at `2026-07-21-technique-loading-efficiency-provenance-scan/`, which does not exist on this branch (see below) — the capture here is the surviving record. |

Unlike the consolidation epics of the same date, this epic closes nothing at creation time: #269 stays open as the first member, and future performance and delivery-cost issues join the tracking list as they are filed.

## Why an epic now

- Every prior performance issue shipped standalone and closed — #248 (context-cost profile), #232 (token tracking and cost estimation), #353 (re-dispatch overhead, measured at 31% of a work-package run). #269 is currently the only open one, and with the lineage all closed there was no home tying the theme together.
- The cost #269 describes grows multiplicatively with the corpus. At epic creation the corpus carries 184 technique files across `workflow-design` and `meta`, and the resolve count per delivery scales as all workflow techniques × ungated steps in the delivered activity.

## Status check at epic creation (2 August 2026, main at 7b80fd5a)

Verified in code; also recorded as a comment on #269
(<https://github.com/m2ux/workflow-server/issues/269#issuecomment-5157094021>):

- `buildProvenanceContext` is still invoked once per ungated step inside `get_activity`'s eager-bundling loop — `src/tools/workflow-tools.ts:908`, inside the `for (const step of eligible)` loop starting at line 896.
- Its technique-output memo (`ownOutputsCache`, `src/utils/binding-provenance.ts:110`) is still scoped to a single call and discarded between steps.
- `readTechnique` (`src/loaders/technique-loader.ts:96`) reads from disk on every call; no module- or request-level cache exists beneath the builder.
- The only change to `src/utils/binding-provenance.ts` since the issue was filed is commit `cc609b79` (#327), which widened `OPTIONAL_INPUT_RE` so `(optional, default …)` inputs classify correctly — a correctness fix unrelated to caching.
- Partial Stage 4 overlap: #353 added `technique_bundled` / `resource_fetched` events reporting delivered and saved characters per delivery (see the comment block at `src/tools/workflow-tools.ts:861-865`), but no per-request summary of unique techniques resolved or provenance passes.

## Dangling link in the member issue

#269's **Investigation detail** section links `.engineering/artifacts/planning/2026-07-21-technique-loading-efficiency-provenance-scan/` (with `analysis.md`, `log-evidence.md`, `code-pointers.md`). That folder exists neither on this branch nor in the working copies checked on 2 August 2026 — it appears never to have been pushed. The verbatim body capture in this folder preserves everything the issue itself records (the session table for `MBJPED`, `XYVS3R`, `MMJTSK`, `6IZO56`, the root cause, and the staged fix); the underlying timestamped log excerpts remain lost unless the original folder resurfaces.

## Key numbers carried into the epic

- One observed `get_activity` call (`XYVS3R`, 3 ungated steps) walked the full technique catalog 3 times.
- `get_activity` completes in ~60–130 ms today; the resolve count scales as all workflow techniques × ungated steps.
- The eager budget works out as context_tokens × 0.8 × 4 — roughly 320k–640k characters at 100k–200k declared tokens — so all ungated steps of the current activity almost always inline, by design.
- Corpus at epic creation: 184 technique files across `workflow-design` and `meta`.
