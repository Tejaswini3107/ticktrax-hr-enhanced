// Mobile Fallback - Bypass API calls for testing
// This script provides mock responses to allow the app to load

(function() {
  'use strict';
  
  console.log('Mobile Fallback: Initializing...');
  
  // Override fetch to provide mock responses
  const originalFetch = window.fetch;
  
  window.fetch = function(url, options = {}) {
    console.log('Mobile Fallback: Intercepting request to', url);
    
    // Provide mock responses for common API calls
    if (url.includes('/auth/me') || url.includes('/api/auth/me')) {
      console.log('Mobile Fallback: Returning mock auth response');
      return Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Not authenticated' }),
        text: () => Promise.resolve('{"error": "Not authenticated"}')
      });
    }
    
    if (url.includes('/auth/sign_in') || url.includes('/api/auth/sign_in')) {
      console.log('Mobile Fallback: Mock sign in endpoint');
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          data: {
            attributes: {
              email: 'test@example.com',
              first_name: 'Test',
              last_name: 'User',
              role: 'Employee',
              role_id: 4
            },
            id: 1,
            type: 'users'
          },
          meta: {
            token: 'mock-token'
          }
        })
      });
    }
    
    // For all other requests, try the original fetch
    return originalFetch.call(this, url, options)
      .catch(error => {
        console.log('Mobile Fallback: Request failed, providing mock response');
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: 'Not found' }),
          text: () => Promise.resolve('{"error": "Not found"}')
        });
      });
  };
  
  // Override WebSocket to prevent connection attempts
  window.WebSocket = function(url, protocols) {
    console.log('Mobile Fallback: WebSocket connection blocked for', url);
    return {
      readyState: 3, // CLOSED
      close: () => {},
      send: () => {},
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  };
  
  console.log('Mobile Fallback: Initialized successfully');
})();
