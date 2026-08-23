import { describe, it, expect } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkSession } from '../scripts/check-session-contract.js';

/**
 * A run against the contracts its definitions declare (#493).
 *
 * The activity-variables guard compares a definition with itself. This compares a session with the
 * definition — the only way to learn whether the contracts hold once an agent is driving, and the
 * check that would have caught a smoke run reporting two activities against a session that never
 * moved.
 */
describe('session contract', () => {
  /** A one-activity corpus whose activity declares exactly one write. */
  function corpus(): string {
    const root = mkdtempSync(join(tmpdir(), 'wf-session-'));
    mkdirSync(join(root, 'wf', 'activities'), { recursive: true });
    writeFileSync(join(root, 'wf', 'workflow.yaml'),
      'id: wf\nversion: 1.0.0\ntitle: WF\ninitialActivity: thing\n');
    writeFileSync(join(root, 'wf', 'activities', '01-thing.yaml'),
      'id: thing\nversion: 1.0.0\nname: Thing\nvariables:\n'
      + '  writes:\n    - name: plan_approved\n      type: boolean\n');
    return root;
  }

  const write = (activity: string, name: string, source = 'variables_changed') => ({
    type: 'variable_set', activity, data: { name, value: true, source },
  });

  it('accepts a run that wrote only what the activity declares', async () => {
    const root = corpus();
    try {
      const result = await checkSession({
        workflowId: 'wf', sessionIndex: 'AAA111',
        completedActivities: ['thing'],
        history: [write('thing', 'plan_approved')],
      }, root, { runComplete: true });
      expect(result.findings).toEqual([]);
      expect(result.checkedWrites).toBe(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports a write the activity does not declare, naming both readings', async () => {
    const root = corpus();
    try {
      const result = await checkSession({
        workflowId: 'wf', sessionIndex: 'AAA111',
        completedActivities: ['thing'],
        history: [write('thing', 'plan_approved'), write('thing', 'invented_flag')],
      }, root, { runComplete: true });
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0]!.check).toBe('undeclared-write');
      expect(result.findings[0]!.detail).toContain("'invented_flag'");
      expect(result.findings[0]!.detail).toContain('contract is short');
      expect(result.findings[0]!.detail).toContain('does not sanction');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports one finding for a name written at several steps', async () => {
    const root = corpus();
    try {
      const result = await checkSession({
        workflowId: 'wf', sessionIndex: 'AAA111',
        completedActivities: ['thing'],
        history: [write('thing', 'invented_flag'), write('thing', 'invented_flag')],
      }, root, { runComplete: true });
      expect(result.findings).toHaveLength(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports a finished run that wrote and completed nothing', async () => {
    const root = corpus();
    try {
      const result = await checkSession({
        workflowId: 'wf', sessionIndex: 'AAA111',
        completedActivities: [],
        history: [write('thing', 'plan_approved')],
      }, root, { runComplete: true });
      expect(result.findings.map((f) => f.check)).toEqual(['no-progress']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('leaves a run still in flight alone', async () => {
    const root = corpus();
    try {
      // The same session, read mid-activity: no completions yet, and nothing wrong with that.
      const result = await checkSession({
        workflowId: 'wf', sessionIndex: 'AAA111',
        completedActivities: [],
        history: [write('thing', 'plan_approved')],
      }, root);
      expect(result.findings).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('counts a write it cannot attribute rather than passing it', async () => {
    const root = corpus();
    try {
      const result = await checkSession({
        workflowId: 'wf', sessionIndex: 'AAA111',
        completedActivities: ['thing'],
        history: [{ type: 'variable_set', data: { name: 'orphan_value', source: 'setVariable' } }],
      }, root, { runComplete: true });
      expect(result.findings).toEqual([]);
      expect(result.checkedWrites).toBe(0);
      expect(result.unattributedWrites).toBe(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
