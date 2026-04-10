import { readSkill } from './dist/loaders/skill-loader.js';
async function run() {
  const result = await readSkill('workflow-orchestrator', './workflows', 'work-package');
  console.log(result.success ? "OK" : result.error);
}
run();
