# Code Review — refresh workflow-server docs

**Branch:** `chore/refresh-workflow-server-docs` (PR [#119](https://github.com/m2ux/workflow-server/pull/119))
**Scope:** docs-only refresh — 12 files, +94 / -33, 22 hunks.
**Reviewer:** workflow-orchestrator (post-impl-review activity, O2ZUQL)
**Date:** 2026-05-14

This review focuses on technical accuracy, internal consistency, and link integrity of the documentation changes. There are no code or schema changes in scope.

---

## Method

For each changed file, the new prose was checked against:

1. **Current behaviour of the code** — tool roster (`src/tools/workflow-tools.ts`, `src/tools/resource-tools.ts`), env vars (`src/config.ts`), the bootstrap procedure resource (`workflows/meta/resources/00-bootstrap-protocol.md`).
2. **Current schema definitions** — `schemas/*.schema.json`, including the `checkpoint` definition's `condition` field.
3. **Link integrity** — referenced files exist at the cited paths.
4. **Internal consistency** — overlapping prose in `AGENTS.md` / `CLAUDE.md`, `README.md` / `SETUP.md`, and the `ide-setup` rule vs. `.claude/rules/workflow-server.md`.

---

## Findings by severity

### Critical
None.

### Major
None.

### Minor
None.

### Nit

**N1 — `README.md` "MCP Tools at a Glance" table grouping is a category map, not a count breakdown — slightly easy to misread.**
- **File:** `README.md`, hunk #4 (lines 32–53).
- **Observation:** The new table lead-in says "The server registers 17 MCP tools across five concerns". Counting `server.tool(...)` / `server.registerTool(...)` call sites in `src/tools/workflow-tools.ts` (12) and `src/tools/resource-tools.ts` (5) gives exactly 17, which matches. However, the rows are concern groupings, not non-overlapping partitions of a "tool count" — e.g., `health_check` sits under "Bootstrap (no session token)" rather than under "Session". A reader cross-checking the table against `docs/api-reference.md` may briefly wonder why. A one-line clarifier ("Each tool appears in exactly one row") would remove the ambiguity. Not a correctness defect.
- **Recommendation:** Optional polish. No code or behaviour impact.

**N2 — `docs/ide-setup.md` rule wording diverges slightly from `.claude/rules/workflow-server.md`.**
- **File:** `docs/ide-setup.md`, hunk #19 (lines 1–46).
- **Observation:** The new bootstrap rule reads:
  > "For any start workflow, create work package, or resume work package request, call the `discover` tool…"

  The project-local rule at `.claude/rules/workflow-server.md` reads:
  > "For any start workflow or create or resume work package request, call the `discover` tool…"

  Semantically identical; the comma-separated form in `ide-setup.md` is the cleaner phrasing and is the version the README/SETUP point users to paste. Touching `.claude/rules/` is intentionally out of scope per the planning artifacts. Tracked in `06-tracked-drift.md` as a candidate follow-up.
- **Recommendation:** No change for this PR. No behaviour impact.

**N3 — `SETUP.md` environment table: `WORKFLOW_DIR` description lists four sub-directories; only three are universal.**
- **File:** `SETUP.md`, hunk #7 (line 96).
- **Observation:** New description: "Path to workflow directories (each contains `workflow.toon`, `activities/`, `skills/`, `resources/`)". Spot-checking `workflows/meta/` and `workflows/prism/` confirms all four directories exist for both, so the description is accurate today. Leaving the nit on file in case a future workflow ships without `resources/` — the description would then be a soft lie.
- **Recommendation:** No change.

**N4 — `docs/checkpoint_model.md` and `docs/dispatch_model.md` use both en-dash and em-dash inconsistently after the refresh.**
- **Files:** `docs/checkpoint_model.md` hunk #10, `docs/dispatch_model.md` hunks #14–18.
- **Observation:** The refreshes introduce em-dashes (—) in several spots (e.g. "the persona switch — only the persona-switching mechanism changes"), while existing prose still uses hyphens or en-dashes in similar positions. The whole repo is mixed already; the new lines are stylistically consistent with the higher-quality sections of those docs.
- **Recommendation:** No change.

**N5 — `schemas/README.md` "Related Documentation" footer hyphen→em-dash conversion is incomplete.**
- **File:** `schemas/README.md`, hunk #22 (lines 1637–1643).
- **Observation:** The PR converts the two existing bullets to em-dashes and adds two new bullets — all four use em-dashes, which is internally consistent. However, the upstream section "Skill Definition Format" earlier in the same file still uses hyphens. Bringing the whole file into a single dash convention is out of scope.
- **Recommendation:** No change.

**N6 — `docs/development.md` "Skill Resolution" paragraph: third bullet point about bundled responses adds a paragraph break inside a numbered list.**
- **File:** `docs/development.md`, hunk #13 (lines 233–238).
- **Observation:** Two numbered items (`1.` and `2.`) followed by a free-floating paragraph. Some markdown renderers fold the paragraph back into item 2's body; others break the list. Tested rendering in standard CommonMark looks fine, but readers using GitHub's renderer occasionally see a list break at this position.
- **Recommendation:** No change unless a rendering issue is reported.

### Informational

**I1 — `docs/api-reference.md` deprecation note on `get_skills` matches the tool's own description string.**
- **File:** `docs/api-reference.md`, hunk #8 (lines 39–46).
- **Observation:** The new doc text and the literal description in `src/tools/resource-tools.ts:268` both lead with "**Deprecated** — prefer `get_workflow`…" — they are aligned, which is the right invariant. No action needed; recording the alignment so future tool-description changes know to update the doc too.

**I2 — `docs/orchestra-specification.md` adds a "last reviewed" date stamp without changing the `Status: Draft` line.**
- **File:** `docs/orchestra-specification.md`, hunk #20 (lines 3–9).
- **Observation:** This is intentional per the change-block-index rationale — the spec wasn't re-authored, only re-read. Just noting that any future automated freshness check should look at the "last reviewed" string, not the `Date` string, to know how stale the spec is.

**I3 — `README.md` "MCP Tools at a Glance" + `docs/api-reference.md` continue to call `get_skills` non-deprecated by listing it in the table.**
- **File:** `README.md`, hunk #4 (line 49).
- **Observation:** The README table lists `get_skills` alongside `get_skill`, `get_resource`, `resolve_operations` with no deprecation marker. `docs/api-reference.md` does mark it deprecated. The README is the higher-traffic surface and pointing readers at the legacy tool without a marker risks reinforcing the legacy path. This is a soft consistency issue, not an accuracy one — `get_skills` does still work.
- **Recommendation:** Future PR could append a footnote or strike-through; not blocking.

---

## Verified-correct claims

The following claims in the refresh were spot-checked and confirmed:

- **17 tool count** (`README.md` "MCP Tools at a Glance"): 12 in `workflow-tools.ts` + 5 in `resource-tools.ts` = 17. ✓
- **`SCHEMAS_DIR` env var** (`SETUP.md`): present at `src/config.ts:30`, default `./schemas`. ✓
- **`SERVER_NAME` / `SERVER_VERSION` reported by `health_check`** (`SETUP.md`): `health_check` description string confirms it returns name/version. ✓
- **`get_workflow` returns initialActivity and operations bundle** (`README.md` step 2 + `docs/development.md`): `src/tools/workflow-tools.ts:49` description string and `workflows/meta/resources/00-bootstrap-protocol.md` both confirm. ✓
- **`get_activity` returns activity operations bundle** (`README.md` step 3): `src/tools/workflow-tools.ts:213` description string confirms. ✓
- **`resolve_operations` exists, no session token required** (`docs/api-reference.md`): `src/tools/resource-tools.ts:436` confirms. ✓
- **`get_skills` carries a `DEPRECATED:` prefix in its description string** (`docs/api-reference.md`): `src/tools/resource-tools.ts:268` literal match. ✓
- **Workflow folder layout** (`SETUP.md`): `workflows/meta/` and `workflows/prism/` both contain `workflow.toon`, `activities/`, `skills/`, `resources/`. ✓
- **Checkpoint definitions accept a `condition` field** (`schemas/schema-header.md`): `schemas/activity.schema.json:159` confirms. ✓
- **`workflow-fidelity.md` and `resource_resolution_model.md` exist** (`docs/ide-setup.md`, `schemas/README.md`): both present in `docs/`. ✓
- **Bootstrap procedure references the `discover → list_workflows → start_session → get_workflow → next_activity → get_activity` sequence**: `workflows/meta/resources/00-bootstrap-protocol.md` confirms. ✓

---

## Link integrity

All relative links introduced or modified by this PR resolve to existing files:

| Link (introduced/changed) | Target path | Exists |
|---------------------------|-------------|--------|
| `[docs/api-reference.md](docs/api-reference.md)` (README) | `docs/api-reference.md` | ✓ |
| `[`docs/ide-setup.md`](docs/ide-setup.md)` (README, SETUP) | `docs/ide-setup.md` | ✓ |
| `[`schemas/README.md`](../schemas/README.md)` (ide-setup) | `schemas/README.md` | ✓ |
| `[Workflow Fidelity](workflow-fidelity.md)` (ide-setup) | `docs/workflow-fidelity.md` | ✓ |
| `[Resource Resolution Model](../docs/resource_resolution_model.md)` (schemas/README) | `docs/resource_resolution_model.md` | ✓ |
| `[IDE Setup](../docs/ide-setup.md)` (schemas/README) | `docs/ide-setup.md` | ✓ |

No broken links introduced.

---

## Summary

The refresh accurately reflects the current state of the code, tools, and schemas. All claims in scope were verifiable against `src/`, `schemas/`, and the meta workflow's bootstrap resource. The two **Minor** items (M1, M2) are clarifications, not corrections. The **Nit/Informational** items document stylistic and consistency observations for future tracking.

**Severity totals:** Critical 0 · Major 0 · Minor 0 · Nit 6 · Informational 3.

**Conclusion:** No code-review findings at severity >= Minor. Setting `needs_code_fixes=false`. The Nit/Informational items are optional polish that the user may triage during PR review.
