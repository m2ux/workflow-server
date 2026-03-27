# Design Philosophy — WP-06: Loader Determinism and Deduplication

## Complexity Assessment

**Complexity:** Simple-to-moderate

The changes are mechanical: sorting arrays, extracting a shared function, removing dead code, and aligning regex patterns. No architectural decisions or new abstractions are required. The main risk is conflict with WP-05 changes (mitigated by rebasing first).

## Design Principles

### 1. Deterministic by default
All functions that enumerate filesystem entities must sort their results before returning or iterating. The sort key is the string identifier (workflow ID, filename), using lexicographic ordering. This guarantees identical behavior across platforms regardless of `readdir` implementation.

### 2. Single source of truth
Duplicated logic (e.g., `parseActivityFilename`) must exist in exactly one location and be imported by all consumers. This eliminates divergence risk when the parsing pattern changes.

### 3. Explicit priority over implicit
When multiple file formats can satisfy the same query (TOON and Markdown), the resolution order must be documented and enforced. TOON takes priority as the structured format; Markdown is the fallback.

### 4. No dead code
Unused constants, unreachable branches, and redundant I/O calls are removed. Code that exists but does nothing creates false confidence in coverage and obscures the actual control flow.

### 5. Consistent patterns
Regex patterns for filename parsing should use the same quantifier (`\d+` everywhere or `\d{2}` everywhere). Since resource indices can exceed two digits, `\d+` is the correct choice. The `padStart` width should accommodate the widest index encountered.

## Approach

Each finding maps to an isolated, independently testable change. Changes are applied in dependency order: shared utility extraction first (QC-021), then determinism fixes (QC-007, QC-008, QC-029, QC-030), then cleanup (QC-084 through QC-090).
