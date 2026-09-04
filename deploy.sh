#!/bin/sh
# Publish the current prototype/ to GitHub Pages.
set -e
cd "$(dirname "$0")"
git branch -D gh-pages 2>/dev/null || true
git subtree split --prefix prototype -b gh-pages -q
git push -f origin gh-pages
echo "Deployed: https://imsaurabhg99.github.io/Sikkim_Tourism/"
