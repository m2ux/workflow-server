---
name: intermediate-artifact-schemas
description: JSON shapes for the intermediate artifacts produced between reconnaissance, scanner dispatch, verification, and merge.
metadata:
  version: 1.0.0
  order: 5
  legacy_id: 5
---

# Intermediate Artifact Schemas

JSON shapes for the intermediate artifacts that flow between phases of the CI/CD audit: the reconnaissance inventory, the scanner roster, the verification gap report, and the merge outputs. The per-scanner output is documented separately in [sub-agent-output-schema](sub-agent-output-schema.md). Each section below lists every field, its type, and its meaning, derived from the producing technique's declared outputs and protocol.

## workflow-inventory

Produced by `inventory-workflows`. Complete inventory of workflow files with classification data, mirroring the four declared output components (`file_list`, `trigger_classification`, `permission_map`, `checkout_patterns`) and the script identification step.

```json
{
  "submodules": [
    {
      "submodule": "midnight-node",
      "workflow_dir": ".github/workflows",
      "file_list": [
        {
          "path": ".github/workflows/ci.yml",
          "size_bytes": 4096,
          "last_modified": "2026-02-18T09:30:00Z"
        }
      ],
      "trigger_classification": [
        {
          "file": ".github/workflows/ci.yml",
          "triggers": ["pull_request_target", "push"],
          "trigger_config": {
            "pull_request_target": { "branches": ["main"] }
          }
        }
      ],
      "permission_map": [
        {
          "file": ".github/workflows/ci.yml",
          "workflow_permissions": { "contents": "write" },
          "job_permissions": {
            "build": { "contents": "read" }
          }
        }
      ],
      "checkout_patterns": [
        {
          "file": ".github/workflows/ci.yml",
          "uses": "actions/checkout@v4",
          "ref": "${{ github.event.pull_request.head.sha }}",
          "untrusted_ref": true
        }
      ],
      "scripts": [
        {
          "file": ".github/workflows/ci.yml",
          "run_blocks": ["cargo build"],
          "referenced_scripts": ["scripts/setup.sh"]
        }
      ]
    }
  ],
  "zero_workflow_submodules": [],
  "parse_errors": []
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `submodules` | object[] | One entry per inventoried submodule |
| `submodules[].submodule` | string | Submodule directory name |
| `submodules[].workflow_dir` | string | Path to the `.github/workflows/` directory |
| `submodules[].file_list` | object[] | All workflow file paths with metadata (`path`, `size_bytes`, `last_modified`) |
| `submodules[].trigger_classification` | object[] | Per-workflow trigger types extracted from the `on:` block, with their configurations |
| `submodules[].permission_map` | object[] | Per-workflow `permissions:` scopes: `workflow_permissions` (top-level defaults) and `job_permissions` (per-job overrides) |
| `submodules[].checkout_patterns` | object[] | Per-workflow `actions/checkout` uses and `ref:` values; `untrusted_ref` flags PR head SHA, `head.ref`, or merge-commit checkouts |
| `submodules[].scripts` | object[] | `run:` blocks and referenced script files for later P7 scanning |
| `zero_workflow_submodules` | string[] | Submodules with no `.github/workflows/` directory (skipped for scanner assignment) |
| `parse_errors` | object[] | Files with invalid YAML, flagged for manual review |

## scanner-assignments

The agent-to-submodule mapping for the scanner roster, consumed by `dispatch-scanners`. One scanner agent is assigned per submodule that contains workflows; each entry carries the context variables the dispatcher composes into the scanner sub-agent prompt.

```json
{
  "scanners_assigned": 2,
  "roster": [
    {
      "scanner_id": "S1",
      "submodule": "midnight-node",
      "assigned_activity_id": "sub-scan",
      "workflow_files": [
        ".github/workflows/ci.yml",
        ".github/workflows/release.yml"
      ],
      "output_file": "s1-midnight-node.json"
    },
    {
      "scanner_id": "S2",
      "submodule": "midnight-indexer",
      "assigned_activity_id": "sub-scan",
      "workflow_files": [
        ".github/workflows/build.yml"
      ],
      "output_file": "s2-midnight-indexer.json"
    }
  ]
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `scanners_assigned` | number | Count of scanner agents in the roster (compared against `scanners_dispatched` for completeness) |
| `roster` | object[] | One entry per scanner agent |
| `roster[].scanner_id` | string | Scanner designator (S1-Sn) |
| `roster[].submodule` | string | Assigned submodule path |
| `roster[].assigned_activity_id` | string | Activity the scanner sub-agent enters via `next_activity` |
| `roster[].workflow_files` | string[] | Workflow file list passed to the scanner as context |
| `roster[].output_file` | string | Target output filename, `s{n}-{submodule}.json` (see [sub-agent-output-schema](sub-agent-output-schema.md#file-naming-convention)) |

## verification-report

Produced by `verify-scan-output`. Scan completeness verification with gaps and re-scan recommendations, mirroring the four declared output components (`file_coverage`, `pattern_coverage`, `gaps`, `recommendation`).

```json
{
  "verification_complete": false,
  "structure_validation": [
    {
      "output_file": "s1-midnight-node.json",
      "valid": true,
      "errors": []
    }
  ],
  "file_coverage": {
    "total_files": 27,
    "scanned_files": 26,
    "unscanned_files": [
      ".github/workflows/nightly.yml"
    ]
  },
  "pattern_coverage": [
    {
      "scanner_id": "S1",
      "patterns_applied": ["P1", "P2", "P3", "P4", "P5", "P6", "P7"],
      "incomplete": false,
      "missing_patterns": []
    }
  ],
  "gaps": [
    {
      "type": "unscanned_file",
      "detail": ".github/workflows/nightly.yml not present in any scanner output",
      "scanner_id": "S1"
    }
  ],
  "recommendation": {
    "rescan_required": true,
    "targets": [
      {
        "scanner_id": "S1",
        "files": [".github/workflows/nightly.yml"],
        "patterns": []
      }
    ]
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `verification_complete` | boolean | `true` only if file and pattern coverage are both 100% (zero gaps) |
| `structure_validation` | object[] | Per-output schema-validation result; malformed or missing fields count as gaps |
| `file_coverage` | object | Scanned vs total files: `total_files`, `scanned_files`, `unscanned_files` (inventory diff) |
| `pattern_coverage` | object[] | Per-scanner pattern-application status; `incomplete`/`missing_patterns` flag scanners not reporting all seven patterns (P1-P7) |
| `gaps` | object[] | List of unscanned files or skipped patterns, each with `type`, `detail`, and originating `scanner_id` |
| `recommendation` | object | Re-scan targets if gaps exist: `rescan_required` and per-scanner `targets` (files and patterns to re-scan) |

## merged-findings

Produced by `merge-scan-findings`. The unified finding set after deduplication and cross-pattern correlation, mirroring the three declared output components (`findings`, `compounds`, `observations`).

```json
{
  "findings": [
    {
      "merged_id": "M-001",
      "pattern_id": "P2",
      "severity_hint": "Critical",
      "title": "Pwn Request: pull_request_target with fork checkout and cargo execution",
      "affected_file": ".github/workflows/ci.yml",
      "line_range": "1-22",
      "source": {
        "type": "fork_pr_code",
        "entry_point": "pull_request_target trigger"
      },
      "sink": {
        "type": "shell_execution",
        "execution_context": "CI runner with GITHUB_TOKEN (contents: write)"
      },
      "evidence": "on:\n  pull_request_target:\n...\n- run: cargo build",
      "merged_from": ["S1-F001"]
    }
  ],
  "compounds": [
    {
      "compound_id": "C-001",
      "title": "Pwn Request with expression injection and excessive permissions",
      "affected_file": ".github/workflows/ci.yml",
      "constituent_patterns": ["P2", "P1", "P4"],
      "constituent_findings": ["M-001", "M-004", "M-006"],
      "attack_chain": "pull_request_target -> fork checkout -> expression injection in run block -> contents: write token exfiltration"
    }
  ],
  "observations": [
    {
      "merged_id": "M-OBS-001",
      "pattern_id": "P7",
      "title": "curl|bash for rustup installation",
      "affected_file": ".github/workflows/ci.yml",
      "rationale": "Accepted risk — official installer with pinned URL",
      "merged_from": ["S1-O001"]
    }
  ]
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `findings` | object[] | Deduplicated and correlated findings, keyed by `merged_id`; duplicates sharing `(affected_file, line_range, pattern_id)` are collapsed, keeping the most complete evidence |
| `findings[].merged_from` | string[] | Scanner finding IDs collapsed into this merged finding |
| `compounds` | object[] | Compound vulnerability chains where multiple patterns converge on one workflow; `constituent_patterns` and `constituent_findings` preserve all constituent evidence, and `attack_chain` captures the full chain |
| `observations` | object[] | Informational items without a confirmed source-to-sink flow; retained even if they do not rise to finding level |

## reconciliation

Produced by `merge-scan-findings`. Per-scanner finding mapping to merged findings — every original scanner finding maps to a merged finding number or is marked duplicate, and `unaccounted` must equal zero for every scanner.

```json
{
  "scanners": [
    {
      "scanner_id": "S1",
      "total_scanner_findings": 2,
      "mappings": [
        {
          "scanner_finding_id": "S1-F001",
          "merged_id": "M-001",
          "disposition": "merged"
        },
        {
          "scanner_finding_id": "S1-F002",
          "merged_id": "M-001",
          "disposition": "duplicate"
        }
      ],
      "unaccounted": 0
    }
  ],
  "all_reconciled": true
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `scanners` | object[] | One reconciliation entry per scanner agent |
| `scanners[].total_scanner_findings` | number | Count of findings in that scanner's output |
| `scanners[].mappings` | object[] | Maps each `scanner_finding_id` to its `merged_id` with a `disposition` (`merged` or `duplicate`) |
| `scanners[].unaccounted` | number | Scanner findings not mapped to any merged finding; must be `0` (a non-zero value is a HARD STOP) |
| `all_reconciled` | boolean | `true` only when every scanner reports `unaccounted` equal to zero |
