# Resource Utilization Fix — Planning

**Issue:** [#61](https://github.com/m2ux/workflow-server/issues/61)
**Branch:** `fix/61-resource-utilization`
**Date:** 2026-03-25

## Problem Statement

After the session management redesign (#59), template resources (PR descriptions, READMEs, etc.) are attached to skill responses via `_resources` in `get_skill`/`get_skills`, but agents are not correctly utilizing them during workflow execution.

## Investigation Areas

1. **Resource delivery** — How `_resources` is populated and returned to agents
2. **Resource discoverability** — Whether naming, structure, or placement causes agents to overlook resources
3. **Resource application** — What changes ensure agents reliably consume and apply attached resources

## Artifacts

Planning and investigation documents will be added to this folder as work progresses.
