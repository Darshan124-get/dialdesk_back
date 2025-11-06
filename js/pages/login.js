import { setToken, apiBase } from '../utils/auth.js';
import { navigate } from '../app.js';

export function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 class="text-2xl font-semibold mb-4">Admin Login</h1>
        <form id="loginForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" class="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Password</label>
            <input type="password" name="password" class="w-full border rounded px-3 py-2" required />
          </div>
          <button class="w-full bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700">Login</button>
          <p id="loginError" class="text-red-600 text-sm"></p>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch(`${apiBase}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Login failed');
      setToken(json.token);
      navigate('#/dashboard');
    } catch (err) {
      document.getElementById('loginError').textContent = err.message;
    }
  });
}


