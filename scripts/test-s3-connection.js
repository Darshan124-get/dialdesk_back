import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { AWS_CONFIG } from '../config/aws-config.js';

// Test S3 connection
async function testS3Connection() {
  console.log('Testing S3 connection...');
  console.log('Bucket:', AWS_CONFIG.bucketName);
  console.log('Region:', AWS_CONFIG.region);
  
  try {
    const s3Client = new S3Client({
      region: AWS_CONFIG.region,
      credentials: {
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey
      }
    });

    // Test connection by listing buckets
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('✅ S3 connection successful!');
    console.log('Available buckets:', response.Buckets.map(b => b.Name));
    
    // Check if our target bucket exists
    const targetBucket = response.Buckets.find(b => b.Name === AWS_CONFIG.bucketName);
    if (targetBucket) {
      console.log(`✅ Target bucket '${AWS_CONFIG.bucketName}' found!`);
    } else {
      console.log(`❌ Target bucket '${AWS_CONFIG.bucketName}' not found!`);
    }
    
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    console.error('Please check your AWS credentials and bucket name.');
  }
}

// Run the test
testS3Connection();
