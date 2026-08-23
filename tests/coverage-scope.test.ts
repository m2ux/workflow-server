import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { classifyChange, coverageScope } from '../scripts/coverage-scope.js';

/**
 * Which workflows a coverage walk has to cover for a given corpus change.
 *
 * The walk costs about thirteen minutes over fourteen workflows and most corpus changes touch one,
 * so the scope is the lever. It is also the part that can be wrong quietly: too wide only wastes
 * time, while too narrow fails a run for a gap that is not there — an option reachable only through
 * a workflow the run did not walk reads as newly unreached.
 *
 * A fixture corpus rather than the real one: this is the resolver's logic under test, and a rule
 * about borrowing is clearer stated in two small workflows than located in eighteen.
 */
describe('coverage scope', () => {
  describe('classifying a corpus diff', () => {
    it('takes a workflow file as its own workflow', () => {
      const c = classifyChange(['prism/workflow.yaml']);
      expect([...c.workflows]).toEqual(['prism']);
      expect([...c.activityFiles]).toEqual([]);
    });

    it('takes an activity file for resolution against the graphs', () => {
      const c = classifyChange(['prism/activities/01-structural-pass.yaml']);
      expect([...c.workflows]).toEqual([]);
      expect([...c.activityFiles]).toEqual(['prism/activities/01-structural-pass.yaml']);
    });

    it('ignores what cannot move option coverage', () => {
      const c = classifyChange([
        'prism/techniques/structural-analysis.md',
        'prism/resources/fidelity.md',
        'prism/README.md',
        'LICENSE',
      ]);
      expect([...c.workflows]).toEqual([]);
      expect([...c.activityFiles]).toEqual([]);
    });
  });

  describe('resolving the scope', () => {
    /**
     * Two workflows, each with its own copy of an activity under one id, plus one workflow that
     * shares nothing. Option keys carry the activity id and not the workflow, so the shared id's
     * options are one key that either walk can cover.
     */
    function corpus(): string {
      const root = mkdtempSync(join(tmpdir(), 'wf-scope-'));
      for (const [wf, activities] of [
        ['alpha', ['01-shared-stage.yaml', '02-alpha-only.yaml']],
        ['beta', ['01-shared-stage.yaml']],
        ['gamma', ['01-gamma-only.yaml']],
      ] as const) {
        mkdirSync(join(root, wf, 'activities'), { recursive: true });
        writeFileSync(join(root, wf, 'workflow.yaml'),
          `id: ${wf}\nversion: 1.0.0\ntitle: ${wf}\ninitialActivity: ${activities[0]!.replace(/^\d+-|\.yaml$/g, '')}\n`);
        for (const file of activities) {
          const id = file.replace(/^\d+-|\.yaml$/g, '');
          writeFileSync(join(root, wf, 'activities', file),
            `id: ${id}\nversion: 1.0.0\nname: ${id}\n`);
        }
      }
      return root;
    }

    const walked = ['alpha', 'beta', 'gamma'];

    it('scopes a workflow file to its own workflow', async () => {
      const root = corpus();
      try {
        expect(await coverageScope(root, classifyChange(['alpha/workflow.yaml']), walked)).toEqual(['alpha']);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });

    it('scopes a shared activity to every walked workflow holding that id', async () => {
      const root = corpus();
      try {
        // alpha's copy changed, and beta declares the same id — so beta's walk can cover the same
        // option key, and judging the change without it would call a covered option unreached.
        expect(await coverageScope(root, classifyChange(['alpha/activities/01-shared-stage.yaml']), walked))
          .toEqual(['alpha', 'beta']);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });

    it('scopes an unshared activity to one workflow', async () => {
      const root = corpus();
      try {
        expect(await coverageScope(root, classifyChange(['alpha/activities/02-alpha-only.yaml']), walked))
          .toEqual(['alpha']);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });

    it('leaves a workflow outside the walked set out of the scope', async () => {
      const root = corpus();
      try {
        // gamma changed but is not walked, so no walk measures it and none is asked for.
        expect(await coverageScope(root, classifyChange(['gamma/activities/01-gamma-only.yaml']), ['alpha', 'beta']))
          .toEqual([]);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });

    it('scopes a change that cannot move coverage to nothing', async () => {
      const root = corpus();
      try {
        expect(await coverageScope(root, classifyChange(['alpha/techniques/thing.md']), walked)).toEqual([]);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });
  });
});
