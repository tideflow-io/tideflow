# Build site
npm run build

# Sync with s3 bucket
aws s3 sync dist/ s3://<YOUR_S3_BUCKET_NAME> --delete

# Invalidate Cloudfront cache
aws configure set preview.cloudfront true
aws cloudfront create-invalidation --distribution-id <CLOUDFRONT_DISTRIBUTION_ID> --paths '/*'
