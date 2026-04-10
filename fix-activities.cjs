const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filesOutput = execSync('find /home/mike/projects/dev/workflow-server/.engineering/workflows -type d -name "activities" | xargs -I {} find {} -type f -name "*.toon"').toString().trim();
const files = filesOutput.split('\n').filter(Boolean);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  let newLines = [];
  let inSkills = false;
  let primarySkill = null;
  let supportingSkills = [];
  let skillsWritten = false;
  
  // First pass: extract skills info
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === 'skills:') {
      inSkills = true;
      continue;
    }
    
    if (inSkills) {
      if (!line.startsWith(' ')) {
        inSkills = false;
      } else if (line.startsWith('  primary:')) {
        primarySkill = line.split('primary:')[1].trim();
      } else if (line.startsWith('  supporting:')) {
        // Collect supporting skills
        let j = i + 1;
        while (j < lines.length && lines[j].startsWith('    -')) {
          supportingSkills.push(lines[j].split('-')[1].trim());
          j++;
        }
        i = j - 1; // Skip the supporting skills lines
      }
    }
  }
  
  if (primarySkill === '11-activity-worker') {
    continue;
  }
  
  if (primarySkill && primarySkill !== '11-activity-worker') {
    if (!supportingSkills.includes(primarySkill)) {
      supportingSkills.push(primarySkill);
    }
  }
  
  // Rebuild file
  inSkills = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === 'skills:') {
      inSkills = true;
      newLines.push(line);
      newLines.push('  primary: 11-activity-worker');
      
      if (supportingSkills.length > 0) {
        newLines.push('  supporting:');
        for (const skill of supportingSkills) {
          newLines.push(`    - ${skill}`);
        }
      }
      skillsWritten = true;
      
      // Skip the rest of the old skills block
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith(' ')) {
        j++;
      }
      i = j - 1;
    } else {
      // If we are passing by a top-level property and haven't seen skills, but we need to inject it?
      // Activities all have skills by schema, but let's be safe.
      if (!skillsWritten && inSkills && !line.startsWith(' ')) {
          inSkills = false;
      }
      newLines.push(line);
    }
  }
  
  // If the file didn't have a skills block, add it before steps: or variables:
  if (!skillsWritten) {
     let inserted = false;
     let finalLines = [];
     for (let i = 0; i < newLines.length; i++) {
        if (!inserted && (newLines[i].startsWith('variables') || newLines[i].startsWith('steps') || newLines[i].startsWith('rules'))) {
           finalLines.push('skills:');
           finalLines.push('  primary: 11-activity-worker');
           inserted = true;
        }
        finalLines.push(newLines[i]);
     }
     if (!inserted) {
         finalLines.push('skills:');
         finalLines.push('  primary: 11-activity-worker');
     }
     newLines = finalLines;
  }
  
  fs.writeFileSync(file, newLines.join('\n'));
  console.log(`Updated ${file}`);
}
