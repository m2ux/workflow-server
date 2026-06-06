---
name: anti-patterns
description: Patterns explicitly prohibited during workflow creation and modification.
metadata:
  order: 2
  legacy_id: 2
---

# Anti-Patterns

Patterns explicitly prohibited during workflow creation and modification. Derived from analysis of 175+ historical sessions across two projects.

---

## Structural Anti-Patterns

1. **"Let me just inline that"** — No content embedding in parent files. Activities, techniques, and resources live in their own files.

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

15. **"First load the workflow, then get the activity"** (as prose, OR as a multi-bullet checklist crammed into a step `description`) — Use the assigned technique's `protocol` with phase-keyed bullet arrays. The activity step `description` field is a one-line summary of WHAT the step does; the imperative bullets describing HOW belong in the technique the step assigns. Concrete violations of this pattern look like: `description: "Audit X. Check: (1) ..., (2) ..., (3) ..."` (numbered audit criteria), `description: "Run pass A. Then pass B. Then pass C."` (sequenced procedure), or `description: "Review every rules section... For each rule, check whether..."` (per-item iteration logic). If the description reads like a checklist or numbered procedure, the procedure belongs in `protocol`; the step description should name the step and let the worker load the technique for the bullets. **This anti-pattern is reflexive**: the workflow-design `quality-review` activity itself has historically violated it; when running a review-mode audit, scan workflow-design's own step descriptions for this pattern as part of the same pass that examines the target workflow.

16. **"This technique needs a file path"** (buried in description) — Use technique `inputs[]` with `id` and `description`.

## Rule Hygiene Anti-Patterns

24. **"The rule restates the protocol"** — Rules that verbatim copy a protocol phase add no information and create maintenance drift. Rules should state novel constraints or invariants that the protocol's procedural steps don't convey. If a rule says the same thing as a protocol bullet, delete the rule.

25. **"Explain why / Avoid attribution"** (without group context) — Rules that appear contradictory when read together must be disambiguated by their group name. Use grouped rule arrays where the key provides the missing context (e.g., `code-commentary` vs `attribution-prohibition`).

26. **"code-foo, code-bar, code-baz"** (flat prefix keys) — Rules sharing a prefix belong in a grouped array under a descriptive key. The key name replaces the prefix and provides semantic context. Use `z.union([z.string(), z.array(z.string())])` rule format.

27. **"This rule appears in the technique AND the activity AND the workflow"** — A rule should exist in exactly one authoritative location. Cross-level duplication (workflow → activity → technique) causes silent drift when one copy is updated but others aren't. The rule belongs at the level where it's enforced.

    **Worker-visibility carve-out:** Workers load only `get_activity` + `get_technique` — they never receive `workflow.toon`. So a *behavioural* rule that workers must read and follow cannot be lifted to the workflow root. If multiple techniques carry the same worker-directed rule (e.g. "prefer gitnexus over grep"), that duplication is the correct mechanism for worker reach, not a hygiene violation. Lifting it would silently remove the rule from workers' view. Cross-level duplication is only an anti-pattern when the rule is *orchestrator-only* (variable management, transitions, commit policy, mode handling). Before flagging a rule as duplicated across techniques, ask: "Do workers need to read this?" If yes, leave the copies in place; the only valid consolidation is into a shared technique that the affected techniques' activities all load.

28. **"status-proposed" AND "status-accepted-directly"** — Contradictory rules in the same technique. Every rule must be checked for logical consistency with its siblings. If two rules describe mutually exclusive behaviors, one is stale — identify and remove it.

29. **"persist-output" rule on a technique with a "write-artifact" step** — A rule that applies to only one protocol step is not a cross-cutting constraint — it's step-level guidance masquerading as a rule. Move the content into the step's description prose and delete the rule. Technique-level rules should span multiple protocol phases.

## Description Hygiene Anti-Patterns

36. **"Let me explain why this is here"** — `description`, `message`, action-description, option-description, and procedure-bullet fields must say what the construct does, not why it exists, what depends on it, or what consumes its output. Rationale ("so the retrospective captures..."), process narration ("interpolated into checkpoint X", "drives the loop's exit condition", "consumed by activity Y"), comparison with prior implementations ("as today", "no further server-side aggregation needed"), and restatement of facts already encoded by adjacent structure (the step's position in `steps[]`, the loop's `condition`/`maxIterations`, the checkpoint's `effect.setVariable`, the option's `transitionTo`, the variable's `defaultValue`) belong in commit messages, ADRs, or planning docs — not in workflow files. Every sentence in a workflow description should survive the test "if I deleted this, would any structural fact be lost?" — if the answer is no, delete it.

37. **"Without X, Y will happen"** (justification tail on validate messages) — Validate-action messages must state the cause and the fix command only. Trailing paragraphs explaining the consequences of the misconfiguration ("Without a configured signing key, every commit made by this workflow will be unsigned and strategic-review will refuse to advance...") repeat what the failing validate already proves and add noise the user has to skim past to find the fix. Format: `<what's wrong>. Run '<command>'.` Stop there.

38. **"Workflow X first does A, then B, then C"** (prose sequence in description) — `description:` fields on `workflow.toon`, activities, and techniques must not enumerate the sequence of activities, phases, modes, or steps in prose. That information is canonical in `activities[]`, `modes[]`, `steps[]`, or the equivalent on-disk directory (e.g., `activities/*.toon` resolved by the loader); restating it in description creates a duplicate that drifts when the sequence changes. Remove from description; rely on the canonical declaration. If the sequence must be highlighted somewhere prose-shaped (a README, a planning artifact), that's where it belongs — not in the workflow definition itself.

39. **"Run 'git config --global ...'"** (prescribing user-environment modification) — Workflow file content (descriptions, `validate` messages, procedure bullets, option descriptions) must not instruct the user or agent to modify user-owned environment state: git configuration, shell settings, system packages, GPG agent state, GitHub account settings, etc. The workflow may detect a misconfiguration and surface the diagnostic — "git config commit.gpgsign is not true" — but the fix is the user's responsibility at whatever scope (system, global, local) they choose. Specifically prohibited inside workflow definitions: `git config --global ...`, `git config --system ...`, `gh auth login` (as a directive), `gpgconf --launch` (as a directive), or any other command whose effect is to mutate user-owned state outside the workflow's working tree. A workflow-level rule on the relevant `workflow.toon` is the canonical place to declare this scope boundary.

40. **"The orchestrator coordinates only"** (role-rule baked into description) — Description fields must describe what the construct IS, not how its participants (orchestrator, workers, sub-agents) should behave. Role-prescriptive sentences ("The X coordinates only", "The Y MUST Z", "Workers do not call W", "Analysis is delegated to sub-agents") are rules and belong in a `rules:` section on the same construct or a parent construct — never in `description:`. Before adding to rules, check whether an equivalent rule already exists at any scope (technique rules — including a containing group's or the workflow root's — activity rules, workflow rules); if it does, drop the description prose without re-migration. The same applies to variable descriptions: "MUST be set by V's output" is a behavioral constraint and belongs in a rule, not in the variable's description, which should define what the variable means.

## Coupling Anti-Patterns

41. **"`fix_strategy` from [analyze-failure]"** (I/O contract names a workflow-internal source/destination) — A technique's `inputs` and `output` must be agnostic of where a value comes from and where it goes. An input/output entry must NOT name or link any workflow-internal producer or consumer of the value — not another technique ("from [analyze-failure]", "produced by build-function-registry"), not an activity ("from the elicitation activity", "for the execute-analysis activity"), not a step, checkpoint, loop, or workflow/activity file. Describe what the value IS — its meaning, shape, allowed values — never its position in a particular workflow. Generic I/O names exist precisely so a technique stays decoupled from who supplies its inputs and who consumes its outputs; naming a sibling component couples the technique to one workflow and breaks reuse. The one place a technique legitimately references another technique is `## Protocol`/`## Capability`, as utilisation ("use technique X", "go through cargo-operations::fmt-fix") — including an inline "apply technique X" recovery within a protocol step. Descriptions of a value's intrinsic nature or external origin ("git diff output", "the user's request", "provided by the server") are NOT coupling and should stay. Fix: rewrite the entry to describe the value generically and drop the workflow-internal source/destination naming.

42. **"Read all open assumptions from `assumptions-log.md`"** (concrete artifact named instead of its canonical identifier) — A technique's `## Protocol` must reference data by its canonical Input/Output identifier, never by a literal artifact filename or path. Input/Output identifiers must be canonical names for the thing, not path-flavored proxies (`assumptions-log`, not `assumptions-log-path`). When an input or output is an artifact built from a template, hyperlink its noun to the **section** of the resource carrying that template — the same `[noun](path#section)` form techniques use in Protocol, anchored to the section to minimise context bloat, and with no explanatory verbiage (link the word; do not add a "Format: …" / "see …" clause). The server converts such resource hyperlinks into `get_resource`-callable references for the agent, the same way technique links resolve to `technique::sub-technique` refs. Fix: rename path-flavored ids to the canonical name; replace literal artifact filenames in Protocol with the identifier; hyperlink the artifact noun to its template section.

43. **"Create `NN-{package}-plan.md`" / one opaque `all-artifact-paths` input** (artifact names and multiplicity hardcoded in Protocol instead of declared in the I/O contract) — The concrete name of an artifact a technique creates or consumes belongs in its Input/Output declaration, never in Protocol prose. A fixed name is a literal (`artifact: assumptions-log.md`); a dynamic name is a **token-template** the worker concatenates at runtime (`artifact: {package-name}-plan.md`, where `{…}` tokens bind to in-scope inputs/variables); a conditional name is documented in the declaration keyed by its discriminator (e.g. "01-COMPLETION-ANALYSIS.md (completion) / 02-CONTEXT-ANALYSIS.md (context)"). When a technique consumes several artifacts, declare each as an **individually-named Input** with its own canonical id — never a single opaque `*-paths` array that forces Protocol to name the files. Protocol then references only the canonical identifier, so the I/O contract stays the single source of truth for what artifacts exist and what they are called, and the technique stays reusable. Fix: move the filename (literal, token-template, or discriminator-keyed note) into the I/O declaration; split opaque artifact-path arrays into named inputs; reference identifiers only in Protocol.

44. **"Composed by [generate-summary]" / "produced by the X technique"** (a resource references the technique that calls it) — A resource (template, schema, guide, prompt, reference) must never name or link the technique(s) that produce, consume, or call it. Resources are reusable assets; a back-reference to a caller couples the resource to one consumer and breaks reuse — the reverse of the I/O-agnosticism rule (AP-41). Remove producer/consumer backlinks from resource bodies and frontmatter `description`s ("produced by the X technique", "Composed by [X]", "Used by the X technique"), and drop "Used By" / "Referenced By" catalogue columns that map a resource to its consumers. LEGITIMATE (keep): a resource that directs ITS READER to execute a technique (a prompt/instruction resource applying workflow-engine / agent-conduct techniques — a forward dependency, like a Protocol "use technique X"), a "see also" cross-reference to another technique's content, and generic descriptions of the technique model/ontology. The test: is the named technique a producer/consumer/caller of this resource (reverse → remove) or a technique the resource's reader is told to run (forward → keep)? Fix: describe the resource/artifact by what it IS and drop the caller reference.

45. **"`deep_scan ([deep-scan](link))`"** (label and link text repeat the same name) — A hyperlink whose display text is the same as the plain-text word immediately before it is purely redundant; the reader sees the name twice and the link adds no information the word doesn't already convey. Collapse the preceding word and the link into a single hyperlink: `deep_scan ([deep-scan](link))` → `[deep-scan](link)`. The same applies with case or punctuation variation: `L12 ([l12](link))` → `[L12](link)`, `claim ([claim](link))` → `[claim](link)`. A preceding word is NOT redundant when it carries a different label than the link's display text (e.g., `structural ([l12](link))` names the role, `structural`, distinct from the resource id `l12`; keep both). Fix: scan every `word ([link-text](url))` occurrence; when `word` and `link-text` are the same name (modulo case/hyphen), delete the plain-text word and the parentheses, leaving only `[link-text](url)`.

46. **"Structure the output"** (Protocol step references output without a designator) — Every Protocol step that reads from or writes to an output must name which output it means by citing the output's canonical identifier (`{output-id}`) or a specific sub-field (`{output-id}.field`). Vague pronouns and generic nouns — "the output", "the result", "the artifact", "the analysis" — leave the agent to infer which declared output is meant, creating an inference gap when a technique has multiple outputs or when the output sub-field matters for correct behaviour. The fix is always mechanical: look up the `## Output` / `## Outputs` declaration, find the id of the relevant entry (and sub-field if applicable), and substitute it for the vague reference. This is the sub-field complement to AP-42 (which covers literal filenames); together they require every data reference in Protocol to be anchored to the I/O contract. Fix: replace "the output" / "the result" with `{output-id}` or `{output-id}.field`; for multi-output techniques, ensure each step names the specific output it touches.

47. **"Resources are attached to technique responses (loaded via get_technique)"** (a technique self-describes the delivery mechanism) — A technique's `## Protocol` describes the work the agent does, never how the server delivers the technique, its resources, or its bundle. Sentences explaining the delivery model — "Resources are attached to technique responses", "available in the `_resources` field", "loaded via `get_technique`", "in the technique response", "the worker self-bootstraps via `get_activity`" — restate facts that belong in (and are owned by) the technique-protocol specification, not in every technique that happens to load a resource. They drift from the spec and add noise to every protocol. A step is an action: "Load the lens prompt for `{lens-resource-index}`", not "Resources are attached to technique responses, so the lens is available in `_resources`". The mechanism by which a referenced resource or technique reaches the worker is the server's and the spec's concern; the protocol states only the action (load it, apply it) and references the resource/technique by its canonical hyperlink. Fix: delete the mechanism narration; keep the imperative action and the canonical reference. (The workflow-engine techniques are the sole exception — describing tool/delivery behaviour IS their domain.)

48. **"Use `gitnexus_context` on the symbol"** (a technique invokes another technique by its raw tool name instead of a canonical hyperlink) — When a protocol step uses a capability that another technique wraps, it references that technique by its canonical hyperlink (`[op](path)`, or `[group](path)::[op](path)` for a nested op), which the server resolves to a `::` reference — never the raw underlying tool name. Raw tool names (`gitnexus_context`, `gitnexus_impact`, `gitnexus_cypher`, `gitnexus_query`, `gitnexus_list_repos`) couple the technique to a specific harness/tool, bypass the canonical-reference model, and are not navigable. They are the analogue of AP-32 (inconsistent tool names) at the technique-reference layer. Fix: replace the raw tool name with the canonical hyperlinked reference to the wrapping operation (e.g. `[gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md)`), preserving the arguments. EXCEPTION: the operation technique that actually wraps the primitive (the `gitnexus-operations` ops themselves, the `harness-compat` ops) legitimately names the raw tool — invoking it IS that technique's purpose.

## Tool-Technique-Doc Consistency Anti-Patterns

30. **"Resources are in the response"** (but they aren't) — Technique protocols or tool sections that describe return values inaccurately. If a technique says a tool returns resource content but the tool actually returns lightweight refs, agents will skip the `get_resource` call. Technique tool sections must match actual tool behavior.

31. **"Call start_session, then call next_activity"** (skipping the map) — Bootstrap sequences that omit a tool needed to discover the next step. If `start_session` doesn't return `initialActivity` and the bootstrap doesn't mention `get_workflow`, agents must guess. Every bootstrap sequence must provide a complete path from session start to first meaningful action.

32. **Inconsistent tool names across techniques** — Multiple techniques describing the same tool action using different tool names. When one technique says `get_technique` and another says `get_step_technique`, agents get contradictory guidance. Each tool action must be described with one consistent tool name across all techniques. The canonical name is `get_technique`.

33. **"Pass token to all calls" (repeated in 4 techniques)** — Behavioral guidance duplicated across techniques and tool descriptions. When the same token-handling instruction appears in session-protocol, worker-management, orchestrator-management, AND the tool description, updates to one create silent drift in the others. Guidance belongs in one authoritative location; others reference it.

34. **"Returns: Activity definition"** (but it returns everything) — Tool descriptions or technique tool sections that describe mechanics instead of value. A description that says "transitions to the next activity" without mentioning it returns the complete activity definition with steps, checkpoints, and transitions undersells the tool and forces agents to discover the return value experimentally.

35. **Two tools that return the same data** — A tool whose output is a strict subset of another tool's response adds selection ambiguity without adding value. If `next_activity` returns transitions and `get_activities` returns only transitions (requiring `next_activity` to have been called first), the second tool is redundant.

## Execution Anti-Patterns

17. **"I'll just start implementing"** — Present approach and receive confirmation before any modification.

18. **"Here's what I recommend..."** (without doing it) — Recommendations must be followed by implementation. Analysis without action is incomplete.

19. **"The agent must never do X"** (as rule text only) — Critical constraints must be backed by structural enforcement, not just text.

20. **Updated README** (that removes content) — Content-reducing updates require explicit preservation audit and user confirmation.

21. **Writing TOON with JSON/YAML syntax** — Verify format literacy before drafting. Validate all files before commit.

22. **Executing work outside the workflow** — All work must flow through defined activities. Informal combination of results is prohibited.

23. **Defending output when corrected** — Re-examine the output. Never push back on a user correction without evidence.
