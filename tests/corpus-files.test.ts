import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { corpusFiles, definitionsUnder } from '../guards/workflows-root.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { collectBrokenAnchors } from '../guards/check-resource-anchors.js';
import { collectFramingFindings } from '../guards/check-section-framing.js';
import { collectFindings as collectNestedOutputFindings } from '../guards/check-nested-output-home.js';
import { writeWorkflowFixture } from './corpus-fixture.js';

/**
 * A corpus guard reads the tree it is pointed at, the same way on every tree holding the same files.
 *
 * Directory order is whatever the filesystem returns, so each case here reads the tree once as the
 * filesystem lists it and once with every listing reversed: a walk that leans on that order reports
 * different findings, or the same findings differently, between the two. And a checkout nested in a
 * corpus checkout — `.worktrees/<branch>`, or a clone dropped beside the products — is another tree,
 * so a defect planted there is one the outer tree's guards never report.
 */
const listing = vi.hoisted(() => ({ reversed: false }));

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  const readdirSync = ((...args: Parameters<typeof actual.readdirSync>) => {
    const entries = actual.readdirSync(...args) as unknown[];
    return listing.reversed ? [...entries].reverse() : entries;
  }) as typeof actual.readdirSync;
  return { ...actual, readdirSync, default: { ...actual, readdirSync } };
});

/** Run a read with the filesystem's listing order, then with every listing reversed. */
function bothOrders<T>(read: () => T): [T, T] {
  listing.reversed = false;
  const forward = read();
  listing.reversed = true;
  try {
    return [forward, read()];
  } finally {
    listing.reversed = false;
  }
}

async function bothOrdersAsync<T>(read: () => Promise<T>): Promise<[T, T]> {
  listing.reversed = false;
  const forward = await read();
  listing.reversed = true;
  try {
    return [forward, await read()];
  } finally {
    listing.reversed = false;
  }
}

function write(path: string, text: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text, 'utf-8');
}

/** Long enough that the section-framing guard counts it as prose a section consumer never receives. */
const FRAMING = 'This resource opens with orientation prose that sits above every section heading. '.repeat(3);

/**
 * A corpus whose one workflow carries a defect for each guard measured here: a link to a heading the
 * resource lacks, a resource cited by anchor whose framing sits outside any section, and an output
 * component a group container and one of its techniques both declare. `clean` writes the same tree
 * with none of them.
 */
function writeCorpus(root: string, { clean }: { clean: boolean }): void {
  const alpha = writeWorkflowFixture(join(root, 'corpus'), 'alpha');
  write(join(alpha, 'techniques', 'TECHNIQUE.md'), clean
    ? '# Alpha\n\n## Outputs\n\n### report\n'
    : '# Alpha\n\n## Outputs\n\n### report\n\n#### summary\n');
  for (const op of ['b-op', 'a-op']) {
    write(join(alpha, 'techniques', `${op}.md`), clean
      ? `# ${op}\n\nSee [the guide](../resources/guide.md#real).\n`
      : `# ${op}\n\n## Outputs\n\n### summary\n\nSee [the guide](../resources/guide.md#absent-from-${op}).\n`);
  }
  write(join(alpha, 'resources', 'guide.md'), clean ? '# Guide\n\n## Real\n\nBody.\n' : `# Guide\n\n${FRAMING}\n\n## Real\n\nBody.\n`);
}

describe('corpus file walk', () => {
  let root: string;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'corpus-files-'));
    write(join(root, 'b.md'), '');
    write(join(root, 'a.md'), '');
    write(join(root, 'sub', 'd.yaml'), '');
    write(join(root, 'sub', 'c.md'), '');
    // Plumbing, installed packages, and two checkouts nested in this one.
    write(join(root, '.git', 'HEAD'), 'ref: refs/heads/workflows\n');
    write(join(root, '.github', 'workflows', 'ci.yml'), '');
    write(join(root, 'node_modules', 'pkg', 'README.md'), '');
    write(join(root, '.worktrees', 'feature', '.git'), 'gitdir: /elsewhere\n');
    write(join(root, '.worktrees', 'feature', 'nested.md'), '');
    write(join(root, 'clone', '.git', 'HEAD'), 'ref: refs/heads/main\n');
    write(join(root, 'clone', 'cloned.md'), '');
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('lists every file in name order, whatever order the directories are read in', () => {
    const [forward, reversed] = bothOrders(() => corpusFiles(root));
    expect(forward).toEqual(['a.md', 'b.md', 'sub/c.md', 'sub/d.yaml'].map((rel) => join(root, rel)));
    expect(reversed).toEqual(forward);
  });

  it('lists only the files a name test accepts', () => {
    expect(corpusFiles(root, (name) => name.endsWith('.md'))).toEqual(['a.md', 'b.md', 'sub/c.md'].map((rel) => join(root, rel)));
  });

  it('reads nothing from a nested checkout, a dot entry, or installed packages', () => {
    const files = corpusFiles(root).join('\n');
    for (const outside of ['.git', '.github', 'node_modules', '.worktrees', 'clone']) {
      expect(files).not.toContain(join(root, outside));
    }
  });

  it('lists definitions by the same walk', () => {
    expect(definitionsUnder(root)).toEqual([{ rel: 'sub/d.yaml', path: join(root, 'sub', 'd.yaml') }]);
  });

  it('lists nothing for a directory that is absent', () => {
    expect(corpusFiles(join(root, 'absent'))).toEqual([]);
  });
});

describe('corpus discovery reads only the tree it is pointed at', () => {
  let root: string;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'corpus-index-tree-'));
    writeWorkflowFixture(root, 'own');
    writeWorkflowFixture(join(root, 'clone'), 'cloned');
    write(join(root, 'clone', '.git', 'HEAD'), 'ref: refs/heads/main\n');
    writeWorkflowFixture(join(root, 'linked'), 'linked-wf');
    write(join(root, 'linked', '.git'), 'gitdir: /elsewhere\n');
    writeWorkflowFixture(join(root, 'node_modules'), 'installed');
    // Two directories claiming one name, so the order they are met in could reach the index.
    writeWorkflowFixture(join(root, 'left'), 'twin');
    writeWorkflowFixture(join(root, 'right'), 'twin');
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('discovers no workflow inside a nested checkout or installed packages', () => {
    const index = indexCorpus(root);
    expect([...index.workflows.keys()]).toEqual(['own']);
    expect([...index.namespaces.keys()]).toEqual(['left/twin', 'own', 'right/twin']);
  });

  it('builds the same index whatever order the directories are read in', () => {
    const [forward, reversed] = bothOrders(() => indexCorpus(root));
    expect([...reversed.namespaces.entries()]).toEqual([...forward.namespaces.entries()]);
    expect(reversed.ambiguous).toEqual(forward.ambiguous);
    expect(reversed.shadowed).toEqual(forward.shadowed);
  });
});

describe('corpus guards read only the tree they are pointed at', () => {
  let root: string;
  let nested: string;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'corpus-guards-tree-'));
    writeCorpus(root, { clean: true });
    // The same products on a feature branch, checked out inside this checkout, and a clone beside them.
    nested = join(root, '.worktrees', 'workflow', 'feature');
    writeCorpus(nested, { clean: false });
    write(join(nested, '.git'), 'gitdir: /elsewhere\n');
    const clone = join(root, 'clone');
    writeCorpus(clone, { clean: false });
    write(join(clone, '.git', 'HEAD'), 'ref: refs/heads/main\n');
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const guards: Array<[string, (at: string) => Promise<unknown[]>]> = [
    ['resource-anchors', async (at) => collectBrokenAnchors(at)],
    ['section-framing', async (at) => collectFramingFindings(at)],
    ['nested-output-home', (at) => collectNestedOutputFindings(at)],
  ];

  for (const [id, collect] of guards) {
    it(`${id}: reports the defects of the nested tree when pointed at it`, async () => {
      expect((await collect(nested)).length).toBeGreaterThan(0);
    });

    it(`${id}: reports none of them when pointed at the tree holding it`, async () => {
      expect(await collect(root)).toEqual([]);
    });

    it(`${id}: reports the same findings whatever order the directories are read in`, async () => {
      const [forward, reversed] = await bothOrdersAsync(() => collect(nested));
      expect(reversed).toEqual(forward);
    });
  }
});
