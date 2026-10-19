#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist/src dist/assets/demo-fallback dist/system
cp index.html dist/
cp src/*.js src/*.css dist/src/
cp system/*.html system/*.js system/*.css dist/system/
cp assets/demo-fallback/* dist/assets/demo-fallback/
echo "Built Supabase presentation in dist/"
