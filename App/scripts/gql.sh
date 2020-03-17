#!/bin/bash
# Generate types for GraphQL TS
set -e

GQL_PATH="./src/lib/graphql"

rm -f "$GQL_PATH/schema.json"
rm -rf "$GQL_PATH/types"
mkdir -p "$GQL_PATH/types"

SCHEMA=$(curl -X POST -o- -L -H "Content-Type: application/json" \
    --data '{ "query": "{ server { getSchema } }" }' \
    http://localhost:4000)

echo $SCHEMA
echo $SCHEMA | yarn gql2ts -o "$GQL_PATH/types/gql.d.ts" -n OLAPI
