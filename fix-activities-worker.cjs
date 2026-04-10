const fs = require('fs');
const { execSync } = require('child_process');

const filesOutput = execSync('find /home/mike/projects/dev/workflow-server/.engineering/workflows -type f -name "*.toon"').toString().trim();
const files = filesOutput.split('\n').filter(Boolean);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('skills:\n  primary: 11-activity-worker')) {
      content = content.replace('skills:\n  primary: 11-activity-worker', 'skills:\n  primary: activity-worker');
      fs.writeFileSync(file, content);
      console.log('Fixed worker', file);
  }
}
