#!/bin/bash
# Checks every Bend file of one spike layer and captures the compiler's output.
#
#   cd <this folder> && /home/mike1/projects/dev/workflow-server/scripts/sbx bash run.sh mvw
#
# For each <layer>/*.bend and <layer>/negative/*.bend the script writes
# <layer>/out/<name>.check.txt (the checker, --check-only), and for each
# positive file also <name>.verdict.txt (the Lean-proven kernel, --verdict)
# and <name>.run.txt (check, then normalise main). Each capture ends with the
# exit status and the wall time in seconds. The summary table is printed.
#
# The wrapper /tmp/bend-fidelity/bendc runs the Bend 2 checker from the
# studied source (see README.md). The sandbox launcher keeps every write
# under this folder and /tmp.

layer="$1"
bendc=/tmp/bend-fidelity/bendc
out="$layer/out"
mkdir -p "$out"

capture() {
  # capture <file> <mode> <dest>
  local file="$1" mode="$2" dest="$3"
  local start end status
  start=$(date +%s.%N)
  if [ "$mode" = "run" ]; then
    "$bendc" "$file" > "$dest" 2>&1
  else
    "$bendc" "$file" "$mode" > "$dest" 2>&1
  fi
  status=$?
  end=$(date +%s.%N)
  printf -- '--\nexit %s\nwall %.2f s\n' "$status" "$(echo "$end - $start" | bc)" >> "$dest"
  echo "$status"
}

printf '%-44s %-8s %-8s %-8s\n' "file" "check" "verdict" "run"
for f in "$layer"/*.bend; do
  [ -e "$f" ] || continue
  name=$(basename "$f" .bend)
  c=$(capture "$f" --check-only "$out/$name.check.txt")
  v=$(capture "$f" --verdict "$out/$name.verdict.txt")
  r=$(capture "$f" run "$out/$name.run.txt")
  printf '%-44s %-8s %-8s %-8s\n' "$f" "exit $c" "exit $v" "exit $r"
done
for f in "$layer"/negative/*.bend; do
  [ -e "$f" ] || continue
  name=$(basename "$f" .bend)
  c=$(capture "$f" --check-only "$out/$name.check.txt")
  printf '%-44s %-8s %-8s %-8s\n' "$f" "exit $c" "-" "-"
done
