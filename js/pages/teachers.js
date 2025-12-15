import { renderLayout, bindLayoutEvents } from '../components/layout.js';
import { apiBase, authHeader, getToken } from '../utils/auth.js';
import { navigate } from '../app.js';

function row(t) {
  const statusBadge = t.status === 'active' 
    ? '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Active</span>'
    : '<span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Inactive</span>';
  
  return `
    <tr class="hover:bg-gray-50 transition-colors">
      <td class="px-4 py-4 font-medium text-gray-900">${t.name || '-'}</td>
      <td class="px-4 py-4 text-gray-600">${t.email || '-'}</td>
      <td class="px-4 py-4 text-gray-600">${t.phone || '-'}</td>
      <td class="px-4 py-4">${statusBadge}</td>
      <td class="px-4 py-4 text-right">
        <div class="flex items-center justify-end gap-2 flex-wrap">
          <button class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors shadow-sm" data-edit="${t.teacher_id}">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Edit
          </button>
          <button class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors shadow-sm" data-del="${t.teacher_id}">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Delete
          </button>
          <button class="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm" data-reset="${t.teacher_id}">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>
            Reset
          </button>
        </div>
      </td>
    </tr>`;
}

export function renderTeachers() {
  if (!getToken()) return navigate('#/login');
  const app = document.getElementById('app');
  const content = `
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <h1 class="text-3xl font-bold text-gray-900">Teachers Management</h1>
      <button id="openCreate" class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Create Teacher
      </button>
    </div>
    <div class="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="text-left px-4 py-4 font-semibold text-gray-700">Name</th>
              <th class="text-left px-4 py-4 font-semibold text-gray-700">Email</th>
              <th class="text-left px-4 py-4 font-semibold text-gray-700">Phone</th>
              <th class="text-left px-4 py-4 font-semibold text-gray-700">Status</th>
              <th class="text-right px-4 py-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody id="teacherRows" class="divide-y divide-gray-200"></tbody>
        </table>
      </div>
    </div>

    <!-- Create Dialog -->
    <dialog id="createDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-xl shadow-2xl w-full max-w-2xl mx-auto p-0">
      <div class="bg-white rounded-xl overflow-hidden">
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-white">Create New Teacher</h3>
            <button id="cancelCreate" class="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-indigo-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <form id="createForm" method="dialog" class="p-6 md:p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input name="name" placeholder="Enter teacher's full name" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input name="email" placeholder="teacher@example.com" type="email" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input name="phone" placeholder="+1 (555) 123-4567" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" required />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div class="relative">
                <input name="password" id="createPassword" placeholder="Minimum 6 characters" type="password" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" required />
                <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" onclick="togglePasswordVisibility('createPassword', this)">
                  <svg id="createPasswordIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button type="button" id="cancelCreateBtn" class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all">Cancel</button>
            <button type="submit" class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md hover:shadow-lg transition-all">Create Teacher</button>
          </div>
          <p id="createErr" class="text-red-600 text-sm mt-4 text-center"></p>
        </form>
      </div>
    </dialog>

    <!-- Reset Password Dialog -->
    <dialog id="resetDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-xl shadow-2xl w-full max-w-xl mx-auto p-0">
      <div class="bg-white rounded-xl overflow-hidden">
        <div class="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-white">Reset Teacher Password</h3>
            <button id="cancelReset" class="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <form id="resetForm" method="dialog" class="p-6 md:p-8">
          <div class="mb-6">
            <p class="text-gray-600 mb-4">Enter a new password for this teacher. The password must be at least 6 characters long.</p>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <div class="relative">
                <input name="new_password" id="resetNewPassword" type="password" placeholder="Enter new password (min 6 characters)" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 text-base focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all" required />
                <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" onclick="togglePasswordVisibility('resetNewPassword', this)">
                  <svg id="resetNewPasswordIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>
            <div class="mt-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div class="relative">
                <input name="confirm_password" id="resetConfirmPassword" type="password" placeholder="Confirm new password" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 text-base focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all" required />
                <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none" onclick="togglePasswordVisibility('resetConfirmPassword', this)">
                  <svg id="resetConfirmPasswordIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button type="button" id="cancelResetBtn" class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all">Cancel</button>
            <button type="submit" class="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium shadow-md hover:shadow-lg transition-all">Reset Password</button>
          </div>
          <p id="resetErr" class="text-red-600 text-sm mt-4 text-center"></p>
        </form>
      </div>
    </dialog>

    <!-- Edit Dialog -->
    <dialog id="editDlg" class="backdrop:bg-black backdrop:bg-opacity-50 rounded-xl shadow-2xl w-full max-w-2xl mx-auto p-0">
      <div class="bg-white rounded-xl overflow-hidden">
        <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-white">Edit Teacher</h3>
            <button id="cancelEdit" class="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-green-800">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <form id="editForm" method="dialog" class="p-6 md:p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input name="name" placeholder="Enter teacher's full name" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input name="email" placeholder="teacher@example.com" type="email" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input name="phone" placeholder="+1 (555) 123-4567" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all" required />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select name="status" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white" required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button type="button" id="cancelEditBtn" class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all">Cancel</button>
            <button type="submit" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md hover:shadow-lg transition-all">Update Teacher</button>
          </div>
          <p id="editErr" class="text-red-600 text-sm mt-4 text-center"></p>
        </form>
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
                <h3 class="text-xl font-semibold text-white">Delete Teacher</h3>
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
          <div id="deleteTeacherInfo" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <p class="text-gray-800 font-medium mb-2">Teacher Information:</p>
            <div id="deleteTeacherDetails" class="text-sm text-gray-600 space-y-1">
              <!-- Teacher details will be populated here -->
            </div>
          </div>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div>
                <p class="text-sm font-semibold text-yellow-800 mb-1">Warning: Permanent Deletion</p>
                <p class="text-sm text-yellow-700">Deleting this teacher will permanently remove:</p>
                <ul class="text-sm text-yellow-700 mt-2 ml-4 list-disc space-y-1">
                  <li>All teacher account data</li>
                  <li>All assigned tasks and contacts</li>
                  <li>All call logs and reports</li>
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
              Delete Teacher Permanently
            </button>
          </div>
          <p id="deleteErr" class="text-red-600 text-sm mt-4 text-center"></p>
        </div>
      </div>
    </dialog>
  `;
  app.innerHTML = renderLayout(content);
  bindLayoutEvents();

  const rowsEl = document.getElementById('teacherRows');
  let currentDeleteId = null;
  
  const load = async () => {
    const res = await fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } });
    const json = await res.json();
    rowsEl.innerHTML = (json.teachers || []).map(row).join('');
    bindRowActions();
  };

  const openEditDialog = async (teacherId) => {
    try {
      // Fetch teacher data
      const res = await fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } });
      const json = await res.json();
      const teacher = (json.teachers || []).find(t => t.teacher_id === teacherId);
      
      if (!teacher) {
        alert('Teacher not found');
        return;
      }
      
      // Populate form
      document.querySelector('#editForm input[name="name"]').value = teacher.name || '';
      document.querySelector('#editForm input[name="email"]').value = teacher.email || '';
      document.querySelector('#editForm input[name="phone"]').value = teacher.phone || '';
      document.querySelector('#editForm select[name="status"]').value = teacher.status || 'active';
      
      // Store teacher ID for update
      document.getElementById('editForm').dataset.teacherId = teacherId;
      
      // Show dialog
      document.getElementById('editDlg').showModal();
    } catch (error) {
      console.error('Error opening edit dialog:', error);
      alert('Error loading teacher data: ' + error.message);
    }
  };

  const deleteTeacher = async (teacherId) => {
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
      const res = await fetch(`${apiBase}/admin/teacher/${teacherId}`, {
        method: 'DELETE',
        headers: { ...authHeader() }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Delete failed: ${res.status} ${res.statusText} - ${errorText}`);
      }
      
      // Success - show success message
      errorEl.className = 'text-green-600 text-sm mt-4 text-center font-semibold';
      errorEl.textContent = '✓ Teacher deleted successfully!';
      
      // Close dialog and reload after a short delay
      setTimeout(() => {
        document.getElementById('deleteDlg').close();
        load();
      }, 1500);
      
    } catch (err) {
      console.error('Delete error:', err);
      errorEl.className = 'text-red-600 text-sm mt-4 text-center';
      errorEl.textContent = err.message || 'Failed to delete teacher. Please try again.';
    } finally {
      // Re-enable buttons
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Delete Teacher Permanently
        `;
      }
      if (cancelBtn) cancelBtn.disabled = false;
    }
  };

  const bindRowActions = () => {
    rowsEl.querySelectorAll('button[data-del]').forEach(btn => btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del');
      currentDeleteId = id;
      
      // Fetch and display teacher details in delete dialog
      try {
        const res = await fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } });
        const json = await res.json();
        const teacher = (json.teachers || []).find(t => t.teacher_id === id);
        
        if (teacher) {
          const statusBadge = teacher.status === 'active' 
            ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>'
            : '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Inactive</span>';
          
          const teacherDetails = `
            <p><span class="font-semibold">Name:</span> ${teacher.name || 'N/A'}</p>
            <p><span class="font-semibold">Email:</span> ${teacher.email || 'N/A'}</p>
            <p><span class="font-semibold">Phone:</span> ${teacher.phone || 'N/A'}</p>
            <p><span class="font-semibold">Status:</span> ${statusBadge}</p>
          `;
          
          document.getElementById('deleteTeacherDetails').innerHTML = teacherDetails;
        }
      } catch (err) {
        console.error('Error fetching teacher details:', err);
        document.getElementById('deleteTeacherDetails').innerHTML = '<p class="text-gray-600">Unable to load teacher details</p>';
      }
      
      // Clear any previous error messages
      document.getElementById('deleteErr').textContent = '';
      document.getElementById('deleteErr').className = 'text-red-600 text-sm mt-4 text-center';
      
      document.getElementById('deleteDlg').showModal();
    }));
    
    rowsEl.querySelectorAll('button[data-reset]').forEach(btn => btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-reset');
      
      // Fetch teacher data to show name in dialog
      try {
        const res = await fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } });
        const json = await res.json();
        const teacher = (json.teachers || []).find(t => t.teacher_id === id);
        
        if (teacher) {
          // Update dialog title with teacher name
          const titleEl = document.querySelector('#resetDlg h3');
          if (titleEl) {
            titleEl.textContent = `Reset Password - ${teacher.name}`;
          }
        }
      } catch (err) {
        console.error('Error fetching teacher data:', err);
      }
      
      // Store teacher ID for reset
      document.getElementById('resetForm').dataset.teacherId = id;
      
      // Clear form and show dialog
      document.getElementById('resetForm').reset();
      document.getElementById('resetErr').textContent = '';
      document.getElementById('resetDlg').showModal();
    }));
    
    rowsEl.querySelectorAll('button[data-edit]').forEach(btn => btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-edit');
      await openEditDialog(id);
    }));
  };

  // Create dialog
  const createDlg = document.getElementById('createDlg');
  document.getElementById('openCreate').addEventListener('click', () => createDlg.showModal());
  document.getElementById('cancelCreate').addEventListener('click', () => createDlg.close());
  document.getElementById('cancelCreateBtn').addEventListener('click', () => createDlg.close());
  document.getElementById('createForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('createErr');
    errorEl.textContent = '';
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name')?.trim(),
      email: formData.get('email')?.trim(),
      phone: formData.get('phone')?.trim(),
      password: formData.get('password')
    };
    
    // Client-side validation
    if (!data.password || data.password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters';
      return;
    }
    
    try {
      const res = await fetch(`${apiBase}/admin/teacher/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        if (json.errors && Array.isArray(json.errors)) {
          const errorMessages = json.errors.map(err => err.msg || err.message || 'Validation error').join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(json.message || 'Failed to create teacher');
      }
      
      createDlg.close();
      e.currentTarget.reset();
      load();
    } catch (err) {
      errorEl.textContent = err.message || 'Failed to create teacher';
    }
  });

  // Reset Password dialog
  const resetDlg = document.getElementById('resetDlg');
  document.getElementById('cancelReset').addEventListener('click', () => resetDlg.close());
  document.getElementById('cancelResetBtn').addEventListener('click', () => resetDlg.close());
  document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const teacherId = e.currentTarget.dataset.teacherId;
    const errorEl = document.getElementById('resetErr');
    errorEl.textContent = '';
    
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('new_password');
    const confirmPassword = formData.get('confirm_password');
    
    // Client-side validation
    if (!newPassword || newPassword.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters long';
      return;
    }
    
    if (newPassword !== confirmPassword) {
      errorEl.textContent = 'Passwords do not match';
      return;
    }
    
    const submitButton = e.currentTarget.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Resetting...';
    }
    
    try {
      const res = await fetch(`${apiBase}/admin/teacher/${teacherId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ new_password: newPassword })
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        if (json.errors && Array.isArray(json.errors)) {
          const errorMessages = json.errors.map(err => err.msg || err.message || 'Validation error').join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(json.message || 'Password reset failed');
      }
      
      // Success
      errorEl.textContent = '';
      errorEl.className = 'text-green-600 text-sm mt-4 text-center';
      errorEl.textContent = 'Password reset successfully!';
      
      // Close dialog after a short delay
      setTimeout(() => {
        resetDlg.close();
        e.currentTarget.reset();
        errorEl.className = 'text-red-600 text-sm mt-4 text-center';
      }, 1500);
      
    } catch (err) {
      errorEl.textContent = err.message || 'Failed to reset password';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Reset Password';
      }
    }
  });

  // Edit dialog
  const editDlg = document.getElementById('editDlg');
  document.getElementById('cancelEdit').addEventListener('click', () => editDlg.close());
  document.getElementById('cancelEditBtn').addEventListener('click', () => editDlg.close());
  document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const teacherId = e.currentTarget.dataset.teacherId;
    const errorEl = document.getElementById('editErr');
    errorEl.textContent = '';
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name')?.trim(),
      email: formData.get('email')?.trim(),
      phone: formData.get('phone')?.trim(),
      status: formData.get('status')
    };
    
    try {
      const res = await fetch(`${apiBase}/admin/teacher/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data)
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        if (json.errors && Array.isArray(json.errors)) {
          const errorMessages = json.errors.map(err => err.msg || err.message || 'Validation error').join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(json.message || 'Failed to update teacher');
      }
      
      // Show success message
      errorEl.className = 'text-green-600 text-sm mt-4 text-center font-semibold';
      errorEl.textContent = '✓ Teacher updated successfully!';
      
      // Close dialog and reload after delay
      setTimeout(() => {
        editDlg.close();
        load();
        errorEl.textContent = '';
        errorEl.className = 'text-red-600 text-sm mt-4 text-center';
      }, 1500);
    } catch (err) {
      errorEl.textContent = err.message || 'Failed to update teacher';
    }
  });

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
      deleteTeacher(currentDeleteId);
    }
  });

  load();
  
  // Password visibility toggle function
  window.togglePasswordVisibility = function(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const icon = button.querySelector('svg');
    if (!icon) return;
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
      `;
    } else {
      input.type = 'password';
      icon.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
      `;
    }
  };
}


