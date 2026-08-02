# Issue #395: Protocol variants: one technique, multiple caller-selected sub-protocols under ## Protocol

Captured verbatim on 2026-08-02 when the issue was consolidated into the protocol-structure epic.

---

## Summary

Today a technique file holds exactly one protocol. When one capability has several mutually exclusive ways to run it — spawn vs resume vs concurrent dispatch, create vs update — we have no proper home for the alternatives. The current workaround stores each alternative as a named Rules section that a resolver picks at runtime (the `harness-compat` pattern). That works, but it puts step-by-step procedures under Rules, and the inputs those procedures use are invisible to the technique's declared contract — `claude-code.md` references `{composed_prompt}` and `{session_index}` without declaring any inputs at all.

This issue introduces **protocol variants**: one technique file may carry several named sub-protocols under its single `## Protocol` section, and the caller says which one it wants.

## How it works

The meaning of `## Protocol` is decided by the shape of its sub-sections:

- **No sub-sections** (a flat step list) → one protocol. Unchanged.
- **Numbered sub-sections** (`### 1. Title`) → phases of one protocol. Unchanged.
- **Unnumbered sub-sections** (`### spawn`, `### resume`) → a set of named variants. New.
- **A mix of numbered and unnumbered** → the file fails to load, with a clear error.

Selection is mandatory and strict, in both directions:

- A technique **with** variants must be called with a variant name, or resolution fails (the error lists the available names).
- A technique **without** variants resolves by filename exactly as today; passing a variant name to it fails.

The strictness is the safety mechanism: forgetting a number (or adding one by mistake) can never silently change what a technique means — every mistake fails loudly at load or at first use. The agent never receives more than one protocol: delivery contains the selected variant's steps plus a note of which variant was chosen and which others exist.

## What qualifies as a variant

Variants must be true alternatives of the same operation, sharing the file's contract:

- Each variant may use a **subset** of the declared inputs (spawn and resume legitimately need different values).
- Every variant must produce **all** declared outputs — downstream steps must not care which variant ran.
- Every variant obeys **all** the technique's rules.
- A caller picks exactly **one** per invocation. If two of them ever run in sequence, they are separate techniques bound as separate steps, not variants.

## Why now is cheap

A survey of all 554 technique files (script and full results in the planning folder) found the corpus already conforms:

- 300 files use numbered phase sections, 161 use flat lists — all keep their current meaning unchanged.
- **Zero** files mix numbered and unnumbered sections, and zero use the reserved `Initial`/`Final` wrap blocks, so the strict load-time validation can land with **no migration**.
- Exactly **one** file has an unnumbered section (`work-package/techniques/update-pr/TECHNIQUE.md` `### template-selection`), and it is selection policy that the anti-pattern catalog already says belongs under Rules — a one-file refile that is owed regardless.

The parser currently strips the `1.` prefix from section titles at load, so numbered and unnumbered sections become indistinguishable on the wire. That was fine while numbering carried no meaning; under this change the loader records the distinction and the delivery includes it.

## Scope of change

- **Server**: loader records the section kind and validates shape; schema carries the variant set; composition selects fail-closed; activity step binds gain a `protocol:` selector field (selection deliberately does **not** ride the `::` path, which already resolves ops and rules).
- **Guards**: new checks — every bind naming a variant technique carries a valid selector; each variant's brace references stay within declared inputs; every declared output appears in every variant.
- **Canon**: rewrite `alternate-ops-as-protocol-sequence` (true variants become sanctioned as unnumbered sections; standing policy still goes to Rules), amend workflow-canonical's Protocol section and the schema construct inventory, add one boundary sentence to the design principles.
- **Corpus**: refile the one `update-pr` block under Rules. Optionally migrate the `harness-compat` spawn/resume/concurrent Rules slices as the first real consumer — their procedures regain a contract-visible home.

## Acceptance criteria

- [ ] Loader parses the three shapes, rejects mixed/malformed files loudly, and preserves the numbered/unnumbered distinction through to delivery.
- [ ] Resolution is fail-closed both ways; errors list available variant names.
- [ ] Delivered shape: selected variant's steps only, plus selected-name and available-names fields; non-variant techniques are wire-identical to today.
- [ ] Step binds can carry the variant selector; guard verifies every bind site statically.
- [ ] Variant qualification lints (input subset, output completeness) in the guard registry.
- [ ] Canon homes amended in the same change (AP-124 rewrite, workflow-canonical, construct inventory, design-principles boundary sentence).
- [ ] `update-pr::template-selection` refiled under Rules.
- [ ] Survey reproduces zero regressions: 554 files, no mixed shapes, all existing files load with unchanged meaning.

## Investigation detail

Full record — current machinery trace with file:line evidence, 554-file corpus survey, the agreed design with rejected alternatives, and the change inventory:
**[engineering/artifacts/planning/2026-08-02-technique-protocol-variants](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-technique-protocol-variants)**

