#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "$0")"

: "${HOST:=127.0.0.1}"
: "${PORT:=3001}"
export HOST PORT

if [[ ! -d node_modules ]]; then
  echo "Dependencies are missing; run npm ci before start.sh." >&2
  exit 1
fi

if [[ ! -f dist/server/server/index.js ]]; then
  echo "Server build is missing; run npm run build:server before start.sh." >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi

if [[ -z "${JWT_SECRET:-}" || ${#JWT_SECRET} -lt 32 ]]; then
  echo "JWT_SECRET must contain at least 32 characters." >&2
  exit 1
fi

exec npm start
