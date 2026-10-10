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
  Design independently usable sections for the entry point's [linked-section rule](../SKILL.md#rules). Make required conventions and other prerequisites explicit. Split files when section routing still brings unrelated guidance into context.
- **Verification.**
  Trace a representative request through each affected mode's required file and section reads. Preserve necessary context while avoiding unrelated modes, variants and commands; assess the actual retrieval boundaries, not an assumed whole-file load.

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
