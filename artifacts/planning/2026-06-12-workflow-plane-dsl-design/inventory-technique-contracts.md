# Inventory: what a GENERATED TypeScript technique contract must represent

Sources (read in full / verified against loader):
- Spec: `/home/mike1/projects/main/workflow-server/docs/technique-protocol-specification.md` (§1–§9; line refs below are to this file)
- Schema: `/home/mike1/projects/main/workflow-server/schemas/technique.schema.json`
- Loader ground truth: `/home/mike1/projects/main/workflow-server/src/loaders/markdown-technique-loader.ts` (`parseEntrySubsections` reserves `artifact` for outputs / `default` for inputs, lines ~292–400)
- Real artifacts: `workflows/meta/techniques/gitnexus-operations/TECHNIQUE.md` (container, rules-only), `workflows/meta/techniques/gitnexus-operations/impact.md` (nested, full I/O+protocol), `workflows/work-package/techniques/TECHNIQUE.md` (workflow-root, shared inputs), `workflows/prism/techniques/plan-analysis.md` (standalone w/ `*(optional)*` + `#### default`), `workflows/prism-audit/techniques/compose-audit-prompt.md` (artifact filename literal)

---

## 1. Identity and file-shape axis (spec §2)

A contract must carry, per technique:

| Facet | Values | Contract relevance |
|---|---|---|
| Shape | `standalone` (`<wf>/techniques/<id>.md`) \| `container` (`<group>/TECHNIQUE.md`) \| `nested` (`<group>/<op>.md`, any depth) | Container contracts are inheritance BASES; nested contracts COMPOSE with their container chain. Shape must be a discriminant (brand) so the generator knows which contracts participate in merging. |
| Workflow-root technique | id `TECHNIQUE` at `<wf>/techniques/TECHNIQUE.md` | Ancestor of every technique in that workflow; carries shared contract (e.g. work-package root declares `planning_folder_path`, `requirements`, `target_path`, `branch_name`, `pr_number`); EXCLUDED from the addressable technique list — its contract type is exported for composition but not as an invocable address. |
| Canonical address | full `::` path (`gitnexus-operations::impact`); standalone = bare id | The registry key; type-level string literal. |
| Version | `metadata.version` (semver, schema-required) | Literal string in contract for compat checks. Other frontmatter (`ontology`, `kind`, `order`, `legacy_id`) is generator-internal, not contract surface. |

## 2. Addressing grammar (`::`) the generator must resolve (spec §4, §4.1)

The CONTRACT REGISTRY (not each contract) must encode the resolved address space; tsc then makes
an unresolved reference a type error (replacing the runtime `unresolved` bundle bucket, §7.2):

- Grammar: `[<workflow>::]<technique>[::<nested>…]` — workflow segment implicit for same-workflow.
- **Slash normalization**: `<workflow>/<technique>` → `::` (`parseTechniquePath`). Generator normalizes; only canonical `::` literals appear in generated types.
- **Rule-segment resolution**: a trailing segment matching a rule name resolves to that RULE entry, not a technique. So address-literal types must distinguish technique-addresses from rule-addresses (two literal unions per technique: child techniques, rule names).
- **`group-*` expansion**: `<technique>::<group>` expands to every rule named `<group>-*`. Expansion is generation-time: the generated registry maps the group address to the concrete rule-name set (a literal union), so the DSL can type the expanded delivery.
- **Precedence**: unprefixed reference resolves current-workflow-first, then `meta` (§2). Resolution is therefore WORKFLOW-RELATIVE: the generated registry is parameterized per workflow (a workflow's namespace = own techniques shadowing meta's), not a single global flat map.
- `::` (invoke) vs `.` (symbol citation, §4.1): dotted addresses `[wf.]technique.rule-name` name rules without invoking. Contract must export rule names as literal types so dotted citations can be validated; the EXECUTABLE/`::` form must never accept a rule-only suffix where a technique is required (except the bundle-layer rule/group-expansion forms above).
- Invocation arguments `(arg: value)` (§4.2): argument KEYS are the callee's own input ids. If the DSL represents an invocation structurally, the callee contract's input-id key set types the arg object; values are designators (`{x}`) or literals. The parenthesized prose form itself stays protocol text.

## 3. Interface entries: Inputs / Outputs (spec §3.2, schema `inputItemDefinition`/`outputItemDefinition`)

Per entry (`### <id>` under plural `## Inputs` / `## Outputs` — loader REJECTS singular headers):

| Field | Source | Contract representation |
|---|---|---|
| `id` | `### <id>` heading | Property key, exact snake_case string (see §5 below — binds by exact string match). |
| `description` | lead prose | JSDoc on the property (informative, not normative type structure). |
| `required` | description opening with `optional` (e.g. `*(optional)*`) ⇒ `required: false`; default `true` | Optional property (`id?:`) at the binding site. NOTE the marker is PROSE-derived in markdown; the generated contract makes it structural. |
| `#### default` (inputs only) | reserved subsection value | Presence makes the input satisfiable-without-binding: contract marks it optional AND carries the default literal (e.g. `analysis_budget` default `standard` in `prism::plan-analysis`). |
| `#### <member>` components | named sub-sections → `components[member]` | Nested member keys (object-shape documentation). Schema types them as `Record<string,string>` (description only); contract exposes member NAMES as keys, descriptions as JSDoc. Consumers bind the ENTRY id, not members (§7.4), so members are documentary keys, not independent binding targets. |
| `#### artifact` (outputs only) | reserved subsection; value is a code-span filename | Two forms: literal (`audit-prompt.md`) or `{token}`-template (`{package_name}-plan.md`). Contract must carry the name string AND the extracted token list — each token is a snake_case symbol that must be in scope at interpolation time; tsc can check token ∈ (inputs ∪ outputs of the binding scope). Schema also has `action: create|update` (default create). |

Schema/IR naming wrinkle: authored headers are plural `## Inputs`/`## Outputs`; the IR field for
outputs is singular `output` (`outputDefinition`). The generated contract should canonicalize
(plural keys) and let the IR layer (L2 EBNF) keep its own field name.

## 4. The symbol model (spec §3.2 "The symbol model")

- ONE namespace of mutable symbols per technique. Direction is STRUCTURAL — carried by the
  section (Inputs vs Outputs), never by spelling. Contract therefore must NOT encode direction in
  the id; it encodes direction as which keyed map the id appears in.
- A symbol may appear in BOTH Inputs and Outputs = idempotent resolver (receive-or-compute,
  then expose). The contract must permit the same key in both maps without conflict — i.e.
  inputs and outputs are separate keyed structures over one shared symbol vocabulary, NOT a
  single direction-tagged map (a single map could not represent both-direction symbols).
- **snake_case symbol ids**: a symbol becomes a runtime variable resolved by EXACT string match
  (`getVariableValue`); activity conditions/transitions read the same string. So generated
  property keys must preserve the authored string byte-for-byte — no camelCasing, no renaming.
  External-tool-mirroring ids keep the tool's exact spelling (usually snake, occasionally
  camelCase like Atlassian `cloudId`) — the contract must not "fix" these.
- **kebab-case names** (techniques, operations, resources, RULE names) are slugs, never evaluated
  variables. In the contract they appear only inside address/rule literal types, never as
  property keys of the symbol maps.

## 5. AP-60 naming structure (spec §3.2 "Naming structure", §8)

The grammatical shape of an id encodes its KIND — the only type information markdown carries:

- boolean = affirmative predicate (`pr_merged`, `index_fresh`, `worktree_created`; `is_/has_/can_/should_` prefix value-gated, not mandatory; negated stems and `…_flag/_status/_check` non-conformant)
- collection iterated whole = plural item noun (`tasks`, `failures`) — no `_list/_array/_set` suffix; key-addressed map = singular naming the mapping (`domain_to_range`)
- I/O id = qualified noun phrase, head noun LAST (`reconciled_assumptions`, `lint_diagnostics`); representation never in the id (`assumptions_log`, not `…_log_path`); kind-suffix head nouns (`_mode`, `_type`) legitimate
- one concept = one name corpus-wide (hoist to common ancestor rather than synonym drift)

Contract option (flag as design decision, not locked): derive TS value types from shape
(predicate→`boolean`, plural→`ReadonlyArray<…>`, map-singular→`Record<…>`, else opaque value).
Markdown declares no types, so anything beyond `unknown`/branded-opaque is an INFERENCE from
AP-60; the safe baseline is a branded opaque `SymbolValue<'id'>` with shape-derived types as a
lint/refinement layer. Either way the contract must keep ids verbatim (§4 above).

## 6. Protocol and protocol variables (spec §3.3) — EXCLUDED from contract

- `## Protocol` = ordered blocks `{title?, steps[]}`; steps are imperative prose; `>` blockquote
  notes fold into the preceding step; titles `Initial`/`Final` are composition markers (§8 below).
- Protocol variables: `{$name}` declares once (snake_case symbol), every later read is `{name}`.
  Scoped to ONE protocol run; **not an Input, not an Output, not delivered, not `::`-addressable —
  NEVER appears in a generated contract**. The unbound-local / dead-binding defects (§3.3) are a
  markdown-lint concern, not a type-contract concern.
- The ONLY protocol→contract touchpoints: (a) `{id}` designator reads of interface entries must
  reference declared input/output ids (lint can use the contract's key set); (b) invocation arg
  keys are callee input ids (§2 above); (c) artifact `{token}` interpolation (§3 above).

## 7. Rules (spec §3.4, §4.1) — names in contract, text markdown-only

- `### <rule-name>` under `## Rules` = named cross-cutting invariant; lives at smallest covering
  scope (step-inline < child < group container < workflow root). Real example:
  `gitnexus-operations` container carries `query-not-grep`, `detect-changes-after-edit`,
  `index-freshness-first`, `must-use-operations` — pure rules-bearing container, no protocol.
- Names: kebab-case, positive declarative assertion of the invariant (`assumptions-resolved-before-review`); clarity-preserving negations allowed (`no-cargo-here`).
- Contract carries: the rule-NAME literal union (for `.` citation validation, `::` rule-segment
  resolution, and `group-*` expansion sets). Rule TEXT, scope-placement rationale, grouped-key
  values (schema allows `string | string[]` per key) stay markdown/IR — they are behavioral prose
  the runtime delivers, not typeable structure.

## 8. Contract inheritance and composition (spec §5, §6)

- Keyed-section UNION, local wins by id (Inputs/Outputs) or name (Rules), via `composeLoaded` on
  both delivery paths. TS encoding: `Omit<AncestorContract, keyof LocalContract> & LocalContract`
  (or interface-merge with local precedence) — the contract layer must make ancestor entries
  visible at the binding site (e.g. `impact` inherits `planning_folder_path` etc. when executed
  under work-package).
- **Ancestry follows the EXECUTING workflow**: composed surface = f(technique, executing
  workflow). Source-workflow containers are NOT applied when a meta technique runs in another
  workflow's session — only the executing workflow's root + the group containers along the path.
  Consequence (critical): a single static per-technique .d.ts CANNOT bake in the composed
  contract. Generation must either (a) emit composed contract types per (workflow × technique)
  pair, or (b) emit LOCAL contracts + container contracts and express composition as a generic
  type the DSL instantiates with the executing workflow's root. (b) matches the runtime model.
- **Initial/Final wrapping** (§6): ancestor `Initial` blocks before, `Final` blocks after, full
  chain, root outermost, parent innermost; server renumbers. This is PROTOCOL composition — text
  ordering, no interface effect — so it stays markdown/IR. The contract only needs container
  identity in the ancestor chain (which (a)/(b) above already require).

## 9. Delivery / bundle (spec §7) — contract as the static mirror

- Body: `capability, inputs?, protocol?(wrapped), output?` — capability/protocol are prose.
- Bundle buckets: `techniques` (bodies keyed by full `::` path for nested, id for standalone — the
  same keys as the contract registry), `rules` (`[name, text]` pairs incl. inherited + group),
  `unresolved` (definition defect). The generated registry's job is to make `unresolved`
  unrepresentable at compile time: every `::` reference in a typed artifact must index into the
  registry's literal-keyed map or fail tsc.
- Binding model (§7.4): engine binds BY NAME — entry ids ↔ workflow state variables. This is the
  whole justification for the generated contract: input/output id key-sets give tsc the names to
  check end-to-end across activity-step → technique bindings.

---

## 10. CONCLUSION — the .d.ts subset vs markdown-only

**IN the generated .d.ts (the typed contract):**
1. Identity: canonical `::` address (literal type), shape brand (standalone/container/nested/workflow-root), `metadata.version` literal.
2. Inputs map: verbatim snake_case id keys; optionality (prose `optional` marker and/or `#### default` presence, made structural); default-value literal; component member-name keys (JSDoc descriptions); value types opaque-branded (AP-60 shape-derived types optional refinement).
3. Outputs map: same shape minus default; `artifact` = `{name, action, tokens[]}` with template tokens extracted as symbol-literal types.
4. Shared symbol vocabulary permitting the same id in both maps (idempotent-resolver case).
5. Rule NAME literal union per technique/container (for `.` citations, rule-segment addressing, `group-*` expansion sets, bundle rule keys).
6. Per-workflow contract REGISTRY: workflow-relative namespace (own-then-meta precedence resolved at generation time; slashes normalized; group expansions materialized), keyed exactly as bundle `techniques` keys.
7. Composition machinery: container contracts exported as bases + a generic composed-contract type applying keyed-union/local-wins along the EXECUTING workflow's ancestor chain (or pre-expanded per workflow×technique).

**MARKDOWN-ONLY (never in the contract):**
- Capability prose; all I/O descriptions beyond JSDoc mirroring.
- Protocol blocks, steps, step notes/guards, error-handling prose; Initial/Final block CONTENT and wrap ordering (delivery-time composition).
- Protocol variables `{$x}`/`{x}` entirely — internal to one run, not interface, explicitly never in a contract.
- Rule TEXT and rule scope-placement; the rules' behavioral semantics.
- Invocation-argument prose syntax `(arg: value)` as authored in steps (the contract only supplies the key vocabulary that types a structural encoding).
- AP-60 conformance itself (a lint over ids, not a type), backticking/rendering rules (§4.3), AP-56/AP-59/AP-49 authoring defects.

Boundary principle: the contract is the NAME ALGEBRA — addresses, symbol ids, optionality,
defaults, artifact tokens, rule names, and their workflow-relative composition — i.e. everything
the engine resolves by exact string match. Everything the AGENT interprets as behavior stays
markdown and rides into the IR as opaque prose.
