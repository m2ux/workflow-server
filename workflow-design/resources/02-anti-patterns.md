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

## Rule Hygiene Anti-Patterns

24. **"The rule restates the protocol"** — Rules that verbatim copy a protocol phase add no information and create maintenance drift. Rules should state novel constraints or invariants that the protocol's procedural steps don't convey. If a rule says the same thing as a protocol bullet, delete the rule.

25. **"Explain why / Avoid attribution"** (without group context) — Rules that appear contradictory when read together must be disambiguated by their group name. Use grouped rule arrays where the key provides the missing context (e.g., `code-commentary` vs `attribution-prohibition`).

26. **"code-foo, code-bar, code-baz"** (flat prefix keys) — Rules sharing a prefix belong in a grouped array under a descriptive key. The key name replaces the prefix and provides semantic context. Use `z.union([z.string(), z.array(z.string())])` rule format.

27. **"This rule appears in the skill AND the activity AND the workflow"** — A rule should exist in exactly one authoritative location. Cross-level duplication (workflow → activity → skill) causes silent drift when one copy is updated but others aren't. The rule belongs at the level where it's enforced.

28. **"status-proposed" AND "status-accepted-directly"** — Contradictory rules in the same skill. Every rule must be checked for logical consistency with its siblings. If two rules describe mutually exclusive behaviors, one is stale — identify and remove it.

## Execution Anti-Patterns

17. **"I'll just start implementing"** — Present approach and receive confirmation before any modification.

18. **"Here's what I recommend..."** (without doing it) — Recommendations must be followed by implementation. Analysis without action is incomplete.

19. **"The agent must never do X"** (as rule text only) — Critical constraints must be backed by structural enforcement, not just text.

20. **Updated README** (that removes content) — Content-reducing updates require explicit preservation audit and user confirmation.

21. **Writing TOON with JSON/YAML syntax** — Verify format literacy before drafting. Validate all files before commit.

22. **Executing work outside the workflow** — All work must flow through defined activities. Informal combination of results is prohibited.

23. **Defending output when corrected** — Re-examine the output. Never push back on a user correction without evidence.
