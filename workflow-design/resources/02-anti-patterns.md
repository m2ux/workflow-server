# Anti-Patterns

Patterns explicitly prohibited during workflow creation and modification. Derived from analysis of 175+ historical sessions across two projects.

---

## Structural Anti-Patterns

1. **"Let me just inline that"** — No content embedding in parent files. Activities, skills, and resources live in their own files.

2. **"Let me adjust the schema to match"** — The schema is a fixed constraint. Fix content to conform to the schema, never the reverse.

3. **"I'll fix the rest later"** — No partial implementations. The scope manifest must be fully addressed before committing.

4. **"I'll name it [new_thing]"** — No new naming conventions without searching for existing ones and getting user approval.

## Interaction Anti-Patterns

5. **"Skip/combine these checkpoints"** — Each checkpoint is atomic and independent. Never collapse multiple decisions into one.

6. **"The user probably means..."** — No assumption-based execution. If uncertain, ask.

7. **"Done!"** (without scope re-verification) — Completion requires checking every item in the scope manifest.

8. **"Here are three questions..."** — One question per message, always.

## Schema Expressiveness Anti-Patterns

9. **"Ask the user whether to proceed"** (as prose) — Use a `checkpoint` with `options` and `effects`.

10. **"Repeat this for each item"** (as prose) — Use a `loop` with `type: "forEach"` and `over`.

11. **"If X then do A, otherwise B"** (as prose) — Use a `decision` with `branches` and `conditions`.

12. **"This produces a report"** (buried in description) — Use an `artifact` with `id`, `name`, `location`.

13. **"Track whether the user approved"** (implicit) — Use a `variable` with `type` and `defaultValue`, wired to checkpoint `effects`.

14. **"In fast mode, skip the research steps"** (as a rule) — Use a `mode` with `skipActivities` and `modeOverrides`.

15. **"First load the workflow, then get the activity"** (as prose) — Use the skill's `protocol` with step-keyed imperative bullets.

16. **"This skill needs a file path"** (buried in description) — Use skill `inputs[]` with `id` and `description`.

## Execution Anti-Patterns

17. **"I'll just start implementing"** — Present approach and receive confirmation before any modification.

18. **"Here's what I recommend..."** (without doing it) — Recommendations must be followed by implementation. Analysis without action is incomplete.

19. **"The agent must never do X"** (as rule text only) — Critical constraints must be backed by structural enforcement, not just text.

20. **Updated README** (that removes content) — Content-reducing updates require explicit preservation audit and user confirmation.

21. **Writing TOON with JSON/YAML syntax** — Verify format literacy before drafting. Validate all files before commit.

22. **Executing work outside the workflow** — All work must flow through defined activities. Informal combination of results is prohibited.

23. **Defending output when corrected** — Re-examine the output. Never push back on a user correction without evidence.
