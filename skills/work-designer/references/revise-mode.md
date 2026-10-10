# Revise Mode

Changes the skill itself: its entry point, mode files, shared guides, project variants, commands and templates.

## Procedure

1. **Read the guidelines.**
   Read the [skill guidelines](../../guidelines.md) and this skill's [guidelines](guidelines.md) whole before the first edit.
2. **Understand the request.**
   Resolve missing decisions with the user until the change and its scope are clear. Find the rule's home, its consumers, and any variant, script, template or test that states it. Locate a shared [planning record](planning.md) when the revision needs planning artifacts.
3. **Work in a worktree.**
   [Create Skill Worktree](commands.md#create-skill-worktree) for the change.
4. **Revise.**
   Make the change in its authoritative home and update every consumer. Apply the guidelines' layout, prose, link and command rules while writing.
5. **Check the guidelines.**
   Read each changed file against both guidelines: discovery description, mode summaries, bold leads, one line per item, single rule homes, command links and resolved file links and anchors.
6. **Verify.**
   - Confirm frontmatter opens and closes with `---`, contains the required fields and names the skill's folder.
   - [Run Skill Checks](commands.md#run-skill-checks), including applicable existing tests and link checks.
   - Walk a representative request through each changed decision. For variant changes, check selection for a matching project, another project and an ambiguous match. For Review changes, include a missing-evidence case and confirm the report preserves the gap.
7. **Deliver.**
   [Commit Skill Changes](commands.md#commit-skill-changes) for each distinct change, then [Push Skill Branch](commands.md#push-skill-branch). When requested, [Open Skill Pull Request](commands.md#open-skill-pull-request). Report the files, validation and delivery link.
8. **Revise the guidelines.**
   When the user states an authoring rule, put it in the [skill guidelines](../../guidelines.md) if it binds every skill, or this skill's [guidelines](guidelines.md) if it binds only this one.

## Rules

- **Complete.**
  A revision is complete when it conforms to both guidelines, its links resolve and applicable checks pass.
- **Scope.**
  This mode changes the skill; an example integration is reviewed only as far as needed to validate the requested revision.
