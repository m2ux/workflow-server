import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { getOrCreateServerKey, hmacSign, hmacVerify } from './crypto.js';

export interface SessionPayload {
  wf: string;
  act: string;
  skill: string;
  cond: string;
  v: string;
  seq: number;
  ts: number;
  sid: string;
  aid: string;
}

export interface SessionAdvance {
  wf?: string;
  act?: string;
  skill?: string;
  cond?: string;
  aid?: string;
}

async function encode(payload: SessionPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, 'utf8').toString('base64url');
  const key = await getOrCreateServerKey();
  const sig = hmacSign(b64, key);
  return `${b64}.${sig}`;
}

async function decode(token: string): Promise<SessionPayload> {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) throw new Error('Invalid session token: missing signature');

  const b64 = token.substring(0, dotIndex);
  const sig = token.substring(dotIndex + 1);

  const key = await getOrCreateServerKey();
  if (!hmacVerify(b64, sig, key)) {
    throw new Error('Invalid session token: signature verification failed');
  }

  try {
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as Record<string, unknown>;
    if (typeof parsed['wf'] !== 'string' || typeof parsed['act'] !== 'string' ||
        typeof parsed['skill'] !== 'string' || typeof parsed['cond'] !== 'string' ||
        typeof parsed['v'] !== 'string' || typeof parsed['seq'] !== 'number' ||
        typeof parsed['ts'] !== 'number' || typeof parsed['sid'] !== 'string' ||
        typeof parsed['aid'] !== 'string') {
      throw new Error('Missing or invalid token fields');
    }
    return parsed as unknown as SessionPayload;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid session token: ${msg}`);
  }
}

export async function createSessionToken(workflowId: string, workflowVersion: string): Promise<string> {
  return encode({
    wf: workflowId,
    act: '',
    skill: '',
    cond: '',
    v: workflowVersion,
    seq: 0,
    ts: Math.floor(Date.now() / 1000),
    sid: randomUUID(),
    aid: '',
  });
}

export async function decodeSessionToken(token: string): Promise<SessionPayload> {
  return decode(token);
}

export async function advanceToken(token: string, updates?: SessionAdvance): Promise<string> {
  const payload = await decode(token);
  payload.seq += 1;
  if (updates?.wf !== undefined) payload.wf = updates.wf;
  if (updates?.act !== undefined) payload.act = updates.act;
  if (updates?.skill !== undefined) payload.skill = updates.skill;
  if (updates?.cond !== undefined) payload.cond = updates.cond;
  if (updates?.aid !== undefined) payload.aid = updates.aid;
  return encode(payload);
}

export const sessionTokenParam = {
  session_token: z.string()
    .min(1, 'Session token is required')
    .describe('Opaque session token from start_session'),
};
