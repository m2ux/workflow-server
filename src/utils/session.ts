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
  if (dotIndex === -1) {
    throw new Error(
      'Invalid session token: the token is malformed (missing signature segment). ' +
      'A valid session token must contain a "." separator between the payload and HMAC signature. ' +
      'This usually means the token was truncated, corrupted, or the value passed is not a session token at all. ' +
      'To resolve this, call start_session to obtain a fresh session token, then use the returned token for all subsequent tool calls.'
    );
  }

  const b64 = token.substring(0, dotIndex);
  const sig = token.substring(dotIndex + 1);

  const key = await getOrCreateServerKey();
  if (!hmacVerify(b64, sig, key)) {
    throw new Error(
      'Invalid session token: HMAC signature verification failed. ' +
      'The token was either signed by a different server instance (e.g., the server was restarted and generated a new signing key), ' +
      'or the token has been tampered with, or you are using a stale token from a previous session. ' +
      'To resolve this, call start_session to obtain a fresh session token, then use the returned token for all subsequent tool calls. ' +
      'If you are passing a checkpoint_handle (from yield_checkpoint), you must re-yield the checkpoint first to get a valid handle.'
    );
  }

  try {
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    const parsed = JSON.parse(json);
    const result = SessionPayloadSchema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new Error(
        `Invalid session token: payload is missing required fields (${issues}). ` +
        `The token signature is valid but the embedded data is incomplete or corrupt. ` +
        `To resolve this, call start_session to obtain a fresh session token, then use the returned token for all subsequent tool calls.`
      );
    }
    return result.data;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Invalid session token: failed to decode payload (${msg}). ` +
      `The token signature is valid but the payload could not be parsed. ` +
      `To resolve this, call start_session to obtain a fresh session token, then use the returned token for all subsequent tool calls.`
    );
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

/**
 * Decode and validate the token payload WITHOUT verifying the HMAC signature.
 * Used by start_session to attempt session adoption when the HMAC key has changed
 * (e.g., server restart) but the payload is structurally intact.
 *
 * Returns the decoded payload if valid, or null if the payload is corrupted/malformed.
 */
export async function decodePayloadOnly(token: string): Promise<SessionPayload | null> {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) {
    return null;
  }

  const b64 = token.substring(0, dotIndex);

  try {
    const json = Buffer.from(b64, 'base64url').toString('utf8');
    const parsed = JSON.parse(json);
    const result = SessionPayloadSchema.safeParse(parsed);
    if (!result.success) {
      return null;
    }
    return result.data;
  } catch {
    return null;
  }
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
 * Throws if the token has an active checkpoint.
 * Call this in every tool handler that accepts session_token,
 * EXCEPT present_checkpoint (the resolution mechanism) and
 * respond_checkpoint.
 */
export function assertCheckpointsResolved(token: SessionPayload): void {
  if (token.bcp) {
    throw new Error(
      `Blocked: Active checkpoint '${token.bcp}' on activity '${token.act}'. ` +
      `All tools are gated until the checkpoint is resolved. ` +
      `The orchestrator must call respond_checkpoint with the checkpoint_handle to clear the gate before any other tool calls can proceed.`
    );
  }
}
