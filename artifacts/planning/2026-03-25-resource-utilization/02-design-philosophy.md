# Design Philosophy: Resource Utilization Fix

**Issue:** [#61](https://github.com/m2ux/workflow-server/issues/61)
**Date:** 2026-03-25

---

## Problem Definition

After the session management redesign (#59), template resources (PR descriptions, READMEs, review templates, etc.) are attached to skill responses. The server code correctly loads and attaches resources. Agents receive them but do not apply them, resulting in outputs that ignore prescribed templates.

### How Resources Are Delivered

**`get_skill` response** (resource-tools.ts:127-129):

```json
{
  "id": "update-pr",
  "version": "1.0.0",
  "capability": "...",
  "protocol": { ... },
  "resources": ["12", "24"],
  "tools": { ... },
  "_resources": {
    "12": "---\nid: pr-description\n...(raw content)...",
    "24": "---\nid: review-mode\n...(raw content)..."
  }
}
```

**`get_skills` response** (resource-tools.ts:92):

```json
{
  "activity_id": "submit-for-review",
  "skills": {
    "update-pr": { "id": "update-pr", "resources": ["12", "24"], ... },
    "respond-to-pr-review": { ... }
  },
  "resources": {
    "12": "---\nid: pr-description\n...(raw content)...",
    "24": "---\nid: review-mode\n...(raw content)..."
  }
}
```

### Critical Observation

The two tools use **different field names** for the same data:
- `get_skill`: `_resources` (underscore-prefixed, merged into skill object)
- `get_skills`: `resources` (top-level, no underscore)

---

## Root Cause Analysis

### RC-1: Underscore prefix `_resources` signals "internal/metadata" (HIGH)

The `_resources` field name used by `get_skill` follows a common convention where underscore-prefixed fields indicate internal/private data. MCP itself uses `_meta` this way. Agents trained on this convention will instinctively skip `_resources` as non-actionable metadata.

**Evidence:** `resource-tools.ts:128` — `_resources` is only used in `get_skill`, not `get_skills`.

### RC-2: Naming inconsistency between `get_skill` and `get_skills` (HIGH)

- `get_skill` → `_resources` (underscore prefix, merged into skill object)
- `get_skills` → `resources` (no underscore, top-level key alongside `skills`)

Documentation in `workflow-execution.toon:94` says "check the _resources field in get_skill output" — but agents using `get_skills` (the recommended batch call per `execute-activity.toon`) will find resources under `resources`, not `_resources`. No single instruction covers both.

### RC-3: Field name collision forces the underscore (MEDIUM)

The skill TOON object already has a `resources` field (an array of index strings, e.g., `["12", "24"]`). When `get_skill` merges resource content into the skill object, it cannot use `resources` (collides with the indices array), so it uses `_resources`. This is the *cause* of RC-1 and RC-2 — the collision forced an awkward naming choice.

### RC-4: "Load resource" language implies a tool call (HIGH)

**30+ instances** across workflow TOON files say "Load resource XX" in protocol steps:

```
"Load resource 12 (pr-description) for template and structure"
"Load resource 03 for guidance"
"Load resource 14 for verification checklist"
```

"Load" is an imperative verb implying the agent needs to *fetch* something — but the resource is already embedded in the response. The agent either:
1. Looks for a `load_resource` or `get_resource` tool (which doesn't exist), fails silently, and skips it
2. Interprets "Load" loosely but doesn't know where to look in the response

### RC-5: `note_resources` hint is buried in `tools` section (MEDIUM)

Skills include a `note_resources` entry in their `tools` block:

```
note_resources: "Resources are attached to skill responses via get_skill and get_skills — no separate get_resource call needed"
```

This hint appears in 17 work-package skills and ~15 other workflow skills. However, it's in the `tools` section — not in the `protocol` where "Load resource XX" appears. Agents execute protocol steps sequentially; they don't cross-reference the tools section while executing a protocol step.

### RC-6: `execute-activity` skill doesn't name the response field (LOW)

The canonical `execute-activity` skill says:

> "Referenced resources are included in the response — no separate get_resource calls needed."

This correctly says resources are "included" but never names the field (`_resources` for `get_skill`, `resources` for `get_skills`). An agent reading this knows resources exist somewhere in the response but doesn't know which key to inspect.

---

## Classification

| Attribute | Value |
|-----------|-------|
| **Problem type** | Specific — identifiable root causes with deterministic fixes |
| **Category** | API response design + instruction language mismatch |
| **Severity** | High — every workflow activity with resources is affected |
| **Scope** | Server code (1 file) + workflow content (~50 TOON files) + meta skills (2-3 files) |
| **Complexity** | Medium — two distinct change domains (code + content) but each change is mechanical |

---

## Design Philosophy

### Principle 1: Resource content should be unambiguously named

The field containing resource content must not use conventions that signal "ignore me" (underscore prefix) and must be consistent across all API endpoints.

### Principle 2: Instructions must match the delivery mechanism

If resources are pre-loaded into the response, the language must say "Use the attached resource" or "Apply the template from resource XX (included in this response)", not "Load resource XX".

### Principle 3: The field collision should be resolved at the source

The collision between the skill's `resources` array (indices) and the actual content should be resolved by restructuring the response, not by forcing an awkward `_resources` name.

### Principle 4: Agents should find resources without cross-referencing sections

The resource location must be stated inline where the agent is told to use it, not in a separate `tools.note_resources` hint that requires cross-referencing.

---

## Proposed Path: Direct Implementation

### Change 1: Restructure `get_skill` response to eliminate `_resources`

Instead of merging `_resources` into the skill object (which collides with the `resources` indices field), return a structured response:

```json
{
  "skill": { "id": "update-pr", "resources": ["12", "24"], ... },
  "resources": {
    "12": "...(content)...",
    "24": "...(content)..."
  }
}
```

This matches the `get_skills` structure (which already uses top-level `resources`) and eliminates the underscore prefix entirely.

**Trade-off:** This is a breaking change to the response shape. Any existing agent code that accesses `response.id` or `response.protocol` directly would need to access `response.skill.id` and `response.skill.protocol`. However, since agents are instructed by TOON files (not hardcoded client code), this is a documentation change, not a code migration.

### Change 2: Update "Load resource" language across all TOON files

Replace all ~30 instances of "Load resource XX" with language like:

```
"Use attached resource XX (pr-description) for template and structure"
```

or:

```
"Apply the template from resource XX (included in the resources field of this response)"
```

### Change 3: Update `execute-activity` bootstrap-skill protocol

Explicitly name the `resources` field:

```
"Read each skill's protocol, rules, tools, inputs, and output definitions.
 Referenced resources are included in the response under the 'resources' key — 
 use them as templates and guidance when executing steps."
```

### Change 4: Add resource utilization rule to `rules.toon`

Add a rule in the `session-protocol` or a new `resource-handling` section:

```
"When a skill references a resource (e.g., 'Use attached resource 12'), the resource content 
 is available in the 'resources' field of the get_skill or get_skills response. Do NOT attempt 
 to load resources via separate tool calls — they are pre-loaded. Apply resource content as 
 templates when producing the corresponding output."
```

### Change 5: Remove or relocate `note_resources` tool entries

Either remove `note_resources` from `tools` sections entirely (since the rule in `rules.toon` handles it globally) or move it to the relevant protocol step inline.

---

## Complexity Assessment

| Change | Files | Effort | Risk |
|--------|-------|--------|------|
| Restructure `get_skill` response | 1 (resource-tools.ts) | Low | Medium — response shape change |
| Update "Load resource" language | ~30 skill/activity TOON files | Medium (mechanical) | Low |
| Update `execute-activity` bootstrap | 1 TOON file | Low | Low |
| Add rule to `rules.toon` | 1 TOON file | Low | Low |
| Remove `note_resources` entries | ~30 TOON files | Low (mechanical) | Low |

**Total estimated effort:** 2-3 hours
**Risk level:** Medium (response shape change requires testing)
