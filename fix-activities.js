const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = execSync('find /home/mike/projects/dev/workflow-server/.engineering/workflows -type d -name "activities" | xargs -I {} find {} -type f -name "*.toon"').toString().trim().split('\n');

for (const file of files) {
  if (!file) continue;
  
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let newLines = [];
  let inSkills = false;
  let primarySkill = null;
  let supportingSkills = [];
  
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
          supportingSkills.push(lines[j].trim().substring(2));
          j++;
        }
        i = j - 1; // Skip the supporting skills lines
      } else {
         // handle old format where it was an array of skills, or object properties?
      }
    }
  }
  
  if (primarySkill === '11-activity-worker') {
    // Already set, skip
    continue;
  }
  
  // Add old primary to supporting if it exists and is not empty
  if (primarySkill && primarySkill !== '11-activity-worker') {
    if (!supportingSkills.includes(primarySkill)) {
      supportingSkills.push(primarySkill);
    }
  }
  
  // Rebuild file
  inSkills = false;
  let skillsWritten = false;
  
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
      newLines.push(line);
    }
  }
  
  fs.writeFileSync(file, newLines.join('\n'));
  console.log(`Updated ${file}`);
}
