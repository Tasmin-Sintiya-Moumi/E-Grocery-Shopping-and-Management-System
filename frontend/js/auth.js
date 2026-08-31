function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function requireLogin() {
  if (!getUser()) {
    window.location.href = 'login.html';
  }
}

function renderNavAuthArea(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const user = getUser();

  if (user) {
    const isStaff = user.role === 'admin' || user.role === 'seller';
    el.innerHTML = `
      <a href="index.html">Home</a>
      ${isStaff ? '<a href="admin.html">Admin</a>' : ''}
      ${isStaff ? '<a href="order_status.html">Manage Orders</a>' : ''}
      ${!isStaff ? '<a href="orders.html">My Orders</a>' : ''}
      <a href="cart.html">Cart</a>
      <a href="about.html">About Us</a>
      <button id="logoutBtn" class="link-btn">Logout</button>
      <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', logout);
  } else {
    el.innerHTML = `
      <a href="index.html">Home</a>
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
      <a href="cart.html">Cart</a>
    `;
  }
}

function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

initTheme();
