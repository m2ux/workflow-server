import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../scripts/check-bootstrap-self-contained.js';
import { corpusRoot } from './corpus-root.js';

/**
 * Bootstrap self-containment guard: the text `discover` returns before a session exists must send the
 * reader nowhere they cannot go. With no `session_index` there is no `get_resource` and no
 * `get_activity`, so a relative corpus link or a dotted rule address in that text is an instruction
 * with no way to follow it. Everywhere else, citing the home rather than restating it is the right
 * economy; on this one surface it strands the reader. Hard-zero: inline the substance and keep the
 * name only as a label for after the operations bundle arrives.
 *
 * A hard-zero assertion alone would pass just as well if the guard stopped detecting anything, so the
 * synthetic roots below prove it still fires — and that it still leaves alone the constructs the real
 * text legitimately carries.
 */

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

/**
 * A corpus root holding `body` as the pre-session resource, plus one technique declaring one rule, so
 * the pair lookup the dotted check depends on has something to find.
 */
function rootWith(body: string): string {
  const root = mkdtempSync(join(tmpdir(), 'bootstrap-guard-'));
  roots.push(root);
  mkdirSync(join(root, 'meta', 'resources'), { recursive: true });
  writeFileSync(join(root, 'meta', 'resources', 'bootstrap-protocol.md'), body);
  mkdirSync(join(root, 'meta', 'techniques', 'version-control'), { recursive: true });
  writeFileSync(
    join(root, 'meta', 'techniques', 'version-control', 'resolve-host-repo.md'),
    '## Rules\n\n### prose-sources-are-fallback-only\n\nGit is the source.\n',
  );
  return root;
}

const checks = (body: string): string[] => collectFindings(rootWith(body)).map((f) => f.check);

describe('bootstrap self-containment guard', () => {
  it('the pre-session bootstrap text sends the reader nowhere it cannot go', () => {
    // Reads the corpus this run measures, so a worktree checks its own tree and not the parent's.
    expect(collectFindings(corpusRoot()).map((f) => `[${f.check}] ${f.site} — ${f.detail}`)).toEqual([]);
  });

  it('flags a corpus link, which nothing can follow before a session', () => {
    expect(checks('# B\n\nApply [resolve-host-repo](../techniques/version-control/resolve-host-repo.md).\n'))
      .toEqual(['corpus-link']);
  });

  it('flags a rule address the corpus declares, since its file cannot be read yet', () => {
    expect(checks('# B\n\nProse is fallback only — `resolve-host-repo.prose-sources-are-fallback-only`.\n'))
      .toEqual(['dotted-rule']);
  });

  it('leaves alone the constructs the pre-session text legitimately carries', () => {
    // Filenames whose stem happens to match a technique name, a scheme the client resolves itself, an
    // operation named as a forward label, and a same-document anchor. Each of these appears in the real
    // text or in its near neighbours, and none is something the reader is asked to go and fetch.
    const body = [
      '# B',
      '',
      'Fetch [the schema](workflow-server://schemas/workflow) with your client.',
      'The server writes `session.json`, `.session-token` and `plan.json`; see `AGENTS.md`.',
      'Accept `git@host:owner/repo.git` and `https://host/owner/repo.git`, dropping `.git`.',
      '`version-control::resolve-host-repo` is where this lives once you have the bundle.',
      'See [step 3](#bootstrap-protocol) and [the site](https://example.com/docs/query.html).',
      'A rule this technique does not declare: `resolve-host-repo.not-a-real-rule`.',
      '',
    ].join('\n');
    expect(checks(body)).toEqual([]);
  });

  it('reports an unclosed fence rather than letting it hide the links below', () => {
    // A toggle would leave every later line looking fenced, taking the link check out of service on a
    // green verdict. Both the imbalance and the link it would have hidden are reported.
    const body = '# B\n\n```json\n{ "a": 1 }\n\nApply [x](../techniques/version-control/resolve-host-repo.md).\n';
    expect(checks(body).sort()).toEqual(['corpus-link', 'unbalanced-fence']);
  });

  it('treats a closed fence as illustration', () => {
    const body = '# B\n\n```\nApply [x](../techniques/version-control/resolve-host-repo.md).\n```\n';
    expect(checks(body)).toEqual([]);
  });
});
