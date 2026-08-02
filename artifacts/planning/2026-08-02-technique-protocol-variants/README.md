# Technique protocol variants: interpretation model investigation & design — August 2026

> Investigation + design · Created 2026-08-02 · **Status:** Complete (design agreed; implementation tracked in the host issue)

## 🎯 Executive Summary

One technique file currently holds exactly one protocol; mutually exclusive alternatives of the
same operation (spawn/resume/concurrent, create/update) have no sanctioned Protocol home — the
catalog (`alternate-ops-as-protocol-sequence`) routes them into named **Rules** slices selected by
a resolver, which strands step-by-step procedures under Rules with contract-invisible input
references (`harness-compat/claude-code.md` uses `{composed_prompt}` while declaring no Inputs).
This session investigated feasibility of, then designed, **protocol variants**: under the single
`## Protocol` site, unnumbered `### <slug>` sections form a caller-selected variant set, numbered
`### N.` sections remain phases of one protocol, and sectionless bodies remain the single op shape.
Selection is **mandatory and fail-closed both ways** — that strictness is what makes the in-section
discriminator safe (no silent phase↔variant flip survives; every mistake fails at parse or first
use). Variants qualify only when they share the file's contract: each may require a clean **subset
of inputs**, must produce **all outputs**, and obeys **all rules**. Corpus survey of all 554
technique files shows adoption is unusually cheap: 0 mixed files, 0 `Initial`/`Final` usage, and
exactly 1 unnumbered section in existence (`update-pr::template-selection` — selection policy
already owed to Rules under AP-124), so strict validation lands with zero migration. Key parser
fact: the loader currently strips `### N.` ordinals at load, so the numbered/unnumbered distinction
does not survive to the wire today — the change records it and delivers the selected variant with
provenance (`protocol_variant` + `protocol_variants_available`).

## 📄 Documents

| # | Document | Contents |
|---|----------|----------|
| 1 | [01-current-model-and-machinery.md](01-current-model-and-machinery.md) | Parse model (`protocolBlocksFromBody`, ordinal stripping and *why* it exists — renumber-on-compose); parse-time strictness precedents; `Initial`/`Final` wrap + parent-only container blocks; the `::` resolution chain (nested-op → rule → rule-group) and why variant selection must not join it; `get_technique` surface; the four canon homes that currently commit to single-sequence; the incumbent Rules-slice variant pattern and its contract-invisibility cost; guard coverage (none on protocol structure) |
| 2 | [02-corpus-survey.md](02-corpus-survey.md) | 554-file shape census (300 numbered / 141 flat-list / 92 none / 20 prose / **1 unnumbered / 0 mixed / 0 wrap usage**); close reading of the single instance (`update-pr::template-selection` — policy, not a variant); where variance actually lives today (harness-compat Rules slices, mode-input enums); zero-migration conclusion and the closing validation window |
| 3 | [03-design.md](03-design.md) | The agreed model: three-way interpretation rule on one `## Protocol` site; fail-closed resolution contract; variant qualification (input subset / all outputs / all rules / select-exactly-one); wire shape (selected blocks + provenance fields); dedicated selector field (step bind `protocol:`), not `::`; parse-time validation set + new guards; alternatives considered and rejected (named-sections-alone, `## Protocols` H2 split, optional selection, formalised Rules slices); open decisions |
| 4 | [04-change-inventory.md](04-change-inventory.md) | Per-file server changes with line refs; four guard additions; canon amendments (AP-124 rewrite scope, workflow-canonical §Protocol, construct-inventory row, design-principles boundary sentence); corpus changes (1 refile owed anyway; harness-compat as optional first consumer); sequencing note (land strict validation first); accepted risks |
| — | [survey-protocols.py](survey-protocols.py) | Reproducible corpus census script (fence-aware, container-flagged) |

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue (implementation) | [#395](https://github.com/m2ux/workflow-server/issues/395) |
| Governing anti-pattern (to be rewritten) | `workflows/workflow-design/resources/anti-patterns.md` — `alternate-ops-as-protocol-sequence` (AP-124); `numbered-protocol-phases` (AP-108) unchanged |
| Ontology home (to be amended) | `workflows/meta/resources/workflow-canonical.md` §Protocol |
| Incumbent variant pattern | `workflows/meta/techniques/harness-compat/` (`resolve-harness-operation.md:42`, `claude-code.md`, `spawn-agent.md`) |
| The one corpus instance | `workflows/work-package/techniques/update-pr/TECHNIQUE.md` (`### template-selection`) |
| Key server files | `src/loaders/markdown-technique-loader.ts`, `src/loaders/technique-loader.ts`, `src/schema/technique.schema.ts`, `src/schema/activity.schema.ts`, `src/tools/resource-tools.ts`, `src/utils/binding-provenance.ts` |
