---
id: sub-agent-output-schema
version: 1.0.0
---

# Scanner Sub-Agent Output Schema

Each per-submodule scanner agent (S1-Sn) writes a JSON file to the planning folder following this schema. The verification agent (V) validates outputs against this schema. The merge agent (M) consumes these files to produce the unified finding set.

## File Naming Convention

```
s{n}-{submodule}.json
```

Where `{n}` is the scanner agent number (1-based) and `{submodule}` is the submodule directory name (e.g., `s1-midnight-node.json`).

## Schema

```json
{
  "scanner_id": "S1",
  "submodule": "midnight-node",
  "scan_timestamp": "2026-03-02T12:00:00Z",
  "workflow_files_scanned": 26,
  "workflow_files_total": 26,
  "patterns_applied": ["P1", "P2", "P3", "P4", "P5", "P6", "P7"],

  "findings": [
    {
      "id": "S1-F001",
      "pattern_id": "P2",
      "severity_hint": "Critical",
      "title": "Pwn Request: pull_request_target with fork checkout and cargo execution",
      "source": {
        "type": "fork_pr_code",
        "description": "Attacker-controlled code from fork PR",
        "entry_point": "pull_request_target trigger"
      },
      "sink": {
        "type": "shell_execution",
        "description": "cargo build executed on checked-out fork code",
        "execution_context": "CI runner with GITHUB_TOKEN (contents: write)"
      },
      "affected_file": ".github/workflows/ci.yml",
      "affected_lines": {
        "trigger": "1-3",
        "checkout": "15-18",
        "execution": "20-22"
      },
      "evidence": "on:\n  pull_request_target:\n...\n- uses: actions/checkout@v4\n  with:\n    ref: ${{ github.event.pull_request.head.sha }}\n- run: cargo build",
      "compound_patterns": ["P4"],
      "notes": "Combined with P4: workflow has contents: write permission"
    }
  ],

  "observations": [
    {
      "id": "S1-O001",
      "pattern_id": "P7",
      "title": "curl|bash for rustup installation",
      "description": "Workflow uses curl|bash to install rustup from official source (sh.rustup.rs). Hardcoded URL, HTTPS, trusted domain.",
      "affected_file": ".github/workflows/ci.yml",
      "affected_lines": "25",
      "severity_hint": "Low",
      "rationale": "Accepted risk — official installer with pinned URL"
    }
  ],

  "coverage": {
    "files": {
      "scanned": [
        ".github/workflows/ci.yml",
        ".github/workflows/release.yml"
      ],
      "skipped": [],
      "errors": []
    },
    "patterns": {
      "P1": { "applied": true, "findings_count": 0 },
      "P2": { "applied": true, "findings_count": 1 },
      "P3": { "applied": true, "findings_count": 0 },
      "P4": { "applied": true, "findings_count": 1 },
      "P5": { "applied": true, "findings_count": 0 },
      "P6": { "applied": true, "findings_count": 0 },
      "P7": { "applied": true, "findings_count": 0 }
    }
  },

  "ai_config_files": {
    "found": ["AGENTS.md"],
    "codeowners_protected": false,
    "codeowners_exists": true
  },

  "summary": {
    "total_findings": 1,
    "total_observations": 1,
    "by_pattern": {
      "P1": 0, "P2": 1, "P3": 0, "P4": 1, "P5": 0, "P6": 0, "P7": 0
    },
    "by_severity_hint": {
      "Critical": 1, "High": 0, "Medium": 0, "Low": 0
    }
  }
}
```

## Field Descriptions

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scanner_id` | string | Yes | Scanner agent designator (S1, S2, etc.) |
| `submodule` | string | Yes | Submodule directory name |
| `scan_timestamp` | string | Yes | ISO 8601 timestamp |
| `workflow_files_scanned` | number | Yes | Files successfully scanned |
| `workflow_files_total` | number | Yes | Total files in scope |
| `patterns_applied` | string[] | Yes | Must be `["P1","P2","P3","P4","P5","P6","P7"]` |
| `findings` | object[] | Yes | Confirmed vulnerability findings |
| `observations` | object[] | Yes | Informational items (may be empty array) |
| `coverage` | object | Yes | Per-file, per-pattern coverage data |
| `ai_config_files` | object | Yes | AI config file inventory and protection status |
| `summary` | object | Yes | Finding and observation counts |

### Finding Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique ID: `{scanner_id}-F{nnn}` |
| `pattern_id` | string | Yes | P1 through P7 |
| `severity_hint` | string | Yes | Scanner's severity estimate (final scoring by M/report) |
| `title` | string | Yes | Brief description of the vulnerability |
| `source` | object | Yes | Attacker-controlled input: type, description, entry_point |
| `sink` | object | Yes | Privileged execution: type, description, execution_context |
| `affected_file` | string | Yes | Path to the vulnerable workflow file |
| `affected_lines` | object | Yes | Line numbers for key components |
| `evidence` | string | Yes | Vulnerable code snippet |
| `compound_patterns` | string[] | No | Other patterns that compound with this finding |
| `notes` | string | No | Additional context |

### Observation Fields

Same as finding fields but represent items without a confirmed source-to-sink flow or items that are accepted risks.

## Validation Rules

The verification agent (V) checks:

1. `patterns_applied` contains all seven patterns
2. `workflow_files_scanned` equals `workflow_files_total` (or `coverage.files.skipped` explains gaps)
3. Every file in `coverage.files.scanned` exists in the submodule
4. Every finding has non-empty `source`, `sink`, and `evidence`
5. Finding IDs are unique within the scanner output
6. `summary` counts match the actual findings array length
