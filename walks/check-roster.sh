#!/usr/bin/env bash
# Every workflow.yaml under corpus/ is named in walks/roster.json, once, and the
# file names nothing the tree does not hold. Grouping folders organise the tree
# and name nothing; a nested definition is still a workflow.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
roster="$root/walks/roster.json"
corpus="$root/corpus"

if ! command -v jq >/dev/null; then
  echo "jq is required to read walks/roster.json" >&2
  exit 2
fi

if [[ ! -f $roster ]]; then
  echo "missing $roster" >&2
  exit 1
fi

if [[ ! -d $corpus ]]; then
  echo "missing $corpus" >&2
  exit 1
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

: > "$tmp/products"
while IFS= read -r -d '' file; do
  basename "$(dirname "$file")"
done < <(find "$corpus" \( -name workflow.yaml -o -name workflow.yml \) -print0) \
  | sort -u > "$tmp/products"

if ! jq -e '(.walked | type == "array") and (.notWalked | type == "array")' "$roster" >/dev/null; then
  echo "$roster must have walked and notWalked arrays" >&2
  exit 1
fi

if ! jq -e 'all(.walked[]; type == "string" and . != "")' "$roster" >/dev/null; then
  echo "each walked entry must be a non-empty string" >&2
  exit 1
fi

if ! jq -e 'all(.notWalked[]; type == "object" and (.id | type == "string" and . != "") and (.reason | type == "string" and . != ""))' "$roster" >/dev/null; then
  echo "each notWalked entry needs a non-empty id and reason" >&2
  exit 1
fi

jq -r '.walked[]' "$roster" | sort > "$tmp/walked"
jq -r '.notWalked[].id' "$roster" | sort > "$tmp/not"
sort "$tmp/walked" "$tmp/not" > "$tmp/accounted"

dupes=$(uniq -d "$tmp/accounted" || true)
if [[ -n $dupes ]]; then
  echo "a product is named more than once in the roster:" >&2
  echo "$dupes" >&2
  exit 1
fi

if [[ ! -s $tmp/products ]]; then
  echo "corpus/ holds no product" >&2
  exit 1
fi

missing=$(comm -23 "$tmp/products" "$tmp/accounted")
extra=$(comm -13 "$tmp/products" "$tmp/accounted")
fail=0
if [[ -n $missing ]]; then
  echo "this product is in the corpus but neither walked nor listed as not walked, so nothing measures its options. Add it to walks/roster.json walked, or to notWalked with the reason:" >&2
  echo "$missing" >&2
  fail=1
fi
if [[ -n $extra ]]; then
  echo "this product is named in the roster but is not in the corpus — remove it:" >&2
  echo "$extra" >&2
  fail=1
fi
exit "$fail"
