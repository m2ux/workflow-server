const { loadWorkflow } = require('./build/src/loaders/workflow-loader.js');
const { z } = require('zod');

async function run() {
  const WORKFLOW_DIR = '/home/mike/projects/dev/workflow-server/.engineering/workflows';
  const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
  if (!result.success) {
     console.error("LOAD ERROR:");
     console.error(result.error);
  } else {
     console.log("LOAD SUCCESS");
  }
}
run();
