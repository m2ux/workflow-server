---
metadata:
  version: 1.1.0
---

## Capability

Challenge findings folded into the concern set, with the convergence and residue flags that fold implies.

## Inputs

### challenge_findings

Ordered per-perspective findings from the challenge pass.

## Outputs

### concern_document

The concern document with challenge resolutions applied and newly surfaced items appended.

### concerns_agent_resolvable

True if any item remains agent-resolvable, or is newly surfaced as such; false when only irreducible residue, or an empty set, remains.

### residual_opens_remain

True iff irreducible opens remain after this merge; false for an empty open set.

### residual_opens

*(optional)* The irreducible open items after this merge; empty when none remain.

## Protocol

### 1. Merge Findings

- Walk `{challenge_findings}` in order; for each concern id, reconcile perspective outcomes (prefer evidence-backed `resolved-by-challenge` over bare `confirmed`)
- Apply resolutions to `{concern_document}`: resolved items get Outcome/resolution text; newly surfaced items are appended as open with classification
- Items marked `weakened` stay open but gain challenge notes for residual presentation

### 2. Reclassify and Set Flags

- Reclassify remaining opens: agent-resolvable → keep `{concerns_agent_resolvable}` true; stakeholder/irreducible only → `{concerns_agent_resolvable}` false and `{residual_opens_remain}` true; none open → both false
- Emit `{residual_opens}` as the irreducible set (empty when none)

## Rules

### concern-document-is-the-record

`{concern_document}` is the single statement of every concern this operation folds; the flags it emits summarise that document rather than standing apart from it.

### empty-set-is-success

An empty open set after combine is a valid terminal state — `{residual_opens_remain}` false, no interview required.
