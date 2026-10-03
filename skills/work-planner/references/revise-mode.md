# Revise Mode

Changes the skill itself: SKILL.md, its references, templates and scripts.

## Procedure

1. **Read the guidelines.**  Read both guidelines whole before the first edit.
2. **Understand the request.**
   - Interview the user until the change and its scope are clear.
   - Find every file the change touches: the rule's home, each file that cites it, and any script, docstring or test that states it.
3. **Work in a worktree.**
   Branch a worktree for the change, and commit each distinct change as its own commit.
4. **Revise.**
   - Make the change in the rule's one home, and link to it from every other file that needs it.
   - Write it to the guidelines' layout, prose, link and command rules as it is written, not in a later pass.
5. **Check against the guidelines.**
   Read every changed file against each section of both guidelines, and fix what departs:
   - The description, when the skill's reach changed;
   - One line per item, bold leads on their own line, and sub-bullets for discrete points;
   - Each rule stated once, and no description of replaced behaviour left anywhere;
   - Every command named by link to its spec in [commands.md](commands.md);
   - Every link and anchor resolving.
6. **Verify.**
   - [Run Tests](commands.md#run-tests) when a script, template or test changed.
   - Confirm SKILL.md's frontmatter still opens and closes with `---` and holds `name` and `description`.
7. **Deliver.**  Commit, push, and report what changed in each file.
8. **Revise the guidelines.**
   When the user states a new rule for how the skill is written, add it in the same change: to the [skill guidelines](../../guidelines.md) when it binds every skill, or to this skill's [guidelines](guidelines.md) when it binds this skill alone.

## Rules

- **Complete.**
  A change that departs from the [skill guidelines](../../guidelines.md) or this skill's [guidelines](guidelines.md) is not complete.
