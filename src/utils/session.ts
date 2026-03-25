import { z } from 'zod';

export interface SessionPayload {
  wf: string;
  act: string;
  skill: string;
  v: string;
  seq: number;
  ts: number;
}

export interface SessionAdvance {
  wf?: string;
  act?: string;
  skill?: string;
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
        typeof parsed['skill'] !== 'string' || typeof parsed['v'] !== 'string' ||
        typeof parsed['seq'] !== 'number' || typeof parsed['ts'] !== 'number') {
      throw new Error('Missing or invalid token fields');
    }
    return parsed as unknown as SessionPayload;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid session token: ${msg}`);
  }
}

export function createSessionToken(workflowId: string, workflowVersion: string): string {
  return encode({
    wf: workflowId,
    act: '',
    skill: '',
    v: workflowVersion,
    seq: 0,
    ts: Math.floor(Date.now() / 1000),
  });
}

export function decodeSessionToken(token: string): SessionPayload {
  return decode(token);
}

export function advanceToken(token: string, updates?: SessionAdvance): string {
  const payload = decode(token);
  payload.seq += 1;
  if (updates?.wf !== undefined) payload.wf = updates.wf;
  if (updates?.act !== undefined) payload.act = updates.act;
  if (updates?.skill !== undefined) payload.skill = updates.skill;
  return encode(payload);
}

export const sessionTokenParam = {
  session_token: z.string()
    .min(1, 'Session token is required')
    .describe('Opaque session token from start_session'),
};
