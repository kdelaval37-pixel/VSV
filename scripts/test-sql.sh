#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
container="vsv-sql-${RANDOM}-$$"
cleanup(){ docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run --name "$container" -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:17-alpine >/dev/null
for attempt in {1..40}; do if docker exec "$container" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then break; fi; sleep .25; done
# Schéma Auth/Storage minimal pour vérifier les politiques PostgreSQL, sans contacter Supabase.
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/sql/bootstrap.sql
for migration in supabase/migrations/*.sql; do
 docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < "$migration"
done
VSV_SQL_CONTAINER="$container" node tests/sql/bootstrap-admins.mjs
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/sql/access.sql

VSV_SQL_CONTAINER="$container" node tests/sql/concurrency.mjs
