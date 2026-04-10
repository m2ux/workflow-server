const fs = require('fs');
const { execSync } = require('child_process');

const filesOutput = execSync('find /home/mike/projects/dev/workflow-server/workflows -type f -name "workflow.toon"').toString().trim();
const files = filesOutput.split('\n').filter(Boolean);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  let newLines = [];
  let inSkills = false;
  let foundObj = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('skills:')) {
      inSkills = true;
      if (foundObj) {
         // skip this duplicate
         let j = i + 1;
         while (j < lines.length && (lines[j].startsWith(' ') || lines[j].startsWith('-'))) {
             j++;
         }
         i = j - 1;
         continue;
      }
      foundObj = true;
      newLines.push(line);
    } else if (line.match(/^skills\[\d+\]:/)) {
       // Old array format
       let j = i + 1;
       while (j < lines.length && (lines[j].startsWith(' ') || lines[j].startsWith('-'))) {
           j++;
       }
       i = j - 1;
       continue;
    } else if (inSkills) {
      if (line.startsWith(' ')) {
        newLines.push(line);
      } else {
        inSkills = false;
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }
  
  fs.writeFileSync(file, newLines.join('\n'));
  console.log(`Fixed ${file}`);
}
