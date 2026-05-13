import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { withAuditLog } from '../src/logging.js';

/**
 * The audit log goes to console.error as a JSON line. These tests
 * spy on console.error and inspect the captured argument to verify
 * that session_token / checkpoint_handle are redacted before logging.
 */
describe('withAuditLog redaction', () => {
  let errSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errSpy.mockRestore();
  });

  function getLastAuditEvent(): { tool: string; parameters: Record<string, unknown>; result: string } {
    // Find the most recent call whose payload is an audit event.
    for (let i = errSpy.mock.calls.length - 1; i >= 0; i--) {
      const call = errSpy.mock.calls[i];
      if (!call || call.length === 0) continue;
      const arg = call[0];
      if (typeof arg !== 'string') continue;
      try {
        const parsed = JSON.parse(arg);
        if (parsed && parsed.type === 'audit') return parsed;
      } catch { /* not an audit line */ }
    }
    throw new Error('No audit event captured');
  }

  it('TC-30 redacts session_token from params on a successful call', async () => {
    const SECRET = 'eyJ3ZiI6IndvcmstcGFja2FnZSJ9.fake-hmac-signature-1234567890';
    const handler = withAuditLog('start_session', async () => ({ ok: true }));
    await handler({ session_token: SECRET, workflow_id: 'work-package', agent_id: 'orchestrator' });
    const audit = getLastAuditEvent();
    expect(audit.tool).toBe('start_session');
    expect(audit.parameters['session_token']).toBe('[redacted]');
    expect(JSON.stringify(audit)).not.toContain(SECRET);
  });

  it('TC-31 redacts checkpoint_handle from params on a successful call', async () => {
    const SECRET = 'eyJ3ZiI6IndvcmstcGFja2FnZSIsImJjcCI6ImNwIn0.fake-hmac-987654321';
    const handler = withAuditLog('respond_checkpoint', async () => ({ ok: true }));
    await handler({ checkpoint_handle: SECRET, option_id: 'confirmed' });
    const audit = getLastAuditEvent();
    expect(audit.parameters['checkpoint_handle']).toBe('[redacted]');
    expect(JSON.stringify(audit)).not.toContain(SECRET);
  });

  it('TC-32 redaction is shallow and preserves other params', async () => {
    const SECRET = 'eyJzaWQiOiJhYmNkZWYifQ.signature';
    const NESTED_SECRET = 'eyJzaWQiOiJ4eXoifQ.signature2';
    const handler = withAuditLog('next_activity', async () => ({ ok: true }));
    await handler({
      session_token: SECRET,
      activity_id: 'plan',
      workflow_id: 'work-package',
      agent_id: 'worker',
      // Nested object containing the literal token string. Shallow
      // redaction means this nested copy is preserved verbatim — the
      // redaction is at the top-level keys we know about.
      step_manifest: [{ step_id: 'analyze', output: 'looks good', nested_token: NESTED_SECRET }],
    });
    const audit = getLastAuditEvent();
    expect(audit.parameters['session_token']).toBe('[redacted]');
    expect(audit.parameters['activity_id']).toBe('plan');
    expect(audit.parameters['workflow_id']).toBe('work-package');
    expect(audit.parameters['agent_id']).toBe('worker');
    expect(audit.parameters['step_manifest']).toEqual([
      { step_id: 'analyze', output: 'looks good', nested_token: NESTED_SECRET },
    ]);
  });

  it('TC-32b redacts on error path as well', async () => {
    const SECRET = 'eyJ3ZiI6Im1ldGEifQ.signature-err';
    const handler = withAuditLog('get_activity', async () => {
      throw new Error('boom');
    });
    await expect(handler({ session_token: SECRET })).rejects.toThrow('boom');
    const audit = getLastAuditEvent();
    expect(audit.result).toBe('error');
    expect(audit.parameters['session_token']).toBe('[redacted]');
    expect(JSON.stringify(audit)).not.toContain(SECRET);
  });

  it('TC-32c leaves params untouched when no redaction-sensitive keys are present', async () => {
    const handler = withAuditLog('list_workflows', async () => ({ ok: true }));
    await handler({ filter: 'meta', limit: 10 });
    const audit = getLastAuditEvent();
    expect(audit.parameters).toEqual({ filter: 'meta', limit: 10 });
  });
});
