# DialDesk Backend Deployment Guide

## 🚀 Deploy to Render.com

### Prerequisites
1. GitHub repository: [https://github.com/Darshan124-get/dialdesk_back.git](https://github.com/Darshan124-get/dialdesk_back.git)
2. Render.com account
3. MongoDB Atlas account (for production database)
4. AWS account (for S3 file storage)

### Step 1: Deploy to Render

1. **Go to [Render.com](https://render.com)** and sign in
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository:**
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account
   - Select the repository: `Darshan124-get/dialdesk_back`

### Step 2: Configure the Web Service

**Basic Settings:**
- **Name:** `dialdesk-backend`
- **Environment:** `Node`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** Leave empty (root is the backend folder)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Step 3: Environment Variables

Add these environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dialdesk?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret_here
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=eu-north-1
S3_BUCKET_NAME=bialdesk
```

### Step 4: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas account** at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create a new cluster** (free tier available)
3. **Create database user:**
   - Username: `dialdesk_user`
   - Password: Generate a strong password
4. **Whitelist IP addresses:**
   - Add `0.0.0.0/0` for Render deployment
5. **Get connection string:**
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/dialdesk?retryWrites=true&w=majority`

### Step 5: AWS S3 Setup

1. **Create S3 bucket** named `bialdesk`
2. **Create IAM user** with S3 permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::bialdesk/*"
       }
     ]
   }
   ```
3. **Generate access keys** for the IAM user

### Step 6: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (5-10 minutes)
3. **Check logs** for any errors
4. **Test the API** using the provided URL

### Step 7: Update Frontend API Configuration

Update your Flutter app's API configuration:

```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'https://your-render-app.onrender.com';
  // Replace 'your-render-app' with your actual Render app name
}
```

### Step 8: Test the Deployment

Test these endpoints:
- `GET https://your-app.onrender.com/health` - Health check
- `POST https://your-app.onrender.com/teacher/login` - Teacher login
- `GET https://your-app.onrender.com/api/teacher/excel-files` - Excel files (with auth)

## 🔧 Troubleshooting

### Common Issues:

1. **Build fails:**
   - Check Node.js version compatibility
   - Verify all dependencies in package.json

2. **Database connection fails:**
   - Verify MongoDB URI format
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **S3 upload fails:**
   - Verify AWS credentials
   - Check S3 bucket permissions
   - Ensure bucket exists and is accessible

4. **Environment variables not working:**
   - Double-check variable names (case-sensitive)
   - Ensure no extra spaces or quotes
   - Redeploy after changing environment variables

### Logs and Monitoring:

- **Render Dashboard:** View deployment logs
- **MongoDB Atlas:** Monitor database connections
- **AWS CloudWatch:** Monitor S3 operations

## 📱 Frontend Integration

After successful deployment, update your Flutter app:

1. **Update API base URL** in `lib/config/api_config.dart`
2. **Test authentication** flow
3. **Test Excel file download** functionality
4. **Test "Bind to Call"** feature

## 🔒 Security Notes

- Never commit credentials to Git
- Use environment variables for all sensitive data
- Regularly rotate AWS access keys
- Use strong JWT secrets
- Enable MongoDB Atlas security features

## 📊 Monitoring

- **Render:** Built-in monitoring and logs
- **MongoDB Atlas:** Database performance metrics
- **AWS S3:** Storage and request metrics

Your backend is now ready for production use! 🎉
