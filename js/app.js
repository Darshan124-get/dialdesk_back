import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderTeachers } from './pages/teachers.js';
import { renderTasks } from './pages/tasks.js';
import { renderMessages } from './pages/messages.js';
import { renderReports } from './pages/reports.js';
import { renderSettings } from './pages/settings.js';
import { getToken, setToken, clearToken, apiBase, authHeader } from './utils/auth.js';

const routes = {
  '': () => (getToken() ? navigate('#/dashboard') : renderLogin()),
  '#/login': renderLogin,
  '#/dashboard': renderDashboard,
  '#/teachers': renderTeachers,
  '#/tasks': renderTasks,
  '#/messages': renderMessages,
  '#/reports': renderReports,
  '#/settings': renderSettings
};

export function navigate(hash) {
  window.location.hash = hash;
}

function render() {
  const hash = window.location.hash || '#/login';
  const app = document.getElementById('app');
  if (!app) return;
  const route = routes[hash] || renderLogin;
  app.innerHTML = '';
  route({ app, navigate, getToken, setToken, clearToken, apiBase, authHeader });
}

window.addEventListener('hashchange', render);
window.addEventListener('load', render);


