#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
rm -rf dist
mkdir dist
cp index.html dist/
cp -R src exports examples dist/
echo "Static presentation ready in dist/"
