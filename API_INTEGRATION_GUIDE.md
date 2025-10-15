# 🚀 TickTrax API Integration Guide

Complete guide for integrating with the TickTrax (Gotham Time Manager) API - all 87 endpoints with real-world examples.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🔧 Setup & Configuration](#-setup--configuration)
- [🔐 Authentication](#-authentication)
- [⏰ Time Tracking](#-time-tracking)
- [🍕 Break Management](#-break-management)
- [✅ Approval Workflows](#-approval-workflows)
- [📊 Analytics & Reports](#-analytics--reports)
- [⚙️ Settings & Preferences](#️-settings--preferences)
- [🔔 Notifications](#-notifications)
- [🏢 Management Features](#-management-features)
- [🚀 Advanced Features](#-advanced-features)
- [🐛 Error Handling](#-error-handling)
- [📱 Mobile Integration](#-mobile-integration)

---

## 🎯 Overview

The TickTrax API provides comprehensive time tracking, break management, approval workflows, analytics, and administrative features through 87 well-designed endpoints.

### Key Features
- **Real-time tracking** with GPS location support
- **Break management** with multiple break types
- **Approval workflows** for time entries
- **Advanced analytics** and reporting
- **Role-based access control**
- **Mobile-optimized** endpoints
- **WebSocket support** for real-time updates

---

## 🔧 Setup & Configuration

### Base Configuration
```javascript
// API Configuration
const API_CONFIG = {
  BASE_URL: 'https://batman-api-a20b3a37aa3c.herokuapp.com/api',
  WS_URL: 'wss://batman-api-a20b3a37aa3c.herokuapp.com/socket',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};
```

### Environment Variables
```bash
# Production
VITE_API_BASE_URL=https://batman-api-a20b3a37aa3c.herokuapp.com/api
VITE_WS_URL=wss://batman-api-a20b3a37aa3c.herokuapp.com/socket

# Development
VITE_API_BASE_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000/socket
```

---

## 🔐 Authentication

### 1. User Registration
```javascript
// Register a new user
const registerUser = async (userData) => {
  const response = await apiService.register({
    username: "johndoe",
    email: "john@example.com",
    first_name: "John",
    last_name: "Doe",
    password: "securePassword123",
    role_id: 1 // 1=Employee, 2=Manager, 3=Admin
  });
  
  return response;
};
```

### 2. User Login
```javascript
// Login and get JWT token
const loginUser = async (credentials) => {
  const response = await apiService.login({
    email: "john@example.com",
    password: "securePassword123"
  });
  
  // JWT token is automatically saved
  return response;
};
```

### 3. Get Current User
```javascript
// Get authenticated user info
const getCurrentUser = async () => {
  const user = await apiService.getCurrentUser();
  return user;
};
```

### 4. Logout
```javascript
// Logout and clear tokens
const logoutUser = async () => {
  await apiService.logout();
  // Tokens are automatically cleared
};
```

---

## ⏰ Time Tracking

### 1. Clock In/Out with Location
```javascript
// Clock in with GPS coordinates
const clockIn = async (location) => {
  const response = await apiService.clockIn({
    latitude: 40.7128,
    longitude: -74.0060,
    work_location: "Wayne Enterprises HQ"
  });
  
  return response;
};

// Clock out
const clockOut = async (location) => {
  const response = await apiService.clockOut({
    latitude: 40.7128,
    longitude: -74.0060
  });
  
  return response;
};
```

### 2. Check Time Status
```javascript
// Get current time tracking status
const getTimeStatus = async () => {
  const status = await apiService.getTimeStatus();
  return status; // { is_clocked_in: true, current_session: {...} }
};
```

### 3. Get Time Entries
```javascript
// Get time entries with filters
const getTimeEntries = async (filters = {}) => {
  const entries = await apiService.getTimeEntries({
    page: 1,
    limit: 20,
    start_date: "2025-10-01",
    end_date: "2025-10-31"
  });
  
  return entries;
};
```

### 4. Manual Time Entry
```javascript
// Create manual time entry
const createManualEntry = async (entryData) => {
  const response = await apiService.createManualTimeEntry({
    clock_in: "2025-10-12T09:00:00Z",
    clock_out: "2025-10-12T17:00:00Z",
    work_location: "Home Office",
    notes: "Forgot to clock in this morning"
  });
  
  return response;
};
```

### 5. Update/Delete Time Entry
```javascript
// Update time entry
const updateTimeEntry = async (entryId, updates) => {
  const response = await apiService.updateTimeEntry(entryId, {
    clock_out: "2025-10-12T17:30:00Z",
    notes: "Updated clock out time"
  });
  
  return response;
};

// Delete time entry
const deleteTimeEntry = async (entryId) => {
  const response = await apiService.deleteTimeEntry(entryId);
  return response;
};
```

---

## 🍕 Break Management

### 1. Start/End Breaks
```javascript
// Start a break
const startBreak = async (breakType = 'regular') => {
  const response = await apiService.startBreak({
    break_type: breakType // 'regular', 'lunch', 'personal'
  });
  
  return response;
};

// End current break
const endBreak = async () => {
  const response = await apiService.endBreak();
  return response;
};
```

### 2. Break Status & History
```javascript
// Get current break status
const getBreakStatus = async () => {
  const status = await apiService.getBreakStatus();
  return status; // { is_on_break: true, break_started_at: "..." }
};

// Get break history
const getBreakHistory = async (filters = {}) => {
  const history = await apiService.getBreakHistory({
    page: 1,
    limit: 20,
    start_date: "2025-10-01",
    end_date: "2025-10-31"
  });
  
  return history;
};

// Get break summary for a specific date
const getBreakSummary = async (date) => {
  const summary = await apiService.getBreakSummary("2025-10-12");
  return summary;
};
```

---

## ✅ Approval Workflows

### 1. Manager Approval Flow
```javascript
// Get pending approvals
const getPendingApprovals = async () => {
  const approvals = await apiService.getPendingApprovals({
    page: 1,
    limit: 20
  });
  
  return approvals;
};

// Approve time entry
const approveTimeEntry = async (entryId, notes = '') => {
  const response = await apiService.approveTimeEntry(entryId, {
    notes: "Approved - valid overtime"
  });
  
  return response;
};

// Reject time entry
const rejectTimeEntry = async (entryId, reason) => {
  const response = await apiService.rejectTimeEntry(entryId, {
    reason: "Invalid location data"
  });
  
  return response;
};
```

### 2. Bulk Operations
```javascript
// Bulk approve multiple entries
const bulkApproveEntries = async (entryIds) => {
  const response = await apiService.bulkApproveEntries([
    "entry-uuid-1",
    "entry-uuid-2",
    "entry-uuid-3"
  ]);
  
  return response;
};

// Get approval history
const getApprovalHistory = async () => {
  const history = await apiService.getApprovalHistory({
    page: 1,
    limit: 20
  });
  
  return history;
};
```

---

## 📊 Analytics & Reports

### 1. Analytics Overview
```javascript
// Get analytics dashboard data
const getAnalyticsOverview = async () => {
  const overview = await apiService.getAnalyticsOverview();
  return overview;
};

// Get productivity metrics
const getProductivityMetrics = async (period = 'weekly') => {
  const metrics = await apiService.getProductivityMetrics({
    period: period // 'daily', 'weekly', 'monthly'
  });
  
  return metrics;
};
```

### 2. Attendance Analytics
```javascript
// Get attendance analytics
const getAttendanceAnalytics = async (dateRange) => {
  const analytics = await apiService.getAttendanceAnalytics({
    start_date: "2025-10-01",
    end_date: "2025-10-31"
  });
  
  return analytics;
};

// Get overtime analytics
const getOvertimeAnalytics = async (period = 'monthly') => {
  const analytics = await apiService.getOvertimeAnalytics({
    period: period
  });
  
  return analytics;
};
```

### 3. Team Performance
```javascript
// Get team performance metrics
const getTeamPerformance = async (teamId) => {
  const performance = await apiService.getTeamPerformance({
    team_id: teamId
  });
  
  return performance;
};
```

### 4. Generate Reports
```javascript
// Generate timesheet report
const generateTimesheetReport = async (params) => {
  const report = await apiService.generateTimesheetReport({
    user_id: 1,
    start_date: "2025-10-01",
    end_date: "2025-10-31",
    format: "pdf" // 'pdf', 'excel', 'csv'
  });
  
  return report;
};

// Generate attendance report
const generateAttendanceReport = async (params) => {
  const report = await apiService.generateAttendanceReport({
    team_id: 1,
    start_date: "2025-10-01",
    end_date: "2025-10-31"
  });
  
  return report;
};
```

---

## ⚙️ Settings & Preferences

### 1. Profile Settings
```javascript
// Get user profile
const getUserProfile = async () => {
  const profile = await apiService.getUserProfile();
  return profile;
};

// Update user profile
const updateUserProfile = async (updates) => {
  const response = await apiService.updateUserProfile({
    first_name: "John",
    last_name: "Doe",
    phone: "+1234567890",
    profile_picture: "https://example.com/avatar.jpg"
  });
  
  return response;
};

// Change password
const changePassword = async (passwordData) => {
  const response = await apiService.changePassword({
    current_password: "oldPassword123",
    new_password: "newPassword123",
    confirm_password: "newPassword123"
  });
  
  return response;
};
```

### 2. Notification Settings
```javascript
// Get notification settings
const getNotificationSettings = async () => {
  const settings = await apiService.getNotificationSettings();
  return settings;
};

// Update notification settings
const updateNotificationSettings = async (settings) => {
  const response = await apiService.updateNotificationSettings({
    email_notifications: true,
    push_notifications: true,
    approval_notifications: true,
    overtime_alerts: true
  });
  
  return response;
};
```

### 3. Work Preferences
```javascript
// Get work preferences
const getWorkPreferences = async () => {
  const preferences = await apiService.getWorkPreferences();
  return preferences;
};

// Update work preferences
const updateWorkPreferences = async (preferences) => {
  const response = await apiService.updateWorkPreferences({
    work_hours_per_day: 8,
    work_days_per_week: 5,
    break_duration: 30,
    lunch_duration: 60
  });
  
  return response;
};
```

---

## 🔔 Notifications

### 1. Notification Management
```javascript
// List notifications
const listNotifications = async (filters = {}) => {
  const notifications = await apiService.listNotifications({
    page: 1,
    limit: 20,
    unread_only: false
  });
  
  return notifications;
};

// Get unread count
const getUnreadCount = async () => {
  const count = await apiService.getUnreadCount();
  return count;
};

// Mark notification as read
const markNotificationRead = async (notificationId) => {
  const response = await apiService.markNotificationRead(notificationId);
  return response;
};

// Mark all as read
const markAllNotificationsRead = async () => {
  const response = await apiService.markAllNotificationsRead();
  return response;
};
```

### 2. Notification Preferences
```javascript
// Update notification preferences
const updateNotificationPreferences = async (preferences) => {
  const response = await apiService.updateNotificationPreferences({
    email_notifications: true,
    push_notifications: true,
    approval_notifications: true,
    overtime_alerts: true,
    reminder_notifications: true
  });
  
  return response;
};
```

---

## 🏢 Management Features

### 1. User Management (Admin)
```javascript
// List all users
const listUsers = async () => {
  const users = await apiService.listUsers();
  return users;
};

// Create new user
const createUser = async (userData) => {
  const response = await apiService.createUser({
    user: {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
      username: "janedoe",
      password: "password123",
      role_id: 1
    }
  });
  
  return response;
};

// Get user by ID
const getUserById = async (userId) => {
  const user = await apiService.getUserById(userId);
  return user;
};

// Update user
const updateUser = async (userId, updates) => {
  const response = await apiService.updateUser(userId, {
    user: {
      first_name: "Jane Updated",
      last_name: "Doe Updated",
      email: "jane.updated@example.com"
    }
  });
  
  return response;
};

// Delete user
const deleteUser = async (userId) => {
  const response = await apiService.deleteUser(userId);
  return response;
};
```

### 2. Team Management
```javascript
// List teams
const listTeams = async () => {
  const teams = await apiService.listTeams();
  return teams;
};

// Create team
const createTeam = async (teamData) => {
  const response = await apiService.createTeam({
    team: {
      name: "Development Team",
      description: "Main development team"
    }
  });
  
  return response;
};

// Assign team manager
const assignTeamManager = async (teamId, managerId) => {
  const response = await apiService.assignTeamManager(teamId, {
    manager_id: managerId
  });
  
  return response;
};
```

### 3. Project & Task Management
```javascript
// List projects
const listProjects = async () => {
  const projects = await apiService.listProjects();
  return projects;
};

// Create project
const createProject = async (projectData) => {
  const response = await apiService.createProject({
    project: {
      name: "Wayne Enterprises Portal",
      description: "Employee portal for Wayne Enterprises"
    }
  });
  
  return response;
};

// List tasks
const listTasks = async () => {
  const tasks = await apiService.listTasks();
  return tasks;
};

// Create task
const createTask = async (taskData) => {
  const response = await apiService.createTask({
    task: {
      title: "Implement user authentication",
      description: "Add JWT-based authentication",
      status: 1,
      user_ids: [1, 2]
    }
  });
  
  return response;
};

// Update task status
const updateTaskStatus = async (taskId, status) => {
  const response = await apiService.updateTaskStatus(taskId, status);
  return response;
};
```

---

## 🚀 Advanced Features

### 1. Enhanced API Service with Caching
```javascript
import { enhancedApiService } from './services/apiService.enhanced.js';

// Use enhanced service with caching
const getUserProfile = async () => {
  // This will use cache if available
  const profile = await enhancedApiService.getUserProfile();
  return profile;
};

// Preload critical data
const preloadDashboardData = async () => {
  const endpoints = [
    '/user/dashboard',
    '/time/status',
    '/user/breaks/status',
    '/notifications/unread-count'
  ];
  
  await enhancedApiService.preloadData(endpoints);
};

// Get performance metrics
const getApiMetrics = () => {
  const metrics = enhancedApiService.getMetrics();
  console.log('API Performance:', metrics);
  return metrics;
};
```

### 2. Batch Operations
```javascript
// Execute multiple requests in parallel
const batchGetData = async () => {
  const requests = [
    { endpoint: '/user/profile', options: {} },
    { endpoint: '/time/status', options: {} },
    { endpoint: '/user/breaks/status', options: {} },
    { endpoint: '/notifications/unread-count', options: {} }
  ];
  
  const results = await enhancedApiService.batchRequest(requests);
  return results;
};
```

### 3. Real-time Updates
```javascript
import { realTimeService } from './services/realTimeService.js';

// Initialize real-time service
const initializeRealTime = async () => {
  await realTimeService.initialize();
  
  // Join user-specific channel
  await realTimeService.joinChannel('user:123', {
    onTimeUpdate: (data) => {
      console.log('Time update received:', data);
    },
    onBreakUpdate: (data) => {
      console.log('Break update received:', data);
    },
    onNotification: (data) => {
      console.log('Notification received:', data);
    }
  });
};
```

---

## 🐛 Error Handling

### 1. Comprehensive Error Handling
```javascript
const handleApiCall = async (apiFunction, ...args) => {
  try {
    const result = await apiFunction(...args);
    return { success: true, data: result };
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific error types
    if (error.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
      return { success: false, error: 'Authentication required' };
    }
    
    if (error.status === 403) {
      // Forbidden - insufficient permissions
      return { success: false, error: 'Insufficient permissions' };
    }
    
    if (error.status === 429) {
      // Rate limited
      return { success: false, error: 'Rate limit exceeded. Please try again later.' };
    }
    
    // Generic error
    return { success: false, error: error.message || 'An error occurred' };
  }
};

// Usage
const result = await handleApiCall(apiService.getUserProfile);
if (result.success) {
  console.log('Profile:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### 2. Retry Logic
```javascript
const retryApiCall = async (apiFunction, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiFunction();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};
```

---

## 📱 Mobile Integration

### 1. Mobile-Specific Features
```javascript
import { mobileService } from './services/mobileService.js';

// Get device location
const getCurrentLocation = async () => {
  try {
    const location = await mobileService.getLocation();
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy
    };
  } catch (error) {
    console.error('Location error:', error);
    return null;
  }
};

// Camera integration
const takePhoto = async () => {
  try {
    const photo = await mobileService.getCamera();
    return photo;
  } catch (error) {
    console.error('Camera error:', error);
    return null;
  }
};
```

### 2. Offline Support
```javascript
// Check offline data availability
const getOfflineData = (endpoint) => {
  return enhancedApiService.getOfflineData(endpoint);
};

// Check if data is available offline
const isOfflineAvailable = (endpoint) => {
  return enhancedApiService.isOfflineAvailable(endpoint);
};
```

---

## 🎯 Best Practices

### 1. API Usage Patterns
```javascript
// ✅ Good: Use caching for frequently accessed data
const getDashboardData = async () => {
  const [profile, status, notifications] = await Promise.all([
    enhancedApiService.getUserProfile(),
    enhancedApiService.getTimeStatus(),
    enhancedApiService.getUnreadCount()
  ]);
  
  return { profile, status, notifications };
};

// ✅ Good: Handle errors gracefully
const safeApiCall = async (apiFunction, fallback = null) => {
  try {
    return await apiFunction();
  } catch (error) {
    console.error('API call failed:', error);
    return fallback;
  }
};

// ✅ Good: Use batch operations for multiple requests
const loadUserData = async (userId) => {
  const requests = [
    { endpoint: `/users/${userId}`, options: {} },
    { endpoint: `/time/entries?user_id=${userId}`, options: {} },
    { endpoint: `/user/breaks/history?user_id=${userId}`, options: {} }
  ];
  
  return await enhancedApiService.batchRequest(requests);
};
```

### 2. Performance Optimization
```javascript
// Preload critical data on app start
const initializeApp = async () => {
  const criticalEndpoints = [
    '/user/profile',
    '/time/status',
    '/user/breaks/status'
  ];
  
  await enhancedApiService.preloadData(criticalEndpoints);
};

// Use request deduplication for identical requests
const getTimeEntries = async (filters) => {
  // Multiple calls with same parameters will be deduplicated
  return await enhancedApiService.getTimeEntries(filters);
};
```

---

## 📚 Additional Resources

- **[API Endpoints Reference](./api-testing/API_ENDPOINTS.md)** - Complete endpoint documentation
- **[Quick Start Guide](./api-testing/QUICK_START.md)** - 5-minute setup guide
- **[Postman Collection](./api-testing/)** - Interactive API testing
- **[Mobile Integration Guide](./CORDOVA_MOBILE_APP.md)** - Mobile app setup
- **[Real-time Features](./REALTIME_FEATURES_GUIDE.md)** - WebSocket integration

---

**Last Updated:** October 12, 2025  
**API Version:** 1.0  
**Integration Guide Version:** 1.0
