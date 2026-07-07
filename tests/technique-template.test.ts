import { describe, it, expect } from 'vitest';
import { collectTemplateViolations, lintTechniqueFile } from '../scripts/check-technique-template.js';

/**
 * Technique-template guard (B9, issue #166): every technique file follows the normative
 * template — `metadata.version`-only frontmatter, no H1, the canonical H2 set in order
 * (Outputs before Protocol), snake_case entry ids (camelCase tool mirrors allowed),
 * kebab-case rule names, snake_case `{$name}` sigils. Hard-zero over the corpus.
 */

const CONFORMANT = `---
metadata:
  version: 1.0.0
---

## Capability

Does one thing.

## Inputs

### target_path

Where to act.

### cloudId

Tool-parameter mirror.

## Outputs

### lint_diagnostics

What was found.

## Protocol

1. Read \`{target_path}\` and capture \`{$scan_result}\`.
2. Report \`{scan_result}\`.

## Rules

### commit.signed

Every commit is signed.
`;

describe('technique-template guard', () => {
  it('accepts the normative template', () => {
    expect(lintTechniqueFile(CONFORMANT, 'x.md')).toEqual([]);
  });

  it('flags legacy frontmatter keys', () => {
    const raw = CONFORMANT.replace('metadata:\n', 'metadata:\n  ontology: workflow-canonical\n  kind: technique\n');
    expect(lintTechniqueFile(raw, 'x.md').map((v) => v.detail)).toEqual(['ontology', 'kind']);
  });

  it('flags a missing metadata.version', () => {
    const raw = CONFORMANT.replace('  version: 1.0.0\n', '');
    expect(lintTechniqueFile(raw, 'x.md').map((v) => v.rule)).toEqual(['version-missing']);
  });

  it('flags an H1 title', () => {
    const raw = CONFORMANT.replace('## Capability', '# Version Control\n\n## Capability');
    expect(lintTechniqueFile(raw, 'x.md').map((v) => v.rule)).toEqual(['h1-title']);
  });

  it('flags Outputs after Protocol as section-order', () => {
    const outputs = '## Outputs\n\n### lint_diagnostics\n\nWhat was found.\n\n';
    const raw = CONFORMANT.replace(outputs, '').replace('## Rules', `${outputs}## Rules`);
    expect(lintTechniqueFile(raw, 'x.md').map((v) => v.rule)).toEqual(['section-order']);
  });

  it('flags an unknown H2 section', () => {
    const raw = CONFORMANT.replace('## Rules', '## Notes\n\nStray.\n\n## Rules');
    expect(lintTechniqueFile(raw, 'x.md').map((v) => v.rule)).toEqual(['unknown-section']);
  });

  it('flags a duplicate H2 section', () => {
    const raw = `${CONFORMANT}\n## Capability\n\nAgain.\n`;
    expect(lintTechniqueFile(raw, 'x.md').map((v) => v.rule)).toEqual(['duplicate-section', 'section-order']);
  });

  it('flags non-snake, non-camel entry ids and non-kebab rule names', () => {
    const raw = CONFORMANT.replace('### target_path', '### Target Path').replace(
      '### commit.signed',
      '### Commit_Signed',
    );
    expect(lintTechniqueFile(raw, 'x.md').map((v) => v.rule)).toEqual(['entry-id-casing', 'rule-name-casing']);
  });

  it('flags a non-snake sigil but ignores fenced examples', () => {
    const raw = `${CONFORMANT}\n\`\`\`\n### Issue {number}: {title}\n{$Not-Snake}\n\`\`\`\n`;
    expect(lintTechniqueFile(raw, 'x.md')).toEqual([]);
    const bad = CONFORMANT.replace('{$scan_result}', '{$scan-result}');
    expect(lintTechniqueFile(bad, 'x.md').map((v) => v.rule)).toEqual(['sigil-casing']);
  });

  it('every technique file in the corpus follows the template', () => {
    expect(collectTemplateViolations().map((v) => `[${v.rule}] ${v.file}: ${v.detail}`)).toEqual([]);
  });
});
