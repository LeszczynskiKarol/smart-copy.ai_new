#!/bin/bash

BUCKET_NAME="smart-copy-user-sources"
REGION="eu-north-1"

echo "🔹 Aktualizacja lifecycle policy na 24h..."
aws s3api put-bucket-lifecycle-configuration \
  --bucket $BUCKET_NAME \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "DeleteOldFiles",
      "Status": "Enabled",
      "Filter": {"Prefix": "user-sources/"},
      "Expiration": {"Days": 1},
      "NoncurrentVersionExpiration": {"NoncurrentDays": 1}
    }]
  }'

echo "✅ Pliki będą usuwane po 24h!"