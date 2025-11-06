import { clearToken } from '../utils/auth.js';
import { navigate } from '../app.js';

export function renderLayout(contentHtml) {
  return `
  <div class="min-h-screen grid grid-cols-12">
    <aside class="col-span-2 bg-white border-r p-4 space-y-2">
      <div class="font-bold text-lg mb-4">DialDesk Admin</div>
      <nav class="space-y-1 text-sm">
        <a href="#/dashboard" class="block px-2 py-1 rounded hover:bg-gray-100">Dashboard</a>
        <a href="#/teachers" class="block px-2 py-1 rounded hover:bg-gray-100">Teachers</a>
        <a href="#/tasks" class="block px-2 py-1 rounded hover:bg-gray-100">Tasks</a>
        <a href="#/messages" class="block px-2 py-1 rounded hover:bg-gray-100">Messages</a>
        <a href="#/reports" class="block px-2 py-1 rounded hover:bg-gray-100">Reports</a>
        <a href="#/settings" class="block px-2 py-1 rounded hover:bg-gray-100">Settings</a>
      </nav>
      <button id="logoutBtn" class="mt-4 text-left text-red-600 text-sm">Logout</button>
    </aside>
    <main class="col-span-10 p-6">${contentHtml}</main>
  </div>`;
}

export function bindLayoutEvents() {
  const btn = document.getElementById('logoutBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      clearToken();
      navigate('#/login');
    });
  }
}


