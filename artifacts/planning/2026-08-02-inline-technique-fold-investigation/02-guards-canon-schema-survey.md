# Guards, canon, and schema survey — what is mechanically checked vs prose-only

> Investigation record · 2026-08-02 · Repo state: main checkout (pre-merge of PR #385, so AP-140–143 are not yet in `anti-patterns.md`)

## Part 1 — Mechanical guards

### The registry

`scripts/guards.ts:28-197` — 21 guards, 18 `corpus`-scoped, 3 `repo`-scoped. Runners: `scripts/check-all.ts` (parallel sweep, exit 0/1/2) and `scripts/check-delta.ts` (merge-base differential; no stored baselines).

### Guards touching reference resolution

**`refs` — `scripts/check-all-refs.ts`**
- Registry entry: `guards.ts:149-156`. Proves *"every activity/workflow `techniques[]` reference resolves through the loader."*
- What it reads: `check-all-refs.ts:50-52` — **only three sources**: `workflow.yaml → techniques.workflow`, `workflow.yaml → techniques.activity`, and `activity.techniques[]`. It resolves them via the real `resolveTechniques` loader (:56) and emits `unresolved-technique-ref` (:57-63).
- Inline `Apply`/`::`/markdown ref from a Protocol → **NO**. It never opens a technique markdown file.
- Data-flow compatibility → **NO**. Resolution only.

**`binding-fidelity` → sub-check `binding-resolution` — `scripts/check-binding-fidelity.ts`**
- Registry entry: `guards.ts:29-36`. Header contract at :1-49; finding families enumerated at :625.
- `binding-resolution` at :649 — `step technique '<ref>' does not resolve`. Resolver at :196-243 mirrors the server's `::` precedence (`<workflow>::<technique>`, `<workflow>::<group>::<op>`, activity-named-group shorthand). Explicit note at :33-35: *"Reference-resolution … is covered by scripts/check-all-refs.ts for `techniques[]` lists; step bindings are covered here."* Between them, **activity-layer refs are the complete universe of checked references.**
- Inline Protocol ref → **NO**. `walkSteps` (:308) walks activity YAML `steps[]`/loop bodies only. Technique markdown is parsed *solely* for its `## Inputs`/`## Outputs` signature (`fileSigDetailed`, :97) and for `{token}` reads (`collectReads`, :367).
- Callee-contract compatibility → **YES, but only for activity `step.technique` binds** (see below).

**`resource-anchors` — `scripts/check-resource-anchors.ts`**
- Registry entry: `guards.ts:101-108`. The **only** guard that resolves markdown hyperlinks inside the workflow corpus.
- **Critical scoping limit:** `LINK_RE` at :78 is `/\]\(([^()\s]+\.md)#([A-Za-z0-9][\w-]*)\)/g` — the `#anchor` is **mandatory**. The header says so explicitly at :12-13: *"External links (scheme://), pure file links (no `#`), and non-`.md` targets are ignored."*
- Consequence: `Apply [commit-paths](./manage-git/commit-paths.md)` — the canonical AP-51 technique-reference form — is a **pure file link with no anchor and is therefore never checked for existence**. Only an anchored technique link (`…/foo.md#capability`) would incidentally be validated, and no house-style technique reference carries an anchor.

**`stealth-isolation` — `scripts/check-stealth-isolation.ts:202-216`**
- The one guard that **text-scans composed technique Protocol prose** ("reachable-text scan … must not invoke", :16). But it greps for *public write invocations* (push/PR) in stealth workflows only. Not a general reference resolver.

**`prism-lens-reachability` — `scripts/check-prism-lens-reachability.ts:14-19`**
- Has an **orphan** notion — but for **lens *resources*** under `prism/resources/`, not techniques, and only in the `prism` workflow. Prism-specific, one-off.

**`technique-template` — `scripts/check-technique-template.ts`**
- `guards.ts:109-116`. Rules enumerated at :44-56: frontmatter/H1/section-set/section-order/id-casing/rule-casing/sigil-casing/artifact-name. **No rule about references at all.** Notably `frontmatter-extra-key` (:106) *forbids* any frontmatter key beyond `metadata.version` — relevant to any `uses:` frontmatter proposal (Part 3).

### Guards touching binding fidelity (contract compatibility)

All four live in `check-binding-fidelity.ts`, all keyed off **activity `step.technique`**:

| Sub-check | Line | Detects |
|---|---|---|
| `arg-conformance` | :657, :660 | a `step.technique.inputs`/`outputs` key that is **not** a declared input/output of the bound op's composed signature (own ∪ group ∪ root) |
| `read-resolution` | :685, :696 | a `{token}` / `when` / `condition` / `validate.target` read with no producible producer **in its own workflow's scope** |
| `dead-output` | :708 | a declared output nothing **outside the declaring file** consumes (artifact-carrying outputs exempt) |
| `orphan-input` | :671 | a bound op's own declared input with no producer in the binding workflow (no step-binding entry, workflow var, prior step output/remap, declared `default`, or `(optional)` marker) |

Contract source of truth: `fileSigDetailed` (:97) parses only canonical `## Inputs` / `## Outputs` `###` entries. `unionSig` (:85) composes container inheritance.

Adjacent, weaker: `self-provisioned-input` (`guards.ts:77-84`); `activity-technique-overlap` (`guards.ts:85-92`, AP-69/AP-36); `identifier-qualification` (`guards.ts:37-44`, id shape only); `analyze-io-protocol-refs.ts:1-16` (each declared `###` designator mentioned by name in the same file's Protocol — *"an analyzer, not a gate … deliberately absent from the guard registry"*; intra-technique only, never cross-technique).

### Orphan / unreferenced techniques

**No guard exists.** The only orphan semantics in `scripts/` are `orphan-input` (a technique *input* with no producer) and the prism *lens resource* orphan. There is no guard asserting that a technique file under `<workflow>/techniques/` is reachable from any activity step binding, `techniques[]` list, or `core-ops.ts` bundle. Direction of the arrow is one-way: refs → files, never files → refs.

### The gap — what is NOT checked for technique→technique inline references

Canonical example, `workflows/work-package/techniques/apply-review-fixes.md:41`:

```
Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md)(target: `{$target_symbol}`, direction: `upstream`)
```

Nothing verifies **any** of the following:

1. **Link-target existence** — an unanchored `.md` link; `check-resource-anchors.ts:78` skips it. A renamed or deleted op file silently strands every inline caller.
2. **`::` path resolvability** — `check-all-refs.ts` only feeds `techniques[]` lists to `resolveTechniques`; the Protocol-embedded `::` path never reaches the loader. The normative spec confirms the scope at `docs/technique-protocol-specification.md:508`: *"An **activity's** `::` references resolve to a technique or rule."* Technique-internal ones are outside that sentence.
3. **Argument-name conformance** — the `(target: …, direction: …)` parameter names are never matched against `impact.md`'s declared `### target` / `### direction` inputs. `arg-conformance` (`check-binding-fidelity.ts:657`) applies only to `step.technique.inputs`; the parenthesised invocation-arg namespace defined in spec §4.2 (:339-352) has **zero mechanical validation**.
4. **Callee input satisfaction** — `orphan-input` (:671) is computed per *binding workflow* from activity binds; an op reached only via inline Apply gets no producer analysis whatsoever.
5. **Callee output consumption / destination** — the callee's outputs never enter the caller's bag model. Worse, an op invoked **only** inline will read as `dead-output` (:708) because no activity step consumes it — the guard's failure mode here is a *false positive* pointing away from the real defect.
6. **AP-114 itself** — the design canon's stance that this construct should not exist for work has **no encoding**. Stated flatly in `.engineering/artifacts/planning/2026-08-01-formalise-reusable-parallel-fan-out/10-ap114-redesign-note.md:30`: *"No automated guard encodes AP-114. The smell is agent judgment only."* That note documents a real quality-review false negative (zero findings recorded against four live AP-114 sites).
7. **Delivery** — the runtime doesn't resolve them either. `src/loaders/markdown-technique-loader.ts:216-224`: `rewriteResourceLinks` rewrites *only* links under a `resources/` segment. So an inline technique ref ships to the agent as a raw relative filesystem path with no delivery path. The compensating mechanism is the hand-maintained hardcoded list in `src/loaders/core-ops.ts:25-56`. Nothing guards that list against the Protocol prose it mirrors.

## Part 2 — Design canon

### `schema-construct-inventory.md`

`workflows/workflow-design/resources/schema-construct-inventory.md:36` is the load-bearing row — it maps the informal pattern explicitly by name:

> | "Compose / chain techniques for work" / **"Apply technique B from inside technique A"** | **Activity technique steps** (not Protocol Apply) | Consecutive `steps[]` entries with `kind: technique`, each binding one op; activities (and checkpoints/loops) are the composition layer. Technique Protocols stay atomic produce paths over tools and resources — they do not `Apply` / `::`-invoke other techniques for work (`pass-orchestration-in-technique`, Atomic Techniques; Compose at Activities). |

:37 gives the sanctioned alternative — **activity→activity composition** — and says outright *"Distinct from technique→technique Apply."*

The **Technique-Level Constructs** table (:66-78) is the decisive negative evidence: nine rows, none of which is a technique→technique reference. The only composition constructs at the technique layer are `Protocol` (:70) and container `TECHNIQUE.md` inheritance (:71).

### `anti-patterns.md` — relevant entries (kebab-case, line refs pre-#385)

**Core stance:**

- **`pass-orchestration-in-technique`** (AP-114, :1478-1490). *Detect:* "Technique Capability or Protocol applies, invokes, or runs another technique/operation for work via Protocol `Apply [technique]` / `::` op invocation (one or many). … Test: if moving each invoked op to its own activity `steps[]` entry … preserves behavior, flag it." *Do not flag:* citing resources; **"non-invoking technique hyperlinks used as documentation/canonical reference"**; loader `Initial`/`Final` wrap and container I/O merge; activity `steps[]` binds; a single produce path with no Apply/`::` work invoke. *Fix:* "Delete the façade or strip Apply/`::` work invokes from the Protocol; bind each sibling or shared operation as its own activity step."
- **`duplicate-shared-capability`** (AP-110, :1430-1442). Local re-implementation of a meta/shared op. *Fix:* bind the shared op **from the activity**, not from a Protocol.
- **`bind-site-is-orchestration-truth`** (AP-107, :1390-1402). Prose outside activity YAML enumerating an ordered list of technique passes not generated from `steps[]`. Carve-out: *"a technique that only applies a sibling without listing a parallel set."*

**Reference form (when a reference legitimately exists):**

- **`canonical-technique-reference`** (AP-51, :702-714). *"Must use the canonical hyperlink (`[op](path)` or `[group](path)::[op](path)`), resolved by the server to `::`."* This is the entry that **mandates the exact syntax no guard resolves.**
- **`anchored-protocol-references`** (AP-54, :738-750). *Detect:* "A protocol phrase refers to a declared I/O, rule, technique/op, or resource but does not use that kind's resolvable form." *Fix:* *"A reference with no real target is dangling — fix the target or drop it; never invent a link."* The canon asserts resolvability as an obligation; nothing measures it.
- **`paren-invocation-args`** (AP-56, :762-774). Arg lists in parentheses on the op reference, arg names italic — prose-only, no validator.
- **`dotted-rule-address`** (AP-53, :726-738). *"Mnemonic: `::` invokes, `.` names."*
- **`technique-ref-in-io-contract`** (AP-125, :1610-1622). *Detect:* an Inputs/Outputs description hyperlinking a technique file or naming another technique as producer/consumer/executor. *Fix:* rewrite as bind-contract meaning/shape only. Carve-out: bare technique *id strings* when the slot's value **is** a technique id (`agent_technique`, `harness_technique`) — the one place a technique reference is legitimate data.
- **`phase-cited-by-ordinal`** (AP-136, :1784-1796). *Do not flag:* "A link to the phase's heading anchor, **which fails a guard rather than drifting**" — an explicit acknowledgement that anchored links are the only guarded citation form.

**Binding / contract fidelity:** `technique-inputs-declared` (AP-16), `technique-outputs-declared` (AP-109), `procedure-in-io-contract` (AP-119), `contract-not-procedure` (AP-111), **`no-bind-mechanics-as-prose`** (AP-118, :1526-1538 — *Fix:* *"If structure cannot express the needed resolution, extend variable-binding / the schema once — do not encode the gap in leaf prose."*), `unproduced-value-read` (AP-128), `output-without-destination` (AP-138), `bound-step-no-description` (AP-17), `no-duplicate-technique-steps` (AP-38).

**Duplication of guidance:** `no-duplicated-guidance` (AP-74), `no-technique-resource-dual-home` (AP-102), `canonical-fact-home` (AP-93), `link-dont-copy-sections` (AP-85), `no-inline-content` (AP-01), `no-resource-caller-backlink` (AP-46), `capability-as-op-inventory` (AP-123), `alternate-ops-as-protocol-sequence` (AP-124). Also the catalog's own authoring rule *Sibling cross-references* (:67-69): *"Cross-references name the sibling … without re-teaching it."*

### `design-principles.md`

- **§25 Bind Sibling Operations as Steps** (:113-115) — *"All multi-technique work lives in activity `steps[]` … A technique owns one capability's produce path — its Protocol does not `Apply` sibling or meta ops for work. Loader ancestor wrap (`Initial`/`Final`) and container I/O merge are platform composition, not technique→technique work calls."*
- **§26 Atomic Techniques; Compose at Activities** (:117-119) — *"Technique→technique work calls remain forbidden — techniques stay atomic over tools and resources. Reuse a shared capability by binding it from an activity (or borrowing that activity), not by `Apply [other-technique]` inside a Protocol."* Same paragraph explicitly *permits* activity→activity composition.
- **§18 Prefer Shared Capability** (:85-87), **§13 Separate Contract from Procedure** (:65-67), **§5 Maximize Schema Expressiveness** (:33-35), **§16 Distinguish Designators from Parameters** (:77-79), **§6 One Authoritative Home** (:37-39), **§22 Modular Over Inline** (:101-103), **§20 Keep Orchestration in Structure** (:93-95), **§29/§32 resource citation grain** (:129-131, :145-149).

Note: §29/§30/§32 build an elaborate **resource** citation-grain theory with anchor-level delivery semantics. There is **no parallel theory for technique citation grain** — the canon's answer to "what grain do I cite another technique at?" is "you don't; bind it at the activity."

## Part 3 — Schema

**No formal construct exists for a technique invoking another technique. None. At any layer.**

### Technique layer — closed and empty

`schemas/technique.schema.json`, `definitions.technique`: properties are exactly `id`, `version`, `capability`, `provenance_note`, `rules`, `inputs`, `inherited_inputs`, `protocol`, `outputs`, `inherited_outputs` — with **`"additionalProperties": false`**. No `uses:`, `applies:`, `depends:`, `invokes:`, `requires:`, `calls:`.

`protocolDefinition` is an array of `protocolBlock` = `{ title?, steps: string[] }` — **steps are plain strings**. A Protocol step has no structured slot for a callee, args, or a return binding.

Frontmatter is doubly closed: `check-technique-template.ts:92` (*"exactly `metadata:` with exactly `version:` beneath it"*) emits `frontmatter-extra-key` (:106) for anything else.

### Activity layer — the only invocation construct

`src/schema/activity.schema.ts:62-66`:

```ts
export const TechniqueBindingSchema = z.object({
  name: z.string().describe('The `group::operation` (or bare op / `workflow::group::op`) technique reference this step invokes.'),
  inputs: z.record(...).optional().describe('Input deviations: op input id → source expression …'),
  outputs: z.record(z.string()).optional().describe('Output remaps: op output id → the workflow variable name …'),
});
```

Used by `TechniqueStepSchema` (:87-94), `.strict()`. This `{ name, inputs, outputs }` triple is the **entire** formal vocabulary for invoking a technique with data flow — and it is available **only** on an activity `steps[]` entry. `check-binding-fidelity.ts`'s `arg-conformance` exists precisely because this construct is machine-readable.

Secondary, non-invoking constructs, all activity/workflow-layer: `activity.techniques[]` and `workflow.techniques.workflow` / `.activity`.

### Addressing spec

`docs/technique-protocol-specification.md:294-352` defines `::` as an "executable reference" and §4.2 defines `(arg: value)` invocation args — i.e. the spec **describes** a technique→technique call syntax in detail while the schema provides no field to hold it and no validator to resolve it. §3.5 (:288-294) even sanctions it for error recovery: *"A recovery that applies another technique names it inline, as any protocol technique reference."* That sentence and AP-114 are in direct tension.

## Bottom line: formal vs prose-only

| Concern | Status |
|---|---|
| Activity step → technique reference resolves | **Formal** — `check-binding-fidelity.ts:649` (`binding-resolution`), Zod `TechniqueStepSchema` |
| Activity/workflow `techniques[]` resolves | **Formal** — `check-all-refs.ts:56-63` |
| Activity step binding args conform to callee I/O | **Formal** — `check-binding-fidelity.ts:657,660` |
| Callee inputs have producers / outputs have consumers | **Formal** — `orphan-input` :671, `dead-output` :708 |
| Anchored `.md#heading` link resolves (any file) | **Formal** — `check-resource-anchors.ts:78-108` |
| **Unanchored technique `.md` link resolves** | **Nothing** — regex requires `#` |
| **Inline Protocol `Apply [x](p)::[y](p)` resolves** | **Nothing** — no guard reads Protocol prose for refs; no loader rewrite |
| **Inline invocation `(arg: value)` names match callee inputs** | **Nothing** — spec §4.2 defines the syntax; no validator |
| **Inline callee's inputs are satisfiable / outputs consumed** | **Nothing** — bag model is activity-scoped only |
| **AP-114 / §25 / §26 "no technique→technique work calls"** | **Prose-only** — self-documented at `10-ap114-redesign-note.md:30` |
| **Orphan / unreferenced technique files** | **Nothing** — no guard, no anti-pattern entry |
| **`uses:`/`applies:`/`depends:` in technique frontmatter** | **Does not exist** — `additionalProperties: false`; `frontmatter-extra-key` would reject it |

The structural asymmetry: the canon forbids the construct in prose across three resources, the addressing spec fully specifies its syntax, the corpus uses it in 40+ technique files, the runtime compensates with a hardcoded bundle list — and not one mechanical check touches it.
