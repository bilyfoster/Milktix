#!/bin/bash
# Auto-update version.ts - Edit VERSION variable below for releases

VERSION_FILE="frontend/src/version.ts"

# Set release version here:
VERSION="1.1.1"

# Get short commit hash
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Get current date
BUILD_DATE=$(date +%Y-%m-%d)

# Write version file
cat > "$VERSION_FILE" << VERSIONEOF
// Auto-generated version file
// Generated: $(date)
// Change VERSION in update-version.sh for releases

export const VERSION = '${VERSION}';
export const BUILD_DATE = '${BUILD_DATE}';
export const GIT_COMMIT = '${COMMIT_HASH}';

export const getVersionString = () => {
  return \`v\${VERSION} (\${BUILD_DATE})\`;
};
VERSIONEOF

echo "✅ Version updated to ${VERSION} (${COMMIT_HASH})"
