import { randomUUID } from 'node:crypto';
import { z } from 'zod';

/**
 * Token format: <workflow-version>_<unix-epoch-seconds>_<8-hex-chars>
 * Example: 3.4.0_1711300000_a3b2c1d4
 */
const SESSION_TOKEN_PATTERN = /^[\d.]+_\d+_[0-9a-f]{8}$/;

export function generateSessionToken(workflowVersion: string): string {
  const epoch = Math.floor(Date.now() / 1000);
  const hex = randomUUID().replace(/-/g, '').substring(0, 8);
  return `${workflowVersion}_${epoch}_${hex}`;
}

export function validateSessionToken(token: string): boolean {
  return SESSION_TOKEN_PATTERN.test(token);
}

export const sessionTokenParam = {
  session_token: z.string()
    .regex(SESSION_TOKEN_PATTERN, 'Invalid session token format')
    .describe('Session token from start_session'),
};
