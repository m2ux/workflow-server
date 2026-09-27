# Inventory: where grammar and constraints live today

Evidence for [README.md](README.md). Measured on `schema-description-hygiene` (`8ac5381e`) and the corpus
worktree on 2026-09-27. Line references are to that revision.

## Grammars

Twenty-three grammars govern authored definitions and session state. Three have a single definition:
artifact filenames, activity filenames and routine ids.

| Grammar | Definition | Other parsers or restatements |
| --- | --- | --- |
| `when` expression | Comment and hand-written tokenizer in `src/schema/when-expression.ts` | `expressionReads` regex split in `guards/check-binding-fidelity.ts:509`; rename walker in `src/loaders/routine-resolver.ts:195-204` |
| Structured `condition` | `src/schema/condition.schema.ts` | A second gate language. `when` coerces with `Number()`, `condition` with `toNumber`, and they disagree on `null` and booleans |
| Technique reference | Prose `GRAMMAR` string, `src/loaders/technique-ref.ts:46` | `guards/check-launched-workflows.ts:101`; `guards/check-binding-fidelity.ts:401` replaces only the first `::` |
| Routine reference | `src/loaders/routine-resolver.ts:78-104` | `guards/check-routines.ts:424` |
| Qualified data id | `src/schema/identifiers.ts` | `guards/check-identifier-qualification.ts` tests only single-word. Technique I/O ids are described as hyphenated, checked as snake/camel case, and written in snake case |
| `{token}` interpolation | About 12 regexes across `message-template.ts`, `activity-variables.ts`, `binding-provenance.ts`, `routine-resolver.ts`, `walker.ts` and four guards | `binding-provenance.ts:349` rejects the dotted form `{plan.steps}` that the renderer accepts |
| Dotted bag path | None | Five resolvers and five head-extractors |
| Instance id `<base>#<n>` | `src/loaders/workflow-loader.ts:423-437` | The checkpoint `#{…}` form is written only in corpus prose |
| Checkpoint response key | Prose in the session schema | Built inline twice; parsed by prefix at `src/utils/validation.ts:105`, where `review-` also matches `review-code-…` |
| Technique markdown outline | `src/loaders/markdown-technique-loader.ts` (not fence-aware) | Re-parsed by about 15 guards with differing heading regexes |
| Resource anchor slug | `src/utils/resource-ref.ts:55` collapses `\s+` | `guards/check-resource-anchors.ts:50` replaces single spaces and adds `-n` suffixes |
| Delivery key | Prose list, `src/utils/delivery.ts:24-33` | Built inline at about 9 sites; `bundle:contract:` is missing from the list |
| Semver | `src/schema/common.ts` | Re-declared in `session.schema.ts` |
| Session index | `SESSION_INDEX_REGEX`, `src/utils/derivation.ts` | Five more literal copies |
| Rule name, rule citation, `AP-NN` | None | Three guards with differing regexes; AP numbers written only in prose |

## Constraint mechanisms

| Mechanism | Rule identity | Severity |
| --- | --- | --- |
| Zod structure, 19 `.strict()` objects, 3 refinements | Error message only | Depends on file type: a workflow blocks, an activity is skipped, a technique reads as "not found", a composed technique falls back |
| Loader graph checks | `// L1`–`// L16` comments; the messages carry no id | Blocks the load |
| Routine resolver, about 20 throws | Message only | Excludes the activity; the workflow loads |
| Markdown technique loader throws | Message only | Technique dropped |
| Runtime checks in tools | `// T2`, `// T9` comments or none | Some block, some warn in `_meta.validation` |
| 56 registered guards | `check: '<id>'` in 39 guards; a separate `rule:` field in 17 | Build failure; a few have baselines |
| `enforcement()` metadata, 69 fields | Field path | Recorded, never checked against behaviour |

Six identity schemes coexist: guard/check ids, `L` numbers, `T` numbers, `AP-NN`, issue numbers, and
bare messages.

Guard classification: 18 check schema fields or single-definition structure, 23 cross-file or graph
semantics, 10 corpus prose conventions, 5 repository hygiene.

## Fragmentation cases

1. **One rule, several severities.** The value-set rule blocks in Zod (default outside the set), warns
   at runtime (`variable-seed.ts:101`), and fails two guards under different ids. The fan ceiling is
   checked at load (L13) and again at runtime. An unbound transition blocks at load and warns at
   runtime.
2. **Metadata contradicts behaviour.** `exits` and `initialActivity` are marked `advisory`, yet the
   loader blocks on them. `defaultValue` is marked `enforced`, but `default-type-mismatch` is only a
   guard.
3. **Stated in a description, checked only by a guard, marked advisory.** `continueWhile` and
   `breakCondition` shape; the `&&`/`||` mixing rule, which `assertWhenAuthoring` checks at depth 0 only.
4. **Guards duplicating the schema or loader.** `check-description-hygiene` tests step fields the strict
   schema already rejects. `check-technique-template` `version-missing` repeats the loader.
5. **Guard stricter than the loader for the same fact.** Activity filename prefix, duplicate ids, and
   workflow identity: the loader skips or warns, the guard blocks.
6. **Stated with no enforcement.** Exit id kebab-case and distinctness (a description only). `$schema`
   required in `workflow.yaml` (corpus prose; five workflows omit it).

## Prose homes

About 11 homes state authoring rules: server `docs/`, schema descriptions, the canon anti-pattern
catalog (161 entries), design principles (47), the construct inventory, corpus `docs/`,
`workflow-canonical.md`, workflow-design and workflow-authoring techniques and resources, the
`workflow-canon` skill, and ADR-0005.

- **Citation drift.** Code cites 17 AP numbers. About 10 now point at a different entry after
  renumbering (AP-60 is cited for identifier qualification, which is now AP-66). The catalog itself
  says not to cite numbers.
- **Stale homes.** Five corpus files link the deleted `schemas/README.md`. Corpus `docs/README.md`
  routes with `transitions`, which does not exist. `format-conventions.md` prescribes `condition` and
  `to` on exits.
- **Contradictions.** Link form (file-relative vs namespace-anchored); singular `## Output` allowed vs
  rejected; flat protocol lists suitable vs rejected; ordinal anchors stable vs breaking.
- **Enforced but stated nowhere in the canon.** "A checkpoint is never the first step"; fan and
  `maxInstances` minimums.

## Prior formal work

- `grammar/activity.ebnf` and `constraints/activity.als` (2026-02-10, removed from `main` in
  `9c838290`): EBNF and Alloy for the superseded `decisions` / `flows` / `skill` model. Rule ids
  (`PROV-001`, `SYM-001`, …) with ERROR/WARN/INFO severity. Nothing bound them to the implementation,
  and they described an abandoned design for six months before anything noticed.
- `2026-08-24-shorthand-expression-grammar-for-workflow-yaml` (engineering branch): 47 findings on
  the definition language. Its structural recommendations are the starting point here. They are:
  the grammar file as the source, generating the parser and descriptions (ARC-07); for every rule, the
  artifact that fails when it is violated (FEA-05); a regeneration guard over `grammar/` and
  `constraints/` (FEA-03/04); separate and-chain and or-chain productions (CON-12); and
  `constraints/workflow.als` as the primary workflow-tier deliverable (EXP-01).
