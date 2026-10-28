#!/usr/bin/env bash
# PostToolUse hook: lint a TS/TSX file under src/ right after Claude edits it.
# Exit 2 sends the lint output back to Claude so it fixes the problems.
set -uo pipefail

file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input?.file_path??"")}catch{}})')

case "$file" in
  */src/*.ts|*/src/*.tsx|src/*.ts|src/*.tsx) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
if ! out=$(npx --no-install eslint --no-warn-ignored "$file" 2>&1); then
  echo "ESLint found problems in $file:" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
