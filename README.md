# DialDesk Backend API

Backend API for the DialDesk application - an auto-calling app for teachers to call students sequentially.

## Features

- **Teacher Authentication**: JWT-based authentication system
- **Task Management**: Create and assign tasks to teachers
- **Excel File Management**: Upload, store, and download Excel files via AWS S3
- **Call Logging**: Track call logs and reports
- **Real-time Updates**: Auto-refresh functionality for Excel files

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **AWS S3** for file storage
- **JWT** for authentication
- **Multer** for file uploads

## API Endpoints

### Authentication
- `POST /teacher/login` - Teacher login
- `POST /admin/login` - Admin login

### Excel Files
- `GET /api/teacher/excel-files` - Get Excel files for teacher
- `GET /api/teacher/download-excel/:excelId` - Download Excel file
- `GET /api/teacher/excel-status/:excelId` - Check Excel file status

### Tasks
- `GET /api/teacher/tasks` - Get tasks assigned to teacher
- `POST /admin/task/upload` - Upload Excel file and create task

### Admin Panel
- `GET /admin/teachers` - Get all teachers
- `GET /admin/tasks` - Get all tasks
- `POST /admin/teacher/:id/reset-password` - Reset teacher password

## Environment Variables

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb://localhost:27017/dialdesk
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=eu-north-1
S3_BUCKET_NAME=bialdesk
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the server: `npm start`

## Deployment

This backend is configured for deployment on Render.com. The `render.yaml` file contains the deployment configuration.

## Database Models

- **Teacher**: Teacher information and authentication
- **Task**: Tasks assigned to teachers
- **Excel**: Excel file metadata and S3 references
- **Contact**: Contact information from Excel files
- **CallLog**: Call history and logs
- **Admin**: Admin user management

## File Structure

```
backend/
├── config/
│   ├── aws-config.js
│   ├── db.js
│   └── s3.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Admin.js
│   ├── CallLog.js
│   ├── Contact.js
│   ├── Excel.js
│   ├── Task.js
│   └── Teacher.js
├── routes/
│   ├── adminAuth.js
│   ├── adminSettings.js
│   ├── excelRoutes.js
│   ├── messagesAndReports.js
│   ├── reportExport.js
│   ├── taskRoutes.js
│   ├── teacherAuth.js
│   ├── teacherManagement.js
│   └── teacherTaskAndLogs.js
├── scripts/
│   ├── createTestTeacher.js
│   ├── seedAdmin.js
│   └── seedTeachers.js
├── utils/
│   ├── asyncHandler.js
│   └── ensureDir.js
├── index.js
└── package.json
```
