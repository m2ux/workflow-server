# Deferred items

Explicit non-goals of this change, and follow-ups that remain open.

## Out of this PR

- **Main-repo submodule pointer bump.** Definitions live on the `workflows` branch via PR #431. Pointing `main`'s `workflows` gitlink at `6036456c` (or later) is a separate chore when the PR merges, if and when that bump is wanted.
- **Full ASD-STE100 dictionary.** The overlay records writing-rule and approved-word *discipline*; the licensed word list is not vendored.
- **Accessibility encoding (WCAG / EN 301 549).** ISO 24495-1 names these as related and out of Part 1's scope; they are not encoded here.
- **Repo-specific issue/PR plain-language mandate as a bound consumer.** The capability is domain-general. Wiring this repo's issue/PR writing path to `plain-language::*` ops is a later consumer change.

## Possible follow-ups

- **First real consumer bind.** Pick one high-traffic path (for example stakeholder overview, PR body composition, or a docs workflow) and bind `plain-language::evaluate-document` or `draft-document` from an activity step rather than local prose.
- **Reader involvement method card.** ISO 5.4.3 ranges from small interviews to usability testing; the evaluate activity records whether readers were involved but does not yet prescribe method selection by severity.
- **Outcome measurement stubs.** ISO 5.4.4 asks for periodic re-evaluation and outcome measures for long-lived documents; no periodic-revisit activity is in v1.
- **Move the technique group under `meta/`** if cross-workflow bind volume justifies a shared home separate from the authoring workflow.
