#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist
# Existing manually configured Render sites may still use this directory.
# Publish the new talk from the old build command so auto-deploy keeps working.
cp ../supabase-talk/index.html dist/
cp -R ../supabase-talk/src dist/
echo "Supabase presentation ready in dist/"
