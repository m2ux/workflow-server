# File Review Note — batch

**Mode:** update · **has_unflagged_removals:** false

Scope-manifest paths drafted in the edit worktree, including universal planning README hoist.

## Removals vs committed

| # | Location | Status |
|---|----------|--------|
| 1–3 | harness-compat absolute `foreground-always` / `run_in_background` ban wording | Intentional — [impact §3](05-impact-analysis.md) |
| 4 | `workflow-design/resources/design-context-readme.md` | Intentional — universal Template + readme-seed |
| 5–6 | `work-package/.../create-readme.md`, `verify-readme-conforms.md` | Intentional — hoisted to `meta/.../workflow-engine/` |
| — | Other files | Additive / same-shape updates |

## Highlights

- Planning-folder `README.md`: one Template (`meta/planning-readme`); Progress via WP/WD `readme-seed` profiles; seed/verify on `workflow-engine::`.
- Validate suite-only; submit owns build-artifact hand-off.
- Dispatch routes via `worker_result.next_activity_id`.
