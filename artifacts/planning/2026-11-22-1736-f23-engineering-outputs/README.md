# Engineering Output Availability — November 2026

> Hotfix delivery · Created 2026-11-22

## Executive Summary

F23 retains the branch identity of a directly pushed planning-records output. Its dependent task can read that evidence on engineering without requiring it in the product base.

The change preserves the existing product-branch ancestry gate. A synthetic local Git reproduction establishes the defect without external service calls or private project inputs.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Work Item](f23.md) | Declared files, exact behavior and focused verification |
| [Synthetic Reproduction](reproduce.py) | Current branch-less failure and known-engineering success on local Git repositories |
| [Reproduction Result](reproduction.json) | The measured unmet/met contrast before implementation |

## Links

| Resource | Link |
| --- | --- |
| Hotfix | [F23 #1736](https://github.com/m2ux/workflow-server/issues/1736) |
| Board | [Process #17](https://github.com/users/m2ux/projects/17) |
