# Corpus survey: protocol section shapes across all technique files

Method: `survey-protocols.py` (in this folder) walks every `*.md` under a `techniques/` path segment
in all 16 workflows, extracts the `## Protocol` section (fence-aware), classifies its `###`
sub-headings as numbered (`\d+[.)]` prefix), reserved (`Initial`/`Final`), or unnumbered, and
records flat-list/prose bodies with no sections. Run 2026-08-02.

## Results — 554 technique files

| Protocol shape | Count | Notes |
|---|---|---|
| Numbered `### N. Title` blocks | 300 | The AP-108 / *Phase by Sequenced Outcome* phase shape |
| Flat list, no `###` sections | 141 | The "op shape" — single untitled block (`atlassian-operations`, `cargo-operations`, `workflow-engine`, `manage-git`, …) |
| No `## Protocol` section | 92 | Container/contract files and index-only `TECHNIQUE.md`s |
| Prose only, no sections | 20 | Mostly `prism-evaluate` ops |
| **Unnumbered `###` sections** | **1** | See below |
| **Mixed numbered + unnumbered** | **0** | — |
| Files using `Initial`/`Final` blocks | **0** | Wrap machinery is live code with an unused corpus |

## The single unnumbered instance is not a variant

`workflows/work-package/techniques/update-pr/TECHNIQUE.md` — a **container** index whose Protocol
holds one unnumbered block, `### template-selection`. Close reading:

- It is selection *policy* (which PR body template `render.md` uses), keyed off the input enum
  `pr_template_variant` (`initial` | `final`) and `{is_review_mode}` — "Callers bind
  `{pr_template_variant}` at the step."
- It has no produce/transform/persist outcome of its own, which makes it exactly the shape
  `alternate-ops-as-protocol-sequence` (AP-124) already files under "standing policy … move into
  `## Rules`". Refiling it under Rules is owed under the *current* catalog, independent of the
  variant design.
- Being a container block, it is parent-only-delivered today (never composed into the child ops).

Conclusion: the corpus contains **zero** true instances of the variants-as-unnumbered-sections
shape. The "existing instances" impression comes from the 161 flat-list/prose op protocols — which
have an un-numbered protocol *body* but **no sections**, and which the design's three-way rule
(no sections → single anonymous protocol) leaves untouched.

## Where variance actually lives in the corpus today

Two existing encodings of "one capability, caller-selected variant":

1. **Rules slices selected by a resolver** — `meta/techniques/harness-compat/`:
   `spawn`/`resume`/`concurrent` as Rules sections on each harness file, selected via
   `resolve-harness-operation` (`operation_kind` input → Rules section name). Procedures living
   under Rules; brace refs contract-invisible (no declared Inputs on the harness files). The
   two-dimensional case (harness × operation) — the operation dimension is the natural first
   consumer of protocol variants.
2. **Mode inputs + selection mapping** — `update-pr`'s `pr_template_variant` enum input steering a
   single op's behaviour.

Both are workarounds for the same gap: Protocol has no variant construct.

## Migration consequence

Adopting the variant interpretation requires **zero** corpus rewrites for conformance:

- 300 numbered files: already the phase shape — unchanged meaning.
- 141 + 20 sectionless files: single anonymous protocol — unchanged meaning.
- 0 mixed files: the mixed-shape parse error can be introduced with no migration window.
- 1 file (`update-pr::template-selection`): refile under Rules — already owed under AP-124.
- 0 files use `Initial`/`Final`: reserving those titles as non-variant-eligible costs nothing.

The timing note matters: with zero mixed and zero multi-unnumbered files, strict validation
(mixed = hard parse error) is free **today**. That window closes the first time someone authors
such a file under the current permissive parser.
