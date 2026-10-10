# Guidelines

The rules this skill's files follow beyond the [skill guidelines](../../guidelines.md). Every revision follows both.

## Identity

- **Purpose and modes.**
  The entry point describes Work Designer's general work-design purpose. Each mode owns the scope and authority of its capability.

## SKILL.md Structure

- **Section order.**  Rules precedes Dependencies.

## Progressive Disclosure

- **Placement.**
  Keep shared purpose, mode selection and essential constraints in the entry point. Link conditional detail where the active mode needs it.
- **Reading boundaries.**
  Link the smallest complete section the caller needs, following the entry point's [linked-section rule](../SKILL.md#rules). Use whole-file links when the complete document is required, including the selected mode and revision guidelines.
- **Prerequisites.**
  The section or its calling guidance provides or explicitly links the context needed to use it, including conventions and mode authority. Split files when section routing still brings unrelated guidance into context.
- **Verification.**
  Every revision must trace a representative request through each affected mode's required file and section reads. Missing necessary context or loading unrelated modes, variants or commands fails this check. Assess the actual retrieval boundaries, including any explicit whole-document requirements.

## Titles

- **Title case.**
  Headings and template section headings use title case. Short words stay lowercase unless first or last: a, an, the, and, but, or, nor, for, as, at, by, in, of, on, to, up, with.

## Project Variants

- **Ownership.**
  The skill's purpose, procedures and dependencies are general. A selected variant owns its project's concrete settings; core guidance names individual projects only as examples.
- **Currency.**
  A variant's settings are checked against the project's current instructions and captured revisions. Counts, runtime versions, thresholds and branch pairings come from the sources that own them.
- **Separation.**
  General coverage criteria belong in the coverage guide. Concrete document homes, branch roles and validation selections belong in variants; each variant's executable commands live in its own commands file.

## Shared Planning

- **Location.**
  The planning guide owns location and naming rules for all modes. A variant supplies its project's root and naming convention; mode files reference the guide.
