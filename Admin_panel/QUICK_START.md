# DialDesk Admin Panel - Quick Start Guide

## 🚀 Quick Start (Development)

### Step 1: Start Backend Server

```bash
cd Admin_panel/backend
npm install  # if not already done
npm run dev  # starts with nodemon (auto-reload)
```

**Expected output:**
```
Connected to MongoDB
Admin backend listening on :4000
```

**Default Admin Credentials** (after seeding):
- Email: `admin@example.com`
- Password: `admin123`

**To seed admin user:**
```bash
cd Admin_panel/backend
npm run seed
```

### Step 2: Start Frontend

**Option 1: Using the provided script (Windows)**
```bash
cd Admin_panel/frontend
start-dev.bat
```

**Option 2: Using Python**
```bash
cd Admin_panel/frontend
python -m http.server 8000
```
Then open: `http://localhost:8000`

**Option 3: Using Node.js http-server**
```bash
cd Admin_panel/frontend
npx http-server -p 8000
```
Then open: `http://localhost:8000`

**Option 4: Direct file open**
- Simply open `index.html` in your browser
- Note: May have CORS issues, use a local server instead

### Step 3: Login

1. Open the frontend in your browser
2. Use credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. You should be redirected to the dashboard

## 🔧 Troubleshooting

### Backend won't start

**MongoDB not running:**
```bash
# Check if MongoDB is running
mongosh

# If not, start MongoDB service (Windows)
net start MongoDB

# Or start manually
mongod
```

**Port 4000 already in use:**
- Change `PORT` in `.env` file
- Or kill the process using port 4000

**Missing dependencies:**
```bash
cd Admin_panel/backend
npm install
```

### Frontend can't connect to backend

**Check:**
1. Backend is running on `http://localhost:4000`
2. Test: `curl http://localhost:4000/health` should return `{"ok":true}`
3. Check browser console for errors
4. Verify `window.ADMIN_API_BASE` in `index.html` points to `http://localhost:4000`

### Login returns 401

**Check:**
1. Admin user exists: Run `npm run seed` in backend
2. MongoDB is connected
3. JWT_SECRET is set in `.env`
4. Check backend logs for errors

### CORS Errors

- Use a local HTTP server (not direct file open)
- Backend CORS is configured to allow all origins in development

## 📝 Configuration

### Backend (.env file)
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/dialdesk
JWT_SECRET=your_jwt_secret_here
```

### Frontend (index.html)
```javascript
window.ADMIN_API_BASE = 'http://localhost:4000';  // Development
// window.ADMIN_API_BASE = 'https://your-production-url.com';  // Production
```

## ✅ What's Fixed

- ✅ Login error handling improved
- ✅ Better error messages
- ✅ Local development setup
- ✅ Network error detection
- ✅ Loading states
- ✅ Form validation

## 🎯 Next Steps

1. Test all features:
   - Login/Logout
   - Teacher Management
   - Task Management
   - Messages
   - Reports
   - Settings

2. Report any bugs or issues

3. Once everything works locally, we'll prepare for production

