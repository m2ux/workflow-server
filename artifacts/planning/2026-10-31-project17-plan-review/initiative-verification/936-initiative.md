## Overview

This initiative makes workflow design reliable. An agent working from a workflow-design skill produces a workflow that loads, passes every check, fits what can be delivered, runs correctly, and is well designed.

Six sources together form the complete set of contingent information needed to author a workflow:

- definition-file schemas;
- a formal grammar;
- formal constraints;
- the execution model;
- the design principles;
- the anti-patterns.

A catalogue of reusable parts sits beside them. The language lives on its own orphan `language` branch, separate from the server and the corpus, versioned by `language/vX.Y.Z` tags. The grammar and constraints are stated formally and checked against the implementation that claims to follow them. A draft is verified before it merges. Reliability is defined by thresholds and measured.

## Problem

The rules a definition must satisfy have no single home, and no formal one.

- **Grammar is fragmented.**
  Twenty-three micro-grammars are defined by hand-written parsers, regexes and prose, and only three have a single definition. These cover gate expressions, references, identifiers, `{token}` interpolation, bag paths, keys and the technique markdown outline. Most are parsed in several places and the copies disagree. A guard's `when` reader drops parenthesised clauses, and the server and a guard derive anchor slugs differently.
- **Constraints are patchy.**
  Rules are enforced by Zod, the loaders, the routine resolver, runtime tool checks and 56 guards, under six identity schemes. One rule blocks in one mechanism and warns in another. `enforcement.json` contradicts loader behaviour, some rules are stated with no check at all, and the loader skips a misnamed activity file without any error.
- **What a designer is shown is not what a designer writes.**
  The published schemas carry server-built fields, and ten convention guards fail a change against rules no stated set contains.
- **A valid definition can still fail.**
  What each role receives and how much can be delivered decide whether a design works, and neither is in front of a designer. Every existing check is static, and none runs on a draft.
- **Design-time information is scattered and inconsistent.**
  About eleven prose homes restate rules and disagree with them. The canon contradicts itself and the code, and about ten of the anti-pattern numbers cited from code point at the wrong entry.
- **An unbound formal artifact rots.**
  The 2026-02-10 `grammar/activity.ebnf` and `constraints/activity.als` (R3) describe a design the implementation does not follow, because nothing binds them to it.
- **Reliable is undefined.**
  Nothing states what a reliable design is or measures whether one was produced.

## Proposal

- **Give the language a home.**
  Move the existing canon, language documents and published definition schemas, unchanged, to an orphan `language` branch. Rewire every consumer so the structure is tested end to end: development, CI, every branch that names a moved path, and the deployed image, which includes the language tag the server declares.
- **State and bind.**
  State the grammar and constraints once, formally, each rule under a stable id with a fix. Bind every rule to the implementation that enforces it through a registry that fails the build on disagreement. Account for every error path and skip.
- **State the execution model** as rules, with delivery size measured.
- **Reconcile the canon** and cite it by name.
- **Verify a draft** statically, by walking it, and by model-checking it.
- **Give the designer the skill.**
  It links each member of the set, routes by construct, and confirms its work through draft verification.
- **Measure.**
  Define reliable as thresholds on conformance, quality and fitness over a fixed brief set, and ship the skill when they are met.
- **Move the language spec-first.**
  A language change lands on the `language` branch as a `language/vX.Y.Z` tag adding one rule family. The server declares the tag it implements, and CI, provisioning and the image build check that tag out, so `main` never turns red on a language change. [#709](https://github.com/m2ux/workflow-server/issues/709), [#750](https://github.com/m2ux/workflow-server/issues/750), [I00 E01](https://github.com/m2ux/workflow-server/issues/529), [I00 E02](https://github.com/m2ux/workflow-server/issues/699), [I00 E03](https://github.com/m2ux/workflow-server/issues/530), [I00 E04](https://github.com/m2ux/workflow-server/issues/698), [I00 E07](https://github.com/m2ux/workflow-server/issues/531) and [I06](https://github.com/m2ux/workflow-server/issues/908) change the language this way.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/943) | Language Branch | AC1, AC2, AC3 | | |
| [E01](https://github.com/m2ux/workflow-server/issues/937) | Formal Specification | AC4, AC5, AC6, AC7, AC9, AC10 | [E00](https://github.com/m2ux/workflow-server/issues/943) | |
| [E02](https://github.com/m2ux/workflow-server/issues/940) | Canon Agreement | AC10, AC11 | [E01](https://github.com/m2ux/workflow-server/issues/937) | |
| [E03](https://github.com/m2ux/workflow-server/issues/939) | Execution Model | AC4, AC5, AC6, AC8, AC10 | [E01](https://github.com/m2ux/workflow-server/issues/937) | |
| [E04](https://github.com/m2ux/workflow-server/issues/941) | Draft Verification | AC8, AC9, AC12 | [E03](https://github.com/m2ux/workflow-server/issues/939) | |
| [E05](https://github.com/m2ux/workflow-server/issues/938) | Workflow-Design Skill | AC10, AC11, AC12, AC13, AC14 | [E04](https://github.com/m2ux/workflow-server/issues/941) | |
| [E06](https://github.com/m2ux/workflow-server/issues/942) | Reliability Evaluation | AC12, AC13, AC14 | [E05](https://github.com/m2ux/workflow-server/issues/938) | |

## Acceptance Criteria

- [ ] **AC1.** Every language artifact exists only on the `language` branch, confirmed by a sweep of every other branch.
- [ ] **AC2.** Every consumer reads the language at the `language/vX.Y.Z` tag the server declares, never at the branch head, as the cross-branch language sweep reports.
- [ ] **AC3.** A deployed server serves exactly the language resources of the `language/vX.Y.Z` tag it declares, compared against a development server at that tag.
- [ ] **AC4.** Every rule an authored definition must satisfy has exactly one formal statement under a rule id, as the conformance registry records, by the `language/vX.Y.Z` release that registers the last rule family.
- [ ] **AC5.** Every registered rule is bound to the code that enforces it, checked by the registry's coverage check, by the `language/vX.Y.Z` release that registers the last rule family.
- [ ] **AC6.** The build fails whenever an implementation disagrees with the formal spec, shown by the conformance checks rejecting a seeded disagreement.
- [ ] **AC7.** No finding, error or skip the server or guards produce lacks a registered rule id or a recorded disposition, audited by the completeness check, by the `language/vX.Y.Z` release that registers the last rule family.
- [ ] **AC8.** One MCP tool call on a draft outside the corpus reports the result of every draft-verification stage, as the draft-verification end-to-end test on a fixture draft shows.
- [ ] **AC9.** Every finding draft verification reports resolves by its rule id to a reference entry that states the fix, as the draft-verification end-to-end test over the conformance fixtures shows.
- [ ] **AC10.** Every member of the complete set, with the reuse catalogue, is reachable from the workflow-design skill as an MCP resource served from its single source, checked by the skill's link guard.
- [ ] **AC11.** No prose home outside the complete set contains a registered rule's text, shown by the prose-home guard.
- [ ] **AC12.** Workflows an agent designs from the shipped workflow-design skill across the held-out brief set meet the conformance threshold on blocking findings after the validator loop, set before the first evaluation run, as the evaluation harness measures.
- [ ] **AC13.** Workflows an agent designs from the shipped workflow-design skill across the held-out brief set meet the quality threshold on anti-pattern findings, as scored by a calibrated audit instrument independent of the skill.
- [ ] **AC14.** Workflows an agent designs from the shipped workflow-design skill across the held-out brief set satisfy their briefs' outcome assertions at the fitness threshold, as walked by the server's draft walker.

## Non-goals

- A new authoring language.
- Changing definition syntax while specifying it.
- Retiring the structured condition.
- Revising the legacy `workflow-design` corpus workflow.
- Changing how content is delivered.
- Changing the content of any artifact the language branch takes over.
- Re-specifying in EBNF the YAML structure JSON Schema already states.
- Writing new principles or anti-patterns.
- Executing a draft, or evaluating a workflow, with live agents.
- The agent role skills.

## References

- **R1.** [Planning record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-09-27-schema-grammar-constraints) — Design, rollout, open questions and the inventory of where grammar and constraints live today; discussed in [#935](https://github.com/m2ux/workflow-server/pull/935).
- **R2.** [Definition-grammar evaluation](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-24-shorthand-expression-grammar-for-workflow-yaml) — The 47 findings and structural recommendations this initiative builds on.
- **R3.** [EBNF and Alloy experiment](https://github.com/m2ux/workflow-server/commit/9c838290) — The 2026-02-10 EBNF grammar and Alloy constraints.
- **R4.** [Typed language](https://github.com/m2ux/workflow-server/issues/705) — I03, whose formal-artifacts task this specification can seed.
- **R5.** [Agent roles as skills](https://github.com/m2ux/workflow-server/issues/908) — I06, whose skill install path and version check the workflow-design skill reuses.
- **R6.** [Write-time Canon](https://github.com/m2ux/workflow-server/issues/1023) — I09, whose construct index the workflow-design skill routes through.
