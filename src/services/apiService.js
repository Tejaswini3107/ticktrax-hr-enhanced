// Gotham API Service - Real API integration aligned with Postman collection
import { API_CONFIG } from '../config/api.js';

class GothamApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL || 'http://localhost:4000/api';
    this.jwtToken = null;
    this.xsrfToken = null;
  }

  // Token management
  initializeTokens() {
    this.jwtToken = localStorage.getItem('jwt_token');
    this.xsrfToken = localStorage.getItem('xsrf_token');
  }

  setTokens(jwtToken, xsrfToken) {
    this.jwtToken = jwtToken;
    this.xsrfToken = xsrfToken;
    if (jwtToken) localStorage.setItem('jwt_token', jwtToken);
    if (xsrfToken) localStorage.setItem('xsrf_token', xsrfToken);
  }

  clearTokens() {
    this.jwtToken = null;
    this.xsrfToken = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('xsrf_token');
  }

  isAuthenticated() {
    this.initializeTokens();
    const hasToken = Boolean(this.jwtToken);
    // Authentication check
    return hasToken;
  }

  getJwtToken() {
    this.initializeTokens();
    return this.jwtToken;
  }

  // Generic request method with auth headers and empty-state normalization
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = {
          'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      this.initializeTokens();
      if (this.jwtToken) {
        headers[API_CONFIG.HEADERS.AUTHORIZATION] = `Bearer ${this.jwtToken}`;
      }
      const method = (options.method || 'GET').toUpperCase();
      // Send XSRF token only for state-changing requests to avoid CORS preflight rejections
      // Avoid sending XSRF token for auth endpoints (sign_in/sign_up) because some backends
      // do not allow custom CSRF headers on those endpoints and that triggers CORS preflight failures.
      const isAuthEndpoint = endpoint.includes('/sign_in') || endpoint.includes('/sign_up');
      if (this.xsrfToken && method !== 'GET' && !isAuthEndpoint) {
        headers[API_CONFIG.HEADERS.CSRF_TOKEN] = this.xsrfToken;
      }

      const config = { headers, ...options };

      // Helpful debug information in dev: show method, url and whether auth/xsrf tokens are present
      if (import.meta.env && import.meta.env.DEV) {
        try {
          console.debug('API Request debug', {
            method: config.method || 'GET',
            url,
            hasAuthorization: !!this.jwtToken,
            hasXsrf: !!this.xsrfToken,
            endpoint
          });
        } catch (_) {}
      }

      // API Request

      const response = await fetch(url, config);

      // Log response status and content-type for easier debugging when SPA HTML is returned
      try {
        const respContentType = response.headers.get('content-type') || '';
        if (import.meta.env && import.meta.env.DEV) {
          console.debug('API Response debug', { status: response.status, contentType: respContentType, url });
        }
        // API Response status
      } catch (e) {
        // ignore logging errors
      }
      
      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;
        let errBody = null;
        try {
          // Try to parse JSON body first; fall back to text when not JSON
          const parsed = await response.clone().json().catch(() => null);
          if (parsed) {
            errBody = parsed;
            const apiMsg = parsed?.error || parsed?.message || (Array.isArray(parsed?.errors) ? parsed.errors.join(', ') : null);
            if (apiMsg) {
              message = `${response.status} ${apiMsg}`;
            } else {
              message = `${response.status} ${JSON.stringify(parsed)}`;
            }
          } else {
            const text = await response.clone().text().catch(() => null);
            if (text) {
              errBody = text;
              message = `${response.status} ${text.toString().slice(0,400)}`;
            }
          }
        } catch (_) {}
        const err = new Error(message);
        // Attach parsed body for upstream handlers to show detailed messages
        err.response = errBody;
        err.status = response.status;
        // Log the backend error body for quicker debugging in the browser console (dev only)
        try {
          console.error('API Error body:', errBody);
        } catch (_) {}
        throw err;
      }
      
      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      const contentType = response.headers.get('content-type') || '';
      const contentLength = Number(response.headers.get('content-length') || 0);

      // If backend accidentally returns HTML (index.html) — likely a misconfigured base URL or proxy —
      // fail fast with a useful error so devs can diagnose quickly.
      if (contentType.toLowerCase().includes('html')) {
        const text = await response.text();
        const snippet = (text || '').toString().slice(0, 400).replace(/\s+/g, ' ').trim();
        console.error(`API Error: received HTML from ${url}. This usually means the request hit the SPA dev server or the proxy failed. Response snippet:`, snippet);
        throw new Error(`Unexpected HTML response from API at ${url}. Check API base URL and dev proxy. Response snippet: ${snippet}`);
      }

      // If not JSON or empty body, try text and return {}
      if (!contentType.toLowerCase().includes('json') || contentLength === 0) {
        const text = await response.text();
        if (!text) return {};
        try {
          const parsed = JSON.parse(text);
          // API Response parsed
          return parsed;
        } catch (_) {
          // Return as raw text when backend doesn't send JSON
          // API Response as text
          return { message: text };
        }
      }
      
      const data = await response.json();
      // API Response data

      // Normalize empty collections to [] for UI "No data" states
      if (data == null) return [];
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.items && Array.isArray(data.items)) return data.items;
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication aligned with Postman collection
  async signUp(payload) {
    const result = await this.request(API_CONFIG.ENDPOINTS.AUTH.SIGN_UP, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    // Extract token from meta.token when present
    const token = result?.meta?.token || null;
    if (token) this.setTokens(token, result?.meta?.csrf_token || null);
    return result;
  }

  async signIn(credentials) {
    const result = await this.request(API_CONFIG.ENDPOINTS.AUTH.SIGN_IN, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const token = result?.meta?.token || null;
    const csrf = result?.meta?.csrf_token || null;
    if (token) this.setTokens(token, csrf);
    return result;
  }

  async signOut() {
    const res = await this.request(API_CONFIG.ENDPOINTS.AUTH.SIGN_OUT, {
      method: 'DELETE'
    });
    this.clearTokens();
    return res;
  }

  // Users & Permissions
  async listUsers() {
    const data = await this.request(API_CONFIG.ENDPOINTS.USERS.LIST);
    return Array.isArray(data) ? data : (data?.data || []);
  }

  // Create a new user (matches POST /users)
  async createUser(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.USERS.LIST, { method: 'POST', body: JSON.stringify(payload) });
  }

  // Update an existing user (PUT /users/:id)
  async updateUser(userId, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.USERS.BY_ID.replace(':id', String(userId));
    return await this.request(endpoint, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async getUserById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.USERS.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async listRoles() {
    const data = await this.request(API_CONFIG.ENDPOINTS.ROLES.LIST);
    return Array.isArray(data) ? data : (data?.data || []);
  }

  async updateUserPermissions(userId, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.PERMISSIONS.UPDATE.replace(':user_id', String(userId));
    return await this.request(endpoint, { method: 'PUT', body: JSON.stringify(payload) });
  }

  // Time Tracking
  async getUserClock(userID) {
    const endpoint = API_CONFIG.ENDPOINTS.CLOCKS.BY_USER.replace(':userID', String(userID));
    return await this.request(endpoint);
  }

  async clockInOut(userID, status) {
    const endpoint = API_CONFIG.ENDPOINTS.CLOCKS.BY_USER.replace(':userID', String(userID));
    return await this.request(endpoint, { method: 'POST', body: JSON.stringify({ status }) });
    }

  async getUserWorkingTimes(userID) {
    const endpoint = API_CONFIG.ENDPOINTS.WORKINGTIME.BY_USER.replace(':userID', String(userID));
    const data = await this.request(endpoint);
    return Array.isArray(data) ? data : (data?.data || []);
  }

  // Create a new working time entry for a user
  async createWorkingTime(userID, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.WORKINGTIME.BY_USER.replace(':userID', String(userID));
    return await this.request(endpoint, { method: 'POST', body: JSON.stringify(payload) });
  }

  async logUnpaidOvertime(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.LOGS.UNPAID_OVERTIME, { method: 'POST', body: JSON.stringify(payload) });
  }

  // Schedules & Shifts
  async getEmployeeScheduleConstraints(employee_id) {
    const endpoint = API_CONFIG.ENDPOINTS.SCHEDULES.CONSTRAINTS.replace(':employee_id', String(employee_id));
    return await this.request(endpoint);
  }

  async createBatchSchedules(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.SCHEDULES.CREATE_BATCH, { method: 'POST', body: JSON.stringify(payload) });
  }

  // Tasks & Skills
  async listTasks() {
    const data = await this.request(API_CONFIG.ENDPOINTS.TASKS.LIST);
    return Array.isArray(data) ? data : (data?.data || []);
  }

  async createTask(task) {
    return await this.request(API_CONFIG.ENDPOINTS.TASKS.CREATE, { method: 'POST', body: JSON.stringify({ task }) });
  }

  async updateTaskStatus(taskid, status) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.UPDATE_STATUS.replace(':taskid', String(taskid));
    return await this.request(endpoint, { method: 'PUT', body: JSON.stringify({ status }) });
  }

  async assignTaskToUser(taskid, userid, assignment) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.ASSIGN_TO_USER
      .replace(':taskid', String(taskid))
      .replace(':userid', String(userid));
    return await this.request(endpoint, { method: 'POST', body: JSON.stringify({ assignment }) });
  }

  async listSkills() {
    const data = await this.request(API_CONFIG.ENDPOINTS.SKILLS.LIST);
    return Array.isArray(data) ? data : (data?.data || []);
  }

  async assignSkillToUser(userid, skillid, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.SKILLS.ASSIGN_TO_USER
      .replace(':userid', String(userid))
      .replace(':skillid', String(skillid));
    return await this.request(endpoint, { method: 'POST', body: JSON.stringify(payload) });
  }

  async addNewSkill(label) {
    return await this.request(API_CONFIG.ENDPOINTS.SKILLS.CREATE, { method: 'POST', body: JSON.stringify({ label }) });
  }

  // Payroll & Audit
  async getCalculationRates() {
    return await this.request(API_CONFIG.ENDPOINTS.PAYROLL.CALCULATION_RATES);
  }

  async getPayrollReport(id, query = {}) {
    const endpointBase = API_CONFIG.ENDPOINTS.PAYROLL.REPORT_BY_ID.replace(':id', String(id));
    const qs = new URLSearchParams(query).toString();
    return await this.request(qs ? `${endpointBase}?${qs}` : endpointBase);
  }

  async validateTimesheet(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.TIMESHEETS.VALIDATE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async resolveDiscrepancy(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.AUDIT.RESOLVE_DISCREPANCY, { method: 'POST', body: JSON.stringify(payload) });
  }

  async presenceVerification() {
    return await this.request(API_CONFIG.ENDPOINTS.AUDIT.PRESENCE_VERIFICATION);
  }

  async nightShiftAlert() {
    return await this.request(API_CONFIG.ENDPOINTS.AUDIT.NIGHT_SHIFT_ALERT);
  }

  // Integrations
  async batsignalIntegration(signal) {
    return await this.request(API_CONFIG.ENDPOINTS.INTEGRATIONS.BATSIGNAL, { method: 'POST', body: JSON.stringify({ signal }) });
  }

  async listIntegrations(query = {}) {
    const qs = new URLSearchParams(query).toString();
    const base = API_CONFIG.ENDPOINTS.INTEGRATIONS.LIST;
    return await this.request(qs ? `${base}?${qs}` : base);
  }

  // ==================== COMPREHENSIVE API METHODS ====================
  // Based on Gotham Time Manager API Documentation

  // Authentication Methods
  async getCurrentUser() {
    return await this.request(API_CONFIG.ENDPOINTS.AUTH.GET_CURRENT_USER);
  }

  // User Management Methods
  async deleteUser(userId) {
    const endpoint = API_CONFIG.ENDPOINTS.USERS.BY_ID.replace(':id', String(userId));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  async updateUserRole(userId, roleId) {
    const endpoint = API_CONFIG.ENDPOINTS.USERS.UPDATE_ROLE.replace(':id', String(userId));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, role_id: roleId })
    });
  }

  async getUserProfile() {
    return await this.request(API_CONFIG.ENDPOINTS.USERS.PROFILE);
  }

  async updateUserProfile(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.USERS.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async changePassword(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.USERS.PASSWORD, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async getUserDashboard() {
    return await this.request(API_CONFIG.ENDPOINTS.USERS.DASHBOARD);
  }

  // Time Tracking Methods
  async clockIn(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.TIME_TRACKING.CLOCK_IN, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async clockOut(payload = {}) {
    return await this.request(API_CONFIG.ENDPOINTS.TIME_TRACKING.CLOCK_OUT, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getClockStatus() {
    return await this.request(API_CONFIG.ENDPOINTS.TIME_TRACKING.STATUS);
  }

  async getTimeEntries(query = {}) {
    const qs = new URLSearchParams(query).toString();
    const base = API_CONFIG.ENDPOINTS.TIME_TRACKING.ENTRIES;
    return await this.request(qs ? `${base}?${qs}` : base);
  }

  async createManualEntry(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.TIME_TRACKING.MANUAL_ENTRY, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateTimeEntry(entryId, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.TIME_TRACKING.UPDATE_ENTRY.replace(':id', String(entryId));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteTimeEntry(entryId) {
    const endpoint = API_CONFIG.ENDPOINTS.TIME_TRACKING.DELETE_ENTRY.replace(':id', String(entryId));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Break Management Methods
  async startBreak() {
    return await this.request(API_CONFIG.ENDPOINTS.BREAKS.START, {
      method: 'POST'
    });
  }

  async endBreak() {
    return await this.request(API_CONFIG.ENDPOINTS.BREAKS.END, {
      method: 'POST'
    });
  }

  async getBreakStatus() {
    return await this.request(API_CONFIG.ENDPOINTS.BREAKS.STATUS);
  }

  async getBreakHistory() {
    return await this.request(API_CONFIG.ENDPOINTS.BREAKS.HISTORY);
  }

  async getBreakSummary() {
    return await this.request(API_CONFIG.ENDPOINTS.BREAKS.SUMMARY);
  }

  // Working Times Methods
  async getWorkingTimes() {
    return await this.request(API_CONFIG.ENDPOINTS.WORKING_TIMES.LIST);
  }

  async createWorkingTime(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.WORKING_TIMES.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getWorkingTimeById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.WORKING_TIMES.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateWorkingTime(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.WORKING_TIMES.UPDATE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteWorkingTime(id) {
    const endpoint = API_CONFIG.ENDPOINTS.WORKING_TIMES.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Task Management Methods (Enhanced)
  async getTaskById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateTask(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.UPDATE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ task: payload })
    });
  }

  async deleteTask(id) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  async assignTaskToUser(taskId, userId) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.ASSIGN_USER
      .replace(':taskid', String(taskId))
      .replace(':userid', String(userId));
    return await this.request(endpoint, { method: 'POST' });
  }

  async removeTaskFromUser(taskId, userId) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.REMOVE_USER
      .replace(':taskid', String(taskId))
      .replace(':userid', String(userId));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Task Assignments
  async getTaskAssignments() {
    return await this.request(API_CONFIG.ENDPOINTS.TASKS.ASSIGNMENTS);
  }

  async createTaskAssignment(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.TASKS.ASSIGNMENTS, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getTaskAssignmentById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.ASSIGNMENT_BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateTaskAssignment(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.ASSIGNMENT_BY_ID.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteTaskAssignment(id) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.ASSIGNMENT_BY_ID.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Task Skills
  async getTaskSkills() {
    return await this.request(API_CONFIG.ENDPOINTS.TASKS.SKILLS);
  }

  async createTaskSkill(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.TASKS.SKILLS, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getTaskSkillById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.SKILL_BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateTaskSkill(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.SKILL_BY_ID.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteTaskSkill(id) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.SKILL_BY_ID.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  async updateTaskSkill(taskId, skillId, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.TASKS.UPDATE_SKILL
      .replace(':taskid', String(taskId))
      .replace(':skillid', String(skillId));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // Approval Methods
  async getPendingApprovals(query = {}) {
    const qs = new URLSearchParams(query).toString();
    const base = API_CONFIG.ENDPOINTS.APPROVALS.PENDING;
    return await this.request(qs ? `${base}?${qs}` : base);
  }

  async approveTimeEntry(id, payload = {}) {
    const endpoint = API_CONFIG.ENDPOINTS.APPROVALS.APPROVE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async rejectTimeEntry(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.APPROVALS.REJECT.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async bulkApprove(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.APPROVALS.BULK_APPROVE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getApprovalHistory() {
    return await this.request(API_CONFIG.ENDPOINTS.APPROVALS.HISTORY);
  }


  // Reports Methods
  async getTimesheetReport(query = {}) {
    const qs = new URLSearchParams(query).toString();
    const base = API_CONFIG.ENDPOINTS.REPORTS.TIMESHEET;
    return await this.request(qs ? `${base}?${qs}` : base);
  }

  async getAttendanceReport(query = {}) {
    const qs = new URLSearchParams(query).toString();
    const base = API_CONFIG.ENDPOINTS.REPORTS.ATTENDANCE;
    return await this.request(qs ? `${base}?${qs}` : base);
  }

  async getPayrollReport(query = {}) {
    const qs = new URLSearchParams(query).toString();
    const base = API_CONFIG.ENDPOINTS.REPORTS.PAYROLL;
    return await this.request(qs ? `${base}?${qs}` : base);
  }

  async getOvertimeReport(query = {}) {
    const qs = new URLSearchParams(query).toString();
    const base = API_CONFIG.ENDPOINTS.REPORTS.OVERTIME;
    return await this.request(qs ? `${base}?${qs}` : base);
  }

  // Settings Methods
  async getProfileSettings() {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE);
  }

  async updateProfileSettings(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async getNotificationPreferences() {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.NOTIFICATIONS);
  }

  async updateNotificationPreferences(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.NOTIFICATIONS, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async getWorkPreferences() {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.WORK_PREFERENCES);
  }

  async updateWorkPreferences(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.WORK_PREFERENCES, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // Payroll Methods
  async getPayrollSummary(query = {}) {
    const qs = new URLSearchParams(query).toString();
    const base = API_CONFIG.ENDPOINTS.PAYROLL.SUMMARY;
    return await this.request(qs ? `${base}?${qs}` : base);
  }


  // Compliance Methods
  async getComplianceIssues() {
    const endpoint = API_CONFIG.ENDPOINTS.COMPLIANCE.ISSUES;
    return await this.request(endpoint);
  }

  // Labor Methods
  async getLaborDistribution() {
    const endpoint = API_CONFIG.ENDPOINTS.LABOR.DISTRIBUTION;
    return await this.request(endpoint);
  }

  // Reports Methods
  async getTurnoverReport(query = {}) {
    const endpoint = API_CONFIG.ENDPOINTS.REPORTS.TURNOVER;
    const queryString = new URLSearchParams(query).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return await this.request(fullEndpoint);
  }

  async getPayrollHistory() {
    return await this.request(API_CONFIG.ENDPOINTS.PAYROLL.HISTORY);
  }

  async generatePayroll(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.PAYROLL.GENERATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getPayRates() {
    return await this.request(API_CONFIG.ENDPOINTS.PAYROLL.RATES);
  }

  async updatePayRates(userId, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.PAYROLL.UPDATE_RATES.replace(':user_id', String(userId));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // Notifications Methods
  async getNotifications() {
    return await this.request(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST);
  }

  async getUnreadNotificationCount() {
    return await this.request(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  }

  async markNotificationAsRead(id) {
    const endpoint = API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', String(id));
    return await this.request(endpoint, { method: 'PUT' });
  }

  async markAllNotificationsAsRead() {
    return await this.request(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {
      method: 'PUT'
    });
  }

  async deleteNotification(id) {
    const endpoint = API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  async updateNotificationPreferences(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.NOTIFICATIONS.PREFERENCES, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Teams Methods
  async getTeams() {
    return await this.request(API_CONFIG.ENDPOINTS.TEAMS.LIST);
  }

  async listTeams() {
    return await this.getTeams(); // Alias for consistency with component usage
  }

  async createTeam(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.TEAMS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getTeamById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.TEAMS.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateTeam(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.TEAMS.UPDATE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteTeam(id) {
    const endpoint = API_CONFIG.ENDPOINTS.TEAMS.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Projects Methods
  async getProjects() {
    return await this.request(API_CONFIG.ENDPOINTS.PROJECTS.LIST);
  }

  async createProject(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.PROJECTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getProjectById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.PROJECTS.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateProject(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.PROJECTS.UPDATE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteProject(id) {
    const endpoint = API_CONFIG.ENDPOINTS.PROJECTS.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Skills Methods (Enhanced)
  async getSkillById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.SKILLS.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateSkill(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.SKILLS.UPDATE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteSkill(id) {
    const endpoint = API_CONFIG.ENDPOINTS.SKILLS.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // User Skills Methods
  async getUserSkills() {
    return await this.request(API_CONFIG.ENDPOINTS.USER_SKILLS.LIST);
  }

  async createUserSkill(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.USER_SKILLS.LIST, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getUserSkillById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.USER_SKILLS.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateUserSkill(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.USER_SKILLS.BY_ID.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteUserSkill(id) {
    const endpoint = API_CONFIG.ENDPOINTS.USER_SKILLS.BY_ID.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  async assignSkillToUser(userId, skillId) {
    const endpoint = API_CONFIG.ENDPOINTS.USER_SKILLS.ASSIGN
      .replace(':userid', String(userId))
      .replace(':skillid', String(skillId));
    return await this.request(endpoint, { method: 'POST' });
  }

  async removeSkillFromUser(userId, skillId) {
    const endpoint = API_CONFIG.ENDPOINTS.USER_SKILLS.REMOVE
      .replace(':userid', String(userId))
      .replace(':skillid', String(skillId));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Schedules Methods (Enhanced)
  async getSchedules(params = {}) {
    const endpoint = API_CONFIG.ENDPOINTS.SCHEDULES.LIST;
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return await this.request(fullEndpoint);
  }

  async createSchedule(payload) {
    const endpoint = API_CONFIG.ENDPOINTS.SCHEDULES.CREATE;
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getScheduleById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.SCHEDULES.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateSchedule(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.SCHEDULES.UPDATE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteSchedule(id) {
    const endpoint = API_CONFIG.ENDPOINTS.SCHEDULES.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Shifts Methods
  async getShifts() {
    return await this.request(API_CONFIG.ENDPOINTS.SHIFTS.LIST);
  }

  async createShift(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.SHIFTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getShiftById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.SHIFTS.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateShift(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.SHIFTS.UPDATE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteShift(id) {
    const endpoint = API_CONFIG.ENDPOINTS.SHIFTS.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Leaves Methods
  async getLeaves() {
    return await this.request(API_CONFIG.ENDPOINTS.LEAVES.LIST);
  }

  async createLeave(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.LEAVES.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getLeaveById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.LEAVES.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateLeave(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.LEAVES.UPDATE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteLeave(id) {
    const endpoint = API_CONFIG.ENDPOINTS.LEAVES.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Roles Methods
  async getRoleById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.ROLES.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async deleteUserPermissions(userId) {
    const endpoint = API_CONFIG.ENDPOINTS.PERMISSIONS.DELETE.replace(':user_id', String(userId));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Activities Methods
  async getBillableActivities() {
    return await this.request(API_CONFIG.ENDPOINTS.ACTIVITIES.BILLABLE);
  }

  // Unrecognized Works Methods
  async getUnrecognizedWorks() {
    return await this.request(API_CONFIG.ENDPOINTS.UNRECOGNIZED_WORKS.LIST);
  }

  async createUnrecognizedWork(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.UNRECOGNIZED_WORKS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getUnrecognizedWorkById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.UNRECOGNIZED_WORKS.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateUnrecognizedWork(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.UNRECOGNIZED_WORKS.UPDATE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteUnrecognizedWork(id) {
    const endpoint = API_CONFIG.ENDPOINTS.UNRECOGNIZED_WORKS.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Compensation Logs Methods
  async getCompensationLogs() {
    return await this.request(API_CONFIG.ENDPOINTS.COMPENSATION_LOGS.LIST);
  }

  async createCompensationLog(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.COMPENSATION_LOGS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getCompensationLogById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.COMPENSATION_LOGS.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateCompensationLog(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.COMPENSATION_LOGS.UPDATE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteCompensationLog(id) {
    const endpoint = API_CONFIG.ENDPOINTS.COMPENSATION_LOGS.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Integration Methods (Enhanced)
  async createIntegration(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.INTEGRATION.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getIntegrationById(id) {
    const endpoint = API_CONFIG.ENDPOINTS.INTEGRATION.BY_ID.replace(':id', String(id));
    return await this.request(endpoint);
  }

  async updateIntegration(id, payload) {
    const endpoint = API_CONFIG.ENDPOINTS.INTEGRATION.UPDATE.replace(':id', String(id));
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  async deleteIntegration(id) {
    const endpoint = API_CONFIG.ENDPOINTS.INTEGRATION.DELETE.replace(':id', String(id));
    return await this.request(endpoint, { method: 'DELETE' });
  }

  // Mock API Service Fallback
  async getMockResponse(endpoint, options = {}) {
    // This would be implemented with mock data for development/testing
    console.warn(`[API] Mock service fallback for ${endpoint}`);
    throw new Error('Mock service not implemented');
  }
}

// Export singleton instance
export const apiService = new GothamApiService();
export default apiService;