# TickTrax Time Tracking - Complete API Implementation Guide

## 🚀 Quick Start
**Base URL:** `http://localhost:4001/api`
**Port:** 4001 (configurable via VITE_API_BASE_URL env var)

## 🔐 Authentication Flow
1. User logs in with email/username + password
2. Server returns JWT token + XSRF token
3. Frontend stores tokens and includes them in all subsequent requests
4. Protected routes require both tokens

---

## 📋 Complete API Reference with CURL Examples

### 1. AUTHENTICATION (Public Route)

#### Login
**Endpoint:** `POST /api/login`

**Frontend Implementation:**
- Login form with email/username field and password
- Store JWT and XSRF tokens
- Redirect to dashboard on success
- Show error messages on failure

```bash
curl -X POST http://localhost:4001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "demo123"
  }'
```

**Success Response (200):**
```json
{
  "status": "ok",
  "user_id": 1,
  "email": "john.doe@example.com",
  "role": "employee",
  "first_name": "John",
  "last_name": "Doe",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "xsrf_token": "abc123xyz789"
}
```

#### Logout
**Endpoint:** `POST /api/logout`

```bash
curl -X POST http://localhost:4001/api/logout \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-XSRF-TOKEN: <xsrf_token>"
```

#### Get Profile
**Endpoint:** `GET /api/me`

```bash
curl -X GET http://localhost:4001/api/me \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-XSRF-TOKEN: <xsrf_token>"
```

---

### 2. TIME TRACKING (Protected Routes)

All time tracking endpoints require authentication headers:
```bash
-H "Authorization: Bearer <jwt_token>"
-H "X-XSRF-TOKEN: <xsrf_token>"
```

#### Clock In
**Endpoint:** `POST /api/time/clock-in`

**Frontend Implementation:**
- Clock-in button in ClockWidget component
- Capture GPS location for field workers
- Update UI to show clocked-in status
- Start elapsed time counter

```bash
curl -X POST http://localhost:4001/api/time/clock-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-XSRF-TOKEN: abc123xyz789" \
  -d '{
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main Street, New York, NY"
    },
    "notes": "Starting work at main office"
  }'
```

**Success Response (201):**
```json
{
  "data": {
    "id": 123,
    "user_id": 1,
    "clock_in": "2025-10-06T09:00:00Z",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main Street, New York, NY"
    },
    "status": "active"
  }
}
```

#### Clock Out
**Endpoint:** `POST /api/time/clock-out`

**Frontend Implementation:**
- Clock-out button in ClockWidget component
- Calculate total hours worked
- Update timesheet view
- Reset elapsed time counter

```bash
curl -X POST http://localhost:4001/api/time/clock-out \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-XSRF-TOKEN: abc123xyz789" \
  -d '{
    "time_entry_id": 123,
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main Street, New York, NY"
    },
    "notes": "End of shift"
  }'
```

**Success Response (200):**
```json
{
  "data": {
    "id": 123,
    "user_id": 1,
    "clock_in": "2025-10-06T09:00:00Z",
    "clock_out": "2025-10-06T17:30:00Z",
    "total_hours": 8.5,
    "regular_hours": 8.0,
    "overtime_hours": 0.5,
    "status": "completed"
  }
}
```

#### Get Time Entries
**Endpoint:** `GET /api/time/entries`

**Frontend Implementation:**
- TimeManagement component timesheet table
- Filter by date range, status
- Show approval status badges
- Export functionality

```bash
curl -X GET "http://localhost:4001/api/time/entries?start_date=2025-10-01&end_date=2025-10-07" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-XSRF-TOKEN: abc123xyz789"
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 123,
      "date": "2025-10-06",
      "clock_in": "09:00:00",
      "clock_out": "17:30:00",
      "total_hours": 8.5,
      "regular_hours": 8.0,
      "overtime_hours": 0.5,
      "status": "approved",
      "location": "Main Office",
      "project": "Project Alpha",
      "is_manual": false
    },
    {
      "id": 122,
      "date": "2025-10-05",
      "clock_in": "08:45:00",
      "clock_out": "17:15:00",
      "total_hours": 8.5,
      "regular_hours": 8.0,
      "overtime_hours": 0.5,
      "status": "pending",
      "location": "Field Site A",
      "project": "Project Beta",
      "is_manual": true,
      "justification": "Forgot to clock in due to meeting"
    }
  ]
}
```

#### Update Time Entry
**Endpoint:** `PUT /api/time/entries/:id`

**Frontend Implementation:**
- Manual time entry correction
- "Forgot to Clock Out" feature
- Manager approval workflow
- Justification required for changes

```bash
curl -X PUT http://localhost:4001/api/time/entries/122 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-XSRF-TOKEN: abc123xyz789" \
  -d '{
    "time_entry": {
      "clock_out": "17:00:00",
      "justification": "System was down, manual correction needed",
      "manager_notes": ""
    }
  }'
```

---

### 3. USER MANAGEMENT (Protected Routes)

#### Get All Users (Admin/Manager only)
**Endpoint:** `GET /api/users`

**Frontend Implementation:**
- Users table in AdminDashboard
- Role badges and status indicators
- Search and filter functionality

```bash
curl -X GET http://localhost:4001/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-XSRF-TOKEN: abc123xyz789"
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "role": "employee",
      "department": "Production",
      "is_active": true,
      "current_status": "clocked_in"
    },
    {
      "id": 2,
      "first_name": "Sarah",
      "last_name": "Manager",
      "email": "sarah.manager@example.com",
      "role": "manager",
      "department": "Production",
      "is_active": true,
      "current_status": "clocked_out"
    }
  ]
}
```

#### Create User (Admin only)
**Endpoint:** `POST /api/users`

```bash
curl -X POST http://localhost:4001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-XSRF-TOKEN: abc123xyz789" \
  -d '{
    "user": {
      "first_name": "Alice",
      "last_name": "Johnson",
      "email": "alice.johnson@example.com",
      "role": "employee",
      "department": "Administration",
      "password": "temppass123"
    }
  }'
```

---

### 4. REPORTING (Protected Routes)

#### Timesheet Report
**Endpoint:** `GET /api/reports/timesheet`

**Frontend Implementation:**
- EmployeeReports component
- Personal timesheet data
- Export to CSV/PDF functionality

```bash
curl -X GET "http://localhost:4001/api/reports/timesheet?user_id=1&start_date=2025-10-01&end_date=2025-10-07" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-XSRF-TOKEN: abc123xyz789"
```

#### Team Report (Manager only)
**Endpoint:** `GET /api/reports/team`

**Frontend Implementation:**
- ManagerReports component
- Team performance metrics
- Attendance tracking

```bash
curl -X GET "http://localhost:4001/api/reports/team?team_id=5&start_date=2025-10-01&end_date=2025-10-07" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-XSRF-TOKEN: abc123xyz789"
```

#### Admin Report (Admin only)
**Endpoint:** `GET /api/reports/admin`

**Frontend Implementation:**
- AdminReports component
- System-wide analytics
- Compliance reporting

```bash
curl -X GET "http://localhost:4001/api/reports/admin?start_date=2025-10-01&end_date=2025-10-07" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "X-XSRF-TOKEN: abc123xyz789"
```

---

## 🛠️ Frontend Implementation Requirements

### 1. Authentication System
```javascript
// Required Components & Features
- LoginScreen component ✅
- AuthProvider context
- ProtectedRoute wrapper
- Token management utilities
- Logout functionality

// State Management
{
  user: { id, email, role, first_name, last_name, department },
  token: "jwt_token_string",
  xsrfToken: "xsrf_token_string",
  isAuthenticated: boolean,
  isLoading: boolean
}
```

### 2. Time Tracking Components
```javascript
// Required Components (Already implemented):
- ClockWidget ✅ - Main clock in/out interface
- TimeManagement ✅ - Timesheet view and manual entries
- LocationTracker ✅ - GPS location for field workers
- KioskMode ✅ - Warehouse terminal mode
- ForgotClockOut ✅ - Missing clock-out recovery
```

### 3. Dashboard Components
```javascript
// Role-based Dashboards (Already implemented):
- EmployeeDashboard ✅ - Personal time tracking
- ManagerDashboard ✅ - Team oversight
- AdminDashboard ✅ - System administration
```

### 4. Reporting Components
```javascript
// Reporting (Already implemented):
- EmployeeReports ✅ - Personal timesheets
- ManagerReports ✅ - Team analytics
- AdminReports ✅ - System reports
- HRReports ✅ - Compliance reports
```

### 5. API Service Integration
```javascript
// Update existing apiService.js to focus on time tracking:
class ApiService {
  // Authentication
  async login(credentials) { /* existing */ }
  async logout() { /* existing */ }
  async getProfile() { /* existing */ }
  
  // Time Tracking (Core Features)
  async clockIn(locationData) { /* implement */ }
  async clockOut(timeEntryId, locationData) { /* implement */ }
  async getTimeEntries(filters) { /* existing */ }
  async updateTimeEntry(id, data) { /* implement */ }
  
  // User Management (Admin features)
  async getUsers() { /* existing */ }
  async createUser(userData) { /* existing */ }
  async updateUser(id, userData) { /* existing */ }
  
  // Reporting
  async getTimesheetReport(filters) { /* existing */ }
  async getTeamReport(filters) { /* existing */ }
  async getAdminReport(filters) { /* existing */ }
}
```

### 6. Required UI Features
```javascript
// Time Clock Interface:
- Large clock in/out buttons ✅
- Real-time elapsed time display ✅
- Location tracking for field workers ✅
- Current status badge ✅

// Timesheet Management:
- Weekly/monthly timesheet views ✅
- Approval status indicators ✅
- Manual time entry forms ✅
- Export functionality ✅

// Manager Features:
- Team status dashboard ✅
- Timesheet approval workflow ✅
- Exception handling ✅
- Bulk approval actions ✅
```

### 7. Removed Features
❌ **Removed from API Guide:**
- Task management endpoints (`/tasks/*`)
- Task status management
- Task assignment features
- Project task tracking

**Reason:** Your TickTrax application is focused on **time tracking**, not task management. The existing components show:
- Employee time clock functionality
- Timesheet management
- Reporting and analytics
- User/role management
- Location tracking for field workers

---

## 🚀 Implementation Priority

### Phase 1: Core Time Tracking ✅ (Already Implemented)
- [x] Clock in/out functionality
- [x] Time tracking widgets
- [x] Basic timesheet viewing

### Phase 2: API Integration (Current Focus)
- [ ] Connect ClockWidget to `/time/clock-in` and `/time/clock-out` APIs
- [ ] Update TimeManagement to use `/time/entries` API
- [ ] Implement "Forgot Clock Out" API integration
- [ ] Connect reporting components to report APIs

### Phase 3: Advanced Features ✅ (Already Implemented)
- [x] Location tracking for field workers
- [x] Kiosk mode for warehouse terminals
- [x] Role-based dashboards
- [x] Manager approval workflows

### Phase 4: Production Ready
- [ ] Error handling and retry logic
- [ ] Offline capability
- [ ] Performance optimizations
- [ ] Security hardening

---

## 📝 Updated API Client Service

```javascript
// services/timeTrackingApi.js
class TimeTrackingApiService {
  constructor() {
    this.baseURL = 'http://localhost:4001/api';
  }

  // Time Tracking Core
  async clockIn(locationData = null) {
    const payload = {};
    if (locationData) {
      payload.location = locationData;
    }
    
    return this.authenticatedRequest('/time/clock-in', 'POST', payload);
  }

  async clockOut(timeEntryId, locationData = null) {
    const payload = { time_entry_id: timeEntryId };
    if (locationData) {
      payload.location = locationData;
    }
    
    return this.authenticatedRequest('/time/clock-out', 'POST', payload);
  }

  async getTimeEntries(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/time/entries${queryParams ? '?' + queryParams : ''}`;
    return this.authenticatedRequest(endpoint);
  }

  async updateTimeEntry(id, entryData) {
    return this.authenticatedRequest(`/time/entries/${id}`, 'PUT', { time_entry: entryData });
  }

  // Reports
  async getTimesheetReport(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/reports/timesheet${queryParams ? '?' + queryParams : ''}`;
    return this.authenticatedRequest(endpoint);
  }

  // Helper method for authenticated requests
  async authenticatedRequest(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('jwt_token');
    const xsrfToken = localStorage.getItem('xsrf_token');

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-XSRF-TOKEN': xsrfToken
      }
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

export default new TimeTrackingApiService();
```

This cleaned-up guide focuses specifically on the **time tracking functionality** that your TickTrax application actually needs, removing the irrelevant task management APIs and emphasizing the features you've already implemented in your Vue.js frontend.
