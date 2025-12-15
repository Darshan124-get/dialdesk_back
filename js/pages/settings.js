import { renderLayout, bindLayoutEvents } from '../components/layout.js';
import { apiBase, authHeader, getToken } from '../utils/auth.js';
import { navigate } from '../app.js';

export function renderSettings() {
  if (!getToken()) return navigate('#/login');
  const app = document.getElementById('app');
  const content = `
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
      <p class="text-gray-600">Manage your account settings and preferences</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Image Section -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
          <div class="flex flex-col items-center">
            <div class="relative mb-4">
              <div id="profileImageContainer" class="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-white shadow-lg">
                <img id="profileImage" src="" alt="Profile" class="w-full h-full object-cover hidden" />
                <span id="profileInitial" class="text-4xl"></span>
              </div>
              <label for="imageUpload" class="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-2 cursor-pointer hover:bg-purple-700 transition-colors shadow-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </label>
              <input type="file" id="imageUpload" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" class="hidden" />
            </div>
            <p class="text-xs text-gray-500 text-center mb-4">Click the camera icon to upload a new profile picture</p>
            <p id="imageMsg" class="text-sm text-center"></p>
          </div>
        </div>
      </div>

      <!-- Profile Information Section -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">Profile Information</h3>
          <form id="profileForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input name="name" id="nameInput" type="text" placeholder="Enter your full name" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" required />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input name="email" id="emailInput" type="email" placeholder="your.email@example.com" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" required />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input name="phone" id="phoneInput" type="tel" placeholder="+1 (555) 123-4567" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Department</label>
              <input name="department" id="departmentInput" type="text" placeholder="e.g., Administration, IT, Operations" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea name="bio" id="bioInput" rows="3" placeholder="Tell us about yourself..." class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"></textarea>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea name="address" id="addressInput" rows="2" placeholder="Your address (optional)" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"></textarea>
            </div>

            <div class="flex justify-end pt-4 border-t border-gray-200">
              <button type="submit" id="saveProfileBtn" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Save Changes
              </button>
            </div>
            <p id="profileMsg" class="text-sm text-center"></p>
          </form>
        </div>
      </div>
    </div>

    <!-- Password Change Section -->
    <div class="mt-6 bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
      <h3 class="text-xl font-semibold text-gray-900 mb-6">Change Password</h3>
      <form id="pwForm" class="space-y-6 max-w-md">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Current Password (Optional)</label>
          <div class="relative">
            <input name="current_password" type="password" id="currentPassword" placeholder="Enter current password" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" />
            <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 focus:outline-none transition-colors" onclick="togglePasswordVisibility('currentPassword', this)">
              <svg id="currentPasswordIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">Leave blank if you want to reset without current password</p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
          <div class="relative">
            <input name="new_password" type="password" id="newPassword" placeholder="Enter new password (min 6 characters)" class="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" required />
            <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 focus:outline-none transition-colors" onclick="togglePasswordVisibility('newPassword', this)">
              <svg id="newPasswordIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
        </div>
        <div class="flex justify-end">
          <button type="submit" id="changePasswordBtn" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>
            Change Password
          </button>
        </div>
        <p id="pwMsg" class="text-sm text-center"></p>
      </form>
    </div>
  `;
  app.innerHTML = renderLayout(content);
  bindLayoutEvents();

  // Load admin profile
  loadProfile();

  // Profile image upload
  const imageUpload = document.getElementById('imageUpload');
  imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const msgEl = document.getElementById('imageMsg');
    msgEl.textContent = '';
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      msgEl.textContent = 'Image size must be less than 5MB';
      msgEl.className = 'text-red-600 text-sm';
      return;
    }

    const formData = new FormData();
    formData.append('profile_image', file);

    try {
      msgEl.textContent = 'Uploading image...';
      msgEl.className = 'text-blue-600 text-sm';
      
      const res = await fetch(`${apiBase}/admin/profile/upload-image`, {
        method: 'POST',
        headers: { ...authHeader() },
        body: formData
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Failed to upload image');
      }

      // Update profile image display
      updateProfileImage(json.profile_image_url);
      
      msgEl.textContent = '✓ Profile image uploaded successfully!';
      msgEl.className = 'text-green-600 text-sm';
      
      // Update localStorage
      localStorage.setItem('admin_profile_image', json.profile_image_url);
      
      setTimeout(() => {
        msgEl.textContent = '';
      }, 3000);
    } catch (err) {
      console.error('Image upload error:', err);
      msgEl.textContent = err.message || 'Failed to upload image';
      msgEl.className = 'text-red-600 text-sm';
    }
  });

  // Profile form submission
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('profileMsg');
    const submitBtn = document.getElementById('saveProfileBtn');
    
    msgEl.textContent = '';
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Saving...
      `;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name')?.trim(),
      email: formData.get('email')?.trim(),
      additional_info: {
        phone: formData.get('phone')?.trim() || '',
        department: formData.get('department')?.trim() || '',
        bio: formData.get('bio')?.trim() || '',
        address: formData.get('address')?.trim() || ''
      }
    };

    try {
      const res = await fetch(`${apiBase}/admin/profile`, {
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
        throw new Error(json.message || 'Failed to update profile');
      }

      msgEl.textContent = '✓ Profile updated successfully!';
      msgEl.className = 'text-green-600 text-sm font-semibold';
      
      // Update localStorage
      if (json.admin) {
        localStorage.setItem('admin_name', json.admin.name || '');
        localStorage.setItem('admin_email', json.admin.email || '');
      }
      
      setTimeout(() => {
        msgEl.textContent = '';
      }, 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      msgEl.textContent = err.message || 'Failed to update profile';
      msgEl.className = 'text-red-600 text-sm';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Save Changes
        `;
      }
    }
  });

  // Password form submission
  document.getElementById('pwForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('pwMsg');
    const submitButton = document.getElementById('changePasswordBtn');
    
    msg.textContent = '';
    
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = `
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Changing...
      `;
    }
    
    const formData = new FormData(e.currentTarget);
    const data = {
      current_password: formData.get('current_password') || undefined,
      new_password: formData.get('new_password')
    };
    
    if (!data.new_password || data.new_password.length < 6) {
      msg.textContent = 'New password must be at least 6 characters';
      msg.className = 'text-red-600 text-sm';
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
          Change Password
        `;
      }
      return;
    }
    
    try {
      const res = await fetch(`${apiBase}/admin/change-password`, {
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
        throw new Error(json.message || 'Password change failed');
      }
      
      msg.textContent = '✓ Password changed successfully!';
      msg.className = 'text-green-600 text-sm font-semibold';
      e.currentTarget.reset();
      
      setTimeout(() => {
        msg.textContent = '';
      }, 3000);
    } catch (err) {
      console.error('Password change error:', err);
      msg.textContent = err.message || 'Failed to change password. Please try again.';
      msg.className = 'text-red-600 text-sm';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
          Change Password
        `;
      }
    }
  });

  // Load profile function
  async function loadProfile() {
    try {
      const res = await fetch(`${apiBase}/admin/profile`, {
        headers: { ...authHeader() }
      });

      if (!res.ok) throw new Error('Failed to load profile');

      const json = await res.json();
      const admin = json.admin;

      if (admin) {
        // Populate form fields
        document.getElementById('nameInput').value = admin.name || '';
        document.getElementById('emailInput').value = admin.email || '';
        document.getElementById('phoneInput').value = admin.additional_info?.phone || '';
        document.getElementById('departmentInput').value = admin.additional_info?.department || '';
        document.getElementById('bioInput').value = admin.additional_info?.bio || '';
        document.getElementById('addressInput').value = admin.additional_info?.address || '';

        // Update profile image
        updateProfileImage(admin.profile_image_url, admin.name);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }

  // Update profile image display
  function updateProfileImage(imageUrl, name) {
    const profileImage = document.getElementById('profileImage');
    const profileInitial = document.getElementById('profileInitial');
    const container = document.getElementById('profileImageContainer');

    if (imageUrl) {
      profileImage.src = imageUrl;
      profileImage.classList.remove('hidden');
      profileInitial.classList.add('hidden');
      container.classList.remove('from-purple-500', 'to-purple-600');
    } else {
      profileImage.classList.add('hidden');
      profileInitial.classList.remove('hidden');
      container.classList.add('from-purple-500', 'to-purple-600');
      const initial = name ? name.charAt(0).toUpperCase() : 'A';
      profileInitial.textContent = initial;
    }
  }
  
  // Password visibility toggle function
  window.togglePasswordVisibility = function(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('svg');
    
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
