# AWS S3 Setup Guide

## Current Status
❌ **AWS Credentials are INVALID** - The current credentials in `.env` are not working.

## What's Fixed
✅ **S3 Upload is now REQUIRED** (removed local fallback)
✅ **Excel files will be stored in S3 bucket**
✅ **Metadata stored in MongoDB** (Task, Excel, Contact records)
✅ **Messages stored in MongoDB** (visible to assigned teachers)
✅ **Error handling improved** (better JSON parsing, clearer error messages)

## What You Need to Do

### Step 1: Create S3 Bucket
1. Go to AWS Console → S3
2. Create a new bucket with these settings:
   - **Bucket name**: (choose a unique name, e.g., `dialdesk-excel-files`)
   - **Region**: `eu-north-1` (or your preferred region)
   - **Block Public Access**: Keep enabled (we'll use IAM for access)
   - **Versioning**: Optional
   - **Encryption**: Recommended (SSE-S3 or SSE-KMS)

### Step 2: Create IAM User with S3 Permissions
1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. User name: `dialdesk-s3-uploader` (or any name)
4. **Access type**: Programmatic access
5. **Permissions**: Attach policy directly
   - Search for: `AmazonS3FullAccess` (or create custom policy below)
   - **OR** create custom policy with these permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::YOUR_BUCKET_NAME/*",
           "arn:aws:s3:::YOUR_BUCKET_NAME"
         ]
       }
     ]
   }
   ```

### Step 3: Get Access Keys
1. After creating the user, go to "Security credentials" tab
2. Click "Create access key"
3. Choose "Application running outside AWS"
4. **Save these credentials** (you won't see the secret key again):
   - **Access Key ID**: `AKIA...`
   - **Secret Access Key**: `...`

### Step 4: Update .env File
Update your `.env` file with the new credentials:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=YOUR_NEW_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_NEW_SECRET_ACCESS_KEY
AWS_REGION=eu-north-1
S3_BUCKET_NAME=YOUR_BUCKET_NAME
```

### Step 5: Test Connection
Run the test script:
```bash
cd Admin_panel/backend
node scripts/test-s3-connection.js
```

You should see:
```
✅ S3 connection successful!
✅ Target bucket 'YOUR_BUCKET_NAME' found!
```

## How It Works

### File Storage Flow:
1. **Admin uploads Excel file** → Frontend sends to `/admin/task/upload`
2. **Backend receives file** → Validates and processes
3. **File uploaded to S3** → Gets S3 URL (e.g., `https://bucket.s3.region.amazonaws.com/path/file.xlsx`)
4. **Metadata saved to MongoDB**:
   - `Task` collection: Task details + S3 URL
   - `Excel` collection: File metadata + S3 URL + S3 key
   - `Contact` collection: Extracted contacts from Excel
5. **Message saved to MongoDB** (if provided):
   - `Message` collection: Message text + sender (admin) + receiver (teacher)

### Message System:
- Messages are stored in MongoDB `Message` collection
- When admin assigns task with message, it's saved with:
  - `sender_admin_id`: Admin who sent it
  - `receiver_teacher_id`: Teacher who receives it
  - `message_text`: The message content
  - `created_at`: Timestamp
- Teachers can fetch their messages via `/teacher/messages?teacher_id=...`

## Troubleshooting

### Error: "Resolved credential object is not valid"
- **Cause**: AWS credentials are invalid or expired
- **Fix**: Update credentials in `.env` file

### Error: "NoSuchBucket"
- **Cause**: Bucket name doesn't exist or wrong region
- **Fix**: Check bucket name and region in `.env`

### Error: "AccessDenied"
- **Cause**: IAM user doesn't have S3 permissions
- **Fix**: Add S3 permissions to IAM user

### Error: "Unexpected token '<', "<!DOCTYPE "..."
- **Cause**: Server returning HTML instead of JSON (404 or error page)
- **Fix**: Check backend server is running on correct port (4000)

## Current Configuration Check

Run this to check your current config:
```bash
cd Admin_panel/backend
node -e "require('dotenv').config(); console.log('Bucket:', process.env.S3_BUCKET_NAME); console.log('Region:', process.env.AWS_REGION); console.log('Has Access Key:', !!process.env.AWS_ACCESS_KEY_ID); console.log('Has Secret Key:', !!process.env.AWS_SECRET_ACCESS_KEY);"
```

