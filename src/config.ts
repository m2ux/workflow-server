export interface ServerConfig {
  workflowDir: string;
  schemasDir: string;
  serverName: string;
  serverVersion: string;
}

export function loadConfig(): ServerConfig {
  return {
    workflowDir: process.env['WORKFLOW_DIR'] ?? './workflows',
    schemasDir: process.env['SCHEMAS_DIR'] ?? './schemas',
    serverName: process.env['SERVER_NAME'] ?? 'workflow-server',
    serverVersion: process.env['SERVER_VERSION'] ?? '1.0.0',
  };
}
