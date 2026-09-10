import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { collectFindings } from '../scripts/check-activity-variables.js';
import { loadWorkflow } from '../src/loaders/workflow-loader.js';
import { containerMember, readCarriesIndex, mergeActivityVariables } from '../src/utils/activity-variables.js';
import type { Finding } from '../scripts/guard-protocol.js';

/**
 * The container in front of the guard. The families here land inside the existing variables entry
 * at hard zero, so a bug in the member-grain read test, the re-keyed write side or the synthetic
 * collection read is silent — these fixtures are the whole protection.
 */
const FAN_CORPUS = resolve(import.meta.dirname, 'fixtures/fan-corpus');

let findings: Finding[];

beforeAll(async () => {
  process.env['ALLOW_UNEXECUTABLE_FANS'] = '1';
  findings = await collectFindings(FAN_CORPUS);
});

afterAll(() => {
  delete process.env['ALLOW_UNEXECUTABLE_FANS'];
});

const forWorkflow = (id: string): Finding[] => findings.filter((f) => f.site.startsWith(`${id} ::`));

describe('the member-grain read test', () => {
  const KEY = 'probe_unit_outputs';

  it('drops a leading all-digits segment and then the literal result segment', () => {
    expect(containerMember(`${KEY}.0.result.probe_findings`, KEY)).toBe('probe_findings');
    expect(containerMember(`${KEY}.11.result.probe_findings.severity`, KEY))
      .toBe('probe_findings.severity');
  });

  it('answers the empty string for the container read whole — the access a gather makes', () => {
    expect(containerMember(KEY, KEY)).toBe('');
  });

  it('is undefined for a reference into something else', () => {
    expect(containerMember('probe_targets.0', KEY)).toBeUndefined();
  });

  it('a read that omits the index carries no index, so it addresses nothing', () => {
    expect(readCarriesIndex(`${KEY}.0.result.probe_findings`, KEY)).toBe(true);
    expect(readCarriesIndex(`${KEY}.probe_findings`, KEY)).toBe(false);
    expect(containerMember(`${KEY}.probe_findings`, KEY)).toBe('probe_findings');
  });
});

describe('the container declaration', () => {
  it('is an array with no starting value in both fan forms', async () => {
    // Both forms: the shape is a dense array either way, and the uniform index is what keeps a read
    // form independent of the fan's shape. A starting value would make an existence gate constant.
    for (const [id, fanned] of [
      ['list-fan-fixture', ['survey-pass', 'dependency-review']],
      ['instance-fan-fixture', ['probe-unit']],
    ] as const) {
      const result = await loadWorkflow(FAN_CORPUS, id);
      expect(result.success).toBe(true);
      if (!result.success) return;
      for (const activity of fanned) {
        const key = `${activity.split('-').join('_')}_outputs`;
        const declaration = result.value.variables?.find((v) => v.name === key);
        expect(declaration, `${id} declares ${key}`).toBeDefined();
        expect(declaration?.type).toBe('array');
        expect(declaration?.defaultValue).toBeUndefined();
      }
    }
  });

  it('adds the container beside the members rather than in place of them', () => {
    // Substituting drops the members' declared types, value sets and starting values — the only
    // check on the one agent-supplied record the server does not type.
    const merged = mergeActivityVariables(
      undefined,
      [{
        id: 'probe-unit',
        variables: {
          writes: [
            { name: 'probe_findings', type: 'object', description: 'findings', required: false },
            { name: 'probe_scope', type: 'string', description: 'scope', values: ['narrow', 'wide'], defaultValue: 'narrow', required: false },
          ],
        },
      }],
      new Set(['probe-unit']),
    );
    const names = merged.variables.map((v) => v.name).sort();
    expect(names).toEqual(['probe_findings', 'probe_scope', 'probe_unit_outputs']);
    const member = merged.variables.find((v) => v.name === 'probe_scope');
    expect(member?.values).toEqual(['narrow', 'wide']);
    expect(member?.defaultValue).toBe('narrow');
    expect(merged.contradictions).toEqual([]);
  });
});

describe('a correct fan of each form produces zero findings', () => {
  it('the gather-bound meeting point reports nothing, the synthetic collection read included', () => {
    expect(forWorkflow('gather-fixture')).toEqual([]);
  });

  it('the list, instance and mixed fixtures report nothing', () => {
    // Including no unused declaration on the branch whose synthetic collection read the graph
    // contributes: the name enters the derived-read set as well as the declared one.
    expect(forWorkflow('list-fan-fixture')).toEqual([]);
    expect(forWorkflow('instance-fan-fixture')).toEqual([]);
    expect(forWorkflow('mixed-fan-fixture')).toEqual([]);
  });

  it('a branch that writes a working value and reads it back within its own steps is not reported', () => {
    // The self-consumed exemption, carried forward. Without it the family fires dozens of times on
    // one correct fan, most of a branch's declared writes being intra-activity working values.
    expect(forWorkflow('templated-artifact-fixture')).toEqual([]);
  });

  // Q8: a fan whose `over` names an earlier fan's container. The exemption is keyed on the single
  // synthetic read the load contributes, so chaining a fan onto a fan needs no intervening gather.
  it('a fan over an earlier fan\'s container loads clean and reports nothing', () => {
    expect(forWorkflow('chained-fan-fixture')).toEqual([]);
  });
});

describe('each family is reported once', () => {
  const details = (id: string, check: string): string[] =>
    forWorkflow(id).filter((f) => f.check === check).map((f) => f.detail);

  it('a bare read of a fanned activity\'s output', () => {
    // Once the write side re-keys, the bare member is written by nothing.
    const reported = details('bare-read-fixture', 'unwritten-read');
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain("reads 'probe_findings'");
  });

  it('a gather naming a member no branch produces', () => {
    const reported = details('missing-member-fixture', 'unwritten-read');
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain("reads 'probe_unit_outputs.0.result.probe_findigns'");
    expect(reported[0]).toContain("which 'probe-unit' does not produce; it lands probe_findings");
  });

  it('a read that omits the index', () => {
    const reported = details('no-index-fixture', 'unwritten-read');
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain('omits the slot index');
    expect(reported[0]).toContain('probe_unit_outputs.<instance>.result.<member>');
  });

  it('an ungathered member', () => {
    const reported = details('ungathered-fixture', 'unread-write');
    expect(reported).toHaveLength(1);
    expect(reported[0]).toBe("writes 'probe_unit_outputs.probe_findings', which nothing in this workflow gathers");
  });

  it('the fan\'s parameter read by a non-branch activity, with the fan-specific detail string', () => {
    const reported = details('stray-parameter-fixture', 'unwritten-read');
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain("reads 'probe_target'");
    expect(reported[0]).toContain("supplies only to 'probe-unit' as the fan's per-instance parameter");
    // The branch's own read of it is not reported.
    expect(forWorkflow('stray-parameter-fixture').map((f) => f.site))
      .not.toContain('stray-parameter-fixture :: probe-unit');
  });
});

describe('the artifact-collision family — the one new check on the safety floor', () => {
  const collisions = (id: string): string[] =>
    forWorkflow(id).filter((f) => f.check === 'fan-artifact-collision').map((f) => f.detail);

  it('two branches of one list fan resolving one literal filename are reported once', () => {
    const reported = forWorkflow('collision-list-fixture')
      .filter((f) => f.check === 'fan-artifact-collision');
    expect(reported).toHaveLength(1);
    expect(reported[0]!.detail).toContain("has 'survey-pass' and 'dependency-review' both writing artifact 'probe-findings.md'");
    expect(reported[0]!.detail).toContain("one branch's writes land in the other's document");
  });

  it('an instance-fanned activity writing a literal artifact name is reported once', () => {
    const reported = collisions('collision-instance-fixture');
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain("writes artifact 'probe-findings.md'");
    // The message states both arms, because both are legal and the author chooses.
    expect(reported[0]).toContain("'{probe_target}-probe-findings.md'");
    expect(reported[0]).toContain('the branch declares no artifact');
  });

  it('one whose artifact template carries the fan\'s parameter is not reported', () => {
    expect(collisions('templated-artifact-fixture')).toEqual([]);
  });
});
