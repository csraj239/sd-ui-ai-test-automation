#!/bin/bash
# Wait for PostgreSQL to be ready

set -e

host="$1"
shift
cmd="$@"

RETRY_TIME=0
MAX_RETRIES=60

echo "Waiting for PostgreSQL at $host:5432..."

# Wait for the specific database to be accessible
while [ $RETRY_TIME -lt $MAX_RETRIES ]; do
  if PGPASSWORD=password psql -h "$host" -U sa -d sd_test_automation_db -c "SELECT 1" >/dev/null 2>&1; then
    echo "PostgreSQL database is ready!"
    exec $cmd
  fi
  
  RETRY_TIME=$(($RETRY_TIME + 1))
  echo "Database not ready (attempt $RETRY_TIME/$MAX_RETRIES), waiting..."
  sleep 1
done

echo "PostgreSQL database could not be reached after $MAX_RETRIES attempts"
exit 1
