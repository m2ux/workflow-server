# Scan Injection Patterns

> Part of [techniques](../README.md)

Apply all seven CI/CD injection detection patterns (P1-P7) — derived from the hackerbot-claw campaign and GitHub's script injection documentation, each identifying a specific source-to-sink….

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`assemble-results`](assemble-results.md) | Collect every flagged item, observation, and per-file/per-pattern scan confirmation into the structured scanner output artifact for this submodule, and write it to the planning folder |
| [`load-patterns`](load-patterns.md) | Load the injection pattern catalog and detection heuristics, and scope the scan to the assigned workflow files with their pre-classified inventory data |
| [`scan-p1`](scan-p1.md) | Apply P1 expression injection detection: search `run:` blocks for `${{ }}` expressions, cross-reference against the untrusted context variable list, and document each unsafe source-to-sink… |
| [`scan-p2`](scan-p2.md) | Apply P2 Pwn Request detection: identify `pull_request_target` workflows that checkout PR head and execute code after checkout |
| [`scan-p3`](scan-p3.md) | Apply P3 comment trigger abuse detection: flag `issue_comment` and `pull_request_review_comment` workflows that execute privileged operations without author-association filtering |
| [`scan-p4`](scan-p4.md) | Apply P4 excessive permissions detection: flag workflows with `contents: write`, `pull-requests: write`, or no permissions block, and check whether the write scope is justified |
| [`scan-p5`](scan-p5.md) | Apply P5 fork code execution detection: identify checkout of fork/PR code, check for subsequent execution commands, and trace whether secrets are accessible in the execution context |
| [`scan-p6`](scan-p6.md) | Apply P6 AI config poisoning detection: check whether AI config files exist, are CODEOWNERS-protected, and are loaded by any workflow as trusted context |
| [`scan-p7`](scan-p7.md) | Apply P7 dangerous execution pattern detection: search `run:` blocks and referenced scripts for `curl|bash`, `wget|sh`, `eval`, `base64` decode-and-execute, and dynamic script generation |
