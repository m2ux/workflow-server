import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../scripts/check-harness-adapter-set.js';
import { corpusRoot } from './corpus-root.js';

/**
 * The harness adapters are reached through the VALUE of a variable — a harness kind becomes a file and an
 * operation kind becomes a Rules section inside it — so no binding check sees them, and the obligation
 * that each adapter exposes the same slices lives in prose. Measured before the guard existed: a partial
 * adapter, a renamed slice, a map row with no file, and a deleted slice all passed the whole suite.
 *
 * The corpus is consistent today, so the real-corpus assertion cannot demonstrate detection. The
 * synthetic sets below carry each divergence.
 */

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

const ADAPTER = (slices: string[]): string =>
  ['# Adapter', '', '## Capability', '', 'Harness-specific semantics.', '', '## Rules', '']
    .concat(slices.flatMap((s) => [`### ${s}`, '', 'Do the thing.', '']))
    .join('\n');

const MAP = (rows: string[], slices: string[]): string => [
  '# Resolve harness operation', '', '## Protocol', '', '### 1. Map harness kind', '',
  '- Map `{harness_kind}` to `{harness_technique}` (authoritative table — edit only here):',
  ...rows,
  '', '### 2. Select rule slice', '',
  '- Set `{harness_operation}` from `{operation_kind}` (' + slices.map((s) => `\`${s}\``).join(' | ')
    + ') — each harness technique exposes those Rules sections.', '',
].join('\n');

/**
 * A corpus root holding a harness group. `adapters` maps a kind to the slices its file declares; a kind
 * mapped to `null` is a row whose file is absent.
 */
function rootWith(
  adapters: Record<string, string[] | null>,
  opts?: { slices?: string[]; orphan?: string; unrowed?: string },
): string {
  const root = mkdtempSync(join(tmpdir(), 'harness-set-'));
  roots.push(root);
  const dir = join(root, 'meta', 'techniques', 'harness-compat');
  mkdirSync(dir, { recursive: true });

  const slices = opts?.slices ?? ['spawn', 'resume', 'concurrent'];
  const rows = Object.keys(adapters).map((kind) => `  - \`${kind}\` → [${kind}](./${kind}.md)`);
  writeFileSync(join(dir, 'resolve-harness-operation.md'), MAP(rows, slices));
  for (const [kind, declared] of Object.entries(adapters)) {
    if (declared) writeFileSync(join(dir, `${kind}.md`), ADAPTER(declared));
  }
  // An adapter file no row resolves to.
  if (opts?.orphan) writeFileSync(join(dir, `${opts.orphan}.md`), ADAPTER(slices));
  return root;
}

const checks = (...args: Parameters<typeof rootWith>): string[] =>
  collectFindings(rootWith(...args)).map((f) => f.check);

/** The four kinds the real core-ops list registers, so a synthetic set can be delivered. */
const REGISTERED = { 'claude-code': null, cursor: null, cline: null, generic: null };
const ALL = ['spawn', 'resume', 'concurrent'];

describe('harness adapter set', () => {
  it('every harness kind in the corpus resolves to an adapter with exactly the callable slices', () => {
    expect(collectFindings(corpusRoot()).map((f) => `[${f.check}] ${f.site} — ${f.detail}`)).toEqual([]);
  });

  it('refuses an adapter missing a slice a caller can ask for', () => {
    // Resolving that operation kind would name a section the file does not have.
    expect(checks({ ...REGISTERED, 'claude-code': ['spawn'], cursor: ALL, cline: ALL, generic: ALL }))
      .toEqual(['slice-missing', 'slice-missing']);
  });

  it('refuses a slice no caller can reach', () => {
    // The inverse: a rule the vocabulary does not name is unreachable through the resolution.
    expect(checks({ ...REGISTERED, 'claude-code': [...ALL, 'spawn-agent'], cursor: ALL, cline: ALL, generic: ALL }))
      .toEqual(['slice-unreachable']);
  });

  it('refuses a row whose file does not exist', () => {
    expect(checks({ ...REGISTERED, 'claude-code': null, cursor: ALL, cline: ALL, generic: ALL }))
      .toEqual(['adapter-missing']);
  });

  it('refuses an adapter no orchestrator is given', () => {
    // A technique named inside another technique's protocol has no other delivery path, so a kind that
    // resolves to a file nothing registers leaves the caller with nothing to apply.
    const found = checks({ 'claude-code': ALL, cursor: ALL, cline: ALL, generic: ALL, codex: ALL });
    expect(found).toEqual(['adapter-undelivered']);
  });

  it('refuses an adapter file nothing resolves to', () => {
    expect(checks({ 'claude-code': ALL, cursor: ALL, cline: ALL, generic: ALL }, { orphan: 'stray' }))
      .toEqual(['adapter-unmapped']);
  });

  it('refuses to call an unparseable map clean', () => {
    // The map is prose. A reformat that defeats the parse must read as unmeasured, never as a pass —
    // the alternative is a guard that reports OK having inspected nothing.
    expect(() => collectFindings(rootWith({}, { slices: ALL }))).toThrow();
    expect(() => collectFindings(rootWith({ 'claude-code': ALL }, { slices: [] }))).toThrow();
  });

  it('accepts the set when all three enumerations agree', () => {
    expect(checks({ 'claude-code': ALL, cursor: ALL, cline: ALL, generic: ALL })).toEqual([]);
  });
});
