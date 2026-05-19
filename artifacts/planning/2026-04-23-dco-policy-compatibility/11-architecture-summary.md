# Architecture Summary — DCO Policy Compatibility

**Work Package:** DCO Policy Compatibility
**Issue:** PR #109 / driving policy: DCO-Safe Agentic Coding Policy
**Date:** 2026-05-19
**Author:** strategic-review worker

---

## Executive Summary

This work package realigns the `work-package` workflow with the DCO-Safe Agentic Coding Policy. The previous design had the AI agent re-sign every commit on the human's behalf and force-push the rewritten history — a posture that produced GPG-signed commits but inverted the DCO's intent (the agent, not the human, was the source of the attestation). This change relocates attestation to a single, deliberate human action: a local squash-merge with `-s -S`. The agent's new job is to record provenance and gate submission on a human DCO sign-off; it never signs commits on the human's behalf.

The result is a workflow that produces a single auditable signed merge commit at integration time, a per-work-package provenance log, and explicit human attestation checkpoints — all without the agent ever holding the human's signing identity.

---

## System Context

The work-package workflow runs inside the Workflow Orchestration MCP Server and drives the AI agent through the lifecycle of one work package. The agent interacts with the human contributor (who holds the GPG key and DCO identity), the target Git repository (where the feature branch and PR live), GitHub (issues, PRs, and the squash-merge setting), and local Git tooling (commit, sign-off, GPG signing).

### Before

```mermaid
---
title: "Before: Agent signs on behalf of human"
---
flowchart LR
    Human([Human Contributor])
    Agent[Workflow Agent<br/>work-package]
    Repo[Target Git Repo]
    GitHub[(GitHub)]
    GPG[GPG signing key<br/>local]

    Human -->|Approves at checkpoint| Agent
    Agent -->|"gpg-resign-range:<br/>rebase --exec git commit --amend -S"| Repo
    Agent -->|"--no-gpg-sign on artifact commits"| Repo
    Agent -->|force-with-lease push| GitHub
    Agent -.->|"holds & uses"| GPG

    style Agent fill:#f5f5f5,stroke:#9e9e9e
    style GPG fill:#ffcdd2,stroke:#c62828
```

### After

```mermaid
---
title: "After: Human signs once at squash-merge time"
---
flowchart LR
    Human([Human Contributor])
    Agent[Workflow Agent<br/>work-package]
    Repo[Target Git Repo]
    GitHub[(GitHub)]
    GPG[GPG signing key<br/>local]

    Human -->|"DCO sign-off checkpoint"| Agent
    Agent -->|records provenance<br/>commits w/o forcing signing flags| Repo
    Agent -->|opens PR + pushes| GitHub
    Human -->|"git merge --squash + git commit -s -S"| Repo
    Human -.->|"holds & uses"| GPG
    Repo -->|signed squash-merge commit| GitHub

    style Agent fill:#e3f2fd,stroke:#1976d2
    style Human fill:#c8e6c9,stroke:#2e7d32
    style GPG fill:#c8e6c9,stroke:#2e7d32
```

The attestation surface moves from the agent to the human, and from per-commit rewrites to a single merge commit.

---

## Package Structure

This is a TOON-data change inside the workflow definition; no MCP server source code is touched. The change spans the work-package workflow's three asset layers — workflow definition, activities, and skills — plus one resource.

```mermaid
---
title: Package Diagram - work-package workflow surface
---
flowchart TB
    subgraph WP [work-package workflow]
        WT[workflow.toon<br/>3.11.0 → 3.12.1]

        subgraph Activities [activities/]
            A01[01-start-work-package]
            A04[04-research]
            A08[08-implement]
            A09[09-post-impl-review]
            A10[10-validate]
            A11[11-strategic-review]
            A12[12-submit-for-review]
            A13[13-complete]
        end

        subgraph Skills [skills/]
            S15[15-manage-git]
            S12[12-review-strategy<br/>cleanup]
            S25[25-dco-provenance<br/>NEW]
        end

        subgraph Resources [resources/]
            R12[12-pr-description.md]
        end
    end

    WT --> Activities
    WT --> Skills
    A04 --> S25
    A08 --> S25
    A12 --> S25
    A01 --> S15
    A08 --> S15
    A12 --> S15
    A13 --> S15
    A12 --> R12

    style S25 fill:#c8e6c9,stroke:#2e7d32
    style WT fill:#e3f2fd,stroke:#1976d2
    style A04 fill:#fff3e0,stroke:#ef6c00
    style A08 fill:#fff3e0,stroke:#ef6c00
    style A09 fill:#fff3e0,stroke:#ef6c00
    style A12 fill:#fff3e0,stroke:#ef6c00
```

**Colour key:**
- Green: new module
- Orange: substantially modified activity
- Blue: workflow root
- Grey (default): touched but small change

The new `dco-provenance` skill (25) is the architectural addition. It owns the provenance-log schema, attestation recording, and context-scope classification — the surface the activities reference.

---

## DCO Sign-off Flow

The new attestation path is a sequence of agent-driven recordings followed by a single human signing action.

```mermaid
---
title: DCO Sign-off Sequence
---
sequenceDiagram
    actor H as Human
    participant A as Workflow Agent
    participant R as Local Repo<br/>(target_path)
    participant GH as GitHub

    Note over A,GH: 01-start-work-package
    A->>GH: GET /repos/{owner}/{repo}<br/>(allow_squash_merge?)
    GH-->>A: squash_merge_available

    Note over A,R: 04-research
    A->>H: context-scope-declaration checkpoint
    H-->>A: repo-only | web-retrieval | mixed
    A->>A: set context_scope

    Note over A,R: 08-implement (per task)
    A->>R: code changes + commit
    A->>R: append row to provenance-log.md<br/>(task, model, prompt class, scope)

    Note over A,R: 09-post-impl-review
    A->>H: file-index-table checkpoint<br/>(rationale + block issues)
    H-->>A: rationale-confirmed / -with-issues / has-issues
    alt rationale_confirmed
        A->>H: rationale-amendment checkpoint
        H-->>A: all-accurate | provide-corrections
        A->>R: corrections recorded in manual-diff-review-report
    end

    Note over A,GH: 12-submit-for-review
    A->>H: dco-sign-off checkpoint (BLOCKING)<br/>6-item certification
    H-->>A: certify | flag-legal
    A->>R: append ## Attestation to provenance-log.md
    A->>GH: push, mark PR ready
    opt squash_merge_available
        A->>H: merge-strategy-reminder
    end

    Note over H,GH: Human action (outside workflow)
    H->>R: git checkout main && git pull
    H->>R: git merge --squash {branch}
    H->>R: git commit -s -S -m "...(#{pr})"
    H->>GH: git push
    Note right of GH: Signed + DCO-attested<br/>squash merge commit
```

The agent records four kinds of provenance: (1) the merge-strategy capability at start, (2) the context scope at research, (3) per-task generation records at implementation, (4) the rationale confirmation at post-impl-review. The human's DCO sign-off at submit time gates push, and the local squash-merge produces the auditable signed artefact.

---

## What Changed

### Components Added

| Component | Description |
|-----------|-------------|
| `skills/25-dco-provenance.toon` | New skill owning provenance-log schema, attestation recording, and context-scope classification. |
| `activities/01-start-work-package`::`detect-merge-strategy` step | GitHub API call to detect `allow_squash_merge`; sets `squash_merge_available`. |
| `activities/04-research`::`declare-context-scope` step + `context-scope-declaration` checkpoint | Classifies research provenance scope. |
| `activities/08-implement`::`provenance-log.md` artifact + `log-provenance` step | Per-task provenance record. |
| `activities/09-post-impl-review`::`rationale-confirmed` / `rationale-confirmed-with-issues` options + `rationale-amendment` checkpoint | Captures rationale confirmation as the human's provenance statement. |
| `activities/12-submit-for-review`::`dco-sign-off` step+checkpoint + `instruct-merge-strategy` step + `merge-strategy-reminder` checkpoint | Human DCO attestation gate; merge guidance. |
| `resources/12-pr-description.md`::`## AI Assistance` section | PR-body block summarising provenance for reviewers. |
| `skills/15-manage-git`::`code-commits` / `detect-merge-strategy` / `squash-merge-instruction` protocols | Co-authored-by guidance; merge-strategy detection; local squash-merge instruction. |

### Components Removed

| Component | Description |
|-----------|-------------|
| `activities/10-validate`::`scan-commit-signatures-for-strategic` | Pre-strategic GPG preflight scan. |
| `activities/11-strategic-review`::`unsigned-commits-prompt` checkpoint + `resign-unsigned-pr-commits` step | Strategic-review GPG resign flow. |
| `activities/12-submit-for-review`::`verify-commit-signatures` step | `manage-git::gpg-resign-range` invocation. |
| `skills/15-manage-git`::`gpg-resign-range` protocol | Per-commit GPG re-sign-by-rebase recipe. |
| `skills/15-manage-git`::`--no-gpg-sign` mandate on artifact commits | Forced unsigned artifact commits. |
| `skills/12-review-strategy`::`commit-signatures` protocol block | Orphan block referring to removed step + variable (cleanup commit). |
| `workflow.toon` variables: `unsigned_commits_in_pr`, `resign_unsigned_commits_requested`, `unsigned_commit_list_summary` | Supporting variables for the removed resign flow. |

### Variable Surface

| Direction | Variable | Purpose |
|-----------|----------|---------|
| Added | `squash_merge_available` | Drives merge-strategy routing |
| Added | `context_scope` | Provenance scope of research sources |
| Added | `rationale_confirmed` | Drives `rationale-amendment` checkpoint condition |
| Removed | `unsigned_commits_in_pr` | Was preflight signal |
| Removed | `resign_unsigned_commits_requested` | Was resign consent |
| Removed | `unsigned_commit_list_summary` | Was checkpoint message data |

Net: variable count rebalanced; surface no longer carries the resign machinery.

---

## Impact

### Stakeholders

| Stakeholder | Impact | Notes |
|-------------|--------|-------|
| Human contributors | Medium | New blocking DCO sign-off checkpoint at submit; new local squash-merge step replacing GitHub-UI merge for signed result. |
| AI agent runtime | Medium | One new skill, one new artifact (`provenance-log.md`), three new checkpoints. No new external integrations beyond an existing `gh api` call. |
| Reviewers (PR readers) | Low–Medium | PR descriptions now include an `## AI Assistance` block summarising provenance. |
| Engineering managers | Low | Audit trail is now a single signed squash commit per work package, plus a structured provenance log. |
| Legal / OSS program | Positive | The `flag-legal` option on the DCO sign-off checkpoint and the explicit attestation record give legal a documented escalation path. |

### System Dependencies

| System | Relationship | Impact |
|--------|--------------|--------|
| GitHub REST API | Upstream (read) | New call: `gh api repos/{owner}/{repo} --jq '.allow_squash_merge'`. Same auth as existing `gh` calls. |
| Local GPG agent | Downstream (human-only) | Workflow no longer invokes GPG on the agent's behalf. Human's signing setup must be working at squash-merge time. |
| Workflow MCP server | Hosting | No code or schema changes; data-only update. |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Human forgets to use `-s -S` at squash-merge time. | Medium | Medium | Non-blocking `merge-strategy-reminder` checkpoint at submit emits the literal command block. |
| Repo does not allow squash merges. | Low | Low | `detect-merge-strategy` sets `squash_merge_available=false`; reminder checkpoint is gated by that variable and does not fire. Branch commits land as-is. |
| `provenance-log.md` becomes stale across resumes. | Low | Low | `log-provenance` step runs inside the per-task forEach loop; append-only schema means resume-mode workers detect existing rows and skip. |
| Activities/README.md drift (stale references to removed surface). | Documented | Low | Hand-maintained doc deferred out of scope; tracked as separate finding (S2). |

---

## Future Considerations

- **`activities/README.md` regeneration pass.** Hand-maintained doc currently drifts in multiple sections; a small work package can replace stale references in one pass (finding S2).
- **Per-assistant identity mapping.** `skills/15-manage-git`'s `code-commits` protocol currently lists Claude's `Co-authored-by` identity inline. Other assistants would benefit from a structured identity table when more harnesses are supported.
- **PR-body `## AI Assistance` automation.** Currently rendered from variables at submit time; a future pass could verify the block survives PR-body edits through `update-pr::verify-body`.

---

## Related Documents

- [01-design-philosophy.md](01-design-philosophy.md) — Problem classification + complexity decision
- [06-wp-plan.md](06-wp-plan.md) — 13-task breakdown
- [09-code-review.md](09-code-review.md) — Code-review findings (incl. C1 inverted condition)
- [10-validation-record.md](10-validation-record.md) — Validator + typecheck + vitest results
- [11-strategic-review-1.md](11-strategic-review-1.md) — This activity's findings
