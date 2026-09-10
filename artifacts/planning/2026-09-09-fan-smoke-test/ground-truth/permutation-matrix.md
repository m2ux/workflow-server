# The permutation matrix

Every legal form of the widened destination, every refusal the design defines, and where a test can provoke each one.

## Measured counts

MEASURED COUNTS (grep-verified against README.md, not estimated).

LEGAL FORMS: 36 (LF1-LF36). Coverage by axis - 2 non-fan (plain id, sentinel) + 4 list shapes (two bare, three bare, five bare, all-fan-members) + 2 mixed-list variations (bare+fan; per-member ceilings) + 12 instance-fan variations + 16 routing-context and read-form variations. Boundary cases carried explicitly: minimum list arity (2), an uncapped wide list (5 - no ceiling exists for lists), maxInstances at its floor (2), maxInstances absent, maxInstances at/above the default (LF36, which loads - see defect 3), run-time width 1 (only EMPTY is refused), run-time width exactly at the ceiling, a dotted `over`, an exempt bare-word `over`, an exempt bare-word `variable`, slug-string elements, id-carrying-object elements, a MIXED-element collection, a multi-exit branch all of whose exits name the join, a single-word branch id (branch-key totality), a join that is itself a fan source, a join that routes back to the fan's source, a join whose OWN exit is the sentinel, a fan on the initial activity's exit, a join with an alternative non-fan arrival, one activity fanned by two destinations, an activity that is both a branch and a plain destination, and slot-zero indexed reads.

REFUSALS: 38 spec identifiers across four layers, plus 1 unnumbered gate from the delivery plan = 39. At TEST GRAIN (sub-refusals separated, because several rows carry two or three distinct provocations or two distinct messages) = 61 cases, emitted individually above.
- schema: 5 ids (S1-S5) -> 9 cases. S1 alone covers four authored shapes (number, nested list, non-string member, partial object); S2 covers two (one-element, empty).
- load: 14 ids (L1-L14) -> 22 cases. L2 has three arms, L5/L6/L10 two each, L7 three, L9 two message variants.
- tool: 7 ids (T1-T6, T8) -> 15 cases. T1 alone is FIVE refusals, one of which (the ceiling) carries two messages depending on whether the bound is declared or configured, so 6 cases. T3 three, T4 three. T8 is warn-only - detected, not refused.
- store: 1 id (T7, STALE_WRITE) -> 1 case. Deliberately absent from the fan's own enforcement table: it reports that the record moved under a caller, not a fan invariant.
- guard: 11 ids (G1-G11) -> 12 cases (G5 must be asserted in both directions on one fixture).

EXERCISE SITE DISTRIBUTION (61 test-grain cases):
- invalid-fixture: 32 - all 9 schema + all 22 load + the delivery-plan gate. Every one needs a MALFORMED definition, so none can live in workflows/: the workflow-yaml guard fails the corpus on any load error and refs, audience, artifact-guides, stealth-isolation and activity-variables all inherit that result. Repo convention for these is mkdtempSync + writeFileSync temp corpora (tests/workflow-loader.test.ts's load-diagnostics block). L9, L13 and L14 need real activity files, and L9 and L14 each need a fragment-referenced variant, so those are fixture DIRECTORIES rather than one-line graph edits.
- seeded-state: 6 - the five fan-enter refusals plus the ceiling's second message. The corpus workflow stays fully legal; what is malformed is the collection VALUE, seeded into the bag (or reported by a scoping activity) before the transition that enters the fan. This is the group most likely to be misfiled as corpus-workflow: a legal workflow cannot reach these on a CORRECT walk, only on a walk over bad data.
- live-session-call: 10 - T2, T3a-c, T4a-c, T5, T6, T8. A legal workflow, a legal session, a BAD tool call. These need the real corpus fan to exist (something must be in flight) but nothing malformed anywhere.
- corpus-workflow: 1 - T7 only. This is the answer to the tension in the brief: exactly ONE refusal is reachable by a normal walk of a legal corpus workflow, and the spec says so outright ('a fan's acceptance does not require that no refusal appears in its log'). Everything else needs a fixture, a bad call, or seeded data. So the real corpus workflow's job is NOT to provoke refusals - it is to carry every LEGAL form, to be the negative arm for the guard families, and to be the live substrate the bad calls are made against.
- guard-run: 12 - G1-G11 with G5 split. Positive arms need a FIXTURE CORPUS, because activity-variables is hard zero with no ledger to diff. Confirmed mechanism: every corpus guard resolves its root through scripts/workflows-root.ts with precedence `--root` > WORKFLOWS_DIR > default, and requireWorkflowsRoot refuses a missing or empty root, so a fixture corpus must hold at least one real workflow directory. Negative arms (zero findings on a correct fan) belong on the real corpus workflow - and for G3, G5a, G6, G8, G9 and G10 the negative arm is the load-bearing half, because the failure mode is a SILENTLY DISABLED check rather than a wrong answer.
- unreachable: 0. Every spec-identified refusal is provokable somewhere. Two things the spec calls out as beyond reach are NOT refusals and are recorded as blind spots inside G9 and G10 instead: two branches colliding through TEMPLATED names (the distinct arm fails closed), and two ELEMENTS of one collection interpolating to one filename (closed by T1f at run time).

UNREPRESENTABLE: 12 - the ten D-table rows plus two properties the spec calls unrepresentable outside that table (U1, no nested barrier, from 'A destination expands to one flat set of branches, and a member is never itself a list'; U2, combination only in the combine phase, from the Guarantees-that-get-stronger table). None can be tested by provoking a refusal; each entry above states what an assertion can reach instead.

ACTOR OBLIGATIONS (neither refused nor unrepresentable - listed so nothing is mistaken for enforcement): 8. N1 one identity per branch, distinct from siblings' and from the session's own agent (nothing refuses a shared one; the bound exempts a session-equal scope and a scope with no activity yet; visible after the fact in the batch reading). N2 one usage figure per branch (a missing one surfaces in the activities-without-usage diff, both sides instance-qualified, so one figure cannot satisfy N instances). N3 the in-progress mark for every branch reaches the remote before the spawn, in one commit. N4 one persist at convergence naming every branch, before the first branch's transition. N5 a worker executes the activity it was dispatched for (INEFFECTIVE for a list fan, where a membership test admits every branch; EFFECTIVE for an instance fan, because the frontier holds distinct strings and the response reports the instance-qualified id back). N6 no shared unprefixed register and no append-ordered log (deliberately not mechanised - a fannability criterion applied once at design time). N7 a join gathers the container rather than naming a slot (L13 is only its one-sided half). N8 a refused call is repeated with the same arguments. A smoke test asserts these by OBSERVATION - three distinct identities in the delivery ledger, three usage rows, one pre-spawn commit, one convergence persist - never by provoking a refusal.

TOTAL IDENTIFIED ROWS across the six tables: 5 + 14 + 8 + 11 + 10 + 8 = 56.

DEFECTS FOUND, each affecting what a test can assert:
1. The spec claims 'Forty-four invariants are placed across six mechanisms'. The six tables hold 56 rows. No subset yields 44: S+L+T+G = 38; +D = 48; excluding N = 48; S+T+G+D+N = 42. The figure is stale or counts something the tables do not carry, and it should be re-derived before any acceptance criterion quotes it.
2. S1's and S2's row text (and S2's quoted message) say 'a list of at least two ACTIVITY IDS' / 'names at least two activities', but the schema block's own error map says 'a list of at least two MEMBERS - each an activity id or an instance fan', and the array member is z.array(FanMemberSchema). A test asserting either message verbatim will fail against the other. The schema block's text is the one that matches the type, and L2's message already accounts for mixed lists; the parse table's rows are the stale ones.
3. Nothing enforces 'maxInstances only to be tighter than the default'. S3 enforces only min(2), and no load rule compares the declared ceiling against DEFAULT_FAN_MAX_INSTANCES - so LF36 (maxInstances: 8 against a default of 4) parses, loads, and WIDENS the server's bound. The delivery plan's stage-1 criterion 'a destination declaring one loads only where it is tighter than that default' is therefore untestable as written: either a rule is missing, or the criterion must be restated as a convention nothing checks.
4. A LIST's arity is unbounded above. DEFAULT_FAN_MAX_INSTANCES is declared as 'Instance-fan width policy' and maxInstances lives on InstanceFanSchema alone, so a twenty-member list opens twenty workers with no ceiling check anywhere. LF5 makes this explicit; if it is unintended it is a missing refusal rather than a missing test.
5. Ordering hazard in the delivery plan's stages 1-5 load gate (LG): as written it 'rejects any list or object destination OUTRIGHT'. If it runs before the fourteen fan rules it masks every L-rule message and makes stage 1's 'one test per load rule' criterion unsatisfiable. Either the gate appends to the same error list last, or the L-rule tests must call validateExitBindings directly rather than through the load. This needs deciding before stage 1's tests are written, not after.
6. T1c's `layer` reads `tool` above (the fan-enter boundary refusal) while its `exerciseSite` is `seeded-state` (the provocation is a bag value, not a definition). Same for T1a, T1b, T1d, T1e and T1f - the two fields deliberately disagree for this group, and that disagreement is the point: these are tool refusals a legal corpus workflow reaches only over seeded data.

## Legal permutations

### LF1 — LF1 — One activity id (today's form)

Proves: The union's string member accepts every destination the corpus already carries, byte-identically. The frontier holds one entry, so step 4 of the resolution rule always fires and behaviour is identical to today. This is the trivial case and the regression floor.

From: ### The forms an outcome may take; ### 4. The sequential path is unchanged

```yaml
graph:
  plan-prepare:
    done: assumptions-review
```

### LF2 — LF2 — The terminal sentinel

Proves: The sentinel retires and pushes nothing; the completed status is the record. Boundary against L3 (no branch is the sentinel) and L8 (no fan converges on it) — the sentinel stays legal as a plain destination.

From: ### The forms an outcome may take; #### The handler resolves in one rule (step 4)

```yaml
graph:
  combine-research:
    done: __terminal__
```

### LF3 — LF3 — A list of exactly two bare ids (minimum arity)

Proves: The array member's `.min(2)` floor is satisfied at the floor. Two branch keys (`research_outputs`, `codebase_comprehension_outputs`), one derived join, one barrier release. Boundary against S2a (a one-element list).

From: ### The destination schema; ### The forms an outcome may take

```yaml
graph:
  plan-prepare:
    done: [research, codebase-comprehension]
  research:
    done: assumptions-review
  codebase-comprehension:
    done: assumptions-review
  assumptions-review:
    approved: implement
```

### LF4 — LF4 — A list of three bare ids (the flagship distinct-activity fan)

Proves: Three bindings agree, so the join is derived from the graph object alone. Three frontier entries; the first two returns enter nothing and report the barrier; the third empties the frontier and that call enters the join. Uniform slot-zero index on every branch key.

From: ### A fan of several activities; ### A fan of several activities, enter to join

```yaml
graph:
  plan-prepare:
    done: [research, codebase-comprehension, implementation-analysis]
  research:
    done: assumptions-review
  codebase-comprehension:
    done: assumptions-review
  implementation-analysis:
    done: assumptions-review
  assumptions-review:
    approved: implement
```

### LF5 — LF5 — A list of five (a wide list — no ceiling applies)

Proves: `DEFAULT_FAN_MAX_INSTANCES` is declared as instance-fan width policy only, and `maxInstances` lives on `InstanceFanSchema` alone — so a list's arity is unbounded above. Five workers open with no ceiling check. This is a boundary the spec sanctions by omission and it is worth an explicit test because it is also a gap.

From: ### The destination schema (`DEFAULT_FAN_MAX_INSTANCES`, 'Instance-fan width policy'); ### The fan enter

```yaml
graph:
  survey-scope:
    scoped: [lens-a, lens-b, lens-c, lens-d, lens-e]
  lens-a: { surveyed: combine-lenses }
  lens-b: { surveyed: combine-lenses }
  lens-c: { surveyed: combine-lenses }
  lens-d: { surveyed: combine-lenses }
  lens-e: { surveyed: combine-lenses }
  combine-lenses:
    done: __terminal__
```

### LF6 — LF6 — An instance fan, collection named directly, no maxInstances

Proves: The configured default ceiling applies where the destination declares none. One activity, N instance-qualified frontier entries, one branch key with N dense slots. The join agreement is free — all instances share one activity's exit bindings.

From: ### A fan of one activity over a collection; ### The fan enter ('Where a destination declares no ceiling of its own the configured default applies')

```yaml
graph:
  scope-research:
    scoped:
      activity: research-pass
      over: research_topics
      variable: research_topic
  research-pass:
    researched: combine-research
  combine-research:
    settled: plan-prepare
```

### LF7 — LF7 — An instance fan with maxInstances declared tighter than the default

Proves: The optional fourth field parses, the destination's own bound overrides the configured default, and the refusal it produces for a longer collection names the declared bound rather than the default. The stated reason is the authoring convention that goes with it.

From: ### A fan of one activity over a collection; ### The destination schema; ### The fan enter

```yaml
graph:
  scope-research:
    scoped:
      activity: research-pass
      over: research_topics
      variable: research_topic
      # Tighter than the server's ceiling: a pass reads whole documents, and the
      # activity that combines them re-pays every pass's payload to write one report.
      maxInstances: 3
  research-pass:
    researched: combine-research
```

### LF8 — LF8 — An instance fan with maxInstances at its floor (2)

Proves: `.min(2)` is satisfied at the floor. Direct boundary against S3, whose message fires at 1 because a ceiling of one is a plain edge spelled a third way.

From: ### The destination schema (`maxInstances` min message); ### The parse (S3)

```yaml
graph:
  scope-research:
    scoped:
      activity: research-pass
      over: research_topics
      variable: research_topic
      maxInstances: 2
```

### LF9 — LF9 — An instance fan whose collection is a dotted path

Proves: `over` is deliberately not regex-constrained, and L12 checks the HEAD of the expression (`execution_plan`) against the merged variable set — so a dotted collection is checked correctly rather than reported as an unknown name. The fan enter reads the projected value at run time.

From: ### The destination schema ('by name or by a dotted path into a named value'); ### The load rules (L12)

```yaml
graph:
  plan-implementation:
    planned:
      activity: implement-unit
      over: execution_plan.steps
      variable: execution_step
  implement-unit:
    implemented: integrate-units
```

### LF10 — LF10 — An instance fan whose collection name is an exempt bare word

Proves: `over` carries no grammar of its own, so a plural item-noun collection on the AP-60 exemption list (`submodules`) is a legal collection name. L12 finds it in the merged variable set. Boundary case for the un-constrained field.

From: ### The destination schema ('`over` is deliberately not regex-constrained'); src/schema/identifiers.ts EXEMPT_DATA_IDS

```yaml
graph:
  reconnaissance:
    classified:
      activity: submodule-scan
      over: submodules
      variable: scan_unit
  submodule-scan:
    scanned: combine-scans
```

### LF11 — LF11 — An instance fan whose `variable` is an exempt bare word

Proves: `variable` is typed by `VariableNameSchema`, which is a union of the qualified snake_case pattern AND the bare-word exemption enum — so `target` (a cross-workflow dispatch-contract name) parses. Boundary against S4, which fires on an unlisted bare word. Proves the parameter name can match a consuming operation's own input id even where that id is bare.

From: ### The destination schema (`variable: VariableNameSchema`); ### The parse (S4)

```yaml
graph:
  plan-probes:
    planned:
      activity: probe-target
      over: probe_targets
      variable: target
```

### LF12 — LF12 — An instance fan whose elements are slug strings

Proves: The id derivation's first arm — the element itself where elements are slug strings. The projection hands the string whole at one bare name; the unit id names the slot, the gather manifest row and any artifact filename.

From: ### The fan enter ('the element itself where elements are slug strings'); ### How one value reaches one instance

```yaml
# graph
graph:
  reconcile-assumptions:
    converged:
      activity: challenge-pass
      over: challenge_perspectives
      variable: challenge_perspective
  challenge-pass:
    challenged: combine-challenges

# the bag at the fan enter
challenge_perspectives: ["stakeholder-gap", "rejected-paths", "evidence-strength"]

# frontier: challenge-pass#0, challenge-pass#1, challenge-pass#2
# instance 1's load response carries:
#   fan_instance: { variable: challenge_perspective, instance: 1, value: rejected-paths }
```

### LF13 — LF13 — An instance fan whose elements are objects carrying an id

Proves: The id derivation's second arm — the element's `id` field where elements are objects. `value` is the element whole, so a structured unit reaches the instance as one value and the body reads members by ordinary dotted path, exactly as a loop body reads its current item. One value at one name, without forbidding structure.

From: ### The fan enter; ### How one value reaches one instance ('`value` is the element **whole**')

```yaml
# graph as LF6

# the bag at the fan enter
research_topics:
  - { id: auth-model, question: "How is auth modelled?", sources: [rfc, code] }
  - { id: rate-limits, question: "Where are limits enforced?", sources: [code] }

# instance 0's load response carries the element WHOLE:
#   fan_instance: { variable: research_topic, instance: 0, value: { id: auth-model, ... } }
# the activity body projects fields off it by ordinary dotted read:
#   "{research_topic.question}"
```

### LF14 — LF14 — An instance fan whose collection mixes slug strings and id-carrying objects

Proves: Nothing refuses a heterogeneous collection: the derivation is per element (string arm or `id` arm), and only T1e (no derivable id) and T1f (duplicate ids) refuse. A boundary case the spec sanctions by construction and no rule excludes — three distinct ids derive, three slots materialise.

From: ### The fan enter (the two id-derivation arms, applied per element); ### The run-time refusals (the five verbatim messages)

```yaml
scan_units:
  - core
  - { id: adapters, brief: "Adapter surface only" }
  - { id: transport, brief: "Wire protocol" }
```

### LF15 — LF15 — An instance fan whose run-time collection holds exactly ONE element

Proves: Only an EMPTY collection is refused (T1c). A width of one is legal and walks: one entry on the frontier, one dense slot, the single retirement empties the frontier and the same call enters the join. `maxInstances`'s floor of 2 bounds the declared CEILING, never the run-time width — this is the case that proves the two are different quantities.

From: ### The run-time refusals (the empty-collection message names 'a fan of no instances', not 'fewer than two'); ### The destination schema (`maxInstances` bounds the widest fan admitted)

```yaml
# graph as LF6
research_topics: [auth-model]

# frontier: [research-pass#0]
# one branch; its retirement empties the frontier, so THAT call enters combine-research
# container: research_pass_outputs holds exactly one slot
```

### LF16 — LF16 — An instance fan whose run-time width is exactly the operative ceiling

Proves: The ceiling comparison is inclusive at the bound: a collection of exactly the ceiling's length enters. Direct boundary against T1a/T1b, which fire at ceiling+1. Also proves the configured default is what applies when the destination declares nothing.

From: ### The fan enter ('checks the width against the effective ceiling'); ### The destination schema (`DEFAULT_FAN_MAX_INSTANCES = 4`)

```yaml
# maxInstances omitted, so DEFAULT_FAN_MAX_INSTANCES = 4 applies
graph:
  reconcile-assumptions:
    converged:
      activity: challenge-pass
      over: challenge_perspectives
      variable: challenge_perspective

challenge_perspectives: [a-gap, b-gap, c-gap, d-gap]   # length 4 == the ceiling
```

### LF17 — LF17 — A mixed list: bare ids plus an instance-fan member

Proves: A member is an activity id OR an instance fan, so one destination opens a set that is part heterogeneous and part repeated. With three topics this opens FIVE workers in one turn; the frontier holds `knowledge-base-research`, `codebase-analysis` and `web-research` instance-qualified three ways. Two branch keys are single-slot objects and one is a three-slot container. The join is entered by whichever of the five retirements empties the frontier.

From: ### A fan of several activities, some of them over collections

```yaml
graph:
  scope-research:
    scoped:
      - knowledge-base-research
      - codebase-analysis
      - activity: web-research
        over: research_topics
        variable: research_topic
  knowledge-base-research:
    surveyed: combine-research
  codebase-analysis:
    surveyed: combine-research
  web-research:
    surveyed: combine-research
  combine-research:
    done: __terminal__
```

### LF18 — LF18 — A list every one of whose members is an instance fan

Proves: A list needs no bare-id member at all: two instance-fan members over DIFFERENT collections running DIFFERENT activities is legal, and each is checked (L11, L12) against the activity it runs. The flat branch set is the sum of both expansions, still one barrier.

From: ### A fan of several activities, some of them over collections ('Ceilings and parameters are per member'); ### The load rules (L11, L12 — 'Applied per instance-fan member')

```yaml
graph:
  scope-sweep:
    scoped:
      - activity: web-research
        over: research_topics
        variable: research_topic
      - activity: submodule-scan
        over: scan_units
        variable: scan_unit
  web-research:
    surveyed: combine-sweep
  submodule-scan:
    scanned: combine-sweep
  combine-sweep:
    done: __terminal__
```

### LF19 — LF19 — Two instance-fan members of one list at different declared ceilings

Proves: Ceilings are per member, so members of one list carry different operative ceilings — one declared, one defaulted. L13's ceiling read is 'the member's own `maxInstances` where it declares one and the configured default otherwise', so an authored index is bounded per member rather than per destination.

From: ### A fan of several activities, some of them over collections; ### The load rules (L13)

```yaml
graph:
  scope-sweep:
    scoped:
      - activity: web-research
        over: research_topics
        variable: research_topic
        maxInstances: 2
      - activity: submodule-scan
        over: scan_units
        variable: scan_unit
        # no maxInstances: takes the configured default of 4
```

### LF20 — LF20 — A fan reached through a when-predicated exit, with a sibling exit routing past it

Proves: A fan is bound to a predicated exit like any destination, and this is the spec's own prescribed remedy for a possibly-empty collection: 'Route past the fan with a `when` predicate on the exit where there may be nothing to fan.' Also exercises T2 — a transition off this activity must say which exit it took, because `done` is not the only binding and one of them fans.

From: ### The run-time refusals (the empty-collection message's remedy); ### The run-time refusals (T2)

```yaml
# activities/02-scope-research.yaml
exits:
  - id: scoped
    when: has_research_topics == true
  - id: nothing-to-research
    isDefault: true

# workflow.yaml
graph:
  scope-research:
    scoped:
      activity: research-pass
      over: research_topics
      variable: research_topic
    nothing-to-research: plan-prepare
  research-pass:
    researched: combine-research
  combine-research:
    settled: plan-prepare
```

### LF21 — LF21 — A branch declaring MORE THAN ONE exit, every exit bound to the same join

Proves: L7 is 'every exit of EVERY branch names one and the same activity' — not 'one exit per branch'. A multi-exit branch is legal provided all of its exits converge. This is the case that distinguishes L7 from L4 and is the easiest legal form to get wrong in an implementation that reads only a branch's default exit.

From: ### The load rules (L7); ### What a fannable activity is (condition 3: 'At least one exit, and every exit binding to one destination')

```yaml
graph:
  plan-prepare:
    done: [research, codebase-comprehension]
  research:
    thorough: assumptions-review
    thin: assumptions-review
  codebase-comprehension:
    done: assumptions-review
  assumptions-review:
    approved: implement
```

### LF22 — LF22 — A branch carrying its retry as an internal loop step

Proves: L6's own remedy, expressed positively: 'a retry belongs inside the branch as a loop step'. A branch may iterate internally without routing an exit back onto itself. Proves L6 refuses the graph self-edge and not the in-activity loop.

From: ### The load rules (L6); ### What a fannable activity is (condition 2)

```yaml
# activities/04-research.yaml
steps:
  - kind: loop
    id: refine-until-sufficient
    loopType: doWhile
    continueWhile:
      variable: findings_sufficient
      operator: equals
      value: false
    steps: [ ... ]
exits:
  - id: done
    isDefault: true

# workflow.yaml — one exit, one destination, no self-route
graph:
  plan-prepare:
    done: [research, codebase-comprehension]
  research:
    done: assumptions-review
```

### LF23 — LF23 — A join that is itself the source of another fan (chained fans)

Proves: L5 forbids a BRANCH fanning again; nothing forbids a JOIN fanning. The frontier returns to length one at the join before the second fan opens, so D3 ('at most one fan is open') survives a chained graph — this is the form that proves D3 is a consequence of L5/L6/L7 rather than of an ambient one-fan-per-session rule. It also chains a list fan into an instance fan, exercising both forms in one walk.

From: ### The load rules (L5); ### What is unrepresentable (D3); ### The session record ('this holds either a single activity or the branches of exactly one fan')

```yaml
graph:
  plan-prepare:
    done: [research, codebase-comprehension]
  research:
    done: assumptions-review
  codebase-comprehension:
    done: assumptions-review
  assumptions-review:
    approved:
      activity: implement-unit
      over: work_units
      variable: work_unit
  implement-unit:
    implemented: integrate-units
  integrate-units:
    done: __terminal__
```

### LF24 — LF24 — A join routing back to the fan's source (a convergence cycle, so the fan is entered twice)

Proves: 'The cycle is legal, and it is how a convergence loop lives in the graph.' L6 constrains a branch routing onto ITSELF and says nothing about a meeting point routing back to a fan's source. The second entry materialises the container afresh (D9), so a round-two collection of two elements leaves a two-slot container with no residue of round one. The iteration ceiling is ordinary state — a round counter the join writes and an exit predicate over it.

From: ### A second entry of the same fan; ### The load rules (L6); ### What is unrepresentable (D9)

```yaml
graph:
  scope-research:
    scoped:
      activity: research-pass
      over: research_topics
      variable: research_topic
  research-pass:
    researched: combine-research
  combine-research:
    insufficient: scope-research      # back to the fan's source
    settled: plan-prepare
  plan-prepare:
    done: __terminal__
```

### LF25 — LF25 — A join whose OWN exit is the terminal sentinel

Proves: The answer to 'is a fan whose join is the terminal sentinel legal?' — NO for the fan's own convergence (L8 refuses it: there is nothing to enter at the end of a run), but YES for the join's own exit. The spec's mixed-list example uses exactly this shape. The pair LF25/L8 is the sharpest boundary in the whole matrix and a test must carry both halves.

From: ### A fan of several activities, some of them over collections (the worked example ends `combine-research: done: __terminal__`); ### The load rules (L8)

```yaml
graph:
  scope-research:
    scoped: [knowledge-base-research, codebase-analysis]
  knowledge-base-research:
    surveyed: combine-research
  codebase-analysis:
    surveyed: combine-research
  combine-research:
    done: __terminal__
```

### LF26 — LF26 — A fan on the initial activity's exit

Proves: No rule reserves the first activity. The fan enter's step 1 ('Unnamed with at most one entry: the sole entry, or NONE on the first call of a session') covers a session whose very first advance opens a fan. Also the review-mode-gating case the spec singles out: 'for a fan sitting between the initial activity and the rest of the graph that is most of the workflow'.

From: #### The handler resolves in one rule (step 1); ### The guard suite (`review-mode-gating`)

```yaml
graph:
  initialize-audit:
    initialized: [inventory-workflows, inventory-submodules]
  inventory-workflows:
    inventoried: plan-scan
  inventory-submodules:
    inventoried: plan-scan
  plan-scan:
    planned: __terminal__
```

### LF27 — LF27 — A join that also has an alternative NON-fan arrival

Proves: The arrival-intersection shape the spec draws. The completed fan is ONE arrival contributing the union of its branches' outgoing sets; `review-outcome` is its own arrival; the two arrivals intersect. Left as a predecessor intersection the guard reports false findings on this correct graph; left unflattened it reports nothing at all. This form is what makes G5 testable in both directions.

From: #### The meet (and the 'The meet at a fan's join' diagram); ### The guard checks (G5)

```yaml
graph:
  plan-prepare:
    done: [research, codebase-comprehension, implementation-analysis]
  research:
    done: assumptions-review
  codebase-comprehension:
    done: assumptions-review
  implementation-analysis:
    done: assumptions-review
  review-outcome:
    revisit: assumptions-review        # an ordinary predecessor: its own arrival
  assumptions-review:
    approved: implement
```

### LF28 — LF28 — A single-word activity id as a branch (branch-key totality)

Proves: 'The suffix is what makes the derivation total.' A variable name must be a snake-case noun phrase of at least two words, and `research` alone would need an exemption entry — the uniform `_outputs` suffix removes that list. Proves L10 passes for the single-word case without any exemption, and pairs with L10a where the id begins with a digit.

From: #### The suffix is what makes the derivation total; ### The load rules (L10)

```yaml
graph:
  plan-prepare:
    done: [research, codebase-comprehension]
# branchKey('research')               -> research_outputs                (2 words: legal)
# branchKey('codebase-comprehension') -> codebase_comprehension_outputs  (legal)
```

### LF29 — LF29 — One activity fanned by TWO different destinations, both handing the element at the same name

Proves: L11 fails only where two fans of one activity DISAGREE about the parameter name, so agreement is legal and no cross-fan comparison exists. Both fans share one branch key (`research_pass_outputs`) because the key belongs to the activity, not the fan — so the second entry resets the container (D9). Both fans converge on the same join by construction, since `research-pass` has one set of exit bindings.

From: ### The load rules (L11); ### A second entry of the same fan ('A branch key belongs to the activity, not to the fan')

```yaml
graph:
  scope-research:
    scoped:
      activity: research-pass
      over: research_topics
      variable: research_topic
  plan-followups:
    planned:
      activity: research-pass
      over: followup_topics
      variable: research_topic        # the SAME parameter name
  research-pass:
    researched: combine-research
  combine-research:
    insufficient: plan-followups
    settled: report
```

### LF30 — LF30 — An activity that is BOTH a fan branch and a plain destination of another exit

Proves: No rule reserves a branch activity to fan use. Its exit bindings are fixed, so a sequential arrival at `research` simply routes onward to the same join. This is the intra-workflow analogue of 'each is borrowable into a workflow that routes it sequentially', and it stresses the write path: entered sequentially the activity's reported map must still land under its branch key, because the wrap is derived from the graph fanning it and not from how the run arrived.

From: ### A fan of several activities ('each is borrowable into a workflow that routes it sequentially'); ### The write path; ### The variable declaration ('Contribution stays per workflow')

```yaml
graph:
  plan-prepare:
    done: [research, codebase-comprehension]
  quick-path:
    skip-comprehension: research      # a plain, sequential arrival at a branch activity
  research:
    done: assumptions-review
  codebase-comprehension:
    done: assumptions-review
  assumptions-review:
    approved: implement
```

### LF31 — LF31 — Branches declaring NO artifact; the join writes the document (the rule)

Proves: The artifact rule, under which G9 and G10 become VACUOUS rather than failing open: every filename-reading guard, the guide map, the audience declaration and the find-or-update discipline all see exactly one writer at one filename. The corpus's strongest shape match (adversarial challenge) already satisfies it.

From: ### Artifacts ('A fan branch declares no artifact'); ### The guard checks (G9, G10)

```yaml
# activities/04-challenge-pass.yaml — binds no artifact-declaring technique
variables:
  reads: [challenge_perspective, assumptions_log]
  writes:
    - name: perspective_findings
      type: array

# activities/05-combine-challenges.yaml — the single writer at one filename
steps:
  - kind: technique
    id: gather-perspective-findings
    technique:
      name: orchestration-patterns::gather-results
      inputs:
        dispatched_results: challenge_pass_outputs
        expected_ids: challenge_perspectives
  - kind: technique
    id: write-assumptions-log
    technique:
      name: workflow-engine::write-artifact
```

### LF32 — LF32 — An instance-fanned branch whose artifact name is token-templated on the fan's parameter (sanctioned deviation)

Proves: The sanctioned deviation: the parameter itself where elements are id strings, or a dotted projection onto the element's `id` where they are objects. Sanctioned in all three places that would otherwise reject it — the artifact-name pattern admits a token where literal text would stand, the anti-pattern catalogue exempts a run-time-resolving placeholder, and the writer treats a token-templated name as an intentional series, each interpolated name its own logical artifact, created and never matched against siblings. Two live corpus precedents ship green on exactly this shape, and they migrate untouched because the parameter is authored rather than derived.

From: ### Artifacts ('The sanctioned deviation puts the unit in the filename'); ### The guard checks (G10); #### The artifact question is already solved in the corpus, twice

```yaml
# techniques/scan-submodule/TECHNIQUE.md declares:
#   artifact: '{scan_unit}-scan-findings.json'
# plus one guide-map row in the producing workflow's resources README,
# spelled with the token verbatim.

graph:
  reconnaissance:
    classified:
      activity: submodule-scan
      over: scan_units
      variable: scan_unit
  submodule-scan:
    scanned: combine-scans
```

### LF33 — LF33 — The instance-fan join gathering the container whole, with the fan's own collection as expected ids

Proves: The only legal read form for an instance fan's join, because the width is a run-time length and no grammar in the tree admits indirection. Two renames and one dotted projection — the three sanctioned deviation forms, no new construct, no new operation. The expectation list binds the fan's OWN collection unchanged, so no derived bag name carries it: the graph names the collection, the join reads the collection, one home. This is also `a-join-gathers-the-container-not-an-index` (N7) satisfied.

From: ### The gather at the join; ### What each branch lands, and how a join reads it

```yaml
# steps of the activity the fan converges on
steps:
  - kind: technique
    id: gather-topic-findings
    technique:
      name: orchestration-patterns::gather-results
      inputs:
        dispatched_results: research_pass_outputs
        expected_ids: research_topics
  - kind: technique
    id: combine-research
    technique:
      name: research-sweep::combine
      inputs:
        topic_findings: "{gathered_results.items}"
      outputs:
        research_document: research_document
```

### LF34 — LF34 — The distinct-activity join spelling indexed dotted reads at slot zero

Proves: A distinct-activity fan's join CAN spell its reads, because N is authored. The index is uniform — always present, including slot zero for a fan of distinct activities, where each branch has exactly one instance — so an activity borrowed into two workflows does not need different reads in each. Both read walkers handle the numeric segment unchanged. Boundary against G4, where the SAME read with the index omitted addresses nothing and is reported.

From: #### The read form takes the index; #### The shape it takes ('The index is uniform'); ### The guard checks (G4)

```yaml
steps:
  - kind: technique
    id: gather-branch-assumptions
    technique:
      name: review-assumptions::reconcile
      inputs:
        research_assumptions: "{research_outputs.0.result.open_assumptions}"
        comprehension_questions: "{codebase_comprehension_outputs.0.result.open_questions}"
        analysis_assumptions: "{implementation_analysis_outputs.0.result.open_assumptions}"
      outputs:
        reconciled_assumptions: open_assumptions
```

### LF35 — LF35 — A branch that writes a working value and reads it back within its own steps

Proves: The self-consumed exemption, carried forward at member grain. Without it G3 fires on the order of 35 times on one correct fan, most of a branch's declared writes being intra-activity working values — loop items, step gates, values one step hands the next. Inside a branch names stay BARE: a branch's later steps read its earlier outputs as internal reads, never through the branch key. A legal form whose whole point is that it must produce ZERO findings.

From: ### The guard checks (G3); ### The guard suite ('The unread-write check at member grain carries the self-consumed exemption forward')

```yaml
# activities/04-research.yaml
variables:
  reads: [research_topic, problem_statement]
  writes:
    - name: source_queue        # written by step 2, read by step 4 of THIS activity
      type: array
    - name: open_assumptions    # gathered at the join
      type: array
```

### LF36 — LF36 — An instance fan whose maxInstances equals or exceeds the configured default (loads; convention-only)

Proves: S3 enforces only `min(2)`; no schema rule and no load rule enforces 'tighter than the default'. So this parses and loads, and the effective ceiling becomes 8 — the destination WIDENS the server's bound rather than narrowing it. Listed because the delivery plan's stage-1 criterion asserts 'a destination declaring one loads only where it is tighter than that default', which nothing in the spec's enforcement tables backs. Either a rule is missing or that criterion is untestable as written; a test must be written against whichever answer is chosen.

From: ### The parse (S3); ### The destination schema ('declared only where the work wants a tighter bound'); delivery-plan.md Stage 1 acceptance criteria

```yaml
graph:
  scope-research:
    scoped:
      activity: research-pass
      over: research_topics
      variable: research_topic
      maxInstances: 8          # DEFAULT_FAN_MAX_INSTANCES is 4
```

## Refusals, and where each is exercised

| Rule | Layer | Exercise site | Invariant | Trigger | How |
|---|---|---|---|---|---|
| S1a | schema | invalid-fixture | A destination is an activity id (or the terminal sentinel), a list of at least two members, or a single instance fan | The destination is a scalar that matches no union member — e.g. `done: 42`, a boolean, or null | One-line graph edit in a mkdtempSync temp corpus (the style of tests/workflow-loader.test.ts's load-diagnostics block). Assert the union error-map message verbatim; without the map this renders as bare `Invalid input`. Cannot live in workflows/ — the workflow-yaml guard fails the corpus on any load error and six other guards inherit that result. |
| S1b | schema | invalid-fixture | A list member is never itself a list, so a nested barrier is unrepresentable | A list member is an array — `done: [[research, codebase-comprehension], survey]` | Same temp-corpus fixture. FanMemberSchema is `z.union([z.string(), InstanceFanSchema])`, so an array member matches neither and the map renders. Pair the assertion with a check that the generated JSON schema's `items` subschema carries no array branch — that is the structural half of the same claim. |
| S1c | schema | invalid-fixture | Every list member is an activity id or an instance fan | A list member is a non-string, non-object scalar — `done: [research, 42]` | Same fixture shape. Distinct from S1b because the offending member is a scalar rather than a nested collection; both render the map, and a test that covers only one leaves the other's path unproven. |
| S1d | schema | invalid-fixture | An instance fan names all three of activity, over and variable | A fan object missing any of the three required fields — `done: { activity: research-pass, over: research_topics }` | Temp-corpus fixture, one destination per required-field omission (three cases). A partial object matches no union member far enough to surface a field error, which is WHY the error map enumerates all three required fields — assert the map's text names activity, over and variable, or the map's load-bearing content is untested. |
| S2a | schema | invalid-fixture | A fan names at least two members | A one-element list — `done: [research-pass]` | Temp-corpus fixture. Assert the ARRAY member's own arity message, not the map: that branch matched furthest, and the spec is explicit that the map does not suppress it. A one-element list is a plain destination spelled a second way, which One Authoritative Home forbids. |
| S2b | schema | invalid-fixture | A fan names at least two members | An empty list — `done: []` | Same fixture, same expected message as S2a. Worth its own case because an empty array and a one-element array reach `.min(2)` by different paths and a naive implementation can render the map for one and the arity message for the other. |
| S3 | schema | invalid-fixture | A declared instance ceiling admits at least two instances | `maxInstances: 1` (and by extension 0, a negative, or a non-integer) | Temp-corpus fixture with an otherwise well-formed fan. Assert the maxInstances FIELD message wins over the map, because that member matched furthest. A ceiling of one is a plain edge spelled a third way. Pair with LF8 (maxInstances: 2 loads) so the boundary is proved from both sides. |
| S4 | schema | invalid-fixture | A fan's parameter is a legal variable name | `variable: topic` — a single bare word that is not on the AP-60 exemption list | Temp-corpus fixture. `variable` is TYPED by VariableNameSchema rather than checked by a load rule, which is exactly what removes the need for a grammar rule of its own — so the test must assert the qualified-name message from the parse, not a load error. Pair with LF11 (`variable: target`, an exempt bare word) to prove the union's second member is live. |
| S5 | schema | invalid-fixture | A fan carries no field outside the four | An unrecognised key on the fan object — `{ activity, over, variable, unit: q }` | Temp-corpus fixture. Assert `Unrecognized key(s) in object: 'unit'`. The `.strict()` is load-bearing for authoring feedback: this message is what tells an author the output key is DERIVED rather than authored. Also assert `additionalProperties: false` in the regenerated schemas/workflow.schema.json — same claim, other surface. |
| L1 | load | invalid-fixture | Every branch is an activity this workflow contains | A branch names an unknown activity — a misspelled bare list member, or an instance-fan member's `activity`, or a whole-destination fan's `activity`, that is in no activity file of this workflow | Temp corpus with a valid activity set and one misspelled destination target. Three fixtures, one per position (bare member, list-member fan, whole-destination fan), because this is the one edit to STANDING code — the existing destination-existence check now iterates the destination's targets and keeps its message per target, so a per-target loop that misses one position fails silently. |
| L2a | load | invalid-fixture | A list names no activity twice | Two bare list members name one activity — `done: [research, research]` | Temp-corpus fixture. Two members over one activity would derive one branch key and write one container, so this is what keeps the keys distinct. Assert the message names the activity and the fan as `<source>.<exit>`. |
| L2b | load | invalid-fixture | A list names no activity twice, counting the activity each instance-fan member runs | A bare member and an instance-fan member name one activity — `[web-research, { activity: web-research, over: research_topics, variable: research_topic }]` | Temp-corpus fixture. This is the arm a set built from bare strings alone would miss. Assert the message's remedy clause: 'to run one activity once per work unit, name it with the collection it runs over in a single member'. |
| L2c | load | invalid-fixture | A list names no activity twice, counting the activity each instance-fan member runs | Two instance-fan members run one activity over different collections | Temp-corpus fixture. The third arm, and the one closest to a legitimate authoring intent (two collections, one activity), so its message matters most. Contrast with LF29, where the two fans sit on DIFFERENT source exits and are legal. |
| L3 | load | invalid-fixture | No branch is the terminal sentinel | A list member is `__terminal__` — `done: [research, __terminal__]` | Temp-corpus fixture. An activity that ends the run never returns, so the fan would have no last branch to release its destination. Note this is a LOAD rule, not a parse error: the sentinel is a legal string, so the union accepts it and only the load can reject it in a member position. |
| L4 | load | invalid-fixture | Every branch binds at least one exit | A branch activity declares no exits (terminal by omission), so the graph holds no bindings for it and the fan has no destination to converge on | Temp corpus with a branch activity file whose `exits` is omitted. This is the failure the corpus's own fan-out pattern activities would hit on migration — the orchestrator-workers pattern activity 'declares no exits, so a fannable per-unit activity must declare one'. Assert the message's remedy: 'Give it an exit bound to the activity its siblings name.' |
| L5a | load | invalid-fixture | No branch fans again | A branch's exit is itself bound to a list or an instance fan — `research: { done: [deep-dive, survey] }` where `research` is a branch | Temp-corpus fixture. This rule is the whole structural basis of D3 (at most one fan open, so the frontier needs no fan identity) — assert its message and then assert, separately, that the session schema's frontier carries no fan-identity field. Cover both list-valued and object-valued inner destinations. |
| L5b | load | invalid-fixture | No branch fans again — which also rejects a branch that is the fan's own source | A destination names its own source as a member — `plan-prepare: { done: [plan-prepare, research] }`, so `plan-prepare`'s exit is the fan itself | Temp-corpus fixture. The spec lists 'a branch that is the fan's own source' among the three rules a reader may EXPECT and that are absent because another rule already rejects the case — so the test must assert this fixture fails with L5's message and NOT with a rule of its own. A test that accepts any load failure here would not detect a spurious fifteenth rule. |
| L6a | load | invalid-fixture | No branch routes an exit back onto itself | A branch binds one of its exits to itself — `research: { insufficient: research, done: assumptions-review }` | Temp-corpus fixture. Note the fixture will ALSO violate L7 (the two exits name different destinations), so the assertion must be on the presence of L6's message in the error list rather than on it being the only error — the fourteen rules run in one loop into one error list. Pair with LF22, where the retry sits inside the branch as a loop step and loads. |
| L6b | load | invalid-fixture | No branch routes an exit back onto itself — which also rejects a join that is one of its own branches | Every branch binds its exits to an activity that is itself a branch of the same fan, so that branch's exits must name itself | Temp-corpus fixture, e.g. `s: { done: [x, y] }`, `x: { done: y }`, `y: { done: y }`. The second listed 'absent rule a reader may expect'. Assert it fails with L6's message and no rule of its own, for the same reason as L5b. |
| L7a | load | invalid-fixture | Every exit of every branch names one and the same activity — the join | Two branches send their exits to different activities | Temp-corpus fixture with three branches, two agreeing and one not — the spec's own example. Assert the message spells out ALL THREE destinations it found, grouped by which branches named them; that enumeration is stated as the author's fix site and is the part an implementation is most likely to shorten. |
| L7b | load | invalid-fixture | Every exit of every branch names one and the same activity | ONE branch declares two exits that name different destinations | Temp-corpus fixture: a two-exit branch, one exit to the join and one elsewhere. Distinct from L7a because an implementation that reads only a branch's default exit passes L7a and lets this through. Pair with LF21, where both exits name the join and it loads. |
| L7c | load | invalid-fixture | The join is defined — undefined where the branches disagree, name more than one each, or name NONE | The derivation yields an undefined join because no branch names any destination reachable as a single activity | Temp-corpus fixture. 'An undefined join fails the load — which is why every reader downstream takes the join as a string on the load's authority.' Worth its own case because it is the invariant every downstream reader's type rests on; a test asserting only L7a leaves the undefined-join path unproven and the downstream non-null assumption unearned. |
| L8 | load | invalid-fixture | The join is an activity, not the terminal sentinel | Every branch binds its exits to `__terminal__` — `done: [a, b]`, `a: { done: __terminal__ }`, `b: { done: __terminal__ }` | Temp-corpus fixture. THE sharpest boundary in the matrix: this fails, while LF25 (the JOIN's own exit bound to the sentinel) loads. A test suite must carry both or the distinction is unproven, and a naive implementation that simply forbids the sentinel anywhere downstream of a fan would break every legal fan that ends a workflow. |
| L9a | load | invalid-fixture | No branch declares a checkpoint step | A branch activity's flattened steps — fragment references included — contain a checkpoint step | Temp corpus needing a real activity file, and a SECOND fixture whose checkpoint arrives through a `ref` to a workflow-level checkpoint fragment — the rule is over FLATTENED steps and a fixture with only an inline checkpoint leaves fragment resolution unproven. Assert the message names the checkpoint and where to move it. Not redundant with T5: L9 closes the declared gate, T5 closes an undeclared one. |
| L9b | load | invalid-fixture | No branch declares a checkpoint step — instance-fan message variant | The gate-bearing branch is the activity of an instance fan rather than a list member | Second temp-corpus fixture. The message ENDS DIFFERENTLY: '... Every instance of a fanned activity runs the same definition, so there is no instance to take out of the fan.' A single test on the list form leaves the variant's text unasserted, and the variant exists precisely because the list form's remedy ('or take this activity out of the fan') is unavailable here. |
| L10a | load | invalid-fixture | Every branch's derived key is a legal variable name | A branch's activity id does not begin with a lowercase letter — `2nd-pass` derives `2nd_pass_outputs`, which fails QUALIFIED_DATA_ID_PATTERN | Temp-corpus fixture. Assert the message's remedy — 'an activity that runs in a fan carries an id beginning with a lowercase letter'. Pair with LF28, which proves the `_outputs` suffix makes the derivation total for a single-word id and so needs no exemption entry. |
| L10b | load | invalid-fixture | Every branch's derived key is unique in the workflow | Some activity in the workflow declares a variable whose name equals a branch's derived key — an activity declaring `research_outputs` where `research` is a branch | Temp-corpus fixture with a colliding variable declaration. A second arm of L10 with a completely different provocation from L10a; the spec states both in one row ('a legal variable name, and unique in the workflow') and a single test cannot reach both. Note the interaction with the declaration merge, which ADDS the container — a collision would make the merge's own contradiction check and this rule both plausible reporters, so the test must pin which one fires. |
| L11 | load | invalid-fixture | The fanned activity declares the fan's parameter among its reads | An instance fan's `variable` is not in the fanned activity's declared `variables.reads` | Temp corpus with a real fanned activity file. Also add a fixture where two fans of one activity name DIFFERENT parameters and assert BOTH fail here — the spec's claim is that this is why no cross-fan comparison rule exists, and that claim is only proved by the two-fan fixture. Applied per instance-fan member, so a third fixture puts the offending member inside a mixed list. |
| L12 | load | invalid-fixture | The fan's collection is a name this workflow's merged variable set contains | The head of an instance fan's `over` expression is declared by no activity in the workflow | Two temp-corpus fixtures: a bare unknown name, and a DOTTED expression whose head is unknown (`unknown_plan.steps`) — the rule is checked at the head, and a fixture with only a bare name leaves the dotted path unproven. Add a third, legal, fixture with a dotted expression whose head IS declared (LF9) to prove the head-taking does not report falsely. Applied per instance-fan member, so a fourth fixture puts it inside a mixed list. |
| L13 | load | invalid-fixture | An authored index into a fan's container is below that fan's operative ceiling | A downstream activity authors `challenge_pass_outputs.7.result.…` where the fan's operative ceiling is 4 | Temp corpus with a join activity authoring an out-of-range index. Needs THREE fixtures because the ceiling read differs: the member's own maxInstances where declared, the configured default otherwise, and a mixed list whose two members carry different ceilings (LF19). One-sided by design, so also assert an index BELOW the ceiling but beyond any plausible run-time length produces NO finding — that is the half the spec says cannot be closed. |
| L14 | load | invalid-fixture | A fanned activity mutates no checkout | A fanned activity's flattened steps bind an operation of the git or version-control groups, or the persist operation | Temp corpus with a fanned activity binding `workflow-engine::commit-and-persist`. Decidable from the flattened step list plus each step's bound operation NAME, with no composed signatures — which is exactly why it is a load rule and not a guard finding, so the fixture needs no technique files. Assert the message names the bound operation and the remedy. Cover a fragment-referenced step too, since the rule is over flattened steps. |
| LG | load | invalid-fixture | During delivery stages 1 through 5 the loader rejects any list or object destination outright (the delivery plan's temporary load gate; unnumbered in the spec's tables) | Any fan destination at all, while the gate line stands in validateExitBindings | A WELL-FORMED fan is the fixture here, and it still cannot live in workflows/ while the gate stands, because the gate would fail the corpus load. Assert the gate's message names the stage that lands the runner, and at stage 6 assert its deletion by loading the same fixture successfully. PLANNING HAZARD: if the gate runs BEFORE the fourteen fan rules it masks every L-rule message, making stage 1's 'one test per load rule' criterion unsatisfiable — so either the gate appends to the same error list last, or the L-rule tests call validateExitBindings directly rather than through the load. Decide this before writing stage 1's tests. |
| T1a | tool | seeded-state | A fan's collection is within the effective ceiling | At the fan enter the collection's length exceeds the destination's DECLARED maxInstances | The corpus workflow stays legal — the collection's LENGTH is data, not definition. Seed the bag with an over-long array before the transition that enters the fan (or drive a scoping activity that reports one), then assert the verbatim message names the collection, its length, the bound, and that the bound is 'the maxInstances this destination declares'. Assert nothing was spent: no frontier entries, no container, no dispatches. Also assert neither truncation nor successive waves is offered as an alternative. |
| T1b | tool | seeded-state | A fan's collection is within the effective ceiling — configured-default variant | The collection's length exceeds DEFAULT_FAN_MAX_INSTANCES on a destination that declares no maxInstances | Second seeded case against a destination with no declared ceiling. 'Where the ceiling is the configured default rather than a declared one, the first refusal names the default and SAYS SO' — a different message, and the remedy differs too (declare a maxInstances, or cap the collection upstream where `decompose-work-units` takes `effort_cap`). A test covering only T1a leaves the default-bound text unasserted. |
| T1c | tool | seeded-state | A fan's collection is non-empty | At the fan enter the collection is an empty array | Seed `[]`. Assert the message's reasoning ('a fan of no instances would empty the frontier at the moment of entering it, so the join would be entered with an activity the graph says runs never having run') and its remedy — route past the fan with a `when` predicate. Pair with LF20, the legal workflow that takes that remedy, and with LF15, where a ONE-element collection is legal: the floor is empty, not two. |
| T1d | tool | seeded-state | A fan's collection is an array | At the fan enter the collection holds a non-array — a string, an object, a number | Seed a string at the collection's name. Reachable from a legal corpus workflow because the declared-type check on a reported value is WARN-ONLY ('stored as written'), so a wrong-typed collection genuinely lands in the bag. Assert the message names what it found ('holds a string, not an array'). Cover a dotted `over` whose head exists but whose projection is a scalar. |
| T1e | tool | seeded-state | Every element carries a derivable id | An element is an object with no string `id` (or a non-slug value from which no id derives) | Seed a collection whose element 2 is an object without `id`. Assert the message names the ELEMENT INDEX and the three things the id designates — the container slot, the gather manifest row, and the artifact filename. Mixed collections are legal (LF14), so the fixture must isolate the bad element rather than the mixture. |
| T1f | tool | seeded-state | Two elements do not share one derived id | Two elements of the collection derive the same id | Seed a collection with elements 1 and 3 sharing an id. Assert the message names BOTH indices and the id. This is the refusal that 'closes three collisions at once' and is also the ONLY thing standing against two elements interpolating to one artifact filename — the guard's artifact arm cannot see that case — so cover both the string-element and object-element derivations. |
| T2 | tool | live-session-call | A transition off an activity whose exit fans says which exit it took | next_activity omits `exit` while the retiring activity binds any exit to a fan | Live session on the corpus workflow, positioned on the fan's source; call next_activity with the destination but no `exit`. Assert the verbatim message names the activity, the exit and the fan. Note it fires on an activity that binds ANY exit to a fan, so LF20 (one fanning exit and one plain sibling) is the sharper fixture than a single-exit source. |
| T3a | tool | live-session-call | A call exits an activity, or an instance, the session is actually on | `from_activity` names the BARE activity while the session is on N instances of it | Live three-instance fan; retire with `from_activity: challenge-pass`. Assert the message states the instance count, lists every entry in flight, and instructs 'activity and instance together'. Resolution step 1 is an exact string comparison over distinct strings, so a bare name matches NOTHING — assert the refusal rather than a lucky first-match. |
| T3b | tool | live-session-call | A call exits an activity, or an instance, the session is actually on | `from_activity` names an instance the frontier does not hold — `challenge-pass#4` against a frontier of #1 and #2 | Live fan with some instances already retired. Assert the message lists what IS in flight and instructs the caller to report the mismatch rather than retry with another index. The same call also proves the second-advance hazard T3 subsumes: retire an instance, then repeat the same retirement and assert it is refused as holding no open branch — which is also the observable half of the late-report-after-replacement behaviour. |
| T3c | tool | live-session-call | A call exits an activity the session is actually on — omitted-parameter arm | `from_activity` is omitted while several activities are in flight | Live three-branch DISTINCT-ACTIVITY fan; retire with no `from_activity`. Assert the third verbatim message, which names the count and all three activities and states 'the destination is entered once, when the last one does'. Distinct from T3a (the instance-ambiguity arm) — the spec gives them separate wording and a test on one leaves the other unasserted. Also assert the legal converse: omitting `from_activity` with at most ONE entry resolves to the sole entry, which is every ordinary walk. |
| T4a | tool | live-session-call | A worker is served the activity it was dispatched for, never guessed at | get_activity names an activity or instance the session is not on, with exactly one in flight | Live session; call get_activity with a wrong id. Assert the message names what the session IS on and what was asked for, and instructs reporting the mismatch rather than retrying WITHOUT activity_id. Assert the same membership test serves get_technique. |
| T4b | tool | live-session-call | A worker is served the activity it was dispatched for — ambiguity arm | get_activity omits activity_id while several are in flight | Live three-instance fan; call get_activity with no activity_id. Assert the middle message NAMES EVERY ENTRY IN FLIGHT — the spec singles that out, and it is what makes a worker's own id comparison possible. Also assert the accepted case: an instance's load response reports the instance-qualified id BACK, which is what makes N5 effective for an instance fan. |
| T4c | tool | live-session-call | A worker is served the activity it was dispatched for — empty-frontier arm | get_activity called when the frontier is empty (a fresh session, or after the terminal sentinel) | Fresh session; call get_activity before any next_activity. Assert `No activity in flight. Call next_activity first.` Cheap, and it is the third of the three load-call refusals the delivery plan's stage-5 criterion demands ('all three load-call refusals'). |
| T5 | tool | live-session-call | No undeclared gate is yielded from inside a fan | yield_checkpoint is called while several activities are in flight, for a checkpoint no definition mentions | Live fan; call yield_checkpoint directly. NOT redundant with L9 — L9 closes the DECLARED gate at load, and the tool admits a decision no definition mentions, so only a live call reaches this. Assert the message states the in-flight count and the one-outstanding-decision rule, and offers the two conforming alternatives (finish without the gate, or report an outcome one of the activity's own exits provides). Together L9 and T5 are what close a branch's second write path, which is what D5 rests on. |
| T6 | tool | live-session-call | A tool that writes one activity id into the record is unambiguous | dispatch_child is called while several activities are in flight | Live fan; call dispatch_child. Assert the message and assert it comes from the SAME ambiguity helper as T5 — one helper, two callers, so a test on only one leaves the shared site half-covered. |
| T7 | store | corpus-workflow | Every append several branch contexts make survives | Two branch workers' get_activity calls (each recording a delivery, so each WRITING the session) are built on the same read bytes; the second's compare-and-swap mismatches | THE ONLY refusal a correct fan reaches on a normal walk of a legal corpus workflow — the spec is explicit that 'a fan's acceptance does not require that no refusal appears in its log'. Drive the real corpus fan with concurrent deliveries; assert STALE_WRITE's message opens 'CALL THIS TOOL AGAIN with the same arguments' and states nothing was written, assert the repeat succeeds, and assert the run is ACCEPTED with the refusal present. The acceptance predicate is: every branch served, every branch's outputs in its own slot, the barrier released once. Note the spec deliberately omits STALE_WRITE from the fan's own enforcement table — it reports that the record moved under a caller, not a fan invariant — so a test must not count it as a fan refusal. |
| T8 | tool | live-session-call | Every member of a branch's reported map matches its declared type and value set (warn-only — detected, not refused) | A branch reports a value outside a declared value set or of a disagreeing declared type | Retire a branch with an out-of-set value in `variables_changed`. Assert TODAY'S WORDING UNCHANGED and that the value is 'stored as written'. The load-bearing part is WHICH declarations it validated against: the RETIRING BRANCH ACTIVITY'S OWN declared writes, read at the moment of the wrap — so the fixture needs a branch whose declaration disagrees with the WORKFLOW's merged map, or the test cannot tell the two implementations apart. Validating against the merged map would leave every member unchecked for precisely the activities a fan runs. |
| G1 | guard | guard-run | Nothing reads a branch output by its bare name | An activity declares a read of a fanned activity's output at its bare name | Positive arm needs a FIXTURE CORPUS — activity-variables is hard zero, so a finding cannot live in workflows/. Point the guard at the fixture with `--root <path>` or WORKFLOWS_DIR (scripts/workflows-root.ts precedence; requireWorkflowsRoot refuses a missing or empty root, so the fixture must hold a real workflow). Assert `unwritten-read`: once the write side is re-keyed the bare member is written by nothing. Negative arm is the real corpus workflow at zero findings. |
| G2 | guard | guard-run | Every member a gather names is one its branch produces | A join reads `research_outputs.open_assumtions` — a member the branch does not produce | Fixture corpus with a misspelled member in the join's read. Assert the verbatim member-grain text INCLUDING the 'it lands …' enumeration of what the branch does produce. Also assert the read test drops a leading all-digits segment and then a literal `result` segment before comparing — two segments, because a slot carries its unit's id beside the result — so the fixture must exercise an indexed read, not a bare one. Distinct from a mistyped KEY, which `unused-declaration` catches on the join's own declared read: cover that as a separate fixture or the two families' boundary is unproven. |
| G3 | guard | guard-run | Every member a branch produces is gathered somewhere | A branch declares a write nothing in the workflow gathers | Fixture corpus. Assert `unread-write` at member grain with the verbatim text. CRITICAL negative arm: a branch that writes a working value and reads it back within its own steps (LF35) must NOT be reported — without that exemption the family fires on the order of 35 times on one correct fan, and a hard-zero guard reporting 35 findings on a correct definition is one authors stop reading. Assert the count on a correct fan is exactly zero. |
| G4 | guard | guard-run | A read that omits the index is reported | An activity reads `research_outputs.open_assumptions` — container and member with no index | Fixture corpus. Assert `unwritten-read` NAMING THE INSTANCE FORM. The reason is structural: with a uniform index a bare container-and-member read addresses nothing and the flat walker would never find it. Pair with LF34, the same read WITH `.0.result.` interposed, which must produce no finding — the pair is what proves the index is uniform including slot zero. |
| G5a | guard | guard-run | A read at the join is satisfied on every arrival (no false finding on a correct fan) | A join declares a read of a name only ONE branch of the fan writes | ASSERTION OF ABSENCE, provoked by a CORRECT fixture fan (LF27's shape: three branches plus an alternative non-fan arrival). Assert ZERO findings. Left as a predecessor intersection the guard reports a false finding here; the arrival meet treats the completed fan as ONE arrival contributing the union. Also assert the three ways to apply this and have it do nothing, each of which only a fixture catches: the branch is removed from the join's plain predecessor index INCLUDING EVERY DUPLICATE ENTRY (de-duplicate inside the graph builder); the candidate seed comes from the first ARRIVAL's outgoing set rather than the first predecessor's; and a branch head's own predecessor stays ordinary. Add an eleven-instance fan to assert termination and that the graph builder collapses it to ONE node. |
| G5b | guard | guard-run | A read at the join is satisfied on every arrival (a genuine gap is still reported) | A read inside a branch is written by nothing on the path that reaches it | Fixture corpus. Assert `unreachable-read` IS reported. This is the other direction of the same operator and the one that proves the check is not merely DISABLED for branches — without the graph flatten no branch head is reachable, the predecessor index records no branch predecessor, the fixed point short-circuits and the branch's available set stays at the universe of every declared name, so every read in every branch silently stops being checked inside a hard-zero guard with no ledger to diff. Assert G5a and G5b on the SAME fixture corpus so a change satisfying one by breaking the other cannot pass. |
| G6 | guard | guard-run | A fan entered on a path where its collection was never written is reported | Some path reaches the fan's source before anything writes the collection | Fixture corpus with two routes to the fan's source, one of which does not write the collection. Assert the verbatim detail string. The load-bearing detail is ATTRIBUTION: the synthetic read of the collection's HEAD is attributed to the BRANCH, never the source — attributed to the source it reports falsely on the flagship shape, where a decomposition step emits its units and THAT activity's exit then fans. So the negative arm (a fan whose source writes the collection produces NO finding) is mandatory. Assert the THREE injections, not two: the reachability map, the unwritten-read loop, AND the derived-reads set — or every fanned activity carries a spurious unused-declaration finding in a hard-zero guard. |
| G7 | guard | guard-run | A fan over a collection nothing in the workflow writes is reported | The fan's collection is declared but written by no activity | Fixture corpus. Assert `unwritten-read` at fan grain, from the same synthetic read as G6. Distinct from L12, which fails the load when the collection is DECLARED NOWHERE — here it is declared and simply unwritten, which the load cannot see. The pair L12/G7 is the load-versus-guard split in miniature and both halves need a fixture. |
| G8 | guard | guard-run | The fan's parameter is read only by the activity the fan runs | An activity the fan does not run declares a read of the fan's `variable` | Fixture corpus with a stray reader. Assert `unwritten-read` with the FAN-SPECIFIC DETAIL STRING and no new family name. Negative arm: the branch's OWN read of the parameter produces no finding. The ambience is PER ACTIVITY, threaded through three consumers (the unwritten-read skip, the undeclared-crossing skip, the availability seed) plus one parameter on the reachability function — a global ambient set would satisfy the stray read silently, so the fixture must include both a legal reader and a stray one. Also assert the parameter is NOT in the workflow file's own variable list, since that list is workflow-owned, skipped by the unwritten-read check AND seeded into the lattice. |
| G9 | guard | guard-run | No two branches of one fan write one artifact filename | Two members of a list fan whose composed technique signatures resolve one LITERAL filename | Fixture corpus WITH TECHNIQUE FILES — this arm needs composed signatures, which is why it lives in the guard and not the loader. Assert the `fan-artifact-collision` family and the verbatim message. SAFETY FLOOR, not hygiene: the artifact writer's find-or-update plus re-scan mint guard means two concurrent writers both re-scan, both create, and the run thereafter resolves the lowest-numbered instance for the rest of the walk. LITERAL FILENAMES ONLY and it fails CLOSED on a template — so also assert that two TEMPLATED colliding names produce no finding, and record that as a known blind spot rather than a passing case. |
| G10 | guard | guard-run | No instance of a fan writes an artifact another instance also writes | An instance-fanned activity declares an artifact name that does not interpolate the fan's parameter | Fixture corpus with technique files. Assert the instance arm of the same family and that the message states BOTH legal remedies (token-carrying name, or no branch artifact with the join writing the document) because both are legal and the author chooses. Negative arm: an artifact name whose token's HEAD is the fan's parameter (LF32) produces no finding — model it on the two live green corpus precedents, both guide-mapped. Also assert the blind spot the spec names: a technique that writes a file WITHOUT declaring an artifact is invisible to this check, and two ELEMENTS interpolating to one filename is closed by T1f at run time instead. |
| G11 | guard | guard-run | A gate reachable only through a fan is still audited for a review-mode auto-advance | A checkpoint sits in the subtree beyond a fan and would auto-advance in review mode | Fixture corpus of RAW YAML — check-review-mode-gating.ts declares the graph's shape itself and parses raw YAML, so the load rules cannot protect it. Assert the finding fires on a gate beyond a fan. The failure mode without the flatten is SILENT UNDER-REPORT, not a wrong answer: its activity lookup on a list or an object returns undefined and the whole subtree beyond the fan drops out of its reachability set — so the test must assert the reachability SET's contents, not merely that some finding appeared. LF26 (a fan between the initial activity and the rest of the graph) is the worst case, where that is most of the workflow. |

## Properties that are unrepresentable rather than refused

| Property | What a test can assert instead |
|---|---|
| D1 — The join is entered once, after the last branch returns. There is no barrier-met call and no join-enter call, so early entry has no channel. | Assert the READING, not a refusal. On a three-branch fan: `_meta.barrier` on each of the first two retirements carries `met: false` with the shrinking pending list; the third carries `met: true` with an empty pending list and names the destination entered. Then assert on the record: exactly ONE entry event for the join in history, and the frontier equal to [join] after the last call. Re-run with the retirements in a different order and assert the same single entry — order of return does not matter, which is why nothing is declared about it. Assert the ABSENCE structurally too: the tool surface exposes no barrier-met or join-enter parameter, so there is no call to attempt. Also assert crash-resume: reload the session file mid-fan and assert the same barrier is re-derived with no extra state, because the frontier holds slot names rather than worker identities. |
| D2 — Entering a fan retires its source exactly once. One call enters every branch, so there is no second retirement to prevent. | Assert the history: exactly one exit event for the fan's source and one entry event per branch, all produced by ONE next_activity call. Then assert the observable backstop rather than the absence: a second advance off the already-retired source names an activity the frontier no longer holds and is refused by T3 — which is how the `one-advance-per-activity` rule's consequence is enforced rather than merely stated. |
| D3 — At most one fan is open, so the frontier needs no fan identity. | Assert the session schema has NO fan-identity field on a frontier entry — an entry is one string. Then walk LF23 (a chained fan whose join is itself a fan source) and assert the frontier length returns to exactly 1 at the join before the second fan opens, so no two fans' branches ever coexist. The static half is L5a/L5b/L6/L7: assert those refuse, since D3 is their consequence and not an independent mechanism. |
| D4 — A branch cannot take a second activity. The fan-dispatch operation writes neither a worker result nor a worker identity, so the drive loop's continue gate is structurally false. | Assert on the DEFINITION that the fan-dispatch operation declares neither output, and evaluate the drive loop's continue gate against the state it leaves — assert it is false. Then assert the runtime backstop: a branch calling get_activity for a second, different activity is refused by T4a. Note the honest limit the spec states beside this: for a LIST fan a membership test admits every branch, so a worker whose prompt names a sibling's activity IS served that sibling's body — nothing refuses it, and only the worker's own verification stands. A test can assert the worker rule exists and that the response reports the id back; it cannot assert the misroute is refused. |
| D5 — No branch writes a bare shared name. The transition call is a branch's only write path and that path is wrapped server-side from the graph the handler already loaded, never from a caller-supplied key. | Have TWO branches report the SAME bare name with different values; assert both values are readable afterwards under their own branch keys, and assert the bare name is ABSENT from the bag. Assert the tool surface carries no branch-key parameter, so a caller cannot supply one — that is the structural claim. Assert the other two write paths are closed rather than namespaced: L9 refuses a declared checkpoint at load and T5 refuses a yield at the boundary. TRAP: asserting 'no warning appeared' passes on the BROKEN implementation too, because an unwrapped bare name from two branches clobbers WARNING-FREE — the write path skips both the declared-type and value-set checks when a name has no declaration. Assert bag CONTENTS, never warning absence. |
| D6 — No instance writes into another instance's slot. The slot is the container at the resolved frontier entry's index, and the wrap is server-side. | Retire the instances OUT OF ORDER (2, 0, 1) and assert each slot's `result` equals the map its own instance reported and each slot's `id` still equals its collection element's id. Assert the variable-set event names the key, the index AND the member, so the history says which instance a value landed in. Assert no tool parameter carries a slot index — the index comes from the resolved entry, so there is no cross-write to attempt. |
| D7 — A slot no instance filled is legible as absent. | Leave one instance unretired (the replaced-and-blocked path) and evaluate BOTH dotted-path evaluators against the container: a not-exists gate true for the empty slot, true for a MEMBER of the empty slot, and true for an OUT-OF-RANGE index; an exists gate true for a present member. Then assert the positive reading it buys: the ordered gather's manifest marks that unit EMPTY, which is exactly what a replaced branch that returned nothing should look like. The spec calls this verified by execution rather than by inspection, so the test must evaluate the real evaluators, not restate the property. |
| D8 — The container's order is the collection's order. | Round-trip the real write path: materialise, write positionally, canonicalise, seal, persist, RELOAD. Assert slot order equals collection order. Use ELEVEN instances so the two rejected shapes would visibly fail — an object with numeric keys sorts lexicographically below the top level (0, 1, 10, 2), and a sparsely written array canonicalises with each hole as an empty string between commas and REPARSES AS INVALID JSON, sealed and unreadable on reload. Assert the pre-fill goes through the existing variable-write path as ONE call and ONE event with a write source naming a fan enter, so the history distinguishes the server's materialisation from a worker's report. |
| D9 — A second entry of the same fan does not append into the previous entry's slots. | Walk LF24's cycle: enter with a three-element collection, fill all three, route the join back to the source, enter again with a TWO-element collection. Assert the container then holds exactly two slots, in the second collection's order, with no residue of round one — the materialisation ASSIGNS the container whole. Also assert the consequence for a templated instance artifact: a second entry re-resolves the same template and CREATES rather than updates, each interpolated name its own logical artifact. |
| D10 — A fan's width is not bounded by the batch bound; the fan's own ceiling is the whole bound on its width. | Open a fan wider than DEFAULT_BATCH_MAX_ACTIVITIES and assert every branch's FIRST delivery is admitted — the bound exempts a scope with no activity yet and refuses only an activity a scope already holds. Assert the batch reading on each retire call reports one activity. Assert the negative too: the ONLY thing that refuses an over-wide instance fan is T1a/T1b, so removing the fan ceiling would leave the width unbounded — which makes T1a/T1b's tests the load-bearing ones for this property. |
| U1 — A list member is never itself a list, so a NESTED BARRIER is unrepresentable rather than refused. A destination expands to ONE FLAT SET of branches; an instance-fan member is a leaf that adds branches without adding a barrier. | Two assertions, neither of which is 'try to nest and see it refused'. Structurally: assert FanMemberSchema admits exactly `string \| InstanceFan` (a type-level test) and that the generated schemas/workflow.schema.json `items` subschema carries no array branch. Behaviourally: assert the mixed list LF17 with three topics produces a FLAT frontier of five entries and exactly ONE barrier release — the instance-fan member contributes three branches to the flat set and no inner convergence. The authored-nesting attempt is separately covered as a parse refusal (S1b), and the spec's point is that the arity rule stays ONE rule because nesting is excluded by the member type rather than by a fifteenth load rule — so also assert the rule count is fourteen. |
| U2 — Combination happens only in the combine phase. The bare name no longer lands, so there is no implicit route to a branch member and 'a join that needs a combined value binds a step that gathers it' is structural rather than a rule an author remembers. | Assert bag contents after a fan: only the container keys are present, no bare member names — so an activity that wants the members combined CANNOT read them implicitly and must bind a gather. Assert the declaration merge ADDS the container without replacing the members, so members keep their declared types, value sets and starting values, and the container carries NO starting value (or the rule against gating a defaulted variable on existence would make every existence gate on it constant). Assert the container's declared type matches what it holds — an object for a list fan, an array for an instance fan — since the merge's contradiction check compares declared type first, the write path warns on a disagreeing type, and the rendered variable set is what an author reads before authoring a read into it. The guard half is G1: assert a bare read of a fanned activity's output IS reported. |

