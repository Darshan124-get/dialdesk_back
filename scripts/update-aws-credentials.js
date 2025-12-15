import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

dotenv.config({ path: envPath });

// Interactive script to update AWS credentials
console.log('🔧 AWS Credentials Update Tool\n');
console.log('Current configuration:');
console.log(`  Bucket: ${process.env.S3_BUCKET_NAME || 'Not set'}`);
console.log(`  Region: ${process.env.AWS_REGION || 'Not set'}`);
console.log(`  Access Key: ${process.env.AWS_ACCESS_KEY_ID ? 'Set (hidden)' : 'Not set'}`);
console.log(`  Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? 'Set (hidden)' : 'Not set'}\n`);

console.log('To update credentials manually, edit the .env file:');
console.log(`  Location: ${envPath}\n`);
console.log('Required variables:');
console.log('  AWS_ACCESS_KEY_ID=your_access_key_here');
console.log('  AWS_SECRET_ACCESS_KEY=your_secret_key_here');
console.log('  AWS_REGION=eu-north-1');
console.log('  S3_BUCKET_NAME=your_bucket_name\n');

console.log('After updating, test the connection with:');
console.log('  node scripts/test-s3-connection.js\n');

