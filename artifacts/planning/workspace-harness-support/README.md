# Shared harness policy — September 2026

> Implementation record · Created 2026-09-26 · Revised 2026-10-12

## Executive Summary

The workspace supplies one command policy to Claude Code, Cursor and Codex. A
common permission file holds the command allowlist, file grants, web domains and
tool permissions, a shared evaluator checks blocking rules before confirmation
requirements and approval grants, and each harness owns the adapter that
translates its own events and decisions. The existing shell parsers, URL checks
and bubblewrap launcher remain the implementation foundation.

It matters because the policy an agent is held to was previously expressed in
Claude's configuration and enforced by Claude's hooks, so Codex received the
rule text with no local enforcement behind it, and Cursor inherited whatever
Claude's settings happened to say. One policy with per-harness adapters makes
the same command checks and permission grants reachable from every harness, and
makes a change to the policy a change in one file rather than three.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Plan](plan.md) | The scope, the assessment of each harness's contracts, the implementation sequence, the decisions, the delivery state, and one validation-evidence section per check |
| [Acceptance criteria](acceptance-criteria.md) | Each criterion, the instrument that observes it, where it stands, and the reasoning behind it |
| [Session validation](session-validation.md) | The live-session objective and sequence, and the observations behind the Codex runtime result |
| [Separate sessions](separate-sessions.md) | Why each harness is validated in a session of its own, and why those tasks do not share a pull request |
| [W01](w01.md) | Shared policy, adapters and generated configuration |
| [W02](w02.md) | Codex session validation of the delivered policy |
| [W03](w03.md) | Cursor session validation of the delivered policy |
| [W04](w04.md) | Claude Code session validation of the delivered policy |

## Links

| Resource | Link |
| --- | --- |
| Pull request | [#1300 Workspace harnesses: share hooks and permissions through dedicated adapters](https://github.com/m2ux/workflow-server/pull/1300) |
| Issue | [#1299 Shared Harness Policy: Every Harness Enforces the Same Command Checks](https://github.com/m2ux/workflow-server/issues/1299) |
| Codex hooks | [learn.chatgpt.com/docs/hooks](https://learn.chatgpt.com/docs/hooks) |
| Codex command rules | [learn.chatgpt.com/docs/agent-configuration/rules](https://learn.chatgpt.com/docs/agent-configuration/rules) |
