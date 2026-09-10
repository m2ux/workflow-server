# Sources

Primary and complementary sources for the plain-language capability, and how each maps into the delivered definitions.

## Primary: ISO 24495-1:2023

**Source file:** `/home/mike1/Incoming/ISO_24495-1_2023_en.md`  
**Title:** Plain language — Part 1: Governing principles and guidelines  
**Home in the capability:** `workflows/plain-language/resources/plain-language-standard.md`

The four governing principles become the resource's section structure:

| Principle | Resource section | Consumed by |
|-----------|------------------|-------------|
| 1 Relevant — readers get what they need | `#relevance` | `intake-and-profile` (pre-writing) |
| 2 Findable — readers can easily find what they need | `#findability` | `draft-document` |
| 3 Understandable — readers can easily understand what they find | `#understandability` | `draft-document` |
| 4 Usable — readers can easily use the information | `#usability` | `evaluate-document`, `complete-checklist` |

The Annex B sample checklist becomes the creation guide `iso-checklist.md`, walked against the final draft before delivery. The standard's note that the principles are interdependent and iterative (not a linear process) is why evaluation is a loop rather than a single terminal pass, and why relevance/findability/understandability remain cited during evaluation rather than treated as finished upstream stages.

The ISO distinction between **plain language** and **simplified language** is preserved: the capability targets plain language (audience-adaptive); ASD-STE100 is an optional overlay, not the default register.

## Complementary: ASD-STE100

**Sources consulted:** [asd-ste100.org](https://www.asd-ste100.org/), ASD Europe STE overview, Wikipedia summary of Simplified Technical English (Issue 9, January 2025 context).  
**Home in the capability:** `workflows/plain-language/resources/asd-ste100.md`

STE contributes:

- Writing-rule discipline (approved verb forms, one meaning / one part of speech, active voice, short sentences)
- Procedure vs description text typing
- Approved-word discipline as a *method* (not the licensed ~900-word dictionary itself)

The overlay rule: STE tightens understandability at word and sentence level when `{controlled_language}` is true; the ISO base still governs relevance, findability, structure, audience fit, and evaluation. The full dictionary remains a licensed, versioned artifact — runs that need the authoritative word list consult the current ASD-STE100 issue rather than a copy in this repo.

## Complementary: Digital.gov / federal plain-language guidance

**Sources consulted:** [Digital.gov plain language guide series](https://digital.gov/guides/plain-language) (PlainLanguage.gov content migrated), Plain Writing Act framing, principles of writing and testing for understanding.

Used to corroborate — not duplicate — the ISO base:

- Write for the specific audience (not "dumb down for everyone")
- Active voice, clear organization, lists, topic sentences
- Test for understanding as part of the work, not as an optional afterthought

These reinforce Principle 4's evaluation stance and Principle 1's audience-first profile without introducing a second criteria home.

## What was deliberately not copied

- The full ISO text and Annex figures — distilled as actionable criteria, not a licensed reprint
- The STE dictionary word list
- Accessibility standards named by ISO as out of scope for Part 1 (WCAG, EN 301 549) — noted as related, not encoded here
- This repo's issue/PR plain-language mandate ([CLAUDE.md](../../../../CLAUDE.md) / [#395](https://github.com/m2ux/workflow-server/issues/395) style) — that mandate is a consumer of plain language for a specific artifact class; this capability is the general engine those consumers can bind
