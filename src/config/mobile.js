// Mobile-specific configuration for Cordova apps
// Since localhost refers to the mobile device, we need to use the actual IP address

export const MOBILE_CONFIG = {
  // Development machine IP - update this if your IP changes
  DEV_MACHINE_IP: '10.68.254.53',
  
  // Mobile API configuration
  API: {
    BASE_URL: 'http://10.68.254.53:4000/api',
    WS_URL: 'ws://10.68.254.53:4000/socket'
  },
  
  // Fallback configuration for web development
  WEB_API: {
    BASE_URL: 'http://localhost:4000/api',
    WS_URL: 'ws://localhost:4000/socket'
  }
};

// Detect if we're running in Cordova
export const isCordovaApp = () => {
  return !!(window.cordova || window.PhoneGap || window.phonegap);
};

// Get the appropriate API configuration based on environment
export const getMobileApiConfig = () => {
  if (isCordovaApp()) {
    console.log('📱 Using mobile API configuration for Cordova app');
    return MOBILE_CONFIG.API;
  } else {
    console.log('🌐 Using web API configuration for browser');
    return MOBILE_CONFIG.WEB_API;
  }
};

// Update the main API config for mobile
export const updateApiConfigForMobile = () => {
  if (isCordovaApp()) {
    // Import and update the main API config
    import('../config/api.js').then(({ API_CONFIG }) => {
      API_CONFIG.BASE_URL = MOBILE_CONFIG.API.BASE_URL;
      API_CONFIG.WS_URL = MOBILE_CONFIG.API.WS_URL;
      console.log('📱 Updated API config for mobile:', API_CONFIG.BASE_URL);
    });
  }
};
