---
title: "Workflow-canonical ontology — implementation plan"
status: draft
phase: planning
date: 2026-05-23
author: agent (mike.clay@shielded.io)
supersedes: plan.md (renamed)
references:
  architecture: ./architecture.md
  ontology: ./workflow-canonical-ontology.md
  ontology-definition: ./sample/resources/workflow-canonical/SKILL.md
---

# Workflow-canonical ontology — implementation plan

> The plan for implementing the **workflow-canonical ontology** (skill / technique / role / tool) and rolling it out via the pilot migration of the `work-package` workflow.
>
> **This document is about the ontology and its first application.** It is NOT about the universal skill-architecture (which lives in [architecture.md](./architecture.md)). The ontology *describes* itself in [workflow-canonical-ontology.md](./workflow-canonical-ontology.md) and *manifests* itself in the ontology definition at [sample/resources/workflow-canonical/SKILL.md](./sample/resources/workflow-canonical/SKILL.md). This plan covers how those artifacts get authored and applied.

---

## 1. Executive summary

The workflow-server currently authors and serves agent guidance as **TOON files** organised flat under each workflow's `skills/` folder (25 files for `work-package`, ~1800 lines). The architectural target is the **Claude Agent Skills open standard** — markdown `SKILL.md` files with arbitrary nesting depth, served by an ontology-agnostic `get_skill(path)` accessor (see [architecture.md](./architecture.md)).

This plan addresses **one specific ontology** that workflows can adopt on top of that architecture: **workflow-canonical**, a four-element ontology of Skill / Technique / Role / Tool. The ontology gives the agent a rich conceptual model while the architecture stays minimal and reusable.

**Headline decisions** (settled with the user; see §2):

- The workflow-canonical ontology is the pilot ontology. Other workflows MAY adopt it or define alternatives.
- `work-package` is the pilot workflow for this ontology — 25 TOON skills + 28 resource files migrate to the new structure.
- Markdown is the source-of-truth (at-rest) format; the workflow-server delivers a token-efficiency projection of it — TOON for techniques, simplified markdown for resources (see architecture.md §7).
- The ontology lives in a definition resource at `shared/resources/workflow-canonical`. The plan covers authoring it.

**This plan delivers**: (a) the ontology definition authoring approach (already drafted as a sample), (b) the workflow-canonical-specific package layout for `work-package`, (c) the pilot migration phases for `work-package`, (d) a generalisation template for the other 9 workflows that might adopt this ontology, (e) fidelity criteria, and (f) risks specific to the ontology rollout. Three appendices ground the design in empirical evidence from the existing `work-package` workflow.

---

## 2. Spec recap (settled with the user)

| Decision | Value | Source |
|---|---|---|
| Source-of-truth format | Markdown (Claude SKILL.md format) | User answer, 2026-05-22 |
| Wire format to the agent | Server token-efficiency projection on delivery: TOON for techniques, simplified markdown for resources (see architecture.md §7) | User answers, 2026-05-22 → 2026-05-27 |
| Pilot scope | `work-package` workflow (25 skills); design must generalise to the other 9 | User answer, 2026-05-22 |
| Ontology origin | Derived from the user's plumber analogy, validated empirically against the 25 existing skills | User instruction, 2026-05-22 |
| Canonical Claude skills examples | Treat as illustrative *guidelines*, not normative patterns | User instruction, 2026-05-22 |
| Implementation | **Defer.** This document plans the work, it does not execute it. | User instruction, 2026-05-22 |
| Planning artifact location | `.engineering/artifacts/planning/<YYYY-MM-DD>-<slug>/` | User instruction, 2026-05-22 |

---


## 3. The workflow-canonical ontology

The ontology — Skill, Technique, Role, Tool — has its own dedicated artifacts:

- **Descriptive companion**: [workflow-canonical-ontology.md](./workflow-canonical-ontology.md) — human-facing; positive and negative definitions, composition rules, cross-reference format, self-contained vs composing technique bodies, the plumber analogy, SPEM 2.0 grounding, empirical validation against the 25 legacy skills + 28 resources.
- **Operational artifact**: [sample/resources/workflow-canonical/SKILL.md](./sample/resources/workflow-canonical/SKILL.md) — agent-facing; the ontology definition the agent loads at session start to interpret skills tagged with this ontology.

The descriptive companion and the ontology definition carry the same ontology in two registers. When the two conflict, the ontology definition is authoritative for agent execution; the companion explains *why*.

### 3.1 Why this ontology (the briefer version)

The TOON skills conflate three concepts the new ontology names separately:

- The persona of the agent invoking the skill (Role — never explicitly named in TOON).
- The work product the unit produces (named by a Technique's `Output` section; the delegation is declared in `workflow.toon`).
- The reusable operations the skill performs internally (Technique — protocol phases, often shared across many TOON skills).

Plus the external systems those operations invoke (Tool).

The empirical inventory (Appendix A) shows that distinguishing these four reduces ~30–40% of duplicated guidance across the 25 TOON skills. The new structure makes each first-class.

### 3.2 What the architecture provides; what the ontology adds

The universal architecture ([architecture.md](./architecture.md)) provides:

- The `skills/` directory tree.
- `get_skill(path)` at arbitrary depth.
- Markdown wire format.
- Three server-enforced frontmatter fields: `name`, `description`, `ontology`.

The workflow-canonical ontology adds:

- The semantic interpretation of those skills — what makes one a `technique` (and whether its body is self-contained or composes other techniques) versus a freeform resource (which carries no `metadata.ontology`).
- The composition rules — how techniques nest, how they live under their owner, how role contracts are sectioned inside the workflow technique.
- The cross-reference format — file-relative `[name](../name/SKILL.md)` hyperlinks (relative to the referencing file's own directory).
- The ontology-specific frontmatter fields — `kind`, and any others the ontology defines.

Crucially, **everything the ontology adds lives in the ontology definition, not the server**. Authoring the ontology definition IS authoring the ontology.

---

## 4. Proposed markdown package layout

The package on disk (post-migration). Key conventions:

- **`SKILL.md` is mandatory** at the root of every skill folder (the only filename constraint mandated by agentskills.io).
- **No other entry files** — `SKILL.md` is the only file in a folder; nested folders are nested skills (no sub-files, no `index.md`).
- **Techniques** are `SKILL.md` folders nested under their owner (`<owner>/<technique>/SKILL.md`) — no `techniques/` intermediate directory. Shared/common techniques live at `shared/techniques/`.
- **Content is single-kinded**: every governed unit is a `technique`. Which units are activity-bound (the existing 25) is declared in `workflow.toon`, not in frontmatter. A unit that only groups related skills with no procedure or `Output` of its own (a pure namespace, e.g. `gitnexus`) is a freeform resource, not a technique; a unit that composes sub-techniques but carries its own body is a composing technique.
- **Roles** are `##` sections inside the `workflow` technique; **tools** have no on-disk slot (inline in prose, or a tool-dedicated namespace resource).
- **Resources** are freeform `SKILL.md` skills (no `ontology`/`kind`) at `shared/resources/` (shared) or `<workflow>/resources/` (workflow-local) — see [Appendix C](./appendix-resource-subsumption.md) for per-file dispositions.

```
workflows/
  work-package/
    workflow.toon                          # unchanged
    activities/                            # unchanged

    skills/                                # MIGRATED.

      # --- Ontology definition lives in the shared/ layer, not here ---
      # shared/resources/workflow-canonical/SKILL.md (a shared resource). A governed
      # skill's `metadata.ontology: workflow-canonical` resolves to it by name.
      #   (see sample/resources/workflow-canonical/SKILL.md)

                                           # 25 producing techniques + ~7 library groupings = 32 total
      # --- Producing techniques (25) ---
      # Every skill folder contains a lean SKILL.md (a composing body) PLUS one or more action-named
      # nested techniques. There are NO flat sub-files. Templates, criteria, primers etc.
      # are each promoted to a named technique. Example sketches:

      implement-task/
        SKILL.md                           # composing body + technique table
        understand-task-context/
          SKILL.md
        write-task-code/
          SKILL.md
        verify-task-locally/
          SKILL.md

      create-plan/
        SKILL.md
        decompose-into-tasks/
          SKILL.md
        compose-plan-artifact/              # absorbs resource 10's template content
          SKILL.md

      create-test-plan/
        SKILL.md
        derive-test-cases/
          SKILL.md
        compose-test-plan-artifact/         # absorbs resource 11's template content
          SKILL.md

      update-pr/
        SKILL.md
        compose-pr-description/             # absorbs resource 12's template content
          SKILL.md
        link-issues-and-request-review/
          SKILL.md

      review-code/
        SKILL.md
        scope-the-code-review/
          SKILL.md
        apply-rust-substrate-criteria/      # absorbs resource 16's criteria
          SKILL.md

      respond-to-pr-review/
        SKILL.md
        fetch-and-classify-pr-comments/     # absorbs resource 28's guidance
          SKILL.md
        draft-pr-response/
          SKILL.md

      manage-artifacts/
        SKILL.md
        compose-workpackage-readme/         # absorbs resource 01's template content
          SKILL.md
        organise-by-activity-prefix/
          SKILL.md

      summarize-architecture/
        SKILL.md
        compose-architecture-summary/       # absorbs resource 19's template content
          SKILL.md

      conduct-retrospective/
        SKILL.md
        compose-retrospective-artifact/     # absorbs resource 20's template content
          SKILL.md

      finalize-documentation/
        SKILL.md
        compose-completion-summary/         # absorbs resource 21's template content
          SKILL.md

      build-comprehension/
        SKILL.md
        identify-comprehension-gaps/
          SKILL.md
        apply-comprehension-techniques/     # absorbs resource 25's reference
          SKILL.md

      review-strategy/
        SKILL.md
        apply-minimality-checklist/         # absorbs resource 18's checklist
          SKILL.md

      create-issue/
        SKILL.md
        compose-github-issue/                # absorbs resource 03
          SKILL.md
        compose-jira-issue/                  # absorbs resource 04
          SKILL.md

      analyze-implementation/
        SKILL.md
        trace-execution/
          SKILL.md
        identify-hotspots/
          SKILL.md

      # NOTE: dco-provenance (one of the 3 single-phase skills) is COLLAPSED in this layout
      # — the workflow activity binds directly to ../workflow/dco-attest-commit/ instead.
      # research-knowledge-base and elicit-requirements keep their composing body with one
      # named nested technique each.
      #
      # ... remaining producing techniques follow the same composing-body + named-techniques pattern ...

      # --- Competency-bundle skills — domain-bundles AND tool-bundles ---
      # Techniques nest DIRECTLY inside their owning skill (no `techniques/` intermediate dir).
      # Sub-files (flat .md) sit alongside nested-technique folders, distinguishable structurally.

      gitnexus/                            # tool-bundle: one nested technique per gitnexus API endpoint
        SKILL.md                           # gitnexus overview (high-level description of the tool)
        impact/
          SKILL.md                         # operational spec for gitnexus_impact() API
        context/
          SKILL.md                         # operational spec for gitnexus_context() API
        cypher/
          SKILL.md                         # operational spec for gitnexus_cypher() API
        detect-changes/
          SKILL.md
        query/
          SKILL.md
        rename/
          SKILL.md
        shape-check/
          SKILL.md
        # … additional per-endpoint techniques distributed from resource 27 …

      workflow/                            # domain-bundle: workflow orchestration + role contracts
        SKILL.md                           # workflow execution patterns + role contracts as ## sections
                                           #   (e.g. ## Engineer, ## Reviewer, ## Planner, ## Architect, ## Maintainer)
        load-guidance/
          SKILL.md
        write-and-validate-artifact/
          SKILL.md
        present-and-respond-checkpoint/
          SKILL.md
        dco-attest-commit/
          SKILL.md

      code-review/
        SKILL.md
        document-findings/
          SKILL.md
        verify-task-deliverables/
          SKILL.md
        index-and-review-diffs/
          SKILL.md

      research/
        SKILL.md
        search-knowledge-base/
          SKILL.md
        search-external-sources/
          SKILL.md
        elicit-structured-requirements/
          SKILL.md

      design/
        SKILL.md
        apply-design-framework/
          SKILL.md
        conduct-architecture-review/
          SKILL.md
        analyze-implementation-baseline/
          SKILL.md

      assumption-management/
        SKILL.md
        collect-and-classify-assumptions/
          SKILL.md
        reconcile-assumptions-autonomously/
          SKILL.md

      testing/
        SKILL.md
        tdd-design-rust/                   # absorbs resource 23 — TDD reference content into the technique body
          SKILL.md
```

**Conventions** (full statement):

- **Directory name = identity slug** (lowercase-kebab, matches the `name:` frontmatter field). Slugs are verb-phrased and disambiguated for techniques (e.g. `understand-task-context`, not `understand-context`); generic stubs (`procedure/`, `execute/`, `main/`, `do/`, `run/`, `step-1/`) are banned.
- **`SKILL.md`** at the root of every skill folder is **mandatory** (agentskills.io spec). Every level — top-level technique, library grouping, AND nested technique — uses this filename. On-disk shape is uniform: every folder contains exactly one `SKILL.md` and may contain nested skill folders. No flat sub-files anywhere.
- **No sub-files of any kind.** Templates, criteria, primers, role contracts, glossaries — these are not separate files. Templates and criteria become named techniques. Role contracts live as `##` sections within the workflow skill's `SKILL.md` body. Domain primers are folded into the technique body they support.
- **Frontmatter** — server-enforced fields are the minimum needed; everything else is ontology-defined:
  - **Top-level (agentskills.io spec)**: `name:`, `description:`.
  - **Under `metadata:` (architecture-required, governed skills only)**: `ontology: workflow-canonical`, `kind: technique` — two bare-slug fields; resources carry neither.
  - **Under `metadata:` (workflow-canonical-defined)**: any metadata entries per the ontology definition's schema. There is no `produces` field — which technique is the unit of workflow delegation is declared in `workflow.toon` (the activity binding), and the technique's `Output` section names the work product.
  - **Absent fields** (under workflow-canonical): no `role:` (role-to-skill binding lives in `workflow.toon` activities), no `uses-tools:` (tool calls are inline in technique prose), no `bundles-subfiles:` (no sub-files exist).
- **Cross-skill technique reference**: by relative path from the referencing body — e.g. `[impact](../gitnexus/impact/SKILL.md)` from `skills/implement-task/SKILL.md`. The path drops the previously-considered `techniques/` intermediate directory.
- **No `resources/` directory** — see [Appendix C](./appendix-resource-subsumption.md) for the per-file disposition of the 28 pre-migration resources (all now promoted to techniques or folded into the workflow skill).

**An activity-bound technique (lean composing body) — example sketch:**

```markdown
---
name: implement-task
description: |
  Implement a single task from a work-package plan by writing code changes.
  Trigger when the plan iterator yields a task and the workspace is ready.
metadata:
  ontology: workflow-canonical
  kind: technique
---

# Implement task

Produces a code change scoped to one task: typecheck-clean, test-passing,
gitnexus-verified, and DCO-attested. Pre-conditions: a task object is provided
by the activity iterator; the workspace has no uncommitted changes.

## Techniques

Apply the following techniques in order. The engineer role contract
(workflow skill, `## Engineer` section) mandates the pre-edit and post-edit
gitnexus discipline.

| # | Technique | When to apply |
|---|---|---|
| 1 | [./understand-task-context/SKILL.md](./understand-task-context/SKILL.md) | Read task, identify affected files. |
| 2 | [../gitnexus/impact/SKILL.md](../gitnexus/impact/SKILL.md) | Pre-edit impact check on target symbol (`direction: upstream`). HIGH/CRITICAL → surface to user before proceeding. |
| 3 | [./write-task-code/SKILL.md](./write-task-code/SKILL.md) | Implement the change. For Rust TDD see `../testing/tdd-design-rust/SKILL.md`. |
| 4 | [./verify-task-locally/SKILL.md](./verify-task-locally/SKILL.md) | Run typecheck and tests for the affected area. |
| 5 | [../gitnexus/detect-changes/SKILL.md](../gitnexus/detect-changes/SKILL.md) | Post-edit verification: confirm changes touched only the expected symbols. |
| 6 | [../workflow/dco-attest-commit/SKILL.md](../workflow/dco-attest-commit/SKILL.md) | Sign and commit. |

## Handoffs
On task completion, the activity iterator advances to the next task or to
`validate-build` if this was the last task.
```

Notes on this sketch:
- **Lean.** The composing body is ~25 lines. No embedded protocol; the protocol lives in the named techniques.
- **No frontmatter `role:`, `uses-tools:`, `bundles-subfiles:`.**
- **All folder children are named techniques.** `understand-task-context/`, `write-task-code/`, `verify-task-locally/` are sibling technique folders under `skills/implement-task/`. No `procedure/` stubs, no flat sub-files.
- **Cross-skill technique references** in the table use `../<bundle>/<technique>/SKILL.md`.

The migration will produce per-skill composing bodies of this form, grounded in the existing TOON content.

---

## 5. Server seam — deferred to architecture

The server-side concerns (markdown loader, `get_skill(path)` arbitrary-depth resolution, frontmatter validation, wire-format policy, MCP surface) are **architecture-level and ontology-agnostic**. See [architecture.md §6 (MCP surface)](./architecture.md#6-mcp-surface), [§7 (Wire format)](./architecture.md#7-wire-format), and [§8 (Migration approach)](./architecture.md#8-migration-approach-any-workflow-any-ontology).

The only workflow-canonical-specific touchpoints with the server are:

- The ontology definition at `shared/resources/workflow-canonical` is the first resource the agent loads when it sees a skill carrying `metadata.ontology: workflow-canonical`. The agent resolves the name (workflow-local → shared/) and fetches it; the server just resolves the name.
- No `meta/` location. The ontology definition is a shared resource at `shared/resources/workflow-canonical/SKILL.md`, resolved by name under precedence. (`meta/` is not reserved — it is simply the folder of the workflow named `meta`.)
- The kind value within workflow-canonical (`technique`) — opaque to the server, interpreted by the agent via the ontology definition.

---

## 6. Pilot migration plan — `work-package`

The pilot is bounded and concrete:

### Phase 0 — Author the ontology definition (`shared/resources/workflow-canonical`)

- Author `shared/resources/workflow-canonical/SKILL.md` (a shared resource) based on the planning-folder sample at `sample/resources/workflow-canonical/SKILL.md`.
- The definition covers: Skill/Technique/Role/Tool concepts, composition rules, cross-reference format (file-relative hyperlinks), self-contained vs composing technique bodies, frontmatter schema, agent bootstrap procedure, refusal paths.
- Validate that the definition is fetchable via `get_skill("workflow-canonical")` (resolved to `shared/resources/workflow-canonical`).
- Test: an agent given only the ontology definition + an empty skills tree understands the ontology well enough to interpret a sample skill correctly.

### Phase 1 — Foundations (planning + alignment)

- ✓ Finalise the ontology (this document, pending review).
- Finalise the unified frontmatter schema for `SKILL.md` files: top-level `name` and `description` (spec-required); `metadata.ontology: workflow-canonical` and `metadata.kind: technique` (architecture-required on governed skills; resources carry neither). There is no `produces` field — which technique is activity-bound is declared in `workflow.toon`.
- ✓ Empirical resource-classification pass complete — see [Appendix C](./appendix-resource-subsumption.md): 10 promotions to technique, 12 skill-local sub-files, 4 technique-local sub-files, 1 workflow doc, 1 deletion.
- Sketch one example producing-technique `SKILL.md`, one library-grouping `SKILL.md`, one nested-technique `SKILL.md`, one tool entry, and one role section for review before bulk migration.
- Decide on the library-grouping set (proposal: `gitnexus`, `workflow`, `code-review`, `research`, `design`, `assumption-management`, `testing` — 7 groupings housing 18 techniques; may consolidate to 5–6 after authoring). A pure namespace like `gitnexus` (no procedure or `Output` of its own) is a freeform resource; a grouping that carries its own body (e.g. `workflow`) is a composing technique.

### Phase 2 — Server scaffolding (ontology-agnostic markdown loader)

- Add a minimal `SKILL.md` frontmatter schema under `src/schema/` — server-enforced fields: `name`, `description` always; `ontology`+`kind` on governed skills (absent on resources). Everything else is passed through opaquely (any ontology-defined fields).
- Implement `parseSkillMarkdown` under `src/loaders/markdown/`: splits frontmatter from body, validates the server-required fields, returns `{ frontmatter, body }`. Does NOT validate ontology-specific fields.
- Extend `readSkillRaw` / `tryLoadSkill` to: (a) walk recursively into nested skill folders at arbitrary depth; (b) detect markdown sources at any path depth; (c) deliver via the token-efficiency projection per architecture §7 — TOON for techniques, simplified markdown for resources, auto-detected from frontmatter; no ontology validation.
- Generalise `get_skill` to resolve names by precedence (workflow-local → shared/) and per-section addressing (e.g. `workflow-canonical`, `gitnexus/impact`, `cargo-operations/check`).
- Mark `get_resource` deprecated; have it return a "moved to X" indicator for any pre-migration resource ID still requested.
- Add caching by `(path, mtime)`.
- Test: every existing TOON skill must still round-trip identically through `get_skill` (no regression on TOON path during the migration window).
- Test: example markdown skill from Phase 0 (the ontology definition) and Phase 1 round-trip correctly through `get_skill` at any nesting depth.

### Phase 3 — Author tool-dedicated skills (where warranted)

- For each tool complex enough to warrant operational documentation (primarily `gitnexus`; possibly `concept-rag`), author a tool-dedicated namespace resource at `skills/<tool>/SKILL.md` (a pure namespace: no procedure or `Output` of its own).
- For each tool, identify the API endpoints the work-package workflow uses and author one nested technique per endpoint at `skills/<tool>/<endpoint>/SKILL.md`. Each technique's body is the operational spec for that endpoint: parameters, semantics, return shape, errors, common usage.
- For `gitnexus`, distribute resource 27's content across the endpoint techniques and the bundle's `SKILL.md`. Estimated 6–10 endpoint techniques for the work-package's needs.
- Tools that don't warrant a dedicated skill (`git`, `cargo`, `Bash`/`Edit`/`Read`) are documented only inline in technique prose where they appear — no separate file.

### Phase 4 — Author the workflow skill (which houses roles inline + workflow-orchestration techniques)

- Author `skills/workflow/SKILL.md` as a single cohesive document containing:
  - Workflow execution patterns + hand-off rules in the body.
  - Role contracts as `##` sections: `## Engineer`, `## Reviewer`, `## Planner`, `## Architect`, `## Maintainer`. Each section is a persona contract — responsibilities, authority, refusals, qualified-skills list. No separate role files.
  - A `## Techniques` table listing the nested workflow-orchestration techniques.
- Author the workflow-orchestration techniques as nested `SKILL.md` files directly under `skills/workflow/`: `load-guidance/SKILL.md`, `write-and-validate-artifact/SKILL.md`, `present-and-respond-checkpoint/SKILL.md`, `dco-attest-commit/SKILL.md`.

### Phase 5 — Author the remaining library groupings + their nested techniques

- For each remaining domain grouping (`code-review`, `research`, `design`, `assumption-management`, `testing`): author its lean `SKILL.md` (a composing body + `## Techniques` table), then author each nested technique directly under it as `<technique>/SKILL.md`.
- 10 nested domain-bundle techniques total (gitnexus endpoints are Phase 3; workflow techniques are Phase 4).
- Domain primers and reference content (per Appendix C — e.g. resource 23 → `testing/tdd-design-rust/SKILL.md`) are folded into the technique body, not held as sub-files.
- Validate every produced SKILL.md against the schema.

### Phase 6 — Migrate the 25 producing techniques (mechanical, one-by-one)

For each of the 25 TOON skills, in dependency order (tool namespaces, the workflow grouping, and domain groupings must exist first):

1. Create `workflows/work-package/skills/<skill-name>/SKILL.md` as a lean composing body (~25–80 lines). Frontmatter: top-level `name`, `description`; under `metadata:` `ontology: workflow-canonical`, `kind: technique`. Body: 1–2 paragraphs of context + a `## Techniques` table. (The activity binding that makes this the unit of delegation lives in `workflow.toon`, not in frontmatter.)
2. **Lift each TOON `protocol` phase into a named nested technique** at `skills/<skill-name>/<phase-as-named-technique>/SKILL.md`. Phase names are disambiguated and verb-phrased (`understand-task-context`, `write-task-code`, `verify-task-locally` — NOT `procedure`, `execute`, `step-1`). Skill-specific phases stay nested; cross-cutting phases (those that recur across many skills — `load-guidance`, `document-findings`, `pre-edit-impact-check`) are referenced from outside the skill (their canonical home is a bundle).
3. Build the composing body's `## Techniques` table: ordered list of every technique the protocol invokes — nested ones via `./` paths, cross-cutting ones via `../<bundle>/<technique>/SKILL.md`.
4. Move skill-level rules into the composing body (invariants/guards) OR into the relevant nested technique (in-flight discipline) OR into the role contract in `skills/workflow/SKILL.md` (cross-cutting role behaviour like the gitnexus discipline).
5. Promote any template / criteria / primer content (per Appendix C) to its own named nested technique — e.g. resource 12 (PR description template) becomes `skills/update-pr/compose-pr-description/SKILL.md`. Never a flat sub-file.
6. Validate: every produced SKILL.md parses cleanly and validates against the schema; the worker can fetch the skill and follow its technique references end-to-end via `get_skill`.
7. Delete the old `NN-<skillId>.toon` file.

**Special-case handling for single-phase wrapper skills:**
- `dco-provenance` (TOON 25): **collapse**. Do not author a composing wrapper. Update `workflow.toon` activities that previously bound to `dco-provenance` to bind directly to `workflow/dco-attest-commit/SKILL.md` instead.
- `elicit-requirements` (TOON 05) and `research-knowledge-base` (TOON 06): **keep with one named technique each**. The composing body preserves skill-specific framing (elicitation style, KB-research synthesis logic) that goes beyond the underlying technique.

### Phase 7 — Cutover and verification

- Run the existing test suite (no regressions on workflow execution).
- Run an end-to-end work-package session against the migrated content; verify the worker produces the same artifacts and follows the same protocol as the pre-migration baseline.
- Capture a fidelity report (Section 8) comparing pre- and post-migration agent behaviour on a representative task.
- Delete the pre-migration `resources/` directory once Appendix C dispositions are all complete.

### Phase 8 — Documentation and retrospective

- Update `docs/api-reference.md` for the generalised `get_skill` (name-precedence resolution, per-section addressing, auto-detected TOON/markdown delivery).
- Update `README.md` and `SETUP.md` for the new package layout.
- Write a generalisation guide (Section 7) documenting how the pattern applies to the other 9 workflows.
- Retrospective: capture what was hard, what was wrong, what to change.

---

## 7. Generalisation template — the other 9 workflows

The other 9 workflows (`prism`, `prism-audit`, `prism-evaluate`, `prism-update`, `remediate-vuln`, `substrate-node-security-audit`, `cicd-pipeline-security-audit`, `work-packages`, `workflow-design`, `meta`) follow the same migration shape but with workflow-specific role / technique catalogues.

The reusable mechanics from the pilot:

1. **The schema set** (Skill / Technique / Role) is workflow-agnostic and lives in `src/schema/`.
2. **The markdown parser and the MCP tool** (`get_skill`) are workflow-agnostic.
3. **The package layout** (`roles/`, `skills/`, `techniques/` folders per workflow) is the template.
4. **The cross-workflow technique question** — should `gitnexus-impact-check` live in *every* workflow's `techniques/` folder (duplicated) or be promoted to a top-level shared technique library? Defer to a follow-up — out of scope for the pilot, but the answer needs to land before the second workflow migrates.

What is workflow-specific:

- The technique catalogue (each workflow surfaces different cross-cutting concerns).
- The role catalogue (security-audit workflows have Auditor roles; prism workflows have different personas).
- The skill set (entirely workflow-specific).

The expected effort per subsequent workflow is **substantially lower** than the pilot, because the scaffolding (schemas, parser, tools) is built. Per-workflow effort is dominated by authoring the markdown content.

---

## 8. Fidelity criteria

"Without losing fidelity" needs an operational definition. We propose three layers of fidelity:

### 8.1 Content fidelity (mechanical)

Every fact, rule, protocol step, error case, and resource reference in the original TOON skills must be preserved in the new markdown skills (possibly relocated to a technique or role). Verification:

- A diff-based audit: for each old TOON skill, the union of (new skill body + referenced techniques + referenced role) must cover all content from the old skill.
- A round-trip test: for skills whose entire content is skill-local (no cross-cutting extraction), the TOON emitted from the new markdown should be semantically equivalent to the old TOON.

### 8.2 Behavioural fidelity (the harder one)

A worker agent given the new skill should produce the same artifacts and make the same decisions as a worker given the old skill on the same task. Verification:

- For 3–5 representative tasks from the work-package surface area, run the workflow pre- and post-migration. Diff the produced artifacts, the tool calls made, and any checkpoint decisions.
- Acceptable variance: minor wording differences in produced artifacts; substantive deviations (different decisions, missed steps, missed rules) are fidelity violations.

### 8.3 Discovery fidelity (worker-visibility invariant)

Per the project's worker-visibility invariant ([Workflow-server worker visibility](file:///home/mike1/.claude/projects/-home-mike1-projects-dev-workflow-server/memory/workflow-server-worker-visibility.md)) — workers load skills only; never see `workflow.toon`. Anything worker-visible MUST live in skills. Verification:

- After migration, no rule or protocol element that was previously inside a skill body has been silently relocated to `workflow.toon` or `activities/*.toon`. (Relocation to techniques is fine — workers fetch them via `get_skill`.)
- The worker, given only skills + techniques + the role contract, can complete every protocol without consulting `workflow.toon`.

---

## 9. Risks and open questions

### 9.1 Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Markdown parser regressions break existing TOON-skill workers | Low | High | Test that all 25 existing TOON skills still parse and serve identically after the loader extension lands (Phase 2 gate). |
| Worker agents over-rely on technique pre-fetching, inflating token cost | Medium | Medium | Default agents to lazy technique-fetch; pre-fetch is opt-in per skill via a frontmatter flag. Measure. |
| The 18 technique candidates are wrong-grained (too few / too many / wrong cuts) | Medium | Medium | Treat the catalogue as v1; expect 1–2 splits or merges after the first 5 skills are migrated. Don't lock the catalogue before empirical validation. |
| Role sub-files inside the workflow skill become bureaucratic boilerplate | Medium | Medium | Keep role sub-files short (≤40 lines each). A role with no rules-of-refusal and no behavioural commitments is a role in name only — flag for removal. |
| Cross-workflow technique sharing question gets answered ad-hoc | High | Medium | Defer the cross-workflow technique library question to a follow-up RFC; document the open question now (this section). |
| Hand-authored markdown drifts from the schema over time | Low | Medium | Schema validation on `get_skill` is a hard fail; CI checks every markdown file parses cleanly. |
| Renamed technique paths break skills that reference them | Medium | Low | A small `validate-references` check in CI verifies every `uses-techniques:` relative path resolves to an existing `SKILL.md`. |
| Library groupings accumulate too many techniques and lose coherence | Medium | Medium | Per-grouping technique limit (soft cap: ~6 techniques per grouping); split when exceeded. |
| Resource subsumption misses content that workers depended on | Medium | High | Phase 7 fidelity check explicitly compares: pre-migration worker behaviour vs post-migration; any divergence triggers Appendix C revisit before deleting the resources directory. |

### 9.2 Open questions

1. **Cross-workflow technique sharing.** When 8 of 10 workflows need `gitnexus` techniques, should the `gitnexus` namespace resource live in the shared layer (`shared/techniques/gitnexus/`) or be duplicated per workflow? Decision deferred to post-pilot.
2. **Versioning.** The current TOON skills have `version:` fields. Should `SKILL.md` frontmatter retain versioning? If so, what semantics — semver, monotonic counter, content hash? Proposal: keep a `version:` field, leave semantics informal for the pilot.
3. **TOON wire format for sub-files.** Sub-files are currently shipped as markdown (architecture.md §7); if benchmarks show TOON-encoded sub-files behave acceptably on token cost AND fidelity, unify on TOON. Open until measured.
4. **The "Activity" concept's home.** Activities currently live in `activities/*.toon`. With the new ontology, activities are the workflow-structural binding of role-name + producing technique. Do they stay separate, or fold into `workflow.toon`? Out of scope for the pilot — but worth a future RFC.
5. **Library-grouping set finalisation.** The proposed 7 groupings (`gitnexus`, `workflow`, `code-review`, `research`, `design`, `assumption-management`, `testing`) is the starting point. Empirical validation during Phases 3–5 may consolidate to 5–6 groupings; this is expected.
6. **Tool-dedicated namespaces beyond gitnexus.** The pilot creates a tool-dedicated namespace resource for `gitnexus`. Other tools (`concept-rag`, `git`, `cargo`) MAY warrant the same treatment if usage volume justifies it. Default for the pilot: only `gitnexus` gets a dedicated namespace; others appear inline in technique prose. Re-evaluate post-pilot.

7. **Alternative ontologies.** The architecture supports multiple ontologies via the `metadata.ontology` field. The pilot ships exactly one — `workflow-canonical`. Open question: are there workflows where a different ontology (different conception of skill/technique/role/tool, or an entirely different vocabulary) would serve better? Decision deferred to post-pilot.

8. **Ontology-definition versioning.** Should the definition itself be versioned (`shared/resources/workflow-canonical-v1`, `-v2`, etc.)? Skills frozen at v1 stay interpretable even if v2 introduces breaking changes. Open until the definition needs its first revision.

---

## 10. Out of scope (explicit)

This plan deliberately excludes:

- Workflow-structure migration (`workflow.toon` and `activities/*.toon` stay TOON).
- Cross-workflow shared library design for techniques OR library groupings (deferred — see open question 1).
- IDE tooling for authoring markdown skills (deferred until authoring volume warrants it).
- Removing the TOON wire format on the agent side (deferred until benchmarks justify it).
- A formal RACI matrix for role-to-skill qualifications (we use a single "Responsible" link for the pilot; the workflow skill's role sub-files capture richer guidance informally).

---

## 11. Decision gate before implementation

Before any implementation begins, the user is asked to confirm:

1. **The ontology** — see [workflow-canonical-ontology.md](./workflow-canonical-ontology.md) and the ontology definition at [sample/resources/workflow-canonical/SKILL.md](./sample/resources/workflow-canonical/SKILL.md).
2. **The workflow-canonical package layout** for `work-package` (Section 4).
3. **The server seam** — defers to [architecture.md](./architecture.md); markdown on the wire, no transcoding.
4. **The pilot phases** (Section 6) — Phase 0–8 in order; Phase 2 (server scaffolding) is the no-regression gate; Phase 6 (the legacy 25-skill migration) is the bulk.
5. **The fidelity criteria** (Section 8) — content, behavioural, and discovery fidelity.

Once confirmed, the implementation plan moves into normal work-package execution (likely `create-issue` → `create-plan` → `implement-task` for each phase).

---

## Appendices

- [Appendix A — Empirical reuse evidence](./appendix-empirical-reuse.md) — phase/rule/resource reuse inventory across the 25 existing TOON skills.
- [Appendix B — Per-skill ontology mapping](./appendix-skill-mapping.md) — every existing skill mapped to (role, skill, techniques) in the workflow-canonical ontology.
- [Appendix C — Resource subsumption mapping](./appendix-resource-subsumption.md) — per-resource disposition for the 28 existing `resources/` files.

## Related documents

- [architecture.md](./architecture.md) — universal, ontology-agnostic skill-server architecture.
- [workflow-canonical-ontology.md](./workflow-canonical-ontology.md) — the descriptive companion to the workflow-canonical ontology definition.
- [sample/resources/workflow-canonical/SKILL.md](./sample/resources/workflow-canonical/SKILL.md) — the agent-facing ontology definition (operational form).
- [sample/implement-task/](./sample/implement-task/) — sample skill family illustrating the workflow-canonical ontology.

## Sources

(SPEM 2.0, agentskills.io spec, Anthropic best-practices, etc. — see [architecture.md §11](./architecture.md#11-references) and [workflow-canonical-ontology.md](./workflow-canonical-ontology.md) for canonical references.)
