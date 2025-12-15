import { renderLayout, bindLayoutEvents } from '../components/layout.js';
import { apiBase, authHeader, getToken } from '../utils/auth.js';
import { navigate } from '../app.js';

function taskRow(t, teachersMap) {
  const teacherName = t.assigned_teacher_id ? (teachersMap.get(t.assigned_teacher_id)?.name || t.assigned_teacher_id) : '-';
  const statusBadge = t.status === 'completed' 
    ? '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Completed</span>'
    : t.status === 'in-progress'
    ? '<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">In Progress</span>'
    : '<span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending</span>';
  
  return `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="px-4 py-4 font-medium text-gray-900">${t.task_name || `Task ${t.task_id.slice(0, 8)}`}</td>
      <td class="px-4 py-4 text-gray-600">${teacherName}</td>
      <td class="px-4 py-4">${statusBadge}</td>
      <td class="px-4 py-4 text-gray-600">${t.created_at ? new Date(t.created_at).toLocaleString() : ''}</td>
      <td class="px-4 py-4 text-right">
        <div class="flex items-center justify-end gap-2 flex-wrap">
          <button class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors shadow-sm" data-view="${t.task_id}">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            View
          </button>
          <button class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors shadow-sm" data-edit="${t.task_id}">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Edit
          </button>
          <button class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors shadow-sm" data-delete="${t.task_id}">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <h1 class="text-3xl font-bold text-gray-900">Tasks Management</h1>
      <div class="flex items-center gap-3 flex-wrap">
        <button id="openUpload" class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          Create Task & Assign
        </button>
      </div>
    </div>

    <div class="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="text-left px-4 py-4 font-semibold text-gray-700">Task Name</th>
              <th class="text-left px-4 py-4 font-semibold text-gray-700">Teacher Name</th>
              <th class="text-left px-4 py-4 font-semibold text-gray-700">Status</th>
              <th class="text-left px-4 py-4 font-semibold text-gray-700">Created</th>
              <th class="text-right px-4 py-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody id="taskRows" class="divide-y divide-gray-200"></tbody>
        </table>
      </div>
    </div>

    <!-- Create Task & Assign Dialog -->
    <dialog id="uploadDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-xl shadow-2xl w-full max-w-2xl mx-auto p-0">
      <div class="bg-white rounded-xl overflow-hidden">
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-white">Create Task & Assign to Teacher</h3>
            <button id="cancelUpload" class="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-indigo-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <form id="uploadForm" method="dialog" class="p-6 md:p-8" enctype="multipart/form-data">
          <div class="space-y-6">
            <!-- Step 1: Upload Excel File -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                Upload Excel File
              </h4>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Excel File</label>
                <input type="file" name="file" id="excelFile" accept=".xlsx,.xls" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" required />
                <p class="text-xs text-gray-500 mt-1">Supported formats: .xlsx, .xls</p>
              </div>
            </div>

            <!-- Step 2: Assign to Teacher -->
            <div class="border-t border-gray-200 pt-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                Assign to Teacher
              </h4>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Select Teacher</label>
                <select name="assigned_teacher_id" id="teacherSelect" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white">
                  <option value="">No Teacher Assigned (Optional)</option>
                </select>
                <p class="text-xs text-gray-500 mt-1">You can assign the task now or later</p>
              </div>
            </div>

            <!-- Step 3: Send Message (Optional, shown when teacher is selected) -->
            <div id="messageSection" class="border-t border-gray-200 pt-6 hidden">
              <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                Send Notification Message (Optional)
              </h4>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Message to Teacher</label>
                <textarea name="message_text" id="teacherMessage" rows="4" placeholder="Enter a message to notify the teacher about this task..." class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"></textarea>
                <p class="text-xs text-gray-500 mt-1">This message will be sent to the assigned teacher after task creation</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button type="button" id="cancelUploadBtn" class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all">Cancel</button>
            <button type="submit" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              Create Task & Assign
            </button>
          </div>
          <p id="uploadErr" class="text-red-600 text-sm mt-4 text-center"></p>
        </form>
      </div>
    </dialog>

    <!-- Edit Dialog -->
    <dialog id="editDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-xl shadow-2xl w-full max-w-2xl mx-auto p-0">
      <div class="bg-white rounded-xl overflow-hidden">
        <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-full p-2">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white">Edit Task</h3>
                <p class="text-sm text-green-100">Update task details and assignment</p>
              </div>
            </div>
            <button id="cancelEdit" class="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-green-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <form id="editForm" method="dialog" class="p-6 md:p-8">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Task Name</label>
              <input name="task_name" placeholder="Enter task name" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select name="status" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white" required>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Assigned Teacher</label>
              <select name="assigned_teacher_id" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white">
                <option value="">No Teacher Assigned</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Select a teacher to assign this task</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button type="button" id="cancelEditBtn" class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all">Cancel</button>
            <button type="submit" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Update Task
            </button>
          </div>
          <p id="editErr" class="text-red-600 text-sm mt-4 text-center"></p>
        </form>
      </div>
    </dialog>

    <!-- View Dialog -->
    <dialog id="viewDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-xl shadow-2xl w-full max-w-3xl mx-auto p-0">
      <div class="bg-white rounded-xl overflow-hidden">
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-full p-2">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white">Task Details</h3>
                <p class="text-sm text-indigo-100">View complete task information</p>
              </div>
            </div>
            <button id="closeView" class="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-indigo-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6 md:p-8">
          <div id="viewContent" class="space-y-6">
            <!-- Content will be populated dynamically -->
          </div>
          <div class="flex justify-end pt-6 mt-6 border-t border-gray-200">
            <button id="closeViewBtn" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md hover:shadow-lg transition-all">Close</button>
          </div>
        </div>
      </div>
    </dialog>

    <!-- Delete Confirmation Dialog -->
    <dialog id="deleteDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-xl shadow-2xl w-full max-w-xl mx-auto p-0">
      <div class="bg-white rounded-xl overflow-hidden">
        <div class="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-full p-2">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-white">Delete Task</h3>
                <p class="text-sm text-red-100">This action cannot be undone</p>
              </div>
            </div>
            <button id="cancelDelete" class="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-red-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6 md:p-8">
          <div id="deleteTaskInfo" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <p class="text-gray-800 font-medium mb-2">Task Information:</p>
            <div id="deleteTaskDetails" class="text-sm text-gray-600 space-y-1">
              <!-- Task details will be populated here -->
            </div>
          </div>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div>
                <p class="text-sm font-semibold text-yellow-800 mb-1">Warning: Permanent Deletion</p>
                <p class="text-sm text-yellow-700">Deleting this task will permanently remove:</p>
                <ul class="text-sm text-yellow-700 mt-2 ml-4 list-disc space-y-1">
                  <li>The task and all its data</li>
                  <li>All associated contacts</li>
                  <li>All call logs related to this task</li>
                </ul>
                <p class="text-sm font-medium text-yellow-800 mt-2">This action cannot be undone!</p>
              </div>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3">
            <button id="cancelDeleteBtn" class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all">Cancel</button>
            <button id="confirmDelete" class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete Task Permanently
            </button>
          </div>
          <p id="deleteErr" class="text-red-600 text-sm mt-4 text-center"></p>
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
      
      const progressPercent = stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0;
      const content = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Task Information Card -->
          <div class="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border-2 border-indigo-100">
            <h4 class="text-sm font-semibold text-indigo-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Task Information
            </h4>
            <div class="space-y-4">
              <div>
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Task Name</label>
                <p class="text-lg font-semibold text-gray-900 mt-1">${task.task_name || 'N/A'}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</label>
                <div class="mt-1">
                  <span class="px-3 py-1.5 text-sm font-semibold rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }">${task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}</span>
                </div>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Assigned Teacher</label>
                <p class="text-base font-medium text-gray-900 mt-1">${teacherName}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Created Date</label>
                <p class="text-base text-gray-700 mt-1">${task.created_at ? new Date(task.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</p>
              </div>
            </div>
          </div>

          <!-- Statistics Card -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-100">
            <h4 class="text-sm font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Statistics
            </h4>
            <div class="space-y-4">
              <div class="grid grid-cols-3 gap-3">
                <div class="text-center bg-white rounded-lg p-3 shadow-sm">
                  <p class="text-2xl font-bold text-indigo-600">${stats?.total || 0}</p>
                  <p class="text-xs text-gray-600 mt-1">Total</p>
                </div>
                <div class="text-center bg-white rounded-lg p-3 shadow-sm">
                  <p class="text-2xl font-bold text-green-600">${stats?.completed || 0}</p>
                  <p class="text-xs text-gray-600 mt-1">Completed</p>
                </div>
                <div class="text-center bg-white rounded-lg p-3 shadow-sm">
                  <p class="text-2xl font-bold text-yellow-600">${stats?.pending || 0}</p>
                  <p class="text-xs text-gray-600 mt-1">Pending</p>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs font-medium text-gray-600 uppercase tracking-wide">Progress</label>
                  <span class="text-sm font-bold text-purple-700">${progressPercent}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div class="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-1" style="width: ${progressPercent}%">
                    ${progressPercent > 10 ? `<span class="text-xs text-white font-semibold">${progressPercent}%</span>` : ''}
                  </div>
                </div>
                ${progressPercent <= 10 ? `<p class="text-xs text-gray-500 mt-1 text-right">${progressPercent}% complete</p>` : ''}
              </div>
            </div>
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
    const errorEl = document.getElementById('deleteErr');
    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    
    errorEl.textContent = '';
    
    // Disable buttons during deletion
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Deleting...
      `;
    }
    if (cancelBtn) cancelBtn.disabled = true;
    
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
      
      // Success - show success message
      errorEl.className = 'text-green-600 text-sm mt-4 text-center font-semibold';
      errorEl.textContent = '✓ Task deleted successfully!';
      
      // Close dialog and reload after a short delay
      setTimeout(() => {
        document.getElementById('deleteDlg').close();
        load();
      }, 1500);
      
    } catch (err) {
      console.error('Delete error:', err);
      errorEl.className = 'text-red-600 text-sm mt-4 text-center';
      errorEl.textContent = err.message || 'Failed to delete task. Please try again.';
    } finally {
      // Re-enable buttons
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Delete Task Permanently
        `;
      }
      if (cancelBtn) cancelBtn.disabled = false;
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
        
        // Fetch and display task details in delete dialog
        try {
          const res = await fetch(`${apiBase}/admin/task/${id}`, { headers: { ...authHeader() } });
          const json = await res.json();
          const task = json.task;
          
          if (task) {
            const teacherName = task.assigned_teacher_id ? (teachersMap.get(task.assigned_teacher_id)?.name || task.assigned_teacher_id) : 'No Teacher Assigned';
            const stats = json.stats || {};
            
            const taskDetails = `
              <p><span class="font-semibold">Task Name:</span> ${task.task_name || 'N/A'}</p>
              <p><span class="font-semibold">Assigned Teacher:</span> ${teacherName}</p>
              <p><span class="font-semibold">Status:</span> 
                <span class="px-2 py-1 text-xs rounded-full ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }">${task.status}</span>
              </p>
              <p><span class="font-semibold">Total Contacts:</span> ${stats.total || 0}</p>
              <p><span class="font-semibold">Created:</span> ${task.created_at ? new Date(task.created_at).toLocaleString() : 'N/A'}</p>
            `;
            
            document.getElementById('deleteTaskDetails').innerHTML = taskDetails;
          }
        } catch (err) {
          console.error('Error fetching task details:', err);
          document.getElementById('deleteTaskDetails').innerHTML = '<p class="text-gray-600">Unable to load task details</p>';
        }
        
        // Clear any previous error messages
        document.getElementById('deleteErr').textContent = '';
        
        document.getElementById('deleteDlg').showModal();
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      alert('Error loading tasks: ' + error.message);
    }
  };

  // Populate teacher dropdown for upload dialog
  const populateTeacherDropdown = async () => {
    try {
      const teachersRes = await fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } });
      const teachersJson = await teachersRes.json();
      
      const uploadTeacherSelect = document.getElementById('teacherSelect');
      if (uploadTeacherSelect) {
        uploadTeacherSelect.innerHTML = '<option value="">No Teacher Assigned (Optional)</option>' + 
          (teachersJson.teachers || []).map(t => `<option value="${t.teacher_id}">${t.name}</option>`).join('');
      }
    } catch (error) {
      console.error('Error populating teacher dropdown:', error);
    }
  };

  // Upload/Create Task dialog
  const uploadDlg = document.getElementById('uploadDlg');
  const teacherSelect = document.getElementById('teacherSelect');
  const messageSection = document.getElementById('messageSection');
  
  // Show/hide message section based on teacher selection
  if (teacherSelect) {
    teacherSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        messageSection.classList.remove('hidden');
      } else {
        messageSection.classList.add('hidden');
        document.getElementById('teacherMessage').value = '';
      }
    });
  }
  
  document.getElementById('openUpload').addEventListener('click', async () => {
    await populateTeacherDropdown();
    uploadDlg.showModal();
    // Reset form
    document.getElementById('uploadForm').reset();
    messageSection.classList.add('hidden');
    document.getElementById('uploadErr').textContent = '';
  });
  
  document.getElementById('cancelUpload').addEventListener('click', () => {
    document.getElementById('uploadForm').reset();
    messageSection.classList.add('hidden');
    document.getElementById('uploadErr').textContent = '';
    uploadDlg.close();
  });
  
  document.getElementById('cancelUploadBtn').addEventListener('click', () => {
    document.getElementById('uploadForm').reset();
    messageSection.classList.add('hidden');
    document.getElementById('uploadErr').textContent = '';
    uploadDlg.close();
  });
  
  document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('uploadErr');
    const submitBtn = e.currentTarget.querySelector('button[type="submit"]');
    
    errorEl.textContent = '';
    
    // Disable button during upload
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Creating Task...
      `;
    }
    
    const fd = new FormData(e.currentTarget);
    const assignedTeacherId = fd.get('assigned_teacher_id');
    const messageText = fd.get('message_text');
    
    try {
      // Step 1: Upload file and create task
      const res = await fetch(`${apiBase}/admin/task/upload`, {
        method: 'POST',
        headers: { ...authHeader() },
        body: fd
      });
      
      // Check content type before parsing JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned an invalid response. Please check backend server is running and configured correctly.');
      }
      
      const json = await res.json();
      
      if (!res.ok) {
        if (json.errors && Array.isArray(json.errors)) {
          const errorMessages = json.errors.map(err => err.msg || err.message || 'Validation error').join(', ');
          throw new Error(errorMessages);
        }
        
        // Provide more helpful error messages
        let errorMessage = json.message || 'Task creation failed';
        if (errorMessage.includes('S3') || errorMessage.includes('AWS') || errorMessage.includes('credentials')) {
          errorMessage = `AWS S3 Error: ${json.error || errorMessage}. Please check AWS credentials in backend .env file.`;
          if (json.aws_config) {
            errorMessage += `\n\nCurrent AWS Config:\n- Bucket: ${json.aws_config.bucket || 'Not set'}\n- Region: ${json.aws_config.region || 'Not set'}\n- Has Credentials: ${json.aws_config.has_credentials ? 'Yes' : 'No'}`;
          }
        } else if (errorMessage.includes('Excel') || errorMessage.includes('parse')) {
          errorMessage = 'Failed to parse Excel file. Please ensure the file has "Student Name" and "Phone" columns.';
        }
        
        throw new Error(errorMessage);
      }
      
      const taskId = json.task?.task_id || json.task_id;
      
      // Step 2: If teacher is assigned but not in upload, assign the task
      if (assignedTeacherId && taskId) {
        // Check if task was already assigned during upload
        // If not, assign it now
        const assignRes = await fetch(`${apiBase}/admin/task/assign/${encodeURIComponent(assignedTeacherId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify({ task_id: taskId })
        });
        
        if (!assignRes.ok) {
          console.warn('Task created but assignment failed');
        }
      }
      
      // Step 3: If message is provided and teacher is assigned, send message to MongoDB
      if (messageText && assignedTeacherId && messageText.trim()) {
        try {
          const messageRes = await fetch(`${apiBase}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify({
              receiver_teacher_id: assignedTeacherId,
              message_text: messageText.trim()
            })
          });
          
          if (!messageRes.ok) {
            const msgError = await messageRes.json().catch(() => ({ message: 'Failed to send message' }));
            console.warn('Task created but message sending failed:', msgError.message);
          } else {
            console.log('Message saved to MongoDB successfully');
          }
        } catch (msgErr) {
          console.warn('Error sending message:', msgErr);
          // Don't fail the whole operation if message fails
        }
      }
      
      // Success
      errorEl.className = 'text-green-600 text-sm mt-4 text-center font-semibold';
      errorEl.textContent = '✓ Task created successfully!';
      
      if (assignedTeacherId && messageText) {
        errorEl.textContent += ' Task assigned and message sent to teacher.';
      } else if (assignedTeacherId) {
        errorEl.textContent += ' Task assigned to teacher.';
      }
      
      // Close dialog and reload after delay
      setTimeout(() => {
        uploadDlg.close();
        e.currentTarget.reset();
        messageSection.classList.add('hidden');
        errorEl.className = 'text-red-600 text-sm mt-4 text-center';
        load();
      }, 2000);
      
    } catch (err) {
      console.error('Upload error:', err);
      errorEl.textContent = err.message || 'Failed to create task. Please try again.';
    } finally {
      // Re-enable button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          Create Task & Assign
        `;
      }
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
      // Show success message
      const errorEl = document.getElementById('editErr');
      errorEl.className = 'text-green-600 text-sm mt-4 text-center font-semibold';
      errorEl.textContent = '✓ Task updated successfully!';
      
      // Close dialog and reload after delay
      setTimeout(() => {
        editDlg.close();
        load();
        errorEl.textContent = '';
        errorEl.className = 'text-red-600 text-sm mt-4 text-center';
      }, 1500);
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
  document.getElementById('cancelDelete').addEventListener('click', () => {
    document.getElementById('deleteErr').textContent = '';
    document.getElementById('deleteErr').className = 'text-red-600 text-sm mt-4 text-center';
    deleteDlg.close();
  });
  document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    document.getElementById('deleteErr').textContent = '';
    document.getElementById('deleteErr').className = 'text-red-600 text-sm mt-4 text-center';
    deleteDlg.close();
  });
  document.getElementById('confirmDelete').addEventListener('click', () => {
    if (currentDeleteId) {
      deleteTask(currentDeleteId);
    }
  });

  load();
}