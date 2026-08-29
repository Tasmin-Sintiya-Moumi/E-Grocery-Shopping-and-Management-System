const API_BASE = 'https://e-grocery-shopping-and-management-system.onrender.com/api';

function getToken() {
  return localStorage.getItem('token');
}

async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

const Api = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload }),

  getProducts: (query = '') => apiRequest(`/products${query}`),
  getProduct: (id) => apiRequest(`/products/${id}`),
  createProduct: (payload) => apiRequest('/products', { method: 'POST', body: payload, auth: true }),
  updateProduct: (id, payload) => apiRequest(`/products/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE', auth: true }),

  getCategories: () => apiRequest('/categories'),

  getCart: () => apiRequest('/cart', { auth: true }),
  addToCart: (product_id, quantity = 1) =>
    apiRequest('/cart', { method: 'POST', body: { product_id, quantity }, auth: true }),
  updateCartItem: (productId, quantity) =>
    apiRequest(`/cart/${productId}`, { method: 'PUT', body: { quantity }, auth: true }),
  removeCartItem: (productId) => apiRequest(`/cart/${productId}`, { method: 'DELETE', auth: true }),

  checkout: (shipping_address) =>
    apiRequest('/orders/checkout', { method: 'POST', body: { shipping_address }, auth: true }),
  getOrders: () => apiRequest('/orders', { auth: true }),
  getOrder: (id) => apiRequest(`/orders/${id}`, { auth: true }),
   getAllOrders: () => apiRequest('/orders/all', { auth: true }),
  updateOrderStatus: (id, status) =>
    apiRequest(`/orders/${id}/status`, { method: 'PUT', body: { status }, auth: true })
};
