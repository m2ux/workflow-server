import { expect } from 'vitest';
import { parseToolResponse, type Harness, type ToolResult } from './harness.js';
import { parseDefinition } from '../../src/utils/serialization.js';
import type { Activity } from '../../src/schema/activity.schema.js';

/**
 * One activity, opened and fetched through the real server, parsed back out of the payload.
 *
 * What a worker receives is the subject of more than one file, and the sequence that produces it —
 * open a session, enter the activity, fetch it, find the body in the text — is the same wherever
 * that subject is asked about. Held here so a file asserting on delivery states the assertion and
 * not the fetch.
 */

/** Text parts of a tool payload, joined — the form the activity body is embedded in. */
export const payloadText = (result: ToolResult): string =>
  (result.content as Array<{ type: string; text: string }>)
    .filter((part) => part.type === 'text').map((part) => part.text).join('\n');

export interface DeliveredActivity {
  /** The whole payload, for assertions about what is absent from it. */
  text: string;
  /** The activity body, parsed. */
  activity: Activity;
}

export async function deliverActivity(
  harness: Harness,
  workflowId: string,
  activityId: string,
  agentId = 'orchestrator',
): Promise<DeliveredActivity> {
  const session = await harness.client.callTool({
    name: 'start_session',
    arguments: { workflow_id: workflowId, agent_id: agentId },
  });
  expect(session.isError ?? false, `start_session failed: ${payloadText(session as ToolResult)}`).toBe(false);
  const sessionIndex = parseToolResponse(session as ToolResult).session_index as string;

  const opened = await harness.client.callTool({
    name: 'next_activity',
    arguments: { session_index: sessionIndex, activity_id: activityId },
  });
  expect(opened.isError ?? false, `next_activity failed: ${payloadText(opened as ToolResult)}`).toBe(false);

  const payload = await harness.client.callTool({
    name: 'get_activity',
    arguments: { activity_id: activityId, session_index: sessionIndex, context_tokens: 200000 },
  });
  expect(payload.isError ?? false, `get_activity failed: ${payloadText(payload as ToolResult)}`).toBe(false);

  const text = payloadText(payload as ToolResult);
  const body = /^(id: [\s\S]*)$/m.exec(text);
  if (!body) throw new Error(`no activity body in the delivered payload:\n${text.slice(0, 600)}`);
  return { text, activity: parseDefinition(body[1]!) as Activity };
}
