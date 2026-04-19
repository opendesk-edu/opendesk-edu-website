#!/bin/bash

# Umami admin user ID
ADMIN_ID="41e2b680-648e-4b09-bcd7-3e2b10c06264"

# Create graphwiz.ai website
GRAPHWIZ_ID=$(uuidgen)
echo "Creating graphwiz.ai website with ID: $GRAPHWIZ_ID"

docker exec umami-db psql -U umami -d umami <<SQL
INSERT INTO website (website_id, name, user_id, created_by)
VALUES ('$GRAPHWIZ_ID', 'graphwiz.ai', '$ADMIN_ID', '$ADMIN_ID')
RETURNING website_id, name;
SQL

echo ""
echo "Graphwiz website ID: $GRAPHWIZ_ID"

# Create tobias-weiss.org website
TOBIAS_ID=$(uuidgen)
echo ""
echo "Creating tobias-weiss.org website with ID: $TOBIAS_ID"

docker exec umami-db psql -U umami -d umami <<SQL
INSERT INTO website (website_id, name, user_id, created_by)
VALUES ('$TOBIAS_ID', 'tobias-weiss.org', '$ADMIN_ID', '$ADMIN_ID')
RETURNING website_id, name;
SQL

echo ""
echo "Tobias website ID: $TOBIAS_ID"
echo ""
echo "Both websites created successfully in Umami database."