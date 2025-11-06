import { renderLayout, bindLayoutEvents } from '../components/layout.js';
import { apiBase, authHeader, getToken } from '../utils/auth.js';
import { navigate } from '../app.js';

function row(t) {
  return `
    <tr class="border-b">
      <td class="px-3 py-2">${t.name}</td>
      <td class="px-3 py-2">${t.email}</td>
      <td class="px-3 py-2">${t.phone}</td>
      <td class="px-3 py-2">${t.status}</td>
      <td class="px-3 py-2 text-right space-x-2">
        <button class="px-2 py-1 bg-indigo-600 text-white rounded text-xs" data-edit="${t.teacher_id}">Edit</button>
        <button class="px-2 py-1 bg-red-600 text-white rounded text-xs" data-del="${t.teacher_id}">Delete</button>
        <button class="px-2 py-1 bg-gray-700 text-white rounded text-xs" data-reset="${t.teacher_id}">Reset Password</button>
      </td>
    </tr>`;
}

export function renderTeachers() {
  if (!getToken()) return navigate('#/login');
  const app = document.getElementById('app');
  const content = `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Teachers</h1>
      <button id="openCreate" class="bg-indigo-600 text-white px-3 py-2 rounded">Create</button>
    </div>
    <div class="bg-white border rounded">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-3 py-2">Name</th>
            <th class="text-left px-3 py-2">Email</th>
            <th class="text-left px-3 py-2">Phone</th>
            <th class="text-left px-3 py-2">Status</th>
            <th class="text-right px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody id="teacherRows"></tbody>
      </table>
    </div>

    <dialog id="createDlg" class="rounded p-0">
      <form id="createForm" method="dialog" class="p-6 w-96">
        <h3 class="text-lg font-semibold mb-3">Create Teacher</h3>
        <div class="space-y-3">
          <input name="name" placeholder="Name" class="w-full border rounded px-3 py-2" required />
          <input name="email" placeholder="Email" type="email" class="w-full border rounded px-3 py-2" required />
          <input name="phone" placeholder="Phone" class="w-full border rounded px-3 py-2" required />
          <input name="password" placeholder="Password" type="password" class="w-full border rounded px-3 py-2" required />
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" id="cancelCreate" class="px-3 py-2 border rounded">Cancel</button>
          <button class="px-3 py-2 bg-indigo-600 text-white rounded">Create</button>
        </div>
        <p id="createErr" class="text-red-600 text-sm mt-2"></p>
      </form>
    </dialog>
  `;
  app.innerHTML = renderLayout(content);
  bindLayoutEvents();

  const rowsEl = document.getElementById('teacherRows');
  const load = async () => {
    const res = await fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } });
    const json = await res.json();
    rowsEl.innerHTML = (json.teachers || []).map(row).join('');
    bindRowActions();
  };

  const bindRowActions = () => {
    rowsEl.querySelectorAll('button[data-del]').forEach(btn => btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del');
      if (!confirm('Delete this teacher?')) return;
      await fetch(`${apiBase}/admin/teacher/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
      load();
    }));
    rowsEl.querySelectorAll('button[data-reset]').forEach(btn => btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-reset');
      const np = prompt('New password');
      if (!np) return;
      await fetch(`${apiBase}/admin/teacher/${id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ new_password: np })
      });
      alert('Password reset');
    }));
    rowsEl.querySelectorAll('button[data-edit]').forEach(btn => btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-edit');
      const name = prompt('Name');
      const email = prompt('Email');
      const phone = prompt('Phone');
      const status = prompt('Status (active/inactive)');
      await fetch(`${apiBase}/admin/teacher/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ name, email, phone, status })
      });
      load();
    }));
  };

  // Create dialog
  const dlg = document.getElementById('createDlg');
  document.getElementById('openCreate').addEventListener('click', () => dlg.showModal());
  document.getElementById('cancelCreate').addEventListener('click', () => dlg.close());
  document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch(`${apiBase}/admin/teacher/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create teacher');
      dlg.close();
      e.currentTarget.reset();
      load();
    } catch (err) {
      document.getElementById('createErr').textContent = err.message;
    }
  });

  load();
}


