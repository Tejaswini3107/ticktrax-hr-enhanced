// API Configuration aligned with provided Postman collection
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://batman-api-a20b3a37aa3c.herokuapp.com/api',
  ENDPOINTS: {
    AUTH: {
      SIGN_UP: '/sign_up',                 // POST
      SIGN_IN: '/sign_in',                 // POST
      SIGN_OUT: '/sign_out'                // DELETE (requires Authorization + x-xsrf-token)
    },
    USERS: {
      LIST: '/users',                      // GET
      BY_ID: '/users/:id'                  // GET
    },
    ROLES: {
      LIST: '/roles'                       // GET
    },
    PERMISSIONS: {
      UPDATE: '/permissions/:user_id'      // PUT
    },
    CLOCKS: {
      BY_USER: '/clocks/:userID'           // GET, POST (status in body)
    },
    WORKINGTIME: {
      BY_USER: '/workingtime/:userID'      // GET
    },
    LOGS: {
      UNPAID_OVERTIME: '/logs/overtime/unpaid' // POST
    },
    SCHEDULES: {
      CONSTRAINTS: '/schedules/:employee_id/constraints',    // GET
      CREATE_BATCH: '/schedules/create_batch'                 // POST
    },
    AUDIT: {
      NIGHT_SHIFT_ALERT: '/audit/night_shift_alert',          // GET
      PRESENCE_VERIFICATION: '/audit/presence_verification',  // GET
      RESOLVE_DISCREPANCY: '/audit/discrepancy/resolve'       // POST
    },
    TASKS: {
      LIST: '/tasks',                       // GET
      CREATE: '/tasks',                     // POST
      UPDATE_STATUS: '/tasks/:taskid/status', // PUT
      ASSIGN_TO_USER: '/tasks/:taskid/user/:userid' // POST
    },
    SKILLS: {
      LIST: '/skills',                      // GET
      ASSIGN_TO_USER: '/users/:userid/skills/:skillid', // POST
      CREATE: '/skills'                     // POST
    },
    PAYROLL: {
      CALCULATION_RATES: '/payroll/calculation/rates',        // GET
      REPORT_BY_ID: '/payroll/report/:id'                     // GET with query params
    },
    TIMESHEETS: {
      VALIDATE: '/timesheets/:id/validate'                    // PUT
    },
    INTEGRATIONS: {
      BATSIGNAL: '/integration/batsignal',                    // POST
      LIST: '/integrations'                                   // GET with optional query
    }
  },
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  HEADERS: {
    AUTHORIZATION: 'Authorization',
    CSRF_TOKEN: 'x-xsrf-token'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth endpoints
export const getAuthEndpoint = (key) => buildApiUrl(API_CONFIG.ENDPOINTS.AUTH[key]);

// Helper function to get user endpoints
export const getUserEndpoint = (key) => buildApiUrl(API_CONFIG.ENDPOINTS.USERS[key]);

// Helper function to get task endpoints
export const getTaskEndpoint = (key) => buildApiUrl(API_CONFIG.ENDPOINTS.TASKS[key]);

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
