import { renderLayout, bindLayoutEvents } from '../components/layout.js';
import { apiBase, authHeader, getToken } from '../utils/auth.js';
import { navigate } from '../app.js';

function logRow(l) {
  return `
    <tr class="border-b">
      <td class="px-3 py-2">${l['Student Name'] || ''}</td>
      <td class="px-3 py-2">${l['Phone'] || ''}</td>
      <td class="px-3 py-2">${l['Status'] || ''}</td>
      <td class="px-3 py-2">${l['Notes'] || ''}</td>
      <td class="px-3 py-2">${l['Call Time'] || ''}</td>
      <td class="px-3 py-2">${l['Duration (sec)'] || ''}</td>
      <td class="px-3 py-2">${l['Teacher ID'] || ''}</td>
      <td class="px-3 py-2">${l['Task ID'] || ''}</td>
    </tr>`;
}

export function renderReports() {
  if (!getToken()) return navigate('#/login');
  const app = document.getElementById('app');
  const content = `
    <h1 class="text-2xl font-semibold mb-4">Reports</h1>
    <div class="bg-white border rounded p-4 mb-4">
      <div class="flex flex-wrap items-end gap-3">
        <div>
          <label class="block text-sm mb-1">Teacher ID</label>
          <input id="fTeacher" class="border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm mb-1">Date</label>
          <input id="fDate" type="date" class="border rounded px-3 py-2" />
        </div>
        <button id="apply" class="h-10 px-3 bg-indigo-600 text-white rounded">Apply</button>
        <button id="export" class="h-10 px-3 border rounded">Export XLSX</button>
      </div>
    </div>
    <div class="bg-white border rounded">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-2 text-left">Student Name</th>
            <th class="px-3 py-2 text-left">Phone</th>
            <th class="px-3 py-2 text-left">Status</th>
            <th class="px-3 py-2 text-left">Notes</th>
            <th class="px-3 py-2 text-left">Call Time</th>
            <th class="px-3 py-2 text-left">Duration</th>
            <th class="px-3 py-2 text-left">Teacher</th>
            <th class="px-3 py-2 text-left">Task</th>
          </tr>
        </thead>
        <tbody id="reportRows"></tbody>
      </table>
    </div>
  `;
  app.innerHTML = renderLayout(content);
  bindLayoutEvents();

  const rows = document.getElementById('reportRows');
  const buildQuery = () => {
    const t = document.getElementById('fTeacher').value.trim();
    const d = document.getElementById('fDate').value;
    const p = new URLSearchParams();
    if (t) p.set('teacher_id', t);
    if (d) p.set('date', d);
    return p.toString();
  };

  const load = async () => {
    const qs = buildQuery();
    const url = `${apiBase}/reports${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, { headers: { ...authHeader() } });
    const json = await res.json();
    // Shape rows similar to export for reuse UI
    const formatted = (json.logs || []).map(l => ({
      'Student Name': l.contact_name || '',
      'Phone': l.contact_phone || '',
      'Status': l.call_status,
      'Notes': l.review_notes || '',
      'Call Time': l.call_time ? new Date(l.call_time).toISOString() : '',
      'Duration (sec)': l.duration ?? '',
      'Teacher ID': l.teacher_id,
      'Task ID': l.task_id || ''
    }));
    rows.innerHTML = formatted.map(logRow).join('');
  };

  document.getElementById('apply').addEventListener('click', load);
  document.getElementById('export').addEventListener('click', async () => {
    const qs = buildQuery();
    const url = `${apiBase}/admin/report/export${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, { headers: { ...authHeader() } });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'report.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  load();
}


