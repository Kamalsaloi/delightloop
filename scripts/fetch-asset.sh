#!/usr/bin/env bash
# Usage: scripts/fetch-asset.sh <PAPER_ASSET_ID> [...]
# Downloads a Paper file-asset and stores it as public/assets/<ID>.jpg (max 640px).
set -euo pipefail
cd "$(dirname "$0")/../public/assets"
for id in "$@"; do
  id="${id%.png}"
  [ -f "$id.jpg" ] && continue
  curl -sf --max-time 30 -o "$id.png" "https://app.paper.design/file-assets/01M57HTQF0XHMEMCEG0V6NBWFA/$id.png" || { echo "FAIL $id"; continue; }
  sips -s format jpeg -s formatOptions 82 -Z 640 "$id.png" --out "$id.jpg" >/dev/null && rm "$id.png"
  echo "ok $id"
done
