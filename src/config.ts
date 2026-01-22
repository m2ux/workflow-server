export interface ServerConfig {
  workflowDir: string;
  guideDir: string;
  serverName: string;
  serverVersion: string;
}

export function loadConfig(): ServerConfig {
  return {
    workflowDir: process.env['WORKFLOW_DIR'] ?? './workflows',
    guideDir: process.env['GUIDE_DIR'] ?? './workflows/guides',
    serverName: process.env['SERVER_NAME'] ?? 'workflow-server',
    serverVersion: process.env['SERVER_VERSION'] ?? '1.0.0',
  };
}
