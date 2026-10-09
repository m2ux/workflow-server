import { Client } from '/home/mike1/projects/dev/workflow-server/.worktrees/verify/949-main/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js';
import { StdioClientTransport } from '/home/mike1/projects/dev/workflow-server/.worktrees/verify/949-main/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js';
import { readFileSync, writeFileSync } from 'node:fs';

const [requestPath, outputPath] = process.argv.slice(2);
const request = JSON.parse(readFileSync(requestPath, 'utf8'));
const client = new Client({ name: 'advisory-conformance', version: '1.0.0' });
const transport = new StdioClientTransport({
  command: 'node',
  args: ['/home/mike1/projects/dev/workflow-server/.worktrees/verify/949-main/dist/index.js'],
  env: {
    ...process.env,
    WORKFLOW_WORKSPACE: '/home/mike1/.local/share/workflow-server/projects/workflow-server',
    WORKFLOW_DIR: '/home/mike1/projects/dev/workflow-server/.worktrees/workflow/949-advisory-read',
  },
  stderr: 'inherit',
});
try {
  await client.connect(transport);
  const result = await client.callTool(request);
  writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n');
  for (const content of result.content ?? []) {
    if (content.type === 'text') process.stdout.write(content.text + '\n');
  }
  if (result.isError) process.exitCode = 1;
} finally {
  await client.close();
}
