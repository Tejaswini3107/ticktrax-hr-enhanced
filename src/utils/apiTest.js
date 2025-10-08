// Simple API connection test utility
import authManager from '../services/authService.js';
import apiService from '../services/apiService.js';
import { API_CONFIG } from '../config/api.js';

export const testAPIConnection = async () => {
  console.log('🔍 Testing API connection...');
  
  try {
    // Test if we can reach the backend
    const response = await fetch(`${API_CONFIG.BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test', password: 'test' })
    });
    
    if (response.status === 400 || response.status === 401) {
      console.log('✅ Backend API is reachable');
      return true;
    } else {
      console.log('⚠️ Backend API responded with status:', response.status);
      return false;
    }
  } catch (error) {
    if (error.message.includes('CORS') || error.message.includes('blocked')) {
      console.log('🚫 CORS error: Backend is running but not configured for frontend access');
      console.log('💡 Tip: Configure CORS in your local backend to allow localhost:3001');
    } else {
      console.log('❌ Backend API is not reachable:', error.message);
    }
    return false;
  }
};

export const testAuthEndpoints = async () => {
  console.log('🔐 Testing authentication endpoints...');
  
  try {
    // Test login endpoint
    const loginResponse = await fetch(`${API_CONFIG.BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test'
      })
    });
    
    console.log('Login endpoint status:', loginResponse.status);
    
    // Test users endpoint (should fail without auth)
    const usersResponse = await fetch(`${API_CONFIG.BASE_URL}/users`, {
      method: 'GET'
    });
    
    console.log('Users endpoint status:', usersResponse.status);
    
    return {
      login: loginResponse.status,
      users: usersResponse.status
    };
  } catch (error) {
    if (error.message.includes('CORS') || error.message.includes('blocked')) {
      console.log('🚫 CORS error: Cannot test auth endpoints');
      console.log('💡 Tip: Configure CORS in your local backend to allow localhost:3005');
    } else {
      console.log('❌ Error testing auth endpoints:', error.message);
    }
    return null;
  }
};

// Auto-run tests when imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    testAPIConnection();
    testAuthEndpoints();
  }, 1000);
}
