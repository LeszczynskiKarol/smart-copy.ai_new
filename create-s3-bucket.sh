#!/bin/bash

# Skrypt do utworzenia S3 bucket dla źródeł użytkownika Smart-Copy

BUCKET_NAME="smart-copy-user-sources"
REGION="eu-north-1"

echo "🚀 Tworzenie S3 bucket: $BUCKET_NAME w regionie $REGION"

# Utwórz bucket
aws s3api create-bucket \
  --bucket $BUCKET_NAME \
  --region $REGION \
  --create-bucket-configuration LocationConstraint=$REGION

echo "✅ Bucket utworzony"

# Włącz versioning
echo "🔹 Włączanie versioning..."
aws s3api put-bucket-versioning \
  --bucket $BUCKET_NAME \
  --versioning-configuration Status=Enabled

# Włącz encryption
echo "🔹 Włączanie szyfrowania..."
aws s3api put-bucket-encryption \
  --bucket $BUCKET_NAME \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Ustaw lifecycle policy (usuń pliki starsze niż 30 dni)
echo "🔹 Konfiguracja lifecycle policy..."
aws s3api put-bucket-lifecycle-configuration \
  --bucket $BUCKET_NAME \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "DeleteOldFiles",
      "Status": "Enabled",
      "Filter": {"Prefix": "user-sources/"},
      "Expiration": {"Days": 30}
    }]
  }'

# Ustaw CORS (jeśli potrzebny upload z frontendu)
echo "🔹 Konfiguracja CORS..."
aws s3api put-bucket-cors \
  --bucket $BUCKET_NAME \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["https://smart-copy.ai", "http://localhost:3000"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }]
  }'

# Zablokuj publiczny dostęp (bezpieczeństwo)
echo "🔹 Blokowanie publicznego dostępu..."
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "✅ Konfiguracja zakończona!"
echo ""
echo "📋 Bucket details:"
echo "   Nazwa: $BUCKET_NAME"
echo "   Region: $REGION"
echo "   Lifecycle: 30 dni"
echo "   Encryption: AES256"
echo "   Versioning: Włączony"
echo ""
echo "🔐 Dodaj do .env:"
echo "S3_BUCKET_NAME=$BUCKET_NAME"
echo "AWS_REGION=$REGION"