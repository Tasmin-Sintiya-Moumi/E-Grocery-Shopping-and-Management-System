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
    el.innerHTML = `
      <span class="nav-user">Hi, ${user.name}</span>
      ${user.role === 'admin' || user.role === 'seller' ? '<a href="admin.html">Admin</a>' : ''}
      <a href="orders.html">Orders</a>
      <a href="cart.html">Cart</a>
      <button id="logoutBtn" class="link-btn">Logout</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', logout);
  } else {
    el.innerHTML = `
      <a href="login.html">Login</a>
      <a href="register.html">Register</a>
      <a href="cart.html">Cart</a>
    `;
  }
}
