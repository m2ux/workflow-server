# Proposed Correction

In `skills/work-planner/guidelines.md`, under `Procedure` → `Dependent instructions` (line 32), replace only the first sentence with:

> Put instructions that handle an action's specific output immediately after that action, naming that action's returned value and any condition that selects those instructions.

Keep the remaining two sentences. This ties the value to its producing action and the condition to the instructions it selects, while retaining immediate placement, flush detail and explicit object names. The rule label and its `rules.json` review mapping stay valid.

# Proposed Validation

- Review the resulting paragraph against the complete shared and Work Planner guidelines. Confirm the adjacent Separate actions, List introductions and Branch headers rules still agree: an action-specific condition stays with its action; a shared condition governs its following list; output handling names the producer's value.
- Read a representative step with two producing actions and distinct returned values. Check that each conditional instruction names the intended value and immediately follows its producer. Include a shared condition above multiple actions and an unconditional output-handling instruction so the wording preserves both cases.
- Run the affected skill's structural check after applying the wording: from the installed workspace, use its absolute `scripts/sbx` path to run `python3 skills/scripts/check_skill_files.py skills/work-planner`. Inspect any findings; a passing structural check alone does not establish semantic clarity because this rule maps to `review`.
- Trace the bounded Revise request through the entry point, Rules, Conventions, Revise mode and both required whole-file guidelines. Confirm required context remains complete. No links, headings, commands, templates, executable code or reading routes change; section comparison, script tests, frontmatter checks and live tests of changed reading paths are not selected for this sentence-only correction.

These are prepared checks, not executed validation of a changed skill. This review executed source retrieval and targeted searches only. No source was edited and no validation command was run.

Blocker: none for the requested proposal. Applying and validating the correction is outside this read-only request.
