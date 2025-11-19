const DEFAULT_BACKEND = 'https://ta-01kaepxaed2pj8q4hrxfmkjx5b-8000.wo-u4ujzo6vp3v63cmbfs66148d1.w.modal.host';
const BASE_URL = (import.meta.env.VITE_BACKEND_URL || (typeof window !== 'undefined' && window.__BACKEND_URL__) || DEFAULT_BACKEND).replace(/\/$/, '');

export const api = {
  base: BASE_URL,
  async get(path, params = {}) {
    const url = new URL(BASE_URL + path);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.append(k, v);
    });
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('API error');
    return res.json();
  },
  async post(path, body = {}) {
    const res = await fetch(BASE_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(()=> '');
      throw new Error(text || 'API error');
    }
    return res.json();
  },
};

export function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem('user');
}
