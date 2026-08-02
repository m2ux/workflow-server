# Composition pipeline trace — what the server does with inline technique→technique references

> Investigation record · 2026-08-02 · Repo state: main checkout (pre-merge of PR #385)

## Pipeline map

### Parse (single entry point for all technique text) — `src/loaders/markdown-technique-loader.ts`

- `tryLoadMarkdownTechnique` :489 / `tryLoadNestedTechnique` :518 → `parseTechniqueIndex` :250
- :260 `splitSections(rewriteResourceLinks(body), 2)` — the **only** transformation applied to the raw markdown body before sectioning
- `parseProtocolSection` :346 → `protocolBlocksFromBody` :358 — `### ` sub-headings become `{title, steps}` blocks, ordinal prefix stripped (:382); a flat list becomes one untitled block. `bodyAsList` :187 turns bullets/numbered items into strings (continuation lines joined with a space).
- `parseInputsSection` :328 / `parseOutputsSection` :386 / `parseRulesSection` :412 — `###` entries → id-keyed items; `####` sub-sections → `components`, except reserved `default` / `artifact` / `audience` (:290–:326)

### Compose (ancestor contract) — `src/loaders/technique-loader.ts`

- `composeLoaded` :499 — the single shared implementation. Loads root `TECHNIQUE.md` + each containing group (:516–:519), merges `inputs`/`outputs` by id (`mergeById` :412) and `rules` by name (`mergeKeyed` :422), partitions merged I/O into own vs `inherited_*` (:541–:552), re-validates (:556).
- `wrapProtocolWithAncestors` :445 — prepends every ancestor's `Initial` blocks, appends `Final` blocks (`blocksTitled` :429, composition at :469–:471). **This is the only protocol-level structural composition that exists.**
- `composeTechnique` :575 → `composeActivityTechnique` :603 (activity-group shorthand `<activityId>::<op>` first, then as-authored)
- Bundle path: `resolveTechniques` :246 → `parseTechniquePath` :219 → `projectTechniqueBody` :198 → `formatTechniqueBundle` :624
- Wire projection: `projectTechnique` :33 / `projectTechniqueToYaml` :56

### Deliver

- `get_technique` — `src/tools/resource-tools.ts:602–780`; composes at :675, provenance-decorates at :701, projects at :708
- `get_activity` — `src/tools/workflow-tools.ts:748+`; activity-level bundle at :814–:815, eager step-technique bundling loop at :896–:965, `step_techniques` emitted at :1069, response assembled at :1155
- `get_workflow` — `workflow-tools.ts:426–427`
- `next_activity` — `workflow-tools.ts:494–747`: **composes nothing**. It is transition + advisory manifest validation only (tool description at :494 says so explicitly). No technique body is assembled there.

## What happens to an inline technique→technique reference at composition time

**Nothing. The text is passed through verbatim.** There is no resolution, no inlining/transclusion, no validation, and no ordering effect.

Evidence:

1. The only body rewrite is `rewriteResourceLinks` (`markdown-technique-loader.ts:226–232`), whose regex requires a `resources/` path segment; its own docstring at :224 states *"technique links (`./<group>/TECHNIQUE.md`, `<op>.md`) are left untouched."*
2. Protocol steps are plain strings (`bodyAsList` :187). `ProtocolBlock.steps` is `string[]` — no ref field, no callee slot.
3. `composeLoaded` (:499) and `wrapProtocolWithAncestors` (:445) look only at **ancestor containers on the filesystem path**. Neither reads step text.
4. The system explicitly compensates for the gap rather than fixing it — `src/loaders/core-ops.ts`:
   - :25–27 *"compose-prompt is invoked inline by dispatch-activity's body; inline refs are not re-resolved, so it must be bundled explicitly to reach the orchestrator."*
   - :31–33 same caveat for `version-control::commit-*`
   - :36–42 *"both dispatch-activity and commit-and-persist say 'Apply sync-progress-status', but get_technique resolves only step-bound or first-declared techniques… without this entry the named op has no delivery path"*
   - :48–59 the fullest statement: *"A technique named inside another technique's Protocol has no other delivery path… an orchestrator without these entries reaches the dispatch step with nothing to apply and improvises the invocation."*
5. No guard covers them either. `scripts/check-all-refs.ts:50–52` collects refs only from `workflow.yaml techniques.workflow/.activity` and `activity.techniques[]`. `check-binding-fidelity.ts:33–35` states reference-resolution is `check-all-refs`'s job for `techniques[]` lists and its own job for **step bindings** — inline protocol refs are in neither.
6. The corpus uses the form heavily (see [03-corpus-survey.md](03-corpus-survey.md)) — e.g. `workflows/meta/techniques/harness-compat/spawn-agent.md`, `workflows/meta/techniques/workflow-engine/dispatch-activity.md`.

### One partial exception, and it is a bug surface

`src/utils/resource-ref.ts:72` `extractResourceIds` is the single place that parses markdown links out of composed technique text (called at `workflow-tools.ts:957`). It deliberately skips `::`-bearing hrefs (:89 `&& !href.includes('::')`) and `./`-prefixed ones (regex requires a leading alnum), but a **bare sibling technique link is misclassified as a resource id**. Live instance: `workflows/workflow-design/techniques/assemble-file-approach.md:40` links `[yaml-authoring](yaml-authoring.md)`, which exists only as `workflows/workflow-design/techniques/yaml-authoring.md` — so eager bundling of that technique emits a spurious `Unresolvable resource ref 'yaml-authoring'` warning (`workflow-tools.ts:1004`, :1062).

## What `fragment-resolver.ts` resolves

Not technique bodies at all. It resolves **`fragments` declared in `workflow.yaml`**, in exactly two kinds (`fragment-resolver.ts:1–18`):

- `fragments.rules` — spliced into rules partitions where a `{ ref }` entry appears (`resolveRuleFragment` :56, `materializeRuleEntries` :83)
- `fragments.checkpoints` — spliced into `kind: checkpoint` steps in **activity YAML** (`resolveCheckpointFragment` :68, `materializeCheckpointStep` :106, `materializeActivityFragments` :146, and the raw-text injector `injectCheckpointFragmentBodies` :170)

Addressing is `[workflow::]name`, current-workflow-first then `meta` (`parseFragmentRef` :37, `candidateWorkflows` :46). Resolution is deliberately **non-recursive** — :17 *"a fragment cannot itself contain a reference — so resolution never recurses."* Used only at `workflow-tools.ts:780–784` (get_activity raw YAML) and in the loaders/guards. **Never applied to `## Protocol` text.**

## I/O contract at composition time — are step binds checked?

**Parse:** `parseInputsSection` / `parseOutputsSection` (`markdown-technique-loader.ts:328`, :386) → validated by `TechniqueSchema` (`buildTechnique` :466).

**Merge:** `composeLoaded` (`technique-loader.ts:525–552`) unions ancestor contracts and splits own vs `inherited_*`.

**Step-bind checking at delivery — yes, but only step→technique:** `src/utils/binding-provenance.ts`

- `buildProvenanceContext` :92 walks the whole workflow collecting producer sites (step outputs, remaps, checkpoint `setVariable`, `action: set`, loop vars)
- `resolveInputSource` :236 classifies each declared input against the step binding / bag / default / optional / ambient; `resolveOutputDestination` :283 for remaps
- `decorateTechniqueProvenance` :314 annotates and emits **warn-only** `UNRESOLVED` entries (:332–:338)
- Called from `resource-tools.ts:690–704` (get_technique) and `workflow-tools.ts:908–919` (bundled steps)

**Static guards (build-time, not composition-time):** `scripts/check-binding-fidelity.ts:1–50` — arg-conformance of `step.technique.inputs/outputs` keys against the composed signature, read-resolution of `{token}`s, dead-output, orphan-input. It *does* scan technique protocol text for `{token}` reads (`collectReads(…, 'technique')` at :420), but only for bag-name liveness — never to match a caller's reference against a callee's declared inputs. Its own docstring at :22 treats a technique's own protocol as *"internal wiring, not a consumer."*

**Technique→technique binding fidelity: does not exist anywhere.** There is no data path that could carry it — the inline reference is never parsed into a structured ref, so there is nothing to check a callee's `## Inputs` against. The closest artifact is the non-gating analyzer `scripts/analyze-io-protocol-refs.ts` (:1–17), which only checks that a technique's *own* declared designators are mentioned somewhere in its *own* protocol text (`referenced` :77) — intra-file, string-level, "not a gate… deliberately absent from the guard registry."

## Ordering / representation: `techniques[]` vs step binds

Two distinct shapes in one `get_activity` response (`workflow-tools.ts:1155`: `opsSection + header + activityRules + enforcement + activityBody`):

1. **`techniques[]` (activity-level + inherited + core)** → `resolveTechniques` → `formatTechniqueBundle` (`technique-loader.ts:624–650`). An **unordered map** keyed by technique path under `techniques`, plus a flat `rules` pair-list and an `unresolved` list. No step association, no sequence.
2. **Step binds** → the eager bundling loop (`workflow-tools.ts:881–965`). Iterated in **document order** over ungated technique steps (`collectUngated` :883–:890), each rendered as a discrete block:
   - `▼ STEP <step_id> · technique <techniqueId>` marker (:932), spread over the full `projectTechnique` output (:952)
   - emitted under `bundleData['step_techniques']` (:1069) with the contract note at :1070–:1071: *"Each step_techniques entry is a discrete ▼ STEP block whose composed technique is identical to a get_technique { step_id } fetch. Engage the inlined steps strictly in step order…"*
   - budget-bounded: stop-and-break at the first overflow (:942), per-technique cap (:926), gated steps excluded (:885)
   - the ordering authority is still the **raw activity YAML** appended at :1113 — `step_techniques` is a keyed side-map the worker joins by `step_id`

**So: for a referenced technique to appear as "a discrete sequential step in the protocol," it must be a `kind: technique` step in the activity YAML with an `id`.** That is the only construct that produces a `▼ STEP` block, a position in document order, a `technique_bundled`/`technique_fetched` fidelity event (:1176), a `step_manifest` slot, and provenance decoration. An inline `Apply family::op` produces none of these — it is prose inside a `ProtocolBlock.steps[]` string.

## Reusable mechanisms for a formal fold/inclusion

| Mechanism | Location | Reusability |
|---|---|---|
| `wrapProtocolWithAncestors` | `technique-loader.ts:445–473` | The only existing **protocol-array splicing** primitive. Already concatenates foreign blocks into a technique's `protocol[]`; a fold would extend it from "ancestors by path" to "callees by reference." |
| `parseTechniquePath` | `technique-loader.ts:219–238` | Ready-made parser for `[workflow::]technique[::op]`, incl. legacy `/` normalization — exactly the token grammar appearing inline. |
| `readTechnique` / `composeTechnique` | `technique-loader.ts:96`, :575 | Full precedence resolution (explicit prefix → cross-workflow `::` → workflow-local → meta). A fold could call `composeTechnique` per callee. |
| Fragment materialization | `fragment-resolver.ts` (whole file) | The closest thing to transclusion in the repo — sync pure core over a lookup, in-place splice, one-home enforcement (:120–:131), **plus a raw-text injector** (`injectCheckpointFragmentBodies` :170) that rewrites source text at correct indentation. Both the object-level and the text-level patterns are directly transferable. Its explicit "no recursion" invariant (:17) is the design decision a technique fold would have to revisit (cycle detection). |
| `rewriteResourceLinks` | `markdown-technique-loader.ts:226–232` | Precedent for **rewriting an inline markdown link into a server-callable ref** during parse, ahead of sectioning. A `rewriteTechniqueLinks` sibling would slot in at :260 with no other change. |
| `extractResourceIds` | `resource-ref.ts:72–94` | Precedent for **scanning composed technique text for outbound refs and eagerly bundling the targets** (`workflow-tools.ts:957`, resource loop :978–:1053, dedup + budget + warn-on-unresolvable). This is structurally the whole fold pipeline, already built — just pointed at resources. Note the `::`-exclusion at :89 is the exact line a technique-fold would invert. |
| `dedupTechniqueBlocks` / delivery ledger | `utils/delivery.ts:94`, :137 | Content-keyed dedup already exists for shared blocks; a folded callee body would need the same treatment to avoid N× duplication when several callers fold the same op. |
| `core-ops.ts` core lists | `loaders/core-ops.ts:19–66` | The **manual workaround that a formal fold would retire.** ~10 of its entries exist solely because inline refs don't resolve (:25–27, :31–33, :36–42, :48–59). It also doubles as a hand-curated inventory of which inline refs matter today. |
