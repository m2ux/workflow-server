---
name: writing-register
description: The sentence-level and table-level register every artifact written for a person holds to. A creation guide owns an artifact's sections and budget; this register owns the prose and tables inside them.
---

# Artifact Writing Register

The register for an artifact whose declared audience is a person. A creation guide owns which sections that artifact has, how long it may run, and which form it prefers; this register owns the sentences and tables inside them. The reader is a technical one — precise terms are welcome, ceremony and padding are not.

## Prose

Every prose passage holds to one register:

- **Plain language.** The word a maintainer would use, not the more formal synonym.
- **Short sentences.** One clause carrying one claim. A sentence needing a semicolon is two sentences.
- **Claim first.** The sentence opens with what is true; any qualification follows it.
- **One hedge per claim.** "may, under some conditions, potentially" states less than "may".
- **Specific and quantified.** Name the thing, and give the number wherever a number is known. "various improvements" and "might be better" carry nothing a reader can act on.
- **Consequences stated.** A cost, risk, or regression the passage knows about is written down rather than left for the reader to infer.
- **At most one code symbol and one location per sentence.** A claim needing three symbols and four line numbers is a section of its own, cited by link.

## Tables

A table is the right form for enumerable facts: one row per item, the same fields on every row, each cell holding a value a reader compares across rows. Anything else reads better as sentences.

- **Few columns.** A column earns its width by being compared across rows. A column whose cells all carry the same value, or that one row alone populates, is a sentence beneath the table.
- **No prose inside a cell.** A cell holds a value, a short label, or a link. Sentences in a cell make a section wearing a table's clothes, and the row grid stops helping anyone read it.
- **No table where a sentence does the job.** Two rows carrying one field each is a sentence.
