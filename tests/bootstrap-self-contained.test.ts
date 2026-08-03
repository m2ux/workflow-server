import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../scripts/check-bootstrap-self-contained.js';
import { corpusRoot } from './corpus-root.js';

/**
 * Bootstrap self-containment guard: the text `discover` returns before a session exists must send the
 * reader nowhere they cannot go. With no `session_index` there is no `get_resource` and no
 * `get_activity`, so a corpus link or a rule address in that text is an instruction with no way to
 * follow it. Everywhere else, citing the home rather than restating it is the right economy; on this one
 * surface it strands the reader. Hard-zero: inline the substance and keep the name only as a label for
 * after the operations bundle arrives.
 *
 * A hard-zero assertion alone would pass just as well if the guard stopped detecting anything, so the
 * synthetic roots below prove each check still fires — in every spelling the corpus sanctions — and that
 * it still leaves alone the constructs the real text legitimately carries.
 */

const roots: string[] = [];
afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

/**
 * A corpus root holding `body` as the pre-session resource, over a technique tree shaped like the real
 * one: an operation inside a group, a group's own `TECHNIQUE.md`, a flat technique, and the workflow's
 * own `TECHNIQUE.md`. Each is keyed differently, and a fixture with only one of them leaves the other
 * three branches of the lookup unproven.
 *
 * The flat technique is named `plan` on purpose: the guard's pair lookup exists because technique names
 * collide with ordinary filenames, and a fixture with no such collision cannot show that `plan.json`
 * stays silent for the stated reason rather than by accident.
 */
function rootWith(body: string): string {
  const root = mkdtempSync(join(tmpdir(), 'bootstrap-guard-'));
  roots.push(root);
  const write = (relative: string, text: string): void => {
    const path = join(root, ...relative.split('/'));
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, text);
  };

  write('meta/resources/bootstrap-protocol.md', body);
  // An operation inside a group, keyed on its own filename. Its Inputs and Protocol headings must NOT
  // become rule names — without the `## Rules` gating every I/O id and step name in the corpus would.
  write(
    'meta/techniques/version-control/resolve-host-repo.md',
    '## Inputs\n\n### repo-url\n\n## Protocol\n\n### derive-the-remote\n\n'
      + '## Rules\n\n### prose-sources-are-fallback-only\n\nGit is the source.\n',
  );
  // A group's own TECHNIQUE.md, keyed on the group directory.
  write('meta/techniques/harness-compat/TECHNIQUE.md', '## Rules\n\n### foreground-always\n\nBlock.\n');
  // A flat technique, keyed on its filename.
  write('meta/techniques/plan.md', '## Rules\n\n### only-one-plan\n\nOne plan.\n');
  // The workflow's own TECHNIQUE.md, keyed on the workflow — not on the literal string `TECHNIQUE`.
  write('meta/techniques/TECHNIQUE.md', '## Rules\n\n### await-every-worker\n\nWait.\n');
  return root;
}

const checks = (body: string): string[] => collectFindings(rootWith(body)).map((f) => f.check);
const prose = (text: string): string => `# Bootstrap\n\n${text}\n`;

describe('bootstrap self-containment guard', () => {
  it('the pre-session bootstrap text sends the reader nowhere it cannot go', () => {
    // Reads the corpus this run measures, so a worktree checks its own tree and not the parent's.
    expect(collectFindings(corpusRoot()).map((f) => `[${f.check}] ${f.site} — ${f.detail}`)).toEqual([]);
  });

  it('refuses a link into the corpus in every spelling markdown allows', () => {
    const target = '../techniques/version-control/resolve-host-repo.md';
    // A plain destination, a destination wearing the title CommonMark permits after it, an angle-bracket
    // destination, and a reference definition — which carries the destination away from its use site.
    expect(checks(prose(`Apply [rhr](${target}).`))).toEqual(['corpus-link']);
    expect(checks(prose(`Apply [rhr](${target} "its home").`))).toEqual(['corpus-link']);
    expect(checks(prose(`Apply [rhr](<${target}>).`))).toEqual(['corpus-link']);
    expect(checks(prose(`Apply [rhr][home].\n\n[home]: ${target}`))).toEqual(['corpus-link']);
  });

  it('refuses a rule address however far its ancestry is spelled out', () => {
    // Each of the four ways the corpus keys a rule, and the full ancestry form as well — a single
    // leftmost match would consume `meta.version-control` and never test the pair that matters.
    expect(checks(prose('Apply `resolve-host-repo.prose-sources-are-fallback-only`.'))).toEqual(['dotted-rule']);
    expect(checks(prose('Apply `meta.resolve-host-repo.prose-sources-are-fallback-only`.'))).toEqual(['dotted-rule']);
    expect(checks(prose('Apply `harness-compat.foreground-always`.'))).toEqual(['dotted-rule']);
    expect(checks(prose('Apply `plan.only-one-plan`.'))).toEqual(['dotted-rule']);
    expect(checks(prose('Apply `meta.await-every-worker`.'))).toEqual(['dotted-rule']);
  });

  it('refuses the shortened bare rule name, which strands the reader the same way', () => {
    // `dotted-rule-address` sanctions this spelling for an inherited rule, so a guard that knows only
    // the dotted form is bypassed by writing the address the way the house style prefers.
    expect(checks(prose('Apply `prose-sources-are-fallback-only`.'))).toEqual(['bare-rule']);
    expect(checks(prose('Apply `await-every-worker`.'))).toEqual(['bare-rule']);
  });

  it('leaves alone the constructs the pre-session text legitimately carries', () => {
    // A filename whose stem is a technique name — inert because the lookup is on the pair, and `plan` is
    // a declared technique here, so this is the collision the pair lookup exists for. Then: schemes the
    // client resolves with and without an authority, an empty destination, an operation named as a
    // forward label, a same-document anchor, an I/O id that is not a rule, and a rule name this
    // technique does not declare.
    const body = [
      'Fetch [the schema](workflow-server://schemas/workflow) with your client.',
      'The server writes `plan.json`, `session.json` and `context.yaml`; see `AGENTS.md`.',
      'Accept `git@host:owner/repo.git` and `https://host/owner/repo.git`, dropping `.git`.',
      'Ask us at [support](mailto:x@y.example) or [call](tel:+15550100), or nowhere at [x]().',
      '`version-control::resolve-host-repo` is where this lives once you have the bundle.',
      'See [step 3](#bootstrap-protocol) and [the site](https://example.com/docs/query.html).',
      'Bind `repo-url` before you start, and note `not-a-real-rule` is not one.',
      'A rule this technique does not declare: `resolve-host-repo.not-a-real-rule`.',
    ].join('\n');
    expect(checks(prose(body))).toEqual([]);
  });

  it('reports an unclosed fence rather than letting it hide the links below', () => {
    // Parity tracking would leave every later line looking fenced, taking the link check out of service
    // on a green verdict. Both the imbalance and the link it would have hidden are reported.
    const body = '# B\n\n```json\n{ "a": 1 }\n\nApply [x](../techniques/version-control/resolve-host-repo.md).\n';
    expect(checks(body).sort()).toEqual(['corpus-link', 'unbalanced-fence']);
  });

  it('treats a fenced link as illustration, including a fence nested in a wider one', () => {
    const target = '../techniques/version-control/resolve-host-repo.md';
    expect(checks(`# B\n\n\`\`\`\nApply [x](${target}).\n\`\`\`\n`)).toEqual([]);
    // A close has to match its opener's length, so the inner 3-backtick example does not end the
    // 4-backtick wrapper. Counting markers instead inverts the phase and reports the illustration.
    expect(checks(`# B\n\n\`\`\`\`markdown\n\`\`\`json\n[x](${target})\n\`\`\`\n\`\`\`\`\n`)).toEqual([]);
    // A `~~~` block quoting a backtick fence: three markers, and none of them closes the other's kind.
    expect(checks(`# B\n\n~~~\n\`\`\`\n[x](${target})\n~~~\n`)).toEqual([]);
  });

  it('reads a link destination as a path, and a quoted link as illustration', () => {
    // A rule address inside a destination is a path segment, so it reports as the link it is and not
    // twice; and a link inside a code span is being shown, not offered.
    expect(checks(prose('See [rhr](../t/resolve-host-repo.prose-sources-are-fallback-only).')))
      .toEqual(['corpus-link']);
    expect(checks(prose('Write it as `[rhr](../techniques/version-control/resolve-host-repo.md)`.')))
      .toEqual([]);
    // Both faults on one line still report separately.
    expect(checks(prose('See [rhr](../techniques/version-control/resolve-host-repo.md) '
      + 'and apply `resolve-host-repo.prose-sources-are-fallback-only`.')))
      .toEqual(['corpus-link', 'dotted-rule']);
  });

  it('refuses to call an emptied or absent resource clean', () => {
    // Nothing scanned and nothing wrong look identical in a hard-zero guard, so an empty file has to be
    // an error rather than a pass.
    expect(() => collectFindings(rootWith(''))).toThrow();
    expect(() => collectFindings(rootWith('\n   \n\n'))).toThrow();
    expect(() => collectFindings(mkdtempSync(join(tmpdir(), 'bootstrap-guard-empty-')))).toThrow();
  });
});
