const fs = require('fs');
const { execSync } = require('child_process');

const filesOutput = execSync('find /home/mike/projects/dev/workflow-server/.engineering/workflows -type f -name "workflow.toon"').toString().trim();
const files = filesOutput.split('\n').filter(Boolean);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  let newLines = [];
  let inSkills = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/^skills\[\d+\]:/)) {
       // Old array format -> replace with simple array block, OR actually we don't want it at all since we have skills: primary up top!
       // Just delete it
       let j = i + 1;
       while (j < lines.length && (lines[j].startsWith(' ') || lines[j].startsWith('-'))) {
           j++;
       }
       i = j - 1;
       continue;
    } else {
      newLines.push(line);
    }
  }
  
  fs.writeFileSync(file, newLines.join('\n'));
  console.log(`Fixed ${file}`);
}
