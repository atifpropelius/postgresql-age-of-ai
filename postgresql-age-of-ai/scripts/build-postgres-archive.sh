#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist
cp index.html dist/
cp -R src exports examples dist/
echo "Archived PostgreSQL presentation ready in dist/"
