#!/bin/bash
set -e

SERVER="root@101.37.253.195"
KEY="~/.ssh/wedding-key.pem"
SSH="ssh -i $KEY $SERVER"

echo "Building..."
cd "$(dirname "$0")"
npm run build

# Standalone build nests under project path
STANDALONE=".next/standalone/Documents/wedding"

echo "Uploading standalone server..."
rsync -avz --delete \
  --exclude='.env' \
  --exclude='data.db' --exclude='data.db-wal' --exclude='data.db-shm' \
  --exclude='node_modules/better-sqlite3/build' \
  --exclude='node_modules/better-sqlite3/prebuilds' \
  --exclude='node_modules/sharp' \
  --exclude='node_modules/@img' \
  --exclude='node_modules/semver' \
  --exclude='node_modules/detect-libc' \
  --exclude='node_modules/@emnapi' \
  -e "ssh -i $KEY" \
  "$STANDALONE/" "$SERVER:/var/www/wedding/"

echo "Uploading static assets..."
rsync -avz -e "ssh -i $KEY" .next/static/ "$SERVER:/var/www/wedding/.next/static/"

echo "Ensuring native modules..."
$SSH "cd /var/www/wedding && \
  if [ ! -f node_modules/better-sqlite3/build/Release/better_sqlite3.node ]; then \
    echo 'Installing better-sqlite3...'; \
    rm -rf /tmp/bs3 && mkdir -p /tmp/bs3 && cd /tmp/bs3 && npm init -y > /dev/null 2>&1 && \
    npm install better-sqlite3 2>&1 | tail -3 && \
    cp -r node_modules/better-sqlite3 /var/www/wedding/node_modules/ && \
    rm -rf /tmp/bs3; \
  else \
    echo 'better-sqlite3 native ok'; \
  fi"

$SSH "cd /var/www/wedding && \
  if ! node -e \"require('sharp')\" 2>/dev/null; then \
    echo 'Installing sharp...'; \
    rm -rf /tmp/shp && mkdir -p /tmp/shp && cd /tmp/shp && npm init -y > /dev/null 2>&1 && \
    npm install sharp 2>&1 | tail -3 && \
    for pkg in sharp @img semver detect-libc @emnapi; do \
      cp -r node_modules/\$pkg /var/www/wedding/node_modules/ 2>/dev/null; \
    done && \
    rm -rf /tmp/shp; \
  else \
    echo 'sharp native ok'; \
  fi"

echo "Fixing Turbopack module symlinks..."
$SSH "cd /var/www/wedding/node_modules && \
  for f in \$(grep -rohP '[a-z][a-z0-9-]+-[a-f0-9]{10,}' /var/www/wedding/.next/server/chunks/ 2>/dev/null | sort -u); do \
    base=\$(echo \$f | sed 's/-[a-f0-9]\{10,\}\$//'); \
    [ -d \$base ] && ln -sf \$base \$f && echo \"symlink: \$f -> \$base\"; \
  done; echo 'symlinks done'"

echo "Restarting server..."
$SSH "cd /var/www/wedding && pm2 delete wedding 2>/dev/null; pm2 start server.js --name wedding && pm2 save"

echo ""
echo "Done! https://lilianchen-handan.love"
echo "Admin: https://lilianchen-handan.love/admin"
