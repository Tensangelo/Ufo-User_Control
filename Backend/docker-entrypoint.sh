#!/bin/sh
set -eu

attempt=0
until pnpm db:migrate; do
	attempt=$((attempt + 1))
	if [ "$attempt" -ge 15 ]; then
		echo "Migrations failed after ${attempt} attempts"
		exit 1
	fi
	echo "Database is not ready. Retrying migrations (${attempt}/15)..."
	sleep 2
done

pnpm db:seed
pnpm start
