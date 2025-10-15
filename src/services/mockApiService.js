// Mock API Service for Development
// This provides mock data when the real API is not available

class MockApiService {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.mockData = {
      users: [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', role: 'employee', department: 'Engineering' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', role: 'manager', department: 'Engineering' },
        { id: 3, first_name: 'Bob', last_name: 'Johnson', email: 'bob@example.com', role: 'hr', department: 'HR' },
        { id: 4, first_name: 'Alice', last_name: 'Brown', email: 'alice@example.com', role: 'admin', department: 'IT' }
      ],
      timeEntries: [
        { id: 1, user_id: 1, clock_in: '2025-01-12T09:00:00Z', clock_out: '2025-01-12T17:00:00Z', hours: 8, status: 'approved' },
        { id: 2, user_id: 2, clock_in: '2025-01-12T08:30:00Z', clock_out: '2025-01-12T17:30:00Z', hours: 9, status: 'pending' }
      ],
      notifications: [
        { id: 1, message: 'Welcome to TickTrax!', type: 'info', read: false },
        { id: 2, message: 'Time entry approved', type: 'success', read: false }
      ]
    };
  }

  // Mock authentication
  async login(credentials) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = this.mockData.users.find(u => 
      u.email === credentials.email && credentials.password === 'password123'
    );
    
    if (user) {
      this.isAuthenticated = true;
      this.currentUser = user;
      return {
        success: true,
        data: {
          user,
          token: 'mock-jwt-token-' + user.id
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  async getCurrentUser() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }
    return { data: this.currentUser };
  }

  async logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    return { success: true };
  }

  // Mock API methods
  async listUsers() {
    await this.simulateDelay();
    return this.mockData.users;
  }

  async getTimeStatus() {
    await this.simulateDelay();
    return {
      is_clocked_in: false,
      current_session: null,
      last_clock_in: null
    };
  }

  async getTimeEntries(params = {}) {
    await this.simulateDelay();
    return {
      data: this.mockData.timeEntries,
      pagination: { page: 1, limit: 20, total: this.mockData.timeEntries.length }
    };
  }

  async clockIn(payload) {
    await this.simulateDelay();
    return {
      success: true,
      message: 'Clocked in successfully',
      data: {
        clock_in_time: new Date().toISOString(),
        location: payload.work_location
      }
    };
  }

  async clockOut(payload) {
    await this.simulateDelay();
    return {
      success: true,
      message: 'Clocked out successfully',
      data: {
        clock_out_time: new Date().toISOString(),
        total_hours: 8.5
      }
    };
  }

  async getNotifications(params = {}) {
    await this.simulateDelay();
    return this.mockData.notifications;
  }

  async getCurrentStatus() {
    await this.simulateDelay();
    return {
      is_clocked_in: false,
      status: 'offline'
    };
  }

  async getTeamMembers() {
    await this.simulateDelay();
    return this.mockData.users.filter(u => u.role !== 'admin');
  }

  async getPendingApprovals(params = {}) {
    await this.simulateDelay();
    return this.mockData.timeEntries.filter(entry => entry.status === 'pending');
  }

  async getAnalyticsOverview() {
    await this.simulateDelay();
    return {
      total_employees: this.mockData.users.length,
      active_today: 3,
      attendance_rate: 95,
      productivity_score: 88,
      average_hours: 8.2,
      overtime_hours: 12
    };
  }

  async getAttendanceAnalytics(params = {}) {
    await this.simulateDelay();
    return {
      daily_attendance: [
        { date: '2025-01-12', present: 15, absent: 2, late: 1 },
        { date: '2025-01-11', present: 16, absent: 1, late: 0 }
      ]
    };
  }

  async getProductivityMetrics(params = {}) {
    await this.simulateDelay();
    return {
      weekly_metrics: [
        { week: 'Week 1', productivity_score: 85, total_hours: 320 },
        { week: 'Week 2', productivity_score: 88, total_hours: 340 }
      ]
    };
  }

  async getPayrollSummary(params = {}) {
    await this.simulateDelay();
    return {
      total_payroll: 125450,
      total_hours: 2450,
      average_hourly_rate: 51.20
    };
  }

  async listTeams() {
    await this.simulateDelay();
    return [
      { id: 1, name: 'Engineering', description: 'Development team', employee_count: 8 },
      { id: 2, name: 'HR', description: 'Human Resources', employee_count: 3 },
      { id: 3, name: 'IT', description: 'Information Technology', employee_count: 5 }
    ];
  }

  // Helper method to simulate API delay
  async simulateDelay() {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
  }

  // Mock all other API methods to prevent errors
  async request(endpoint, options = {}) {
    await this.simulateDelay();
    return { success: true, message: 'Mock response' };
  }

  // Add all missing methods that might be called
  async register(payload) { return { success: true, data: { user: payload } }; }
  async getUserProfile() { return { data: this.currentUser }; }
  async updateUserProfile(payload) { return { success: true }; }
  async changePassword(payload) { return { success: true }; }
  async getUserDashboard() { return { data: { stats: {} } }; }
  async startBreak(payload) { return { success: true }; }
  async endBreak() { return { success: true }; }
  async getBreakStatus() { return { is_on_break: false }; }
  async getBreakHistory(params) { return { data: [] }; }
  async getBreakSummary(date) { return { data: {} }; }
  async createManualTimeEntry(payload) { return { success: true }; }
  async updateTimeEntry(id, payload) { return { success: true }; }
  async deleteTimeEntry(id) { return { success: true }; }
  async approveTimeEntry(id, payload) { return { success: true }; }
  async rejectTimeEntry(id, payload) { return { success: true }; }
  async bulkApproveEntries(ids) { return { success: true }; }
  async getApprovalHistory(params) { return { data: [] }; }
  async getProductivityMetrics(params) { return { data: {} }; }
  async getAttendanceAnalytics(params) { return { data: {} }; }
  async getOvertimeAnalytics(params) { return { data: {} }; }
  async getTeamPerformance(params) { return { data: {} }; }
  async generateTimesheetReport(params) { return { data: {} }; }
  async generateAttendanceReport(params) { return { data: {} }; }
  async generateProductivityReport(params) { return { data: {} }; }
  async exportReports(params) { return { data: {} }; }
  async getProfileSettings() { return { data: {} }; }
  async updateProfileSettings(payload) { return { success: true }; }
  async getNotificationSettings() { return { data: {} }; }
  async updateNotificationSettings(payload) { return { success: true }; }
  async getWorkPreferences() { return { data: {} }; }
  async updateWorkPreferences(payload) { return { success: true }; }
  async getSystemSettings() { return { data: {} }; }
  async updateSystemSettings(payload) { return { success: true }; }
  async getPayrollHistory(params) { return { data: [] }; }
  async generatePayroll(payload) { return { success: true }; }
  async getPayRates() { return { data: {} }; }
  async updatePayRates(id, payload) { return { success: true }; }
  async getUnreadCount() { return { count: 2 }; }
  async markNotificationRead(id) { return { success: true }; }
  async markAllNotificationsRead() { return { success: true }; }
  async deleteNotification(id) { return { success: true }; }
  async updateNotificationPreferences(payload) { return { success: true }; }
  async createUser(payload) { return { success: true }; }
  async getUserById(id) { return { data: this.mockData.users[0] }; }
  async updateUser(id, payload) { return { success: true }; }
  async deleteUser(id) { return { success: true }; }
  async createTeam(payload) { return { success: true }; }
  async assignTeamManager(id, payload) { return { success: true }; }
  async listProjects() { return { data: [] }; }
  async createProject(payload) { return { success: true }; }
  async listTasks() { return { data: [] }; }
  async createTask(payload) { return { success: true }; }
  async updateTaskStatus(id, status) { return { success: true }; }
  async listSchedules() { return { data: [] }; }
  async createSchedule(payload) { return { success: true }; }
  async createBatchSchedules(schedules) { return { success: true }; }
  async listWorkingTimes() { return { data: [] }; }
  async logUnpaidOvertime(payload) { return { success: true }; }
  async getUserClock(id) { return { data: {} }; }
  async clockInOut(id, status) { return { success: true }; }
  async getUserWorkingTimes(id) { return { data: [] }; }
  async listRoles() { return { data: [] }; }
  async updateUserPermissions(id, payload) { return { success: true }; }
}

// Export singleton instance
export const mockApiService = new MockApiService();
export default mockApiService;