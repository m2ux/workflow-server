import { z } from 'zod';

export interface SessionPayload {
  wf: string;
  act: string;
  v: string;
  seq: number;
  ts: number;
}

function encode(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  return Buffer.from(json, 'utf8').toString('base64url');
}

function decode(token: string): SessionPayload {
  try {
    const json = Buffer.from(token, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as Record<string, unknown>;
    if (typeof parsed['wf'] !== 'string' || typeof parsed['act'] !== 'string' ||
        typeof parsed['v'] !== 'string' || typeof parsed['seq'] !== 'number' ||
        typeof parsed['ts'] !== 'number') {
      throw new Error('Missing or invalid token fields');
    }
    return parsed as unknown as SessionPayload;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid session token: ${msg}`);
  }
}

export function createSessionToken(workflowId: string, workflowVersion: string, initialActivity?: string): string {
  return encode({
    wf: workflowId,
    act: initialActivity ?? '',
    v: workflowVersion,
    seq: 0,
    ts: Math.floor(Date.now() / 1000),
  });
}

export function decodeSessionToken(token: string): SessionPayload {
  return decode(token);
}

export function advanceToken(token: string, updates?: { act?: string }): string {
  const payload = decode(token);
  payload.seq += 1;
  if (updates?.act !== undefined) payload.act = updates.act;
  return encode(payload);
}

export const sessionTokenParam = {
  session_token: z.string()
    .min(1, 'Session token is required')
    .describe('Opaque session token from start_session'),
};
