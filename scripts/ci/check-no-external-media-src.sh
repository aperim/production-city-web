#!/usr/bin/env bash
# CI lint rule: Fail if any frontend/component code references external image
# domains in src attributes or image URLs.
#
# This script detects accidental hotlinking to external image CDNs.
# The only acceptable use of external domains is in:
# - downloadUrl fields (provenance only, never rendered as src)
# - Test fixtures and mock data
# - Sidecar .meta.json files (source metadata)
# - This script itself
#
# Usage: bash scripts/ci/check-no-external-media-src.sh

set -euo pipefail

EXTERNAL_DOMAINS=(
  "images.pexels.com"
  "images.unsplash.com"
  "cdn.pixabay.com"
  "storage.googleapis.com"
  "cloudinary.com"
  "imgix.net"
  "res.cloudinary.com"
)

# Files to scan: frontend components, pages, CSS, and config
SCAN_PATHS=(
  "apps/web/app"
  "packages/ui/src"
)

# Exclude patterns: test files, meta.json, stories (may reference external for mocking)
EXCLUDE_PATTERNS=(
  "__tests__"
  ".test."
  ".spec."
  ".stories."
  ".meta.json"
  "check-no-external-media-src"
)

FAILURES=0

for domain in "${EXTERNAL_DOMAINS[@]}"; do
  for scan_path in "${SCAN_PATHS[@]}"; do
    if [ ! -d "$scan_path" ]; then
      continue
    fi

    # Build grep exclude args
    GREP_EXCLUDES=""
    for pattern in "${EXCLUDE_PATTERNS[@]}"; do
      GREP_EXCLUDES="$GREP_EXCLUDES --exclude=*${pattern}*"
    done

    # Search for the domain in source files
    # shellcheck disable=SC2086
    matches=$(grep -rn $GREP_EXCLUDES "$domain" "$scan_path" 2>/dev/null || true)

    if [ -n "$matches" ]; then
      echo "ERROR: External image domain '$domain' found in source code:"
      echo "$matches"
      echo ""
      FAILURES=$((FAILURES + 1))
    fi
  done
done

if [ "$FAILURES" -gt 0 ]; then
  echo "FAIL: Found $FAILURES external image domain reference(s) in frontend code."
  echo "All media must use local paths (/media/...) served from the project."
  echo "External URLs are only acceptable in downloadUrl (provenance) and test fixtures."
  exit 1
fi

echo "PASS: No external image domain references found in frontend source code."
exit 0
