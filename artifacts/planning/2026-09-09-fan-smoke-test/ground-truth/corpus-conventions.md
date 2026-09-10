# Corpus conventions for a new workflow

What the corpus demands of a workflow that does not exist yet: the floor for a legal, guard-passing, walkable definition.

## The minimum a workflow needs

MEASURED, not inferred. I copied the whole corpus to /tmp/wfmin/corpus, added candidate workflows, and ran the real guard sweep (npx tsx scripts/check-all.ts --root /tmp/wfmin/corpus --corpus-only), the real e2e walk, and the full 1177-test vitest suite with WORKFLOWS_DIR pointed at it.

ABSOLUTE LOADABLE FLOOR — 2 files, 8 lines, passing all 33 corpus guards and the whole test suite:

  fan-floor/workflow.yaml (5 lines):
    $schema: ../../schemas/workflow.schema.json
    id: fan-floor
    version: 1.0.0
    title: Fan Floor
    initialActivity: alpha
  fan-floor/activities/00-alpha.yaml (3 lines):
    id: alpha
    version: 1.0.0
    name: Alpha

SCHEMA-REQUIRED on workflow.yaml: id, version (pattern ^\d+\.\d+\.\d+$), title, initialActivity. That is all. description, author, tags, rules, techniques, variables, graph, activities, fragments are every one of them optional and no guard demands any. $schema is accepted but not required (editor tooling only). SCHEMA-REQUIRED on an activity file: id, version, name. description, steps, exits, variables, outcome, required, rules are all optional. additionalProperties:false on both, so a typo'd key is a load failure. artifactPrefix is server-computed — never author it.

graph is "omitted only by a workflow whose activities declare no exits" — with no exits anywhere, omit it. The activities: list in workflow.yaml exists only to borrow another workflow's activity files by path (e.g. "work-package/02-design-philosophy.yaml"); local activities/NN-*.yaml are auto-discovered by directory scan, and 16 of 17 corpus workflows omit the list. remediate-vuln is the one that uses it.

NOT REQUIRED, each proven by a passing sweep: README.md at any level (workflow root, activities/, techniques/, resources/); a techniques/ directory at all; a root techniques/TECHNIQUE.md contract; a resources/ directory; techniques.activity: [variable-binding] (all 17 corpus workflows declare it, nothing enforces it, and {token} interpolation resolved fine without it); any variables block; any outcome list; any rules.

MINIMUM GUARD-PASSING, WALKABLE, FAN-SHAPED WORKFLOW — 6 files, 81 lines. Four activities (seed, left, right, converge), one 8-line technique, one workflow.yaml with a graph terminating on __terminal__. Verified: 33/33 corpus guards clean (the one FAIL in every run is a pre-existing work-packages/07-implementation launched-workflows finding from main being ahead of the workflows submodule, not mine); all-workflows-walk reports "[fan-shape] completed | 4 steps | path: seed -> left -> right -> converge"; robot step-execution walk reports executed=["mark-open","note-left","record-branch","mark-closed"], unresolved=[], loadErrors=[].

Files, exactly:
  fan-shape/workflow.yaml (26 lines with two variables; 14 without) — id/version/title/description/variables/initialActivity/graph
  fan-shape/activities/00-seed.yaml (10) — id/version/name/description, one marker step, exits: [{id: done, isDefault: true}]
  fan-shape/activities/01-left.yaml (16), 02-right.yaml (11), 03-converge.yaml (10)
  fan-shape/techniques/record-branch.md (8) — frontmatter with metadata.version, then only "## Capability" and one sentence

Terminal handling: an activity with no exits is terminal by omission (22 of 117 corpus activities are), but the walk then ends with finalStatus "running", not "completed". If the smoke test wants a completed session, route the last exit to the __terminal__ sentinel, as fan-shape does.

For a session: start_session takes only optional params (workflow_id, planning_folder as an absolute path, repo, user_request, agent_id, context_mode). Nothing in a workflow definition has to be registered anywhere for it to be startable — list_workflows reads the corpus directory.

## Workflows that exist for testing today

NONE in the corpus. All 17 corpus workflows exist to do real work. I grepped for smoke / demonstration / demo workflow / for testing / fixture across workflows/ and every hit is domain content (a create-test-plan technique, a tdd-concepts resource), never a test workflow. Nothing named fixture-, test-, demo-, example-.

BUT the repository already has a sanctioned home for exactly this, on main and outside the corpus: tests/fixtures/. Eight synthetic mini-workflows live there, they load through the real loader and the real server harness, and the guard suite never sees them (every corpus guard resolves its root via scripts/workflows-root.ts / tests/corpus-root.ts, which points at workflows/ or WORKFLOWS_DIR — tests/fixtures is neither).

Inventory, with line counts, since these are the cheapest legal workflows in the repo:
  tests/fixtures/fragments/gamma-fixture/workflow.yaml (7) + activities/00-gamma-activity.yaml (24)
  tests/fixtures/fragments/beta-fixture/workflow.yaml (9) + activities/00-beta-activity.yaml (16)
  tests/fixtures/fragments/alpha-fixture/workflow.yaml (37) + activities/00-alpha-activity.yaml (7)
  tests/fixtures/variable-model/bare-fixture/workflow.yaml (10) + activities/00-bare-activity.yaml (4)
  tests/fixtures/variable-model/meta/workflow.yaml (9) + activities/00-bootstrap-activity.yaml (4)   <- a stub meta, so fixture corpora resolve the meta fallback
  tests/fixtures/variable-model/child-fixture/workflow.yaml (12) + activities/00-child-activity.yaml (4)
  tests/fixtures/variable-model/seed-fixture/workflow.yaml (34) + activities 00-checkpoint-activity.yaml (42), 01-followup-activity.yaml (10)
  tests/fixtures/message-binding/binding-fixture/workflow.yaml (18) + 3 activities (42, 37, 19)
  tests/fixtures/markdown-techniques/{meta,work-package}/techniques/... — technique-only trees with no workflow.yaml, including a deliberately malformed-ops/broken.md

The absolute cheapest of them is 14 lines over 2 files: bare-fixture/workflow.yaml (10) plus a 4-line activity whose entire body is id/version/name/description, with the description reading "Placeholder activity so the workflow loads." That is the existing, blessed idiom for a workflow that exists only to be loaded.

This resolves the tension in your goal directly. The illegal fan forms belong in tests/fixtures — the delivery plan already says so in its own acceptance criteria ("One test per load rule. Each of L1 through L14 fails the load with its stated message against a fixture", "Corpus output is byte-identical; fixtures carry the new behaviour", "A fixture fan of each form walks end to end", "A smoke run drives a three-instance fixture fan"). Its stage 7 puts the one real corpus fan in cicd-pipeline-security-audit, not in a new workflow. A new corpus workflow is only needed if you want a fan that the corpus-wide guard sweep and the auto-discovered all-workflows walk exercise on every PR, which the fixtures do not get.

## Naming and placement

DIRECTORY LAYOUT
  workflows/<workflow-id>/workflow.yaml            (required)
  workflows/<workflow-id>/activities/NN-<id>.yaml  (auto-discovered)
  workflows/<workflow-id>/techniques/<slug>.md     (optional; kebab-case)
  workflows/<workflow-id>/techniques/<group>/TECHNIQUE.md + <sub>.md   (a group, addressed group::sub)
  workflows/<workflow-id>/techniques/TECHNIQUE.md  (the workflow-root shared contract; optional)
  workflows/<workflow-id>/resources/<slug>.md      (optional)

THE DIRECTORY NAME MUST EQUAL workflow.yaml's id. resolveWorkflowPath joins workflowDir/<workflowId>/workflow.yaml, so loadWorkflow('x') only finds workflows/x/workflow.yaml (or the legacy root-level workflows/x.yaml). listWorkflows reports raw.id from the file, so a mismatch shows up in list_workflows and then fails to load.

ACTIVITY FILENAME: parseActivityFilename is /^(\d+)-(.+)\.ya?ml$/. Group 1 is the artifactPrefix (any number of digits), group 2 is the activity id.
  - THE SUFFIX AFTER NN- MUST EQUAL THE FILE'S OWN id: FIELD. Verified empirically: I renamed 01-left.yaml to 01-left-branch.yaml leaving id: left, and the workflow still LOADED and all 33 guards still PASSED, but the walk died with "Activity not found: left". get_activity calls readActivityRaw, which scans the activities dir and matches parseActivityFilename(file).id against the session's currentActivity. A silent trap that only a walk catches.
  - Numbering: prefixes need not be contiguous or unique-looking. prism-update starts at 00, codebase-wiki at 01, workflow-design runs 01,03,04,05,06,08,09,10,11 with gaps. Activities sort by localeCompare of the prefix string, which is presentation order in get_workflow only — routing comes entirely from the graph.
  - Files not matching the pattern are skipped, which is why activities/README.md is inert.

IDS
  - Workflow and activity ids: kebab-case in practice across all 17 corpus workflows; no pattern is enforced by the schema.
  - Exit ids: kebab-case, unique within the activity, "in the activity's vocabulary, never an activity id". done, abort, verified, has-issues, review-passed are the corpus vocabulary.
  - Step ids: kebab-case; on a kind:technique step the id is optional and the loader derives it from the last :: segment of the technique name.
  - Variable names: ^[a-z][a-z0-9]*(_[a-z0-9]+)+$ — snake_case with AT LEAST TWO WORDS — or one of about 60 enumerated bare-word exemptions (requirements, findings, items, files, mode, kind, target, state, ...). A one-word invented name like element or roster is a load failure; branch_element and branch_roster are fine.
  - Technique I/O ids: snake_case (camelCase permitted only to mirror an external tool parameter such as cloudId); guarded by identifier-qualification for qualified-noun-phrase shape.
  - Technique Rules names: kebab-case, optionally dot-grouped (commit.signed).
  - Resource ids come from the filename; resources/README.md is skipped by the resource loader.

TECHNIQUE REFERENCES from a step: a bare slug resolves workflow-local first then meta; group::op for a nested op; workflow::group::op cross-workflow. A bare-slug workflow-local technique needs no root TECHNIQUE.md to resolve — proven.

## What an activity must contain

REQUIRED: id, version (semver), name. Nothing else.

CONVENTIONAL FIELD ORDER (from format-conventions.md and every corpus file): id, version, name, description, variables (reads then writes), techniques, required, steps, exits, outcome.

STEPS are an optional, ordered, kind-tagged list. Four kinds:
  - kind: technique — requires kind and technique. technique is either a string ref or { name, inputs?, outputs? }. id optional (derived from the ref).
  - kind: action — requires kind and id. actions may be EMPTY or entirely ABSENT ("may be empty for marker steps"). Action verbs: log, validate, set, emit, message.
  - kind: checkpoint — requires kind and id, then either ref (a fragments.checkpoints import) or an inline message + options (options minItems 1). ref and body are mutually exclusive.
  - kind: loop — requires kind, id, loopType (forEach|while|doWhile) and steps. forEach needs over and variable; while/doWhile need continueWhile. The loop-shape guard rejects a loop that declares the other type's fields.
All four accept when (inline expression), required: false, condition.

Corpus grain: 117 activity files, 639 technique steps, 158 action steps, 114 checkpoint steps, 50 loops. ZERO activities have no steps at all — although the schema and loader both accept it, and my 3-line fan-floor activity proves it loads, walks and passes every guard.

EXITS are optional. 22 of 117 corpus activities declare none and are terminal by omission. When declared:
  - each exit id must be bound in the workflow's graph, or the load fails with "exit 'x' is unbound: add 'activity.x' to the workflow's graph"
  - with two or more exits, EXACTLY ONE must carry isDefault: true; isDefault: false is redundant and rejected (const true in the schema)
  - immediate: true only, false rejected; required: true on a step rejected (AP-64)
  - any checkpoint option's effect.exit must name a declared exit of the owning activity
  - the graph may not bind an exit the activity does not declare, nor name an activity the workflow does not contain, nor send an exit to an unknown destination. Only __terminal__ escapes the destination-existence check.

VARIABLES: variables.reads is a list of names; variables.writes is a list of full variable declarations (name/type/description/defaultValue/values/required) that get merged into the including workflow's variable set at load. Two declarations of one name that disagree on type, defaultValue or values fail the load.

CHEAPEST LEGAL ACTIVITY, 3 lines, verified loading and walking:
  id: alpha
  version: 1.0.0
  name: Alpha

CHEAPEST LEGAL ACTIVITY WITH A REPORTABLE STEP AND A ROUTE, 9 lines, verified executing under the robot walker:
  id: seed
  version: 1.0.0
  name: Seed
  description: Open the fan.
  steps:
    - kind: action
      id: mark-open
  exits:
    - id: done
      isDefault: true

One structural constraint worth knowing before you lay out a fan: the checkpoint-entry guard forbids steps[0].kind == "checkpoint", and no when/condition gate exempts it. A gate you want the smoke run to answer must sit behind at least one non-checkpoint step.

## Steps that bind no real work

A STEP NEED NOT BIND A TECHNIQUE, AND A BOUND TECHNIQUE NEED NOT DO WORK. Both proven by execution, not by reading the schema.

THREE TIERS OF STEP THAT DO NO DOMAIN WORK, cheapest first:

1. MARKER STEP — kind: action with zero actions. Two lines:
     - kind: action
       id: mark-open
   The actions key may be omitted entirely or written as actions: []. It executed under the robot walker (appeared in stepsExecuted), passed all 33 guards, and has TWO CORPUS PRECEDENTS, both spelled actions: [] — prism/activities/00-select-mode.yaml step summarize, and work-package/activities/13-submit-for-review.yaml step await-review (the latter also carrying when: stealth_mode != true). Neither has a technique, and neither writes anything.

2. LOG/MESSAGE-ONLY ACTION STEP — kind: action whose only verbs are log and/or message. 85 of the corpus's 158 action steps are this shape (the announce-start / finalize-activity / announce-completion idiom that opens and closes almost every audit-workflow activity). No technique, no variable traffic, nothing for a guard to check. Note the description-hygiene guard scans action set descriptions and activity description fields for procedure-essay markers, so keep the message one plain sentence.

3. CAPABILITY-ONLY TECHNIQUE STEP — a kind: technique step bound to an 8-line technique file that declares no Inputs, no Outputs, and NO PROTOCOL:
     ---
     metadata:
       version: 1.0.0
     ---

     ## Capability

     Records that this branch of the fan ran.
   This resolved, bound, executed (stepsExecuted included record-branch), and passed all 33 guards including technique-template, binding-fidelity, identifier-qualification, audience and artifact-guides. It is formally sanctioned, not a loophole: docs/technique-protocol-specification.md section 3 annotates the section as "## Protocol (present when the technique does work)", with Inputs, Outputs and Rules each marked "(optional)". The only mandatory content is metadata.version in frontmatter plus a one-paragraph ## Capability. Corpus precedent for a Capability-only file: remediate-vuln/techniques/security-setup/TECHNIQUE.md and nine other 8-line group contracts.

WHY DECLARING NOTHING IS WHAT KEEPS IT CHEAP. The expensive guards only fire on declarations:
  - binding-fidelity's arg-conformance, orphan-input and dead-output all key off declared Inputs/Outputs. Declare none and there is nothing to conform, orphan or strand. (dead-output is exempted by an #### artifact block; orphan-input by a declared default or an "(optional)" marking.)
  - audience and artifact-guides only bite an Outputs entry carrying an #### artifact block.
  - activity-variables only bites names an activity declares in reads/writes, or interpolates.
  - identifier-qualification only inspects technique I/O ids.
Declare no I/O and a smoke technique costs 8 lines and zero guard surface.

THE ONE PLACE THIS BREAKS, and it matters for an instance fan. A {token} in prose must resolve to a producible bag name. I put reads: [branch_element] on a branch activity and interpolated {branch_element} into a log message, with nothing writing it, and got exactly three findings:
  binding-fidelity [read-resolution] fan-shape/activities/01-left.yaml:13 — "{branch_element} has no producer (declared id / $-local / workflow var / set-target) [untriaged — classify it in scripts/binding-fidelity-triage.json]"
  activity-variables [unwritten-read] fan-shape :: left — "reads 'branch_element', which no activity in this workflow writes and the workflow file does not own"
  activity-variables [unreachable-read] fan-shape :: left — "reads 'branch_element' on a path that reaches it before anything writes it"
The fix that works TODAY is to declare the per-instance name in workflow.yaml with a defaultValue; the workflow file then "owns" it and all three findings vanish (verified — full sweep back to 32 pass / 1 pre-existing fail). This is precisely the seam the feature has to close: the delivery plan's stage 3 arrival-intersection and stage 4 synthetic read exist to make a fan's variable a recognised producer at the fanned activity. Until stage 4 lands, a fan smoke workflow must seed its instance variable in workflow.yaml or it goes red on two guards.

Also note a workflow.yaml-owned variable that NOTHING reads is fine — activity-variables' unread-write family applies only to activity-declared writes. My unread branch_roster passed.

## The smallest workflow in the corpus

TWO ANSWERS, because "smallest" splits.

SMALLEST SELF-CONTAINED CORPUS WORKFLOW: prism-update. 18 files, 806 lines, 5 own activities, 9 technique files, 0 resources.
  README.md                                        126
  workflow.yaml                                     45
  activities/README.md                              45
  activities/00-discover-changes.yaml                26
  activities/01-review-changes.yaml                  51
  activities/02-apply-updates.yaml                   37
  activities/03-verify.yaml                          53
  activities/04-commit-and-submit.yaml               19
  techniques/TECHNIQUE.md                            54
  techniques/diff-upstream.md                        73
  techniques/review-change-set/TECHNIQUE.md          14
  techniques/review-change-set/apply-exclusions.md   15
  techniques/review-change-set/compose-summary.md    29
  techniques/submit-update.md                        38
  techniques/sync-resources.md                       47
  techniques/update-prism-docs.md                    31
  techniques/update-skill-routing.md                 35
  techniques/verify-prism-consistency.md             68
Its 26-line 00-discover-changes.yaml is the canonical small activity: id/version/name/description, a variables block with 3 reads and 2 writes, required: true, ONE technique step, one default exit, one outcome line. Its 19-line 04-commit-and-submit.yaml is the smallest corpus activity at 19 lines and has no exits at all (terminal by omission).

RUNNER-UP: codebase-wiki. 22 files, 1289 lines, 4 activities, 7 techniques, 6 resources, 34-line workflow.yaml with no activities: list.

SMALLEST BY workflow.yaml ALONE: cicd-pipeline-security-audit at 32 lines — but the folder is 67 files, so its brevity comes from pushing everything into techniques.

SMALLEST FOLDER BY FILE COUNT: remediate-vuln at 14 files — but it BORROWS 15 activities from work-package via an explicit activities: list and owns only one (01-start.yaml, 215 lines). Not a baseline for a new standalone workflow, though it IS the template for the cheapest way to get a long graph: list another workflow's activity files.

THE HONEST COST BASELINE FOR YOUR SMOKE WORKFLOW: about 800 lines if you write it to corpus convention (prism-update's shape), 81 lines if you write it to the mechanical floor. I built the 81-line version and it is green on 33/33 guards, walks to completed, and executes all four of its steps. The 700-line gap is README prose, technique Protocol sections, variable declarations, and outcome lists — every one of which is convention or human-facing documentation, not a load or guard requirement.

## Gotchas

- FILENAME AND ACTIVITY ID MUST MATCH, and nothing catches a mismatch statically. I renamed 01-left.yaml to 01-left-branch.yaml while leaving id: left inside. The workflow loaded, workflow-yaml validated, and all 33 corpus guards passed. The walk then failed at runtime with "Activity not found: left" and loadErrors non-empty, because get_activity resolves the file through readActivityRaw, which matches the filename's post-NN segment against the session's current activity id. Only a walk catches this.
- A NEW CORPUS WORKFLOW FAILS tests/e2e/coverage-roster.test.ts UNTIL IT IS LISTED ON main. Confirmed: with fan-floor and fan-shape in the corpus the roster test reports "expected [ 'fan-floor', 'fan-shape' ] to deeply equal []" with the message "this workflow is in the corpus but neither walked nor listed as not walked". The list lives in tests/e2e/walked-workflows.ts (WALKED or NOT_WALKED with a stated reason) — which is on main, while the workflow is on the workflows branch. Cross-branch coupling: a corpus-only PR cannot go green, and the paired server PR has to add the entry. This was the ONLY suite failure my new workflows caused across 1177 tests.
- A NEW CORPUS WORKFLOW IS AUTO-WALKED, no opt-in. tests/e2e/all-workflows-walk.test.ts derives its roster by scanning the corpus for workflow.yaml, deliberately ("A hand-maintained list is a second home for which workflows exist, and it drifts silently"). It drives every workflow with defaultPolicy + autoAdvance in mode:'graph' and asserts path.length > 0, orchestratorUnresolved == [], per-step unresolved == [], loadErrors == []. Graph mode executes NO steps, so it cannot see a broken step binding — that lives in the binding-fidelity guard. Step execution for a specific workflow is opt-in via tests/e2e/step-execution-walk.test.ts, which today only names plain-language and prism.
- TERMINAL BY OMISSION DOES NOT COMPLETE THE SESSION. fan-floor (no exits) walked as "[fan-floor] running | 1 steps"; fan-shape (last exit bound to __terminal__) walked as "[fan-shape] completed". If the smoke test asserts a completed session, route the join activity's exit to the __terminal__ sentinel.
- AN UNTRIAGED binding-fidelity FINDING FAILS THE GUARD, and the escape hatch is a JSON file on main. A single unproduced {token} produced "[untriaged — classify it in scripts/binding-fidelity-triage.json]" and turned the guard red. That file carries 72 accepted entries, a corpusSha pin, and a named rationale per entry, with entries requiring human judgement. Another cross-branch coupling for a corpus change.
- AN INSTANCE FAN'S PER-ELEMENT VARIABLE HAS NO PRODUCER TODAY. A branch activity declaring reads: [branch_element] with nothing writing it produced three findings at once: binding-fidelity read-resolution, activity-variables unwritten-read, and activity-variables unreachable-read ("reads it before anything writes it"). Seeding the name in workflow.yaml with a defaultValue clears all three. Until the delivery plan's stage 3/4 land, a corpus fan smoke workflow must do that or go red on two guards.
- VARIABLE NAMES NEED TWO WORDS. The pattern is ^[a-z][a-z0-9]*(_[a-z0-9]+)+$, with about 60 enumerated bare-word exemptions (requirements, findings, items, files, mode, kind, target, state, branch, path, ...). A tempting one-word name like element, roster or slot is a load failure. branch_element, branch_roster pass. Also relevant to the feature's derived key: the activity id in snake case plus _outputs (left_branch_outputs) satisfies the pattern; a single-word activity id would produce left_outputs, which also passes since _outputs is the second word.
- AN ACTIVITY MAY NOT OPEN WITH A CHECKPOINT, gate or no gate. check-checkpoint-entry is purely mechanical (steps[0].kind == "checkpoint") and its rationale is dispatch cost: "A dispatch that only asks a question is the most expensive way to ask one." A when or condition does not exempt it.
- REDUNDANT-TRUE FIELDS ARE REJECTED, not ignored: required: true on a step (const false in the schema, AP-64), isDefault: false on an exit, immediate: false on an exit. And with two or more exits, exactly one isDefault: true is mandatory or the load fails.
- THE GUARD SET IS LIVE AND MOVES UNDER YOU. Between my first and second sweep of the same tree the count went 32 -> 33 as check-launched-workflows.ts appeared (HEAD is at dbd82286 "Hold a declared launch and the step performing it together"). The corpus submodule is behind it, so every sweep I ran carried one pre-existing FAIL on work-packages/activities/07-implementation.yaml that has nothing to do with any new workflow. Expect a workflows-branch sweep to be red until the paired server PR merges; verify by delta, not by absolute green.
- THE WALK SNAPSHOT IS CORPUS-PINNED. tests/e2e/__snapshots__/corpus-sha.json records the submodule commit the baselines were generated against, and tests/e2e/snapshot.test.ts fails when it drifts. Bumping the submodule pointer to add a workflow means re-running npm run baseline:stamp in the same commit.
- THE WORKFLOWS README TABLE IS CONVENTION, NOT ENFORCED. workflows/README.md carries an "Available Workflows" table listing all 17. Nothing mechanically checks it (check-site-links is repo-scope over site/, and no test compares the table to the corpus), but a reviewer will expect the row. AP-40 readme-orients-not-transcribes bounds what such a README may say: no enumerations of steps, exits, graph, bindings, variables, rules, or inventory counts — purpose, a flow diagram, and links to the YAML.
- THE DELIVERY PLAN'S OWN STAGE 1-5 CRITERION PINS CORPUS COUNTS: "17 workflows, 109 activities bound in graphs, 207 graph edges, 18 of them terminal, 0 list-valued and 0 object-valued". A new corpus workflow moves all of those, so it cannot land inside the zero-corpus-movement window. My sweeps read 117 activity FILES and 17 workflows before adding anything, 19 workflows and 122 activities after.
- check-all IS FAST AND ROOT-SWITCHABLE, so iterate against a scratch corpus rather than the live submodule: npx tsx scripts/check-all.ts --root /tmp/<dir> --corpus-only runs the whole 33-guard sweep in about 3 seconds. Tests take the same knob via WORKFLOWS_DIR. Both resolutions are deliberately shared (tests/corpus-root.ts mirrors scripts/workflows-root.ts) so guards and tests never measure different trees.

