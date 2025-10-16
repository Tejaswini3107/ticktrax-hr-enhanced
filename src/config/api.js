// API Configuration aligned with Gotham Time Manager API Documentation
export const API_CONFIG = {
  // In development prefer a relative '/api' so Vite dev server proxy forwards requests and avoids CORS.
  // In production use the real backend URL.
  BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://batman-api-a20b3a37aa3c.herokuapp.com/api'),
  // WebSocket URL for real-time connections
  WS_URL: import.meta.env.VITE_WS_URL || (import.meta.env.DEV ? 'ws://localhost:3000' : 'wss://batman-api-a20b3a37aa3c.herokuapp.com'),
  
  // Authentication Headers
  HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
    CSRF_TOKEN: 'x-xsrf-token',
    ACCEPT: 'Accept'
  },

  // Comprehensive API Endpoints based on Gotham Time Manager Documentation
  ENDPOINTS: {
    // Authentication APIs
    AUTH: {
      SIGN_UP: '/auth/sign_up',               // POST
      SIGN_IN: '/auth/sign_in',               // POST
      SIGN_OUT: '/auth/sign_out',             // DELETE
      GET_CURRENT_USER: '/auth/me',           // GET
    },

    // User Management APIs
    USERS: {
      LIST: '/users',                         // GET
      BY_ID: '/users/:id',                    // GET
      CREATE: '/users',                       // POST
      UPDATE: '/users/:id',                   // PUT
      UPDATE_ROLE: '/users/:id/role',         // PUT
      DELETE: '/users/:id',                   // DELETE
      PROFILE: '/user/profile',               // GET, PUT
      PASSWORD: '/user/password',             // PUT
      DASHBOARD: '/user/dashboard'            // GET
    },

    // Time Tracking APIs
    TIME_TRACKING: {
      CLOCK_IN: '/time-tracking/clock-in',    // POST
      CLOCK_OUT: '/time-tracking/clock-out',  // POST
      STATUS: '/time-tracking/status',        // GET
      ENTRIES: '/time-tracking/entries',      // GET
      MANUAL_ENTRY: '/time-tracking/manual-entry', // POST
      UPDATE_ENTRY: '/time-tracking/entries/:id',  // PUT
      DELETE_ENTRY: '/time-tracking/entries/:id'   // DELETE
    },

    // Break Management APIs
    BREAKS: {
      START: '/user/breaks/start',            // POST
      END: '/user/breaks/end',                // POST
      STATUS: '/user/breaks/status',          // GET
      HISTORY: '/user/breaks/history',        // GET
      SUMMARY: '/user/breaks/summary'         // GET
    },

    // Working Times APIs
    WORKING_TIMES: {
      LIST: '/working_times',                 // GET
      CREATE: '/working_times',               // POST
      BY_ID: '/working_times/:id',            // GET
      UPDATE: '/working_times/:id',           // PUT
      DELETE: '/working_times/:id'            // DELETE
    },

    // Task Management APIs
    TASKS: {
      LIST: '/tasks',                         // GET
      BY_ID: '/tasks/:id',                    // GET
      CREATE: '/tasks',                       // POST
      UPDATE: '/tasks/:id',                   // PUT
      UPDATE_STATUS: '/tasks/:taskid/status', // PUT
      DELETE: '/tasks/:id',                   // DELETE
      ASSIGN_USER: '/tasks/:taskid/user/:userid', // POST
      REMOVE_USER: '/tasks/:taskid/user/:userid', // DELETE
      ASSIGNMENTS: '/task_assignments',       // GET, POST
      ASSIGNMENT_BY_ID: '/task_assignments/:id', // GET, PUT, DELETE
      SKILLS: '/task_skills',                 // GET, POST
      SKILL_BY_ID: '/task_skills/:id',        // GET, PUT, DELETE
      UPDATE_SKILL: '/tasks/:taskid/skills/:skillid' // PUT
    },

    // Approval APIs
    APPROVALS: {
      PENDING: '/approvals/pending',          // GET
      APPROVE: '/approvals/:id/approve',      // POST
      REJECT: '/approvals/:id/reject',        // POST
      BULK_APPROVE: '/approvals/bulk-approve', // POST
      HISTORY: '/approvals/history'           // GET
    },


    // Reports APIs
    REPORTS: {
      TIMESHEET: '/reports/timesheet',        // GET
      ATTENDANCE: '/reports/attendance',      // GET
      PAYROLL: '/reports/payroll',            // GET
      OVERTIME: '/reports/overtime',          // GET
      TURNOVER: '/reports/turnover'           // GET
    },

    // Compliance & Labor APIs
    COMPLIANCE: {
      ISSUES: '/compliance/issues'            // GET
    },

    LABOR: {
      DISTRIBUTION: '/labor/distribution'     // GET
    },

    // Settings APIs
    SETTINGS: {
      PROFILE: '/settings/profile',           // GET, PUT
      NOTIFICATIONS: '/settings/notifications', // GET, PUT
      WORK_PREFERENCES: '/settings/work-preferences' // GET, PUT
    },

    // Payroll APIs
    PAYROLL: {
      SUMMARY: '/payroll/summary',            // GET
      HISTORY: '/payroll/history',            // GET
      GENERATE: '/payroll/generate',          // POST
      RATES: '/payroll/rates',                // GET
      UPDATE_RATES: '/payroll/rates/:user_id', // PUT
      CALCULATION_RATES: '/payroll/calculation/rates', // GET
      REPORT: '/payroll/report/:id'           // GET
    },

    // Notifications APIs
    NOTIFICATIONS: {
      LIST: '/notifications',                 // GET
      UNREAD_COUNT: '/notifications/unread-count', // GET
      MARK_READ: '/notifications/:id/read',   // PUT
      MARK_ALL_READ: '/notifications/mark-all-read', // PUT
      DELETE: '/notifications/:id',           // DELETE
      PREFERENCES: '/notifications/preferences' // POST
    },

    // Teams & Projects APIs
    TEAMS: {
      LIST: '/teams',                         // GET
      CREATE: '/teams',                       // POST
      BY_ID: '/teams/:id',                    // GET
      UPDATE: '/teams/:id',                   // PUT
      DELETE: '/teams/:id'                    // DELETE
    },

    PROJECTS: {
      LIST: '/projects',                      // GET
      CREATE: '/projects',                    // POST
      BY_ID: '/projects/:id',                 // GET
      UPDATE: '/projects/:id',                // PUT
      DELETE: '/projects/:id'                 // DELETE
    },

    // Skills Management APIs
    SKILLS: {
      LIST: '/skills',                        // GET
      CREATE: '/skills',                      // POST
      BY_ID: '/skills/:id',                   // GET
      UPDATE: '/skills/:id',                  // PUT
      DELETE: '/skills/:id'                   // DELETE
    },

    USER_SKILLS: {
      ASSIGN: '/users/:userid/skills/:skillid', // POST
      REMOVE: '/users/:userid/skills/:skillid', // DELETE
      LIST: '/user_skills',                   // GET, POST
      BY_ID: '/user_skills/:id'               // GET, PUT, DELETE
    },

    // Schedules & Shifts APIs
    SCHEDULES: {
      LIST: '/schedules',                     // GET
      CREATE: '/schedules',                   // POST
      CREATE_BATCH: '/schedules/batch',       // POST
      BY_ID: '/schedules/:id',                // GET
      UPDATE: '/schedules/:id',               // PUT
      DELETE: '/schedules/:id',               // DELETE
      CONSTRAINTS: '/schedules/constraints/:employee_id' // GET
    },

    SHIFTS: {
      LIST: '/shifts',                        // GET
      CREATE: '/shifts',                      // POST
      BY_ID: '/shifts/:id',                   // GET
      UPDATE: '/shifts/:id',                  // PUT
      DELETE: '/shifts/:id'                   // DELETE
    },

    // Leaves Management APIs
    LEAVES: {
      LIST: '/leaves',                        // GET
      CREATE: '/leaves',                      // POST
      BY_ID: '/leaves/:id',                   // GET
      UPDATE: '/leaves/:id',                  // PUT
      DELETE: '/leaves/:id'                   // DELETE
    },

    // Roles & Permissions APIs
    ROLES: {
      LIST: '/roles',                         // GET
      BY_ID: '/roles/:id'                     // GET
    },

    PERMISSIONS: {
      UPDATE: '/permissions/:user_id',        // PUT
      DELETE: '/permissions/:user_id'         // DELETE
    },

    // Activities & Logs APIs
    ACTIVITIES: {
      BILLABLE: '/activities/billable'        // GET
    },

    LOGS: {
      UNPAID_OVERTIME: '/logs/overtime/unpaid' // POST
    },

    // Additional Endpoints
    UNRECOGNIZED_WORKS: {
      LIST: '/unrecognized_works',             // GET
      CREATE: '/unrecognized_works',           // POST
      BY_ID: '/unrecognized_works/:id',        // GET
      UPDATE: '/unrecognized_works/:id',       // PUT
      DELETE: '/unrecognized_works/:id'        // DELETE
    },

    COMPENSATION_LOGS: {
      LIST: '/compensation_logs',              // GET
      CREATE: '/compensation_logs',            // POST
      BY_ID: '/compensation_logs/:id',         // GET
      UPDATE: '/compensation_logs/:id',        // PUT
      DELETE: '/compensation_logs/:id'         // DELETE
    },

    TIMESHEETS: {
      VALIDATE: '/timesheets/:id/validate'     // PUT
    },

    AUDIT: {
      NIGHT_SHIFT_ALERT: '/audit/night_shift_alert',        // GET
      PRESENCE_VERIFICATION: '/audit/presence_verification', // GET
      DISCREPANCY_RESOLVE: '/audit/discrepancy/resolve'     // POST
    },

    INTEGRATION: {
      BATSIGNAL: '/integration/batsignal',     // POST
      LIST: '/integrations',                   // GET
      CREATE: '/integrations',                 // POST
      BY_ID: '/integrations/:id',              // GET
      UPDATE: '/integrations/:id',             // PUT
      DELETE: '/integrations/:id'              // DELETE
    }
  },

  // Response Status Codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
  },

  // Error Types
  ERROR_TYPES: {
    ALREADY_CLOCKED_IN: 'already_clocked_in',
    VALIDATION_ERROR: 'validation_error',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access denied',
    INTERNAL_SERVER_ERROR: 'Internal Server Error'
  },

  // Request Configuration
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth endpoints
export const getAuthEndpoint = (key) => buildApiUrl(API_CONFIG.ENDPOINTS.AUTH[key]);

// Helper function to get user endpoints
export const getUserEndpoint = (key) => buildApiUrl(API_CONFIG.ENDPOINTS.USERS[key]);

// Helper function to get time tracking endpoints
export const getTimeTrackingEndpoint = (key) => buildApiUrl(API_CONFIG.ENDPOINTS.TIME_TRACKING[key]);

// Helper function to replace URL parameters
export const replaceUrlParams = (url, params) => {
  let result = url;
  Object.keys(params).forEach(key => {
    result = result.replace(`:${key}`, params[key]);
  });
  return result;
};

// Helper function to build query string
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      query.append(key, params[key]);
    }
  });
  return query.toString();
};