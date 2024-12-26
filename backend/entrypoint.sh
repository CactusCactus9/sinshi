#!/bin/sh

set -e

echo "Waiting for postgres..."

timeout=30
counter=0
while ! nc -z $DB_HOST $DB_PORT; do
    counter=$((counter + 1))
    if [ $counter -gt $timeout ]; then
        echo "Error: Postgres is still not ready after $timeout seconds"
        exit 1
    fi
    echo "Waiting for PostgreSQL to be ready... ($counter seconds)"
    sleep 1
done

echo "PostgreSQL started successfully"

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Start server
echo "Starting Django development server..."
exec python manage.py runserver 0.0.0.0:8000