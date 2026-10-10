import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { collectFindings } from '../guards/check-inherited-input-never-spent.js';

/**
 * inherited-input-never-spent guard: a step handed a required container input that nothing in its
 * scope holds, for an op that never reads it.
 *
 * The proving instance is the cargo library as it stood at bb38d574: `build_scope` and
 * `build_budget` were required of every op, and work-package bound `preflight`, which reads
 * neither, from a workflow holding no such variable.
 */
describe('inherited-input-never-spent guard', () => {
  const front = '---\nmetadata:\n  version: 1.0.0\n---\n\n';

  const requiredContract = front
    + '## Capability\n\nCargo invocations.\n\n## Inputs\n\n'
    + '### build_scope\n\n`--workspace` for the full workspace, or `-p <crate>` for one crate.\n\n'
    + '### build_budget\n\nThe command prefix a compiling cargo invocation carries.\n';

  const defaultedContract = front
    + '## Capability\n\nCargo invocations.\n\n## Inputs\n\n'
    + '### build_scope\n\n*(optional)* `--workspace` for the full workspace, or `-p <crate>` for one crate.\n\n'
    + '#### default\n\n`--workspace`\n\n'
    + '### build_budget\n\n*(optional)* The command prefix a compiling cargo invocation carries.\n\n'
    + '#### default\n\n`nice -n 19`\n';

  const op = (capability: string, protocol: string, inputs = ''): string =>
    `${front}## Capability\n\n${capability}\n\n${inputs}## Protocol\n\n### 1. Run\n\n- ${protocol}\n`;

  const ops: Record<string, string> = {
    preflight: op('Missing system prerequisites.', 'Probe each prerequisite with `which <name>`.'),
    check: op('Type-check.', 'Run `{build_budget} cargo check {build_scope}`.'),
  };

  interface Tree {
    contract?: string;
    library?: Record<string, string>;
    steps: string;
    variables?: string;
    workflowId?: string;
  }

  async function findingsFor(tree: Tree): Promise<string[]> {
    const root = mkdtempSync(join(tmpdir(), 'wf-unspent-'));
    try {
      const techniques = join(root, 'support', 'cargo', 'techniques');
      mkdirSync(techniques, { recursive: true });
      writeFileSync(join(techniques, 'TECHNIQUE.md'), tree.contract ?? requiredContract);
      for (const [name, body] of Object.entries(tree.library ?? ops)) writeFileSync(join(techniques, `${name}.md`), body);

      const id = tree.workflowId ?? 'wf';
      mkdirSync(join(root, id, 'activities'), { recursive: true });
      writeFileSync(
        join(root, id, 'workflow.yaml'),
        `id: ${id}\nversion: 1.0.0\ntitle: ${id}\ninitialActivity: validate\ngraph:\n  validate: {}\n${tree.variables ?? ''}`,
      );
      writeFileSync(
        join(root, id, 'activities', '01-validate.yaml'),
        `id: validate\nversion: 1.0.0\nname: Validate\nsteps:\n${tree.steps}`,
      );
      return (await collectFindings(root)).map((f) => `${f.site} ${f.detail.split(' and never')[0]}`);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }

  const preflightStep = '  - kind: technique\n    id: preflight\n    technique: cargo::preflight\n';

  it('fails on the cargo contract as it stood at bb38d574', async () => {
    expect(await findingsFor({ steps: preflightStep })).toEqual([
      "wf::validate::preflight binds 'cargo::preflight', which inherits required input 'build_scope' "
        + 'from support/cargo/techniques/TECHNIQUE.md',
      "wf::validate::preflight binds 'cargo::preflight', which inherits required input 'build_budget' "
        + 'from support/cargo/techniques/TECHNIQUE.md',
    ]);
  });

  it('passes the same tree once the contract carries its defaults', async () => {
    expect(await findingsFor({ contract: defaultedContract, steps: preflightStep })).toEqual([]);
  });

  it('passes a step binding an op that reads the input', async () => {
    expect(await findingsFor({ steps: '  - kind: technique\n    id: check\n    technique: cargo::check\n' })).toEqual([]);
  });

  it('passes where the step binding supplies the input', async () => {
    const steps = '  - kind: technique\n    id: preflight\n    technique:\n      name: cargo::preflight\n'
      + '      inputs:\n        build_scope: --workspace\n        build_budget: nice -n 19\n';
    expect(await findingsFor({ steps })).toEqual([]);
  });

  it('passes where a workflow variable holds the input', async () => {
    const variables = 'variables:\n'
      + '  - name: build_scope\n    type: string\n    description: The cargo scope.\n'
      + '  - name: build_budget\n    type: string\n    description: The cargo prefix.\n';
    expect(await findingsFor({ steps: preflightStep, variables })).toEqual([]);
  });

  it('passes where an earlier step lands the input', async () => {
    const library = {
      ...ops,
      'pick-scope': `${front}## Capability\n\nThe cargo scope.\n\n## Outputs\n\n### build_scope\n\nThe scope.\n\n`
        + '### build_budget\n\nThe prefix.\n\n## Protocol\n\n### 1. Pick\n\n- Return `{build_scope}` and `{build_budget}`.\n',
    };
    const steps = '  - kind: technique\n    id: pick-scope\n    technique: cargo::pick-scope\n' + preflightStep;
    expect(await findingsFor({ library, steps })).toEqual([]);
  });

  it('counts an op the bound op applies as reading the input', async () => {
    const library = {
      ...ops,
      'run-suite': op('The validation suite.', 'Apply [check](./check.md).'),
    };
    const steps = '  - kind: technique\n    id: run-suite\n    technique: cargo::run-suite\n';
    expect(await findingsFor({ library, steps })).toEqual([]);
  });

  it('passes a leaf that redeclares the input as its own', async () => {
    const library = {
      ...ops,
      preflight: op(
        'Missing system prerequisites.',
        'Probe each prerequisite with `which <name>`.',
        '## Inputs\n\n### build_scope\n\n*(optional)* The crate scope.\n\n### build_budget\n\n*(optional)* The prefix.\n\n',
      ),
    };
    expect(await findingsFor({ library, steps: preflightStep })).toEqual([]);
  });

  it('leaves a container input no op reads to declared-input-never-read', async () => {
    const library = { preflight: ops['preflight']! };
    expect(await findingsFor({ library, steps: preflightStep })).toEqual([]);
  });

  it('excuses workflow-design', async () => {
    expect(await findingsFor({ steps: preflightStep, workflowId: 'workflow-design' })).toEqual([]);
  });
});
