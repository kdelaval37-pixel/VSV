#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
container="vsv-sql-${RANDOM}-$$"
upgrade="/tmp/${container}-upgrade.sql"
cleanup(){ rm -f "$upgrade"; docker rm -f "$container" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run --name "$container" -e POSTGRES_HOST_AUTH_METHOD=trust -d postgres:17-alpine >/dev/null
for attempt in {1..40}; do if docker exec "$container" pg_isready -h 127.0.0.1 -U postgres >/dev/null 2>&1; then break; fi; sleep .25; done
# Schéma Auth/Storage minimal pour vérifier les politiques PostgreSQL, sans contacter Supabase.
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/sql/bootstrap.sql
for migration in supabase/migrations/*.sql; do
 if [[ "$migration" < "supabase/migrations/202610230001" ]]; then docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < "$migration"; fi
done
node --input-type=module -e "import {upgradeSql} from './scripts/prepare-global.mjs';process.stdout.write(await upgradeSql());" > "$upgrade"
# Exécution réelle des nouvelles migrations groupées puis nouvelle exécution : aucun rejeu.
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < "$upgrade"
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < "$upgrade"
VSV_SQL_CONTAINER="$container" node tests/sql/bootstrap-admins.mjs
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/sql/access.sql
docker exec -i "$container" psql -U postgres -v ON_ERROR_STOP=1 < tests/sql/hub.sql

VSV_SQL_CONTAINER="$container" node tests/sql/concurrency.mjs
