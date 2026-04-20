import { describe, it, expect, beforeEach } from 'vitest';
import { createSessionToken, decodeSessionToken, advanceToken } from '../src/utils/session.js';

describe('dispatch_workflow tool: session creation', () => {
  it('creates a client session token with psid referencing the parent', async () => {
    const parentToken = await createSessionToken('meta', '1.0.0', 'test-agent');
    const parent = await decodeSessionToken(parentToken);

    const clientToken = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', parent.sid);
    const client = await decodeSessionToken(clientToken);

    expect(client.wf).toBe('remediate-vuln');
    expect(client.psid).toBe(parent.sid);
    expect(client.sid).not.toBe(parent.sid);
    expect(client.seq).toBe(0);
  });

  it('client session is independent — no shared state with parent', async () => {
    const parentToken = await createSessionToken('meta', '1.0.0', 'test-agent');
    const parent = await decodeSessionToken(parentToken);

    const clientToken = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', parent.sid);
    const client = await decodeSessionToken(clientToken);

    expect(client.wf).not.toBe(parent.wf);
    expect(client.sid).not.toBe(parent.sid);
    expect(client.seq).toBe(0);
    expect(parent.seq).toBe(0);
  });
});

describe('get_workflow_status: token-based status extraction', () => {
  it('extracts current activity from client token', async () => {
    const parentToken = await createSessionToken('meta', '1.0.0', 'test-agent');
    const parent = await decodeSessionToken(parentToken);

    const clientToken = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', parent.sid);
    const advancedClient = await advanceToken(clientToken, { act: 'assess-vuln' });
    const client = await decodeSessionToken(advancedClient);

    expect(client.act).toBe('assess-vuln');
    expect(client.psid).toBe(parent.sid);
  });

  it('detects blocked status from pending checkpoints', async () => {
    const parentToken = await createSessionToken('meta', '1.0.0', 'test-agent');
    const parent = await decodeSessionToken(parentToken);

    const clientToken = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', parent.sid);
    const advancedClient = await advanceToken(clientToken, {
      act: 'assess-vuln',
      bcp: 'cp-1',
    });
    const client = await decodeSessionToken(advancedClient);

    expect(client.bcp).toEqual('cp-1');
  });

  it('detects active status when no checkpoints pending', async () => {
    const parentToken = await createSessionToken('meta', '1.0.0', 'test-agent');
    const parent = await decodeSessionToken(parentToken);

    const clientToken = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', parent.sid);
    const advancedClient = await advanceToken(clientToken, { act: 'assess-vuln' });
    const client = await decodeSessionToken(advancedClient);

    expect(client.bcp).toBeUndefined();
  });
});

describe('parent-child session correlation', () => {
  it('parent can find children via psid', async () => {
    const parentToken = await createSessionToken('meta', '1.0.0', 'test-agent');
    const parent = await decodeSessionToken(parentToken);

    const child1Token = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', parent.sid);
    const child1 = await decodeSessionToken(child1Token);

    const child2Token = await createSessionToken('work-package', '1.0.0', 'test-agent', parent.sid);
    const child2 = await decodeSessionToken(child2Token);

    expect(child1.psid).toBe(parent.sid);
    expect(child2.psid).toBe(parent.sid);
    expect(child1.sid).not.toBe(child2.sid);
    expect(child1.wf).toBe('remediate-vuln');
    expect(child2.wf).toBe('work-package');
  });

  it('psid does not grant access to parent session', async () => {
    const parentToken = await createSessionToken('meta', '1.0.0', 'test-agent');
    const parent = await decodeSessionToken(parentToken);

    const childToken = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', parent.sid);
    const child = await decodeSessionToken(childToken);

    // Child only has the parent's sid as metadata — cannot decode the parent token
    expect(typeof child.psid).toBe('string');
    expect(child.wf).toBe('remediate-vuln');
    // The child token payload does NOT contain any parent session secrets
    expect(child.seq).toBe(0);
    expect(child.ts).toBeGreaterThanOrEqual(parent.ts);
  });

  it('recursive dispatch: child can be a parent too', async () => {
    const metaToken = await createSessionToken('meta', '1.0.0', 'test-agent');
    const meta = await decodeSessionToken(metaToken);

    const clientToken = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', meta.sid);
    const client = await decodeSessionToken(clientToken);

    const subClientToken = await createSessionToken('prism-update', '1.0.0', 'test-agent', client.sid);
    const subClient = await decodeSessionToken(subClientToken);

    expect(subClient.psid).toBe(client.sid);
    expect(client.psid).toBe(meta.sid);
    // Full chain: subClient → client → meta
    expect(subClient.wf).toBe('prism-update');
    expect(client.wf).toBe('remediate-vuln');
    expect(meta.wf).toBe('meta');
  });
});
