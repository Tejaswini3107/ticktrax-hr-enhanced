# API Usage Guide - Frontend Integration

Complete guide for using all 87 integrated API endpoints in the Ticktrax frontend.

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [User Profile](#user-profile)
- [Break Management](#break-management)
- [Time Tracking](#time-tracking)
- [Approvals](#approvals)
- [Analytics](#analytics)
- [Reports](#reports)
- [Settings](#settings)
- [Payroll](#payroll)
- [Notifications](#notifications)
- [User Management](#user-management)
- [Team Management](#team-management)
- [Project Management](#project-management)
- [Task Management](#task-management)
- [Schedule Management](#schedule-management)
- [Working Times](#working-times)
- [Error Handling](#error-handling)

---

## Quick Start

### Import the API Service

```javascript
import { apiService } from '@/services/apiService.js';
// or
import apiService from '@/services/apiService.js';
```

### Basic Usage Pattern

```javascript
// All API methods return promises
try {
  const data = await apiService.methodName(params);
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🔐 Authentication

### Login

```javascript
// Login with email and password
const credentials = {
  email: 'john@example.com',
  password: 'password123'
};

try {
  const result = await apiService.login(credentials);
  // Token is automatically saved
  console.log('Logged in:', result);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Register

```javascript
const newUser = {
  username: 'johndoe',
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  password: 'password123',
  role_id: 1
};

try {
  const result = await apiService.register(newUser);
  console.log('User registered:', result);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

### Get Current User

```javascript
try {
  const user = await apiService.getCurrentUser();
  console.log('Current user:', user);
} catch (error) {
  console.error('Failed to get user:', error.message);
}
```

### Logout

```javascript
try {
  await apiService.logout();
  // Tokens are automatically cleared
  console.log('Logged out successfully');
} catch (error) {
  console.error('Logout failed:', error.message);
}
```

### Check Authentication Status

```javascript
const isLoggedIn = apiService.isAuthenticated();
console.log('Is authenticated:', isLoggedIn);
```

---

## 👤 User Profile

### Get User Profile

```javascript
try {
  const profile = await apiService.getUserProfile();
  console.log('Profile:', profile);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Update Profile

```javascript
const updates = {
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  profile_picture: 'https://example.com/avatar.jpg'
};

try {
  const result = await apiService.updateUserProfile(updates);
  console.log('Profile updated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Change Password

```javascript
const passwordData = {
  current_password: 'oldpassword',
  new_password: 'newpassword123',
  confirm_password: 'newpassword123'
};

try {
  const result = await apiService.changePassword(passwordData);
  console.log('Password changed:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Dashboard Data

```javascript
try {
  const dashboard = await apiService.getUserDashboard();
  console.log('Dashboard data:', dashboard);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🍕 Break Management

### Start Break

```javascript
try {
  const result = await apiService.startBreak({ break_type: 'regular' });
  // break_type options: 'regular', 'lunch', 'personal'
  console.log('Break started:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### End Break

```javascript
try {
  const result = await apiService.endBreak();
  console.log('Break ended:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Break Status

```javascript
try {
  const status = await apiService.getBreakStatus();
  console.log('Break status:', status);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Break History

```javascript
const params = {
  page: 1,
  limit: 20,
  start_date: '2025-10-01',
  end_date: '2025-10-31'
};

try {
  const history = await apiService.getBreakHistory(params);
  console.log('Break history:', history);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Break Summary

```javascript
try {
  const summary = await apiService.getBreakSummary('2025-10-12');
  console.log('Break summary:', summary);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## ⏰ Time Tracking

### Clock In

```javascript
const clockInData = {
  latitude: 40.7128,
  longitude: -74.0060,
  work_location: 'Office'
};

try {
  const result = await apiService.clockIn(clockInData);
  console.log('Clocked in:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Clock Out

```javascript
const clockOutData = {
  latitude: 40.7128,
  longitude: -74.0060
};

try {
  const result = await apiService.clockOut(clockOutData);
  console.log('Clocked out:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Time Status

```javascript
try {
  const status = await apiService.getTimeStatus();
  console.log('Time status:', status);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Time Entries

```javascript
const params = {
  page: 1,
  limit: 20,
  start_date: '2025-10-01',
  end_date: '2025-10-31'
};

try {
  const entries = await apiService.getTimeEntries(params);
  console.log('Time entries:', entries);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Create Manual Time Entry

```javascript
const manualEntry = {
  clock_in: '2025-10-12T09:00:00Z',
  clock_out: '2025-10-12T17:00:00Z',
  work_location: 'Home Office',
  notes: 'Forgot to clock in'
};

try {
  const result = await apiService.createManualTimeEntry(manualEntry);
  console.log('Manual entry created:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Update Time Entry

```javascript
const updates = {
  clock_out: '2025-10-12T17:30:00Z',
  notes: 'Updated clock out time'
};

try {
  const result = await apiService.updateTimeEntry('entry_uuid', updates);
  console.log('Entry updated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Delete Time Entry

```javascript
try {
  const result = await apiService.deleteTimeEntry('entry_uuid');
  console.log('Entry deleted:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## ✅ Approvals (Manager/Admin)

### Get Pending Approvals

```javascript
try {
  const pending = await apiService.getPendingApprovals({ page: 1, limit: 20 });
  console.log('Pending approvals:', pending);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Approve Time Entry

```javascript
try {
  const result = await apiService.approveTimeEntry('entry_uuid', {
    notes: 'Approved - valid overtime'
  });
  console.log('Entry approved:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Reject Time Entry

```javascript
try {
  const result = await apiService.rejectTimeEntry('entry_uuid', {
    reason: 'Invalid location'
  });
  console.log('Entry rejected:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Bulk Approve Entries

```javascript
const entryIds = ['uuid1', 'uuid2', 'uuid3'];

try {
  const result = await apiService.bulkApproveEntries(entryIds);
  console.log('Bulk approved:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Approval History

```javascript
try {
  const history = await apiService.getApprovalHistory({ page: 1, limit: 20 });
  console.log('Approval history:', history);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 📊 Analytics (Manager/Admin)

### Get Analytics Overview

```javascript
try {
  const overview = await apiService.getAnalyticsOverview();
  console.log('Analytics overview:', overview);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Productivity Metrics

```javascript
try {
  const metrics = await apiService.getProductivityMetrics({ period: 'weekly' });
  // period options: 'daily', 'weekly', 'monthly'
  console.log('Productivity:', metrics);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Attendance Analytics

```javascript
const params = {
  start_date: '2025-10-01',
  end_date: '2025-10-31'
};

try {
  const attendance = await apiService.getAttendanceAnalytics(params);
  console.log('Attendance:', attendance);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Overtime Analytics

```javascript
try {
  const overtime = await apiService.getOvertimeAnalytics({ period: 'monthly' });
  console.log('Overtime:', overtime);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Team Performance

```javascript
try {
  const performance = await apiService.getTeamPerformance({ team_id: 1 });
  console.log('Team performance:', performance);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 📈 Reports

### Generate Timesheet Report

```javascript
const params = {
  user_id: 1,
  start_date: '2025-10-01',
  end_date: '2025-10-31',
  format: 'pdf' // 'pdf', 'excel', or 'csv'
};

try {
  const report = await apiService.generateTimesheetReport(params);
  console.log('Timesheet report:', report);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Generate Attendance Report

```javascript
const params = {
  team_id: 1,
  start_date: '2025-10-01',
  end_date: '2025-10-31'
};

try {
  const report = await apiService.generateAttendanceReport(params);
  console.log('Attendance report:', report);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Generate Productivity Report

```javascript
try {
  const report = await apiService.generateProductivityReport({
    period: 'monthly',
    format: 'excel'
  });
  console.log('Productivity report:', report);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Export Reports

```javascript
const params = {
  type: 'timesheet',
  format: 'pdf',
  start_date: '2025-10-01',
  end_date: '2025-10-31'
};

try {
  const report = await apiService.exportReports(params);
  console.log('Report exported:', report);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## ⚙️ Settings

### Profile Settings

```javascript
// Get settings
try {
  const settings = await apiService.getProfileSettings();
  console.log('Profile settings:', settings);
} catch (error) {
  console.error('Error:', error.message);
}

// Update settings
const updates = {
  timezone: 'America/New_York',
  date_format: 'MM/DD/YYYY',
  time_format: '12h'
};

try {
  const result = await apiService.updateProfileSettings(updates);
  console.log('Settings updated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Notification Settings

```javascript
// Get settings
try {
  const settings = await apiService.getNotificationSettings();
  console.log('Notification settings:', settings);
} catch (error) {
  console.error('Error:', error.message);
}

// Update settings
const updates = {
  email_notifications: true,
  push_notifications: true,
  approval_notifications: true,
  overtime_alerts: true
};

try {
  const result = await apiService.updateNotificationSettings(updates);
  console.log('Settings updated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Work Preferences

```javascript
// Get preferences
try {
  const prefs = await apiService.getWorkPreferences();
  console.log('Work preferences:', prefs);
} catch (error) {
  console.error('Error:', error.message);
}

// Update preferences
const updates = {
  work_hours_per_day: 8,
  work_days_per_week: 5,
  break_duration: 30,
  lunch_duration: 60
};

try {
  const result = await apiService.updateWorkPreferences(updates);
  console.log('Preferences updated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### System Settings (Admin Only)

```javascript
// Get system settings
try {
  const settings = await apiService.getSystemSettings();
  console.log('System settings:', settings);
} catch (error) {
  console.error('Error:', error.message);
}

// Update system settings
const updates = {
  company_name: 'Wayne Enterprises',
  default_work_hours: 8,
  overtime_rate: 1.5,
  gps_tracking_enabled: true
};

try {
  const result = await apiService.updateSystemSettings(updates);
  console.log('Settings updated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 💰 Payroll

### Get Payroll Summary

```javascript
try {
  const summary = await apiService.getPayrollSummary({ period: 'current' });
  console.log('Payroll summary:', summary);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Payroll History

```javascript
try {
  const history = await apiService.getPayrollHistory({ page: 1, limit: 20 });
  console.log('Payroll history:', history);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Generate Payroll (Admin Only)

```javascript
const payload = {
  start_date: '2025-10-01',
  end_date: '2025-10-31'
};

try {
  const result = await apiService.generatePayroll(payload);
  console.log('Payroll generated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Pay Rates

```javascript
try {
  const rates = await apiService.getPayRates();
  console.log('Pay rates:', rates);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Update Pay Rates (Admin Only)

```javascript
const rates = {
  hourly_rate: 25.00,
  overtime_rate: 37.50
};

try {
  const result = await apiService.updatePayRates(userId, rates);
  console.log('Rates updated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🔔 Notifications

### List Notifications

```javascript
const params = {
  page: 1,
  limit: 20,
  unread_only: false
};

try {
  const notifications = await apiService.listNotifications(params);
  console.log('Notifications:', notifications);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get Unread Count

```javascript
try {
  const count = await apiService.getUnreadCount();
  console.log('Unread count:', count);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Mark Notification as Read

```javascript
try {
  const result = await apiService.markNotificationRead(notificationId);
  console.log('Marked as read:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Mark All as Read

```javascript
try {
  const result = await apiService.markAllNotificationsRead();
  console.log('All marked as read:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Delete Notification

```javascript
try {
  const result = await apiService.deleteNotification(notificationId);
  console.log('Notification deleted:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Update Notification Preferences

```javascript
const preferences = {
  email_notifications: true,
  push_notifications: true,
  approval_notifications: true,
  overtime_alerts: true,
  reminder_notifications: true
};

try {
  const result = await apiService.updateNotificationPreferences(preferences);
  console.log('Preferences updated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 👥 User Management (Admin Only)

### List All Users

```javascript
try {
  const users = await apiService.listUsers();
  console.log('Users:', users);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Create User

```javascript
const newUser = {
  user: {
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    username: 'janedoe',
    password: 'password123',
    role_id: 1
  }
};

try {
  const result = await apiService.createUser(newUser);
  console.log('User created:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Get User by ID

```javascript
try {
  const user = await apiService.getUserById(userId);
  console.log('User details:', user);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Update User

```javascript
const updates = {
  user: {
    first_name: 'Jane Updated',
    last_name: 'Doe Updated',
    email: 'jane.updated@example.com'
  }
};

try {
  const result = await apiService.updateUser(userId, updates);
  console.log('User updated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Delete User

```javascript
try {
  const result = await apiService.deleteUser(userId);
  console.log('User deleted:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 👨‍👩‍👧‍👦 Team Management

### List Teams

```javascript
try {
  const teams = await apiService.listTeams();
  console.log('Teams:', teams);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Create Team

```javascript
const newTeam = {
  team: {
    name: 'Development Team',
    description: 'Main development team'
  }
};

try {
  const result = await apiService.createTeam(newTeam);
  console.log('Team created:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Assign Manager to Team

```javascript
try {
  const result = await apiService.assignTeamManager(teamId, { manager_id: 2 });
  console.log('Manager assigned:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 📁 Project Management

### List Projects

```javascript
try {
  const projects = await apiService.listProjects();
  console.log('Projects:', projects);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Create Project

```javascript
const newProject = {
  project: {
    name: 'Wayne Enterprises Portal',
    description: 'Employee portal for Wayne Enterprises'
  }
};

try {
  const result = await apiService.createProject(newProject);
  console.log('Project created:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## ✓ Task Management

### List Tasks

```javascript
try {
  const tasks = await apiService.listTasks();
  console.log('Tasks:', tasks);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Create Task

```javascript
const newTask = {
  task: {
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication',
    status: 1, // 1: To Do, 2: In Progress, 3: Under Review, 4: Done
    user_ids: [1, 2]
  }
};

try {
  const result = await apiService.createTask(newTask);
  console.log('Task created:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Update Task Status

```javascript
try {
  const result = await apiService.updateTaskStatus(taskId, 3);
  // Status: 1=To Do, 2=In Progress, 3=Under Review, 4=Done
  console.log('Task status updated:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 📅 Schedule Management

### List Schedules

```javascript
try {
  const schedules = await apiService.listSchedules();
  console.log('Schedules:', schedules);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Create Schedule

```javascript
const newSchedule = {
  schedule: {
    user_id: 1,
    start_time: '09:00:00',
    end_time: '17:00:00',
    date: '2025-10-15'
  }
};

try {
  const result = await apiService.createSchedule(newSchedule);
  console.log('Schedule created:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Batch Create Schedules

```javascript
const schedules = [
  {
    user_id: 1,
    start_time: '09:00:00',
    end_time: '17:00:00',
    date: '2025-10-15'
  },
  {
    user_id: 2,
    start_time: '10:00:00',
    end_time: '18:00:00',
    date: '2025-10-15'
  }
];

try {
  const result = await apiService.createBatchSchedules(schedules);
  console.log('Schedules created:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## ⏱️ Working Times

### List Working Times

```javascript
try {
  const workingTimes = await apiService.listWorkingTimes();
  console.log('Working times:', workingTimes);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Log Unpaid Overtime

```javascript
const overtimeData = {
  hours: 2.5,
  date: '2025-10-12',
  reason: 'Project deadline'
};

try {
  const result = await apiService.logUnpaidOvertime(overtimeData);
  console.log('Overtime logged:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🔧 Error Handling

### Best Practices

```javascript
// Always use try-catch blocks
try {
  const data = await apiService.someMethod();
  // Handle success
} catch (error) {
  // Handle specific errors
  if (error.message.includes('401')) {
    // Handle authentication error
    console.error('Please login again');
    // Redirect to login
  } else if (error.message.includes('403')) {
    // Handle permission error
    console.error('You don\'t have permission');
  } else if (error.message.includes('404')) {
    // Handle not found
    console.error('Resource not found');
  } else {
    // Handle general error
    console.error('Error:', error.message);
  }
}
```

### Global Error Handler Example

```javascript
// Create a wrapper function for API calls
async function apiCall(fn, ...args) {
  try {
    return await fn(...args);
  } catch (error) {
    // Log to error service
    console.error('API Error:', error);
    
    // Handle token expiration
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      // Clear tokens and redirect to login
      apiService.clearTokens();
      window.location.href = '/login';
      return;
    }
    
    // Show user-friendly message
    showToast('error', error.message);
    throw error;
  }
}

// Usage
const data = await apiCall(apiService.getTimeEntries, { page: 1 });
```

---

## 📝 Notes

- All methods that require authentication will automatically include the JWT token
- Tokens are saved automatically after successful login/register
- CSRF tokens are handled automatically for state-changing requests
- All date parameters should be in ISO format (YYYY-MM-DD)
- Pagination parameters default to page=1, limit=20

---

## 🔗 Related Documentation

- **[API Testing Guide](../../../api-testing/README.md)** - Postman collection and testing
- **[API Endpoints Reference](../../../api-testing/API_ENDPOINTS.md)** - Complete endpoint list
- **[Quick Start Guide](../../../api-testing/QUICK_START.md)** - API testing quick start

---

**Last Updated:** October 12, 2025  
**Version:** 1.0  
**Total Endpoints:** 87

