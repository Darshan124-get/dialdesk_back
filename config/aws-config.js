// AWS Configuration
// In production, use environment variables instead of hardcoded values

export const AWS_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-north-1',
  bucketName: process.env.S3_BUCKET_NAME || 'bialdesk'
};

// Security Note: 
// Always use environment variables for AWS credentials in production
// Set these in your deployment environment:
// - AWS_ACCESS_KEY_ID
// - AWS_SECRET_ACCESS_KEY
// - AWS_REGION
// - S3_BUCKET_NAME
