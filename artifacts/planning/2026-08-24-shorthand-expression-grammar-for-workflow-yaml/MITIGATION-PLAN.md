---
Subject: workflow-server activity and workflow YAML definition grammar
Plan Date: 2026-08-25
Source: [EVALUATION-REPORT.md](EVALUATION-REPORT.md) — 47 findings (0 Critical / 9 High / 19 Medium / 19 Low)
Plus ARC-19, raised during resolution and carrying its own evidence. 48 findings dispositioned.
Reference: `origin/main` (`54427132`). The checked-out branch is 46 commits behind and is not a drafting base.
---

# Mitigation Plan: workflow-server Activity and Workflow Definition Grammar

## Governing Principle

Every disposition is derived against one rule: prefer what can be **removed** or made **precise** over
logic added on top of logic. Findings are dispositioned by the highest rung each can reach.

| Rung | Name | Meaning |
|------|------|---------|
| 1 | Delete the thing | Remove the path, field, dialect, function or rule so the defect cannot exist |
| 2 | Make it unrepresentable | Move the rule into a type or the grammar so a violation will not parse or will not load |
| 3 | Make it precise | State the rule once, in one place, with one owner |
| 4 | Guard it | A check that fails a build — the fallback, not the default |
| 5 | Prose | Rejected outright, per the accepted acceptance test |

A mitigation landing on rung 4 or 5 must say why rungs 1–3 were unreachable. **No mitigation in this
plan lands on rung 4 or 5.** One entry — EXP-03 — reaches rung 2 at load rather than at parse, and
states why.

The ladder rung, not the mitigation tier, is this plan's operative axis. Tiers are retained in the
summary table because the template mandates them.

## Headline Results

- **15 of 48 findings dissolve.** They cease to exist under the settled design rather than being
  mitigated, and carry no work item.
- **5 are record corrections** resting on a stale drafting base, already answered by the mainline.
- **28 are mitigated:** 4 at rung 1, 17 at rung 2, 6 at rung 3, and 1 recorded as superseded.
- **One structural move does most of the work.** Parsing `when` at load dissolves seven findings on
  its own.
- **The migration grows roughly tenfold**, from the prior plan's 19 blocks to about 187 sites. This is
  the one place the principle costs more rather than less, and it is stated in full below.

## The Settled Target Dialect

One dialect. `when` is extended to a strict superset of both existing dialects and `condition` is
removed. Productions: postfix presence (`x exists`), emptiness (`x is empty`), prefix negation
(`!(...)`), a null literal, decimal literals, variable references on the right-hand side by sigil
(`a == $b`), and set membership (`a in ['x','y']`).

Set membership is a deliberate addition: the corpus writes `a == 'x' || a == 'y'` chains, and it is
the one production that is both terser and more expressive.

Two productions are deliberately **absent**. Bare-identifier truthiness is removed (EXP-04), and an
unquoted bare word on the right of a comparison is a parse error (EXP-09).

Agent-side evaluation is fixed and load-bearing. The four powers — checkpoint dismissal, exit routing,
step gating, guarding an action — are specified explicitly and the surface follows from them.

**This run specifies only.** It does not write `grammar/activity.ebnf`, `constraints/activity.als`,
`grammar/workflow.ebnf` or `constraints/workflow.als`. Those four files are the specification's
consumers.

**None of the four is read by a running agent**, and follow-on work should size them accordingly.
`constraints/activity.als` and `constraints/workflow.als` have **no runtime role**: they are
design-verification artifacts, run against a model finder by CI or by hand to prove the constraints
consistent and to surface counterexamples. `grammar/activity.ebnf` and `grammar/workflow.ebnf` are
**build-time inputs** under ARC-07, generating the parser. What reaches the executing agent is the
parsed AST (ARC-19), not any of these files.

## Summary Table

| ID | Severity | Tier | Rung | Decision |
|----|----------|------|------|----------|
| CON-04 | LOW | T1 | 1 — dissolved | accept |
| CON-05 / ARC-02 | HIGH | T3 | 1 — dissolved | accept |
| CON-06 / EXP-02 | HIGH | T1 | 1 — dissolved | accept |
| CON-08 | LOW | T2 | 1 — dissolved | accept |
| CON-09 / EXP-05 | MEDIUM | T3 | 1 — dissolved | accept |
| CON-12 / FEA-02 | MEDIUM | T3 | 1 — dissolved | accept |
| CON-13 | LOW | T2 | 1 — dissolved | accept |
| CON-14 / CON-15 / ARC-05 | MEDIUM | T1 | 1 — dissolved | accept |
| ARC-06 | MEDIUM | T3 | 1 — dissolved | accept |
| ARC-08 | MEDIUM | T3 | 1 — dissolved | accept |
| ARC-11 | LOW | T3 | 1 — dissolved | accept |
| ARC-12 | LOW | T3 | 1 — dissolved | accept |
| ARC-15 | LOW | T3 | 1 — dissolved | accept |
| ARC-16 | LOW | T3 | 1 — dissolved | accept |
| FEA-01 | HIGH | T1 | 1 — dissolved | accept |
| CON-01 | LOW | T1 | 3 — record | accept |
| CON-02 | LOW | T1 | 3 — record | accept |
| CON-03 | LOW | T1 | 3 — record | accept |
| CON-10 | LOW | T1 | 3 — record | accept |
| CON-11 | LOW | T2 | 3 — record | accept |
| ARC-03 | HIGH | T3 | 1 | modify |
| FEA-03 | MEDIUM | T3 | 1 | modify |
| FEA-04 | MEDIUM | T1 | 1 | modify |
| ARC-19 | HIGH | T3 | 1 | accept |
| EXP-01 | HIGH | T1 | 2 | accept |
| EXP-03 | HIGH | T3 | 2 (load) | modify |
| EXP-04 | HIGH | T1 | 2 | modify |
| EXP-08 | MEDIUM | T1 | 2 | modify |
| EXP-09 | MEDIUM | T3 | 2 | modify |
| EXP-10 | LOW | T3 | 2 | accept |
| CON-07 / EXP-07 | MEDIUM | T3 | 2 | modify |
| CON-16 | MEDIUM | T3 | 2 (load) | modify |
| CON-17 | LOW | T3 | 2 | modify |
| CON-18 | MEDIUM | T3 | 2 | modify |
| CON-19 | MEDIUM | T3 | 2 | accept |
| ARC-07 | MEDIUM | T3 | 2 | modify |
| ARC-09 | MEDIUM | T3 | 2 | modify |
| ARC-13 | LOW | T3 | 2 | accept |
| ARC-14 | LOW | T3 | 2 | accept |
| ARC-17 | LOW | T3 | 2 | accept |
| ARC-18 | LOW | T3 | 2 | accept |
| CON-20 | HIGH | T3 | 3 | accept |
| ARC-01 | HIGH | T1 | 3 | accept |
| ARC-04 | MEDIUM | T4 | 3 | accept |
| ARC-10 | MEDIUM | T3 | 3 | accept |
| EXP-11 | LOW | T3 | 3 | accept |
| FEA-05 | MEDIUM | T4 | 3 | accept |
| EXP-06 | MEDIUM | T1 | — | modify |

48 rows. 34 accept, 14 modify. **Accepted or modified: 48.** None skipped, none unsettled.

EXP-06 carries `modify`: its correction is accepted and recorded, with the approach adjusted — the
finding's mitigation type is *superseded*, since removal of `condition` replaces the scoping it proposed.

## Detailed Changes

### Dissolved by the Settled Design — 15

These findings cease to exist. No work item survives them beyond the settled design itself.

**CON-05 / ARC-02 — The two evaluators coerce numbers differently** (HIGH, accept)
- **Dissolved by:** one dialect. A shared coercion helper is needed only while there are two
  evaluators; with one there is nothing to share, and the coercion rule belongs in the grammar.
- **Verified:** `evaluateCondition` has three call sites outside itself — `gate-liveness.ts:195`,
  `check-review-mode-gating.ts` (twice), `smoke/smoke-orchestrator.ts`. All three migrate to the `when`
  evaluator, after which `src/schema/condition.schema.ts` deletes. Clean, but not zero-touch.
- **Owed:** the coercion measurement, as migration safety. See Named Preconditions.

**CON-06 / EXP-02 — Neither predicate dialect contains the other** (HIGH, accept)
- **Dissolved by:** one dialect. A finding about how two dialects relate cannot survive there being
  one. Both residues — the tree's presence operators and the string's truthiness — are settled
  explicitly: presence is absorbed into the superset, truthiness is removed (EXP-04).

**CON-14 / CON-15 / ARC-05 — One file gives two answers on negative gates** (MEDIUM, accept)
- **Dissolved by:** one walker where there are four. `gate-liveness.ts` holds `collectWhenPaths`,
  `collectConditionPaths`, and the inner `fromWhen` / `fromCondition` — four walkers doing one job.
  Removing `condition` deletes two.
- **Verified:** the remaining two need the *same* answer. Both ask whether a gate is answerable
  without a present value; `unboundPositiveReads` answers correctly by excluding `!=` and `not`, and
  `gateAnswer` does not. This is not two copies to align — it is one walker returning
  `{ valuePaths, presencePaths }`, consumed by both callers.

**CON-08, ARC-06, ARC-11, ARC-12, ARC-15, FEA-01, CON-12 / FEA-02 — dissolved by parsing `when` at load**
- **Dissolved by:** typing `when` as a parsed expression, so a definition whose gate does not parse
  fails to load. `when` is `z.string()` today, which is why nothing in the type system, the schema or
  the compiler sees an expression.
- CON-08 (LOW): a typo can no longer reach runtime, so the silent-false path has no live producer.
- ARC-06 (MEDIUM): an unparseable expression can no longer shrink an activity's declared reads.
- ARC-11 (LOW): parse once at load and carry the AST, rather than two to four times per delivery.
- ARC-12 (LOW): `assertWhenAuthoring` deletes; the type does its job.
- ARC-15 (LOW): an empty gate does not parse.
- FEA-01 (HIGH): coverage becomes a property of the load path rather than of where a guard looks,
  reaching the 54 `exits[].when` and the action-position predicates the guard never covered.
- CON-12 / FEA-02 (MEDIUM): with separate and-chain and or-chain productions over a shared unary term,
  the bracketing rule holds by construction and the imperative walker deletes.

**CON-09 / EXP-05 and ARC-08 — `actions[].target` holds two grammars; `target` carries three roles**
(MEDIUM, accept)
- **Dissolved by:** a typed `actions[].when`. The validate-sense predicate moves to its own key,
  leaving `target` with exactly one role — a variable name under `action: set`.

**CON-13 — Comparison-node fall-through** (LOW, accept)
- **Dissolved by:** one evaluator over a grammar-derived operator union with an exhaustive switch. The
  state cannot be constructed.

**ARC-16 — Dotted-path resolution is triplicated** (LOW, accept)
- **Dissolved by:** one evaluator means one resolver. `getVar`, `getVariableValue` and `readPath`
  collapse to one.

**CON-04 — The tree-to-string lowering** (LOW, accept)
- **Dissolved by:** removal of `condition`. The lowering question ceases to exist.

### Record Corrections — 5

**CON-01, CON-02, CON-03, CON-10** (LOW, accept) and **CON-11** (LOW, accept)
- **Location:** the evaluation's drafting base.
- **Correction:** each rests on the checked-out branch being 46 commits behind `origin/main`. The
  mainline declares `variables` and `exits` on the activity schema, has no `getValidTransitions`,
  reads and enforces the routing vocabulary, and does not reach the manifest warning path. All 122
  activity files accept at every revision measured.
- **Corrected text:** one statement of the drafting base — draft against `origin/main` (`54427132`).
  No schema action.
- **CON-11 additionally:** the corpus pin is deliberate and lets the corpus move at authoring cadence.
  All three pointers validate 122 of 122 with a census delta of zero, so the grammar consequence is
  nil.

### Mitigated, Rung 1 — Delete — 4

**ARC-03 — The published workflow JSON Schema rejects a live definition file** (HIGH, modify)
- **Critique:** the schema is generated from the assembled runtime object, where activities are
  objects, then published for definition files, where an activity may be a file-path string.
- **Mechanism:** publish only the definition-file schema and delete the assembled-object schema from
  the published set. Zod continues to validate the assembled object internally without needing a JSON
  Schema of it.
- **Supersedes:** the report proposed publishing two schemas and stating which each artifact describes.
  Two artifacts to keep in step is one more thing that can drift; deleting one removes the class.
- **Verified:** no workflow file cites a schema — zero `yaml-language-server` pragmas across the
  corpus. The rejection is latent, not live, and the report's "16 corpus references" are documentation
  links rather than validating consumers.

**FEA-03 — No schema-drift check exists** (MEDIUM, modify)
- **Critique:** five schemas are generated by a 30-line script with no check mode and no registry entry,
  so an edited description leaves the committed schema serving old text.
- **Mechanism:** delete the committed schemas and generate into build output. Nothing committed,
  nothing to drift, and no drift check to write or register.
- **Supersedes:** the report proposed a regeneration guard that fails on any diff — rung 4.
- **Verified:** the committed schemas are read at runtime by `schema-loader.ts` and served over MCP at
  `workflow-server://schemas/{id}`, so generation must land in the served directory.
- **Accepted cost:** a fresh clone must build before it can serve schemas. Safe because nothing fetches
  them from the repository.
- **Also deleted:** `schemas/condition.schema.json`, with the `condition` entry in
  `SCHEMA_DESCRIPTIONS` and its MCP resource registration.

**FEA-04 — The formal artifacts describe a superseded design** (MEDIUM, modify)
- **Critique:** `grammar/activity.ebnf` (129 lines) and `constraints/activity.als` (279 lines) are
  complete, coherent specifications of a `decisions:` / `flows:` / `skill:` design the schema abandoned,
  both dated 2026-02-10, referenced by no guard and parsed by no test.
- **Mechanism:** delete both. They are a live source of false statements.
- **Supersedes:** the report proposed recording that they carry no evidential weight.
- **Paired:** this item lands with its replacement in one plan item, so the gap between deletion and the
  new artifacts is temporary by construction.

**ARC-19 — The specified grammar reaches its primary consumer as prose** (HIGH, accept)
- **Raised during resolution, not in the evaluation report.** It carries its own evidence rather than
  amending an existing finding.
- **Critique:** the settled grammar is mechanically specified and mechanically enforced at load and in
  the guards, but the executing agent — which is where gate evaluation actually happens, under the fixed
  agent-side evaluation decision — receives the grammar as a field description and interprets
  expressions by reasoning over it. The reference evaluator and the agent's reading of that description
  are never checked against each other.
- **Evidence:** `src/schema/activity.schema.ts:74-75` on `origin/main`. The `when` description
  enumerates the operators, the C-style precedence order and the mixed-operator bracketing rule in
  prose, states the expression is "Evaluated by the executing agent against current variable state",
  then names the mechanical nets as "(e2e walker, guards)" using the shared reference evaluator — a set
  the agent is explicitly outside of. The same description string also carries ARC-01's false claim
  about server evaluation, so one 700-character field holds two distinct defects.
- **Mechanism:** remove the agent's parse entirely. `get_activity` delivers the parsed AST alongside the
  `when` string, and the agent walks that structure rather than parsing text. Tokenisation, precedence
  and bracketing stop being an agent concern, because the parse happened in the component that owns the
  grammar.
- **Not** a check that the agent's reading matches the reference evaluator. That would be rung 4 and
  would leave two readings to keep in step.
- **Relation to ARC-07:** ARC-07 fixes the provenance of the description text, since it becomes
  generated from the grammar and can no longer drift from the parser. It does not change that the agent
  parses prose. This finding closes that half.
- **Preconditions: none new.** Load-time parsing and the generated parser are already settled; this
  consumes their output.
- **Safe because the AST is state-free.** The server's variable bag may lag the agent's in-flight state,
  which is why agent-side evaluation is load-bearing. A parse carries no state, so shipping one does not
  move evaluation to the server and does not disturb the ARC-04 trilemma resolution.
- **Completes ARC-11 rather than duplicating it:** gates parse once per delivery for both server and
  agent, instead of the two-to-four times ARC-11 measured.
- **Both travel; the AST is authoritative.** The `when` string is retained alongside the AST for
  readability. Stating which governs means no consumer is left deciding between them.
- **Open cost:** payload size per gated step, unmeasured. Named as a figure the follow-on work should
  take.

### Mitigated, Rung 2 — Make Unrepresentable — 17

**EXP-01 — Predicate-free graph edges are a stated invariant** (HIGH, accept)
- **Mechanism:** an edge value is a bare destination identifier or the terminal sentinel, with no guard
  production. `constraints/workflow.als` asserts **the full positional table**, not borrowability alone.
- **Why:** all 192 edges across 17 workflows and 106 nodes are bare strings with zero exceptions, and
  the reason is stated at `workflow.schema.ts:78` — an activity names its outcomes and the workflow
  names destinations, so a borrowed activity sits in any graph without its lender having a say. The
  property is protected today only by the accident that a record of strings cannot hold an object.

**EXP-03 — The presence form invalidates a hard-zero guard's precondition** (HIGH, modify)
- **Critique:** `check-variable-model.ts` walks only structured conditions, its comment giving the
  reason as the string dialect having no exists-shaped predicate. Adding one makes that false while the
  guard keeps passing, blind to 350 of 657 declarations.
- **Mechanism:** reject at load. `exists-on-defaulted` is a cross-reference between a declaration and a
  gate, both visible to the loader. Its sibling rule `default-type-mismatch` moves into the type as a
  discriminated union on `type` constraining `defaultValue`. `check-variable-model.ts` deletes entirely.
- **Supersedes:** the report proposed extending the guard — rung 4.
- **Why rung 2 at load rather than at parse:** the rule needs two facts, the declaration and the gate.
  The grammar sees only the expression; the loader sees both. Rung 1 is unreachable because the defect
  is authorial — the ability to declare a default cannot be removed, and unseeding defaults would change
  the variable model.

**EXP-04 — Authors reject the available terse form** (HIGH, modify)
- **Mechanism:** remove bare-identifier truthiness from the grammar. `x` alone is not a predicate.
- **Supersedes:** the report proposed adding no brevity sugar — a rule, rung 3. Removing the production
  makes the sugar unwritable rather than discouraged.
- **Evidence:** explicit boolean comparison appears 272 times — 160 `== true`, 95 `!= true`, 17
  `== false`, 0 `!= false` — against 9 terse uses of a form that has always been legal, is shorter, and
  is documented in the field's own description. `x == true` fails closed on a string, number or array;
  a bare `x` asserts JavaScript truthiness, and for the 95 array-typed declarations of 657 such a gate
  holds precisely when the array is empty.
- **Tension, stated:** truthiness is one of the two residues the superset was meant to absorb. A
  superset must express what authors legitimately mean, and the corpus says by 272 to 9 that they mean
  `== true`. This does not conflict with one syntax being fully expressive: rejecting one unsafe sugar
  is a safety judgement, and making a syntax fully expressive is a different thing. Both are stated.
- **Cost:** 9 corpus sites become `x == true`.

**EXP-09 — Neither dialect can compare two bag variables** (MEDIUM, modify)
- **Critique:** a bare word on the right is taken as a string literal, so `a == b` compares `a` against
  `"b"`. The tree has the identical hole. The author gets a silently false gate rather than an error,
  and the reads-have-writers guard cannot notice `b` is never written.
- **Mechanism:** variable references by sigil (`a == $b`), and quoting required on string literals — an
  unquoted bare word on the right is a **parse error**. The gap closes and the trap is removed.
- **Measured cost: 2 edits, not 281.** Across all 281 `when` strings the right-hand sides are 274
  keyword literals, 127 quoted strings, 25 numbers, and exactly 2 bare words —
  `analysis_type == completion` and `analysis_type == context`, in one file.
- **Correcting the record:** an earlier estimate in this dialogue put this at a 281-gate migration. That
  was wrong by two orders of magnitude, and the measured figure governs.
- **Rejected:** rejecting only new ambiguous forms. A grammar keyed on file age is the positional
  availability defect in new dress, and is unenforceable once a file is edited.

**EXP-08 — Rename-only technique bindings carry the dataflow joins** (MEDIUM, modify)
- **Mechanism:** an identity rename — one whose source equals its target — is a schema-level error.
  2 edits, no guard.
- **Supersedes:** the report proposed a guard for the 2 identity passthroughs — rung 4.
- **Stated explicitly:** the other 62 rename bindings carry dataflow joins and are **not** elided. They
  map 57 distinct input-to-source pairs, each a design decision stated in the only place it is stated;
  `dispatch_concurrency` bound from `scanners_assigned` asserts that the assigned scanner count is the
  dispatch concurrency. A shorthand cannot infer these, because the names differ by design.

**EXP-10, ARC-14, ARC-17, ARC-18, CON-19 — taken as one grammar** (LOW/LOW/LOW/LOW/MEDIUM, accept)
- **Mechanism:** one grammar carrying postfix presence, emptiness, decimal literals, a bag-name
  production that rejects malformed dotted paths, one shared identifier production, `undefined` reserved
  as unparseable, and a null literal giving the intent a spelling.
- **How each is answered:** EXP-10 — a postfix presence form and an emptiness form take the four
  unparseable `actions[].target` values to zero, tested directly, postfix order fixed by the one
  authored instance. ARC-14 — the tokenizer's number branch admits decimals, so a comparison is not
  expressible one way and not the other. ARC-17 — a doubled or trailing separator fails to parse rather
  than yielding one valid token whose empty segments resolve to undefined. ARC-18 — one identifier
  production replaces three name grammars across three modules, and the terminal sentinel moves into the
  type so an activity cannot carry it as its own id. CON-19 — `undefined` no longer parses as a string
  literal, and the null literal gives the author reaching for a presence test something correct to write.

**CON-07 / EXP-07 — A checkpoint's `condition` is a dismissal construct wearing a gate's name**
(MEDIUM, modify)
- **Critique:** on a checkpoint, `condition`'s *presence* enables dismissal and its contents are
  irrelevant; a checkpoint carrying `when` and no `condition` validates, loads, runs, and is silently
  non-dismissible. 67 of 113 checkpoints depend on this and no guard names the rule.
- **Mechanism:** a boolean `dismissible` flag, defaulting to false. Deliberately **not** a predicate —
  giving it one would re-create the construct being removed.
- **Confirmed minimum:** the flag carries the capability and nothing else.
- **Cost:** 67 sites in the migration.

**CON-16 — A loop variable lands as a projection that drops the key its own gate reads**
(MEDIUM, modify)
- **Mechanism:** a dotted read of a component the producer does not declare fails at load.
- **Departure:** this mitigation is **author-supplied**. The report's Corrections section proposes none
  for this finding.
- **Why rung 2 at load:** the producer's declared output components and the gate's read paths are both
  visible to the loader. This also subsumes ARC-17's malformed-path concern for dotted reads.

**CON-17, CON-18 — The action and checkpoint-option objects are open** (LOW/MEDIUM, modify)
- **Mechanism:** strict object parsing on both. `ActionSchema` is not strict, so an unknown key inside
  an action is stripped without warning; `CheckpointOptionSchema` is not strict at the option level, so
  an `exit` written one level too high is stripped without warning. `target` gains the description it
  is the only field in its file to lack.
- **Named precondition:** a corpus scan enumerating currently-dropped keys, so strictness does not turn
  a silent strip into a load failure without the set being known first.

**ARC-07 — The entire dialect grammar lives in prose that no validator reads** (MEDIUM, modify)
- **Critique:** the operator set, precedence, bracketing rule, truthiness semantics, bare-word literal
  rule, fail-closed behaviour and checkpoint caveat live in a 700-character description, restated in
  five unlinked places, one already incomplete. Adding a production changes nothing in Zod, nothing in
  the generated schema and nothing in the type system.
- **Mechanism:** the grammar file generates the parser. Specification and reference implementation
  cannot disagree.
- **Inverted from an earlier decision in this dialogue**, which chose a descriptive grammar plus an
  agreement check. Under the governing principle the choice reverses: generation is rung 2, an
  agreement check is rung 4.
- **Specify-only tension, resolved:** this run does not write `grammar/activity.ebnf`. Declaring the
  file generative describes what follow-on work builds, which is still specifying.

**ARC-09 — A bare technique reference's meaning depends on filesystem state** (MEDIUM, modify)
- **Critique:** bare op ids resolve against the activity-named group first and fall back to the
  reference as authored, so adding a file silently re-targets every bare reference of that name with no
  diff to the referring YAML. At 427 bare-string bindings against 211 structured, this is the corpus's
  most visible terseness and the precedent most at risk of being copied.
- **Mechanism — the user's rule, superseding the proposal.** Bare ids resolve to **siblings only**, and
  qualification is **as verbose as needed and no more**: a sibling is bare, another group in the same
  workflow is `group::operation`, another workflow is qualified further. A reference more qualified than
  it needs to be is also wrong. The specification names the cross-workflow spelling precisely, following
  the same principle.
- **Supersedes:** the report proposed stating the resolution order and guarding ambiguous resolution.
  The rule removes ambiguity **by construction** rather than detecting it, so no guard is needed.
- **Recorded:** the two apparent collisions are not collisions under this rule. `summarize-scope` and
  `create-output-folder` each appear in `prism-audit` and `prism-evaluate` — two different workflows,
  never siblings, so neither can shadow the other.

**ARC-13 — An unbound verdict discards the variable name the same file computes** (LOW, accept)
- **Mechanism:** the unbound verdict type carries the absent path. The diagnostic a maintainer wants is
  which variable deferred the gate, and it is computed two functions earlier and thrown away because the
  type has no slot for it.

### Mitigated, Rung 3 — State Once — 6

**CON-20 — One predicate intent has five availabilities by position** (HIGH, accept)
- **Mechanism:** the residual positional table is asserted **once**, in Alloy, per EXP-01. The grammar
  and the prose reference it rather than restating it.
- **What survives:** every position takes `when`. What differs is which power the position holds. The
  remaining differences are load-bearing — a graph edge admits no expression, a checkpoint carries a
  dismissal flag. The accidental differences are gone: presence forms are now available everywhere.

**ARC-01 — The server evaluates both dialects and the published contract denies it** (HIGH, accept)
- **Incorrect text:** the `when` field description, published to every agent and into the generated
  JSON Schema, states that the server never evaluates gates. `gate-liveness.ts:194-195` evaluates
  against the server's bag snapshot and combines the results.
- **Corrected text:** the server evaluates gates only to decide delivery, never to drive control flow;
  the executing agent decides what runs; a dialect change is therefore a server-side change.

**ARC-04 / FEA-05 — The trilemma, and where rules live** (MEDIUM/MEDIUM, accept)
- **ARC-04 constraint:** one predicate language everywhere, position-specific power, and agent-side
  evaluation are three properties of which any two are achievable. Merging syntaxes relocates the
  distinction into the position rather than removing it. Agent-side evaluation is fixed because it is
  load-bearing; the four powers are specified explicitly and the surface follows.
- **FEA-05 acceptance test:** for every rule the grammar states, name the artifact that fails when it is
  violated. Reject any rule whose only home is a description string.
- **Boundary, stated as a test rather than a category:** if a definition file could be wrong about it,
  it is a rule and needs an artifact that fails. If no file can violate it, it is rationale and is
  recorded. ARC-04's trilemma is rationale by this test.

**ARC-10 — Four loader-level sugars are invisible to both schemas** (MEDIUM, accept)
- **Mechanism:** the grammar covers the **authored surface**, the four loader sugars included —
  activity-group technique shorthand, rule-fragment splicing, checkpoint-fragment references, and string
  activity references — with expansion to the long form stated as a separate step.
- **Why:** Zod runs after the loader, so every loader transformation is invisible to it by construction.
  The authored surface and the validated surface are different documents and only the second has a
  published grammar. ARC-03 is where that gap already produced a live rejection.

**EXP-11 — A precondition satisfied by absence transfers as an assumption** (LOW, accept)
- **Mechanism:** required — every production names the precondition it depends on, in an artifact that
  can check it.
- **Why:** every sound sugar in this corpus rests on a fact about what does not exist, and in no case is
  that fact held in a type. A later author reproduces the form without the fact.

### Superseded — 1

**EXP-06 — The condition-tree migration is 19 blocks rather than 75** (MEDIUM, modify — superseded)
- **Recorded, not carried as work.** The correction was right about the prior plan: 78 of 109 blocks are
  structurally forced (67 checkpoint, 11 action) and 9 are presence-locked, leaving 19 elective — 17 per
  cent, not 69.
- **Superseded by:** removal of `condition`, which migrates all 109.

## Migration

| What | Sites |
|---|---|
| `condition` blocks rewritten to `when` | 109 |
| Checkpoints gaining a `dismissible` flag | 67 |
| Actions gaining a typed `when` | 11 |
| Bare-truthiness gates becoming `x == true` | 9 |
| Bare-word right-hand sides gaining quotes | 2 |
| **Corpus total** | **198** |
| `evaluateCondition` call sites migrated | 3 |
| **Total** | **201** |

Against the prior plan's 19 elective blocks this is **roughly tenfold**. It is the one place the
governing principle costs more work rather than less, and it is the price of the removals below.

**Sequencing.** Land the grammar and load-time parsing first. **Gate the 109-block rewrite on the
coercion measurement**, so each rewrite is provably answer-preserving before it lands.

## What the Migration Buys

- 15 findings gone rather than mitigated.
- One dialect where there were two.
- One evaluator where there were two.
- One AST where there were two.
- One path resolver where there were three.
- One parse per delivery where there were two to four.
- One walker where there are four.
- One parse of a gate anywhere in the system: the agent stops parsing prose and walks the delivered AST.
- Two guard scripts deleted — `check-when-expression.ts`, `check-variable-model.ts` — plus the
  parenthesization walker and `assertWhenAuthoring`.
- Two schema files deleted — `schemas/condition.schema.json` and the published assembled-object schema —
  and the remaining schemas no longer committed at all.
- One source module deleted — `src/schema/condition.schema.ts`.

## Named Preconditions

Three items must land before the work they gate.

1. **The coercion measurement.** Which live conditions change answer when the two coercions become one.
   Migration safety, not a permanent component. Gates the 109-block rewrite.
2. **The strict-parsing corpus scan.** Enumerate keys currently dropped silently by the non-strict
   action and checkpoint-option objects, so strictness does not convert a silent strip into a load
   failure with the set unknown. Gates CON-17 and CON-18.
3. **Producer shape declarations.** CON-16's load-time check requires producers to declare their output
   components. Gates CON-16.

## Implementation Priority

1. **Grammar and load-time parsing.** The settled dialect, `when` parsed at load, separate and-chain and
   or-chain productions. Dissolves seven findings and unblocks everything else.
2. **Rung 1 deletions.** `condition` and its schema, the assembled-object published schema, the committed
   schemas, the two stale formal artifacts (paired with their replacement).
3. **Rung 2 type and load rules**, in severity order — EXP-01, EXP-03, EXP-04, then the MEDIUM set, then
   the grammar-carried LOW set.
4. **Rung 3 statements** — the positional table asserted once, the gate-evaluation contract, the
   acceptance test and its boundary, the authored-surface coverage, the per-production preconditions.
5. **AST delivery (ARC-19).** `get_activity` ships the parsed AST alongside the `when` string. Consumes
   the output of steps 1 and 2 and introduces no precondition of its own.
6. **The corpus migration**, gated on precondition 1.

## Owed Verification

The report predicted that any design would relocate the fifteen predicate rules between four homes
rather than reduce the count, and stated that a design reducing it would falsify the report's account.
This design **appears** to falsify it, because removing a dialect removes the rules that governed the
relation between two dialects, and parsing at load moves others from prose into the type system.

**The fifteen were not re-enumerated in this run.** The follow-on specification must verify the claim by
enumeration before it is asserted. It is recorded here as owed, not as proven.

One measurement is also owed: **the payload cost per gated step of shipping the AST** (ARC-19). It is
unmeasured, and the follow-on work should take the figure rather than assume it is small.

## Departures from the Report's Recommendations

- **ARC-19** — the finding itself was raised during resolution and is absent from the evaluation report.
  It carries its own evidence at `activity.schema.ts:74-75`.
- **CON-16** — mitigation is author-supplied; the report's Corrections section proposes none.
- **ARC-09** — mitigation is the user's rule, superseding the report's proposal to detect ambiguity.
- **ARC-07** — inverted from an earlier decision in this dialogue, not from the report.
- **EXP-09** — the report gives no cost figure; the 2-edit figure is measured in this run and corrects a
  281-gate estimate made earlier in the dialogue.
- **Ordering** — this plan's operative axis is the ladder rung. The mandated `T1`–`T4` tiers are retained
  in the summary table.

## Artifact Conformance

Four conformance exceptions are carried forward rather than corrected.

- **The consolidated report exceeds its template's line budget**, which is written for roughly twelve
  findings. Forty-seven are reported.
- **Both supporting findings documents record the same overage**, at 20 and 34 findings. Their records
  are at `consistency/RUN-MANIFEST.json` and `dimensions/RUN-MANIFEST.json`.
- **This plan exceeds its template's ~100-line budget**, for the same structural reason: 48 findings and
  the mandated per-finding fields against a template written for about twelve. Condensing would mean
  dropping findings or mandated fields, so the overage stands.
- **The run manifest schema has no field for any of this.** Neither manifest can record a conformance
  verdict, so a consumer reading a manifest alone sees a clean `complete` for a run whose artifacts
  overran their budgets. Correcting this is a schema change outside the scope of any single run.

`artifact_conformance.conforms` is **false** at all three levels. The six run-level definition gaps are
carried forward unchanged.
