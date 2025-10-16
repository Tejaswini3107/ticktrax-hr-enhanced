// Mock API Service for development
import apiService from './apiService.js';

export const mockApiService = {
  // Login: Mock authentication service (no real API calls)
  async login(credentials) {
    // Require email-based login in the UI now
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    // Mock authentication behavior (deterministic from email)
    await new Promise(resolve => setTimeout(resolve, 1000));
    const email = credentials.email;
    const name = email.split('@')[0].replace(/[_\.\-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const role = email.includes('admin') ? 'admin' : 
                 email.includes('manager') ? 'manager' : 
                 email.includes('hr') ? 'hr' : 'employee';
    
    // Mock API role detection
    
    return {
      success: true,
      data: {
        user: { id: 1, email, name, role }
      },
      token: 'mock-jwt-token'
    };
  },

  // Logout: use signOut endpoint
  async logout() {
    try {
      const res = await apiService.signOut();
      return res;
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }
  },

  // Users: prefer real API listUsers
  async getUsers() {
    try {
      const users = await apiService.listUsers();
      return { success: true, data: Array.isArray(users) ? users : users?.data || users };
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        success: true,
        data: [
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'employee' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'manager' },
          { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'admin' }
        ]
      };
    }
  },

  // Tasks: prefer real API listTasks
  async getTasks() {
    try {
      const tasks = await apiService.listTasks();
      return { success: true, data: Array.isArray(tasks) ? tasks : tasks?.data || tasks };
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        success: true,
        data: [
          { id: 1, title: 'Task 1', status: 1, assignedTo: 1 },
          { id: 2, title: 'Task 2', status: 2, assignedTo: 1 },
          { id: 3, title: 'Task 3', status: 3, assignedTo: 2 }
        ]
      };
    }
  },

  // Time entries: try user working times for a sample user, else fallback
  async getTimeEntries(userID = 1) {
    try {
      const entries = await apiService.getUserWorkingTimes(userID);
      return { success: true, data: Array.isArray(entries) ? entries : entries?.data || entries };
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 700));
      return {
        success: true,
        data: [
          { id: 1, date: '2024-01-15', clockIn: '09:00', clockOut: '17:00', hours: 8 },
          { id: 2, date: '2024-01-16', clockIn: '09:15', clockOut: '17:30', hours: 8.25 },
          { id: 3, date: '2024-01-17', clockIn: '08:45', clockOut: '17:15', hours: 8.5 }
        ]
      };
    }
  }
};

// Export helper to opt into mock API (kept for compatibility)
export const useMockApi = () => mockApiService;
