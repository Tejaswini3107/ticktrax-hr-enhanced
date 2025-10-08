# TickTrax Backend API - Complete Implementation Guide

## 🚀 Server Information
- **Base URL:** `http://localhost:4001/api`
- **Database:** PostgreSQL (gotham_time_manager_demo)
- **CORS:** Enabled for localhost:3000, localhost:3005, and localhost:5173
- **Authentication:** JWT tokens with XSRF protection

---

## 🔐 Public APIs (No Authentication Required)

### 1. User Registration
**Endpoint:** `POST /api/users`
**Purpose:** Create a new user account

```bash
curl -X POST http://localhost:4001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "role": "employee"
  }'
```

**Success Response (201):**
```json
{
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "employee"
  }
}
```

### 2. User Login
**Endpoint:** `POST /api/login`
**Purpose:** Authenticate user and get JWT token

**Login with Email:**
```bash
curl -X POST http://localhost:4001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

**Login with Username:**
```bash
curl -X POST http://localhost:4001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepassword123"
  }'
```

**Success Response (200):**
```json
{
  "status": "ok",
  "user_id": 1,
  "email": "john.doe@example.com",
  "role": "employee",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "xsrf_token": "abc123xyz789"
}
```

---

## 🛡️ Protected APIs (Authentication Required)

**Headers Required:**
```bash
Authorization: Bearer <jwt_token>
x-csrf-token: <xsrf_token>
```

### User Management APIs

#### 3. List All Users
**Endpoint:** `GET /api/users`
**Purpose:** Get all users in the system

```bash
curl -X GET http://localhost:4001/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-csrf-token: abc123xyz789"
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
      "role": "employee"
    },
    {
      "id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "role": "manager"
    }
  ]
}
```

#### 4. Get User by ID
**Endpoint:** `GET /api/users/:id`
**Purpose:** Get specific user details

```bash
curl -X GET http://localhost:4001/api/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-csrf-token: abc123xyz789"
```

#### 5. Update User
**Endpoint:** `PUT /api/users/:id`

```bash
curl -X PUT http://localhost:4001/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-csrf-token: abc123xyz789" \
  -d '{
    "first_name": "John Updated",
    "last_name": "Doe",
    "email": "john.updated@example.com"
  }'
```

#### 6. Delete User
**Endpoint:** `DELETE /api/users/:id`
**Purpose:** Remove user from system

```bash
curl -X DELETE http://localhost:4001/api/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-csrf-token: abc123xyz789"
```

---

### Task Management APIs

#### 7. List All Tasks
**Endpoint:** `GET /api/tasks`
**Purpose:** Get all tasks in the system

```bash
curl -X GET http://localhost:4001/api/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-csrf-token: abc123xyz789"
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Complete project setup",
      "description": "Set up the initial project structure and dependencies",
      "status": 2,
      "assigned_user_id": 1,
      "created_at": "2025-10-06T10:00:00Z"
    },
    {
      "id": 2,
      "title": "Database design",
      "description": "Design the database schema for the application",
      "status": 3,
      "assigned_user_id": 2,
      "created_at": "2025-10-05T14:30:00Z"
    }
  ]
}
```

#### 8. Create Task
**Endpoint:** `POST /api/tasks`

```bash
curl -X POST http://localhost:4001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-csrf-token: abc123xyz789" \
  -d '{
    "title": "Implement user authentication",
    "description": "Create login and registration functionality with JWT tokens",
    "status": 1,
    "assigned_user_id": 1
  }'
```

#### 9. Get Task by ID
**Endpoint:** `GET /api/tasks/:id`
**Purpose:** Get specific task details

```bash
curl -X GET http://localhost:4001/api/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-csrf-token: abc123xyz789"
```

#### 10. Update Task
**Endpoint:** `PUT /api/tasks/:id`

```bash
curl -X PUT http://localhost:4001/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-csrf-token: abc123xyz789" \
  -d '{
    "title": "Complete project setup - Updated",
    "description": "Updated description with more details",
    "status": 4,
    "assigned_user_id": 1
  }'
```

#### 11. Delete Task
**Endpoint:** `DELETE /api/tasks/:id`
**Purpose:** Remove task from system

```bash
curl -X DELETE http://localhost:4001/api/tasks/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-csrf-token: abc123xyz789"
```

#### 12. Get Tasks by User
**Endpoint:** `GET /api/tasks/users/:user_id`
**Purpose:** Get all tasks assigned to a specific user

```bash
curl -X GET http://localhost:4001/api/tasks/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-csrf-token: abc123xyz789"
```

---

## 📊 Task Status Reference

The task status field accepts these values:

| Status | Value | Label |
|--------|--------|-------|
| 1 | To Do | New tasks, not started |
| 2 | In Progress | Currently being worked on |
| 3 | Under Review | Completed, awaiting review |
| 4 | Done | Completed and approved |

---

## 🔒 Authentication Notes

- **JWT Token:** Include in `Authorization: Bearer <token>` header
- **XSRF Token:** Include in `x-csrf-token: <token>` header (note: lowercase)
- **Session:** XSRF token is also stored in session cookie
- **CORS:** Configured for localhost:3000, localhost:3005, and localhost:5173

---

## 🛠️ Frontend Integration Updates Needed

Based on the actual backend APIs, your frontend needs these updates:

### 1. Update API Service Headers
```javascript
// In apiService.js - update header name
config.headers['x-csrf-token'] = xsrfToken;  // lowercase, not 'X-XSRF-TOKEN'
```

### 2. Update Registration Flow
```javascript
// Registration uses POST /api/users, not /api/register
async register(userData) {
  return this.request('/users', 'POST', userData);
}
```

### 3. Remove Non-existent Endpoints
Your frontend currently references these endpoints that don't exist in the backend:
- ❌ `/logout` - Not implemented in backend
- ❌ `/time/*` - No time tracking APIs in backend
- ❌ `/reports/*` - No reporting APIs in backend
- ❌ `/teams/*` - No team management APIs in backend

### 4. Task Status Updates
Update your task status handling to use the correct values:
```javascript
const TASK_STATUS = {
  TODO: 1,          // "To Do"
  IN_PROGRESS: 2,   // "In Progress" 
  UNDER_REVIEW: 3,  // "Under Review"
  DONE: 4           // "Done"
};
```

---

## 🚀 Implementation Priority

### Phase 1: Authentication (Working)
- [x] Login endpoint (`POST /api/login`)
- [x] User registration (`POST /api/users`)
- [ ] Fix XSRF header casing

### Phase 2: User Management
- [ ] Connect to users API endpoints
- [ ] Update role-based access control
- [ ] User profile management

### Phase 3: Task Management
- [ ] Implement task CRUD operations
- [ ] Task assignment functionality
- [ ] Status workflow management

### Phase 4: Frontend Alignment
- [ ] Remove time tracking UI (not supported by backend)
- [ ] Focus on task management features
- [ ] Update navigation and dashboards

---

## 💡 Important Notes

1. **Your backend is focused on task management, not time tracking** - Consider updating your frontend to match this focus
2. **XSRF header case sensitivity** - Backend expects `x-csrf-token` (lowercase)
3. **No logout endpoint** - Handle logout client-side by clearing tokens
4. **User registration uses the same endpoint as user creation** - `POST /api/users`

The backend appears to be a task management system rather than a time tracking system. You may want to align your frontend features with the actual backend capabilities.
