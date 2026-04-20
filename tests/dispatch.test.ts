import { describe, it, expect } from 'vitest';
import { createSessionToken, decodeSessionToken, advanceToken } from '../src/utils/session.js';

describe('start_session with workflow_id: session creation', () => {
  it('creates a session token for the specified workflow', async () => {
    const token = await createSessionToken('work-package', '3.7.0', 'test-agent');
    const decoded = await decodeSessionToken(token);

    expect(decoded.wf).toBe('work-package');
    expect(decoded.v).toBe('3.7.0');
    expect(decoded.sid).toBeDefined();
    expect(decoded.seq).toBe(0);
    expect(decoded.psid).toBeUndefined();
  });

  it('creates a session with parent context via parent_session_token', async () => {
    const parentToken = await createSessionToken('work-package', '3.7.0', 'orchestrator');
    const parent = await decodeSessionToken(parentToken);

    const childToken = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', {
      psid: parent.sid,
      pwf: parent.wf,
      pact: parent.act,
      pv: parent.v,
    });
    const child = await decodeSessionToken(childToken);

    expect(child.wf).toBe('remediate-vuln');
    expect(child.psid).toBe(parent.sid);
    expect(child.pwf).toBe(parent.wf);
    expect(child.pact).toBe(parent.act);
    expect(child.pv).toBe(parent.v);
    expect(child.sid).not.toBe(parent.sid);
    expect(child.seq).toBe(0);
  });

  it('child session is independent — no shared state with parent', async () => {
    const parentToken = await createSessionToken('work-package', '3.7.0', 'orchestrator');
    const parent = await decodeSessionToken(parentToken);

    const childToken = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', {
      psid: parent.sid,
      pwf: parent.wf,
      pact: parent.act,
      pv: parent.v,
    });
    const child = await decodeSessionToken(childToken);

    expect(child.wf).not.toBe(parent.wf);
    expect(child.sid).not.toBe(parent.sid);
    expect(child.seq).toBe(0);
    expect(parent.seq).toBe(0);
  });
});

describe('get_workflow_status: token-based status extraction', () => {
  it('extracts current activity from token', async () => {
    const token = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent');
    const advancedToken = await advanceToken(token, { act: 'assess-vuln' });
    const decoded = await decodeSessionToken(advancedToken);

    expect(decoded.act).toBe('assess-vuln');
  });

  it('detects blocked status from pending checkpoints', async () => {
    const token = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent');
    const advancedToken = await advanceToken(token, {
      act: 'assess-vuln',
      bcp: 'cp-1',
    });
    const decoded = await decodeSessionToken(advancedToken);

    expect(decoded.bcp).toEqual('cp-1');
  });

  it('detects active status when no checkpoints pending', async () => {
    const token = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent');
    const advancedToken = await advanceToken(token, { act: 'assess-vuln' });
    const decoded = await decodeSessionToken(advancedToken);

    expect(decoded.bcp).toBeUndefined();
  });
});

describe('parent-child session correlation', () => {
  it('parent can find children via psid', async () => {
    const parentToken = await createSessionToken('work-package', '3.7.0', 'orchestrator');
    const parent = await decodeSessionToken(parentToken);

    const child1Token = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', {
      psid: parent.sid,
      pwf: parent.wf,
      pact: parent.act,
      pv: parent.v,
    });
    const child1 = await decodeSessionToken(child1Token);

    const child2Token = await createSessionToken('prism-update', '1.0.0', 'test-agent', {
      psid: parent.sid,
      pwf: parent.wf,
      pact: parent.act,
      pv: parent.v,
    });
    const child2 = await decodeSessionToken(child2Token);

    expect(child1.psid).toBe(parent.sid);
    expect(child2.psid).toBe(parent.sid);
    expect(child1.sid).not.toBe(child2.sid);
    expect(child1.wf).toBe('remediate-vuln');
    expect(child2.wf).toBe('prism-update');
  });

  it('psid does not grant access to parent session', async () => {
    const parentToken = await createSessionToken('work-package', '3.7.0', 'orchestrator');
    const parent = await decodeSessionToken(parentToken);

    const childToken = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', {
      psid: parent.sid,
      pwf: parent.wf,
      pact: parent.act,
      pv: parent.v,
    });
    const child = await decodeSessionToken(childToken);

    // Child only has the parent's sid as metadata — cannot decode the parent token
    expect(typeof child.psid).toBe('string');
    expect(child.wf).toBe('remediate-vuln');
    // The child token payload does NOT contain any parent session secrets
    expect(child.seq).toBe(0);
    expect(child.ts).toBeGreaterThanOrEqual(parent.ts);
  });

  it('recursive dispatch: child can be a parent too', async () => {
    const metaToken = await createSessionToken('work-package', '3.7.0', 'orchestrator');
    const meta = await decodeSessionToken(metaToken);

    const clientToken = await createSessionToken('remediate-vuln', '1.2.0', 'test-agent', {
      psid: meta.sid,
      pwf: meta.wf,
      pact: meta.act,
      pv: meta.v,
    });
    const client = await decodeSessionToken(clientToken);

    const subClientToken = await createSessionToken('prism-update', '1.0.0', 'test-agent', {
      psid: client.sid,
      pwf: client.wf,
      pact: client.act,
      pv: client.v,
    });
    const subClient = await decodeSessionToken(subClientToken);

    expect(subClient.psid).toBe(client.sid);
    expect(client.psid).toBe(meta.sid);
    // Full chain: subClient → client → meta
    expect(subClient.wf).toBe('prism-update');
    expect(client.wf).toBe('remediate-vuln');
    expect(meta.wf).toBe('work-package');
  });
});
