# Revise Mode

Changes the skill itself: SKILL.md, its modes, artifacts, references and scripts.

**Runs in:** the project checkout.

Follow the [Procedure](#procedure "operation"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

## Prerequisites

Read these files first.

- [Skill Guidelines](../../guidelines.md)
- [Guidelines](../guidelines.md)

## Procedure

### 1. Read the Guidelines

Read the [shared skill guidelines](../../guidelines.md) and [skill guidelines](../guidelines.md) whole before the first edit.

### 2. Understand the Request

- Interview the user, as an [Interview](../guidelines.md#modes), until the change and its scope are clear.

- Find every file the change touches: the rule's home, each file that cites it, and any script, docstring or test that states it.

### 3. Work in a Worktree

- Branch a worktree for the change.

- Commit each distinct change as its own commit.

### 4. Revise

- Make the change in the rule's one home.

- Link to it from every other file that needs it.
- Write it to the guidelines' layout, prose, link and command rules as it is written, not in a later pass.
- When the user states a new writing rule, add it to the applicable shared or skill-specific guidelines before validation and delivery.

### 5. Check Against the Guidelines

- Read every changed file against the [shared skill guidelines](../../guidelines.md) and [skill guidelines](../guidelines.md), checking:

- The description, when the skill's reach changed.
- One line per item, bold leads on their own line, and the declared step and detail structure for each family.
- Each rule stated once, and no description of replaced behaviour left anywhere.
- Every command inside the step that runs it.
- Every link and anchor resolving.
- [Progressive disclosure](../../guidelines.md#progressive-disclosure), including complete common sections and caller prerequisites.
- Fix each departure.

### 6. Verify

- Follow [Run Tests](#run-tests "operation") when an executable script, its consumed template or a test changed.
- When SKILL.md changes, confirm its frontmatter opens and closes with `---` and holds `name` and `description`.
- Follow [Check Skill Files](#check-skill-files "operation") for every affected skill.
- Follow [Compare Section Bodies](#compare-section-bodies "operation") when the change moves a section between files, and read each section it reports as added, removed or differing.
- Apply [disclosure verification](../../guidelines.md#disclosure-verification) with the skill's [representative scenarios](../guidelines.md#progressive-disclosure).
- Resolve every required file, command and heading without an implicit external dependency.

### 7. Deliver

- Commit.
- Push.
- Report what changed in each file.

### Run Tests

Runs the skill's script tests.

#### 1. Run Skill Tests

Run the following command in the [workspace checkout](#workspace "input").

<big><pre>
cd "[**<workspace>**](#workspace)/skills/work-planner" && "[**<workspace>**](#workspace)/scripts/sbx" python3 -m unittest discover -s test
</pre></big>

#### 2. Provide Test Result

Provide [Test Result](#test-result "output") to the requester.

### Check Skill Files

Checks the affected skill's files against the rules the shared skill guidelines state.

#### 1. Check Affected Skills

Run the following command in the [workspace checkout](#workspace "input") for the selected [Skill Directory](#skill-directory "input"); repeat the skill argument for additional affected skills.

<big><pre>
cd "[**<workspace>**](#workspace)" && "[**<workspace>**](#workspace)/scripts/sbx" python3 skills/scripts/check_skill_files.py "[**<skill-directory>**](#skill-directory)"
</pre></big>

**Example:** Work Planner in the selected checkout.

<big><pre>
cd "[**<workspace>**](#workspace)" && "[**<workspace>**](#workspace)/scripts/sbx" python3 skills/scripts/check_skill_files.py skills/work-planner
</pre></big>

#### 2. Provide Skill Check Result

Provide [Skill Check Result](#skill-check-result "output") to the requester.

### Compare Section Bodies

Compares every third-level section's body between the change's base and its head, so a section damaged in a move is reported.

#### 1. Compare Changed Sections

- Run the following command in the [workspace checkout](#workspace "input") for [Skill Directory](#skill-directory "input"), comparing [Base](#base "input") with [Head](#head "input").

- A relative link target is compared by its fragment alone, so a retargeted link is no difference.
- Each section is reported as identical, moved, added, removed or differing, with a diff of each differing body and the section count at each revision.
- Exit 1 means a section was added, removed or differs.

<big><pre>
cd "[**<workspace>**](#workspace)" && "[**<workspace>**](#workspace)/scripts/sbx" python3 skills/scripts/check_skill_files.py --compare "[**<base>**](#base)" "[**<head>**](#head)" "[**<skill-directory>**](#skill-directory)"
</pre></big>

#### 2. Provide Section Comparison

Provide [Section Comparison](#section-comparison "output") to the requester.

## Outcomes

- **The skill matches the request.**
  The user has the change they asked for in the skill, committed and pushed.
- **The guidelines hold.**
  The change agrees with the guidelines, and a new rule the user stated for how the skill is written is part of that change.

## Fields

### Workspace

Checkout containing the installed skill, its scripts and tests.

### Skill Directory

Affected skill directory. Comparison takes each skill directory the move touches.

### Base

Base revision of the section comparison.

### Head

Head revision of the section comparison.

### Test Result

The test output and exit status, including any skipped checks.

### Skill Check Result

The checker output, finding count and exit status for the selected skill directories.

### Section Comparison

The section counts, comparison classifications and differences; exit 1 indicates an added, removed or differing section.
