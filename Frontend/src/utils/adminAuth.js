// Admin session helpers. The token comes from POST /api/admin/login and lives in sessionStorage,
// so closing the tab logs the admin out. The server verifies it on every admin request.
const TOKEN_KEY = 'adminToken';
const EXPIRY_KEY = 'adminTokenExpiry';

export const setAdminSession = (token, expiresInSeconds) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresInSeconds * 1000));
};

export const clearAdminSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXPIRY_KEY);
};

// Returns the token only while it is still valid
export const getAdminToken = () => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiry = Number(sessionStorage.getItem(EXPIRY_KEY));
  if (!token || !expiry || Date.now() >= expiry) {
    if (token) clearAdminSession();
    return null;
  }
  return token;
};

export const isAdminLoggedIn = () => !!getAdminToken();

// Adds the admin token to requests and sends the admin back to the login page when the server rejects it.
// `ownsRequest` limits this to our own API so the token is never sent to another host.
export const attachAdminAuth = (axiosInstance, ownsRequest = () => true) => {
  axiosInstance.interceptors.request.use((config) => {
    const token = getAdminToken();
    if (token && ownsRequest(config) && !config.headers?.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const sentToken = !!error.config?.headers?.Authorization;
      if (error.response?.status === 401 && sentToken && window.location.pathname.startsWith('/admin')) {
        clearAdminSession();
        window.location.href = '/admin/login?expired=1';
      }
      return Promise.reject(error);
    }
  );
};
