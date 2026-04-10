#!/bin/bash
for file in $(find /home/mike/projects/dev/workflow-server/.engineering/workflows -type d -name "activities" | xargs -I {} find {} -type f -name "*.toon"); do
  # Check if primary exists
  if grep -q "^  primary:" "$file"; then
    # We have a primary skill. Need to move it to supporting if it's not 11-activity-worker
    current_primary=$(grep "^  primary:" "$file" | sed 's/.*primary: *//')
    
    if [ "$current_primary" != "11-activity-worker" ]; then
      # Need to modify the file
      awk -v old_prim="$current_primary" '
        BEGIN { in_skills = 0; has_supporting = 0; skills_found = 0 }
        /^skills:/ { in_skills = 1; skills_found = 1; print; print "  primary: 11-activity-worker"; next }
        in_skills && /^  primary:/ { next }
        in_skills && /^  supporting:/ { 
          has_supporting = 1; 
          print; 
          # Ensure old primary is added to supporting if it has a list
          # We wait to see if it is an array or object
          next 
        }
        in_skills && has_supporting && /^    -/ {
          print; next
        }
        in_skills && !has_supporting && /^[^ ]/ {
          # End of skills, and no supporting found yet
          print "  supporting:";
          print "    - " old_prim;
          in_skills = 0;
          print;
          next
        }
        in_skills && has_supporting && /^[^ ]/ {
          # End of skills, supporting existed, need to add to it if we did not already
          # Simplified: just append to the end of supporting array if it was there
          in_skills = 0;
          print;
          next
        }
        1
      ' "$file" > "$file.tmp"
      # This awk script is too complex and brittle. Let's use a node script.
    fi
  else
    # No primary, just add it after skills:
    sed -i 's/^skills:/skills:\n  primary: 11-activity-worker/' "$file"
  fi
done
