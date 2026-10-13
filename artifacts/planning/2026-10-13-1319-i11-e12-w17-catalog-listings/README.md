# Catalog Listings Named for What Runs Them — October 2026

> Delivery record · Created 2026-10-13

## Executive Summary

The Work Planner command catalog held twenty-nine specifications under six listings grouped on two different axes: Issues, Pull Requests and Project Boards named their subject, while Planning records, Graph and Scripts named the tool. A reader scanning for an operation met a heading that sometimes told them what the operation was about and sometimes what would run it, and two branch operations sat under Pull Requests because epic bases are a pull request's concern, not because `git` is.

This unit puts the catalog on one axis. The three GitHub listings name GitHub, and the two operations whose command is `git` take a listing of their own. The constraint that fixes the shape is the placement rule itself: it reads a specification as a third-level heading, so a GitHub listing nested over the existing ones would push every operation to the fourth level and count the group headings as the specifications instead. The tool is therefore named in each listing's own heading rather than in a layer above it, which is the shape that leaves all twenty-nine specifications visible to the rule that this epic exists to enforce.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Tests](tests.md) | The three checks behind AC20, the specification counts before and after, and the nesting measurement that fixed the shape |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I11:E12 Skill Layout](https://github.com/m2ux/workflow-server/issues/1319) |
| Review pull request | [#1321](https://github.com/m2ux/workflow-server/pull/1321) |
