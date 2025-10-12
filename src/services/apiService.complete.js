// Complete API Service - All 87 Endpoints from Postman Collection
// Gotham Time Manager / Ticktrax API Integration

import { API_CONFIG, replacePathParams, buildQueryString } from '../config/api.complete.js';

class TicktraxApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.jwtToken = null;
    this.csrfToken = null;
  }

  // ==================== TOKEN MANAGEMENT ====================
  
  initializeTokens() {
    this.jwtToken = localStorage.getItem('jwt_token');
    this.csrfToken = localStorage.getItem('csrf_token');
  }

  setTokens(jwtToken, csrfToken = null) {
    this.jwtToken = jwtToken;
    this.csrfToken = csrfToken;
    if (jwtToken) localStorage.setItem('jwt_token', jwtToken);
    if (csrfToken) localStorage.setItem('csrf_token', csrfToken);
  }

  clearTokens() {
    this.jwtToken = null;
    this.csrfToken = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('csrf_token');
    localStorage.removeItem('user_data');
  }

  isAuthenticated() {
    this.initializeTokens();
    return Boolean(this.jwtToken);
  }

  // ==================== GENERIC REQUEST METHOD ====================
  
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      };

      // Add authentication token
      this.initializeTokens();
      if (this.jwtToken) {
        headers[API_CONFIG.HEADERS.AUTHORIZATION] = `Bearer ${this.jwtToken}`;
      }

      // Add CSRF token for state-changing requests
      const method = (options.method || 'GET').toUpperCase();
      if (this.csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        headers[API_CONFIG.HEADERS.CSRF_TOKEN] = this.csrfToken;
      }

      const config = {
        method,
        headers,
        ...options
      };

      console.log(`[API] ${method} ${url}`);
      
      const response = await fetch(url, config);
      
      // Handle error responses
      if (!response.ok) {
        let message = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errJson = await response.json();
          message = errJson?.error || errJson?.message || 
                   (Array.isArray(errJson?.errors) ? errJson.errors.join(', ') : message);
        } catch (_) {}
        throw new Error(message);
      }
      
      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('json')) {
        const text = await response.text();
        return text ? { message: text } : { success: true };
      }

      const data = await response.json();
      console.log('[API] Response:', data);

      return data;
    } catch (error) {
      console.error('[API] Error:', error);
      throw error;
    }
  }

  // ==================== 🔐 AUTHENTICATION (4 endpoints) ====================
  
  /**
   * Register a new user
   * @param {Object} payload - { username, email, first_name, last_name, password, role_id }
   */
  async register(payload) {
    const result = await this.request(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    // Auto-save token if returned
    const token = result?.data?.token || result?.meta?.token;
    const csrf = result?.data?.csrf_token || result?.meta?.csrf_token;
    if (token) this.setTokens(token, csrf);
    
    return result;
  }

  /**
   * Login with email and password
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    const result = await this.request(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    // Extract and save JWT token
    const token = result?.data?.token || result?.meta?.token;
    const csrf = result?.data?.csrf_token || result?.meta?.csrf_token;
    if (token) this.setTokens(token, csrf);
    
    return result;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    return await this.request(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      const result = await this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST'
      });
      this.clearTokens();
      return result;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  // ==================== 👤 USER PROFILE (4 endpoints) ====================
  
  /**
   * Get user profile
   */
  async getUserProfile() {
    return await this.request(API_CONFIG.ENDPOINTS.USER.PROFILE);
  }

  /**
   * Update user profile
   * @param {Object} payload - { first_name, last_name, phone, profile_picture }
   */
  async updateUserProfile(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.USER.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Change user password
   * @param {Object} payload - { current_password, new_password, confirm_password }
   */
  async changePassword(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.USER.PASSWORD, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Get user dashboard data
   */
  async getUserDashboard() {
    return await this.request(API_CONFIG.ENDPOINTS.USER.DASHBOARD);
  }

  // ==================== 🍕 BREAK MANAGEMENT (6 endpoints) ====================
  
  /**
   * Start a break
   * @param {Object} payload - { break_type: 'regular' | 'lunch' | 'personal' }
   */
  async startBreak(payload = { break_type: 'regular' }) {
    return await this.request(API_CONFIG.ENDPOINTS.BREAKS.START, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * End current break
   */
  async endBreak() {
    return await this.request(API_CONFIG.ENDPOINTS.BREAKS.END, {
      method: 'POST'
    });
  }

  /**
   * Get current break status
   */
  async getBreakStatus() {
    return await this.request(API_CONFIG.ENDPOINTS.BREAKS.STATUS);
  }

  /**
   * Get break history
   * @param {Object} params - { page, limit, start_date, end_date }
   */
  async getBreakHistory(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.BREAKS.HISTORY}${query}`);
  }

  /**
   * Get break summary for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   */
  async getBreakSummary(date) {
    const query = buildQueryString({ date });
    return await this.request(`${API_CONFIG.ENDPOINTS.BREAKS.SUMMARY}${query}`);
  }

  // ==================== ⏰ TIME TRACKING (7 endpoints) ====================
  
  /**
   * Clock in
   * @param {Object} payload - { latitude, longitude, work_location }
   */
  async clockIn(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.TIME.CLOCK_IN, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Clock out
   * @param {Object} payload - { latitude, longitude }
   */
  async clockOut(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.TIME.CLOCK_OUT, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Get current time tracking status
   */
  async getTimeStatus() {
    return await this.request(API_CONFIG.ENDPOINTS.TIME.STATUS);
  }

  /**
   * Get time entries
   * @param {Object} params - { page, limit, start_date, end_date }
   */
  async getTimeEntries(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.TIME.ENTRIES}${query}`);
  }

  /**
   * Create manual time entry
   * @param {Object} payload - { clock_in, clock_out, work_location, notes }
   */
  async createManualTimeEntry(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.TIME.MANUAL_ENTRY, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Update time entry
   * @param {string} entryId - Time entry ID
   * @param {Object} payload - { clock_out, notes, etc. }
   */
  async updateTimeEntry(entryId, payload) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.TIME.ENTRY_BY_ID, { entry_id: entryId });
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Delete time entry
   * @param {string} entryId - Time entry ID
   */
  async deleteTimeEntry(entryId) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.TIME.ENTRY_BY_ID, { entry_id: entryId });
    return await this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // ==================== ✅ APPROVAL WORKFLOWS (5 endpoints) ====================
  
  /**
   * Get pending approvals
   * @param {Object} params - { page, limit }
   */
  async getPendingApprovals(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.APPROVALS.PENDING}${query}`);
  }

  /**
   * Approve time entry
   * @param {string} entryId - Entry ID
   * @param {Object} payload - { notes }
   */
  async approveTimeEntry(entryId, payload = {}) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.APPROVALS.APPROVE, { entry_id: entryId });
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Reject time entry
   * @param {string} entryId - Entry ID
   * @param {Object} payload - { reason }
   */
  async rejectTimeEntry(entryId, payload) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.APPROVALS.REJECT, { entry_id: entryId });
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Bulk approve entries
   * @param {Array} entryIds - Array of entry IDs
   */
  async bulkApproveEntries(entryIds) {
    return await this.request(API_CONFIG.ENDPOINTS.APPROVALS.BULK_APPROVE, {
      method: 'POST',
      body: JSON.stringify({ entry_ids: entryIds })
    });
  }

  /**
   * Get approval history
   * @param {Object} params - { page, limit }
   */
  async getApprovalHistory(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.APPROVALS.HISTORY}${query}`);
  }

  // ==================== 📊 ANALYTICS (5 endpoints) ====================
  
  /**
   * Get analytics overview
   */
  async getAnalyticsOverview() {
    return await this.request(API_CONFIG.ENDPOINTS.ANALYTICS.OVERVIEW);
  }

  /**
   * Get productivity metrics
   * @param {Object} params - { period: 'daily' | 'weekly' | 'monthly' }
   */
  async getProductivityMetrics(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.ANALYTICS.PRODUCTIVITY}${query}`);
  }

  /**
   * Get attendance analytics
   * @param {Object} params - { start_date, end_date }
   */
  async getAttendanceAnalytics(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.ANALYTICS.ATTENDANCE}${query}`);
  }

  /**
   * Get overtime analytics
   * @param {Object} params - { period: 'daily' | 'weekly' | 'monthly' }
   */
  async getOvertimeAnalytics(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.ANALYTICS.OVERTIME}${query}`);
  }

  /**
   * Get team performance
   * @param {Object} params - { team_id }
   */
  async getTeamPerformance(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.ANALYTICS.TEAM_PERFORMANCE}${query}`);
  }

  // ==================== 📈 REPORTS (4 endpoints) ====================
  
  /**
   * Generate timesheet report
   * @param {Object} params - { user_id, start_date, end_date, format }
   */
  async generateTimesheetReport(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.REPORTS.TIMESHEET}${query}`);
  }

  /**
   * Generate attendance report
   * @param {Object} params - { team_id, start_date, end_date }
   */
  async generateAttendanceReport(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.REPORTS.ATTENDANCE}${query}`);
  }

  /**
   * Generate productivity report
   * @param {Object} params - { period, format }
   */
  async generateProductivityReport(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.REPORTS.PRODUCTIVITY}${query}`);
  }

  /**
   * Export reports
   * @param {Object} params - { type, format, start_date, end_date }
   */
  async exportReports(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.REPORTS.EXPORT}${query}`);
  }

  // ==================== ⚙️ SETTINGS (8 endpoints) ====================
  
  /**
   * Get profile settings
   */
  async getProfileSettings() {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE);
  }

  /**
   * Update profile settings
   * @param {Object} payload - { timezone, date_format, time_format }
   */
  async updateProfileSettings(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings() {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.NOTIFICATIONS);
  }

  /**
   * Update notification settings
   * @param {Object} payload - { email_notifications, push_notifications, etc. }
   */
  async updateNotificationSettings(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.NOTIFICATIONS, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Get work preferences
   */
  async getWorkPreferences() {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.WORK_PREFERENCES);
  }

  /**
   * Update work preferences
   * @param {Object} payload - { work_hours_per_day, work_days_per_week, break_duration, lunch_duration }
   */
  async updateWorkPreferences(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.WORK_PREFERENCES, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Get system settings (Admin only)
   */
  async getSystemSettings() {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.SYSTEM);
  }

  /**
   * Update system settings (Admin only)
   * @param {Object} payload - { company_name, default_work_hours, overtime_rate, gps_tracking_enabled }
   */
  async updateSystemSettings(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.SETTINGS.SYSTEM, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // ==================== 💰 PAYROLL (5 endpoints) ====================
  
  /**
   * Get payroll summary
   * @param {Object} params - { period: 'current' | 'previous' }
   */
  async getPayrollSummary(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.PAYROLL.SUMMARY}${query}`);
  }

  /**
   * Get payroll history
   * @param {Object} params - { page, limit }
   */
  async getPayrollHistory(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.PAYROLL.HISTORY}${query}`);
  }

  /**
   * Generate payroll (Admin only)
   * @param {Object} payload - { start_date, end_date }
   */
  async generatePayroll(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.PAYROLL.GENERATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Get pay rates
   */
  async getPayRates() {
    return await this.request(API_CONFIG.ENDPOINTS.PAYROLL.RATES);
  }

  /**
   * Update pay rates (Admin only)
   * @param {string|number} userId - User ID
   * @param {Object} payload - { hourly_rate, overtime_rate }
   */
  async updatePayRates(userId, payload) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.PAYROLL.UPDATE_RATES, { user_id: userId });
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // ==================== 🔔 NOTIFICATIONS (6 endpoints) ====================
  
  /**
   * List notifications
   * @param {Object} params - { page, limit, unread_only }
   */
  async listNotifications(params = {}) {
    const query = buildQueryString(params);
    return await this.request(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}${query}`);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    return await this.request(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  }

  /**
   * Mark notification as read
   * @param {string|number} notificationId - Notification ID
   */
  async markNotificationRead(notificationId) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ, { notification_id: notificationId });
    return await this.request(endpoint, {
      method: 'PUT'
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead() {
    return await this.request(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {
      method: 'PUT'
    });
  }

  /**
   * Delete notification
   * @param {string|number} notificationId - Notification ID
   */
  async deleteNotification(notificationId) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE, { notification_id: notificationId });
    return await this.request(endpoint, {
      method: 'DELETE'
    });
  }

  /**
   * Update notification preferences
   * @param {Object} payload - { email_notifications, push_notifications, etc. }
   */
  async updateNotificationPreferences(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.NOTIFICATIONS.PREFERENCES, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // ==================== 👥 USER MANAGEMENT (5 endpoints) ====================
  
  /**
   * List all users
   */
  async listUsers() {
    return await this.request(API_CONFIG.ENDPOINTS.USERS.LIST);
  }

  /**
   * Create new user
   * @param {Object} payload - { user: { first_name, last_name, email, username, password, role_id } }
   */
  async createUser(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.USERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Get user by ID
   * @param {string|number} userId - User ID
   */
  async getUserById(userId) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.USERS.BY_ID, { user_id: userId });
    return await this.request(endpoint);
  }

  /**
   * Update user
   * @param {string|number} userId - User ID
   * @param {Object} payload - { user: { first_name, last_name, email } }
   */
  async updateUser(userId, payload) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.USERS.BY_ID, { user_id: userId });
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Delete user
   * @param {string|number} userId - User ID
   */
  async deleteUser(userId) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.USERS.BY_ID, { user_id: userId });
    return await this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // ==================== 👨‍👩‍👧‍👦 TEAM MANAGEMENT (3 endpoints) ====================
  
  /**
   * List all teams
   */
  async listTeams() {
    return await this.request(API_CONFIG.ENDPOINTS.TEAMS.LIST);
  }

  /**
   * Create team
   * @param {Object} payload - { team: { name, description } }
   */
  async createTeam(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.TEAMS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Assign manager to team
   * @param {string|number} teamId - Team ID
   * @param {Object} payload - { manager_id }
   */
  async assignTeamManager(teamId, payload) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.TEAMS.ASSIGN_MANAGER, { team_id: teamId });
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // ==================== 📁 PROJECT MANAGEMENT (2 endpoints) ====================
  
  /**
   * List all projects
   */
  async listProjects() {
    return await this.request(API_CONFIG.ENDPOINTS.PROJECTS.LIST);
  }

  /**
   * Create project
   * @param {Object} payload - { project: { name, description } }
   */
  async createProject(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.PROJECTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // ==================== ✓ TASK MANAGEMENT (3 endpoints) ====================
  
  /**
   * List all tasks
   */
  async listTasks() {
    return await this.request(API_CONFIG.ENDPOINTS.TASKS.LIST);
  }

  /**
   * Create task
   * @param {Object} payload - { task: { title, description, status, user_ids } }
   */
  async createTask(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.TASKS.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Update task status
   * @param {string|number} taskId - Task ID
   * @param {number} status - Status (1-4)
   */
  async updateTaskStatus(taskId, status) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.TASKS.UPDATE_STATUS, { task_id: taskId });
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // ==================== 📅 SCHEDULE MANAGEMENT (3 endpoints) ====================
  
  /**
   * List schedules
   */
  async listSchedules() {
    return await this.request(API_CONFIG.ENDPOINTS.SCHEDULES.LIST);
  }

  /**
   * Create schedule
   * @param {Object} payload - { schedule: { user_id, start_time, end_time, date } }
   */
  async createSchedule(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.SCHEDULES.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Batch create schedules
   * @param {Array} schedules - Array of schedule objects
   */
  async createBatchSchedules(schedules) {
    return await this.request(API_CONFIG.ENDPOINTS.SCHEDULES.CREATE_BATCH, {
      method: 'POST',
      body: JSON.stringify({ schedules })
    });
  }

  // ==================== ⏱️ WORKING TIMES (2 endpoints) ====================
  
  /**
   * List working times
   */
  async listWorkingTimes() {
    return await this.request(API_CONFIG.ENDPOINTS.WORKING_TIMES.LIST);
  }

  /**
   * Log unpaid overtime
   * @param {Object} payload - { hours, date, reason }
   */
  async logUnpaidOvertime(payload) {
    return await this.request(API_CONFIG.ENDPOINTS.WORKING_TIMES.LOG_UNPAID_OVERTIME, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // ==================== LEGACY ENDPOINTS (Backward Compatibility) ====================
  
  async getUserClock(userID) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.CLOCKS.BY_USER, { userID });
    return await this.request(endpoint);
  }

  async clockInOut(userID, status) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.CLOCKS.BY_USER, { userID });
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  async getUserWorkingTimes(userID) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.WORKINGTIME.BY_USER, { userID });
    return await this.request(endpoint);
  }

  async listRoles() {
    return await this.request(API_CONFIG.ENDPOINTS.ROLES.LIST);
  }

  async updateUserPermissions(userId, payload) {
    const endpoint = replacePathParams(API_CONFIG.ENDPOINTS.PERMISSIONS.UPDATE, { user_id: userId });
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }
}

// Export singleton instance
export const apiService = new TicktraxApiService();
export default apiService;

