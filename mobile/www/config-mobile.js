// Mobile-specific configuration for Cordova apps
// This overrides the default API configuration for mobile environments

window.MOBILE_CONFIG = {
  // Use production API for mobile apps since localhost isn't accessible from iOS simulator
  API_BASE_URL: 'https://batman-api-a20b3a37aa3c.herokuapp.com/api',
  WS_URL: 'wss://batman-api-a20b3a37aa3c.herokuapp.com',
  
  // Mobile-specific settings
  IS_MOBILE: true,
  IS_CORDOVA: true,
  
  // Override environment variables for mobile
  VITE_API_BASE_URL: 'https://batman-api-a20b3a37aa3c.herokuapp.com/api',
  VITE_WS_URL: 'wss://batman-api-a20b3a37aa3c.herokuapp.com',
  VITE_DEV: false,
  
  // Mobile optimizations
  ENABLE_OFFLINE_MODE: true,
  CACHE_DURATION: 300000, // 5 minutes
  RETRY_ATTEMPTS: 3,
  TIMEOUT: 10000 // 10 seconds
};

// Override import.meta.env for mobile
if (typeof import !== 'undefined' && import.meta) {
  import.meta.env = {
    ...import.meta.env,
    ...window.MOBILE_CONFIG
  };
}

console.log('Mobile configuration loaded:', window.MOBILE_CONFIG);
