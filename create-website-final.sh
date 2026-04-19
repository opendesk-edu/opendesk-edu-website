#!/bin/bash

# Install uuidgen if not available (Debian)
apt-get update && apt-get install -y uuid-runtime

# Generate UUID for website_id and set created_by to admin user
WEBSITE_ID=$(uuidgen)
ADMIN_ID="41e2b680-648e-4b09-bcd7-3e2b10c06264"

echo "Creating website with ID: $WEBSITE_ID"
echo "Owner: admin ($ADMIN_ID)"

docker exec umami-db psql -U umami -d umami <<SQL
INSERT INTO website (website_id, name, user_id, created_by)
VALUES ('$WEBSITE_ID', 'openDesk Edu', '$ADMIN_ID', '$ADMIN_ID')
RETURNING website_id, name;
SQL

echo ""
echo "Website ID to use in layout.tsx: $WEBSITE_ID"