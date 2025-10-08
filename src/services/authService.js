import apiService from './apiService.js';
import { mockApiService } from './mockApiService.js';

// Token Manager Class
class AuthTokenManager {
  constructor() {
    this.csrfToken = null;
  }

  // Login and store tokens
  async login(emailOrUsername, password) {
    try {
      // Determine if it's email or username
      const credentials = emailOrUsername.includes('@') 
        ? { email: emailOrUsername, password }
        : { username: emailOrUsername, password };

      let result;
      try {
        result = await apiService.login(credentials);
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError.message);
        result = await mockApiService.login(credentials);
      }
      if (result && result.success) {
        this.csrfToken = apiService.xsrfToken;

        // Normalize user object across API and mock responses
        let user = null;
        let token = null;

        if (result.data) {
          // Mock API returns data.user, real API returns flattened fields in data
          if (result.data.user) {
            user = result.data.user;
            token = result.data.token || null;
          } else {
            user = {
              id: result.data.id || result.data.user_id || null,
              email: result.data.email || null,
              role: result.data.role || 'employee',
              first_name: result.data.first_name || result.data.firstName || '',
              last_name: result.data.last_name || result.data.lastName || ''
            };
            token = result.data.token || null;
          }
        }

        // Persist normalized user data for later lookup
        if (user) {
          localStorage.setItem('user_data', JSON.stringify(user));
        }

        if (token) {
          // Keep JWT token in apiService storage as well
          apiService.setTokens(token, apiService.xsrfToken || null);
        }

        return { success: true, user, token };
      }

      return result;
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
      const result = await apiService.logout();
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
    return apiService.isAuthenticated();
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
