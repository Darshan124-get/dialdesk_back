import { renderLayout, bindLayoutEvents } from '../components/layout.js';
import { apiBase, authHeader, getToken } from '../utils/auth.js';
import { navigate } from '../app.js';

export function renderSettings() {
  if (!getToken()) return navigate('#/login');
  const app = document.getElementById('app');
  const content = `
    <h1 class="text-2xl font-semibold mb-4">Settings</h1>
    <div class="bg-white border rounded p-4 w-full max-w-md">
      <form id="pwForm" class="space-y-3">
        <div>
          <label class="block text-sm mb-1">Current Password (optional)</label>
          <input name="current_password" type="password" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm mb-1">New Password</label>
          <input name="new_password" type="password" class="w-full border rounded px-3 py-2" required />
        </div>
        <button class="bg-indigo-600 text-white px-3 py-2 rounded">Change Password</button>
        <p id="pwMsg" class="text-sm"></p>
      </form>
    </div>
  `;
  app.innerHTML = renderLayout(content);
  bindLayoutEvents();

  document.getElementById('pwForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch(`${apiBase}/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Change failed');
      const msg = document.getElementById('pwMsg');
      msg.textContent = 'Password changed successfully';
      msg.className = 'text-green-600 text-sm';
      e.currentTarget.reset();
    } catch (err) {
      const msg = document.getElementById('pwMsg');
      msg.textContent = err.message;
      msg.className = 'text-red-600 text-sm';
    }
  });
}


