# README Prose — Comprehension Artifact

> **Last updated**: 2026-06-29
> **Work packages**: Simplify workflow-server README prose (branch `chore/simplify-readme-prose`)
> **Coverage**: The repository-root `README.md` — its sections, the claims each section makes, where the prose is dense or jargon-heavy, and the canonical terminology in the docs it links — scoped to a prose-only simplification that preserves structure and coverage.
> **Related artifacts**: [workflow-server.md](workflow-server.md) (source-tree behavioral analysis), [documentation-system.md](documentation-system.md), [workflow-server-schemas.md](workflow-server-schemas.md)

## Architecture Overview

> For a prose-simplification work package the "codebase" is the README document itself plus the material it documents. This section maps the README's own structure rather than the server source.

### Project Structure

`README.md` lives at the repository root and is the entry point most readers hit first. It is pure Markdown — no compile-time or runtime dependents; its only consumers are human readers and Markdown tooling (renderers, link-checkers). It links outward to `docs/` guides, `schemas/README.md`, `SETUP.md`, and two GitHub branch views (`workflows`, `engineering`).

### Section Map (current order — must be preserved)

| # | Heading | Kind | What it conveys |
|---|---------|------|-----------------|
| — | `# 🔄 Workflow Orchestration MCP Server` + badges | Title / badges | Project name; Node 18+, MIT, MCP-compatible, TS 5.3 badges |
| — | One-line tagline + nav bar | Prose + links | "MCP server for AI agent workflow orchestration… fidelity-enforced workflows agents discover, navigate, execute"; horizontal nav to Quick Start / Architecture / Schemas / API / Workflow Fidelity / Development / Workflows / Engineering |
| 1 | `## 🎯 Overview` | Prose | One-paragraph what-it-does; an always-applied IDE rule bootstraps the agent, then the server handles discovery, sessions, navigation |
| 1a | `### How It Works` | Numbered prose | 4 steps: Discover → Start session → Navigate → Execute, each naming the tools involved |
| 1b | `### Architecture` | Diagram + bullets | `User Goal → Workflow → Activities → Techniques → Tools`; 4 bullets defining Workflows / Activities / Techniques / Tools |
| 1c | `### MCP Tools at a Glance` | Prose + table | "registers 16 MCP tools across five concerns"; 6-row table grouping the tools |
| 2 | `## 🚀 Quick Start` | Mixed | Prerequisites; Installation (clone/build); Configure MCP Client (Cursor JSON); Deploy to Your Project (curl deploy.sh); Setup IDE Rule; Execute a Workflow (NL examples) |
| 3 | `## Engineering layout` | Prose + bullets | `.engineering/` purpose; directory-structure bullets |
| 4 | `## 📜 License` | Prose | MIT + link |

### Prose-density hotspots (candidate areas for simplification)

These are the prose passages that pack the most detail / jargon into the fewest sentences. They are the simplification targets; the surrounding structure, links, and code/command blocks stay fixed.

1. **Tagline** (line 8) — "Create structured, fidelity-enforced workflows that agents discover, navigate, and execute to fulfill user goals." Three loaded terms ("structured", "fidelity-enforced", the discover/navigate/execute triple) before the reader knows what a workflow is.
2. **How It Works step 2 & 3** (lines 23–24) — the densest prose in the file. Step 2 packs `session token`, `get_workflow`, `techniques.workflow bundled under techniques and rules`, and `initialActivity ID` into one sentence. Step 3 chains `next_activity`, `get_activity`, "inherited `techniques.activity` plus the activity's own `techniques[]`", and `get_resource` lazy-loading. Heavy reliance on dotted-field jargon a newcomer cannot parse.
3. **MCP Tools at a Glance intro** (line 40) — "registers 16 MCP tools across five concerns" immediately above a six-row table (count mismatch — see Open Questions).
4. **Engineering layout / Deploy** — moderate; mostly concrete commands, low simplification need.

### Design Patterns (of the README)

Top-of-funnel onboarding doc: badges → tagline → nav → progressively detailed Overview (what → how → architecture → tool inventory) → actionable Quick Start → reference pointers. The prose escalates from plain-language tagline to highly technical "How It Works" too quickly — the density cliff between the Overview paragraph and step 2 of How It Works is the core accessibility problem this work package addresses.

## Key Abstractions

The README's prose accuracy depends on these concepts. Simplified wording must keep each one correct.

### Core Model

`User Goal → Workflow → Activities → Techniques → Tools` (README diagram, line 30). Canonical across the docs:
- **Workflow** — the overall process (e.g. issue → merged PR).
- **Activity** — a phase within a workflow (plan, implement, review, validate).
- **Technique** — a Markdown definition of a capability, with optional inputs/outputs, an ordered protocol, and rules; techniques can nest and reference each other by `::` path. (Per `docs/resource_resolution_model.md` and `docs/architecture.md`.)
- **Tool** — an MCP operation the agent invokes.

Terminology note: the canonical term is **Technique** (not "Skill"). The repo `CLAUDE.md` still says "Goal → Activity → Skill → Tools" in one place, but every doc and the README use **Technique**. The simplified README must keep "Technique".

### Bootstrap / Session Flow (How It Works)

1. **Discover** — agent calls `discover` to learn available workflows and the bootstrap procedure.
2. **Start session** — `start_session` returns a session token; `get_workflow` returns the workflow structure, its bundled techniques/rules (`techniques.workflow`), and the `initialActivity` id.
3. **Navigate** — `next_activity` advances to the next activity; `get_activity` returns that activity's full definition plus its bundled techniques (inherited `techniques.activity` + the activity's own `techniques[]`); `get_resource` lazy-loads referenced material.
4. **Execute** — agent works through activities; checkpoints gate user decisions; transitions govern flow between activities.

This matches `docs/ide-setup.md` (bootstrap sequence `list_workflows → start_session → get_workflow → next_activity → get_activity`) and `docs/api-reference.md`.

### The 16 MCP Tools (verified against source)

The README table groups all 16 registered tools. Ground-truth count from `src/tools/` registration is **16** — the README count is accurate. Grouping in the README table:

| Concern (README row) | Tools | Count |
|---|---|---|
| Bootstrap (no session token) | `discover`, `list_workflows`, `health_check` | 3 |
| Session | `start_session`, `get_workflow_status`, `dispatch_child` | 3 |
| Workflow / activity navigation | `get_workflow`, `next_activity`, `get_activity` | 3 |
| Checkpoint flow | `yield_checkpoint`, `resume_checkpoint`, `present_checkpoint`, `respond_checkpoint` | 4 |
| Techniques, resources | `get_technique`, `get_resource` | 2 |
| Trace | `get_trace` | 1 |
| **Total** | | **16** |

### Fidelity Enforcement

README tagline calls workflows "fidelity-enforced". `docs/workflow-fidelity.md` backs this with **seven enforcement layers** (token integrity, checkpoint gate, cross-activity validation, transition-condition tracking, step-completion manifest, activity manifest, execution trace). Simplified prose may keep "fidelity-enforced" but must not overstate or invent mechanics.

### Branch / worktree model

Two branches: `main` (TypeScript server) and `workflows` (workflow definitions + guides, an orphan branch), set up locally as a worktree (`git worktree add ./workflows workflows`). Per `SETUP.md`. The README correctly says "worktree for orphan branch". There are **no stale "TOON" references** in the README (grep confirmed zero); the format the server reads/emits is YAML.

## Design Rationale

### Why a prose-only, structure-preserving simplification

- **Observation**: The README is accurate and well-structured but front-loads jargon (dotted field names, bundle mechanics) in the Overview, before a newcomer has the vocabulary.
- **Hypothesized rationale for current density**: The README doubles as a quick reference for people who already know the system, so it compresses precise mechanics (exact tool names, bundle field paths) into the onboarding path.
- **Trade-offs**: Precision-for-insiders vs. accessibility-for-newcomers. The work package resolves this in favor of accessibility *within the prose*, while keeping the precise reference content (tables, tool names, command blocks) intact.
- **Implications for changes**: Simplify sentences and reduce jargon in the prose; do NOT remove tool names, field names, links, code/command blocks, or reorder sections. Where a jargon term is load-bearing (e.g. `discover`, `next_activity`, `techniques.activity`), keep the term but introduce/soften it in plainer surrounding prose.

### Why structure and coverage are fixed

- **Observation**: The work package explicitly holds sections, headings, and order fixed and forbids dropping or adding facts.
- **Rationale**: Restructuring would change the deliverable and add review risk; the nav bar, anchors (`#-quick-start`), and external links depend on the current headings.
- **Trade-offs**: Cannot fix structural wrinkles (e.g. the "five concerns" vs. six-row mismatch) by restructuring; such wrinkles are flagged as questions for planning, not silently edited.

## Data Flow and Operational Context

> Not a runtime code path — the "flow" here is the reader's path through the document and the link graph that must stay intact.

### Link / anchor integrity map

The README's links and anchors are part of its contract and must survive any rewrite:
- Internal anchor: `**[Quick Start](#-quick-start)**` → `## 🚀 Quick Start` (emoji-stripped GitHub slug `#-quick-start`). Renaming the heading would break this anchor.
- Relative doc links: `docs/architecture.md`, `schemas/README.md`, `docs/api-reference.md`, `docs/workflow-fidelity.md`, `docs/development.md`, `docs/ide-setup.md`, `SETUP.md`, `SETUP.md#deploying-to-projects`, `LICENSE` — all confirmed present on disk.
- External links: `modelcontextprotocol.io`, the two GitHub branch trees (`/tree/workflows`, `/tree/engineering`), the `raw.githubusercontent.com/.../scripts/deploy.sh` URL, badge shields.
- Code/command blocks: clone+build, `git worktree add`, the Cursor `mcp.json` JSON, the `curl … deploy.sh` block, NL workflow examples. These are content, not prose — left verbatim.

### Invariant Alignment

| Invariant | Producer enforces? | Consumer assumes? | Gap? |
|-----------|-------------------|-------------------|------|
| Section headings + order unchanged | The rewrite must (work-package constraint) | Nav-bar anchor `#-quick-start`, external deep-links | None if headings untouched; breaks if a heading text changes |
| Tool names/count accurate | README lists 16; source registers 16 | API reference, agents reading the table | README ↔ source: aligned (16). README ↔ `docs/api-reference.md`: api-reference omits `dispatch_child` and documents 15 — pre-existing doc gap, out of scope |
| "five concerns" matches table rows | Prose says five; table has six rows | A reader counting categories | Mismatch (5 vs 6) — pre-existing; see Open Questions |
| Terminology = "Technique" | README uses Technique throughout | docs/, schemas/ | Aligned; repo `CLAUDE.md` lags with "Skill" (not README's concern) |
| No "TOON" references | README has none | Recent YAML-only design | Aligned (grep: 0 hits) |

### Operational Scenarios

| Scenario | Effect on this doc | Risk |
|----------|--------------------|------|
| First-time reader, non-expert | Hits the density cliff at How It Works step 2–3; this is the problem being fixed | Low (accessibility, not correctness) |
| Markdown render / link-check | Must pass unchanged after rewrite | Low if links/anchors/code blocks preserved |
| Reader cross-checking tool count | Sees "five concerns" over a six-row table; minor confusion | Low; flagged, not auto-fixed |
| Agent reading the table for tool names | Relies on exact tool names; rewrite must not alter them | Low if names left verbatim |

## Domain Concept Mapping

### Glossary (terms the simplified prose must keep accurate)

| Domain Term | Technical Construct | Description |
|-------------|---------------------|-------------|
| MCP server | `src/server.ts` `createServer` | Model Context Protocol server agents connect to |
| Workflow | workflow definition (`workflow.yaml` + activities/techniques/resources) | The overall multi-step process |
| Activity | activity definition | A phase within a workflow |
| Technique | Markdown technique definition (`::`-addressable, composable) | A capability with inputs/outputs/protocol/rules |
| Tool | MCP tool registered in `src/tools/` | An operation the agent invokes (16 total) |
| Checkpoint | checkpoint step + JIT checkpoint model | A user-decision pause that yields a handle up the agent chain |
| Transition | condition-gated activity edge | Deterministic routing between activities |
| Session | `session.json` + sealed `.session-token`, keyed by 6-char `session_index` | Server-owned persistent execution state |
| Fidelity enforcement | 7 enforcement layers (`docs/workflow-fidelity.md`) | Mechanisms ensuring agents follow the defined path |
| `discover` | bootstrap MCP tool | Entry point that returns the bootstrap procedure |
| `.engineering/` | engineering branch/folder | Holds planning artifacts, history, scripts |
| workflows worktree | orphan `workflows` branch via `git worktree` | Where workflow data lives, separate from `main` |

### Domain Model

The README narrates the same Goal → Workflow → Activity → Technique → Tools model the source implements; its prose is a faithful (if dense) projection of `docs/architecture.md`, `docs/ide-setup.md`, `docs/api-reference.md`, `docs/workflow-fidelity.md`, and `SETUP.md`. Simplification is a wording transform over an accurate model, not a re-derivation of it.

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|-----------|-------------------|
| 1 | Is the README's "16 MCP tools" count accurate? | Resolved | Yes — `src/tools/` registers exactly 16; the README table lists all 16 including `dispatch_child` | Key Abstractions → The 16 MCP Tools |
| 2 | Does "five concerns" match the tool table? | Resolved (factual) — edit decision deferred to plan-prepare | **Factually: no — the table has SIX category rows, so the prose should say "six concerns".** Verified line-by-line against `README.md` lines 42–49: Bootstrap, Session, Workflow/activity navigation, Checkpoint flow, Techniques+resources, Trace = 6 rows (tool counts 3+3+3+4+2+1 = 16, consistent with the accurate "16 tools"). The prose number "five" (line 40) is simply one short. The correct value is **six**. The *edit* — whether to apply the one-word "five"→"six" fix inside a work package that nominally freezes facts — is a scope decision deferred to plan-prepare, NOT an open comprehension gap | Deep-Dive 2 → Q2 |
| 3 | Is the canonical term "Technique" or "Skill"? | Resolved | "Technique" — used by README, all `docs/`, and `schemas/`. Repo `CLAUDE.md` lags with "Skill" but that file is out of scope | Key Abstractions → Core Model |
| 4 | Are all README links/anchors valid on disk? | Resolved | Yes — all relative doc links, `SETUP.md#deploying-to-projects`, and `LICENSE` exist; internal anchor `#-quick-start` matches the heading | Data Flow → Link/anchor integrity map |
| 5 | Any stale "TOON" wording to avoid reintroducing? | Resolved | README has zero TOON references; current format is YAML. Simplified prose must not reintroduce "TOON" | Key Abstractions → Branch/worktree model |
| 6 | Does the README ↔ `docs/api-reference.md` tool inventory align? | Resolved (factual) — edit decision deferred to plan-prepare | **Factually: no — api-reference documents 15 tools; `dispatch_child` is the ONLY one missing.** Verified against `docs/api-reference.md` MCP Tools tables: Bootstrap 3 (`discover`, `list_workflows`, `health_check`) + Session 2 (`start_session`, `get_workflow_status`) + Workflow 7 (`get_workflow`, `next_activity`, `get_activity`, `yield_checkpoint`, `resume_checkpoint`, `present_checkpoint`, `respond_checkpoint`) + Technique 2 (`get_technique`, `get_resource`) + Trace 1 (`get_trace`) = 15. A name-mention scan of the whole file returns 0 hits for `dispatch_child`; all other 15 names appear. README lists 16 (the same 15 plus `dispatch_child` in its Session row), matching source (`src/tools/` registers 16). So the delta is exactly one tool — `dispatch_child` — and the README, not api-reference, is the accurate one. The *fix* lives in `docs/api-reference.md`, outside this single-file (`README.md`) work package's scope — deferred to plan-prepare as an other-file follow-up, NOT an open comprehension gap | Deep-Dive 2 → Q6 |

### Deferred scope decisions for plan-prepare (NOT open comprehension gaps)

Both items below are now *factually resolved* (the correct values are known and source-verified). What remains is a **scope decision** — whether/where to apply a fix — which belongs to plan-prepare, not comprehension. They are deferred follow-ups, not unknowns to keep investigating.

- **Q2 ("five concerns" → should be "six")** — the factual answer is settled: the table has six rows, so the prose is one short. Plan-prepare decides whether the one-word "five"→"six" correction is in scope for a work package that nominally freezes facts. Default if out of scope: leave verbatim and note the wrinkle. (Note: this is the single instance where the structure/coverage freeze prevents fixing a genuine inaccuracy in-pass; surfacing it to planning is the correct disposition.)
- **Q6 (`docs/api-reference.md` documents 15, omitting `dispatch_child`)** — the factual answer is settled: the README (16) is correct and matches source; api-reference is one short, missing only `dispatch_child`. The fix lives in `docs/api-reference.md`, outside this single-file (`README.md`) work package. Plan-prepare decides whether to expand scope to patch that doc or to file it as a separate follow-up.
- Repo-root `CLAUDE.md` "Goal → Activity → Skill → Tools" terminology lag — not a README concern; noted for completeness only.

## Deep-Dive Sections

### Initial Deep-Dive — README accuracy & density [2026-06-29]

Goal of this dive: trace each dense/jargon-heavy prose claim to its canonical source so a simplification can reword it without introducing an inaccuracy, and confirm the per-claim "load-bearing terms" that must survive a rewrite.

#### Sentence-level accuracy trace of the density hotspots

**Tagline (line 8)** — "A Model Context Protocol (MCP) server for AI agent workflow orchestration. Create structured, fidelity-enforced workflows that agents discover, navigate, and execute to fulfill user goals."
- *Accurate.* "fidelity-enforced" is backed by the 7 layers in `docs/workflow-fidelity.md`. "discover, navigate, and execute" mirrors the How-It-Works verbs and the bootstrap sequence.
- *Load-bearing terms to keep:* "MCP server", "workflow", "fidelity-enforced" (or a plain gloss of it). Simplification lever: split into two short sentences; introduce "workflow" before qualifying it.

**How It Works step 2 (line 23)** — "`start_session` returns a session token; `get_workflow` returns the workflow structure, the workflow's `techniques.workflow` bundled under `techniques` and `rules`, and the `initialActivity` ID".
- *Accurate per `docs/api-reference.md`*: `get_workflow` returns the technique bundle (`techniques`, `rules`, `unresolved`) comprising the workflow's `techniques.workflow` + core orchestrator techniques, then lightweight metadata including `initialActivity`. `start_session` returns a `session_index` (the README says "session token"; the on-disk seal is `.session-token` and the handle is `session_index` — "session token" reads as a loose synonym but the precise term is `session_index`).
- *Load-bearing terms to keep:* `start_session`, `get_workflow`, `initialActivity`. The dotted `techniques.workflow`/`techniques`/`rules` jargon is the densest part — it can be softened to "along with the techniques and rules it needs" without losing correctness (the exact field paths live in `docs/api-reference.md`, which the table already points to).
- *Note (not for this WP):* "session token" vs. `session_index` is a minor imprecision; safest simplification keeps the README's existing wording rather than introducing a new term.

**How It Works step 3 (line 24)** — "`next_activity` advances the session to the next activity; `get_activity` returns the activity's full definition (steps, checkpoints, transitions) along with the activity's bundled techniques — the workflow's inherited `techniques.activity` plus the activity's own `techniques[]` — under `techniques` and `rules`. `get_resource` lazy-loads reference material referenced by a technique".
- *Accurate per `docs/api-reference.md`*: `next_activity` is the orchestrator's transition tool; `get_activity` returns the technique bundle (inherited `techniques.activity` + the activity's own `techniques[]` + core worker techniques) and the full activity body (steps/checkpoints/loops/transitions/rules). `get_resource` loads deferred resources by slug.
- *Load-bearing terms to keep:* `next_activity`, `get_activity`, `get_resource`, and the parenthetical "steps, checkpoints, transitions". The em-dash clause spelling out `techniques.activity` + `techniques[]` is the densest fragment and the prime simplification lever — collapse to "plus the techniques that activity uses".

**MCP Tools at a Glance intro (line 40)** — "The server registers 16 MCP tools across five concerns."
- "16" is *accurate* (source registers 16). "five concerns" is *not* consistent with the table directly below it, which has **six** category rows. See Open Question #2. A simplifier MUST NOT change the count or the table; whether to correct "five"→"six" is a planning decision because it edits a fact.

#### Confirmed: no hidden accuracy traps elsewhere in the prose

- Quick Start command blocks (clone/build, `git worktree add ./workflows workflows`, Cursor `mcp.json`, `curl … deploy.sh`) match `SETUP.md` and `docs/development.md` verbatim — they are content, left untouched.
- "Engineering layout" bullets (`artifacts/planning/`, `history/`, `scripts/`) are a simplified view of the fuller `.engineering/` tree in `SETUP.md`; consistent, no contradiction.
- The nav-bar anchor `#-quick-start` resolves to `## 🚀 Quick Start` (GitHub strips the emoji + leading space → `-quick-start`); preserving the heading text preserves the anchor.

#### Net resolution of open questions on the mandatory pass

- Q1, Q3, Q4, Q5 — **resolved** (see Open Questions table); all four are accuracy guards now established.
- Q2 (five vs six) and Q6 (api-reference missing `dispatch_child`) — **deliberately left open as out-of-scope follow-ups**, not unresolved investigation gaps. Q2 is a fact the work package freezes (planning decides whether a one-word fix is in scope); Q6 lives in `docs/`, outside this work package's single-file scope. Investigating further cannot "close" them — they are decisions/other-file gaps, not unknowns.
- **Conclusion:** comprehension is sufficient for a faithful prose simplification. No remaining *investigable* unknowns; the two open items are scope decisions, so `has_open_questions=true` but `needs_comprehension` can drop to false at the sufficiency checkpoint.

#### Portfolio-lens pass (pedagogy + rejected-paths) — distilled guidance

Two independent lenses were applied to the README (full artifacts in the planning folder: `14-portfolio-pedagogy.md`, `14-portfolio-rejected-paths.md`, `14-portfolio-synthesis.md`). Convergent, high-confidence guidance for the downstream implementation:

- **Reword the dense fragments in place; never delete or relocate the field-level facts.** The dotted-path jargon in How-It-Works steps 2–3 is both the prime simplification target and the prime hazard — both lenses predict a simplifier's first move is to "push it to the API reference" and silently drop coverage. Keep tool names + a plain gloss; the linked API reference already holds the exact field paths.
- **The structure/coverage freeze is the safety rail; the real lever is sentence-level density and term ordering.** "Simplify" means *reduce ideas-per-sentence* and *introduce each term in plain words before naming it* — not "use shorter words." Splitting newcomer vs. reference audiences would be a forbidden restructure and would break the nav anchor `#-quick-start` and external deep-links.
- **Don't silently edit frozen facts.** Leave the "five concerns" count and the README↔api-reference tool-roster drift as flag-to-planning / out-of-scope; keep the existing "session token" wording rather than introducing `session_index`.

### Deep-Dive 2 — Q2 & Q6 source verification [2026-06-29, dive-deeper]

The `comprehension-sufficient` checkpoint was resolved to **dive-deeper**: investigate the two open items (Q2 "five concerns", Q6 api-reference roster) in more detail before proceeding. This dive nails both to source ground truth. Result: both are *factual questions now answered*; the only residue is a scope/edit decision, which is plan-prepare's call.

#### Q2 — "five concerns" vs the table rows (definitive)

Enumerated the actual category rows of the tools table in `README.md` (lines 42–49) and the prose claim (line 40):

| # | Concern (table row, verbatim) | Tools | Count |
|---|-------------------------------|-------|-------|
| 1 | Bootstrap (no session token) | `discover`, `list_workflows`, `health_check` | 3 |
| 2 | Session | `start_session`, `get_workflow_status`, `dispatch_child` | 3 |
| 3 | Workflow / activity navigation | `get_workflow`, `next_activity`, `get_activity` | 3 |
| 4 | Checkpoint flow | `yield_checkpoint`, `resume_checkpoint`, `present_checkpoint`, `respond_checkpoint` | 4 |
| 5 | Techniques, resources | `get_technique`, `get_resource` | 2 |
| 6 | Trace | `get_trace` | 1 |
| | **Total** | | **16** |

- **Prose says** (line 40): "The server registers 16 MCP tools across **five** concerns."
- **Table has SIX rows**; tool counts sum to 16 (consistent with the "16" in the same sentence).
- **Definitive answer:** the correct concern-count is **six**. The prose word "five" is off by one; it should read **"across six concerns"**. The "16" is correct and untouched.
- **Edit decision (deferred to plan-prepare):** applying "five"→"six" is a one-word factual correction. The work package nominally freezes facts/structure, so whether this fix is in scope is a planning decision, not a comprehension gap. Default if out of scope: leave verbatim, note the wrinkle. This is the lone case where the freeze blocks an in-pass accuracy fix.

#### Q6 — README vs `docs/api-reference.md` tool inventory (definitive)

Cross-checked three sources: `README.md` table, `docs/api-reference.md` MCP Tools tables, and the actual registrations in `src/tools/`.

**Ground truth — `src/tools/` registers exactly 16:**
- `src/tools/workflow-tools.ts` registers 12 via `server.tool('…')`: `discover`, `list_workflows`, `get_workflow`, `next_activity`, `get_activity`, `yield_checkpoint`, `resume_checkpoint`, `present_checkpoint`, `respond_checkpoint`, `get_trace`, `health_check`, `get_workflow_status`.
- `src/tools/resource-tools.ts` registers 4: `start_session` and `dispatch_child` via `server.registerTool('…')`, `get_technique` and `get_resource` via `server.tool('…')`.
- 12 + 4 = **16**. README matches source.

**`docs/api-reference.md` documents 15** (MCP Tools section tables):
- Bootstrap Tools (3): `discover`, `list_workflows`, `health_check`
- Session Tools (**2**): `start_session`, `get_workflow_status`
- Workflow Tools (7): `get_workflow`, `next_activity`, `get_activity`, `yield_checkpoint`, `resume_checkpoint`, `present_checkpoint`, `respond_checkpoint`
- Technique Tools (2): `get_technique`, `get_resource`
- Trace Tools (1): `get_trace`
- = **15**.

- **Delta is exactly one tool:** `dispatch_child`. A name-mention scan of the entire `docs/api-reference.md` returns **0** hits for `dispatch_child`; all other 15 names appear. Its natural home is the Session Tools table (the README groups it under Session), which currently lists only 2 of the 3 session tools.
- **Definitive answer:** README (16) is correct and source-aligned; `docs/api-reference.md` is the stale one, missing only `dispatch_child`. No other tool differs between the two.
- **Edit decision (deferred to plan-prepare):** the corrective edit belongs in `docs/api-reference.md`, **outside** this work package's single-file (`README.md`) scope. Plan-prepare decides whether to expand scope to add a `dispatch_child` row to api-reference, or to file it as a separate doc-accuracy follow-up. Not a comprehension gap.

#### Convergence

Both open items are now resolved as **facts**. What remains for each is a *scope/edit decision* (Q2: apply a frozen-fact one-word fix? Q6: touch an out-of-scope file?), which is explicitly plan-prepare's responsibility, not an investigable comprehension unknown. No new questions surfaced. There is nothing further to discover here — comprehension is sufficient; `needs_comprehension` drops to false at the sufficiency gate.

---
*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*
