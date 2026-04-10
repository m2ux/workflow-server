import { decodeToonRaw } from './dist/utils/toon.js';
import { safeValidateSkill } from './dist/schema/skill.schema.js';
import fs from 'fs';
const content = fs.readFileSync('workflows/meta/skills/12-workflow-orchestrator.toon', 'utf8');
const decoded = decodeToonRaw(content);
const res = safeValidateSkill(decoded);
if (!res.success) {
   console.log(JSON.stringify(res.error.issues, null, 2));
} else {
   console.log("OK");
}
