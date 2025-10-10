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
    return Boolean(this.jwtToken);
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

      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`;
        try {
          const errJson = await response.json();
          const apiMsg = errJson?.error || errJson?.message || (Array.isArray(errJson?.errors) ? errJson.errors.join(', ') : null);
          if (apiMsg) message = `${response.status} ${apiMsg}`;
        } catch (_) {}
        throw new Error(message);
      }
      
      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      const contentType = response.headers.get('content-type') || '';
      const contentLength = Number(response.headers.get('content-length') || 0);

      // If not JSON or empty body, try text and return {}
      if (!contentType.toLowerCase().includes('json') || contentLength === 0) {
        const text = await response.text();
        if (!text) return {};
        try {
          const parsed = JSON.parse(text);
          console.log('API Response:', parsed);
          return parsed;
        } catch (_) {
          // Return as raw text when backend doesn't send JSON
          console.log('API Response (text):', text);
          return { message: text };
        }
      }
      
      const data = await response.json();
      console.log('API Response:', data);

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
}

// Export singleton instance
export const apiService = new GothamApiService();
export default apiService;