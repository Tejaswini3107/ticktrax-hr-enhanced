// Gotham API Service - Simple integration without authentication complexity
import { API_CONFIG } from '../config/api.js';

class GothamApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL || 'http://localhost:3000'; // Gotham API base URL
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      };

      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication endpoints (simplified - no token management)
  async signIn(email, password) {
    return this.request('/auth/sign_in', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async signUp(userData) {
    return this.request('/auth/sign_up', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async signOut() {
    return this.request('/auth/sign_out', {
      method: 'POST'
    });
  }

  // User management
  async getCurrentUser() {
    return this.request('/users/current');
  }

  async updateUser(userData) {
    return this.request('/users/current', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async getAllUsers() {
    return this.request('/users');
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUserById(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE'
    });
  }

  // Time tracking
  async clockIn(userId) {
    return this.request('/time_tracking/clock_in', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    });
  }

  async clockOut(userId) {
    return this.request('/time_tracking/clock_out', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    });
  }

  async getTimeEntries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/time_tracking/entries?${queryString}` : '/time_tracking/entries';
    return this.request(endpoint);
  }

  async getTimeEntry(entryId) {
    return this.request(`/time_tracking/entries/${entryId}`);
  }

  async createTimeEntry(entryData) {
    return this.request('/time_tracking/entries', {
      method: 'POST',
      body: JSON.stringify(entryData)
    });
  }

  async updateTimeEntry(entryId, entryData) {
    return this.request(`/time_tracking/entries/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(entryData)
    });
  }

  async deleteTimeEntry(entryId) {
    return this.request(`/time_tracking/entries/${entryId}`, {
      method: 'DELETE'
    });
  }

  async getCurrentStatus(userId) {
    return this.request(`/time_tracking/current_status/${userId}`);
  }

  async getTimeReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/time_tracking/report?${queryString}` : '/time_tracking/report';
    return this.request(endpoint);
  }

  // Schedule management
  async getSchedules(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/schedules?${queryString}` : '/schedules';
    return this.request(endpoint);
  }

  async getSchedule(scheduleId) {
    return this.request(`/schedules/${scheduleId}`);
  }

  async createSchedule(scheduleData) {
    return this.request('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
  }

  async updateSchedule(scheduleId, scheduleData) {
    return this.request(`/schedules/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData)
    });
  }

  async deleteSchedule(scheduleId) {
    return this.request(`/schedules/${scheduleId}`, {
      method: 'DELETE'
    });
  }

  // Task management
  async getTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    return this.request(endpoint);
  }

  async getTask(taskId) {
    return this.request(`/tasks/${taskId}`);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async updateTask(taskId, taskData) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }

  // Payroll
  async getPayrollPeriods(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/payroll/periods?${queryString}` : '/payroll/periods';
    return this.request(endpoint);
  }

  async getPayrollPeriod(periodId) {
    return this.request(`/payroll/periods/${periodId}`);
  }

  async createPayrollPeriod(periodData) {
    return this.request('/payroll/periods', {
      method: 'POST',
      body: JSON.stringify(periodData)
    });
  }

  async updatePayrollPeriod(periodId, periodData) {
    return this.request(`/payroll/periods/${periodId}`, {
      method: 'PUT',
      body: JSON.stringify(periodData)
    });
  }

  async deletePayrollPeriod(periodId) {
    return this.request(`/payroll/periods/${periodId}`, {
      method: 'DELETE'
    });
  }

  async calculatePayroll(periodId) {
    return this.request(`/payroll/calculate/${periodId}`, {
      method: 'POST'
    });
  }

  // Integrations
  async getIntegrations() {
    return this.request('/integrations');
  }

  async getIntegration(integrationId) {
    return this.request(`/integrations/${integrationId}`);
  }

  async createIntegration(integrationData) {
    return this.request('/integrations', {
      method: 'POST',
      body: JSON.stringify(integrationData)
    });
  }

  async updateIntegration(integrationId, integrationData) {
    return this.request(`/integrations/${integrationId}`, {
      method: 'PUT',
      body: JSON.stringify(integrationData)
    });
  }

  async deleteIntegration(integrationId) {
    return this.request(`/integrations/${integrationId}`, {
      method: 'DELETE'
    });
  }

  async testIntegration(integrationId) {
    return this.request(`/integrations/${integrationId}/test`, {
      method: 'POST'
    });
  }

  async syncIntegration(integrationId) {
    return this.request(`/integrations/${integrationId}/sync`, {
      method: 'POST'
    });
  }
}

// Export singleton instance
export const apiService = new GothamApiService();
export default apiService;