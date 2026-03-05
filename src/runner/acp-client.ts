import { spawn, type ChildProcess } from 'node:child_process';
import readline from 'node:readline';
import { EventEmitter } from 'node:events';

// ---------------------------------------------------------------------------
// JSON-RPC 2.0 types
// ---------------------------------------------------------------------------

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export interface JsonRpcNotification {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
}

type JsonRpcMessage = JsonRpcRequest | JsonRpcResponse | JsonRpcNotification;

function isResponse(msg: JsonRpcMessage): msg is JsonRpcResponse {
  return 'id' in msg && ('result' in msg || 'error' in msg);
}

function isRequest(msg: JsonRpcMessage): msg is JsonRpcRequest {
  return 'id' in msg && 'method' in msg && !('result' in msg) && !('error' in msg);
}

// ---------------------------------------------------------------------------
// ACP-specific types
// ---------------------------------------------------------------------------

export interface AcpQuestion {
  id: string;
  prompt: string;
  options: Array<{ id: string; label: string }>;
  allow_multiple?: boolean;
}

export interface AcpAskQuestionParams {
  title?: string;
  questions: AcpQuestion[];
}

export interface AcpQuestionResponse {
  questionId: string;
  selectedOptions: string[];
}

export interface AcpSessionUpdate {
  sessionUpdate: string;
  content?: { text?: string };
  [key: string]: unknown;
}

export interface AcpClientEvents {
  ask_question: [requestId: number, params: AcpAskQuestionParams];
  request_permission: [requestId: number, params: Record<string, unknown>];
  update: [update: AcpSessionUpdate];
  create_plan: [requestId: number, params: Record<string, unknown>];
  update_todos: [params: Record<string, unknown>];
  stderr: [text: string];
  error: [error: Error];
  close: [code: number | null];
}

export interface McpServerEntry {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface PromptResult {
  stopReason: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// ACP Client
// ---------------------------------------------------------------------------

const DEFAULT_SEND_TIMEOUT_MS = 60_000;

export class AcpClient extends EventEmitter<AcpClientEvents> {
  private process: ChildProcess | null = null;
  private nextId = 1;
  private pending = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }>();
  private sessionId: string | null = null;

  constructor(
    private readonly agentBinary: string,
    private readonly apiKey: string,
    private readonly defaultTimeoutMs: number = DEFAULT_SEND_TIMEOUT_MS,
  ) {
    super();
  }

  get pid(): number | undefined {
    return this.process?.pid;
  }

  get active(): boolean {
    return this.process !== null && !this.process.killed;
  }

  /**
   * Spawn the `agent acp` process and wire up stdio.
   */
  spawn(cwd: string): void {
    if (this.process) throw new Error('ACP process already running');

    this.process = spawn(this.agentBinary, ['acp'], {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        CURSOR_API_KEY: this.apiKey,
      },
    });

    const rl = readline.createInterface({ input: this.process.stdout! });
    rl.on('line', (line) => this.handleLine(line));

    this.process.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) this.emit('stderr', text);
    });

    this.process.on('close', (code) => {
      this.rejectAllPending(new Error(`Agent process exited with code ${code}`));
      this.process = null;
      this.emit('close', code);
    });

    this.process.on('error', (err) => {
      this.emit('error', err);
    });
  }

  /**
   * Send the ACP initialize handshake.
   */
  async initialize(): Promise<void> {
    await this.send('initialize', {
      protocolVersion: 1,
      clientCapabilities: {
        fs: { readTextFile: false, writeTextFile: false },
        terminal: false,
      },
      clientInfo: { name: 'workflow-runner', version: '0.1.0' },
    });
  }

  /**
   * Authenticate using the pre-configured Cursor API key.
   */
  async authenticate(): Promise<void> {
    await this.send('authenticate', { methodId: 'cursor_login' });
  }

  /**
   * Create a new ACP session.
   * @returns The session ID.
   */
  async createSession(
    cwd: string,
    mcpServers: Record<string, McpServerEntry> = {},
  ): Promise<string> {
    const result = await this.send('session/new', {
      cwd,
      mcpServers: Object.entries(mcpServers).map(([name, cfg]) => ({
        name,
        ...cfg,
      })),
    }) as { sessionId: string };
    this.sessionId = result.sessionId;
    return result.sessionId;
  }

  /**
   * Send a prompt to the agent. This is a long-running call that resolves
   * when the agent finishes processing. During execution, events are emitted
   * for session updates, checkpoints, and permission requests.
   */
  async prompt(text: string): Promise<PromptResult> {
    if (!this.sessionId) throw new Error('No active session');
    return await this.send('session/prompt', {
      sessionId: this.sessionId,
      prompt: [{ type: 'text', text }],
    }, 0) as PromptResult; // 0 = no timeout for long-running prompts
  }

  /**
   * Send a follow-up prompt to the agent.
   */
  async followUp(text: string): Promise<unknown> {
    if (!this.sessionId) throw new Error('No active session');
    return await this.send('session/prompt', {
      sessionId: this.sessionId,
      prompt: [{ type: 'text', text }],
    }, 0); // 0 = no timeout for long-running prompts
  }

  /**
   * Respond to an incoming JSON-RPC request from the agent
   * (e.g. cursor/ask_question, session/request_permission).
   */
  respond(requestId: number, result: unknown): void {
    this.write({ jsonrpc: '2.0', id: requestId, result });
  }

  /**
   * Kill the agent process.
   */
  kill(): void {
    if (this.process && !this.process.killed) {
      this.process.stdin?.end();
      this.process.kill();
    }
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private send(
    method: string,
    params?: Record<string, unknown>,
    timeoutMs: number = this.defaultTimeoutMs,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      let timer: ReturnType<typeof setTimeout> | undefined;

      this.pending.set(id, {
        resolve: (value) => { if (timer) clearTimeout(timer); resolve(value); },
        reject: (err) => { if (timer) clearTimeout(timer); reject(err); },
      });

      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          if (this.pending.has(id)) {
            this.pending.delete(id);
            reject(new Error(
              `RPC request '${method}' (id=${id}) timed out after ${timeoutMs}ms`,
            ));
          }
        }, timeoutMs);
      }

      this.write({ jsonrpc: '2.0', id, method, params });
    });
  }

  private write(msg: Record<string, unknown>): void {
    if (!this.process?.stdin?.writable) {
      throw new Error('Agent stdin not writable');
    }
    this.process.stdin.write(JSON.stringify(msg) + '\n');
  }

  private handleLine(line: string): void {
    let msg: JsonRpcMessage;
    try {
      msg = JSON.parse(line) as JsonRpcMessage;
    } catch {
      return; // ignore non-JSON lines (logs, etc.)
    }

    if (isResponse(msg)) {
      const waiter = this.pending.get(msg.id);
      if (!waiter) return;
      this.pending.delete(msg.id);
      if (msg.error) {
        waiter.reject(new Error(`RPC error ${msg.error.code}: ${msg.error.message}`));
      } else {
        waiter.resolve(msg.result);
      }
      return;
    }

    if (isRequest(msg)) {
      this.routeIncomingRequest(msg);
      return;
    }

    // Notification (no id)
    this.routeNotification(msg as JsonRpcNotification);
  }

  private routeIncomingRequest(req: JsonRpcRequest): void {
    switch (req.method) {
      case 'cursor/ask_question':
        this.emit('ask_question', req.id, req.params as unknown as AcpAskQuestionParams);
        break;
      case 'session/request_permission':
        this.emit('request_permission', req.id, req.params ?? {});
        break;
      case 'cursor/create_plan':
        this.emit('create_plan', req.id, req.params ?? {});
        break;
      default:
        // Auto-accept unknown requests to avoid blocking the agent
        this.respond(req.id, {});
        break;
    }
  }

  private routeNotification(notif: JsonRpcNotification): void {
    switch (notif.method) {
      case 'session/update': {
        const update = (notif.params as { update?: AcpSessionUpdate })?.update;
        if (update) this.emit('update', update);
        break;
      }
      case 'cursor/update_todos':
        this.emit('update_todos', notif.params ?? {});
        break;
      default:
        break;
    }
  }

  private rejectAllPending(error: Error): void {
    for (const [id, waiter] of this.pending) {
      waiter.reject(error);
      this.pending.delete(id);
    }
  }
}
