const fs = require('fs');

const path = '/home/mike/projects/dev/workflow-server/src/tools/resource-tools.ts';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `        if (!skillId) {
          throw new Error(\`Step '\${step_id}' in activity '\${token.act}' has no associated skill.\`);
        }
      }`;

const newStr = `        if (!skillId) {
          throw new Error(\`Step '\${step_id}' in activity '\${token.act}' has no associated skill.\`);
        }
      }
      }`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(path, content);
