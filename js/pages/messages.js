import { renderLayout, bindLayoutEvents } from '../components/layout.js';
import { apiBase, authHeader, getToken } from '../utils/auth.js';
import { navigate } from '../app.js';

function msgRow(m, teachersMap) {
  const receiverName = m.receiver_teacher_id === 'ALL' ? 'ALL' : (teachersMap.get(m.receiver_teacher_id)?.name || m.receiver_teacher_id);
  return `<div class="border-b py-2"><div class="text-sm">To: ${receiverName}</div><div>${m.message_text}</div><div class="text-xs text-gray-500">${new Date(m.created_at).toLocaleString()}</div></div>`;
}

export function renderMessages() {
  if (!getToken()) return navigate('#/login');
  const app = document.getElementById('app');
  const content = `
    <h1 class="text-2xl font-semibold mb-4">Messages</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <form id="msgForm" class="bg-white border rounded p-4 space-y-3">
        <div>
          <label class="block text-sm mb-1">Send To</label>
          <select name="receiver_teacher_id" class="w-full border rounded px-3 py-2" required>
            <option value="">Select Teacher</option>
            <option value="ALL">All Teachers</option>
          </select>
        </div>
        <div>
          <label class="block text-sm mb-1">Message</label>
          <textarea name="message_text" rows="4" class="w-full border rounded px-3 py-2" required></textarea>
        </div>
        <button class="bg-indigo-600 text-white px-3 py-2 rounded">Send</button>
        <p id="msgErr" class="text-red-600 text-sm"></p>
      </form>
      <div class="md:col-span-2 bg-white border rounded p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="font-semibold">Recent Messages</div>
          <div class="text-sm">
            <select id="filterTeacher" class="border rounded px-2 py-1">
              <option value="">All Messages</option>
              <option value="ALL">All Teachers</option>
            </select>
            <button id="applyFilter" class="ml-2 px-2 py-1 border rounded">Apply</button>
          </div>
        </div>
        <div id="msgList" class="divide-y"></div>
      </div>
    </div>
  `;
  app.innerHTML = renderLayout(content);
  bindLayoutEvents();

  let teachersMap = new Map();

  const loadTeachers = async () => {
    const res = await fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } });
    const json = await res.json();
    teachersMap = new Map((json.teachers || []).map(t => [t.teacher_id, t]));
    return teachersMap;
  };

  const populateTeacherDropdowns = async () => {
    const teachers = await loadTeachers();
    
    // Populate send form dropdown
    const sendSelect = document.querySelector('select[name="receiver_teacher_id"]');
    sendSelect.innerHTML = '<option value="">Select Teacher</option><option value="ALL">All Teachers</option>' + 
      Array.from(teachers.values()).map(t => `<option value="${t.teacher_id}">${t.name}</option>`).join('');
    
    // Populate filter dropdown
    const filterSelect = document.getElementById('filterTeacher');
    filterSelect.innerHTML = '<option value="">All Messages</option><option value="ALL">All Teachers</option>' + 
      Array.from(teachers.values()).map(t => `<option value="${t.teacher_id}">${t.name}</option>`).join('');
  };

  const list = document.getElementById('msgList');
  const load = async (teacherId = '') => {
    const url = teacherId ? `${apiBase}/teacher/messages?teacher_id=${encodeURIComponent(teacherId)}` : `${apiBase}/teacher/messages`;
    const res = await fetch(url, { headers: { ...authHeader() } });
    const json = await res.json();
    list.innerHTML = (json.messages || []).map(m => msgRow(m, teachersMap)).join('');
  };

  document.getElementById('applyFilter').addEventListener('click', () => {
    const teacherId = document.getElementById('filterTeacher').value.trim();
    load(teacherId);
  });

  document.getElementById('msgForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (!data.receiver_teacher_id) {
      document.getElementById('msgErr').textContent = 'Please select a teacher or ALL';
      return;
    }
    try {
      const res = await fetch(`${apiBase}/admin/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to send');
      e.currentTarget.reset();
      load();
    } catch (err) {
      document.getElementById('msgErr').textContent = err.message;
    }
  });

  // Initialize
  populateTeacherDropdowns().then(() => load());
}