import { renderLayout, bindLayoutEvents } from '../components/layout.js';
import { apiBase, authHeader, getToken } from '../utils/auth.js';
import { navigate } from '../app.js';

export function renderDashboard() {
  if (!getToken()) return navigate('#/login');
  const app = document.getElementById('app');
  const content = `
    <h1 class="text-2xl font-semibold mb-4">Dashboard</h1>
    <div id="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border rounded p-4"><div class="text-sm text-gray-500">Total Teachers</div><div id="stat-teachers" class="text-2xl font-semibold">-</div></div>
      <div class="bg-white border rounded p-4"><div class="text-sm text-gray-500">Active Tasks</div><div id="stat-tasks" class="text-2xl font-semibold">-</div></div>
      <div class="bg-white border rounded p-4"><div class="text-sm text-gray-500">Calls Today</div><div id="stat-calls" class="text-2xl font-semibold">-</div></div>
      <div class="bg-white border rounded p-4"><div class="text-sm text-gray-500">Reports Submitted</div><div id="stat-reports" class="text-2xl font-semibold">-</div></div>
    </div>
  `;
  app.innerHTML = renderLayout(content);
  bindLayoutEvents();

  // Basic stats via existing endpoints
  Promise.all([
    fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } }).then(r => r.json()).catch(() => ({ teachers: [] })),
    fetch(`${apiBase}/admin/tasks`, { headers: { ...authHeader() } }).then(r => r.json()).catch(() => ({ tasks: [] })),
    fetch(`${apiBase}/reports?date=${new Date().toISOString().slice(0,10)}`, { headers: { ...authHeader() } }).then(r => r.json()).catch(() => ({ logs: [] }))
  ]).then(([t, tasks, logs]) => {
    document.getElementById('stat-teachers').textContent = (t.teachers || []).length;
    document.getElementById('stat-tasks').textContent = (tasks.tasks || []).filter(x => x.status !== 'completed').length;
    document.getElementById('stat-calls').textContent = (logs.logs || []).length;
    document.getElementById('stat-reports').textContent = (tasks.tasks || []).filter(x => x.status === 'completed').length;
  });
}


