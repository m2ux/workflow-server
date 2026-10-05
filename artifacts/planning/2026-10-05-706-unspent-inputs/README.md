# Unspent Inputs — October 2026

> Epic planning record · Created 2026-10-05

## Executive Summary

A container `TECHNIQUE.md` can declare a required input that some operations beneath it never read. Where a workflow binds one of those operations and holds nothing under that name, the step owes a value it has no source for, and the agent receives that required slot as ambient context with nothing producing it. The inherited-input-never-spent canon entry names the defect, and a sweep with its test finds 125 such steps across the corpus.

This epic gives each of those inputs a source in the families that are still edited, and adds a guard that applies the entry so a new site fails at the change that introduces it. workflow-design is deprecated, so the guard exempts it.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Firing sites](sites.md) | Every step the entry's test flags, by container input |
| [Decisions](decisions.md) | The home initiative, the workflow-design exemption, the proof, Joins and ordering |
| [W01](w01.md) | The guard program and its proof |
| [W02](w02.md) | Workflow-authoring's request input |
| [W03](w03.md) | The CI/CD audit's scanner inputs |
| [W04](w04.md) | Work-package's group container inputs |
| [W05](w05.md) | The github, atlassian and git library contracts |
| [W06](w06.md) | Prism's target content |
| [W07](w07.md) | The guard in the standard sweep |

## Links

| Resource | Link |
| --- | --- |
| Technical Debt initiative | [#706](https://github.com/m2ux/workflow-server/issues/706) |
| The canon entry | [#1144](https://github.com/m2ux/workflow-server/pull/1144) |
| The entry's corrected Detect | [#1145](https://github.com/m2ux/workflow-server/pull/1145) |
| The cargo fix the entry was proven on | [#1135](https://github.com/m2ux/workflow-server/pull/1135) |
