#!/usr/bin/env bash
# Captures the hero as the 1200x630 social preview image, one per locale, into static/.
# Needs Chrome (override the binary with CHROME=...). Rebuild afterwards to ship the new images.
set -euo pipefail
cd "$(dirname "$0")/.."

port=4173
chrome=${CHROME:-google-chrome}
profile=$(mktemp -d)

npm run build
node_modules/.bin/vite preview --port "$port" --strictPort >/dev/null &
server=$!
trap 'kill "$server"; rm -rf "$profile"' EXIT
until curl -s -o /dev/null "http://localhost:$port/"; do sleep 0.3; done

for locale in en fr; do
	path=$([ "$locale" = en ] && echo "" || echo "$locale/")
	"$chrome" --headless=new --disable-gpu --hide-scrollbars --no-first-run --disable-extensions \
		--user-data-dir="$profile" --window-size=1200,630 --virtual-time-budget=5000 \
		--screenshot="static/og-$locale.png" "http://localhost:$port/$path" 2>/dev/null
done
