# Prism Workflow

## Overview

The **Prism Workflow** applies cognitive lenses to code, documents, or proposals through isolated sub-agent passes. Each pass runs in a fresh context to guarantee analytical independence.

## Modes

- **Single Pass (L12):** Quick structural analysis using the L12 lens
- **Full Prism (3-pass):** Deep self-correcting analysis (structural → adversarial → synthesis)
- **Portfolio:** Multiple complementary lenses for breadth of analysis

## Key Properties

### Isolation Model
Each analytical pass is dispatched to a **fresh sub-agent**. The adversarial pass never sees the structural analysis generation history — only the final artifact text. This prevents bias and enables genuine adversarial challenge.

### Worker Discipline (CRITICAL)

Sub-agents in this workflow have **full read/write permissions**. They must:

1. **Write artifacts immediately** — DO NOT ask for permission
2. **Include OPERATIONAL DIRECTIVES** in Task prompts that specify:
   - Target file paths
   - "Write immediately" timing requirement
   - Verification reporting format
3. **Report completion** with file path, size, and validation status
4. **Surface genuine blockers** (not permission deferrals) using 🔴 BLOCKER format

**What NOT to do:**
- ❌ "Would you like me to save this?"
- ❌ "Can I write to this directory?"
- ❌ "Do you prefer I switch to Agent mode?"

These are **permission deferrals** that create workflow stalls. Write directly.

**What to do:**
- ✅ Write artifacts to specified paths immediately
- ✅ Report: "✓ Artifact written: [path] | Size: [KB] | Format: Markdown ✓"
- ✅ If genuine issue: "🔴 BLOCKER: Directory doesn't exist. Requires: mkdir -p. Blocking: artifact write."

## Orchestrator Responsibilities

1. Include explicit OPERATIONAL DIRECTIVES in every Task prompt to sub-agents
2. Verify artifact paths exist (or authorize creation)
3. Capture full text output from each pass for forwarding to next pass
4. Manage transitions automatically (no user checkpoints between passes)
5. Report completion and artifact paths to user

## Sub-Agent Responsibilities

1. Read OPERATIONAL DIRECTIVES carefully
2. Execute all file operations specified (no deferral)
3. Verify writes succeed before returning
4. Surface genuine blockers immediately
5. Report file path, size, validation status

## Usage

```
Analyze this document using the full prism workflow:

User provides:
- target: /path/to/document.md
- pipeline_mode: "full-prism"
- output_path: /path/to/artifacts/

Workflow executes:
1. select-mode activity (plan the analysis)
2. structural-pass activity (L12 lens)
3. adversarial-pass activity (challenge structural)
4. synthesis-pass activity (reconcile both)
5. deliver-result activity (present findings)

User receives:
- All three analysis artifacts
- Synthesis assessment with recommendations
- Artifact paths for reference
```

## File Structure

```
.engineering/workflows/prism/
├── workflow.toon              # Main workflow definition with rules
├── README.md                   # This file
├── activities/
│   ├── select-mode.toon       # Plan analysis configuration
│   ├── structural-pass.toon   # Execute L12 structural lens
│   ├── adversarial-pass.toon  # Execute adversarial lens
│   ├── synthesis-pass.toon    # Execute synthesis lens
│   └── deliver-result.toon    # Present final analysis
├── skills/
│   ├── plan-analysis.toon     # Planning skill
│   ├── structural-analysis.toon # Structural analysis skill
│   └── full-prism.toon        # Adversarial + synthesis skills
└── resources/
    ├── 00-structural-lens-code.md
    ├── 01-adversarial-lens-code.md
    ├── 02-synthesis-lens-code.md
    ├── 03-structural-lens-general.md
    ├── 04-adversarial-lens-general.md
    └── 05-synthesis-lens-general.md
```

## Critical Rules (In workflow.toon)

### Isolation Model
Each pass is fresh — no resume, no shared context between structural and adversarial.

### Worker Permissions
Sub-agents have full read/write. Write artifacts immediately without asking permission.

### No Permission Deferrals
Never surface questions like "Would you like me to save this?" — write directly and report.

### Blocker Surfacing
Genuine blockers (directory doesn't exist) get 🔴 BLOCKER format. Permission uncertainty is NOT a blocker.

### Artifact Verification
Report file path, size, and validation status after every write.

## Prevention of Workflow Stalls

The worker discipline rules exist specifically to prevent this pattern:

❌ **STALL (old behavior):**
```
Agent: "This analysis is comprehensive but would exceed the read-only limitation 
to write to the target file directly. Would you like me to provide guidance on 
how to save this to the file, or would you prefer to switch to Agent mode?"
Result: Orchestrator waits for user decision. Workflow pauses.
```

✅ **NO STALL (new behavior):**
```
Agent: [writes directly]
Agent: "✓ Artifact written: .engineering/artifacts/.../structural-analysis.md 
        Size: 42 KB | Format: Markdown ✓"
Result: Orchestrator proceeds to next pass automatically.
```

## See Also

- `.cursor/rules/prism-worker-discipline.mdc` — IDE-level guidance (deprecated in favor of workflow rules)
- `.cursor/rules/sub-agent-file-operations.mdc` — Generic orchestrator/worker discipline (applies beyond prism)
