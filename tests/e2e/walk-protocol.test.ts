/**
 * Walk-protocol definitions, read off the corpus tree this suite is pointed at.
 *
 * The opening, the standing walk, and the resume are walked in `tests/batch-loop-walk.test.ts`.
 * The checks here read declarations. The server does not execute technique prose.
 * The unbound-fan refusal is `tests/fan-unbound-refusal.test.ts`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { liveCorpusRoot } from '../corpus-root.js';

const root = liveCorpusRoot();
const script = root === null ? '' : join(root, 'walks/check-walk-protocol.py');

describe.skipIf(script === '' || !existsSync(script))('walk-protocol file check', () => {
  it('holds on the corpus tree', () => {
    const out = execFileSync('python3', [script], { encoding: 'utf8' });
    expect(out).toContain('walk-protocol definitions hold');
  });

  it('fails when the opening clear is gone', () => {
    const out = execFileSync('python3', [script, '--self-test'], { encoding: 'utf8' });
    expect(out).toContain('fails the opening check');
  });
});

function readCorpus(rel: string): string {
  return readFileSync(join(root!, rel), 'utf8');
}

function section(text: string, start: string, end: string): string {
  const i = text.indexOf(start);
  if (i < 0) return '';
  const j = text.indexOf(end, i + start.length);
  return text.slice(i, j < 0 ? undefined : j);
}

interface YamlStep {
  kind?: string;
  id?: string;
  when?: string;
  technique?: { name?: string } | string;
  actions?: Array<{ action?: string; target?: string; value?: unknown }>;
  steps?: YamlStep[];
}

function techniqueName(step: YamlStep): string | undefined {
  if (typeof step.technique === 'string') return step.technique;
  return step.technique?.name;
}

describe.skipIf(root === null)('walk-protocol declarations', () => {
  it('enter-fan and take-activity declare the trace tokens they capture', () => {
    for (const rel of [
      'corpus/meta/techniques/fan/enter-fan.md',
      'corpus/meta/techniques/workflow-engine/take-activity.md',
    ]) {
      const outputs = section(readCorpus(rel), '## Outputs', '## Protocol');
      const declared = section(outputs, '### advance_trace_tokens', '\n### ');
      expect(declared, rel).toContain('_meta.trace_token');
    }
    const loop = parseYaml(readCorpus('corpus/meta/routines/activity-loop.yaml')) as { steps: YamlStep[] };
    // Each entry's token is appended by a step of its own, gated on the token that entry
    // returned, so an entry that advanced nothing appends nothing.
    const appending = loop.steps.flatMap((step) => step.steps ?? []).filter((step) =>
      step.actions?.some((action) => action.target === 'trace_tokens'
        && action.value === '[{trace_tokens}, {advance_trace_tokens}]'));
    const ids = appending.map((step) => step.id);
    expect(ids).toEqual(expect.arrayContaining(['append-entry-tokens', 'append-fan-tokens', 'append-resume-tokens']));
    for (const step of appending) expect(step.when, step.id).toBe('advance_trace_tokens');
  });

  it('each option states what choosing it means', () => {
    const files = [
      'corpus/meta/activities/04-end-workflow.yaml',
      'corpus/workflow-design/activities/06-scope-and-draft.yaml',
      'corpus/workflow-authoring/activities/01-intake-and-context.yaml',
      'corpus/workflow-authoring/activities/06-scope-and-draft.yaml',
      'corpus/workflow-authoring/activities/09-validate-and-commit.yaml',
      'corpus/prism-evaluate/activities/05-resolution-dialogue.yaml',
      'corpus/midnight-system-review/activities/01-scope-intake.yaml',
      'corpus/midnight-system-review/activities/02-area-derivation.yaml',
      'corpus/work-package/activities/13-submit-for-review.yaml',
    ];
    const routing = /leads to|routes to|goes to/i;
    const bare: string[] = [];
    for (const rel of files) {
      const doc = parseYaml(readCorpus(rel)) as { steps?: YamlStep[] };
      const steps = doc.steps ?? [];
      const checkpoints: YamlStep[] = [];
      const visit = (list: YamlStep[]): void => {
        for (const step of list) {
          if (step.kind === 'checkpoint') checkpoints.push(step);
          if (step.steps) visit(step.steps);
        }
      };
      visit(steps);
      for (const gate of checkpoints) {
        const options = (gate as { options?: Array<{ id?: string; description?: string }> }).options ?? [];
        for (const option of options) {
          if (typeof option.description !== 'string' || option.description.trim() === '') {
            bare.push(`${rel} ${gate.id}/${option.id}`);
          } else if (routing.test(option.description)) {
            bare.push(`${rel} ${gate.id}/${option.id} routes: ${option.description}`);
          }
        }
      }
    }
    expect(bare).toEqual([]);
  });

  it('each finalize-activity output describes its value', () => {
    const outputs = section(
      readCorpus('corpus/meta/techniques/workflow-engine/finalize-activity.md'),
      '## Outputs',
      '## Protocol',
    );
    const blocks = outputs.split(/^### /m).slice(1);
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      const [heading, ...rest] = block.split('\n');
      const body = rest.join('\n').trim();
      expect(body, heading).not.toBe('');
      expect(body, heading).not.toMatch(/^\[[^\]]+\]\([^)]+\.md\)/);
    }
  });

  it('the workflow-engine Capability states no placement', () => {
    const capability = section(
      readCorpus('corpus/meta/techniques/workflow-engine/TECHNIQUE.md'),
      '## Capability',
      '## Inputs',
    );
    expect(capability).not.toMatch(/\bplacement\b/i);
  });

  it('no specimen defaults a home path', () => {
    const homes: string[] = [];
    const walk = (dir: string): void => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) { walk(path); continue; }
        if (!name.endsWith('.md') && !name.endsWith('.yaml') && !name.endsWith('.yml')) continue;
        if (readFileSync(path, 'utf8').includes('/home/')) homes.push(path);
      }
    };
    walk(join(root!, 'corpus/specimens'));
    expect(homes).toEqual([]);
  });

  it('workflow-design routes 09 to retrospective in create and in review', () => {
    const readme = readCorpus('corpus/workflow-design/activities/README.md');
    expect(readme).toContain('Leads to [Retrospective](#11-retrospective) in create and review modes');
  });

  it('the last retirement returns the name and whether the barrier is met', () => {
    const text = readCorpus('corpus/meta/techniques/fan/retire-branch.md');
    expect(text).toContain("reports that activity's `name` and `barrier.met` true");
  });

  it('the terminal advance commits the completed session', () => {
    const doc = parseYaml(readCorpus('corpus/meta/activities/04-end-workflow.yaml')) as { steps: YamlStep[] };
    const ids = doc.steps.map((step) => step.id);
    const terminal = ids.indexOf('complete-client-session');
    const persist = ids.indexOf('persist-client-completion');
    expect(terminal).toBeGreaterThanOrEqual(0);
    expect(persist).toBeGreaterThan(terminal);
    const advance = doc.steps[terminal]!;
    expect(techniqueName(advance)).toBe('workflow-engine::dispatch-activity');
    const inputs = (advance.technique as { inputs?: Record<string, string> }).inputs;
    expect(inputs?.['activity_id']).toBe('__terminal__');
    expect((doc.steps[persist]! as { routine?: string }).routine).toBe('persist-activity');
  });
});
