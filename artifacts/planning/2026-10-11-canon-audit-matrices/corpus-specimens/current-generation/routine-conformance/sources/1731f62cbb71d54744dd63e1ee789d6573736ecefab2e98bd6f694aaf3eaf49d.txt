---
name: symbol-provenance
description: What counts as provenance for a symbol named in code or documentation, and how each class of symbol is verified.
metadata:
  version: 1.0.0
---

# Symbol Provenance

## Provenance

A symbol — type, trait, struct, function, method, constant, field — has provenance when one of three holds: it exists in the codebase and a search finds it, it exists in a declared dependency and the manifest declares that dependency, or the task under review creates and correctly defines it. A symbol with none of those is unverified, and it stays unverified until a search settles it rather than a pattern suggesting it.

This binds documents as much as code. Change files name symbols from the change they describe, architecture decision records name symbols from the architecture implemented, and test plans name symbols from the tests written. A trait planned but never implemented, a storage item that never existed, an extrinsic absent from the pallet, a field name renamed in prose alone — each is a document standing on a symbol that is not there.

## Verification

| Symbol class | What establishes provenance |
|---|---|
| New types/structs | Definition exists in committed code |
| New functions/methods | Implementation exists in committed code |
| New constants/fields | Declaration exists in committed code |
| Referenced existing symbols | A search confirms the symbol exists in the codebase |
| Symbols from dependencies | The manifest declares the dependency AND the symbol exists in that crate or package |
| Symbols in documentation | Every symbol named in docs, architecture decision records and change files exists in code |

An unverified symbol is searched for harder before it is reported — alternative spellings, alternative modules, git history — and then either resolves, or is recognised as something the task must create, or is surfaced as uncertain. Proceeding on the assumption is the one path closed off.
