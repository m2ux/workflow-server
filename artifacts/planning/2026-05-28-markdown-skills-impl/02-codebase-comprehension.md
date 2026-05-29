# Codebase Comprehension — Markdown Skills Migration Implementation

**Work Package:** markdown-skills-impl
**Date:** 2026-05-29
**Activity:** `codebase-comprehension` (session `SUQLKL`)
**Coverage scope:** Skill / resource / workflow / activity loaders and the tool-side delivery surface that the markdown-skills migration will replace.
**Baseline used:** `.engineering/artifacts/comprehension/workflow-server.md` (2026-04-26). This artifact augments it for the loader-flip surface area.
**Out-of-scope artifacts (referenced):** [orchestration.md](../../comprehension/orchestration.md), [hierarchical-dispatch.md](../../comprehension/hierarchical-dispatch.md), [state-tools.md](../../comprehension/state-tools.md) — session, dispatch, and checkpoint flow are unchanged by this migration.

---

## 1. Architecture Overview — Skill/Resource/Workflow Load + Delivery

### 1.1 Layer map (loader → tool → wire)

```
                       ┌────────────────────────────────────────────────┐
                       │ MCP tool handler (resource-tools / workflow-   │
get_skill / get_skills │ tools): orchestrates loader calls + sessionmgmt│
get_resource           │ + bundles output                               │
get_workflow           └─────────────────────┬──────────────────────────┘
get_activity                                 │
resolve_operations                           ▼
                       ┌────────────────────────────────────────────────┐
                       │ Loaders (filesystem → typed/raw)               │
                       │  • skill-loader.ts    (TOON skill + ops)       │
                       │  • resource-loader.ts (TOON + .md resource)    │
                       │  • workflow-loader.ts (TOON workflow + acts)   │
                       │  • activity-loader.ts (TOON activity)          │
                       │  • filename-utils.ts  (NN-{id}.toon parser)    │
                       │  • core-ops.ts        (CORE_*_OPS lists)       │
                       └─────────────────────┬──────────────────────────┘
                                             │
                                             ▼
                       ┌────────────────────────────────────────────────┐
                       │ utils/toon.ts   decode() / decodeRaw() / encode│
                       │ schema/*.ts     Zod safeValidate*()            │
                       └────────────────────────────────────────────────┘
```

### 1.2 Loader entry points (single source of truth)

| Loader | File | Public symbols (used by tools) |
|---|---|---|
| **Skill** | `src/loaders/skill-loader.ts` | `readSkill`, `readSkillRaw`, `listWorkflowSkillIds`, `resolveOperations`, `formatOperationsBundle`, `ResolvedOperation` |
| **Resource** | `src/loaders/resource-loader.ts` | `readResource`, `readResourceRaw`, `readResourceStructured`, `listResources`, `getResourceEntry`, `listWorkflowsWithResources` |
| **Workflow** | `src/loaders/workflow-loader.ts` | `loadWorkflow`, `listWorkflows`, `getActivity`, `readWorkflowRaw`, `readActivityRaw`, `getCheckpoint`, `getValidTransitions`, `getTransitionList`, `validateTransition` |
| **Activity** | `src/loaders/activity-loader.ts` | `readActivity`, `listActivities`, `readActivityIndex` |
| **Filename parser** | `src/loaders/filename-utils.ts` | `parseActivityFilename` (NN-id.toon — also used by skill loader) |
| **Core ops** | `src/loaders/core-ops.ts` | `CORE_ORCHESTRATOR_OPS`, `CORE_WORKER_OPS` |

Every loader follows the same micro-pipeline: `readFile → decodeToonRaw → safeValidate{Skill,Activity,Workflow,Resource} → Result<T, DomainError>` (or `unknown` for "raw" variants that bypass schema). The raw variants exist specifically to feed the on-wire response without re-encoding through TOON a second time.

### 1.3 Tool delivery layer

| Tool | Handler file:line | What it returns |
|---|---|---|
| `get_skill` | `src/tools/resource-tools.ts:434-518` | `session_index: ...\n\n` + raw skill TOON (via `readSkillRaw`) |
| `get_skills` (deprecated) | `src/tools/resource-tools.ts:384-432` | header + raw TOON blocks joined by `---` |
| `get_resource` | `src/tools/resource-tools.ts:520-562` | `resource_id: ... \n id: ... \n version: ... \n session_index: ...\n\n` + body (from `readResourceStructured`) |
| `get_workflow` | `src/tools/workflow-tools.ts:78-151` | preamble = `primary-skill TOON` + `\n\n` + `encodeToon(formatOperationsBundle(...))` + `\n\n---\n\n`, followed by either a TOON-encoded summary or the raw workflow.toon |
| `get_activity` | `src/tools/workflow-tools.ts:295-333` | `encodeToon(formatOperationsBundle(...)) + '\n\n---\n\n' + session_index: ...\n\n' + raw activity TOON |
| `resolve_operations` | `src/tools/resource-tools.ts:566-578` | `encodeToon(formatOperationsBundle(resolveOperations(...)))` — no session required |

---

## 2. Skill Loading — Today

### 2.1 Resolution algorithm

`readSkill(skillId, workflowDir, workflowId?)` — `src/loaders/skill-loader.ts:127-168`:

1. **Explicit prefix (`{workflow}/{skillId}`):** split on first `/`; load only from `{workflowDir}/{targetWorkflow}/skills/`. Single attempt; no fallback (skill-loader.ts:132-144).
2. **Workflow-specific (workflowId supplied):** look in `{workflowDir}/{workflowId}/skills/` (skill-loader.ts:146-153).
3. **Cross-workflow search (no workflowId):** iterate every workflow that has a `skills/` subdir (lexicographic order), return first match (skill-loader.ts:155-165). The 2026-04-26 baseline artifact's Open Question #4 records this; it is unchanged.

Failure → `Result<Skill, SkillNotFoundError>`.

### 2.2 What is NOT in the resolver today

- **No workflow-local → `meta` precedence layer.** The current resolver only does workflow-local then (optionally) brute-force scan-all. The migration introduces an explicit two-step lookup (workflow-local → `workflows/meta/`) replacing the brute-force fallback.
- **No format negotiation.** Skill files are TOON only — pattern `NN-{id}.toon` matched by `parseActivityFilename` (skill-loader.ts:18-21 via `findSkillFile`). The migration adds `.md` (with `SKILL.md` + op-as-child-file folder shape) as a second source format.
- **No op-child-file awareness.** Operations live inside a single TOON skill's `operations:` map (`safeValidateSkill` validates this; `OperationDefinitionSchema` at skill.schema.ts:143-154). The migration must teach the loader to assemble a virtual `Skill` from a `SKILL.md` index plus per-op `*.md` child files.

### 2.3 Operations resolution & bundle shape

`resolveOperations(refs, workflowDir)` — `src/loaders/skill-loader.ts:265-355`:

- Parses each `[workflow/]skill::name` ref via `parseOperationRef` (skill-loader.ts:233-250).
- Calls `readSkill(...)` for each parsed ref.
- For each ref, looks up the named element under `skill.operations`, then `skill.rules`, then `skill.errors`. The matching keyspace is what changes most under the migration — operations are addressed by **name**, not by file path.
- **Auto-inclusion of global rules:** when any element from a skill is resolved, all of that skill's `rules` are appended (skipping rules already explicitly requested). This is how `agent-conduct::file-sensitivity` (or any single op) drags in the rest of the skill's invariants.
- Not-found refs are surfaced as `{type: 'not-found', body: null}` so callers can detect rather than silently lose refs.

`formatOperationsBundle(resolved)` — `src/loaders/skill-loader.ts:365-392`:

- Groups by type: `operations` (keyed `<skill-id>::<name>` → body), `rules` (flat `[name, line]` tuples — one per line), `errors`, `unresolved` (string array).
- Empty groups omitted.
- Folds away `workflow`, `type`, `ref` to keep the wire payload compact.

This bundle is what the TOON-projection delivery pass must reproduce identically from markdown source after the flip.

### 2.4 Core ops bundled into every response

| Bundle | File:line | Purpose |
|---|---|---|
| `CORE_ORCHESTRATOR_OPS` | `src/loaders/core-ops.ts:19-40` | 13 refs — workflow-engine traversal + checkpoint flow + harness-compat spawn/continue + 3 agent-conduct rules sets |
| `CORE_WORKER_OPS` | `src/loaders/core-ops.ts:46-56` | 7 refs — yield/resume/finalize + 4 agent-conduct rules sets |

`get_workflow` prepends `CORE_ORCHESTRATOR_OPS` (deduped against `workflow.operations[]`); `get_activity` prepends `CORE_WORKER_OPS` (deduped against `activity.operations[]`). The bundling code itself never needs to change — only the underlying skill/operation lookup that `resolveOperations` performs.

---

## 3. Resource Loading — Today

### 3.1 Numeric-index resolver with id-frontmatter fallback

`readResourceStructured(workflowDir, workflowId, resourceIndex)` — `src/loaders/resource-loader.ts:312-324`:

1. Calls `readResourceRaw` (resource-loader.ts:174-223).
2. `readResourceRaw` resolves `resourceIndex` to a concrete numeric index via `resolveResourceRefToIndex` (resource-loader.ts:36-67):
   - If `/^\d+$/.test(ref)` → pass through (resource-loader.ts:26-28, 129-131).
   - Otherwise scan the resource dir, match either (a) `parsed.name === ref` (filename's post-prefix part) or (b) YAML frontmatter `id:` field.
3. Normalises to 3-digit width (`normalizeResourceIndex` — pad to 3 — resource-loader.ts:21-23).
4. Lists files via `parseResourceFilename` (resource-loader.ts:76-90, matches `(\d+)-(.+)\.(toon|md)`).
5. **TOON wins.** Two-pass loop: if a `.toon` file matches the index it's returned; otherwise the first matching `.md` is the fallback (resource-loader.ts:140-153, 196-217).
6. `parseFrontmatter` (resource-loader.ts:291-306) extracts `id`, `version`, and body via the `^---\n...\n---\n` block regex; returns `StructuredResource = {index, id, version, content}`.

### 3.2 Workflow + resource directory layout

Resource dir resolution by `getResourceDir` (resource-loader.ts:95-104):
- Primary: `{workflowDir}/{workflowId}/resources/`
- Legacy fallback: `{workflowDir}/{workflowId}/guides/` — still in the code, still tested. (Open question: keep or sunset under the migration? See §7.)

### 3.3 Cross-workflow resource refs

`parseResourceRef` lives in the tool handler, not the loader: `src/tools/resource-tools.ts:55-61`. Format `meta/01` splits on the first `/`. The loader is then called with `targetWorkflow = parsed.workflowId ?? state.workflowId`. There is NO precedence fallback — if `meta/01` doesn't exist, the call fails; there's no automatic workflow-local lookup if the prefix is supplied.

### 3.4 Frontmatter parsing — already markdown-native

`parseFrontmatter` (resource-loader.ts:291-306) is a self-contained YAML-frontmatter parser (regex-based, no `yaml` lib). It only extracts `id` and `version`. The markdown-skills migration can either reuse this verbatim for technique frontmatter or extend it to read `name`, `description`, `metadata.*` (the canonical SKILL.md frontmatter shape in `legacy/work-package/techniques/cargo-operations/SKILL.md:1-10` carries `name`, `description`, `metadata.{ontology,kind,version,order,legacy_id}`).

---

## 4. Workflow + Activity Bundles — TOON Projection Path

### 4.1 `get_workflow` preamble assembly

`src/tools/workflow-tools.ts:78-151`:

```
preamble = [ primarySkillContent, opsBlock ].filter(non-empty).join('\n\n') + '\n\n---\n\n'
opsBlock = encodeToon(formatOperationsBundle(resolveOperations(
            [...workflow.operations, ...CORE_ORCHESTRATOR_OPS], workflowDir
          )))
primarySkillContent = await readSkillRaw(workflow.skills.primary, ...)  // raw TOON, no re-encode
body = summary ? encodeToon(summaryData) : `session_index: ...\n\n${rawWorkflow}`
return preamble + body
```

Tests/clients split on the first `\n\n---\n\n` to recover the workflow section (workflow-tools.ts:118-123 comment).

### 4.2 `get_activity` preamble assembly

`src/tools/workflow-tools.ts:295-333`:

```
opsSection = encodeToon(formatOperationsBundle(resolveOperations(
              [...activity.operations, ...CORE_WORKER_OPS], workflowDir
             ))) + '\n\n---\n\n'
body = `session_index: ...\n\n${rawActivityTOON}`
return opsSection + body
```

`rawActivityTOON` comes from `readActivityRaw` (workflow-loader.ts:341-372) — same `safeValidateActivity` then return original string pattern as `readSkillRaw`.

### 4.3 Two encoders, two purposes

- **`encodeToon`** (`src/utils/toon.ts:26-28`, wraps `@toon-format/toon` `encode`) — used to project a JavaScript object (the resolved-ops bundle, the workflow summary, list responses) into TOON wire format.
- **Raw passthrough** — `readSkillRaw`, `readActivityRaw`, `readWorkflowRaw` already validate against the Zod schema but return the **original** TOON string. This pattern exists precisely so the workflow content isn't double-encoded; the migration's markdown→TOON projection will replace these for technique delivery while keeping the same "no double-encode" property.

### 4.4 TOON decode entry points (what the migration must continue to support)

- `decodeToon(content, schema)` — schema-validated decode (resource-loader.ts:150, workflow-tools.ts not directly here).
- `decodeToonRaw(content)` — untyped decode; output then passed through `safeValidate*`. This is the dominant pattern across all four loaders (workflow-loader.ts:141, activity-loader.ts:114, skill-loader.ts:66+86, etc.).
- Both wrap `@toon-format/toon`'s `decode` / `encode`. The library itself is untouched by the migration — only the loader call sites that currently invoke `decodeToonRaw` for skill files will gain a markdown branch.

---

## 5. Current Storage Layout vs Migration Target

### 5.1 Current (TOON, on disk)

```
workflows/
├── meta/
│   ├── workflow.toon
│   ├── activities/        NN-{id}.toon
│   ├── skills/            NN-{id}.toon         ← workflow-engine, agent-conduct, harness-compat, ...
│   └── resources/         NN-{id}.{toon,md}    ← already mixed format
├── work-package/
│   ├── workflow.toon
│   ├── activities/        NN-{id}.toon
│   ├── skills/            NN-{id}.toon         ← 28 skills, all TOON
│   └── resources/         NN-{id}.{toon,md}
└── ...  (8 other workflows)
```

### 5.2 Migration target (markdown, planning-folder source-of-truth)

Sourced from `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/legacy/{meta,work-package}/{techniques,resources}/`:

```
workflows/
├── meta/
│   ├── workflow.toon                    ← unchanged
│   ├── activities/                      ← unchanged
│   ├── techniques/                      ← NEW (replaces skills/)
│   │   ├── agent-conduct/SKILL.md       ← rules-only technique
│   │   ├── workflow-engine/SKILL.md
│   │   ├── harness-compat/SKILL.md
│   │   ├── gitnexus-operations/         ← op-as-child-file
│   │   │   ├── SKILL.md  (index)
│   │   │   ├── query.md
│   │   │   ├── context.md
│   │   │   └── ...
│   │   └── ...
│   └── resources/                       ← NEW shape (mostly verbatim from planning/.../legacy/meta/resources/)
├── work-package/
│   ├── workflow.toon                    ← unchanged
│   ├── activities/                      ← unchanged
│   ├── techniques/                      ← NEW (replaces skills/)
│   │   ├── cargo-operations/
│   │   │   ├── SKILL.md
│   │   │   ├── check.md, test.md, build-dev.md, ...
│   │   ├── build-comprehension/SKILL.md
│   │   └── ...
│   └── resources/                       ← NEW shape
└── ...
```

The 27 work-package techniques and 8 meta techniques in `legacy/` show the two shapes already authored:
- **Single-file technique:** just `SKILL.md` with frontmatter + body (e.g. `build-comprehension/SKILL.md`).
- **Op-as-child-files technique:** `SKILL.md` index + sibling `<op>.md` files, no frontmatter on children (e.g. `cargo-operations/{SKILL.md,check.md,build-dev.md,...}`).

### 5.3 What the loader must continue to honour

- **NN- prefix parsing on `activities/`.** `parseActivityFilename` (filename-utils.ts:6-10) is used by activity-loader, workflow-loader's activity discovery (workflow-loader.ts:37, 122, 354), AND the skill-loader's `findSkillFile` (skill-loader.ts:10 aliases `parseActivityFilename as parseSkillFilename`). Activities stay TOON, so this parser stays in use — but the alias inside skill-loader.ts:10 should be deprecated.
- **`workflow.skills.primary` LEGACY path.** `get_workflow` (workflow-tools.ts:102-109) still calls `readSkillRaw` for the workflow-level primary skill and prepends it. Migration target is the operation-focused model where `workflow.operations[]` (workflow.schema.ts:59) supersedes this. The legacy path can remain a no-op fallback after the flip — `primarySkillContent = ''` when the workflow doesn't declare a primary skill — but the markdown loader must still resolve any leftover `workflow.skills.primary` references to the technique-folder location.
- **Operations namespace and auto-rule inclusion.** The `[workflow/]skill::name` ref grammar (skill-loader.ts:233-250) and the auto-rule-append behaviour (skill-loader.ts:339-352) are public contract. The bundle shape produced by `formatOperationsBundle` (skill-loader.ts:365-392) is what every operation-bundling client expects — the markdown loader must produce equivalent `Skill`-shaped objects so this projection layer reuses unchanged.

---

## 6. Domain Concept Mapping (delta vs baseline)

Mostly inherited from `.engineering/artifacts/comprehension/workflow-server.md`. Delta:

| Term | Current technical construct | Migration target |
|---|---|---|
| **Skill** | `Skill` Zod type, NN-id.toon under `{workflow}/skills/` | Same `Skill` Zod type, sourced from `SKILL.md` (single or folder-indexed) under `{workflow}/techniques/<name>/` |
| **Operation** | Entry in `Skill.operations` map | `<op>.md` child file OR entry in `SKILL.md`'s body — both materialise into `Skill.operations` after markdown parsing |
| **Rule** | Entry in `Skill.rules` map | Section in `SKILL.md` (`## Rules`) or `## Capability` + `## Rules` (agent-conduct's rules-only shape) — materialised the same way |
| **Resource** | NN-name.{toon,md} under `{workflow}/resources/`, frontmatter (`id`, `version`) | Same shape; simplified-markdown delivery (per Design Philosophy §"Markdown as Source of Truth, Projection on Delivery") |
| **Technique** | Synonym for Skill | Authoring term used in `workflows/<wf>/techniques/`. Internally still the `Skill` schema. |
| **Precedence** | Workflow-local → cross-workflow scan-all (skill-loader.ts:155-165) | Workflow-local → `workflows/meta/` (explicit two-step; scan-all retired) |

---

## 7. Initial Deep-Dive

### 7.1 Question 1 — Where exactly does the loader flip have to happen?

**Resolution:** `tryLoadSkill` (skill-loader.ts:59-76) and `tryReadSkillRaw` (skill-loader.ts:79-96) are the two leaf functions where on-disk TOON is touched. Both are private to skill-loader.ts. The migration's markdown reader replaces these two and only these two — every other path in skill-loader.ts (`readSkill`, `readSkillRaw`, `resolveOperations`, `formatOperationsBundle`) consumes their output via the `Skill` typed object or a raw passthrough string. Section §1.2 confirms tool-side callers all go through the public functions, so the tools layer is untouched if the new reader returns:

1. A `Skill` object that validates against the existing `SkillSchema` (skill.schema.ts:156-184), AND
2. A raw string equivalent to the projected TOON for `readSkillRaw` (the wire-form that `get_skill` returns).

Concretely the markdown loader needs two outputs per technique:
- `Skill` object — built by parsing `SKILL.md` frontmatter (`name → id`, `metadata.version → version`, `## Capability → capability`, `## Rules → rules`, op-child files → `operations[<op>]`).
- TOON projection string — `encodeToon(skill)` of that object, used by `readSkillRaw` consumers (`get_skill` returns it verbatim; `get_skills` joins multiple with `---` fences).

**Citations:** skill-loader.ts:59-76, 79-96, 127-168, 174-212; tools/resource-tools.ts:434-518, 384-432.

### 7.2 Question 2 — Where does the precedence layer go?

**Resolution:** Inside `readSkill` and `readSkillRaw`. Current code (skill-loader.ts:147-165) has a workflow-specific attempt then a cross-workflow scan. The migration replaces the scan with a single explicit `tryLoadSkill(getWorkflowSkillDir(workflowDir, 'meta'), skillId)` call (and equivalent for raw). Same two functions; one branch removed, one branch added. No new public symbols required.

This matches Design Philosophy §"Workflow-Local with Meta-Workflow as Shared Layer" — `meta` doubles as both the local content for the meta workflow itself AND the cross-workflow shared layer. Explicit-prefix lookup (`{wf}/{skill}` — skill-loader.ts:132-144) stays unchanged because callers already opt into a specific workflow.

**Citations:** skill-loader.ts:147-165, 192-209; Design Philosophy §"Principle: Workflow-Local with Meta-Workflow as Shared Layer".

### 7.3 Question 3 — Does `get_workflow`/`get_activity` need bundle-shape changes?

**Resolution:** No bundle-shape changes required. The migration adds two new on-disk formats (`SKILL.md`, `<op>.md`) that the loader must read, but `resolveOperations` / `formatOperationsBundle` operate on the in-memory `Skill` object and produce a TOON-encoded bundle that's already on the wire today. As long as the markdown loader yields `Skill` objects that the existing `SkillSchema` accepts (operations map, rules map, errors map, capability string), the bundle code is reused verbatim.

The one exception is the `readSkillRaw` consumers (`get_workflow` preamble, `get_skills`). They currently return verbatim on-disk TOON. After the flip there is no on-disk TOON for techniques — the "raw" string becomes the projection `encodeToon(skill)`. Output identical from the consumer's perspective.

**Citations:** workflow-tools.ts:102-150 (get_workflow preamble), workflow-tools.ts:295-333 (get_activity bundle), skill-loader.ts:365-392 (formatOperationsBundle).

### 7.4 Question 4 — Resource side: what changes?

**Resolution:** Less than the skill side. The resource loader already reads both `.toon` and `.md` (resource-loader.ts:76-90, 140-160). The legacy TOON-wins-over-markdown precedence (resource-loader.ts:140-153) is the only mechanism that needs to flip: after the migration, all resources are markdown, so the two-pass loop simplifies to a single `.md` match. Frontmatter parsing (resource-loader.ts:291-306) already produces `{id, version, content}` — the exact shape `get_resource` returns (resource-tools.ts:547-555).

**No changes needed in `get_resource` itself.** The cross-workflow resource ref grammar (`meta/01` etc., resource-tools.ts:55-61) stays as is. Numeric-index resolution (resource-loader.ts:36-67) stays; id-frontmatter fallback stays. The `guides/` legacy fallback (resource-loader.ts:99-103) is orthogonal — the migration doesn't require sunsetting it but could.

**Citations:** resource-loader.ts:76-104, 117-166, 174-223, 291-324; resource-tools.ts:520-562.

### 7.5 Question 5 — Op-as-child-file: how does the loader assemble a virtual Skill?

**Resolution from authored content:** Walking the sample `cargo-operations/` shape:
- `SKILL.md` carries frontmatter (`name: cargo-operations`, `metadata.version: 1.2.0`) + body sections `## Capability`, `## Operations` (a table linking child files), and optionally `## Rules`.
- `check.md`, `test.md`, etc. — no frontmatter — body sections `# <op>` (the H1 is the description line; the markdown-skills design treats the first paragraph after H1 as the op description), `## Inputs`, `## Output`, `## Procedure`, `## Errors`.

The loader needs to:
1. Read `SKILL.md` → frontmatter → top-level `Skill` fields (`id`, `version`, `capability`, `description`, top-level `rules` from `## Rules` section).
2. Enumerate sibling `*.md` files (excluding `SKILL.md` and `README.md`); for each, parse the canonical sections (`## Inputs`, `## Output`, `## Procedure`, `## Errors`, `## Rules`) into an `OperationDefinition` (skill.schema.ts:143-154).
3. Assemble into `Skill.operations[<filename-without-ext>] = OperationDefinition`.

For single-file techniques (`build-comprehension/SKILL.md`) the `## Operations` and `## Protocol` sections collapse into either the `Skill.protocol` or `Skill.operations` maps depending on shape — the canonical mapping is defined in `workflow-canonical-ontology.md` from the 2026-05-22 planning folder and the SKILL.md schema itself.

**Citations (sample content):** `legacy/work-package/techniques/cargo-operations/{SKILL.md,check.md}` (Section 5.2 listing); `legacy/work-package/techniques/build-comprehension/SKILL.md`; `SkillSchema`, `OperationDefinitionSchema` (skill.schema.ts:143-184).

### 7.6 Portfolio lens — Pedagogy (`prism://06`)

**Inherited-pattern: `parseActivityFilename` reused as `parseSkillFilename`.** skill-loader.ts:10 imports `parseActivityFilename` from `./filename-utils` and aliases it. This is a silent coupling — anything that ever wanted to allow skill files to drop the NN- prefix would either need to change the activity parser (breaking activities) or fork the parser. The migration is a clean point to fork: techniques use folder names (no NN- prefix needed) so the alias should be deleted entirely and a new `parseTechniqueFolder` (or no parser at all — just directory enumeration) introduced. The activity parser stays unchanged for `activities/`.

**Inherited-pattern: Two-tier raw/decoded API surface.** Every loader has `readX` (returns parsed type) and `readXRaw` (returns the original on-disk string). This pattern was invented to dodge double-encoding on TOON files. After the markdown flip, the "raw" output is necessarily a TOON projection (markdown source ≠ wire form), so the two functions stop sharing meaningful structure. The migration's TOON-projection delivery pass should be its own named function (e.g. `projectSkillToToon(skill: Skill): string`) called by both `readSkill` and `readSkillRaw`, rather than having each function re-derive the projection. This makes the projection contract testable in isolation.

**Inherited-pattern: Best-effort aggregation in `findWorkflowsWithSkills`.** skill-loader.ts:35-56 lists all workflows that have a `skills/` subdir to power the cross-workflow scan-all fallback. Under the migration this function disappears (precedence is explicit). Worth removing it rather than letting it linger as dead code — its caller (skill-loader.ts:156-165) is also removed.

### 7.7 Portfolio lens — Rejected paths (`prism://09`)

**Path not taken: separate `shared/` root.** The 2026-05-22 plan considered a `workflows/shared/` directory (or a `skills` orphan branch). The decision (recorded in Design Philosophy §"No orphan branch") was to overload `meta` — the meta workflow's `techniques/` doubles as the cross-workflow shared layer. Trade-off swap: avoids a new top-level concept and avoids an orphan-branch worktree, at the cost of meta's content carrying double duty. The loader-side consequence is that meta's precedence position is hard-coded (workflow-local → `meta`); there's no third tier. If a future workflow needs to override a meta technique, it copies the technique into its own `techniques/` folder.

**Path not taken: single-file SKILL.md for everything.** Op-as-child-files exists because callers invoke one op at a time and want to load only that op (Design Philosophy §"Operations-as-Child-Files for Flat Op Libraries"). The trade-off swap: child files multiply the file count (cargo-operations splits into 11 files vs 1), but `resolveOperations` only loads the parent `SKILL.md` and the requested op's child file rather than the entire library. The loader's per-ref pathing therefore needs to know about child-file resolution; it can't just slurp the whole `SKILL.md` and assume all ops are inside it.

**Path not taken: per-tool Markdown-only delivery.** A simpler design would have been to deliver markdown directly through `get_skill` and skip the TOON projection. The trade-off swap rejected: every existing consumer of `get_skill` parses TOON, so a markdown delivery would force a one-shot client-side migration. TOON projection keeps the wire contract stable and confines the migration to the server.

---

## 8. Open Questions

| # | Question | Status | Resolution / Section |
|---|---|---|---|
| 1 | Where in `skill-loader.ts` does the markdown reader hook in? | Resolved | `tryLoadSkill` (lines 59-76) and `tryReadSkillRaw` (lines 79-96) — see §7.1 |
| 2 | Where does the workflow-local → `meta` precedence resolver go? | Resolved | Inside `readSkill` / `readSkillRaw`, replacing the cross-workflow scan-all (skill-loader.ts:155-165, 200-209) — see §7.2 |
| 3 | Do `get_workflow` / `get_activity` bundle assembly paths need changes? | Resolved | No — `resolveOperations` + `formatOperationsBundle` are format-agnostic; only the loader output changes. See §7.3 |
| 4 | Resource loader changes? | Resolved | Minimal — already supports `.md`; flip TOON-wins to markdown-only (resource-loader.ts:140-160). `get_resource` unchanged. See §7.4 |
| 5 | How does the loader assemble a virtual `Skill` from `SKILL.md` + child files? | Resolved | Per §7.5 — frontmatter + sections feed `SkillSchema`; per-op child files feed `Skill.operations[<basename>]` |
| 6 | Does the `Skill` Zod schema need new fields? | Resolved | No — the canonical SKILL.md shape (frontmatter `name/description/metadata.{version,kind,...}` + body sections) maps onto existing `SkillSchema` fields (`id`, `version`, `description`, `capability`, `rules`, `operations`, `protocol`). The `metadata` block in markdown frontmatter is parsed but doesn't need a Zod field — `kind`, `order`, `legacy_id` are authoring hints, not wire-relevant. |
| 7 | What happens to `parseActivityFilename`'s skill-loader alias? | Resolved | Delete in §7.6 — technique folders don't need NN- prefix. Activity parser unchanged. |
| 8 | Does `workflow.skills.primary` still need to resolve? | Resolved | Yes during the transition — get_workflow (workflow-tools.ts:102-109) calls `readSkillRaw` for the legacy primary-skill. Markdown loader must resolve the technique-folder location. After all workflows migrate to `workflow.operations[]`, the path becomes a dead branch and can be removed in a follow-on. |
| 9 | Sunset the resource-loader `guides/` fallback? | Open | resource-loader.ts:99-103 falls back to legacy `guides/`. Out of scope for this migration but worth a follow-up. |
| 10 | What is the canonical mapping from `SKILL.md` body sections to `Skill` Zod fields? | Open (partial) | §7.5 outlines the common cases. The full mapping for less common shapes (rules-only `agent-conduct`, ops-with-prose, the `protocol` vs `operations` decision) is defined by the canonical-ontology doc in `2026-05-22-claude-skills-migration/workflow-canonical-ontology.md`. `plan-prepare` should formalise the parser spec in `05-work-package-plan.md`. |
| 11 | Test fixtures: how do we cover precedence + projection identity? | Open | Existing `tests/skill-loader.test.ts` is the natural target. Needs new fixtures for: (a) workflow-local override of a meta technique, (b) op-as-child-file folder, (c) markdown-only resource folder, (d) projection-identity tests comparing TOON output against captured baselines. `plan-prepare` to enumerate. |
| 12 | Does `findWorkflowsWithSkills` get deleted under the migration? | Open | Yes per §7.6 — caller is removed. But it's used in tests too. Confirm in plan-prepare. |

Questions 1-8 closed during the initial deep-dive. Questions 9-12 are deferred to `plan-prepare`. None are blocking for moving to the next activity per the skip-optional path; the `skip_optional_activities=true` variable sends comprehension → `plan-prepare`.

---

## 9. Assumption reconciliation (carry forward to assumptions-review)

| ID | Assumption | Status after comprehension |
|---|---|---|
| A-001 | Pre-migrated content at `legacy/{work-package,meta}/` is structurally complete and canonical-conforming | **Largely confirmed by inspection.** Sampled `cargo-operations/{SKILL.md, check.md}` and `build-comprehension/SKILL.md` — both match the canonical shape (frontmatter + `## Capability` + body sections; op child files have no frontmatter). Full content audit deferred to `plan-prepare`. |
| A-002 | Existing TOON loader + `get_skill` deliver TOON-projected content; replacing requires only swapping the parsing layer, not the MCP surface | **Confirmed.** Concrete swap point identified: `tryLoadSkill`/`tryReadSkillRaw` (skill-loader.ts:59-96). Public functions (`readSkill`, `readSkillRaw`, `resolveOperations`, `formatOperationsBundle`) and tool handlers unchanged. See §7.1, §7.3. |
| A-003 | `workflows/meta/{techniques,resources}/` content can serve dual purpose without resolution ambiguity because precedence is workflow-local → meta | **Confirmed.** Precedence is implemented inside the loader's two-tier lookup; the meta lookup is the explicit second tier (replacing the cross-workflow scan-all). Explicit prefix (`meta/foo`) still resolves to meta directly. No ambiguity. See §7.2. |
| A-004 | Workflow folders retain `workflow.toon` + `activities/` unchanged | **Confirmed by code review.** `workflow-loader.ts`, `activity-loader.ts`, and `parseActivityFilename` (filename-utils.ts) are not touched by the migration; both directories continue to be read as today. |
| A-005 | Two-PR coordination avoids a window where the server expects markdown but finds none | **Judgement call — unchanged.** No code-analyzable angle to resolve. |

A-001 through A-004 move from Open to Confirmed pending plan-prepare's content audit. A-005 remains a judgement call.

---

*This artifact augments the persistent [workflow-server.md](../../comprehension/workflow-server.md) comprehension. The baseline (2026-04-26) covers the orchestration, session, schema, and tool-handler architecture cross-cutting the whole codebase; this artifact narrows to the skill/resource/workflow/activity loaders and the TOON-projection delivery surface that the markdown-skills migration replaces.*
