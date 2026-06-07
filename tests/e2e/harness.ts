/**
 * Shared in-memory MCP harness for end-to-end workflow walks.
 *
 * Spins up the real workflow-server over an in-memory transport against a
 * throwaway workspace directory, exactly as the integration suite does. The
 * walker drives this client so every assertion exercises the genuine server
 * path (loaders, condition evaluation, session persistence) — there is no
 * mock of the workflow machinery.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../src/server.js';
import { resolve, join } from 'node:path';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { decode } from '@toon-format/toon';

export interface Harness {
  client: Client;
  workspaceDir: string;
  close(): Promise<void>;
}

export interface HarnessOptions {
  /** Use a specific workspace dir (e.g. a sandbox shared with a worker process) instead of a fresh temp. */
  workspaceDir?: string;
}

/** Create a connected client + server pair backed by a workspace (fresh temp by default). */
export async function createHarness(opts: HarnessOptions = {}): Promise<Harness> {
  const workspaceDir = opts.workspaceDir ?? mkdtempSync(join(tmpdir(), 'wf-e2e-'));
  const config = {
    workflowDir: resolve(import.meta.dirname, '../../workflows'),
    schemasDir: resolve(import.meta.dirname, '../../schemas'),
    workspaceDir,
    serverName: 'e2e-workflow-server',
    serverVersion: '1.0.0',
    minCheckpointResponseSeconds: 0,
  };

  const server = createServer(config);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);

  const client = new Client({ name: 'e2e-client', version: '1.0.0' }, {});
  await client.connect(clientTransport);

  return {
    client,
    workspaceDir,
    async close() {
      await client.close();
      await server.close();
      // Only clean up workspaces we created; caller-supplied sandboxes are theirs to keep/remove.
      if (!opts.workspaceDir) {
        try { rmSync(workspaceDir, { recursive: true, force: true }); } catch { /* ignore */ }
      }
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolResult = any;

/**
 * Parse a tool response into a plain object. Mirrors the integration suite's
 * parser: tries JSON, then TOON, then a header + TOON-body split.
 */
export function parseToolResponse(result: ToolResult): Record<string, unknown> {
  const text = (result.content[0] as { type: 'text'; text: string }).text;
  try { return JSON.parse(text); } catch { /* not JSON */ }
  try { return decode(text) as Record<string, unknown>; } catch { /* not pure TOON */ }
  const splitIdx = text.indexOf('\n\n');
  if (splitIdx > 0) {
    const header = text.substring(0, splitIdx);
    const body = text.substring(splitIdx + 2);
    const meta: Record<string, string> = {};
    for (const line of header.split('\n')) {
      const colonIdx = line.indexOf(': ');
      if (colonIdx > 0) meta[line.substring(0, colonIdx)] = line.substring(colonIdx + 2);
    }
    try { return { ...meta, ...(decode(body) as Record<string, unknown>) }; } catch { /* body not TOON */ }
    return { ...meta, _body: body };
  }
  return { _raw: text };
}

/**
 * Parse a get_workflow / get_activity response. These prepend a resolved
 * technique/operations bundle separated by a `\n\n---\n\n` marker from the
 * definition body; we return the definition portion.
 */
export function parseWorkflowResponse(result: ToolResult): Record<string, unknown> {
  const text = (result.content[0] as { type: 'text'; text: string }).text;
  const sepIdx = text.indexOf('\n\n---\n\n');
  const body = sepIdx >= 0 ? text.substring(sepIdx + 5) : text;
  try { return JSON.parse(body); } catch { /* not JSON */ }
  try { return decode(body) as Record<string, unknown>; } catch { /* not pure TOON */ }
  return parseToolResponse({ content: [{ type: 'text' as const, text: body }] });
}

/** The full raw text of a tool response (used by the definition lint). */
export function rawText(result: ToolResult): string {
  return (result.content[0] as { type: 'text'; text: string }).text;
}

/**
 * Extract the resolved-operations bundle that get_activity / get_workflow
 * prepend before the `\n\n---\n\n` separator. Returns {} when no bundle is
 * present. The bundle shape is { operations?, rules?, errors?, unresolved? };
 * a non-empty `unresolved` array means the activity references operations that
 * the technique loader could not resolve (a dangling ref).
 */
export function parseBundle(result: ToolResult): Record<string, unknown> {
  const text = rawText(result);
  const sepIdx = text.indexOf('\n\n---\n\n');
  if (sepIdx < 0) return {};
  const head = text.substring(0, sepIdx);
  try { return JSON.parse(head); } catch { /* not JSON */ }
  try { return decode(head) as Record<string, unknown>; } catch { /* not TOON */ }
  return {};
}

export function isError(result: ToolResult): boolean {
  return Boolean(result.isError);
}
