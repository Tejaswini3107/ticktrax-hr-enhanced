import apiService from './apiService.js';

// Token Manager Class
class AuthTokenManager {
  constructor() {
    this.csrfToken = null;
  }

  // Map role_id to role name
  mapRoleIdToName(roleId) {
    const roleMap = {
      1: 'admin',      // Admin
      2: 'hr',         // HR
      3: 'manager',    // Manager
      4: 'employee'    // Employee
    };
    return roleMap[roleId] || 'employee';
  }

  // Login and store tokens
  async login(emailOrUsername, password) {
    try {
      // Use the comprehensive API service's login method
      const credentials = { email: emailOrUsername, password };

      // Call the new login API
      const result = await apiService.login(credentials);

      // Extract user data from response
      if (result && result.data) {
        const data = result.data;
        const attributes = data.attributes || data;
        
        // Get role - handle both role_id (number) and role (string)
        let roleName = 'employee';
        if (attributes.role_id) {
          roleName = this.mapRoleIdToName(attributes.role_id);
        } else if (attributes.role) {
          roleName = attributes.role.toLowerCase();
        }
        
        const user = {
          id: data.id || attributes.id || null,
          email: attributes.email || null,
          role: roleName,
          role_id: attributes.role_id || null,
          first_name: attributes.first_name || '',
          last_name: attributes.last_name || ''
        };

        // Token is already set by apiService.login()
        const token = apiService.jwtToken;
        const csrf = apiService.csrfToken;
        this.csrfToken = csrf;

        if (user) {
          localStorage.setItem('user_data', JSON.stringify(user));
        }

        return { success: true, user, token };
      }

      // Handle error responses
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
      await apiService.logout();
      this.csrfToken = null;
      // Clear stored user data
      localStorage.removeItem('user_data');
      return true;
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
          let data = res.data || res;
          const attributes = data.attributes || data;
          
          // Map role_id to role name if needed
          if (attributes.role_id && !attributes.role) {
            data = {
              ...data,
              role: this.mapRoleIdToName(attributes.role_id)
            };
          } else if (attributes.role && typeof attributes.role === 'string') {
            data = {
              ...data,
              role: attributes.role.toLowerCase()
            };
          }
          
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
