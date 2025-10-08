// Mock API Service for development
export const mockApiService = {
  // Mock authentication
  async login(credentials) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Accept either email or username for mock logins
    const hasEmail = Boolean(credentials && credentials.email);
    const hasUsername = Boolean(credentials && credentials.username);

    if ((hasEmail || hasUsername) && credentials.password) {
      const email = credentials.email || `${credentials.username}@example.com`;

      // Create a friendly display name from username when available
      let name = 'Employee User';
      if (hasUsername) {
        name = credentials.username
          .replace(/[_\.\-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }

      // Basic role inference for demo users
      let role = 'employee';
      if (credentials.username && credentials.username.includes('admin')) role = 'admin';
      else if (credentials.username && credentials.username.includes('manager')) role = 'manager';

      return {
        success: true,
        data: {
          user: {
            id: 1,
            email,
            name,
            role
          },
          token: 'mock-jwt-token'
        }
      };
    }

    throw new Error('Invalid credentials');
  },

  // Mock logout
  async logout() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  // Mock user data
  async getUsers() {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'employee' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'manager' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'admin' }
      ]
    };
  },

  // Mock tasks data
  async getTasks() {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      success: true,
      data: [
        { id: 1, title: 'Task 1', status: 1, assignedTo: 1 },
        { id: 2, title: 'Task 2', status: 2, assignedTo: 1 },
        { id: 3, title: 'Task 3', status: 3, assignedTo: 2 }
      ]
    };
  },

  // Mock time entries
  async getTimeEntries() {
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
};

// Override the API service to use mock data
export const useMockApi = () => {
  return mockApiService;
};
