# DialDesk Admin Panel - Frontend

## Development Setup

### Quick Start

1. **Start the Backend Server** (in `Admin_panel/backend` directory):
   ```bash
   cd Admin_panel/backend
   npm install  # if not already installed
   npm run dev  # or npm start
   ```

2. **Open the Frontend**:
   - Option 1: Open `index.html` directly in a browser (may have CORS issues)
   - Option 2: Use a simple HTTP server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (if you have http-server installed)
     npx http-server -p 8000
     
     # Using PHP
     php -S localhost:8000
     ```
   - Then open: `http://localhost:8000`

3. **Default Admin Credentials** (after seeding):
   - Email: `admin@example.com`
   - Password: `admin123`

### Configuration

The API base URL is configured in `index.html`. For development, it defaults to `http://localhost:4000`.

To change it, modify the `window.ADMIN_API_BASE` variable in `index.html`.

### Features

- ✅ Admin Login
- ✅ Dashboard with Statistics
- ✅ Teacher Management (CRUD)
- ✅ Task Management (Upload Excel, Assign, Edit, Delete)
- ✅ Messages (Send to teachers)
- ✅ Reports (View and Export)
- ✅ Settings (Change Password)

### Troubleshooting

**Login Issues:**
- Ensure backend is running on port 4000
- Check browser console for errors
- Verify MongoDB is running and connected
- Make sure admin user exists (run `npm run seed` in backend)

**CORS Issues:**
- Use a local HTTP server instead of opening file directly
- Backend CORS is configured to allow all origins in development

