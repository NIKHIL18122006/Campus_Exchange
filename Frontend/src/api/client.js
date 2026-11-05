const BASE = `${import.meta.env.VITE_API_URL}/api`;
const TOKEN_KEY = 'ce_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const token = tokenStore.get();
  const isForm = body instanceof FormData;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // A 401 while holding a token means it's expired or invalid: log out.
    // Wrong-password 401s happen with no token, so they don't trigger this.
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(data?.error || 'Something went wrong', res.status, data);
  }
  return data;
}