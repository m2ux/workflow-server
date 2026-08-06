/**
 * The activity definition collapses in parts, and its identity never does (#404 W10).
 *
 * Everything else a delivery carries can arrive as a marker when the receiving context already holds
 * the bytes. The definition is keyed the same way, in parts, because a worker confirms the returned
 * activity id against the one it was dispatched for and stops without executing a step if they
 * disagree — so the identity has to survive whatever else collapses.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'node:path';
import { parse } from 'yaml';
import { splitActivityBody, projectActivityBody, COLLAPSIBLE_BODY_FIELDS } from '../src/utils/activity-body.js';
import { contentHash } from '../src/utils/delivery.js';
import type { SessionFile } from '../src/schema/session.schema.js';
import { createHarness, rawText, isError, parseToolResponse, type Harness } from './e2e/harness.js';

const BODY = [
  'id: start-work-package',
  'version: 3.15.0',
  'name: Start Work Package',
  'description: Initialize the work package.',
  'required: true',
  'steps:',
  '  - kind: action',
  '    id: announce-start',
  'transitions:',
  '  - to: design-philosophy',
  'outcome:',
  '  - The work package has an identity',
  'artifacts:',
  '  - name: 01-intake.md',
].join('\n');

/** A session whose ledger already holds `entries` under `scope`. */
function sessionHolding(scope: string, entries: Record<string, string>): SessionFile {
  return { agentId: scope, deliveredContent: { [scope]: entries } } as unknown as SessionFile;
}

describe('splitActivityBody', () => {
  it('keeps every scalar field with the identity and separates each collapsible block', () => {
    const { identity, sections } = splitActivityBody(BODY);
    expect(identity).toContain('id: start-work-package');
    expect(identity).toContain('version: 3.15.0');
    expect(identity).toContain('name: Start Work Package');
    expect(identity).not.toContain('kind: action');
    expect(sections.map((s) => s.field)).toEqual(['steps', 'transitions', 'outcome', 'artifacts']);
    expect(sections[0]!.text).toContain('id: announce-start');
  });

  it('loses nothing: the parts rejoin into the definition they came from', () => {
    const { identity, sections } = splitActivityBody(BODY);
    expect([identity, ...sections.map((s) => s.text)].join('\n')).toBe(BODY);
  });

  it('keeps an unrecognised top-level field with the identity rather than dropping it', () => {
    const withExtra = `${BODY}\nbundleTechniques:\n  maxChars: 0`;
    const { identity, sections } = splitActivityBody(withExtra);
    expect(identity).toContain('bundleTechniques:');
    expect(identity).toContain('  maxChars: 0');
    expect(sections.map((s) => s.field)).toEqual(COLLAPSIBLE_BODY_FIELDS);
  });
});

describe('projectActivityBody', () => {
  it('sends every part in full when the context holds nothing, and stages a key for each', () => {
    const projected = projectActivityBody(BODY, sessionHolding('w', {}), 'w', { readLedger: true });
    expect(projected.text).toBe(BODY);
    expect(projected.collapsedFields).toEqual([]);
    expect(Object.keys(projected.newDeliveries).sort()).toEqual(
      COLLAPSIBLE_BODY_FIELDS.map((f) => `activity:${f}:${contentHash(splitActivityBody(BODY).sections.find((s) => s.field === f)!.text)}`).sort(),
    );
  });

  it('collapses a section this context already holds, and keeps the identity in full', () => {
    const { sections } = splitActivityBody(BODY);
    const held = Object.fromEntries(sections.map((s) => [`activity:${s.field}:${contentHash(s.text)}`, contentHash(s.text)]));
    const projected = projectActivityBody(BODY, sessionHolding('w', held), 'w', { readLedger: true });

    expect(projected.collapsedFields).toEqual(COLLAPSIBLE_BODY_FIELDS);
    // The id survives a fully collapsed definition — the dispatched-activity check still has
    // something to read.
    const parsed = parse(projected.text) as Record<string, unknown>;
    expect(parsed['id']).toBe('start-work-package');
    expect(parsed['version']).toBe('3.15.0');
    for (const field of COLLAPSIBLE_BODY_FIELDS) {
      expect(parsed[field]).toMatchObject({ delivery: 'unchanged' });
    }
    // None of the collapsed content is in the payload. A marker has a floor of its own — on a
    // definition this small the four of them cost more than the lines they replace, which is why the
    // size claim is measured over the real corpus below rather than over this fixture.
    expect(projected.text).not.toContain('id: announce-start');
    expect(projected.text).not.toContain('to: design-philosophy');
    expect(projected.collapsedChars).toBe(
      splitActivityBody(BODY).sections.reduce((total, s) => total + s.text.length, 0),
    );
  });

  it('sends everything in full when the ledger is not consulted', () => {
    const { sections } = splitActivityBody(BODY);
    const held = Object.fromEntries(sections.map((s) => [`activity:${s.field}:${contentHash(s.text)}`, contentHash(s.text)]));
    const projected = projectActivityBody(BODY, sessionHolding('w', held), 'w', { readLedger: false });
    expect(projected.text).toBe(BODY);
    expect(projected.collapsedFields).toEqual([]);
  });

  it('delivers a changed section in full while its siblings collapse', () => {
    const { sections } = splitActivityBody(BODY);
    const held = Object.fromEntries(
      sections.filter((s) => s.field !== 'steps').map((s) => [`activity:${s.field}:${contentHash(s.text)}`, contentHash(s.text)]),
    );
    const projected = projectActivityBody(BODY, sessionHolding('w', held), 'w', { readLedger: true });
    expect(projected.collapsedFields).toEqual(['transitions', 'outcome', 'artifacts']);
    expect(projected.text).toContain('id: announce-start');
  });
});

describe('a resumed re-request over the real corpus', () => {
  let h: Harness;
  let sessionIndex: string;

  beforeAll(async () => {
    h = await createHarness();
    const started = await h.client.callTool({
      name: 'start_session',
      arguments: {
        workflow_id: 'work-package', agent_id: 'orchestrator',
        planning_folder: join(h.workspaceDir, '.engineering/artifacts/planning', 'activity-body'),
      },
    });
    if (isError(started)) throw new Error(rawText(started));
    sessionIndex = parseToolResponse(started).session_index as string;
    const entered = await h.client.callTool({
      name: 'next_activity', arguments: { session_index: sessionIndex, activity_id: 'start-work-package' },
    });
    if (isError(entered)) throw new Error(rawText(entered));
  });

  afterAll(async () => { await h?.close(); });

  const take = (agentId: string, extra: Record<string, unknown> = {}) =>
    h.client.callTool({
      name: 'get_activity',
      arguments: { session_index: sessionIndex, context_tokens: 200000, agent_id: agentId, ...extra },
    });

  it('returns the identity in full and the remainder as markers, and shrinks the delivery', async () => {
    const first = await take('resumed-worker');
    expect(isError(first)).toBe(false);
    const firstChars = rawText(first).length;

    const second = await take('resumed-worker', { bundle: 'reference' });
    expect(isError(second)).toBe(false);
    const secondText = rawText(second);

    // The id the worker checks its dispatch against is present on the collapsed delivery.
    expect(secondText).toContain('id: start-work-package');
    expect(secondText).toMatch(/steps:\n\s+delivery: unchanged/);
    expect(secondText.length).toBeLessThan(firstChars);
  });

  it('leaves a forced full delivery carrying the whole definition', async () => {
    await take('forced-worker');
    const forced = await take('forced-worker', { bundle: 'full' });
    const text = rawText(forced);
    expect(text).toContain('id: start-work-package');
    expect(text).not.toMatch(/steps:\n\s+delivery: unchanged/);
  });
});
