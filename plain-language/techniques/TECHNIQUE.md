---
metadata:
  version: 1.0.0
---

## Capability

Shared inputs and domain invariants for every plain-language operation in this group.

## Inputs

### document_profile

*(optional)* The settled reader, purpose, context, and content selection the operation works to (ISO 24495-1 5.1). Author and rewrite operations require it; intake produces it.

### controlled_language

*(optional)* Default `false`. When `true`, the operation applies the [ASD-STE100 overlay](../resources/asd-ste100.md) over the ISO 24495-1 base for technical documentation.

## Rules

### reader-governs

Every drafting and evaluation decision cites the reader profile and the governing guideline from [plain-language-standard](../resources/plain-language-standard.md), not the writer's preference. A choice that cannot name its reader and guideline is not settled.

### cite-dont-restate

Operations cite the relevant section of [plain-language-standard](../resources/plain-language-standard.md) or [asd-ste100](../resources/asd-ste100.md); they do not restate the guidelines in protocol prose.

### overlay-not-replacement

The ASD-STE100 overlay tightens understandability for technical documentation; it never replaces the ISO base's relevance, findability, and evaluation guidelines. Where the two conflict, the stricter STE rule wins at the word and sentence level and the ISO base still governs structure, audience fit, and evaluation.
