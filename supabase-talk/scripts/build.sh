#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist/src
cp index.html dist/
cp src/*.js src/*.css dist/src/
echo "Built Supabase presentation in dist/"
