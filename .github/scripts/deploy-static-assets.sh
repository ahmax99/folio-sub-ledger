#!/bin/bash
set -e

if [[ -z "$IMAGE_URI" ]] || [[ -z "$STATIC_ASSETS_BUCKET" ]] || [[ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]] || [[ -z "$AWS_REGION" ]]; then
  echo "❌ Error: Missing required environment variables" >&2
  echo "Required: IMAGE_URI, STATIC_ASSETS_BUCKET, CLOUDFRONT_DISTRIBUTION_ID, AWS_REGION" >&2
  exit 1
fi

echo "📦 Extracting web static assets from Docker image"
echo "Image: $IMAGE_URI"
echo "Bucket: $STATIC_ASSETS_BUCKET"
echo "Distribution: $CLOUDFRONT_DISTRIBUTION_ID"

CONTAINER_NAME="web-extract-$$"

cleanup() {
  docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
}
trap cleanup EXIT

docker create --name "$CONTAINER_NAME" "$IMAGE_URI"
docker cp "$CONTAINER_NAME":/app/apps/web/.output/public web-public

echo "⬆️  Uploading /assets/* (immutable hashed assets)..."
aws s3 sync web-public/assets/ "s3://${STATIC_ASSETS_BUCKET}/assets/" \
  --cache-control "public, max-age=31536000, immutable" \
  --region "$AWS_REGION"

echo "⬆️  Uploading /static/* (public assets)..."
aws s3 sync web-public/ "s3://${STATIC_ASSETS_BUCKET}/static/" --exclude "assets/*" \
  --cache-control "public, max-age=604800" \
  --region "$AWS_REGION"

echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "✅ Static assets deployed successfully!"
echo "✅ CloudFront invalidation created: $INVALIDATION_ID"

if [[ -n "$GITHUB_OUTPUT" ]]; then
  echo "invalidation-id=$INVALIDATION_ID" >> "$GITHUB_OUTPUT"
fi
