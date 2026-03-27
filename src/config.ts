import { resolve } from 'node:path';
import type { TraceStore } from './trace.js';

export interface ServerConfig {
  workflowDir: string;
  schemasDir: string;
  serverName: string;
  serverVersion: string;
  /** Schema preamble prepended to get_workflow responses. Built at startup. */
  schemaPreamble?: string;
  /** In-process trace store for execution tracing. Created by createServer(). */
  traceStore?: TraceStore;
}

const PROJECT_ROOT = resolve(import.meta.dirname, '..');

export function loadConfig(): ServerConfig {
  return {
    workflowDir: resolve(PROJECT_ROOT, process.env['WORKFLOW_DIR'] ?? './workflows'),
    schemasDir: resolve(PROJECT_ROOT, process.env['SCHEMAS_DIR'] ?? './schemas'),
    serverName: process.env['SERVER_NAME'] ?? 'workflow-server',
    serverVersion: process.env['SERVER_VERSION'] ?? '1.0.0',
  };
}
