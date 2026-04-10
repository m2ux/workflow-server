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
  bcp?: string | undefined;
  psid?: string | undefined;
}

export interface SessionAdvance {
  wf?: string;
  act?: string;
  skill?: string;
  cond?: string;
  aid?: string;
  bcp?: string | null; // using null to allow clearing the optional field
  psid?: string;
}

async function encode(payload: SessionPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json, 'utf8').toString('base64url');
  const key = await getOrCreateServerKey();
  const sig = hmacSign(b64, key);
  return `${b64}.${sig}`;
}

const SessionPayloadSchema = z.object({
  wf: z.string(),
  act: z.string(),
  skill: z.string(),
  cond: z.string(),
  v: z.string(),
  seq: z.number(),
  ts: z.number(),
  sid: z.string(),
  aid: z.string(),
  bcp: z.string().optional(),
  psid: z.string().optional(),
});

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
    const parsed = JSON.parse(json);
    const result = SessionPayloadSchema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new Error(`Missing or invalid token fields: ${issues}`);
    }
    return result.data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid session token: ${msg}`);
  }
}

export async function createSessionToken(workflowId: string, workflowVersion: string, agentId: string, parentSid?: string): Promise<string> {
  const payload: SessionPayload = {
    wf: workflowId,
    act: '',
    skill: '',
    cond: '',
    v: workflowVersion,
    seq: 0,
    ts: Math.floor(Date.now() / 1000),
    sid: randomUUID(),
    aid: agentId,
  };
  if (parentSid !== undefined) {
    payload.psid = parentSid;
  }
  return encode(payload);
}

export async function decodeSessionToken(token: string): Promise<SessionPayload> {
  return decode(token);
}

export async function advanceToken(token: string, updates?: SessionAdvance, decoded?: SessionPayload): Promise<string> {
  const payload = decoded ?? await decode(token);
  const advanced: SessionPayload = {
    ...payload,
    seq: payload.seq + 1,
    ts: Math.floor(Date.now() / 1000),
    ...(updates?.wf !== undefined && { wf: updates.wf }),
    ...(updates?.act !== undefined && { act: updates.act }),
    ...(updates?.skill !== undefined && { skill: updates.skill }),
    ...(updates?.cond !== undefined && { cond: updates.cond }),
    ...(updates?.aid !== undefined && { aid: updates.aid }),
    ...(updates?.bcp !== undefined && { bcp: updates.bcp === null ? undefined : updates.bcp }),
    ...(updates?.psid !== undefined && { psid: updates.psid }),
  };
  return encode(advanced);
}

export const sessionTokenParam = {
  session_token: z.string()
    .min(1, 'Session token is required')
    .describe('REQUIRED. The session token string returned by start_session (or the updated token from the previous tool response). Every tool call after start_session must include this parameter.'),
};

/**
 * Throws if the token has an active blocking checkpoint.
 * Call this in every tool handler that accepts session_token,
 * EXCEPT present_checkpoint (the resolution mechanism) and
 * respond_checkpoint.
 */
export function assertCheckpointsResolved(token: SessionPayload): void {
  if (token.bcp) {
    throw new Error(
      `Blocked: Active checkpoint '${token.bcp}' on activity '${token.act}'. ` +
      `All tools are gated until the checkpoint is resolved.`
    );
  }
}
