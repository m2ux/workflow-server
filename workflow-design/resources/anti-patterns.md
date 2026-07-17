---
name: anti-patterns
description: Patterns explicitly prohibited during workflow creation and modification.
metadata:
  order: 2
  legacy_id: 2
---

# Anti-Patterns

Patterns explicitly prohibited during workflow creation and modification.

Dense entries use **Detect** / **Do not flag** / **Fix** so an audit agent can apply them without narrative case-law. Short entries stay one sentence when that is enough. Audit techniques load this resource and apply each entry in place — they must not restate per-pattern detect/fix logic or cite pattern ids as protocol designators.

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

> Design-time authoring standards live in [design-principles](./design-principles.md) and this catalogue — not in workflow/activity/technique runtime rules. See AP-90–92 / AP-94 (checkpoint message form) and AP-93 (rules must be runtime-relevant; migrate design-time discoveries into the workflow-design canon).

## Schema Expressiveness Anti-Patterns

9. **"Ask the user whether to proceed"** (as prose) — Use a `kind: checkpoint` step with `message`, `options`, and `effects`, placed at the position in `steps[]` where the decision is presented.

10. **"Repeat this for each item"** (as prose) — Use a `kind: loop` step with `loopType: "forEach"`, `over`, and a nested `steps[]` body.

11. **"If X then do A, otherwise B"** (as prose) — Use an activity-level `decision` with `branches` and `conditions` (cross-activity routing remains activity-level, not a step).

12. **"This produces a report"** (buried in description) — Declare the output as a `#### artifact` (filename) on the producing technique's `## Outputs`. The activity's artifact contract is then synthesized from its steps' techniques (AP-65) — do NOT bury artifact production in a `description`, and do NOT hand-author an activity `artifacts[]` block.

13. **"Track whether the user approved"** (implicit) — Use a `variable` with `type` and `defaultValue`, wired to checkpoint `effects`.

14. **"In fast mode, skip the research steps"** (as a rule) — Express mode behaviour as ordinary state: a boolean activation `variable` set by a detection step/checkpoint early in the workflow, with `transitions[].condition` and step `when`/`condition` gates that branch on it (and checkpoint `effect.skipActivities` where activities are skipped).

15. **"First load the workflow, then get the activity"** (as prose, OR as a multi-bullet checklist crammed into a step `description`) —
**Detect:** Step `description` holds HOW — numbered audit criteria (`"Audit X. Check: (1)…"`), sequenced procedure (`"Run pass A. Then pass B…"`), or per-item iteration logic. HOW belongs in the assigned technique's `protocol` (phase-keyed bullets); `description` is a one-line WHAT summary only. Reflexive: when auditing in review mode, also scan workflow-design's own step descriptions.
**Do not flag:** Once a step BINDS a technique, absence of description is correct — AP-64 requires removing `description` entirely (not merely de-proceduralizing) and homing content in the bound op.
**Fix:** Move imperative bullets into the technique protocol; leave a one-line WHAT in unbound `description`, or delete `description` entirely when the step is bound (AP-64).

16. **"This technique needs a file path"** (buried in description) — Use technique `inputs[]` with `id` and `description`.

64. **"`- kind: technique` / `id: confirm-target` / `name: Confirm Target` / `technique: setup-audit-target` / `description: "Extract and validate the target submodule."`"** (bound step still carries `description`/`name`, or N steps bind one technique and differ only by description) —
**Detect:** (1) `kind: technique` step has `description` or `name`. (2) `kind: action` step has `description` or `name`. (3) Explicit `required: true` on any step (default noise). (4) Several steps bind the same technique and differ only by `description` (monolith-masking). Bound steps allow only `kind`, `id`, `technique` (string or `{ name, inputs, outputs }`), plus structural `actions` / `when` / `required: false`. WHAT/HOW live in the bound op's `## Capability` / `## Protocol`. Unbound procedure-in-description is AP-15; once bound, description is removed entirely.
**Do not flag:** `kind: loop` may have `name` plus loop fields and nested `steps[]`. `kind: checkpoint` uses inline `message`/`options` and a stable `id` (not `name`/`description`). Checkpoints/loops are inline in `steps[]` — never `step.checkpoint` or separate `checkpoints[]`/`loops[]` arrays.
**Fix (reuse → collapse → split):** (1) **Reuse** — bind an existing meta/workflow-local op and delete the description (e.g. gitnexus/git/gh/cargo/workflow-engine ops). (2) **Collapse** — consecutive steps binding the same technique with no distinguishing `when`/`actions`/input-output deviation and no intervening checkpoint → one step. (3) **Split** — distinct structural attach points (checkpoint/when between phases) → group with one op per phase; bind `technique: <group>::<op>`; delete descriptions. New techniques are last resort. Even a one-line non-procedural WHAT is removed from the step — enrich the op's `## Capability` first so the semantic is not lost. Resulting bound step = `id` + `technique` + structural fields only.

## Rule Hygiene Anti-Patterns

24. **"The rule restates the protocol"** — Rules that verbatim copy a protocol phase add no information and create maintenance drift. Rules should state novel constraints or invariants that the protocol's procedural steps don't convey. If a rule says the same thing as a protocol bullet, delete the rule.

25. **"Explain why / Avoid attribution"** (without group context) — Rules that appear contradictory when read together must be disambiguated by their group name. Use grouped rule arrays where the key provides the missing context (e.g., `code-commentary` vs `attribution-prohibition`).

26. **"code-foo, code-bar, code-baz"** (flat prefix keys) — Rules sharing a prefix belong in a grouped array under a descriptive key. The key name replaces the prefix and provides semantic context. Use `z.union([z.string(), z.array(z.string())])` rule format.

27. **"This rule appears in the technique AND the activity AND the workflow"** — A rule should exist in exactly one authoritative location. Cross-level duplication (workflow → activity → technique) causes silent drift when one copy is updated but others aren't. The rule belongs at the level where it's enforced.

    **Worker-visibility carve-out:** Workers load only `get_activity` + `get_technique` — they never receive `workflow.yaml`. So a *behavioural* rule that workers must read and follow cannot be lifted to the workflow root. If multiple techniques carry the same worker-directed rule (e.g. "prefer gitnexus over grep"), that duplication is the correct mechanism for worker reach, not a hygiene violation. Lifting it would silently remove the rule from workers' view. Cross-level duplication is only an anti-pattern when the rule is *orchestrator-only* (variable management, transitions, commit policy, mode handling). Before flagging a rule as duplicated across techniques, ask: "Do workers need to read this?" If yes, leave the copies in place; the only valid consolidation is into a shared technique that the affected techniques' activities all load.

28. **"status-proposed" AND "status-accepted-directly"** — Contradictory rules in the same technique. Every rule must be checked for logical consistency with its siblings. If two rules describe mutually exclusive behaviors, one is stale — identify and remove it.

29. **"persist-output" rule on a technique with a "write-artifact" step** — A rule that applies to only one protocol step is not a cross-cutting constraint — it's step-level guidance masquerading as a rule. Move the content into the step's description prose and delete the rule. Technique-level rules should span multiple protocol phases.

## Description Hygiene Anti-Patterns

36. **"Let me explain why this is here"** — `description`, `message`, action-description, option-description, and procedure-bullet fields must say what the construct does, not why it exists, what depends on it, or what consumes its output. Rationale ("so the retrospective captures..."), process narration ("interpolated into checkpoint X", "drives the loop's exit condition", "consumed by activity Y"), comparison with prior implementations ("as today", "no further server-side aggregation needed"), and restatement of facts already encoded by adjacent structure (the step's position in `steps[]`, the loop's `condition`/`maxIterations`, the checkpoint's `effect.setVariable`, the option's `transitionTo`, the variable's `defaultValue`) belong in commit messages, ADRs, or planning docs — not in workflow files. Every sentence in a workflow description should survive the test "if I deleted this, would any structural fact be lost?" — if the answer is no, delete it.

37. **"Without X, Y will happen"** (justification tail on validate messages) — Validate-action messages must state the cause and the fix command only. Trailing paragraphs explaining the consequences of the misconfiguration ("Without a configured signing key, every commit made by this workflow will be unsigned and strategic-review will refuse to advance...") repeat what the failing validate already proves and add noise the user has to skim past to find the fix. Format: `<what's wrong>. Run '<command>'.` Stop there.

38. **"Workflow X first does A, then B, then C"** (prose sequence in description) — `description:` fields on `workflow.yaml`, activities, and techniques must not enumerate the sequence of activities, phases, modes, or steps in prose. That information is canonical in `activities[]`, `transitions[]`, `steps[]`, or the equivalent on-disk directory (e.g., `activities/*.yaml` resolved by the loader); restating it in description creates a duplicate that drifts when the sequence changes. Remove from description; rely on the canonical declaration. If the sequence must be highlighted somewhere prose-shaped (a README, a planning artifact), that's where it belongs — not in the workflow definition itself.

39. **"Run 'git config --global ...'"** (prescribing user-environment modification) — Workflow file content (descriptions, `validate` messages, procedure bullets, option descriptions) must not instruct the user or agent to modify user-owned environment state: git configuration, shell settings, system packages, GPG agent state, GitHub account settings, etc. The workflow may detect a misconfiguration and surface the diagnostic — "git config commit.gpgsign is not true" — but the fix is the user's responsibility at whatever scope (system, global, local) they choose. Specifically prohibited inside workflow definitions: `git config --global ...`, `git config --system ...`, `gh auth login` (as a directive), `gpgconf --launch` (as a directive), or any other command whose effect is to mutate user-owned state outside the workflow's working tree. A workflow-level rule on the relevant `workflow.yaml` is the canonical place to declare this scope boundary.

40. **"The orchestrator coordinates only"** (role-rule baked into description) — Description fields must describe what the construct IS, not how its participants (orchestrator, workers, sub-agents) should behave. Role-prescriptive sentences ("The X coordinates only", "The Y MUST Z", "Workers do not call W", "Analysis is delegated to sub-agents") are rules and belong in a `rules:` section on the same construct or a parent construct — never in `description:`. Before adding to rules, check whether an equivalent rule already exists at any scope (technique rules — including a containing group's or the workflow root's — activity rules, workflow rules); if it does, drop the description prose without re-migration. The same applies to variable descriptions: "MUST be set by V's output" is a behavioral constraint and belongs in a rule, not in the variable's description, which should define what the variable means.

65. **"`artifacts: - id: evaluation-report / name: EVALUATION-REPORT.md / location: evaluation`"** (an activity hand-authors an `artifacts[]` block) —
**Detect:** Activity YAML declares `artifacts[]`. Artifact contract is synthesized by the server from bound techniques' `## Outputs` (`#### artifact` filenames, activity-group-shorthand resolution). Hand-authored lists duplicate/drift from the single source of truth (AP-43) and re-encode provenance the server already traces.
**Do not flag:** Non-file side effects (commit, PR) — not artifacts; simply not declared.
**Fix:** Delete the activity `artifacts[]` block. If a produced file is missing from the synthesized contract, add `#### artifact` (bare filename, `{token}` template, or discriminator-keyed note per AP-43) on the producing technique's `## Outputs` — never back onto the activity.

66. **"`EVALUATION-REPORT.md written with per-dimension findings…`" / "`Output directory created`" / "`dimension_plan … populated`"** (an activity `outcome[]` restates delivery mechanics instead of value delivered) —
**Detect:** Outcome names the mechanical act, not the VALUE delivered. Forbidden shapes: "`<file>` written/created" (artifact contract already encodes existence); re-listing artifact contents ("with findings…"); "`<var>` populated/set" (encoded by step `set`/`actions`). Test: outcome must still read true/useful if the file or variable were renamed — it names the value, not the vessel.
**Do not flag:** A mechanical name used only in service of the value it carries.
**Fix:** Rewrite as delivered value ("cross-dimensional risks evaluated and prioritised for go/no-go", not "EVALUATION-REPORT.md written…"); delete or fold pure-plumbing outcomes ("directory created", "variable populated").

67. **"`technique: resolve-findings::present-and-collect-per-finding` + `actions: - action: set / target: accepted_mitigations / description: \"Append the finding's recorded decision\"`"** (`set` on a bound step captures that technique's own product) —
**Detect:** Step has `technique` and a `set` whose `target` is a value the bound technique computes (assessment, classification, derived structure, artifact path). Bound-technique outputs already land via `variable-binding`; the `set` re-encodes them on the activity. Also flag a control step (no `technique`) with value-LESS `set`s (`target` + `description`, no `value:`) whose descriptions carry sourcing/derivation HOW for a domain payload — that is technique work misfiled as activity sets.
**Do not flag:** (a) cross-iteration accumulator / scatter-gather gather over a `forEach`; (b) caller-specific derivation from a generic tool-wrapper op (keep on activity — AP-41); (c) value-BEARING `set` on a pure control step recording orchestration/flow state (literal/expression: mode flags, loop primers, resets).
**Fix:** Declare `### <target>` on the bound technique's `## Outputs` (same id), fold the `set` description into `## Protocol`, delete the activity `set`. For value-LESS procedural control sets: bind a technique whose outputs/protocol own the derivation.

68. **"`commit_message: "docs({target_name}): …"` + same-step `set` of `target_name`"** (a step `set`s a value its own technique binding consumes as an input) —
**Detect:** A bound step's `technique.inputs` interpolates a variable that the SAME step's `set` actions write. Inputs resolve at invocation; `set`s are side-effects with no before-input contract → ordering hazard / self-reference (input-side counterpart of AP-67).
**Do not flag:** A `set` whose `target` is NOT interpolated by that step's `technique.inputs` — scatter-gather gather (AP-67 excl. a), value for a later step, or pure control-step orchestration.
**Fix:** Hoist the derivation to where its source is first established (or declare it as an earlier producing technique's output per AP-67); delete the `set` from the consuming step, leaving a pure binding.

69. **"`techniques: - workflow-engine::list-workflows …` with matching `step.technique`"** (activity top-level `techniques[]` re-lists operations its steps bind) —
**Detect:** An entry in activity-level `techniques[]` is also bound by any step (top-level or loop) via `step.technique`. Activity `techniques[]` is for cross-cutting STRATEGY/capability techniques (`variable-binding`, `scatter-gather`) spanning the whole activity — not per-step operations. Lists must be DISJOINT (see also AP-64).
**Do not flag:** Strategy techniques listed at activity level that no step binds. (Inverse smell — binding a cross-cutting strategy as a step operation — is separate; THIS fix always removes the activity-level duplicate.)
**Fix:** Remove every overlapping entry from activity `techniques[]`; keep only cross-cutting strategies; delete the block if none remain.

71. **"`rules: workflow: - \"WORKER PERMISSIONS: Workers MUST write all artifacts directly …\"`"** (rule in the wrong audience bucket) —
**Detect:** Classify each rule by who must act: orchestrator (`get_workflow` only), worker (`get_activity` inject), or both identically. Flag worker directives (write-immediately, no-permission-questions, blocker-surfacing, artifact-verification, lens-loading-by-worker) under `rules.workflow`. Flag orchestration directives (dispatch isolation, output forwarding, checkpoint cadence, orchestrator handoff) under `rules.activity`.
**Do not flag:** Correct placements — orchestrator → `rules.workflow`, worker → `rules.activity`, same directive for both → `rules.universal`.
**Fix:** Move to the bucket for the actor commanded. If one prose rule commands the two actors differently, split into two rules (orchestrator handoff vs worker load).

73. **"`steps: - id: map-findings / technique: compare-finding-sets …` (×N)"** (same technique bound by N separate step definitions) —
**Detect:** Two or more step definitions in one activity bind the same technique reference. Classify: (a) **redundant re-execution** — differ only by which already-produced output to surface → collapse to one step; (b) **unrolled iteration** — same op on N collection items → one `forEach` with one binding; (c) **monolith-masking** — distinguished only by a sub-mode input → split into a group with one named op per mode (AP-64 split).
**Do not flag:** Fixed roster of distinct static targets with different structured inputs (not a clean iterable); mutually exclusive `when` branches (only one fires); distinct-purpose invocations at different pipeline points (initial vs final commit); same op as distinct phases inside one loop iteration.
**Fix:** Apply collapse / loop / split per classification; leave the exceptions above.

75. **"every activity carries `techniques: - variable-binding`"** (a workflow-universal technique duplicated on each activity instead of declared once at workflow level) —
**Detect:** A strategy technique appears on (nearly) every activity's `techniques[]`. Audience split mirrors rules (AP-71): `techniques.workflow` = orchestrator (`get_workflow`); `techniques.activity` = inherited by every activity (`get_activity` inject). No `universal` bucket for techniques. Coverage discriminator: nearly-all → hoist; only some (e.g. `scatter-gather` on fan-out activities) → stay activity-local. Composes with AP-69 (step-binding duplicates leave first).
**Do not flag:** Activity-specific strategy techniques used by only some activities.
**Fix:** Declare once under `workflow.techniques.activity`; delete from every activity `techniques[]`; drop emptied activity blocks.

76. **"README `### NN. Activity` + `**Steps:**` / checkpoints table / transitions / `## Variables` / `## Rules` / estimated times"** (README transcribes the YAML definition) —
**Detect:** README enumerates in prose or tables: activity `steps[]` (including inline checkpoint options/`effect`/`autoAdvanceMs` and loops), `decisions[]`/`transitions[]`, per-step technique bindings, workflow `variables`, `rules`, or per-activity estimated times. Authoritative definition is `workflow.yaml` / `activities/NN-<id>.yaml` via `get_workflow`/`get_activity`. Test: if the block must be edited when those YAML fields change, it is transcribing.
**Do not flag:** Mermaid/ASCII flow diagrams (activity- or step-flow); orientation the YAML lacks — PURPOSE, at-a-glance activity sequence (name + one-line role + connections), outcomes/value, file structure, techniques overview, links to authoritative YAMLs.
**Fix:** Delete prose/table enumerations of steps/checkpoints/loops/decisions/transitions/bindings and Variables/Rules/estimated-time sections; KEEP diagrams and orientation. Readers open the YAML or call `get_activity` for the rest.

## Coupling Anti-Patterns

41. **"`fix_strategy` from [analyze-failure]"** (I/O contract names a workflow-internal source/destination) —
**Detect:** An input/output entry names or links a workflow-internal producer/consumer — another technique ("from [analyze-failure]", "produced by build-function-registry"), activity ("from the elicitation activity"), step, checkpoint, loop, or workflow/activity file. Describe what the value IS (meaning, shape, allowed values), never its position in a particular workflow.
**Do not flag:** Protocol/Capability utilisation ("use technique X", "go through cargo-operations::fmt-fix"); intrinsic/external origin ("git diff output", "the user's request", "provided by the server"); I/O links to a resource/template section (shape of the value).
**Fix:** Rewrite the entry generically; drop workflow-internal source/destination naming.

42. **"Read all open assumptions from `assumptions-log.md`"** (concrete artifact named instead of its canonical identifier) — A technique's `## Protocol` must reference data by its canonical Input/Output identifier, never by a literal artifact filename or path. Input/Output identifiers must be canonical names for the thing, not path-flavored proxies (`assumptions-log`, not `assumptions-log-path`). When an input or output is an artifact built from a template, hyperlink its noun to the **section** of the resource carrying that template — the same `[noun](path#section)` form techniques use in Protocol, anchored to the section to minimise context bloat, and with no explanatory verbiage (link the word; do not add a "Format: …" / "see …" clause). The server converts such resource hyperlinks into `get_resource`-callable references for the agent, the same way technique links resolve to `technique::sub-technique` refs. Fix: rename path-flavored ids to the canonical name; replace literal artifact filenames in Protocol with the identifier; hyperlink the artifact noun to its template section.

43. **"Create `NN-{package}-plan.md`" / one opaque `all-artifact-paths` input** (artifact names and multiplicity hardcoded in Protocol instead of declared in the I/O contract) — The concrete name of an artifact a technique creates or consumes belongs in its Input/Output declaration, never in Protocol prose. A fixed name is a literal (`artifact: assumptions-log.md`); a dynamic name is a **token-template** the worker concatenates at runtime (`artifact: {package_name}-plan.md`, where `{…}` tokens bind to in-scope inputs/variables); a conditional name is documented in the declaration keyed by its discriminator (e.g. "01-COMPLETION-ANALYSIS.md (completion) / 02-CONTEXT-ANALYSIS.md (context)"). When a technique consumes several artifacts, declare each as an **individually-named Input** with its own canonical id — never a single opaque `*-paths` array that forces Protocol to name the files. Protocol then references only the canonical identifier, so the I/O contract stays the single source of truth for what artifacts exist and what they are called, and the technique stays reusable. Fix: move the filename (literal, token-template, or discriminator-keyed note) into the I/O declaration; split opaque artifact-path arrays into named inputs; reference identifiers only in Protocol.

44. **"Composed by [generate-summary]" / "produced by the X technique"** (a resource references the technique that calls it) —
**Detect:** A resource (template, schema, guide, prompt, reference) names/links techniques that produce, consume, or call it — body or frontmatter (`"produced by the X technique"`, `"Composed by [X]"`, `"Used by…"`), "Used By"/"Referenced By" catalogue columns, or technique/activity FILE PATHS as link targets / role-to-file tables (e.g. listing `techniques/review-code.md`). Reverse caller coupling breaks reuse (see also AP-41).
**Do not flag:** Forward dependency — the resource tells ITS READER to run a technique (prompt/instruction applying workflow-engine / agent-conduct); "see also" to another technique's content; generic technique-model/ontology prose. Test: producer/consumer/caller of this resource → remove; technique the reader should run → keep.
**Fix:** Describe the resource by what it IS; drop caller/backlink references; move role→file mapping into the rendering technique and keep the resource field abstract (link roles to the workflow file that defines them).

45. **"`deep_scan ([deep-scan](link))`"** (label and link text repeat the same name) — A hyperlink whose display text is the same as the plain-text word immediately before it is purely redundant; the reader sees the name twice and the link adds no information the word doesn't already convey. Collapse the preceding word and the link into a single hyperlink: `deep_scan ([deep-scan](link))` → `[deep-scan](link)`. The same applies with case or punctuation variation: `L12 ([l12](link))` → `[L12](link)`, `claim ([claim](link))` → `[claim](link)`. A preceding word is NOT redundant when it carries a different label than the link's display text (e.g., `structural ([l12](link))` names the role, `structural`, distinct from the resource id `l12`; keep both). Fix: scan every `word ([link-text](url))` occurrence; when `word` and `link-text` are the same name (modulo case/hyphen), delete the plain-text word and the parentheses, leaving only `[link-text](url)`.

46. **"Structure the output"** (Protocol step references output without a designator) — Every Protocol step that reads from or writes to an output must name which output it means by citing the output's canonical identifier (`{output_id}`) or a specific sub-field (`{output_id}.field`). Vague pronouns and generic nouns — "the output", "the result", "the artifact", "the analysis" — leave the agent to infer which declared output is meant, creating an inference gap when a technique has multiple outputs or when the output sub-field matters for correct behaviour. Look up the `## Output` / `## Outputs` declaration, find the id of the relevant entry (and sub-field if applicable), and substitute it for the vague reference (with AP-42: every data reference in Protocol anchors to the I/O contract). Fix: replace "the output" / "the result" with `{output_id}` or `{output_id}.field`; for multi-output techniques, ensure each step names the specific output it touches.

47. **"Resources are attached to technique responses (loaded via get_technique)"** (a technique self-describes the delivery mechanism) —
**Detect:** Protocol explains how the server delivers the technique, resources, or bundle — "Resources are attached to technique responses", "available in `_resources`", "loaded via `get_technique`", "in the technique response", "worker self-bootstraps via `get_activity`".
**Do not flag:** workflow-engine techniques whose domain IS tool/delivery behaviour.
**Fix:** Delete mechanism narration; keep the imperative action and the canonical resource/technique hyperlink ("Load the lens prompt for `{declared_id}`").

48. **"Use `gitnexus_context` on the symbol"** (a technique invokes another technique by its raw tool name instead of a canonical hyperlink) —
**Detect:** Protocol uses a raw underlying tool name (`gitnexus_context`, `gitnexus_impact`, `gitnexus_cypher`, `gitnexus_query`, `gitnexus_list_repos`, …) for a capability another technique wraps. Must use canonical hyperlink (`[op](path)` or `[group](path)::[op](path)`), resolved by the server to `::`. Raw names couple to a harness, bypass the navigable reference model (also AP-32).
**Do not flag:** The operation that wraps the primitive (`gitnexus-operations` ops, `harness-compat` ops) — naming the raw tool IS that technique's purpose.
**Fix:** Replace the raw tool name with the canonical hyperlinked wrapping op; preserve arguments.

49. **"Examine target_path" / "for synthesis pass (index 23)" / "`reference_path`" / "`<files>`"** (Protocol references a declared I/O or local without braces) —
**Detect:** (a) bare declared id as plain words; (b) orphan enum/index value not tied to its input ("index 23"); (c) disguised id in backticks or `<angles>` without braces. Spelling must match the declared id exactly (`### problem_statement` → `{problem_statement}`). Forms: `{input_id}` / `{output_id}` / `{output_id}.field` / `{$local}`.
**Do not flag:** Ordinary English that only coincides with an id; backticked literals that are not declared ids (shell commands, filenames, tool params).
**Fix:** Brace as `{declared_id}`; for orphan values write "when `{declared_id}` is 23"; replace disguise wrappers with braces. Brace only when the token is used as a reference to that value.

50. **"per the gitnexus-operations index-freshness rule"** (Protocol cites a rule in prose or `::` instead of its dotted symbol address) —
**Detect:** A protocol step cites/relies on a rule as prose ("per the X rule", "following the X rule") or with `::` (invokes a technique, does not name a rule). Also: prose citation of a rule that is not declared anywhere (dangling).
**Do not flag:** Correct dotted ancestry address — `[<workflow>.]<technique>.<rule-name>` (e.g. `meta.gitnexus-operations.index-freshness-first`). Shorten when in ancestry: omit workflow for same-workflow; bare rule name when inherited from self/group/workflow root. Full path only for rules outside current ancestry.
**Fix:** Replace prose/`::` with the dotted symbol address (shortened per ancestry). For dangling citations, point at the real inline content — never invent a rule. Mnemonic: `::` invokes, `.` names.

51. **"Apply design framework to structure the approach"** (a Protocol reference that does not resolve to a concrete target) —
**Detect:** In every protocol step, every referential phrase must resolve to one of five anchors: **I/O** → `{id}` / `{id}.field` (also 42/46/49); **rule** → dotted symbol (50); **technique/op** → canonical hyperlink / `::` (48); **resource** → markdown hyperlink to file/section. Flag bare prose nouns, backtick-disguised ids, and `<angle>` placeholders of declared ids — e.g. bare RESOURCE noun ("Apply design framework…") when `resources/design-framework.md` exists. Also check protocol-local `{$name}`/`{name}` balance (58) in the same walk.
**Do not flag:** Ordinary domain prose naming no formal artifact ("the codebase", "the diff", "the user"); anaphora for a noun already linked once in the same step.
**Fix:** Anchor each unresolved reference via the matching form. A reference with NO real target is dangling — fix the target or reword; never invent a link.

52. **"`### planning-folder` declared on every technique"** (a common input re-declared per technique instead of inherited from the container) —
**Detect:** The same input is re-declared on many techniques instead of once on the smallest common container (group or workflow-root `TECHNIQUE.md`; `composeLoaded` merges container I/O/Rules into descendants). Related smell: path-flavored id (`planning-folder-path`) — canonical id is the noun the value IS (AP-42). Synonym drift for one concept across leaves.
**Do not flag:** Niche inputs shared by only two or three techniques — do not push those to the root just to dedup.
**Fix:** Hoist the shared input to the container under one canonical id; delete per-technique declarations; reference `{id}` via inheritance. Hoist genuinely workflow-wide contextual inputs (artifact location, target path) even if some leaves never reference them. Producer/consumer values still hoist: shared input on ancestor + producing technique also declares it as output (input∩output, AP-55).

53. **"`gitnexus-operations::context {name: <symbol>}`"** (invocation passes its argument list in curly braces) —
**Detect:** Technique/operation invocation wraps arguments in braces (`::op {arg: value}`). Braces are the designator namespace (`{input_id}`, `{output_id}.field`, `{$local}`); brace-args collide with designators. Parameter lists use **parentheses attached to the op reference**: `[group](path)::[op](path)(arg: value, …)`. Inside parens: variable/input values keep braces (`(name: {$symbol})`); literals stay bare (`(diagram_type: 'package')`); argument NAMES stay bare. Syntax-defining prose must itself show the paren shape.
**Do not flag:** Brace-with-colon that is NOT an invocation arg list — Cypher node properties in a query string, JSON/output-template slots (`{file: symbol or region}`), raw MCP-tool object-arg docs (`gitnexus_query({query: "…"})`).
**Fix:** Replace brace arg lists with parentheses on the op reference; brace only argument values that are variables/inputs. Mnemonic: `()` calls, `{}` names.

54. **"costs $0.05 per call" / "the $schema field"** (unescaped literal `$` in rendered prose breaks markdown) —
**Detect:** Unescaped `$` in **rendered prose** outside fenced code blocks and inline code spans — prices (`$0.05`), `$schema`, shell `${VAR}` shown in text. GFM treats `$…$` as inline math; two unescaped `$` in one paragraph (or even one) can mis-render. Protocol variables are backticked (AP-59), so their `$` is already math-exempt (do not use `{\$name}` outside code).
**Do not flag:** `$` inside a fence or inline code span (`` `${{ github.event… }}` ``, `` `git -C {$component_git_dir}` ``) — escaping would corrupt the code.
**Fix:** Backslash-escape every literal `$` in rendered prose (`\$0.05`); leave code spans/fences untouched. Displayed output stays `$`.

55. **"`check_status` output, `scope` input (case marks direction)" / "kebab symbol id that won't bind"** (mis-casing the symbol namespace) —
**Detect:** Symbol ids (inputs, outputs, sub-fields, `{$locals}`) in kebab/camel — they must be `snake_case` to bind to activity/condition/session state. Case used to encode input vs output direction. Rule/technique/resource/file/`::` targets wrongly snaked.
**Do not flag:** Tool/MCP/CLI param mirrors keeping the tool's exact spelling (`session_index`, `cloudId`). NAME class stays `kebab-case`: technique/operation/resource identities, hyperlink/`::` targets, and rule names (cited by dotted address, never evaluated). One snake symbol declared in both Inputs and Outputs when the value is input∩output (hoistable per item 52).
**Fix:** Snake every symbol id; keep tool-param mirrors; keep kebab for names/rules; never encode direction in case — direction is the Inputs/Output section.

56. **"`  - If the PR has not merged, wait`"** (a step-scoped caveat written as an indented sub-bullet instead of a `>` note) —
**Detect:** A constraint that qualifies a SINGLE primary instruction — conditional caveat, fallback, error-path, or prohibition ("If X fails, retry"; "only when Y"; "do NOT Z here") — is an indented sub-bullet (`  - …`). The protocol parser's step regex strips leading whitespace, so that line becomes a disconnected *peer* step. Also flag a `## Rules` entry that actually scopes to only one protocol block (global-looking, locally applied).
**Do not flag:** Genuine enumerations or sequential sub-steps (per-harness branch tables, ordered sub-actions) — those stay sub-bullets. Global/cross-step constraints belong in `## Rules` (items 19/24), not as notes. Distinct from item 29 (one-step guidance misfiled as a rule → step/protocol prose, not necessarily a `>` note).
**Fix:** Convert the constraining sub-bullet to a `>` note under its primary instruction (hard line break via two trailing spaces on the primary bullet, then `> ` on the next line). A `>` line is not a step — it folds into the parent and keeps the constraint attached. Demote single-block Rules entries to `>` notes; leave true enumerations as sub-bullets; keep workflow-wide constraints in Rules.

57. **"`.engineering/artifacts/adr/` repeated four times"** (a literal path repeated or shared instead of factored into a variable) —
**Detect:** A filesystem path appears more than once in a technique, or is shared across techniques, as a repeated literal. Fixed conventional location → input with `#### default` holding the literal; every use `{adr_dir}`. Runtime-derived path → `{$local}`. Also: a step hard-codes a path when a declared variable already exists.
**Do not flag:** (a) genuinely single-use literals; (b) the one canonical literal — input `#### default`, producer that constructs it, or the rule that defines the location; (c) distinct values that look similar — per-work-package `{planning_folder_path}` vs workflow-wide root `.engineering/artifacts/planning/`.
**Fix:** Factor repeated/shared paths into a defaulted input (or `{$local}` when derived); reference the designator; keep the literal only at its canonical definition. If the literal contradicts the artifact-location model, correct the LOCATION to the canonical variable — do not enshrine the wrong path in a new variable.

58. **"`git -C {$component_git_dir} …` with no bind" / "`Maintain {$resolution_counts}` never read"** (protocol local unbound or dead) —
**Detect:** (a) **Unbound local** — bare `{name}` that is not a declared I/O (nor ambient activity input such as `{target_path}` / `{branch_name}`) and has no `{$name}` bind in the protocol. (b) **Dead binding** — `{$name}` never read as `{name}`. Declare-once: `{$name}` only at the producing step; reads are bare `{name}` (backticked per item 59); bind textually before every read.
**Do not flag:** `{$name}` in each mutually exclusive producing branch (one runtime path). A `{name}` that is a declared I/O or ambient activity input — if it wore `$`, strip `$` (mis-marked local), do not add a bind.
**Fix:** (a) Name the value at the producer — `` `{$name}` `` inline (no "and bind it to…" narration). (b) Make the consumer read `{name}`, or drop a vestigial bind.

59. **"`set worktree_created = true`" / "run 'git -C …'" / "fetch concept-rag://…"** (code-like token not backticked) —
**Detect:** Bare-in-prose designators (`{id}`, `{$name}`, dotted rule addresses), CLI/shell (including 'single-quoted' commands), MCP tool calls, resource URIs (`scheme://…`), literal paths/filenames — outside an existing code span and not a markdown/`::` link target.
**Do not flag:** Tokens already inside a code span/fence; descriptive prose nouns ("the planning folder"); hyperlink/`::` targets (backtick only invocation argument values). Fragmented spans (`` `git -C` `{x}` ``) are defects — must be one span. Backticks without braces still fail item 49 mode (c).
**Fix:** Wrap each bare code token in one backtick span (designators inside the same span as surrounding command text); convert 'single-quoted' commands; de-escape `{\$name}` to `` `{$name}` `` (math-exempt inside code; see item 54).

60. **"`…_flag` / `assumption_list` / bare `summary` / `do-not-review-unresolved`"** (identifier grammatical shape does not encode its kind) —
**Detect:** Apply four checks —
(1) **Boolean** — non-affirmative stems (`not_ready`, `no_merge`), generic-noun burials (`…_flag` / `…_status` / `…_check`), or ambiguous nouns. Prefer affirmative predicates (`squash_merge_supported`, `index_fresh`). Prefix `is_`/`has_`/`can_`/`should_` only when it sharpens; unprefixed affirmative / past-participle results (`worktree_created`, `*_confirmed`) already conform — do not re-prefix. Shape ≠ meaning: inverted meaning still passes shape.
(2) **Collection/map** — `*_list`/`*_array`/`*_collection`/`*_set` suffixes, or singular id holding an iterated collection. Collections: plural item noun (`tasks`, `failures`). Key-addressed maps: singular mapping name (`domain_to_range`).
(3) **I/O id** — direction-encoded ids; representation proxies (`-path`/`-list`, see items 42/52); synonym drift for one concept; bare single-word generics (`summary`, `artifact`, `coverage`, `state`, `result`, `prompt`). Prefer head-noun-last qualified phrases (`reconciled_assumptions`, `completion_summary`). Flag Inputs/Output heading name collisions within one technique (parent/child or siblings) except true input∩output pass-through.
(4) **Rule slug** — bare negation, process-narration, or prohibited-state names. Prefer positive invariant when at least as clear; keep clear negations (`no-cargo-here`, `do-not-mask-flaky`, `never-resume`). Rule slugs stay kebab (item 55).
**Do not flag:** (3) bare plural collection item-nouns; external tool/schema field spellings; `_mode`/`_type`/`kind` discriminators (suffix is the head). (1) conformant unprefixed affirmatives.
**Fix:** Rename per the matching sub-rule; hoist one concept to one shared id (item 52); drop representation/direction encoding from I/O ids.

61. **"return to the planning stage" / "at the validate activity" / "present the … checkpoint" / "after each task, before confirmation"** (technique references activity-level constructs or its own flow position) —
**Detect:** Technique Capability/Protocol/Rules mention stage/activity (named or "calling/consuming/producing activity"), checkpoint, loop/iteration, transition/decision routing, or position/timing in the activity flow ("after each task", "before user confirmation", "before the next step"). Test: if the sentence answers *where/when in the workflow?* or *which checkpoint/loop surrounds me?*, flag it. Techniques answer only *what do I do and what value do I produce?*
**Do not flag:** Purpose-phrased work with no orchestration locus ("final validation", "no separate commit step follows"); values the technique emits for the activity to route (severity, recommended option id).
**Fix:** Migrate orchestration detail to the activity first (transitions, steps, `step.technique.inputs`/`outputs`, variables, checkpoints, or a technique `rule` — not activity prose rules; see item 62), then delete the reference from the technique. Rewrite remaining prose as purpose, not position.

62. **`rules: ["Manual diff review is FIRST", "all reviews must complete before validate"]`** (prose rules at the activity level) —
**Detect:** Any activity-level `rules:` entry. Activity is pure mechanics — constraints live in `steps[]` order, `when`/`condition`, transitions, decisions, checkpoints, loops — not prose.
**Do not flag:** N/A — activity `rules:` should be empty; behavioral guidance belongs on bound techniques.
**Fix — classify each entry:** (a) restates structure already enforced → **delete**; (b) technique-behavioral constraint → **migrate** to the owning technique (item 27); (c) genuine unenforced constraint → **encode** as `when`/`condition`, transition, decision, checkpoint, or `required: false` (hard gates use `when`/`condition`; step `required` is a worker hint only). End state: no activity `rules:` block.

63. **Reusable primitive trapped in a client workflow / seam-driven set named as a capability / cross-consumer capability buried under one activity name** (technique placement ignores reuse + shape-origin) —
**Detect:** Place by trichotomy — (1) **Reusable primitive** (op boundaries are the capability's own ops — cargo/gitnexus/git) → must live in **meta**, named for the capability. (2) **Cross-consumer / intrinsic capability** (same shape across activities, or reuse-ready remediation like analyze→fix) → **workflow root** (or meta if cross-workflow), named for the **capability** — never one activity's name. (3) **Activity-seam-driven set** (ops exist only because one activity interleaves checkpoints/loops/foreign steps; absent that activity they collapse) → workflow group folder **named for that activity**. Discriminator is **shape-origin**, not consumer count (single-consumer intrinsic capability stays capability-named). Also flag a redundant one-cluster group folder when the group's ops are the workflow's entire operation set (`<group>::` only restates the workflow).
**Do not flag:** Activity-named group folder as organization only — op protocols inside still stay stage-agnostic (item 61). Multiple distinct capability groups composed by one activity stay capability-named (not one seam-driven set). Do not invent a group for a hypothetical second cluster (YAGNI).
**Fix:** Primitive → meta; seam-driven 1:1 → activity-named group; intrinsic/cross-consumer → capability name. Use a group folder only to bound a SUBSET against other top-level techniques; otherwise standalone `techniques/<op>.md` with shared contract in workflow-root `TECHNIQUE.md`.

30. **"Resources are in the response"** (but they aren't) — Technique protocols or tool sections that describe return values inaccurately. If a technique says a tool returns resource content but the tool actually returns lightweight refs, agents will skip the `get_resource` call. Technique tool sections must match actual tool behavior.

31. **"Call start_session, then call next_activity"** (skipping the map) — Bootstrap sequences that omit a tool needed to discover the next step. If `start_session` doesn't return `initialActivity` and the bootstrap doesn't mention `get_workflow`, agents must guess. Every bootstrap sequence must provide a complete path from session start to first meaningful action.

32. **Inconsistent tool names across techniques** — Multiple techniques describing the same tool action using different tool names. When one technique says `get_technique` and another says `get_step_technique`, agents get contradictory guidance. Each tool action must be described with one consistent tool name across all techniques. The canonical name is `get_technique`.

33. **"Pass token to all calls"** — Behavioral guidance duplicated across techniques and tool descriptions. When the same instruction appears in multiple techniques and/or the tool description, updates to one create silent drift in the others. Guidance belongs in one authoritative location; others reference it.

34. **"Returns: Activity definition"** (but it returns everything) — Tool descriptions or technique tool sections that describe mechanics instead of value. A description that says "transitions to the next activity" without mentioning it returns the complete activity definition with steps, checkpoints, and transitions undersells the tool and forces agents to discover the return value experimentally.

35. **Two tools that return the same data** — A tool whose output is a strict subset of another tool's response adds selection ambiguity without adding value. If `next_activity` returns transitions and `get_activities` returns only transitions (requiring `next_activity` to have been called first), the second tool is redundant.

## Execution Anti-Patterns

17. **"I'll just start implementing"** — Present approach and receive confirmation before any modification.

18. **"Here's what I recommend..."** (without doing it) — Recommendations must be followed by implementation. Analysis without action is incomplete.

19. **"The agent must never do X"** (as rule text only) — Critical constraints must be backed by structural enforcement, not just text.

20. **Updated README** (that removes content) — Content-reducing updates require explicit preservation audit and user confirmation.

21. **Writing YAML with JSON/YAML syntax** — Verify format literacy before drafting. Validate all files before commit.

22. **Executing work outside the workflow** — All work must flow through defined activities. Informal combination of results is prohibited.

23. **Defending output when corrected** — Re-examine the output. Never push back on a user correction without evidence.

## Output Economy Anti-Patterns

Workflow-design defects that produce restatement, all-green verdict tables, null ceremony, and dual homes. Counter-model: `manage-artifacts` rules (single-source-and-link, exception-only-reporting, state-once-per-artifact, lean-header, omit-null-sections).

77. **"`COMPLETE.md` + `workflow-retrospective.md` + `close-out-summary.md` + a README footer narrative"** (a terminal activity produces N overlapping end-of-session documents) — Each terminal document re-narrates the same session: delivered items, decisions, validation results, deferred follow-ups, lessons. A workflow defines exactly ONE close-out artifact; the retrospective is a SECTION of it (written by the retrospective technique via update-in-place); the engine's session summary is PRESENTED to the user, never persisted as an artifact (the session state file is the durable trace); the planning README stays an index whose status is one header line. Fix: collapse the terminal artifact contract to one close-out document; retarget the retrospective technique's `#### artifact` at it; delete summary-artifact writes.

78. **"### Test Results" / "### Files Changed" / "*Recorded from the [validation report]*"** (a template section that mandates copying content whose canonical home is another artifact) — Every copy is re-read into context at every downstream activity and drifts the moment its source changes. A template section whose content is produced by another artifact INSTRUCTS A LINK ("see [validation report] — link, don't copy"), it does not lay out a table to fill. The discriminator is the canonical-home question: content is written out in full exactly once, in the artifact whose technique produces it; every other appearance is a markdown link plus at most a one-line pointer. Fix: rewrite the template section as a link instruction; name the canonical home in a comment.

79. **"| Criterion | Target | Actual | Status |" with every row "✅ Met"** (a template mandates a per-item verdict table whose expected steady state is all-pass) —
**Detect:** Template requires a verdict/status table where the expected steady state is all-pass (every row "✅ Met" / "✅ Done" / "✓"). All-green tables carry one bit in N rows and bury the divergence rows that are the payload.
**Do not flag:** Vocabularies downstream steps parse (severity counts, README progress-tracker statuses) — data, not ceremony.
**Fix:** Replace with a one-line all-pass form plus a divergences-only table.

80. **"**Deferred Decisions:** None." / an empty "### Frustration Signals" table / asking the user to confirm that no assumptions were made** (null results rendered at full template shape) — A template defines the MAXIMUM shape of an artifact, not its required shape; a section whose content is "None"/"N/A" is omitted, and a null result is one line, never a headed section with an empty table. The interaction form of the same defect is a checkpoint that asks the user to confirm a null result ("no assumptions were surfaced — confirm?"): record the null and proceed. Fix: mark omissible template sections "[Omit if none]"; replace null-confirmation prompts with a logged one-liner.

81. **"`classification-confirmed` immediately followed by `workflow-path-selected`" / "`rationale-amendment` re-asking what prior options already captured"** (two checkpoints, one decision) —
**Detect:** Second checkpoint's answer is subsumed by the first's options (choosing a path confirms the classification it was derived from; "rationale confirmed — no issues" already answers "any corrections?"). Distinct from AP-5 (agents must not combine declared checkpoints): here the definition itself declares two prompts for one decision.
**Do not flag:** Distinct decisions with non-overlapping answer spaces.
**Fix:** Merge into ONE checkpoint whose options carry the full decision space plus an escape hatch for the subsumed judgement ("revise classification"); move any recording side-effect of the removed checkpoint into the survivor; delete variables whose only consumer was the removed checkpoint's condition.

82. **"`merge-strategy-reminder` — options: [Understood]"** (a checkpoint that carries no decision) —
**Detect:** Every option leads to the same next step, sets no variable, and exists only so the user can acknowledge guidance. Discriminator is recorded effect: acknowledgment/`autoAdvanceMs` that changes nothing is ceremony.
**Do not flag:** Attestation gates (DCO sign-off) that record a certification with identity/timestamp — genuine decisions.
**Fix:** Convert to an `action: message` step; reserve checkpoints for genuine gates. A checkpoint always answered with its default is also a merge (AP-81) or demote (AP-82) candidate.

83. **"**Purpose:** … / ## Overview / > **Key Insight:** … / Good–Bad pairs / ## Quality Checklist / ## Relationship to Other Documents"** (a guide-wrapper resource 3–4× the size of the template it carries) —
**Detect:** Agent-facing resource pads a template with tutorial ceremony — Purpose/Overview restating the title, Good/Bad pairs, Quality Checklists restating the body, relationship/related-guides tables. Runtime load taxes context; keep TEMPLATE plus operative rules (decision criteria, thresholds, format rules, classification vocabularies).
**Do not flag:** Behavioral reference documents (mode mappings, review criteria) that are mostly operative — cut ceremony, keep every mapping.
**Fix:** Rewrite as template + rules; fold each Good/Bad lesson into one rule bullet; drop wrapper sections; verify referenced heading anchors survive.

84. **"### Assumptions Surfaced → ### User Response → ### Outcome → Final Review scorecards"** (a lifecycle log where each pipeline stage appends its own representation of the same item) —
**Detect:** A tracked item (assumption, finding, task) gets a new section at each collect → analyze → decide stage, restating the item 3–4 times. Aggregate scorecards persisted in the log.
**Do not flag:** A full per-item block while the item is still OPEN (deleted on resolution; outcome lives in the row).
**Fix:** Restructure as ONE ROW PER ITEM updated in place — collection writes the row, analysis fills resolution, decision fills outcome. Present aggregate scorecards in-session, not persisted. Rewrite each stage technique's protocol as a row update, not an append.

85. **"## File Index Generation / 1. Ensure the branch is current…"** (a `resources/*.md` section that reads as protocol or rules) —
**Detect:** A resource section is shaped like procedure, rules list, or decision criteria — technique work in the wrong file. Costs: invisible to guards (unparsed `{token}` reads); unaddressable (no dotted rule symbol); dual-homing drift with a paired technique. Discriminators: vocabulary stays a resource when only a TEMPLATE consumes it; becomes a technique rule when OPERATIONS apply it behaviorally. Methodology consumed by a different technique than the filename suggests stays a resource for its real consumer — ownership, not name.
**Do not flag:** Artifact templates/anchors, format skeletons, vocabularies a template consumes, reference lexicons, calibration benchmarks — what the agent FILLS or CONSULTS.
**Fix:** Move does-sections to the owning technique as protocol phases or named rules; replace with a one-line pointer; dissolve the resource when nothing template-shaped remains. Retarget stranded heading anchors; ensure every moved `{token}` resolves under guard coverage (declared id / `{$local}` / workflow variable).

86. **"### Problem Statement in wp-plan / requirements-elicitation / design-framework"** (the same fact category prescribed as a full section by multiple templates of one workflow) —
**Detect:** Several templates in one workflow each mandate a full section for the same fact category (problem statement, success criteria, assumptions/decisions/risks, …). Structural duplication — even a rule-compliant worker restates across documents.
**Do not flag:** Distinct fact categories with genuinely different homes.
**Fix:** Declare a canonical-home map (fact category → exactly ONE home template); other templates use a one-line link slot to the home; back with a conformance gate (AP-88).

87. **"### Key Findings Summary — From KB Research: [key concept discovered]…"** (a template slot whose only possible content is a restatement of another artifact) —
**Detect:** A section is shaped to hold a summary/copy of a different document — even when adjacent prose says "link, don't copy", the slot shape defeats the rule.
**Do not flag:** Sections that record decisions/outcomes of the consuming document itself.
**Fix:** Replace with a link-only inputs list — one line per consumed artifact linking the section that shaped the work (anchors permitted), never its content; the consuming document records only what it DECIDED.

88. **"state-once-per-artifact / single-source-and-link / exception-only-reporting … declared in a TECHNIQUE.md nobody re-checks"** (output-discipline rules with no structural enforcement) —
**Detect:** An output-discipline ruleset exists only as prose with no verify operation at a workflow boundary — style decays per-worker with nothing detecting drift (duplicated homes, null sections, restated slots).
**Do not flag:** Rules already paired with a bound verify/fix-in-place gate (verify-readme-conforms pattern).
**Fix:** Pair every output-discipline ruleset with a verify operation at a workflow boundary — mechanical checks for structural rules, declared line budgets otherwise; gate verifies and fixes in place with no checkpoint, loop, or routing variable.

89. **"assumptions-log / change-block-index / provenance-log / debt-ledger — dense ID-bearing tables as prose markdown between human documents"** (artifact audience undeclared, so format cannot follow function) —
**Detect:** Output declaration carries only a filename; agent-state artifacts (lifecycle logs, indexes, ledgers only downstream steps re-read) default to the same prose-markdown shape as human-facing documents.
**Do not flag:** Human-primary documents that should stay prose.
**Fix:** Decide each artifact's primary audience (human | agent) at design time — human → prose; agent state → structured one-row-per-item data. Record audience in the output declaration's description until the technique protocol carries a first-class audience attribute.

90. **"`spec-confirmed` — message: Full specification across the elicited dimensions`" / "`findings in the report are the change specification.`" (no link)** (a checkpoint or action `message` that names a durable artifact but does not link it) —
**Detect:** User-presented checkpoint or action `message` names or implies a durable planning-folder artifact (specification, report, scope manifest, impact analysis, draft attestation, assumptions log, "change specification" as a file, bare filename) without `[label]({path_variable})`, or the link hard-codes a numeric `NN-` prefix.
**Do not flag:** Pure in-chat subjects (mode classification, counts with no file subject, option choice with no durable artifact); internal `set`/`log` diagnostics that are not user-presented artifact references.
**Fix:** Declare a path output on the producing technique; persist before the message when needed; interpolate `[label]({path_variable})`. Never hard-code `NN-` (write-artifact assigns it). On checkpoints the message stays a statement (item 82 companion: options carry the decision).

91. **"`Impact analysis complete — no removals. Continuing to scope…`" / "`… Accepting in 30s unless you intervene`" / "`(default — auto-accepts after 30s)`"** (message or option description narrates the next course of action) —
**Detect:** Checkpoint/action `message` or option `description` contains next-step or auto-advance narration — "continuing to…", "proceeding in 30s", "unless you intervene", "accepting in…", "attesting in…", "skipping in…", "can proceed without", "(default — auto-accepts/proceeds/skips after …)".
**Do not flag:** Pure factual status clauses ("0 findings", "{n} removals flagged").
**Fix:** Delete the narration; keep timing/routing in `autoAdvanceMs`, `defaultOption`, `transitions`, and option labels only.

92. **"`Here is the full specification. Is it accurate and complete?`" / "`Confirm this target set?`"** (checkpoint `message` asks the question) —
**Detect:** Checkpoint `message` has a trailing `?`, or confirm/interrogative openers ("confirm…", "is this…", "does this…", "would you like…", "which … should").
**Do not flag:** `?` inside interpolated content that is not asking the user.
**Fix:** Rewrite `message` as a statement of the subject (optionally with an item-90 artifact link); put the decision in `options[]` labels.

93. **"`Never use prose where a formal schema construct exists`" / "`Modular over inline`" / checkpoint-message or README authoring standards in `rules.*` or technique `## Rules`** (a design-time authoring constraint filed as a runtime rule) —
**Detect:** A rule in `rules.activity` / `rules.workflow` / `rules.universal` or technique `## Rules` governs how to *write* workflows (schema expressiveness, modular layout, technique binding shapes, README structure, checkpoint message form, approach-before-impl, output economy, …) rather than session runtime conduct. Signals: governs content shape of target YAML/technique/resource files; restates a design principle or anti-pattern; would apply in an unrelated authoring session; not actionable as current-activity session conduct.
**Do not flag:** Runtime keepers — progress-tracker updates, corrections-must-persist, isolation/orchestration models, write-immediately, domain safety floors, worker permissions.
**Fix:** (1) Remove from `rules.*` / technique `## Rules`. (2) Migrate into the workflow-design canon — [design-principles](./design-principles.md), this catalogue, and/or [schema-construct-inventory](./schema-construct-inventory.md) — or confirm an existing principle/AP already covers it. (3) Enforce at authoring time via quality-review anti-pattern audit / structural gate — do not re-inject into `rules.*`.

94. **"`Structural patterns from existing workflows, with proposed structure shown alongside.`" / "`YAML syntax rules and project conventions summary.`" / "`Schema constructs identified as applicable to this workflow.`"** (a checkpoint `message` that only captions the preceding presentation) — After a present-then-checkpoint technique step, the checkpoint `message` must not restate "what I just showed" with no durable subject and no decision-relevant fact. Options already carry the decision; a caption adds nothing the user can open or act on. A message earns its place when it (a) embeds an AP-90 link to a persisted review artifact, (b) states a decision-relevant fact (counts, status, mode classification), or (c) names a loop discriminator the options alone do not (`{current_file}`). Fix: persist the presented material before the gate and link it (`[label]({path})`); if there is nothing worth persisting, drop the caption to the minimal subject that the options decide — never a prose paraphrase of the prior step.

95. **"`audit-anti-patterns` protocol lists AP-41 Flag/Skip/Fix…` while `anti-patterns.md` already defines those criteria" / technique restates a linked resource's checklist, vocabulary, or detect rules"** (the same operative information dual-homed in a technique and its associated resource) —
**Detect:** A technique that loads or links a resource also carries a parallel copy of that resource's operative content — per-item detect/skip/fix lists, classification vocabularies, format rules, numbered criteria, or protocol-shaped checklists that match (or compress) sections of the resource. Signals: protocol bullets keyed by the resource's entry ids; "apply the heuristics below" that restate the catalog; a technique that both says "load resource X" and embeds X's body. Distinct from item 85 (resource holds DOES content with no technique home) and item 44 (resource backlinks its caller): here both files hold the same facts.
**Do not flag:** A one-line pointer or hyperlink to the resource; technique-owned HOW that the resource does not define (orchestration order, which files to walk, how to present findings); a thin paraphrase that adds scan scope without repeating criteria ("walk every catalog entry against activities and techniques").
**Fix:** Choose one home — usually the resource for reusable criteria/templates/vocabularies, the technique for agent procedure — and delete the duplicate. Technique protocol: load the resource, apply each entry as written, record findings. Migrate any technique-only detect/skip/fix detail into the resource before deleting it from the technique.
