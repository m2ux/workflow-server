# Implementation Analysis: Update the Docs Site

> 2026-07-25 · Evidence baseline for PR #293 (`docs/update-the-docs-site`)  
> Worktree: `.worktrees/2026-07-25-update-the-docs-site` @ `6e355946` (branched from main; main later has `chore(site): regenerate API pages` @ `057920a2`)  
> Requirements home: [requirements-elicitation.md](requirements-elicitation.md)

This artifact is the single home for **baselines, gaps, measurement, and the stakeholder A–G analysis deliverables**. It does **not** rewrite product docs; it records what must change after review/approval.

---

## A. Executive summary

The documentation system is a **working two-layer stack** (markdown canonical + hand-authored `site/` with generated nav/API regions). Install/setup sequencing (`setup.md` + transport guides + `examples/cursor-workspace`) is largely coherent. The largest trust failures are **numeric and structural drift** (tool counts 16 vs 17; missing pages claimed by meta-docs; § numbering / “day-two” mismatch), **stale agent vocabulary** (`Skill` vs `Technique`; `session_token` vs `session_index`), and **onboarding thinness** on the GitHub README relative to the site guide (no progressive Q1–Q10 path, weak troubleshooting, no explicit golden-path verification narrative).

**Bottom line:** Treat this package as an **accuracy + IA + UX remediation** under the existing system—not a platform rewrite. Prioritize closing the accuracy register (Batch 1) and the prospective-user path (Batch 2) before editorial polish. Do not implement doc rewrites until this analysis is reviewed (SC-9).

| Dimension | Baseline judgment |
|-----------|-------------------|
| Accuracy vs code | Mixed — API catalog lists 17 tools correctly; several prose counts and meta-claims are wrong |
| IA / ownership | Partial — setup triad works; meta-docs and specs hubs over-claim missing surfaces |
| UX / onboarding | Site guide stronger than README; glossary exists on site only |
| Automation | Good bones (`build:site`, `check:site`, `check:svg`, `tests/site.test.ts`) — extend for count/claim drift |
| Branch freshness | Worktree docs lag main’s latest site regen; rebase/merge main before Batch 1 regen |

---

## B. Documentation inventory

### B.1 Surfaces in scope

| ID | Path | Layer | Role | Audience | Site mirror |
|----|------|-------|------|----------|-------------|
| M-01 | `README.md` | Markdown | First contact, overview, quick start stub | Everyone | Partial (`site/index.html`) |
| M-02 | `setup.md` | Markdown | Shared install sequence | Operators / integrators | Partial (`site/guide/getting-started.html`) |
| M-03 | `http.md` | Markdown | Docker/HTTP transport | Operators | Linked from guide |
| M-04 | `stdio.md` | Markdown | stdio / local build | Operators | Linked from guide |
| M-05 | `docs/ide-setup.md` | Markdown | Bootstrap rule | Integrators / agents | Linked |
| M-06 | `docs/api-reference.md` | Markdown | Short MCP + HTTP catalog | Integrators | `site/api/tools.html` (generated depth) |
| M-07 | `docs/architecture.md` | Markdown | Architecture hub | Contributors | `site/specs/architecture.html` |
| M-08 | `docs/dispatch_model.md` | Markdown | Dispatch model | Contributors / agents | `site/specs/dispatch.html` |
| M-09 | `docs/checkpoint_model.md` | Markdown | Checkpoints | Contributors / agents | `site/specs/checkpoints.html` |
| M-10 | `docs/state_management_model.md` | Markdown | State | Contributors / agents | `site/specs/state-management.html` |
| M-11 | `docs/artifact_management_model.md` | Markdown | Artifacts | Contributors / agents | `site/specs/artifact-management.html` |
| M-12 | `docs/resource_resolution_model.md` | Markdown | Resolution / delivery | Contributors / agents | `site/specs/resource-resolution.html` |
| M-13 | `docs/workflow-fidelity.md` | Markdown | Fidelity | Contributors / agents | `site/specs/workflow-fidelity.html` |
| M-14 | `docs/documentation-system.md` | Markdown | Docs meta / where content belongs | Maintainers | **None** |
| M-15 | `docs/engineering-storage.md` | Markdown | Engineering storage patterns | Integrators | Linked from guide |
| M-16 | `docs/development.md` | Markdown | Contribute / env / flags | Contributors | **None** (design pages cover some server internals) |
| M-17 | `docs/orchestra-specification.md` | Markdown | Normative workflow language | Workflow authors | **No dedicated site page** (specs hub incomplete) |
| M-18 | `docs/technique-protocol-specification.md` | Markdown | Normative technique contract | Workflow authors | **No dedicated site page** |
| M-19 | `schemas/README.md` | Markdown | Schema guide | Workflow authors | `site/api/schemas.html` (generated) |
| M-20 | `AGENTS.md` / `CLAUDE.md` | Markdown | Repo agent instructions | AI agents | N/A (copy targets) |
| M-21 | `.cursor/rules/*`, `.claude/rules/*` | Config | Always-on bootstrap | AI agents | N/A |
| M-22 | `examples/cursor-workspace/**` | Example | Copy-ready multi-root workspace | Integrators | Linked |
| S-01 | `site/index.html` | Site | Marketing / orientation | Prospective users | — |
| S-02 | `site/guide/getting-started.html` | Site | Illustrated onboarding | Prospective users | — |
| S-03 | `site/guide/definitions.html` | Site | Glossary | Everyone | — |
| S-04 | `site/specifications.html` | Site | Specs hub | Authors | — |
| S-05 | `site/specs/*.html` (8) | Site | Architecture models | Contributors | — |
| S-06 | `site/api/tools.html` | Site | Generated tool reference | Integrators / agents | — |
| S-07 | `site/api/schemas.html` | Site | Generated schema reference | Authors | — |
| S-08 | `site/design/*.html` (6) | Site | Server design narrative | Contributors | — |
| S-09 | `site/nav.js`, `site/style.css`, `site/README.md` | Site chrome | Nav + presentation | All site readers | — |
| X-01 | `scripts/generate-site-data.ts` (`SITE_ROUTES`) | Generator | Route registry + nav/API regen | Maintainers | — |
| X-02 | `scripts/check-site-links.ts`, `check-svg-layout.ts` | Checks | Link/SVG validation | CI / maintainers | — |
| X-03 | `tests/site.test.ts` | Tests | Generated-region freshness, nav, links, SVG | CI | — |
| X-04 | `package.json` scripts `build:site`, `check:site`, `check:svg` | Automation | Doc pipeline entrypoints | Maintainers | — |
| X-05 | `scripts/install.sh`, `init-repo.sh`, `deploy.sh`, `start.sh`, `stop.sh`, `update-workflows.sh` | Ops scripts | Install truth | Operators | Documented in setup triad |

### B.2 Claimed but missing (meta-doc ghosts)

| Claimed path | Claimed in | Evidence |
|--------------|------------|----------|
| `site/internals/` | `docs/documentation-system.md` | Directory absent in worktree |
| `site/design/rationale.html` | `docs/documentation-system.md` | File absent; design has overview/anatomy/lifecycle/protocol/session-store/quality-system only |

### B.3 `SITE_ROUTES` vs HTML (worktree)

- **20 routes** registered in `scripts/generate-site-data.ts`.
- **20 HTML pages** under `site/**/*.html` — set equality holds (no orphan HTML; no missing route files).
- Nav sections: Guide (top), API (top), Architecture dropdown, Design dropdown, Specifications link, GitHub.

### B.4 Implementation truth anchors (not docs)

| Concern | Canonical code |
|---------|----------------|
| Tool registration | `src/tools/workflow-tools.ts` (`server.tool` ×13), `src/tools/resource-tools.ts` (`registerTool` ×2 + `server.tool` ×2) → **17 tools** |
| Server attach | `src/server.ts` → `registerWorkflowTools` + `registerResourceTools` + schema resources |
| HTTP routes | `src/transports/http.ts`: `GET /health`, `GET /ready`, `POST|GET|DELETE /mcp` |
| Config / layout | `src/config.ts`, `scripts/install.sh`, `scripts/init-repo.sh` |
| Site generation | `scripts/generate-site-data.ts` records tools via stub `tool` + `registerTool` |

---

## C. Accuracy and contradiction register

Severity: **H** = wrong fact that breaks trust/safety of setup; **M** = wrong/incomplete but recoverable; **L** = editorial/voice/consistency.

| ID | Sev | Current statement | Locations | Evidence | Correct statement | Affected pages |
|----|-----|-------------------|-----------|----------|-------------------|----------------|
| C-01 | H | Prose tallies tools as **16** / **17** / **sixteen** (and similar) | README, `site/index.html`, design pages, generated tools.html lede | Counts go stale; user 2026-07-25: remove unless procedure-required | **Remove** inventory counts; link to generated [tool reference](../../../site/api/tools.html) | README, site index/design, `generate-site-data.ts` |
| C-02 | M | Registrar prose uses fixed “**twelve**” / “**four**” tool counts | `site/design/server-anatomy.html` | Same staleness as C-01 | Describe roles without counts; name key tools or link catalog | server-anatomy |
| C-03 | H | IDE rule text mentions `session_token` | `docs/ide-setup.md` L10 | Wire/API and tools use **`session_index`** only (`src/tools/*`, `docs/api-reference.md`) | Remove `session_token`; say `session_index` from `start_session` | ide-setup, any copied rules |
| C-04 | H | Agent model: “Goal → Activity → **Skill** → Tools” | `AGENTS.md`, `CLAUDE.md` | Product model and site glossary: Goal → **Workflow** → Activities → **Techniques** → Tools (`README.md`, `site/guide/definitions.html`) | Use **Workflow** and **Technique**, not Skill | AGENTS/CLAUDE; examples if copied |
| C-05 | M | http/stdio: finish setup “**§4 day-two**” | `http.md` L115, `stdio.md` L102; intros L4 | `setup.md` §4 heading is “**Update Workflows**” (no “day-two” heading). Site guide has `#day-two` | Align names: either rename setup §4 to Day-two (update workflows) or change transport refs to “§4 Update Workflows” / link `setup.md` anchors that exist | setup, http, stdio, getting-started |
| C-06 | M | API HTTP table lists only `POST /mcp` | `docs/api-reference.md` | `http.ts` registers **POST, GET, DELETE** `/mcp` | Document all three methods (streamable HTTP) | api-reference, optionally design/protocol |
| C-07 | M | Meta-doc: `site/internals/` documents server implementation | `docs/documentation-system.md` | No `site/internals/` directory | Point to **`site/design/*`** (and code links) as implementation narrative home, or add internals later (out of path-stability preference: retarget claims) | documentation-system |
| C-08 | M | Meta-doc: design rationale at `site/design/rationale.html` | `docs/documentation-system.md` | File missing | Use existing design pages or add rationale page in a later batch; until then remove/retarget claim | documentation-system |
| C-09 | M | Engineering AGENTS: see root `SETUP.md` | `.engineering/AGENTS.md` | Root file is **`setup.md`** (lowercase) | Link `setup.md` | engineering AGENTS |
| C-10 | L | `stdio.md` labels single-root workspace “**legacy**” | `stdio.md` | Still supported in config; “legacy” is evolution voice discouraged in product docs | Describe as “explicit workspace (single-root)” without legacy framing | stdio |
| C-11 | L | Multiple “instead of / no longer / previously” in specs/design | Various `docs/*_model.md`, `site/design/*`, `site/specs/*` | Voice rule in `.engineering/AGENTS.md` | Rewrite to present-tense current behavior during plain-language batch | Specs/design pages |
| C-12 | M | Worktree site may be **stale vs main** | Branch tip vs `main` `057920a2` site regen | Main has newer `chore(site): regenerate API pages for schema/tool drift` | Rebase/merge main and `npm run build:site` before claiming API pages current | site/api/* |
| C-13 | L | README “five concerns” without listing them | `README.md` | `generate-site-data.ts` `TOOL_GROUPS` defines 6 groups | Either list groups or say “see API reference” without a false group count | README |
| C-14 | M | Verify paths still over-emphasize `list_workflows` as success | `docs/ide-setup.md`, site getting-started | Transport guides correctly require `discover` then `start_session` | Make start_session (with `repo`) the primary smoke everywhere | ide-setup, getting-started |

**Closed / validated (no change required for the claim itself):**

| Claim | Evidence |
|-------|----------|
| Markdown canonical + hand-authored site + generated regions | `docs/documentation-system.md`; `generate-site-data.ts`; `tests/site.test.ts` |
| `docs/api-reference.md` enumerates all 17 tool names | Matches registration list |
| Setup shared sequence + transport split | `setup.md` / `http.md` / `stdio.md` structure |
| `/ready` requires `sessionKeyWritable` | `http.md`, `api-reference.md`, `http.ts` ready handler |
| Always pass `repo` on `start_session` | Tool description + ide-setup + examples |

---

## D. Duplication and consolidation map

| Topic | Canonical owner | Allowed summary mirrors | Competing copies (action) |
|-------|-----------------|-------------------------|---------------------------|
| Install host layout paths | `setup.md` §1 table | getting-started “Install layout”; http/stdio one-liners | Keep table only in setup; site may duplicate short table with link “canonical: setup.md” |
| Transport install/start/verify | `http.md` / `stdio.md` | getting-started “quick” blocks | Site quick blocks must stay thin; deep steps only in transport files |
| deploy → init-repo order | `setup.md` §2a/2b | getting-started §2; examples README | One numbered sequence; examples link §2 only |
| Day-two / update workflows | `setup.md` §4 (+ site `#day-two`) | http/stdio “finish shared steps” | Unify heading/anchor (see C-05) |
| Bootstrap IDE rule | `docs/ide-setup.md` | examples rules, AGENTS boundaries | Single rule text; examples copy verbatim from ide-setup |
| MCP tool catalog (short) | `docs/api-reference.md` | README one-liner | README must not invent counts that disagree with generated site |
| MCP tool wire schemas | **Generated** `site/api/tools.html` from `src/tools/` | — | Never hand-edit generated regions |
| Schema wire reference | **Generated** `site/api/schemas.html` | `schemas/README.md` narrative | Regen via `build:schemas` / `build:site` |
| Glossary | `site/guide/definitions.html` | Short term callouts in README/setup | Add README link to definitions; avoid second glossary in markdown unless thin |
| Architecture models | `docs/*_model.md` + fidelity | `site/specs/*` | Edit markdown first; refresh HTML to match (hand-authored parity) |
| Normative authoring | `orchestra-specification.md`, `technique-protocol-specification.md`, `schemas/README.md` | specifications.html hub | Hub must link both normative specs (gap today) |
| Docs system rules | `docs/documentation-system.md` | — | Fix ghost paths; single meta home |
| Contributor build/test | `docs/development.md` | AGENTS setup commands | AGENTS stays short; depth in development.md |
| Engineering storage | `docs/engineering-storage.md` | setup §2a link | No second full pattern guide |
| Cursor multi-root example | `examples/cursor-workspace/README.md` | setup §3 | Keep example as only full copy-ready config |

**Consolidation patterns to apply in implementation:**

1. **Owner + link** — one full procedure; others link with one-sentence outcome.  
2. **Transport delta** — shared steps never re-expanded in http/stdio.  
3. **Generated exclusive** — API/schema parameter tables only from generators.  
4. **Glossary exclusive** — definitions page owns term definitions.

---

## E. User-journey gap analysis

Journeys from requirements; status vs current docs.

| # | Journey | Primary path today | Gap | Blocks golden path? | SC link |
|---|---------|-------------------|-----|---------------------|---------|
| J1 | Understand product value | README overview + site index | README thin on outcomes; site stronger diagrams | Partial | SC-2 |
| J2 | MCP minimum mental model | README How it works; definitions | AGENTS “Skill” confuses agents (C-04) | Agent path | SC-5 |
| J3 | Choose transport | setup §1 table | OK | No | SC-3 |
| J4 | Install server | http install.sh / stdio build | OK if reader picks guide | No | SC-2 |
| J5 | Prepare target repo (deploy vs init-repo) | setup §2a/2b | Easy to skip 2a; examples help | **Yes** if skipped | SC-2, SC-3 |
| J6 | Install vs deploy vs init-repo distinction | setup + engineering-storage | Names similar; needs decision diagram | Yes for multi-repo | SC-3 |
| J7 | MCP client + bootstrap rule | http/stdio JSON + ide-setup | session_token error (C-03); verify soft on list_workflows (C-14) | **Yes** | SC-2 |
| J8 | Verify install | http §4 / stdio §3 | README has almost no verify | Partial | SC-2, SC-8 |
| J9 | Start/resume workflow (NL) | README execute; getting-started §6 | README lacks failure modes / resume detail | Partial | SC-2 |
| J10 | `repo` binding | ide-setup, start_session docs, examples | Scattered; needs one callout on setup + README | Agent path | SC-5 |
| J11 | Storage locations | setup paths + engineering-storage + state model | Dense; progressive disclosure weak | Partial | SC-2 |
| J12 | Update/reload workflows | setup §4; site day-two | Naming mismatch C-05 | No | SC-3 |
| J13 | Diagnose errors | http oauth noise; stdio stderr note | No central troubleshooting; real failure modes incomplete | **Yes** | SC-2 |
| J14 | API reference access | api-reference + site tools | Counts drift C-01; HTTP methods C-06 | Integrator | SC-1, SC-7 |
| J15 | Author workflows | orchestra + technique specs + schemas | Specs not on site hub; dense without plain intro | Author path | SC-6 |
| J16 | Contribute | development.md | Not linked from site nav | No | — |

**Golden-path (prospective user) — blocking gaps:** J5 order clarity, J7 correct bootstrap identity fields, J8/J13 verify + troubleshoot, J9 first successful workflow narrative with expected outputs.

---

## F. Proposed information architecture

### F.1 Principles

1. **One canonical owner** per recurring fact (map D).  
2. **Progressive disclosure:** README → setup/transport → guide → specs → normative.  
3. **Stable URLs/filenames** (requirements constraint).  
4. **Site nav reflects real pages only** (no ghost internals).  
5. **Present-tense product voice**; history only in planning artifacts.

### F.2 Target tree (filenames unchanged unless noted)

```
README.md                          # Q1–Q10 thin spine + links (not full procedures)
setup.md                           # Shared sequence owner (§1–§4 incl. day-two)
http.md / stdio.md                 # Transport deltas only
docs/ide-setup.md                  # Bootstrap rule owner
docs/api-reference.md              # Short catalog owner
docs/*_model.md + workflow-fidelity.md
docs/orchestra-specification.md
docs/technique-protocol-specification.md
docs/documentation-system.md       # Meta owner (claims fixed)
docs/development.md
docs/engineering-storage.md
schemas/README.md
examples/cursor-workspace/

site/index.html                    # Value + where-to-start
site/guide/getting-started.html    # Illustrated setup (mirrors setup)
site/guide/definitions.html        # Glossary owner
site/specifications.html           # Hub → normative md + architecture specs
site/specs/*                       # Architecture models
site/api/tools.html | schemas.html # Generated
site/design/*                      # Implementation narrative (replaces claimed internals)
```

### F.3 Navigation adjustments (no new platform)

| Change | Rationale |
|--------|-----------|
| specifications.html links orchestra + technique protocol + schemas | Close author journey J15 |
| documentation-system retargets design/* not internals/rationale ghosts | C-07, C-08 |
| README “Documentation map” 8–12 links ordered by journey | SC-2 |
| Optional later: `site/design/rationale.html` only if ADR distillation needed | Deferred unless approved |

### F.4 Canonical vocabulary

| Term | Use | Avoid |
|------|-----|-------|
| Workflow | Top-level process | — |
| Activity | Phase | — |
| Technique | Capability markdown | Skill |
| Tool | MCP tool | — |
| session_index | 6-char session id | session_token, session_id (unless HTTP MCP transport session) |
| Engineering root / planning folder | Storage | Vague “state folder” alone |
| deploy.sh / init-repo.sh / install.sh | Distinct verbs | “install the repo” ambiguous |

---

## G. Prioritized implementation plan (7 batches)

Estimates are agentic effort + separate human review. **Do not start Batch 1 until analysis review accepts this document.**

### Batch 1 — Factual correctness / safety (SC-1, SC-5, SC-7)

| Task | Actions | Acceptance |
|------|---------|------------|
| 1.1 Rebase/merge main into PR branch | Absorb site regen `057920a2` | Clean tree; `npm run build:site` clean |
| 1.2 Tool-count consistency | Fix sixteen/twelve prose; keep 17; anatomy 13+4 | `rg` for sixteen/twelve tool claims = 0 false hits |
| 1.3 ide-setup session_index | Remove session_token | ide-setup + example rules match |
| 1.4 AGENTS/CLAUDE model line | Workflow + Technique | Matches README/definitions |
| 1.5 HTTP methods | Document GET/DELETE /mcp | Matches http.ts |
| 1.6 documentation-system ghosts | Retarget missing paths | No broken path claims |
| 1.7 engineering AGENTS SETUP.md | → setup.md | Link resolves |
| 1.8 Regenerate generated regions | `npm run build:site` (+ schemas if needed) | `tests/site.test.ts` green |

### Batch 2 — Onboarding / navigation (SC-2, SC-3)

| Task | Actions | Acceptance |
|------|---------|------------|
| 2.1 README spine | Value, transport choice, link setup, verify, start/resume, map | Prospective user can navigate without code |
| 2.2 setup §4 / day-two naming | Align anchors with http/stdio/site | Cross-links resolve |
| 2.3 Decision callout deploy vs init-repo vs install | Short diagram/table in setup | J5/J6 clear |
| 2.4 Verify primary = discover + start_session(repo) | ide-setup + getting-started | Matches transport smoke |
| 2.5 specifications hub | Link normative specs | J15 entry works |

### Batch 3 — Duplication reduction (SC-4)

| Task | Actions | Acceptance |
|------|---------|------------|
| 3.1 Apply owner+link pattern | Thin mirrors; remove competing procedures | Spot-check install/bootstrap/API |
| 3.2 Transport files delta-only audit | No full setup reprint | SC-3 |

### Batch 4 — Plain language (SC-6)

| Task | Actions | Acceptance |
|------|---------|------------|
| 4.1 Onboarding pages | Outcomes first; steps; examples | Editorial pass |
| 4.2 Normative specs | Plain-language intro sections only | Specs remain precise |
| 4.3 Voice scrub | Evolution phrasing in product docs | Per AGENTS voice rule |

### Batch 5 — Examples / troubleshooting (SC-2, SC-8)

| Task | Actions | Acceptance |
|------|---------|------------|
| 5.1 Troubleshooting sections | Near http/stdio failure points; oauth noise; missing repo; key dir | Real failure modes |
| 5.2 Golden-path expected outputs | Sample discover/start_session success cues | Manual walk checklist |
| 5.3 examples/cursor-workspace | Sync with ide-setup rule text | Copy-paste works |

### Batch 6 — Accessibility / presentation (SC-7)

| Task | Actions | Acceptance |
|------|---------|------------|
| 6.1 Site a11y pass | Landmarks, focus, contrast, skip link, table/code overflow | Manual + automated where possible |
| 6.2 SVG/layout | `check:svg` clean | CI |

### Batch 7 — Automated drift prevention (SC-8, SC-1)

| Task | Actions | Acceptance |
|------|---------|------------|
| 7.1 Tool-count guard | Test or check script: registered tools == documented count strings / api-ref table | Fails on drift |
| 7.2 Optional claim linter | Flag session_token, Skill→Technique in agent docs | CI or script |
| 7.3 Full validation suite | `build:site`, `check:site`, `check:svg`, site tests, typecheck, link/anchor, manual golden path | SC-8–SC-10 |

### Suggested PR sequencing

Prefer **one PR (#293)** with stacked commits per batch (or batch-labeled commits) for reviewability—not seven PRs—unless review load forces splits.

---

## Located implementation (docs system)

| Area | Location |
|------|----------|
| Tool surface | `src/tools/workflow-tools.ts`, `src/tools/resource-tools.ts`, `src/server.ts` |
| HTTP | `src/transports/http.ts` |
| Site generator | `scripts/generate-site-data.ts` (`SITE_ROUTES`, tool capture) |
| Link/SVG checks | `scripts/check-site-links.ts`, `scripts/check-svg-layout.ts` |
| Site tests | `tests/site.test.ts` |
| Install scripts | `scripts/install.sh`, `init-repo.sh`, `deploy.sh`, `start.sh`, `stop.sh`, `update-workflows.sh` |
| Example workspace | `examples/cursor-workspace/` |
| Planning package | `.engineering/artifacts/planning/2026-07-25-update-the-docs-site/` |

---

## Effectiveness assessment

| What works | Evidence |
|------------|----------|
| Two-layer model documented | documentation-system.md + generator tests |
| Setup triad split | setup vs http/stdio |
| Generated API pages resist parameter drift | generate-site-data records live registration |
| Glossary on site | definitions.html |
| Example Cursor workspace | examples/cursor-workspace |
| Transport verify tables | http §4, stdio §3 |

| Pain points | Evidence |
|-------------|----------|
| Hand-authored counts drift | sixteen vs 17 |
| Meta-docs describe nonexistent pages | internals/, rationale.html |
| Agent instruction vocabulary drift | Skill, session_token |
| README too thin for SC-2 | 60-line README vs rich site guide |
| Naming mismatch day-two | setup §4 vs transport refs |
| Authoring specs off-nav | orchestra/technique not in SITE_ROUTES |

---

## Baseline metrics (reproducible)

| Metric | Method | Current (worktree 2026-07-25) | Target |
|--------|--------|-------------------------------|--------|
| MCP tools registered | Count unique names from `server.tool` / `server.registerTool` in `src/tools` | **17** | Documented everywhere as 17 |
| False tool-count strings | `rg -n 'sixteen MCP|registers 16|twelve.*workflow-tools'` on site/docs | **≥3** false/outdated | **0** |
| SITE_ROUTES vs HTML | Set equality script | **0** orphans | **0** |
| Ghost paths in documentation-system | Path exists check | **2** missing | **0** |
| `session_token` in product docs | `rg session_token` | **≥1** (ide-setup) | **0** |
| Skill vs Technique in AGENTS | `rg Skill` AGENTS/CLAUDE | **1** model line | **0** misuse |
| Site tests | `npm test -- tests/site.test.ts` | Not re-run this activity (branch lag risk) | Pass after Batch 1 |
| check:site / check:svg | package scripts | Not re-run this activity | Pass before complete |
| Golden-path manual | Operator walk install→first workflow | **Not passed** (analysis only) | Pass at validation |
| Analysis A–G complete | This file sections A–G | **Done** | Reviewed |

---

## Gaps linked to success criteria

| Gap | SC | Batch |
|-----|----|-------|
| Tool count / anatomy arithmetic | SC-1, SC-7 | 1 |
| session_token / Skill vocabulary | SC-1, SC-5 | 1 |
| Ghost site paths in meta-doc | SC-1, SC-7 | 1 |
| HTTP method incompleteness | SC-1 | 1 |
| Branch site staleness vs main | SC-7 | 1 |
| README/journey thinness | SC-2 | 2 |
| day-two / §4 mismatch | SC-3 | 2 |
| deploy/init/install confusion | SC-2, SC-3 | 2 |
| Competing procedure copies | SC-4 | 3 |
| Dense specs without plain intros | SC-6 | 4 |
| Troubleshooting / golden-path outputs | SC-2, SC-8 | 5 |
| a11y presentation | SC-7 | 6 |
| Missing automated claim guards | SC-8 | 7 |
| Implementation before analysis review | SC-9 | Gate (human) |

---

## Assumptions (IA phase)

Recorded in [assumptions-log.md](assumptions-log.md) as IA-*. Code-resolvable items validated above; residual stakeholder choices (if any) stay open only when non-code.

---

## Measurement methodology for post-implementation

1. Re-run baseline table metrics.  
2. Close each C-* row or move residual to COMPLETE.md limitations.  
3. Manual golden-path checklist (requirements SC-2).  
4. `npm run build:site && npm run check:site && npm run check:svg && npm test -- tests/site.test.ts && npm run typecheck`.  
5. Diff review: no hand-edits inside `BEGIN GENERATED` regions.
