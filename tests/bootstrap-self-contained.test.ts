import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings, MIN_PROSE_LINES } from '../scripts/check-bootstrap-self-contained.js';

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
function rootWith(body: string, pad = true): string {
  const root = mkdtempSync(join(tmpdir(), 'bootstrap-guard-'));
  roots.push(root);
  const write = (relative: string, text: string): void => {
    const path = join(root, ...relative.split('/'));
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, text);
  };

  // The guard refuses a document too short to be the procedure, so a fixture carries procedure-length
  // filler. Neutral by construction: no destination, no dotted pair, no hyphenated rule name.
  const short = MIN_PROSE_LINES - body.split('\n').filter((line) => line.trim() !== '').length;
  const filler = Array.from({ length: Math.max(0, short) }, (_, i) => `Step ${i + 1} of the procedure.`);
  write('meta/resources/bootstrap-protocol.md', pad ? [body, ...filler].join('\n') : body);
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
  // A single-word rule name, which the corpus also has four of. Addressable dotted, not bare.
  write('meta/techniques/harness.md', '## Rules\n\n### spawn\n\nSpawn in the foreground.\n');
  // The workflow's own TECHNIQUE.md, keyed on the workflow — not on the literal string `TECHNIQUE`.
  write('meta/techniques/TECHNIQUE.md', '## Rules\n\n### await-every-worker\n\nWait.\n');
  return root;
}

const checks = (body: string): string[] => collectFindings(rootWith(body)).map((f) => f.check);
const prose = (text: string): string => `# Bootstrap\n\n${text}\n`;

describe('bootstrap self-containment guard', () => {
  it('refuses a link into the corpus in every spelling markdown allows', () => {
    const target = '../techniques/version-control/resolve-host-repo.md';
    // A plain destination, a destination wearing the title CommonMark permits after it, an angle-bracket
    // destination, and a reference definition — which carries the destination away from its use site.
    expect(checks(prose(`Apply [rhr](${target}).`))).toEqual(['corpus-link']);
    expect(checks(prose(`Apply [rhr](${target} "its home").`))).toEqual(['corpus-link']);
    expect(checks(prose(`Apply [rhr](<${target}>).`))).toEqual(['corpus-link']);
    expect(checks(prose(`Apply [rhr][home].\n\n[home]: ${target}`))).toEqual(['corpus-link']);
    // Markdown permits raw HTML, so reading only `](…)` is bypassed by writing the anchor out.
    expect(checks(prose(`Apply <a href="${target}">rhr</a>.`))).toEqual(['corpus-link']);
    expect(checks(prose(`See <img src='${target}' alt="d">.`))).toEqual(['corpus-link']);
    // An HTML destination is a path too, so a rule address inside one reports as the link it is.
    expect(checks(prose('See <a href="../t/resolve-host-repo.prose-sources-are-fallback-only">x</a>.')))
      .toEqual(['corpus-link']);
  });

  it('reads an HTML destination however the attribute is written', () => {
    const target = '../techniques/version-control/resolve-host-repo.md';
    // Unquoted values are legal and every renderer follows them, so demanding quotes is a way through.
    expect(checks(prose(`Apply <a href=${target}>rhr</a>.`))).toEqual(['corpus-link']);
    // An attribute ahead of the destination, uppercase, a tab separator, spaces around the equals.
    expect(checks(prose(`Apply <a class="x" href="${target}">rhr</a>.`))).toEqual(['corpus-link']);
    expect(checks(prose(`See <img alt="a" src="${target}" width="2">.`))).toEqual(['corpus-link']);
    expect(checks(prose(`Apply <A HREF="${target}">rhr</A>.`))).toEqual(['corpus-link']);
    expect(checks(prose(`Apply <a\thref="${target}">rhr</a>.`))).toEqual(['corpus-link']);
    expect(checks(prose(`Apply <a href = "${target}">rhr</a>.`))).toEqual(['corpus-link']);
    // A tag may straddle lines, so the destination is read wherever it sits rather than beside its tag.
    expect(checks(prose(`Apply <a\nhref="${target}">rhr</a>.`))).toEqual(['corpus-link']);
    // A destination hidden behind one quoted inside another attribute still reports — and reports the
    // real one. Taking the first `href` before the closing angle reads the decoy and stops.
    expect(checks(prose(`See <img alt="href='#top'" src="${target}">.`))).toEqual(['corpus-link']);
    // And an attribute whose name merely ends in the one we want is not a destination.
    expect(checks(prose(`See <span data-href="${target}">x</span>.`))).toEqual([]);
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

  it('closes a fence at any indent, so a block cannot run past its real end', () => {
    const target = '../techniques/version-control/resolve-host-repo.md';
    // The closer sits three spaces inside the list item's content column, which CommonMark accepts. An
    // opener-only match cannot see it, pairs this opener with the NEXT block's opener, and swallows the
    // prose between them — with the marker count still even, so nothing reports. The link below the
    // first block is rendered prose and must be found.
    const body = [
      '# B', '',
      '1. Step:', '',
      '   ```json',
      '   { "a": 1 }',
      '      ```', '',
      `   Apply [first](${target}).`, '',
      '   ```',
      '   more', '',
      '      ```', '',
      `   Apply [second](${target}).`, '',
    ].join('\n');
    expect(checks(body)).toEqual(['corpus-link', 'corpus-link']);
    // An opener still has to sit within three spaces of the margin, so a stray marker deep in a list
    // cannot open a block and silence everything under it.
    expect(checks(`# B\n\n1. Step:\n\n    \`\`\`\n    Apply [x](${target}).\n    \`\`\`\n`))
      .toEqual(['corpus-link']);
    // A closer may run LONGER than its opener, which CommonMark allows. Demanding equal length leaves
    // this block open to the end of the file.
    expect(checks('# B\n\n```\nApply [x](' + target + ').\n````\n')).toEqual([]);
    // A marker carrying an info string opens a block and never closes one, so this inner line is
    // content. Accepting it as a close ends the block early and reports the illustration below it.
    expect(checks('# B\n\n```\n```js\nApply [x](' + target + ').\n```\n')).toEqual([]);
  });

  it('reads every line once a fence is left open, including lines an earlier block closed', () => {
    // The fail-safe is to discard the fenced set entirely, not merely to stop adding to it. Keeping the
    // spans an earlier block closed leaves that block's contents suppressed while the file's fence state
    // is already known to be unreliable — so a link shown there stays hidden on a reported failure.
    const target = '../techniques/version-control/resolve-host-repo.md';
    const body = '# B\n\n```\nApply [inside](' + target + ').\n```\n\n```json\nApply [after]('
      + target + ').\n';
    expect(checks(body).sort()).toEqual(['corpus-link', 'corpus-link', 'unbalanced-fence']);
  });

  it('reads a CRLF file the same as an LF one', () => {
    // A carriage return left on each line stops any line looking like a fence, which would take the
    // fence matcher — and with it the unclosed-fence fail-safe — out of service on a CRLF checkout.
    const target = '../techniques/version-control/resolve-host-repo.md';
    const fenced = `# Bootstrap\n\n\`\`\`\nApply [x](${target}).\n\`\`\`\n`;
    expect(checks(fenced)).toEqual([]);
    expect(checks(fenced.replace(/\n/g, '\r\n'))).toEqual([]);
  });

  it('names a rule by bare name only where the name is hyphenated', () => {
    // Four declared rules are single words that this text also uses in their ordinary sense — it already
    // backticks `persistent` and `fresh` as topology values. Those stay addressable dotted.
    expect(checks(prose('Apply `prose-sources-are-fallback-only`.'))).toEqual(['bare-rule']);
    // `spawn` is a declared rule in this fixture, and still not an address when written bare.
    expect(checks(prose('Every worker you `spawn` must be awaited.'))).toEqual([]);
    expect(checks(prose('Apply `harness.spawn`.'))).toEqual(['dotted-rule']);
  });

  it('refuses to call an emptied or absent resource clean', () => {
    // Nothing scanned and nothing wrong look identical in a hard-zero guard, so an empty file has to be
    // an error rather than a pass.
    expect(() => collectFindings(rootWith('', false))).toThrow();
    expect(() => collectFindings(rootWith('\n   \n\n', false))).toThrow();
    expect(() => collectFindings(mkdtempSync(join(tmpdir(), 'bootstrap-guard-empty-')))).toThrow();
    // And a file gutted to a stub, which is the shape a bad merge leaves. Presence alone would pass it,
    // and a hard-zero guard would then report OK on a document that instructs nobody.
    expect(() => collectFindings(rootWith('# Bootstrap\n', false))).toThrow();
    const short = Array.from({ length: MIN_PROSE_LINES - 1 }, (_, i) => `Line ${i + 1}.`).join('\n');
    expect(() => collectFindings(rootWith(short, false))).toThrow();
    // One more line and it is a procedure.
    expect(collectFindings(rootWith(`${short}\nLine ${MIN_PROSE_LINES}.`, false))).toEqual([]);
  });
});
