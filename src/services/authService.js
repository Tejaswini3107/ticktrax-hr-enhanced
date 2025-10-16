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
      // Use email-only sign in
      const credentials = { email: emailOrUsername, password };

      // Use sign_in endpoint for authentication
      let result = null;
      let authMethod = '';

      try {
        result = await apiService.signIn(credentials);
        authMethod = 'sign_in';
      } catch (error) {
        // API sign_in failed, trying mock service fallback
        try {
          result = await mockApiService.login(credentials);
          authMethod = 'mock';
        } catch (mockError) {
          console.error('🔐 AuthService: Mock service also failed:', mockError.message);
          throw error; // Throw original API error
        }
      }

      // Authentication method used

      // Handle different response formats based on API documentation
      let user = null;
      let token = null;
      let csrf = null;

      if (result) {
        // Handle JWT Login response format
        if (authMethod === 'jwt' && result.data && result.data.user) {
          const userData = result.data.user;
          user = {
            id: userData.id,
            email: userData.email,
            role: (userData.role || 'employee').toLowerCase(),
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            username: userData.username || ''
          };
          // User role set
          token = result.data.token;
          csrf = result.data.csrf_token;
        }
        // Handle standard sign_in response format
        else if (result.data && result.meta) {
          const attributes = result.data.attributes || {};
          
          // Determine role from role attribute or role_id
          let role = 'employee';
          if (attributes.role) {
            role = attributes.role.toLowerCase();
          } else if (attributes.role_id) {
            // Map role_id to role name
            const roleMapping = {
              1: 'admin',
              2: 'manager', 
              3: 'hr',
              4: 'employee'
            };
            role = roleMapping[attributes.role_id] || 'employee';
          }
          
          user = {
            id: result.data.id || attributes.id || null,
            email: attributes.email || null,
            role: role,
            role_id: attributes.role_id || null,
            first_name: attributes.first_name || '',
            last_name: attributes.last_name || '',
            username: attributes.username || ''
          };
          // User role set from role_id
          token = result.meta.token;
          csrf = result.meta.csrf_token;
        }
        // Handle alternative login response format
        else if (result.user_id || result.email) {
          user = {
            id: result.user_id,
            email: result.email,
            role: (result.role || 'employee').toLowerCase(),
            first_name: '',
            last_name: '',
            username: ''
          };
          token = result.token || null;
        }
        // Handle mock service response format
        else if (authMethod === 'mock' && result.data && result.data.user) {
          user = {
            id: result.data.user.id,
            email: result.data.user.email,
            role: result.data.user.role,
            first_name: result.data.user.name.split(' ')[0] || '',
            last_name: result.data.user.name.split(' ').slice(1).join(' ') || '',
            username: result.data.user.name || ''
          };
          // Mock user role set
          token = result.token;
          csrf = null;
        }
      }

      if (user && user.id) {
        this.csrfToken = csrf;
        
        // Store user data
        localStorage.setItem('user_data', JSON.stringify(user));
        
        // Set tokens in API service
        apiService.setTokens(token, csrf);
        
        return { success: true, user, token };
      }

      // Fallback: if API returned a structured error
      return { success: false, error: result?.error || result?.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
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
      // Use sign_out endpoint for logout
      let result = null;
      
      try {
        result = await apiService.signOut();
      } catch (error) {
        // If sign_out fails, still clear local data
        console.warn('Sign out API call failed, clearing local data only');
      }

      this.csrfToken = null;
      // Clear stored user data
      localStorage.removeItem('user_data');
      
      // Clear tokens from API service
      apiService.clearTokens();
      
      return result?.success !== false; // Return true unless explicitly failed
    } catch (error) {
      console.error('Logout failed:', error);
      this.csrfToken = null;
      // Clear stored user data even if logout fails
      localStorage.removeItem('user_data');
      // Clear tokens from API service
      apiService.clearTokens();
      return false;
    }
  }

  // Force clear all authentication data (for debugging)
  clearAllAuthData() {
    // Clearing all authentication data
    localStorage.removeItem('user_data');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('xsrf_token');
    apiService.clearTokens();
  }

  // Check if user is authenticated
  isAuthenticated() {
    // Check for valid JWT token first (server-backed authentication)
    try {
      if (apiService && typeof apiService.isAuthenticated === 'function') {
        const apiAuth = apiService.isAuthenticated();
        // API authentication check
        if (apiAuth) return true;
      }
    } catch (e) {
      console.warn('🔐 AuthService: API authentication check failed:', e);
      // ignore and fall back to local data
    }

    // Fallback: if we have stored user data, treat as authenticated for UI routing
    // But only if we also have a token
    try {
      const hasLocalData = Boolean(localStorage.getItem('user_data'));
      const hasToken = Boolean(localStorage.getItem('jwt_token'));
      const isAuthenticated = hasLocalData && hasToken;
      
      // Debug: Show current stored user data
      if (hasLocalData) {
        const storedUser = JSON.parse(localStorage.getItem('user_data'));
        // Stored user data and role
      }
      
      // Local storage check
      return isAuthenticated;
    } catch (e) {
      console.warn('🔐 AuthService: Local storage check failed:', e);
      return false;
    }
  }

  // Get current user in a router-friendly shape { success, data }
  async getCurrentUser() {
    try {
      // Prefer calling API if available and user is authenticated
      if (this.isAuthenticated() && typeof apiService.getCurrentUser === 'function') {
        try {
          const res = await apiService.getCurrentUser();
          
          // Handle different response formats based on API documentation
          let userData = null;
          
          if (res && res.data) {
            // Standard API response format
            userData = {
              id: res.data.id,
              email: res.data.email,
              role: (res.data.role || 'employee').toLowerCase(),
              first_name: res.data.first_name || '',
              last_name: res.data.last_name || '',
              username: res.data.username || ''
            };
          } else if (res && (res.id || res.email)) {
            // Direct user object format
            userData = {
              id: res.id,
              email: res.email,
              role: (res.role || 'employee').toLowerCase(),
              first_name: res.first_name || '',
              last_name: res.last_name || '',
              username: res.username || ''
            };
          }
          
          if (userData && userData.id) {
            try { 
              localStorage.setItem('user_data', JSON.stringify(userData)); 
            } catch (e) {}
            return { success: true, data: userData };
          }
        } catch (apiError) {
          console.warn('API getCurrentUser failed, falling back to stored data:', apiError.message);
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
      // Return stored user data from login (no API calls needed)
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        // Returning stored user profile
        return JSON.parse(storedUser);
      }
      // No stored user profile found
      return null;
    } catch (error) {
      console.error('Get user profile failed:', error);
      return null;
    }
  }

  // Register new user
  async register(userData) {
    try {
      // Use sign_up endpoint for registration based on API documentation
      const result = await apiService.signUp(userData);
      
      // Handle different response formats
      let user = null;
      let token = null;
      let csrf = null;

      if (result && result.data && result.meta) {
        // Standard sign_up response format
        const attributes = result.data.attributes || {};
        user = {
          id: result.data.id || attributes.id || null,
          email: attributes.email || null,
          role: (attributes.role || 'employee').toLowerCase(),
          first_name: attributes.first_name || '',
          last_name: attributes.last_name || '',
          username: attributes.username || ''
        };
        token = result.meta.token;
        csrf = result.meta.csrf_token;
      }

      if (user && user.id) {
        this.csrfToken = csrf;
        
        // Store user data
        localStorage.setItem('user_data', JSON.stringify(user));
        
        // Set tokens in API service
        apiService.setTokens(token, csrf);
        
        return { success: true, user, token };
      }

      return { success: false, error: result?.error || result?.message || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Global instance
const authManager = new AuthTokenManager();

export default authManager;
