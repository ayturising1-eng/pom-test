#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

find "$ROOT" -type f -name '*.js' -not -path '*/blocks/filteredBlocks.js' -print0 | sort -z | xargs -0 -n1 node --check
node --check "$ROOT/blocks/filteredBlocks.js"

tsc --noEmit --skipLibCheck --target ES2022 --module ESNext --moduleResolution Bundler \
  --lib ES2022,DOM "$ROOT/tests/deno-test-stubs.d.ts" "$ROOT/supabase/functions/admin-users/index.ts"

node "$ROOT/tests/stage1-edge-delete.test.mjs"
node "$ROOT/tests/stage1-ui-static.test.mjs"
node "$ROOT/tests/stage1-ui-flow.test.mjs"
node "$ROOT/tests/stage1-regression.test.mjs"
