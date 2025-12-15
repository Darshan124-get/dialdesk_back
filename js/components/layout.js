import { clearToken } from '../utils/auth.js';
import { navigate } from '../app.js';

export function renderLayout(contentHtml) {
  // Get admin info from localStorage or token
  let adminName = localStorage.getItem('admin_name') || 'Admin';
  let adminEmail = localStorage.getItem('admin_email') || '';
  
  // Fallback to token if localStorage doesn't have it
  if (!adminName || adminName === 'Admin') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        adminName = payload.name || payload.email?.split('@')[0] || 'Admin';
        adminEmail = payload.email || '';
      } catch (e) {
        // If token parsing fails, use defaults
      }
    }
  }

  return `
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white flex flex-col shadow-2xl">
        <!-- Logo & Brand -->
        <div class="p-6 border-b border-purple-600">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold">DialDesk</h1>
              <p class="text-xs text-purple-200">Admin Panel</p>
            </div>
          </div>
        </div>

        <!-- User Profile Section -->
        <div class="p-4 border-b border-purple-600 bg-purple-800 bg-opacity-50">
          <a href="#/settings" id="adminProfileBtn" class="flex items-center gap-3 hover:bg-purple-700 hover:bg-opacity-50 rounded-lg p-2 transition-all group cursor-pointer">
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden relative flex-shrink-0 group-hover:ring-2 group-hover:ring-purple-300 transition-all" id="sidebarProfileImage">
              <img id="sidebarProfileImg" src="" alt="Profile" class="w-full h-full object-cover hidden" />
              <span id="sidebarProfileInitial" class="text-white">${adminName.charAt(0).toUpperCase()}</span>
            </div>
            <div class="flex-1 min-w-0 text-left">
              <p class="font-semibold text-sm truncate text-white">${adminName}</p>
              <p class="text-xs text-purple-200 truncate">${adminEmail || 'Administrator'}</p>
            </div>
            <svg class="w-5 h-5 text-purple-200 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto p-4 space-y-1">
          <a href="#/dashboard" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-purple-600 hover:bg-opacity-50 group" data-page="dashboard">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span>Dashboard</span>
          </a>
          <a href="#/teachers" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-purple-600 hover:bg-opacity-50 group" data-page="teachers">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <span>Teachers</span>
          </a>
          <a href="#/tasks" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-purple-600 hover:bg-opacity-50 group" data-page="tasks">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span>Tasks</span>
          </a>
          <a href="#/messages" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-purple-600 hover:bg-opacity-50 group" data-page="messages">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span>Messages</span>
          </a>
          <a href="#/reports" class="nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-purple-600 hover:bg-opacity-50 group" data-page="reports">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Reports</span>
          </a>
        </nav>

        <!-- Logout Button -->
        <div class="p-4 border-t border-purple-600">
          <button id="logoutBtn" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-red-600 hover:bg-opacity-50 text-red-200 hover:text-white group">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-6 md:p-8">
          ${contentHtml}
        </div>
      </main>
    </div>
  </div>`;
}

export function bindLayoutEvents() {
  // Logout button in sidebar footer
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      clearToken();
      navigate('#/login');
    });
  }

  // Highlight active nav link based on current route
  const currentPath = window.location.hash.replace('#/', '') || 'dashboard';
  document.querySelectorAll('.nav-link').forEach(link => {
    const page = link.getAttribute('data-page');
    if (page === currentPath) {
      link.classList.add('bg-purple-600', 'bg-opacity-50');
      link.classList.remove('hover:bg-purple-600');
    }
  });

  // Highlight admin profile button when on settings page
  const adminProfileBtn = document.getElementById('adminProfileBtn');
  if (adminProfileBtn && currentPath === 'settings') {
    adminProfileBtn.classList.add('bg-purple-700', 'bg-opacity-50');
  }

  // Update sidebar profile image
  updateSidebarProfileImage();
}

function updateSidebarProfileImage() {
  const profileImageUrl = localStorage.getItem('admin_profile_image');
  const sidebarProfileImg = document.getElementById('sidebarProfileImg');
  const sidebarProfileInitial = document.getElementById('sidebarProfileInitial');
  const sidebarProfileImage = document.getElementById('sidebarProfileImage');
  
  if (profileImageUrl && sidebarProfileImg && sidebarProfileInitial && sidebarProfileImage) {
    sidebarProfileImg.src = profileImageUrl;
    sidebarProfileImg.classList.remove('hidden');
    sidebarProfileInitial.classList.add('hidden');
    sidebarProfileImage.classList.remove('bg-white', 'bg-opacity-20');
  }
}
