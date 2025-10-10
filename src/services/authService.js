import apiService from './apiService.js';

// Token Manager Class
class AuthTokenManager {
  constructor() {
    this.csrfToken = null;
  }

  // Login and store tokens
  async login(emailOrUsername, password) {
    try {
      // Use email-only sign in
      const credentials = { email: emailOrUsername, password };

      // Always use real API
      const result = await apiService.signIn(credentials);

      // Treat presence of data/meta as success for real API
      if (result && result.data && result.meta) {
        const attributes = result.data.attributes || {};
        const user = {
          id: result.data.id || attributes.id || null,
          email: attributes.email || null,
          role: (attributes.role || 'employee').toLowerCase(),
          first_name: attributes.first_name || '',
          last_name: attributes.last_name || ''
        };

        const token = result?.meta?.token || null;
        const csrf = result?.meta?.csrf_token || null;
        this.csrfToken = csrf;

        if (user) {
          localStorage.setItem('user_data', JSON.stringify(user));
        }

        apiService.setTokens(token || null, csrf || null);
        return { success: true, user, token };
      }

      // Fallback: if API returned a structured error
      return { success: false, error: result?.error || result?.message || 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get CSRF token for requests
  getCSRFToken() {
    return this.csrfToken || localStorage.getItem('xsrf_token');
  }

  // Logout
  async logout() {
    try {
      const result = await apiService.signOut();
      this.csrfToken = null;
      // Clear stored user data
      localStorage.removeItem('user_data');
      return result.success;
    } catch (error) {
      console.error('Logout failed:', error);
      this.csrfToken = null;
      // Clear stored user data even if logout fails
      localStorage.removeItem('user_data');
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    // Prefer server-backed jwt token
    try {
      if (apiService && typeof apiService.isAuthenticated === 'function') {
        const apiAuth = apiService.isAuthenticated();
        if (apiAuth) return true;
      }
    } catch (e) {
      // ignore and fall back to local data
    }

    // Fallback: if we have stored user data, treat as authenticated for UI routing
    try {
      return Boolean(localStorage.getItem('user_data')) || false;
    } catch (e) {
      return false;
    }
  }

  // Get current user in a router-friendly shape { success, data }
  async getCurrentUser() {
    try {
      // Prefer calling API if available
      if (typeof apiService.getCurrentUser === 'function') {
        const res = await apiService.getCurrentUser();
        // If API returns an object with success/data, forward it
        if (res && (res.success || res.data)) {
          const data = res.data || res;
          try { localStorage.setItem('user_data', JSON.stringify(data)); } catch (e) {}
          return { success: true, data };
        }
      }

      // Fallback - return stored user data from login
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        return { success: true, data: JSON.parse(storedUser) };
      }

      return { success: false, error: 'No user data available' };
    } catch (error) {
      console.error('getCurrentUser failed:', error);
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        return { success: true, data: JSON.parse(storedUser) };
      }
      return { success: false, error: error.message };
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      // Since /me endpoint doesn't exist, return stored user data from login
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error('Get user profile failed:', error);
      return null;
    }
  }

  // Register new user
  async register(userData) {
    try {
      const user = await apiService.createUser(userData);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Global instance
const authManager = new AuthTokenManager();

export default authManager;
