#!/usr/bin/env bash
# Stop hook: if this session left uncommitted changes under src/, run the test suite before Claude
# finishes. Exit 2 keeps Claude working with the failures as feedback. stop_hook_active guards against
# looping when the tests still fail after a retry.
set -uo pipefail

active=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).stop_hook_active===true)}catch{console.log(false)}})')
[ "$active" = "true" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -z "$(git status --porcelain -- src 2>/dev/null)" ] && exit 0

if ! out=$(npx --no-install jest --silent 2>&1); then
  echo "Tests fail with the current changes under src/. Fix them before finishing:" >&2
  echo "$out" | tail -60 >&2
  exit 2
fi
exit 0
