# Revise Mode

Changes the skill itself: SKILL.md, its modes, artifacts, references and scripts.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

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
- Every invocation in its named Commands specification, with caller links and command-owned I/O contracts.
- Every link and anchor resolving.
- [Progressive disclosure](../../guidelines.md#progressive-disclosure), including complete common sections and caller prerequisites.
- Fix each departure.

### 6. Verify

- Run [Run Tests](#run-tests "ƒ") when an executable script, its consumed template or a test changed.
- When SKILL.md changes, confirm its frontmatter opens and closes with `---` and holds `name` and `description`.
- Run [Check Skill Files](#check-skill-files "ƒ") for every affected skill.
- Run [Compare Section Bodies](#compare-section-bodies "ƒ") when the change moves a section between files, and read each section it reports as added, removed or differing.
- Apply [disclosure verification](../../guidelines.md#disclosure-verification) with the skill's [representative scenarios](../guidelines.md#progressive-disclosure).
- Resolve every required file, command and heading without an implicit external dependency.

### 7. Deliver

- Commit.
- Push.
- Report what changed in each file.

## Outcomes

- **The skill matches the request.**
  The user has the change they asked for in the skill, committed and pushed.
- **The guidelines hold.**
  The change agrees with the guidelines, and a new rule the user stated for how the skill is written is part of that change.

## Commands

### Run Tests

Run the skill's script tests and provide [Test Result](#test-result "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")/skills/work-planner" && "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 -m unittest discover -s test
</pre></big>

### Check Skill Files

Check the affected skill's files against the rules the shared skill guidelines state and provide [Skill Check Result](#skill-check-result "●") to the requester.

Repeat the skill argument for additional affected skills.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/scripts/check_skill_files.py "[**&lt;skill-directory&gt;**](#skill-directory "○")"
</pre></big>

### Compare Section Bodies

Compare every third-level section's body between the change's base and its head to identify sections damaged in a move, and provide [Section Comparison](#section-comparison "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/scripts/check_skill_files.py &#92;
  --compare "[**&lt;base&gt;**](#base "○")" "[**&lt;head&gt;**](#head "○")" "[**&lt;skill-directory&gt;**](#skill-directory "○")"
</pre></big>

- A relative link target is compared by its fragment alone, so a retargeted link is no difference.
- Each section is reported as identical, moved, added, removed or differing, with a diff of each differing body and the section count at each revision.
- Exit 1 means a section was added, removed or differs.

## Fields

### Workspace

Checkout containing the installed skill, its scripts and tests.

### Skill Directory

Affected skill directory. Comparison takes each skill directory the move touches. eg `skills/work-planner`

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
