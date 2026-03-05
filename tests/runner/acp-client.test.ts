import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter, Readable, Writable } from 'node:stream';
import readline from 'node:readline';
import { AcpClient } from '../../src/runner/acp-client.js';

function createMockProcess() {
  const stdin = new Writable({
    write(_chunk, _encoding, callback) { callback(); },
  });
  const stdout = new Readable({ read() {} });
  const stderr = new Readable({ read() {} });

  const proc = Object.assign(new EventEmitter(), {
    stdin,
    stdout,
    stderr,
    pid: 12345,
    killed: false,
    kill: vi.fn(() => { (proc as any).killed = true; }),
  });

  return proc;
}

function injectMockProcess(client: AcpClient, mockProc: ReturnType<typeof createMockProcess>) {
  (client as any).process = mockProc;

  const rl = readline.createInterface({ input: mockProc.stdout });
  rl.on('line', (line: string) => (client as any).handleLine(line));

  mockProc.on('close', (code: number | null) => {
    (client as any).rejectAllPending(new Error(`Agent process exited with code ${code}`));
    (client as any).process = null;
    client.emit('close', code);
  });
}

function agentRespond(proc: ReturnType<typeof createMockProcess>, id: number, result: unknown) {
  proc.stdout.push(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function agentRequest(proc: ReturnType<typeof createMockProcess>, id: number, method: string, params: unknown) {
  proc.stdout.push(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
}

function agentNotify(proc: ReturnType<typeof createMockProcess>, method: string, params: unknown) {
  proc.stdout.push(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
}

const tick = () => new Promise((r) => setTimeout(r, 10));

describe('AcpClient', () => {
  let client: AcpClient;
  let proc: ReturnType<typeof createMockProcess>;

  beforeEach(() => {
    client = new AcpClient('agent', 'test-key');
    proc = createMockProcess();
    injectMockProcess(client, proc);
  });

  afterEach(() => {
    client.kill();
  });

  it('should send initialize and resolve on response', async () => {
    const initPromise = client.initialize();
    await tick();
    agentRespond(proc, 1, { protocolVersion: 1, capabilities: {} });
    await expect(initPromise).resolves.toBeUndefined();
  });

  it('should send authenticate and resolve on response', async () => {
    const authPromise = client.authenticate();
    await tick();
    agentRespond(proc, 1, {});
    await expect(authPromise).resolves.toBeUndefined();
  });

  it('should create a session and store sessionId', async () => {
    const sessionPromise = client.createSession('/tmp/test', {});
    await tick();
    agentRespond(proc, 1, { sessionId: 'sess-abc' });

    const sessionId = await sessionPromise;
    expect(sessionId).toBe('sess-abc');
  });

  it('should emit ask_question when agent sends cursor/ask_question', async () => {
    const handler = vi.fn();
    client.on('ask_question', handler);

    agentRequest(proc, 99, 'cursor/ask_question', {
      title: 'Checkpoint',
      questions: [{
        id: 'q1',
        prompt: 'Proceed?',
        options: [{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }],
      }],
    });

    await tick();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]![0]).toBe(99);
    expect(handler.mock.calls[0]![1]).toMatchObject({
      title: 'Checkpoint',
      questions: expect.arrayContaining([
        expect.objectContaining({ id: 'q1' }),
      ]),
    });
  });

  it('should auto-approve session/request_permission when wired', async () => {
    const writeSpy = vi.spyOn(proc.stdin, 'write');

    client.on('request_permission', (requestId) => {
      client.respond(requestId, { outcome: { outcome: 'selected', optionId: 'allow-always' } });
    });

    agentRequest(proc, 42, 'session/request_permission', { tool: 'shell', command: 'git status' });
    await tick();

    const lastCall = writeSpy.mock.calls.find((call) => {
      const str = call[0] as string;
      return str.includes('"id":42');
    });
    expect(lastCall).toBeDefined();
    const parsed = JSON.parse(lastCall![0] as string);
    expect(parsed.result.outcome.optionId).toBe('allow-always');
  });

  it('should emit update on session/update notification', async () => {
    const handler = vi.fn();
    client.on('update', handler);

    agentNotify(proc, 'session/update', {
      update: {
        sessionUpdate: 'agent_message_chunk',
        content: { text: 'Working on it...' },
      },
    });

    await tick();

    expect(handler).toHaveBeenCalledOnce();
    expect(handler.mock.calls[0]![0]).toMatchObject({
      sessionUpdate: 'agent_message_chunk',
      content: { text: 'Working on it...' },
    });
  });

  it('should reject pending promises when process closes', async () => {
    const promise = client.initialize();
    proc.emit('close', 1);

    await expect(promise).rejects.toThrow('exited with code 1');
  });

  it('should respond to agent requests via respond()', () => {
    const writeSpy = vi.spyOn(proc.stdin, 'write');

    client.respond(77, { accepted: true });

    const lastCall = writeSpy.mock.calls.at(-1);
    expect(lastCall).toBeDefined();
    const parsed = JSON.parse(lastCall![0] as string);
    expect(parsed).toMatchObject({ jsonrpc: '2.0', id: 77, result: { accepted: true } });
  });
});
