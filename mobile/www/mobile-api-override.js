// Mobile API Override for Cordova apps
// This script runs before the main app to fix API connection issues

(function() {
  'use strict';
  
  console.log('Mobile API Override: Initializing...');
  
  // Set mobile environment variables
  window.MOBILE_ENV = {
    API_BASE_URL: 'https://batman-api-a20b3a37aa3c.herokuapp.com/api',
    WS_URL: 'wss://batman-api-a20b3a37aa3c.herokuapp.com',
    IS_MOBILE: true,
    IS_CORDOVA: true
  };
  
  // Override import.meta.env for mobile
  if (typeof import !== 'undefined' && import.meta) {
    import.meta.env = {
      ...import.meta.env,
      VITE_API_BASE_URL: window.MOBILE_ENV.API_BASE_URL,
      VITE_WS_URL: window.MOBILE_ENV.WS_URL,
      VITE_DEV: false,
      MODE: 'production'
    };
  }
  
  // Override fetch to handle mobile-specific API calls
  const originalFetch = window.fetch;
  
  window.fetch = function(url, options = {}) {
    // Convert relative URLs to absolute URLs for mobile
    if (typeof url === 'string' && url.startsWith('/api')) {
      url = 'https://batman-api-a20b3a37aa3c.herokuapp.com' + url;
      console.log('Mobile API Override: Converting URL to', url);
    }
    
    // Add mobile-specific headers
    if (!options.headers) {
      options.headers = {};
    }
    
    options.headers['User-Agent'] = 'TickTrax-Mobile/1.0.0';
    options.headers['X-Mobile-App'] = 'true';
    options.headers['Accept'] = 'application/json';
    options.headers['Content-Type'] = 'application/json';
    
    // Add timeout for mobile
    if (!options.timeout) {
      options.timeout = 15000; // 15 seconds
    }
    
    console.log('Mobile API Override: Making request to', url);
    
    return originalFetch.call(this, url, options)
      .then(response => {
        console.log('Mobile API Override: Response status', response.status);
        return response;
      })
      .catch(error => {
        console.error('Mobile API Override: Fetch error:', error);
        // Return a mock response for development
        if (url.includes('/auth/me')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Not authenticated' })
          });
        }
        throw error;
      });
  };
  
  // Override WebSocket for mobile
  const originalWebSocket = window.WebSocket;
  
  window.WebSocket = function(url, protocols) {
    // Convert localhost WebSocket URLs to production
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      url = url.replace(/ws:\/\/localhost:\d+/, 'wss://batman-api-a20b3a37aa3c.herokuapp.com');
      url = url.replace(/ws:\/\/127\.0\.0\.1:\d+/, 'wss://batman-api-a20b3a37aa3c.herokuapp.com');
      console.log('Mobile API Override: Converting WebSocket URL to', url);
    }
    
    return new originalWebSocket(url, protocols);
  };
  
  // Copy all static properties from original WebSocket
  Object.setPrototypeOf(window.WebSocket, originalWebSocket);
  Object.setPrototypeOf(window.WebSocket.prototype, originalWebSocket.prototype);
  
  console.log('Mobile API Override: Initialized successfully');
})();
