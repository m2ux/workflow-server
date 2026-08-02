# Current interpretation model and server machinery

How `## Protocol` is parsed, composed, addressed, and delivered today — the baseline the variant
design changes. File:line references are against the repo at 2026-08-02.

## The parse model: blocks, with ordinals stripped

`src/loaders/markdown-technique-loader.ts` is the single parser for every technique file
(standalone `<id>.md`, container `TECHNIQUE.md`, nested `<group>/<op>.md` — same code path,
`parseTechniqueIndex`).

- `protocolBlocksFromBody` (`markdown-technique-loader.ts:358`): when the `## Protocol` body has
  `###` sub-headings, each becomes a block `{title, steps[]}`; when it is a flat numbered/bulleted
  list (the "op shape"), it becomes **one untitled block**; bare prose becomes one single-step block.
- `stripStepOrdinal` (`markdown-technique-loader.ts:382`) removes a leading `\d+\.` from every block
  title. `### 1. Dispatch` and `### Dispatch` are **byte-identical after load**. Note the regex
  covers only the `1.` form — a `1)` ordinal would survive in the title text.
- The wire schema (`src/schema/technique.schema.ts:24`) is `protocol: [{title?, steps[]}]`, with the
  explicit comment (`technique.schema.ts:30`): *"a single ordered list of step blocks (no 'phase'
  construct). Blocks are positional."*

**Why the ordinal is stripped — it is deliberate, not lossy.** Under the current ontology the
ordinal is presentation, not information. `workflows/meta/resources/workflow-canonical.md` §Protocol:
Protocol is "a **single ordered list of steps**" and "the server treats it as one ordered sequence
and assigns step numbers at load time"; it also bans absolute intra-protocol step-number references
because composition shifts them. Composition is the reason: ancestor `Initial` blocks prepend and
`Final` blocks append around a technique's own blocks, so an authored `### 1.` may be delivered
third. The loader strips digits so stale authored numbers cannot contradict delivered position —
**position is the number**. There is no semantic distinction being erased today because numberedness
currently *means* nothing. The variant design changes exactly that, so the parser must begin
recording block kind while continuing to normalise the digits out of titles.

## Parse-time strictness precedents

The loader already fails loudly on canonical-form violations, which is the enforcement pattern the
variant validation extends:

- Missing `## Capability`, empty Capability, missing `metadata.version` → `MarkdownTechniqueParseError`
  (`markdown-technique-loader.ts:258`, `:263`, `:265`).
- Non-canonical interface headers: `## Input`, `## Output`, `## Output(s)` are rejected by an explicit
  banned-titles set so a mis-titled section fails instead of being silently dropped
  (`markdown-technique-loader.ts:267–277`).
- A malformed file is dropped with a logged warning, never half-loaded (`buildTechnique`,
  `markdown-technique-loader.ts:466–487`).

## Composition: reserved titles and the ancestor wrap

`src/loaders/technique-loader.ts`:

- `blocksTitled` (`technique-loader.ts:428`) matches block titles case-insensitively **after** ordinal
  stripping. `wrapProtocolWithAncestors` (`technique-loader.ts:445`) takes each ancestor container's
  `Initial` blocks (prepended, outermost first) and `Final` blocks (appended, innermost first) around
  the technique's own blocks. Any *other* ancestor block is parent-only: excluded from descendants,
  delivered only when the container itself is referenced (`technique-loader.ts:434–443`).
- So unnumbered container block titles already carry **two** reserved meanings today: `Initial`/`Final`
  = wrap points; anything else = parent-only block. Variant semantics on containers would be a third
  overload — the design therefore scopes variants to leaf techniques.
- `composeLoaded` (`technique-loader.ts:499`) merges the ancestor chain's Inputs/Outputs/Rules
  (technique wins over innermost ancestor over root), partitions delivered I/O into own vs
  `inherited_inputs`/`inherited_outputs`, and applies the protocol wrap. Both delivery paths
  (`composeTechnique` → get_technique, and `resolveTechniques` → bundles) share it.

## Addressing: what `::` already resolves to

`readTechnique` (`technique-loader.ts:96`) and `parseTechniquePath` (`technique-loader.ts:219`)
define the ref grammar `[workflow::]technique[::sub…]`. A sub-segment resolves **in order**:

1. Nested technique file `<group>/<op>.md` (`technique-loader.ts:287–317`);
2. A rule name on the technique index (`technique-loader.ts:321–339`);
3. A rule-group prefix, expanding to every rule named `<prefix>-…` (`technique-loader.ts:341–363`).

Protocol blocks are **not addressable** by any channel. A variant slug riding `::` would join a
three-way overloaded chain and could shadow (or be shadowed by) a rule name or op filename — the
design keeps variant selection on a dedicated field instead.

Also relevant: `composeActivityTechnique` (`technique-loader.ts:603`) gives step binds the
activity-group shorthand (bare op id resolves `<activity-id>::<op>` first), and
`get_technique` (`src/tools/resource-tools.ts:602–614`) is session-scoped — params are
`session_index`, `agent_id`, `step_id`, `bundle`, `full`; the technique is named by the step bind,
not passed raw. A variant selector therefore lands on the **step bind** (activity schema) with the
standalone paths following.

## Canon homes that currently commit to the opposite reading

- **`alternate-ops-as-protocol-sequence`** (AP-124, `workflows/workflow-design/resources/anti-patterns.md:1598`):
  names "unnumbered `### spawn` / `### resume` / `### concurrent` under `## Protocol`" as the smell;
  its Fix sends variants to `## Rules` as named slices selected via `operation_kind`, "Callers Apply
  the selected rule section via the resolve map — they do not walk Protocol."
- **`numbered-protocol-phases`** (AP-108, `anti-patterns.md:1406`) and design principle
  *Phase by Sequenced Outcome*: numbered `### N. Title` = one phase per heading. Unaffected by the
  design — this stays the phase construct.
- **workflow-canonical §Protocol** (`workflows/meta/resources/workflow-canonical.md:51–57`):
  "a single ordered list of steps"; server renumbers at load.
- **schema-construct-inventory** Technique-Level row
  (`workflows/workflow-design/resources/schema-construct-inventory.md:70–71`): `protocol[]` ordered
  blocks; container `Initial`/`Final` wrap.

## The incumbent variant pattern (what AP-124's Fix built)

`workflows/meta/techniques/harness-compat/` is the built-out exemplar:

- `spawn-agent.md` / `spawn-concurrent.md` hold the I/O contract and a numbered *generic* protocol
  (resolve → dispatch → await).
- `resolve-harness-operation.md` maps `{harness_kind}` × `{operation_kind}` to a harness technique +
  a **Rules section name**; line 42 states outright that each harness technique exposes
  `spawn`/`resume`/`concurrent` as Rules sections, "**not sequenced Protocol phases**".
- `claude-code.md` (et al.) hold the per-harness recipes as Rules sections. These are *procedures*
  (imperative invoke steps) living under Rules, and their brace references — `{composed_prompt}`,
  `{description}`, `{session_index}` — are **contract-invisible**: `claude-code.md` declares no
  `## Inputs` at all.

This is the strongest evidence in both directions: the demand for caller-selected per-variant
procedure is real (real enough to engineer a Rules-based workaround), and the workaround's cost is
procedures without a contract-visible home.

## Guards

Nothing in the guard registry (`scripts/guards.ts`) checks protocol block structure, numbering, or
titles today (grep evidence: the only "protocol" hit is the unrelated `--json` finding-protocol
comment). Variant validation guards are pure additions with no existing guard to reconcile.
