# Troubleshooting Guide

## S3 Upload Error: "Failed to upload file to S3"

### Common Causes:

1. **AWS Credentials Not Configured**
   - Error: "AWS S3 credentials not configured"
   - Solution: Set AWS credentials in `.env` file:
     ```env
     AWS_ACCESS_KEY_ID=your_access_key_here
     AWS_SECRET_ACCESS_KEY=your_secret_key_here
     AWS_REGION=eu-north-1
     S3_BUCKET_NAME=bialdesk
     ```

2. **S3 Bucket Doesn't Exist**
   - Error: "NoSuchBucket" or "bucket does not exist"
   - Solution: 
     - Create the bucket in AWS S3 console
     - Or update `S3_BUCKET_NAME` in `.env` to an existing bucket

3. **Invalid AWS Credentials**
   - Error: "CredentialsProviderError" or "AccessDenied"
   - Solution:
     - Verify AWS credentials are correct
     - Check IAM user has S3 upload permissions
     - Ensure credentials have not expired

4. **Network Issues**
   - Error: "ENOTFOUND" or network errors
   - Solution:
     - Check internet connection
     - Verify AWS region is correct
     - Check firewall/proxy settings

### For Local Development (Without S3):

If you don't have AWS S3 set up for local development, you can:

1. **Option 1: Use Local File Storage (Temporary)**
   - Modify `taskRoutes.js` to skip S3 upload for development
   - Store files locally in `uploads/` directory

2. **Option 2: Set Up AWS S3**
   - Create AWS account
   - Create S3 bucket
   - Create IAM user with S3 permissions
   - Add credentials to `.env`

### Testing S3 Connection:

Run this script to test S3 connection:
```bash
cd Admin_panel/backend
node scripts/test-s3-connection.js
```

### Excel File Requirements:

- Format: `.xlsx` or `.xls`
- Required columns:
  - "Student Name" or "Name"
  - "Phone" or "Phone Number" or "Mobile"
- File size limit: 10MB

### Common Excel Parsing Errors:

1. **"Failed to parse Excel file"**
   - Ensure file is a valid Excel file
   - Check file is not corrupted
   - Verify required columns exist

2. **"File buffer is empty"**
   - File upload issue
   - Check file size (max 10MB)
   - Verify file was selected correctly

