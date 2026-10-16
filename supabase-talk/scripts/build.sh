#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist/src dist/assets/demo-fallback
cp index.html dist/
cp src/*.js src/*.css dist/src/
cp assets/demo-fallback/* dist/assets/demo-fallback/
echo "Built Supabase presentation in dist/"
