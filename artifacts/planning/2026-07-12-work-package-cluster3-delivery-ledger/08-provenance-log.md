# Provenance Log — cluster 3 delivery ledger (#189)

| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
|---|---|---|---|---|---|
| task-1 | claude | claude-opus-4-8 | code-generation | repo-only | Add `dedupTechniqueBlocks` helper + `DEDUP_BLOCKS` constant and channel-key header docs in `src/utils/delivery.ts` |
| task-2 | claude | claude-opus-4-8 | code-generation | repo-only | Wire block dedup into `get_technique` full-delivery branch (`src/tools/resource-tools.ts`) |
| task-3 | claude | claude-opus-4-8 | code-generation | repo-only | Wire block dedup into `get_activity` eager step-technique bundling (`src/tools/workflow-tools.ts`) |
| task-4 | claude | claude-opus-4-8 | code-generation | repo-only | C12 — `get_workflow` ops-bundle slimming via `workflow_bundle:<hash>` (`src/tools/workflow-tools.ts`) |
| task-5 | claude | claude-opus-4-8 | test-writing | repo-only | Extend `tests/reference-delivery.test.ts` with C2 block-dedup and C12 cases |
| task-6 | claude | claude-opus-4-8 | docs | repo-only | Docs: `delivery.ts` header, `docs/api-reference.md`, `get_technique`/`get_activity` tool descriptions + `bundle_note` |

## Attestation

- **Timestamp:** 2026-07-13T10:30:42Z
- **Certifier:** Mike Clay <mike.clay@shielded.io>
- **Selection:** `certify` — certified all six DCO conditions (reviewed the entire diff and understand each material change; right to submit under the project's license; no code with unclear or incompatible provenance; can explain the solution's origin; tests and linters run or will run in CI; willing to take responsibility for defects and licensing issues).
- **Model:** claude-opus-4-8
- **Context scope:** repo-only
