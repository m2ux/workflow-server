---
name: design-principles
description: Positive design-time framing principles for workflow creation and modification.
metadata:
  order: 0
  legacy_id: 0
---

# Overview

Positive framing for workflow design-time authoring. Each principle states a *prefer / before / only after* stance. These principles — together with the anti-pattern catalog and the schema construct inventory — are the **workflow-design canon** for design-time authoring. 

---

## 1. Internalize Before Producing

Demonstrate understanding of the conceptual model (Goal → Activity → operation), schema-vs-runtime boundaries, inline-vs-modular distinctions, and existing conventions before producing any content.

## 2. Define Complete Scope Before Execution

Enumerate every file to create, modify, or remove before starting. Include the workflows worktree. Re-verify after completion.

## 3. Clarify Before Assuming

When user intent admits materially different interpretations, ask one clarifying question before acting.

## 4. Maximize Schema Expressiveness

Prefer the most specific formal construct the schema provides. Prose is only for `description` / `outcome` (and equivalent) fields that state WHAT without restating structure. I/O contracts stay portable — describe what a value is, not where a particular workflow wires it.

## 5. Separate Fill from Does

Resources hold fill/consult content (templates, vocabularies, criteria). Does (protocol, behavioural rules) lives outside resources. Operative criteria have exactly one home.

## 6. Convention Over Invention

Search for existing conventions before introducing new patterns. Use established naming, field ordering, and structural patterns.

## 7. Confirm Before Irreversible Changes

Classify changes by reversibility. Semi-reversible and irreversible changes require explicit confirmation with impact analysis.

## 8. Encode Constraints as Structure

Critical constraints must be backed by structural enforcement (checkpoints, conditions, validate actions), not rule text alone.

## 9. Non-Destructive Updates

Compare new content against existing content. Flag any material being removed. Content-reducing updates require explicit user approval.

## 10. Complete Documentation Structure

Every workflow includes a README.md at the root and in each construct subfolder. READMEs orient (purpose, flow, value, structure, links).

## 11. Output Economy

Design artifact contracts and checkpoints for the reader who must act on them — one canonical home per fact, declared human vs agent audience, exception-only status, lean templates, one close-out document, one decision per checkpoint, statement-form messages with artifact links where named.
