const { createClient } = require('./dist/mcp-server.js');
const { startSession } = require('./dist/tools/workflow-tools.js');
const { get_skill } = require('./dist/tools/resource-tools.js');

async function debug() {
  const result = await startSession('work-package');
  console.log(result);
}
// This is actually too hard to set up just for debugging, but let's just log the error message
