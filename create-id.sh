#!/bin/bash
# Generate a 15-character alphanumeric ID similar to Umami format
generate_site_id() {
  local chars="abcdefghijklmnopqrstuvwxyz0123456789"
  local result=""
  for i in {1..15}; do
    result="${result}${chars:$((RANDOM % 36)):1}"
  done
  echo "$result"
}

WEBSITE_ID=$(generate_site_id)
echo "Generated website_id: $WEBSITE_ID"
docker exec umami-db psql -U umami -d umami -c "INSERT INTO website (website_id, name) VALUES ('$WEBSITE_ID', 'openDesk Edu') RETURNING website_id, name;"