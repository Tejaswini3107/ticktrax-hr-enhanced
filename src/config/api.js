// API Configuration - Updated to match actual backend APIs
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  ENDPOINTS: {
    // Authentication & User Management (Matches backend)
    AUTH: {
      LOGIN: '/login',              // POST /api/login
      LOGOUT: '/logout',            // POST /api/logout
      REGISTER: '/users'         // POST /api/users (actual registration endpoint)
    },
    USERS: {
      LIST: '/users',               // GET /api/users
      CREATE: '/users',             // POST /api/users
      BY_ID: '/users',              // GET /api/users/:id
      UPDATE: '/users',             // PUT /api/users/:id
      DELETE: '/users'              // DELETE /api/users/:id
    },
    TASKS: {
      LIST: '/tasks',               // GET /api/tasks
      CREATE: '/tasks',             // POST /api/tasks
      BY_ID: '/tasks',              // GET /api/tasks/:id
      UPDATE: '/tasks',             // PUT /api/tasks/:id
      DELETE: '/tasks',             // DELETE /api/tasks/:id
      BY_USER: '/tasks/users'       // GET /api/tasks/users/:user_id
    }
    // Removed TIME, REPORTS, TEAMS - not in actual backend
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  
  // Authentication headers as per backend requirements
  HEADERS: {
    AUTHORIZATION: 'Authorization',
    CSRF_TOKEN: 'x-csrf-token'      // Backend expects lowercase 'x-csrf-token'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth endpoints
export const getAuthEndpoint = (action) => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.AUTH[action.toUpperCase()]);
};

// Helper function to get user endpoints
export const getUserEndpoint = (action) => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.USERS[action.toUpperCase()]);
};

// Helper function to get task endpoints
export const getTaskEndpoint = (action) => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.TASKS[action.toUpperCase()]);
};

// Task status constants matching backend
export const TASK_STATUS = {
  TODO: 1,          // "To Do"
  IN_PROGRESS: 2,   // "In Progress"
  UNDER_REVIEW: 3,  // "Under Review"
  DONE: 4           // "Done"
};

// Task status labels for UI display
export const TASK_STATUS_LABELS = {
  1: 'To Do',
  2: 'In Progress',
  3: 'Under Review',
  4: 'Done'
};
