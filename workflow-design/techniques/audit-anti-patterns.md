---
metadata:
  version: 1.3.0
---

## Capability

Scan a workflow against the anti-pattern catalog: for each finding record file, content, and recommended fix. Apply the specialized scan heuristics below (they name where to look); when an AP already has Detect / Do not flag / Fix in [anti-patterns](../resources/anti-patterns.md), follow that entry — do not re-derive it from this technique.

## Protocol

### 1. Catalog Pass

- Walk every anti-pattern in [anti-patterns](../resources/anti-patterns.md)
- For each finding: record file, content, recommended fix
- Use the heuristics in phases 2–6 to sharpen common scans; they do not replace the catalog

### 2. Coupling And I/O

- **AP-41 I/O coupling** — Flag: Input/Output entries that name or link a workflow-internal producer/consumer (technique, activity, step, checkpoint, loop, workflow file) via markdown links or "from/produced by/consumed by/for X". Skip: Protocol/Capability utilisation ("use technique X"), resource links, intrinsic/external nature ("git diff output", "user's request"). Fix: describe the value generically; drop source/destination naming
- **AP-42 Canonical artifact ref** — Flag: Protocol uses a literal filename/path; I/O id ends in `-path`; template-backed artifact noun not linked to its resource section. Fix: use `{id}`; drop `-path` proxies; link `[noun](../resources/<id>.md#section)`
- **AP-43 Artifact-name contract** — Flag: filename hardcoded in Protocol instead of I/O declaration; opaque multi-artifact `*-paths` input. Fix: name in I/O (literal, `{token}` template, or discriminator note); split into named Inputs
- **AP-44 Resource→caller** — Flag: resource backlinks a producer/consumer technique ("produced/used by"), links to `../techniques/…`, or "Used By" columns; technique/activity paths in role-mapping tables. Skip: forward "reader should run technique X", ontology mentions. Fix: describe what the resource is; move caller maps to the rendering technique
- **AP-45 Redundant label+link** — Flag: `word ([same-word](url))` (modulo case/hyphen). Skip: preceding label semantically distinct from link text. Fix: collapse to `[word](url)`
- **AP-46 Unresolved output** — Flag: Protocol says "the output/result/artifact" without `{output_id}` or `{output_id}.field`. Fix: name the declared output
- **AP-52 Common input** — Flag: same input concept on many techniques (id drift: `planning-folder` / `planning_folder_path`); `-path` flavored ids. Skip: niche input on only 2–3 techniques. Fix: hoist to workflow-root or group `TECHNIQUE.md` under one canonical id; delete per-technique copies

### 3. Protocol Hygiene

- **AP-47 Protocol self-description** — Flag (except workflow-engine): delivery-mechanism prose ("Resources are attached…", "`_resources`", "loaded via `get_technique`", "self-bootstraps"). Fix: delete; keep imperative + canonical refs
- **AP-48 Raw tool ref** — Flag (except `gitnexus-operations`, `harness-compat`): raw tool names (`gitnexus_context`, `gitnexus_impact`, …). Fix: hyperlinked wrapping op, args preserved
- **AP-49 Designator bracing** — Flag: bare declared id or orphan enum/index ("index 23") without braces. Skip: ordinary English that only coincides with an id. Fix: `{declared_id}` or "when {declared_id} is 23"
- **AP-50 Rule symbol** — Flag: "per the X rule" / `::` used for a rule; dangling rule citation. Fix: dotted `[workflow.]technique.rule` (bare name in-ancestry); or point at real inline content if dangling
- **AP-51 Reference resolvability** — Flag: referential phrase that names a real target but is not anchored (`{id}`, dotted rule, `::` technique link, or resource markdown link). Same for backtick-disguised ids and `<angle>` placeholders of declared ids. Skip: domain prose with no formal target; anaphora already linked once; missing target (separate dangling defect). Specializations: AP-42/46/48/49/50/58
- **AP-53 Invocation args** — Flag: `::op {arg: value}` brace-object args. Skip: Cypher props, JSON/template slots, MCP object-arg docs. Fix: `::op(arg: value)` with designators in `(name: {$symbol})`
- **AP-54 Unescaped `$`** — Flag: `$` in rendered prose outside code spans/fences. Skip: `$` inside code/fences. Fix: `\$`
- **AP-56 Local constraint note** — Flag: indented sub-bullet that is a step-scoped constraint ("If…", "only when…", "do NOT…"); `## Rules` entry that only scopes one protocol block. Skip: genuine enumeration/sequential sub-steps. Fix: `>` note under the parent bullet; migrate single-block rules down to `>` notes
- **AP-57 Repeated path** — Flag: path literal used >1× in a technique, shared across techniques, or duplicating an existing variable. Skip: single-use literal; the one canonical home (input default / producer / location rule). Fix: defaulted input or `{$local}`; if outside `{planning_folder_path}`, flag as location defect. One snake symbol for a value that is both output and input across techniques
- **AP-58 Protocol locals** — Flag: UNBOUND `{name}` read (not an I/O or ambient activity input, no `{$name}` bind); DEAD `{$name}` never read as `{name}`. Skip: `{$name}` in each mutually exclusive producing branch. Fix: bind before read; remove dead binds
- **AP-59 Code-token backticks** — Flag: bare designators, dotted rules, CLI/MCP/URIs/paths in prose; `'single-quoted'` commands; fragmented `` `git -C` `{x}` ``; surviving `{\$name}`. Skip: descriptive nouns ("the planning folder"); tokens already in code spans or link targets. Fix: one backtick span; de-escape to `{$name}`

### 4. Naming

- **AP-55 Case** — Flag: symbol ids (inputs/outputs/sub-fields/`{$locals}`) in kebab/camel → `snake_case`. Skip: tool-param mirrors keeping external spelling; NAMES (technique/op/resource/rule slugs) stay `kebab-case`
- **AP-60 Naming structure** — Apply four checks: (1) **Boolean** — flag non-affirmative (`not_ready`, `…_flag`/`…_status`/`…_check`); recommend affirmative predicate. Skip: unprefixed affirmative / past-participle results (`worktree_created`, `*_confirmed`) — test is affirmative, not prefixed. Shape≠meaning: inverted meaning still passes shape. (2) **Collection/map** — flag `*_list`/`*_array`/`*_collection`/`*_set` and singular ids holding iterated collections; maps stay singular (`domain_to_range`). (3) **I/O id** — flag direction-encoded ids, `-path`/`-list` proxies (see AP-42/52), synonym drift, bare single-word generics (`summary`, `artifact`, …). Skip: `_mode`/`_type` head nouns; bare plural item-nouns; external tool/schema field spellings; kind discriminators. Flag heading name collisions within one technique except true input∩output pass-through. (4) **Rule slug** — flag bare negation / process-narration / prohibited-state names; prefer positive invariant only when clearer; keep clear negations (`never-resume`)

### 5. Activity And Resource Structure

- **AP-65 Authored `artifacts[]`** — Flag: any activity `artifacts[]`. Fix: delete; if a file disappears from the synthesized contract, add `#### artifact` on the producing technique output (not the activity). Non-file side effects (commit, PR) are not artifacts
- **AP-66 Outcome mechanics** — Flag: "`<file>` written", content re-lists, "`<var>` populated". Skip: outcomes already framed as delivered value. Fix: rename-test value statement; delete pure plumbing
- **AP-67 Externalized output** — Apply catalog Detect / Do not flag / Fix. Scan: `set` on bound steps whose target is the technique's product; value-LESS control-step `set`s that source/derive domain payloads
- **AP-85 Resource protocol content** — Flag: resource sections that are procedure, rules, or decision criteria (agent DOES). Skip: templates, format vocabularies, reference lexicons, calibration benchmarks (agent fills/consults). Fix: move to owning technique; retarget `{token}`s and heading anchors; leave at most a one-line pointer

### 6. Messages And Rules

- **AP-90 Message artifact link** — Flag: checkpoint/action `message` names a durable planning artifact without `[label]({path})`, or link hard-codes `NN-` prefix. Skip: in-chat-only subjects; internal `set`/`log` diagnostics. Fix: path output + persist before message + interpolate link
- **AP-91 Next-step narration** — Flag: "continuing to…", "proceeding in 30s", "unless you intervene", "accepting/attesting/skipping in…", "can proceed without", "(default — auto-accepts…)". Skip: pure status facts. Fix: delete; keep timing in `autoAdvanceMs` / `defaultOption` / transitions / option labels
- **AP-92 Statement message** — Flag: checkpoint `message` with trailing `?` or confirm/interrogative openers. Skip: `?` inside non-asking interpolations. Fix: statement subject; decision in `options[]`
- **AP-93 Runtime-only rules** — Flag: design-time authoring guidance in `rules.*` or technique `## Rules`. Skip: session/orchestration keepers (progress tracker, corrections-persist, isolation, write-immediately, safety floors, …). Fix: delete from runtime bucket; migrate to workflow-design canon; enforce via quality-review when needed
- **AP-94 Caption-only checkpoint** — Flag: present-then-checkpoint `message` that only paraphrases the prior technique (no artifact link, no count/status/mode fact, no `{current_file}`). Skip: messages that already carry those. Fix: persist+link (AP-90) or minimal subject

### 7. Present Findings

- Present findings grouped by AP id: file, content, recommended fix
- Include counts; do not restate catalog essays
