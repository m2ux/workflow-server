# AI Assistance Provenance — Markdown Skills Migration Implementation

**Work Package:** markdown-skills-impl
**Issue:** [#125](https://github.com/m2ux/workflow-server/issues/125)
**Activity:** `implement` (session `SUQLKL`)

This log records the AI assistance used for each implementation task. One row per
task: task ID, model ID, prompt class, context scope, and a short description of
what was generated.

| Task | Model | Prompt class | Context scope | Description |
|---|---|---|---|---|
| A1 | claude-opus-4-7[1m] | code-generation | scripts/migrate-skills/, planning artifact §A1 | Author `scripts/migrate-skills/migrate.ts` plus README; idempotent copier for legacy/{work-package,meta}/{techniques,resources}/ trees into the workflows worktree. |
| A2 | claude-opus-4-7[1m] | refactoring | workflows worktree, planning §A2 | Run `migrate.ts` against the legacy planning content and commit the resulting techniques/ + resources/ trees in two commits (one per workflow). |
| A3 | claude-opus-4-7[1m] | docs | workflows/README.md, workflows/meta/README.md, planning §A3 | Add the new techniques/ + resources/ layout, the workflow-local → meta precedence note, and links to the workflow-canonical ontology resource. |
| B1 | claude-opus-4-7[1m] | code-generation | src/loaders/, schema/skill.schema.ts, planning §B1, comprehension §7.5 | New `src/loaders/markdown-skill-loader.ts` — frontmatter parser, canonical-section parser, op-as-child-files materialisation, MarkdownSkillParseError on missing `## Procedure`. |
| B2 | claude-opus-4-7[1m] | refactoring | src/loaders/skill-loader.ts, planning §B2 | Refactor `tryLoadSkill` / `tryReadSkillRaw` paths to dispatch to the markdown loader first; legacy TOON retained behind `SKILL_LOADER_LEGACY_TOON`. Remove the `parseActivityFilename as parseSkillFilename` alias. |
| B3 | claude-opus-4-7[1m] | code-generation | src/loaders/skill-loader.ts, planning §B3 | Add `projectSkillToToon(skill)` — canonical-ordered TOON projection consumed by `readSkillRaw` and (via skill-loader) the `get_skill` / `get_workflow` preamble surfaces. |
| B4 | claude-opus-4-7[1m] | refactoring | src/loaders/skill-loader.ts, planning §B4 | Replace cross-workflow scan-all with workflow-local → meta precedence. Delete `findWorkflowsWithSkills` and unused legacy helpers. |
| B5 | claude-opus-4-7[1m] | refactoring | src/loaders/resource-loader.ts, planning §B5 | Flip the resource loader to markdown-only and add `<slug>/SKILL.md` folder-shape resolution alongside the legacy flat `NN-name.md` shape. |
| B6 | claude-opus-4-7[1m] | refactoring | package.json, planning §B6 | Add `npm run migrate-skills` script entry that runs `tsx scripts/migrate-skills/migrate.ts`. |
| B7 | claude-opus-4-7[1m] | test-writing | tests/skill-loader.test.ts, tests/fixtures/markdown-skills/, planning §B7, test plan PR126-TC suite | Add fixture tree covering rules-only / op-as-child-files / workflow-local override / malformed-Procedure / projection round-trip / parseSkillFilename alias regression. Replace TOON-specific malformed-handling tests with markdown equivalents. |

## DCO Attestation

| Timestamp | Identity | Model | Attestation |
|---|---|---|---|
| 2026-05-31 | Mike Clay <mike.clay@shielded.io> | claude-opus-4-7[1m] | Certified all six DCO clauses for work package `markdown-skills-impl` (issue #125). Diff reviewed, contribution rights confirmed, provenance traceable, tests/linters covered, accepting responsibility. |
