# Issue #213: Workflow profiles: named presets that fix a session's starting state before it runs (stealth mode, review mode)

Captured verbatim on 2026-08-02 when the issue was consolidated into the session-presets epic.

---

## Summary

Some uses of a workflow need certain session variables locked to specific values before the first step ever runs — a security remediation that must stay private from the very start, for example. Today, seeded default values are declared per workflow, and there is no other way to fix a session's variable state before execution begins. So a different seed set means cloning the whole workflow. Two recent pieces of work each hit this wall:

- **Stealth mode** (#211/#212). The `remediate-vuln` workflow, at version 2.0.0, is now a roughly 200-line thin wrapper around `work-package`. Its real payload is small: three seeded values (`stealth_mode: true`, `push_remote: security`, `is_review_mode: false`), three isolation rules, one security-specific start activity, and the list of activities it borrows from the base workflow. The wrapper exists only because wrapping is the sole way to ship a different seed set.
- **Review mode** (the v3.19–3.21 work). `is_review_mode` is a flag set inside the workflow by a detection step plus activation checkpoints, and the matching interaction posture — run headless, advance automatically without dialogs — rides along as workflow rule text. Same shape as stealth: one graph, a different seeded state, plus a different interaction posture.

Both are instances of the same missing primitive, which this issue calls a **profile**: a named, curated preset over a base workflow that fixes the seeded state (and possibly the interaction posture) before execution begins. Because the values are fixed from step zero, safety gates hold from the first step, and static guards such as `check:stealth` can verify what is reachable against the profile's defaults rather than trusting a selection made at runtime.

## Concept outline

A profile is a first-class, named preset declared by (or registered against) a base workflow:

```yaml
# workflow.yaml (sketch)
profiles:
  - id: stealth
    title: Private remediation (no public disclosure)
    tags: [security, private]
    seeds:
      stealth_mode: true
      push_remote: security
      is_review_mode: false
    rules:            # optional profile-scoped rule additions
      activity:
        - "PRIVATE RESEARCH ONLY: ..."
    initialActivity: security-start   # optional entry-activity override (see open questions)
  - id: review
    title: PR review
    seeds:
      is_review_mode: true
    posture: headless   # optional interaction posture (auto-advance defaults, no dialogs)
```

### What the engine would provide

1. **The catalog shows profiles.** `list_workflows` surfaces profile entries (for example `work-package@stealth`) with their own tags and description, so a request like "remediate this advisory privately" matches the profile the same way it matches a workflow today.
2. **Seeding happens when the session is created.** `start_session` and `dispatch_child` accept a workflow id plus a profile name; the session's variables are seeded from the base workflow's defaults with the profile's seeds laid on top. The seeding is recorded in the `variables_seeded` history event and in `session.json`, so it is auditable and survives a resume.
3. **Guards understand profiles.** Corpus guards evaluate reachability per profile (`check:stealth --workflow work-package@stealth`), and `check:variable-model` validates a profile's seeds against the declared variable types.
4. **Choosing the profile is the guarantee.** There is no window where the session runs open on defaults before a mode kicks in, no runtime checkbox to get wrong, no dependence on steps running in the right order. This is the property the current wrapper-workflow pattern provides — and that an in-workflow "mode selection checkpoint" cannot.

### Candidate profiles

| Profile | Today | As a profile |
|---------|-------|--------------|
| `work-package@stealth` | the `remediate-vuln` wrapper workflow | seeds `stealth_mode`/`push_remote`, private tags, isolation rules; potentially deprecates the wrapper |
| `work-package@review` | an `is_review_mode` detection step, activation checkpoints, and headless-auto-advance rule text | seed `is_review_mode: true` plus `posture: headless`; the detection/activation machinery becomes the non-profile path only |

## Open design questions

1. **Entry-activity override.** remediate-vuln's start activity (advisory inputs, security remote, isolation checks) is real content, not a seed. Can a profile override `initialActivity` and contribute activities, or do content-bearing specializations remain wrapper workflows, with profiles covering only the pure seed-set cases? The answer decides whether `remediate-vuln` can be fully deprecated or merely shrinks to an even thinner shell.
2. **Posture as data.** Review mode's headless auto-advance behavior is currently rule prose (`review-mode-headless-auto-advance`). Is interaction posture — headless versus interactive, auto-advance behavior — a profile attribute the orchestrator honors structurally?
3. **Seeds versus checkpoint effects.** Profile seeds must not be overridable by accident mid-run. Do checkpoints whose only job is to set a mode variable (for example review-mode-detection under `@review`) get skipped structurally when the profile already fixes that variable?
4. **Fragment and technique scoping.** Profiles live within a single workflow, so #166 B10 and source-scoped technique resolution (#212) should be unaffected — confirm there is no interaction.
5. **dispatch_child and the meta workflow.** How do discover-session and initialize-session address a profile — `workflow_id: work-package, profile: stealth`, or a composite id? And how does the planning-slug fallback name a profile session?
6. **Migration.** If question 1 lands with an entry-activity override: a deprecation path for `remediate-vuln` (catalog alias, session resume compatibility). If not: `remediate-vuln` stays as the documented wrapper pattern, and profiles serve the seed-only cases, review mode first.

## Non-goals / constraints

- #211 / #212 stay as-is — this issue is a follow-up exploration, not a change to the shipped stealth design.
- Profiles must not weaken the stealth guarantee: whatever ships, `check:stealth` must still verify that disclosure steps are unreachable given the pre-execution seeded state.
- Keep the schema minimal (techniques-first principle): prefer the smallest engine surface that removes the wrapper boilerplate.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

