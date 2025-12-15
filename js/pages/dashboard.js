import { renderLayout, bindLayoutEvents } from '../components/layout.js';
import { apiBase, authHeader, getToken } from '../utils/auth.js';
import { navigate } from '../app.js';

export function renderDashboard() {
  if (!getToken()) return navigate('#/login');
  const app = document.getElementById('app');
  const content = `
    <!-- Welcome Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
      <p class="text-gray-600">Here's what's happening with your tasks today</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Teachers Card -->
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="bg-white bg-opacity-20 rounded-lg p-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
          <span class="text-purple-200 text-sm font-medium">Total</span>
        </div>
        <div class="text-3xl font-bold mb-1" id="stat-teachers">-</div>
        <div class="text-purple-100 text-sm">Active Teachers</div>
      </div>

      <!-- Active Tasks Card -->
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="bg-white bg-opacity-20 rounded-lg p-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <span class="text-blue-200 text-sm font-medium">Active</span>
        </div>
        <div class="text-3xl font-bold mb-1" id="stat-tasks">-</div>
        <div class="text-blue-100 text-sm">Tasks in Progress</div>
      </div>

      <!-- Calls Today Card -->
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="bg-white bg-opacity-20 rounded-lg p-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          </div>
          <span class="text-green-200 text-sm font-medium">Today</span>
        </div>
        <div class="text-3xl font-bold mb-1" id="stat-calls">-</div>
        <div class="text-green-100 text-sm">Calls Made</div>
      </div>

      <!-- Reports Card -->
      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="bg-white bg-opacity-20 rounded-lg p-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <span class="text-orange-200 text-sm font-medium">Completed</span>
        </div>
        <div class="text-3xl font-bold mb-1" id="stat-reports">-</div>
        <div class="text-orange-100 text-sm">Reports Submitted</div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Tasks Status Chart -->
      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">Tasks Overview</h3>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span>Status Distribution</span>
          </div>
        </div>
        <div class="h-64">
          <canvas id="tasksChart"></canvas>
        </div>
      </div>

      <!-- Activity Chart -->
      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">Weekly Activity</h3>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>Last 7 Days</span>
          </div>
        </div>
        <div class="h-64">
          <canvas id="activityChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Recent Activity & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Tasks -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">Recent Tasks</h3>
          <a href="#/tasks" class="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1">
            View All
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
        <div id="recentTasks" class="space-y-4">
          <div class="flex items-center justify-center py-8 text-gray-400">
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <p>Loading tasks...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h3 class="text-xl font-bold mb-6">Quick Actions</h3>
        <div class="space-y-3">
          <a href="#/teachers" class="block bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-lg p-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <div>
                <p class="font-semibold">Add Teacher</p>
                <p class="text-xs text-purple-200">Create new teacher account</p>
              </div>
            </div>
          </a>
          <a href="#/tasks" class="block bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-lg p-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              <div>
                <p class="font-semibold">Create Task</p>
                <p class="text-xs text-purple-200">Upload Excel & assign</p>
              </div>
            </div>
          </a>
          <a href="#/messages" class="block bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all">
            <div class="flex items-center gap-3">
              <div class="bg-white bg-opacity-20 rounded-lg p-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <div>
                <p class="font-semibold">Send Message</p>
                <p class="text-xs text-purple-200">Notify teachers</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  `;
  app.innerHTML = renderLayout(content);
  bindLayoutEvents();

  // Load statistics
  Promise.all([
    fetch(`${apiBase}/admin/teachers`, { headers: { ...authHeader() } })
      .then(r => r.ok ? r.json() : { teachers: [] })
      .catch(() => ({ teachers: [] })),
    fetch(`${apiBase}/admin/tasks`, { headers: { ...authHeader() } })
      .then(r => r.ok ? r.json() : { tasks: [] })
      .catch(() => ({ tasks: [] })),
    fetch(`${apiBase}/reports?date=${new Date().toISOString().slice(0,10)}`, { headers: { ...authHeader() } })
      .then(r => r.ok ? r.json() : { logs: [] })
      .catch(() => ({ logs: [] }))
  ]).then(([teachers, tasks, logs]) => {
    // Update stats
    const teachersEl = document.getElementById('stat-teachers');
    const tasksEl = document.getElementById('stat-tasks');
    const callsEl = document.getElementById('stat-calls');
    const reportsEl = document.getElementById('stat-reports');
    
    if (teachersEl) teachersEl.textContent = (teachers.teachers || []).length;
    if (tasksEl) tasksEl.textContent = (tasks.tasks || []).filter(x => x.status !== 'completed').length;
    if (callsEl) callsEl.textContent = (logs.logs || []).length;
    if (reportsEl) reportsEl.textContent = (tasks.tasks || []).filter(x => x.status === 'completed').length;

    // Prepare chart data
    const taskList = tasks.tasks || [];
    const pending = taskList.filter(t => t.status === 'pending').length;
    const inProgress = taskList.filter(t => t.status === 'in-progress').length;
    const completed = taskList.filter(t => t.status === 'completed').length;

    // Tasks Status Pie Chart
    const tasksCtx = document.getElementById('tasksChart');
    if (tasksCtx && typeof Chart !== 'undefined') {
      new Chart(tasksCtx, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'In Progress', 'Completed'],
          datasets: [{
            data: [pending, inProgress, completed],
            backgroundColor: [
              'rgb(251, 191, 36)',
              'rgb(59, 130, 246)',
              'rgb(34, 197, 94)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 12 }
              }
            }
          }
        }
      });
    }

    // Activity Line Chart (Last 7 days)
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx && typeof Chart !== 'undefined') {
      const last7Days = [];
      const callsData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        // For demo, using random data - replace with actual API call for daily stats
        callsData.push(Math.floor(Math.random() * 20) + 5);
      }

      new Chart(activityCtx, {
        type: 'line',
        data: {
          labels: last7Days,
          datasets: [{
            label: 'Calls Made',
            data: callsData,
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }

    // Recent Tasks
    const recentTasksEl = document.getElementById('recentTasks');
    if (recentTasksEl) {
      const recentTasks = taskList.slice(0, 5);
      if (recentTasks.length === 0) {
        recentTasksEl.innerHTML = `
          <div class="text-center py-8 text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p>No tasks yet</p>
          </div>
        `;
      } else {
        recentTasksEl.innerHTML = recentTasks.map(task => {
          const statusColor = task.status === 'completed' ? 'bg-green-100 text-green-800' :
                             task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                             'bg-yellow-100 text-yellow-800';
          return `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex-1">
                <p class="font-semibold text-gray-900">${task.task_name || `Task ${task.task_id.slice(0, 8)}`}</p>
                <p class="text-sm text-gray-500 mt-1">${task.created_at ? new Date(task.created_at).toLocaleDateString() : ''}</p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColor}">${task.status}</span>
            </div>
          `;
        }).join('');
      }
    }
  });
}
