---
name: harness-compat
description: Harness-independent vocabulary for spawning, continuing, and concurrently dispatching sub-agents.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.0.0
  order: 7
  legacy_id: 7
---

# Harness Compat

## Capability

Abstract sub-agent dispatch operations — harness-independent vocabulary for spawning, continuing, and concurrently dispatching agents.

## Rules

### harness-independence

All skills and activities MUST reference operation names from this skill ([spawn-agent](./spawn-agent.md), [continue-agent](./continue-agent.md), [spawn-concurrent](./spawn-concurrent.md)) rather than harness-specific tool syntax. Each operation takes the current `harness` as an input and branches inline in its procedure — harness-specific invocations are encoded only here, not duplicated into caller protocols.
