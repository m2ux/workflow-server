/**
 * Product-docs drift guards: stale identity fields, inventory tallies in prose,
 * and agent model vocabulary. Prefer catalogs over hardcoded counts.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

const PRODUCT_GLOBS = [
  'README.md',
  'setup.md',
  'http.md',
  'stdio.md',
  'AGENTS.md',
  'CLAUDE.md',
  'docs',
  'site',
  'examples/cursor-workspace',
  '.claude/rules',
  '.cursor/rules',
  'scripts/generate-site-data.ts',
];

const TEXT_EXT = new Set(['.md', '.html', '.mdc', '.ts', '.css', '.js']);

function walk(rel: string, out: string[]): void {
  const abs = join(ROOT, rel);
  let st;
  try {
    st = statSync(abs);
  } catch {
    return;
  }
  if (st.isFile()) {
    out.push(rel);
    return;
  }
  if (!st.isDirectory()) return;
  for (const name of readdirSync(abs)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    walk(join(rel, name).replace(/\\/g, '/'), out);
  }
}

function productFiles(): string[] {
  const files: string[] = [];
  for (const g of PRODUCT_GLOBS) walk(g, files);
  return files.filter((f) => {
    const ext = f.includes('.') ? f.slice(f.lastIndexOf('.')) : '';
    return TEXT_EXT.has(ext) || f.endsWith('workflow-server.md');
  });
}

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('product documentation drift', () => {
  const files = productFiles();

  it('does not document session_token as the agent session identity', () => {
    const hits: string[] = [];
    for (const f of files) {
      // Tests and migration code may mention the rejected parameter by name.
      if (f.startsWith('tests/') || f.includes('migration')) continue;
      const body = read(f);
      if (/\bsession_token\b/.test(body)) hits.push(f);
    }
    expect(hits, `use session_index only:\n${hits.join('\n')}`).toEqual([]);
  });

  it('does not use Skill in the Goal→…→Tools agent model line', () => {
    const hits: string[] = [];
    for (const f of files) {
      const body = read(f);
      if (/Goal\s*→[^.\n]*Skill/.test(body) || /Activity\s*→\s*Skill\s*→\s*Tools/.test(body)) {
        hits.push(f);
      }
    }
    expect(hits, `use Technique, not Skill:\n${hits.join('\n')}`).toEqual([]);
  });

  it('avoids brittle MCP tool inventory tallies in user-facing prose', () => {
    // Matches "17 MCP tools", "sixteen tools", "registers 16 tools", etc.
    const tally =
      /\b(?:registers?\s+)?(?:\d+|twelve|thirteen|fourteen|fifteen|sixteen|seventeen)\s+MCP\s+tools?\b/i;
    const wordTally =
      /\b(?:twelve|thirteen|fourteen|fifteen|sixteen|seventeen)\s+(?:MCP\s+)?tools?\b/i;
    const hits: string[] = [];
    for (const f of files) {
      if (f.startsWith('tests/')) continue;
      const body = read(f);
      if (tally.test(body) || wordTally.test(body)) hits.push(relative(ROOT, join(ROOT, f)));
    }
    expect(
      hits,
      `remove tool counts; link to the tool catalog instead:\n${hits.join('\n')}`,
    ).toEqual([]);
  });

  it('does not claim missing site/internals or design/rationale.html paths', () => {
    const hits: string[] = [];
    for (const f of files) {
      const body = read(f);
      if (body.includes('site/internals') || body.includes('design/rationale.html')) {
        hits.push(f);
      }
    }
    expect(hits, `retarget ghost paths:\n${hits.join('\n')}`).toEqual([]);
  });
});
