# DialDesk Backend - Setup Guide

## Quick Start for Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `Admin_panel/backend` directory:

```env
NODE_ENV=development
PORT=4000

# Database - Use local MongoDB
MONGODB_URI=mongodb://localhost:27017/dialdesk

# JWT Secret (use a strong secret in production)
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# AWS Configuration (optional for local dev, required for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=eu-north-1
S3_BUCKET_NAME=bialdesk
```

### 3. Start MongoDB

Make sure MongoDB is running locally:
```bash
# Windows (if installed as service, it should auto-start)
# Or start manually:
mongod

# Check if running:
mongosh
```

### 4. Seed Admin User

Create the default admin user:
```bash
npm run seed
```

Default credentials:
- Email: `admin@example.com`
- Password: `admin123`

### 5. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will start on `http://localhost:4000`

### 6. Verify Setup

Test the health endpoint:
```bash
curl http://localhost:4000/health
```

Should return: `{"ok":true}`

### Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is installed and running
- Check `MONGODB_URI` in `.env` file
- Try: `mongosh` to test connection

**Port Already in Use:**
- Change `PORT` in `.env` file
- Or kill the process using port 4000

**JWT Secret Error:**
- Make sure `JWT_SECRET` is set in `.env`
- Use a strong random string (at least 32 characters)

