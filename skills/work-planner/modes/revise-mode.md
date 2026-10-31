# Revise Mode

Changes the skill itself: SKILL.md, its modes, artifacts, references and scripts.

## Prerequisites

Read these files first.

- [Skill Guidelines](../../guidelines.md)
- [Guidelines](../guidelines.md)

## Procedure

The main path meets [Outcomes](#outcomes).

1. **Read the guidelines.**
   Read the [shared skill guidelines](../../guidelines.md) and [skill guidelines](../guidelines.md) whole before the first edit.
2. **Understand the request.**
   Interview the user, as an [Interview](../guidelines.md#modes), until the change and its scope are clear.
   - Find every file the change touches: the rule's home, each file that cites it, and any script, docstring or test that states it.
3. **Work in a worktree.**
   Branch a worktree for the change.
   - Commit each distinct change as its own commit.
4. **Revise.**
   Make the change in the rule's one home.
   - Link to it from every other file that needs it.
   - Write it to the guidelines' layout, prose, link and command rules as it is written, not in a later pass.
   - When the user states a new writing rule, add it to the applicable shared or skill-specific guidelines before validation and delivery.
5. **Check against the guidelines.**
   Read every changed file against the [shared skill guidelines](../../guidelines.md) and [skill guidelines](../guidelines.md), checking:
   - The description, when the skill's reach changed.
   - One line per item, bold leads on their own line, and sub-bullets for discrete points.
   - Each rule stated once, and no description of replaced behaviour left anywhere.
   - Every command linked to its operation section.
   - Every link and anchor resolving.
   - [Progressive disclosure](../../guidelines.md#progressive-disclosure), including complete common sections and caller prerequisites.
   - Fix each departure.
6. **Verify.**
   - Run [Run Tests](#run-tests) when an executable script, its consumed template or a test changed.
   - When SKILL.md changes, confirm its frontmatter opens and closes with `---` and holds `name` and `description`.
   - Run [Check Skill Files](#check-skill-files) for every affected skill.
   - Apply [disclosure verification](../../guidelines.md#disclosure-verification) with the skill's [representative scenarios](../guidelines.md#progressive-disclosure).
   - Resolve every required file, command and heading without an implicit external dependency.
7. **Deliver.**
   - Commit.
   - Push.
   - Report what changed in each file.

## Outcomes

- **The skill matches the request.**
  The user has the change they asked for in the skill, committed and pushed.
- **The guidelines hold.**
  The change agrees with the guidelines, and a new rule the user stated for how the skill is written is part of that change.

## Operations

### Run Tests

Runs the skill's script tests.

**Inputs:** Workspace checkout containing the installed skill and its tests.

```bash
cd "<workspace>/skills/work-planner" && "<workspace>/scripts/sbx" python3 -m unittest discover -s test
```

### Check Skill Files

Checks the affected skill's Markdown structure and links.

**Inputs:** Workspace checkout and affected skill directory; repeat the skill argument for additional affected skills.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/scripts/check_skill_files.py "<skill-directory>"
```

**Example:** Work Planner in the selected checkout.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/scripts/check_skill_files.py skills/work-planner
```
