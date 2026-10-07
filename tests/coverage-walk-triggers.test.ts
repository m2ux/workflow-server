import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'yaml';

const REPO = resolve(import.meta.dirname, '..');
const PATH = '.github/workflows/coverage-walk.yml';

interface Step {
  name?: string;
  uses?: string;
  run?: string;
  if?: string;
}

interface Workflow {
  on?: {
    push?: { branches?: string[] };
    schedule?: { cron: string }[];
    workflow_dispatch?: unknown;
  };
  permissions?: Record<string, string>;
  jobs?: Record<string, { steps?: Step[] }>;
}

const raw = readFileSync(join(REPO, PATH), 'utf-8');
const workflow = parse(raw) as Workflow;
const steps = Object.values(workflow.jobs ?? {}).flatMap((job) => job.steps ?? []);

/**
 * What this file can and cannot say. A criterion about when a CI run happens is observed by the run,
 * and no test here starts one: these assertions are a parse of the workflow and a read of its
 * configuration, which is the whole of what exists before a trigger has ever fired. They catch the
 * trigger written wrong — a cron that is not weekly, a branch list that drops the default branch, a
 * dispatch aimed at nothing — and they catch the walk being changed while the trigger was added.
 * They are not evidence that a push or a Monday starts a walk. That evidence is the first run after
 * merge, on the Actions tab.
 */
describe('the full coverage walk trigger', () => {
  it('parses as a workflow with triggers and a job', () => {
    expect(workflow.on).toBeDefined();
    expect(Object.keys(workflow.jobs ?? {})).toHaveLength(1);
    expect(steps.length).toBeGreaterThan(0);
  });

  it('runs on a push to the default branch, and on an initiative integration branch', () => {
    expect(workflow.on?.push?.branches).toEqual(['main', 'i[0-9][0-9]/main']);
  });

  it('runs on one weekly schedule', () => {
    // Minute 17, hour 3, every month, on day-of-week 1 — 03:17 UTC on Mondays.
    expect(workflow.on?.schedule).toEqual([{ cron: '17 3 * * 1' }]);
  });

  /**
   * The subject of the walk is the corpus tree and the walk lives there, so this file starting one
   * of its own would be a second walk to keep in step with the first.
   */
  it('starts the corpus walk rather than running a walk of its own', () => {
    const script = steps.map((step) => step.run ?? '').join('\n');
    expect(script).toContain('gh workflow run coverage.yml');
    expect(script).not.toContain('test:coverage-walk');
  });

  it('gates no step on the event, so every trigger starts the same walk', () => {
    expect(steps.filter((step) => step.if !== undefined).map((step) => step.name)).toEqual([]);
  });

  /**
   * `workflow_dispatch` is one of the two events a job's own token may raise that still start a run,
   * so a dispatch needs `actions: write` and nothing further. Pinning the set keeps a widened
   * permission a decision rather than a side effect.
   */
  it('asks for the permissions a dispatch needs and no others', () => {
    expect(workflow.permissions).toEqual({ contents: 'read', actions: 'write' });
  });

  /**
   * A tag reference is refused on some of this organisation's repositories and is poor practice on
   * all of them, so an action added here takes a full-length commit SHA with its tag as a trailing
   * comment, the form `docker-publish.yml` writes. Today there is no action to pin, and this says so
   * rather than leaving the reader to check.
   */
  it('adds no action, so the file carries no pin', () => {
    expect(steps.filter((step) => step.uses !== undefined).map((step) => step.uses)).toEqual([]);
  });
});
