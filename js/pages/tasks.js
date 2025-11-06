import { renderLayout, bindLayoutEvents } from '../components/layout.js';
import { apiBase, authHeader, getToken } from '../utils/auth.js';
import { navigate } from '../app.js';

function taskRow(t, teachersMap) {
  const teacherName = t.assigned_teacher_id ? (teachersMap.get(t.assigned_teacher_id)?.name || t.assigned_teacher_id) : '-';
  return `
    <tr class="border-b hover:bg-gray-50">
      <td class="px-3 py-2">${t.task_name || `Task ${t.task_id.slice(0, 8)}`}</td>
      <td class="px-3 py-2">${teacherName}</td>
      <td class="px-3 py-2">
        <span class="px-2 py-1 text-xs rounded-full ${
          t.status === 'completed' ? 'bg-green-100 text-green-800' :
          t.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }">${t.status}</span>
      </td>
      <td class="px-3 py-2">${t.created_at ? new Date(t.created_at).toLocaleString() : ''}</td>
      <td class="px-3 py-2 text-right">
        <div class="flex gap-1 justify-end">
          <button class="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors" data-view="${t.task_id}">
            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            View
          </button>
          <button class="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors" data-edit="${t.task_id}">
            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Edit
          </button>
          <button class="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors" data-delete="${t.task_id}">
            <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Delete
          </button>
        </div>
      </td>
    </tr>`;
}

export function renderTasks() {
  if (!getToken()) return navigate('#/login');
  const app = document.getElementById('app');
  const content = `
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-semibold">Tasks</h1>
      <div class="flex items-center gap-2">
        <button id="openUpload" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          Upload Excel
        </button>
        <button id="openAssign" class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
          Assign Task
        </button>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-900">Task Name</th>
            <th class="text-left px-4 py-3 font-medium text-gray-900">Teacher Name</th>
            <th class="text-left px-4 py-3 font-medium text-gray-900">Status</th>
            <th class="text-left px-4 py-3 font-medium text-gray-900">Created</th>
            <th class="text-right px-4 py-3 font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody id="taskRows"></tbody>
      </table>
    </div>

    <!-- Upload Dialog -->
    <dialog id="uploadDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-lg shadow-xl">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Upload Excel File</h3>
          <button id="cancelUpload" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form id="uploadForm" method="dialog" class="space-y-4" enctype="multipart/form-data">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Excel File</label>
            <input type="file" name="file" accept=".xlsx,.xls" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Assign to Teacher (Optional)</label>
            <select name="assigned_teacher_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">No Teacher Assigned</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" id="cancelUploadBtn" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Upload</button>
          </div>
          <p id="uploadErr" class="text-red-600 text-sm mt-2"></p>
        </form>
      </div>
    </dialog>

    <!-- Assign Dialog -->
    <dialog id="assignDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-lg shadow-xl">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Assign Task</h3>
          <button id="cancelAssign" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form id="assignForm" method="dialog" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Select Task</label>
            <select name="task_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
              <option value="">Select Task</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Select Teacher</label>
            <select name="teacher_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
              <option value="">Select Teacher</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" id="cancelAssignBtn" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Assign</button>
          </div>
          <p id="assignErr" class="text-red-600 text-sm mt-2"></p>
        </form>
      </div>
    </dialog>

    <!-- Edit Dialog -->
    <dialog id="editDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-lg shadow-xl">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Edit Task</h3>
          <button id="cancelEdit" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form id="editForm" method="dialog" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
            <input name="task_name" placeholder="Enter task name" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select name="status" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Assigned Teacher</label>
            <select name="assigned_teacher_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">No Teacher Assigned</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" id="cancelEditBtn" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Update</button>
          </div>
          <p id="editErr" class="text-red-600 text-sm mt-2"></p>
        </form>
      </div>
    </dialog>

    <!-- View Dialog -->
    <dialog id="viewDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-lg shadow-xl">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Task Details</h3>
          <button id="closeView" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div id="viewContent" class="space-y-3">
          <!-- Content will be populated dynamically -->
        </div>
        <div class="flex justify-end pt-4">
          <button id="closeViewBtn" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">Close</button>
        </div>
      </div>
    </dialog>

    <!-- Delete Confirmation Dialog -->
    <dialog id="deleteDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-lg shadow-xl">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-semibold text-gray-900">Delete Task</h3>
            <p class="text-sm text-gray-500">This action cannot be undone.</p>
          </div>
        </div>
        <p class="text-gray-700 mb-4">Are you sure you want to delete this task? This will also delete all associated contacts and cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <button id="cancelDelete" class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button id="confirmDelete" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </dialog>
  `;
  app.innerHTML = renderLayout(content);
  bindLayoutEvents();

  const rowsEl = document.getElementById('taskRows');
  let teachersMap = new Map();
  let currentDeleteId = null;
  
  const loadTeachers = async () => {
    const res = await fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } });
    const json = await res.json();
    teachersMap = new Map((json.teachers || []).map(t => [t.teacher_id, t]));
    return teachersMap;
  };

  const openEditDialog = async (taskId) => {
    try {
      console.log('Opening edit dialog for task:', taskId);
      const res = await fetch(`${apiBase}/admin/task/${taskId}`, { headers: { ...authHeader() } });
      const json = await res.json();
      console.log('Task data received:', json);
      const task = json.task;
      
      if (!task) {
        alert('Task not found');
        return;
      }
      
      // Populate teacher dropdown
      const teacherSelect = document.querySelector('#editForm select[name="assigned_teacher_id"]');
      teacherSelect.innerHTML = '<option value="">No Teacher Assigned</option>' + 
        Array.from(teachersMap.values()).map(t => `<option value="${t.teacher_id}">${t.name}</option>`).join('');
      
      // Populate form
      document.querySelector('#editForm input[name="task_name"]').value = task.task_name || '';
      document.querySelector('#editForm select[name="status"]').value = task.status;
      document.querySelector('#editForm select[name="assigned_teacher_id"]').value = task.assigned_teacher_id || '';
      
      // Store task ID for update
      document.getElementById('editForm').dataset.taskId = taskId;
      
      document.getElementById('editDlg').showModal();
    } catch (error) {
      console.error('Error opening edit dialog:', error);
      alert('Error loading task data: ' + error.message);
    }
  };

  const openViewDialog = async (taskId) => {
    try {
      console.log('Opening view dialog for task:', taskId);
      const res = await fetch(`${apiBase}/admin/task/${taskId}`, { headers: { ...authHeader() } });
      const json = await res.json();
      console.log('Task data received:', json);
      const task = json.task;
      const stats = json.stats;
      
      if (!task) {
        alert('Task not found');
        return;
      }
      
      const teacherName = task.assigned_teacher_id ? (teachersMap.get(task.assigned_teacher_id)?.name || task.assigned_teacher_id) : 'No Teacher Assigned';
      
      const content = `
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Task Name</label>
            <p class="text-gray-900">${task.task_name || 'N/A'}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Status</label>
            <p class="text-gray-900">
              <span class="px-2 py-1 text-xs rounded-full ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }">${task.status}</span>
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Assigned Teacher</label>
            <p class="text-gray-900">${teacherName}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Created</label>
            <p class="text-gray-900">${task.created_at ? new Date(task.created_at).toLocaleString() : 'N/A'}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Total Contacts</label>
            <p class="text-gray-900">${stats?.total || 0}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Completed</label>
            <p class="text-gray-900">${stats?.completed || 0}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Pending</label>
            <p class="text-gray-900">${stats?.pending || 0}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Progress</label>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-indigo-600 h-2 rounded-full" style="width: ${stats?.total ? (stats.completed / stats.total * 100) : 0}%"></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">${stats?.total ? Math.round(stats.completed / stats.total * 100) : 0}% complete</p>
          </div>
        </div>
      `;
      
      document.getElementById('viewContent').innerHTML = content;
      document.getElementById('viewDlg').showModal();
    } catch (error) {
      console.error('Error opening view dialog:', error);
      alert('Error loading task data: ' + error.message);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      console.log('Deleting task:', taskId);
      const res = await fetch(`${apiBase}/admin/task/${taskId}`, {
        method: 'DELETE',
        headers: { ...authHeader() }
      });
      console.log('Delete response:', res.status, res.statusText);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Delete failed: ${res.status} ${res.statusText} - ${errorText}`);
      }
      document.getElementById('deleteDlg').close();
      load();
      alert('Task deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Delete failed: ' + err.message);
    }
  };
  
  const load = async () => {
    try {
      console.log('Loading tasks...');
      const [tasksRes, teachersRes] = await Promise.all([
        fetch(`${apiBase}/admin/tasks`, { headers: { ...authHeader() } }),
        fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } })
      ]);
      
      console.log('Tasks response:', tasksRes.status);
      console.log('Teachers response:', teachersRes.status);
      
      const [tasksJson, teachersJson] = await Promise.all([tasksRes.json(), teachersRes.json()]);
      console.log('Tasks data:', tasksJson);
      console.log('Teachers data:', teachersJson);
      
      teachersMap = new Map((teachersJson.teachers || []).map(t => [t.teacher_id, t]));
      rowsEl.innerHTML = (tasksJson.tasks || []).map(t => taskRow(t, teachersMap)).join('');
      
      // Bind action buttons
      rowsEl.querySelectorAll('button[data-view]').forEach(btn => btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-view');
        await openViewDialog(id);
      }));
      
      rowsEl.querySelectorAll('button[data-edit]').forEach(btn => btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-edit');
        await openEditDialog(id);
      }));
      
      rowsEl.querySelectorAll('button[data-delete]').forEach(btn => btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-delete');
        currentDeleteId = id;
        document.getElementById('deleteDlg').showModal();
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      alert('Error loading tasks: ' + error.message);
    }
  };

  // Populate dropdowns
  const populateDropdowns = async () => {
    try {
      const [tasksRes, teachersRes] = await Promise.all([
        fetch(`${apiBase}/admin/tasks`, { headers: { ...authHeader() } }),
        fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } })
      ]);
      const [tasksJson, teachersJson] = await Promise.all([tasksRes.json(), teachersRes.json()]);
      
      const taskSelect = document.querySelector('select[name="task_id"]');
      const teacherSelect = document.querySelector('select[name="teacher_id"]');
      const uploadTeacherSelect = document.querySelector('select[name="assigned_teacher_id"]');
      
      taskSelect.innerHTML = '<option value="">Select Task</option>' + 
        (tasksJson.tasks || []).map(t => `<option value="${t.task_id}">${t.task_name || `Task ${t.task_id.slice(0, 8)}`}</option>`).join('');
      
      teacherSelect.innerHTML = '<option value="">Select Teacher</option>' + 
        (teachersJson.teachers || []).map(t => `<option value="${t.teacher_id}">${t.name}</option>`).join('');
      
      uploadTeacherSelect.innerHTML = '<option value="">No Teacher Assigned</option>' + 
        (teachersJson.teachers || []).map(t => `<option value="${t.teacher_id}">${t.name}</option>`).join('');
    } catch (error) {
      console.error('Error populating dropdowns:', error);
      alert('Error loading data: ' + error.message);
    }
  };

  // Upload dialog
  const uploadDlg = document.getElementById('uploadDlg');
  document.getElementById('openUpload').addEventListener('click', async () => {
    await populateDropdowns();
    uploadDlg.showModal();
  });
  document.getElementById('cancelUpload').addEventListener('click', () => uploadDlg.close());
  document.getElementById('cancelUploadBtn').addEventListener('click', () => uploadDlg.close());
  document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch(`${apiBase}/admin/task/upload`, {
        method: 'POST',
        headers: { ...authHeader() },
        body: fd
      });
      if (!res.ok) throw new Error('Upload failed');
      uploadDlg.close();
      e.currentTarget.reset();
      load();
    } catch (err) {
      document.getElementById('uploadErr').textContent = err.message;
    }
  });

  // Assign dialog
  const assignDlg = document.getElementById('assignDlg');
  document.getElementById('openAssign').addEventListener('click', async () => {
    await populateDropdowns();
    assignDlg.showModal();
  });
  document.getElementById('cancelAssign').addEventListener('click', () => assignDlg.close());
  document.getElementById('cancelAssignBtn').addEventListener('click', () => assignDlg.close());
  document.getElementById('assignForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch(`${apiBase}/admin/task/assign/${encodeURIComponent(data.teacher_id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ task_id: data.task_id })
      });
      if (!res.ok) throw new Error('Assign failed');
      assignDlg.close();
      load();
    } catch (err) {
      document.getElementById('assignErr').textContent = err.message;
    }
  });

  // Edit dialog
  const editDlg = document.getElementById('editDlg');
  document.getElementById('cancelEdit').addEventListener('click', () => editDlg.close());
  document.getElementById('cancelEditBtn').addEventListener('click', () => editDlg.close());
  document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskId = e.currentTarget.dataset.taskId;
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      console.log('Updating task:', taskId, data);
      const res = await fetch(`${apiBase}/admin/task/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
      });
      console.log('Update response:', res.status, res.statusText);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Update failed: ${res.status} ${res.statusText} - ${errorText}`);
      }
      editDlg.close();
      load();
      alert('Task updated successfully');
    } catch (err) {
      console.error('Update error:', err);
      document.getElementById('editErr').textContent = err.message;
    }
  });

  // View dialog
  const viewDlg = document.getElementById('viewDlg');
  document.getElementById('closeView').addEventListener('click', () => viewDlg.close());
  document.getElementById('closeViewBtn').addEventListener('click', () => viewDlg.close());

  // Delete dialog
  const deleteDlg = document.getElementById('deleteDlg');
  document.getElementById('cancelDelete').addEventListener('click', () => deleteDlg.close());
  document.getElementById('confirmDelete').addEventListener('click', () => {
    if (currentDeleteId) {
      deleteTask(currentDeleteId);
    }
  });

  load();
}