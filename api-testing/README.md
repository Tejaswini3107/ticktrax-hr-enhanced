# API Testing Guide for Ticktrax (Gotham Time Manager)

This directory contains comprehensive API testing resources for the Ticktrax Time Management System.

---

## 🎯 Quick Links

- **[⚡ Quick Start Guide](./QUICK_START.md)** - Get started in 5 minutes
- **[📋 Complete API Endpoints](./API_ENDPOINTS.md)** - All 87 endpoints reference

---

## 📋 Contents

- **Gotham Time Manager API.postman_collection.json** - Complete Postman collection with 87 API endpoints
- **Gotham_Time_Manager.postman_environment.json** - Environment variables for API testing
- **QUICK_START.md** - Quick start guide for rapid setup
- **API_ENDPOINTS.md** - Complete endpoint reference documentation

## 🚀 Quick Start

### Prerequisites
- [Postman](https://www.postman.com/downloads/) or [Insomnia](https://insomnia.rest/download) installed
- Backend API server running (default: `http://localhost:4000/api`)

### Import into Postman

1. **Open Postman**
2. **Import Collection**:
   - Click **Import** button (top left)
   - Select `Gotham Time Manager API.postman_collection.json`
   - Click **Import**

3. **Import Environment**:
   - Click **Environments** (left sidebar)
   - Click **Import** button
   - Select `Gotham_Time_Manager.postman_environment.json`
   - Click **Import**

4. **Activate Environment**:
   - Select **Gotham Time Manager Environment** from the environment dropdown (top right)

### Configure Base URL

The default base URL is `http://localhost:4000/api`. To change it:

1. Click **Environments** in left sidebar
2. Select **Gotham Time Manager Environment**
3. Update the `base_url` value
4. Click **Save**

## 📚 API Endpoints Overview

The collection includes **87 endpoints** organized into the following categories:

### 🔐 Authentication (4 endpoints)
- Register User
- Login (automatically saves JWT token)
- Get Current User
- Logout

### 👤 User Profile & Break Management (10 endpoints)
**Profile Management:**
- Get User Profile
- Update User Profile
- Change Password
- Get User Dashboard

**Break Management:**
- Start Break
- End Break
- Get Break Status
- Get Break History
- Get Break Summary

### ⏰ Time Tracking (7 endpoints)
- Clock In
- Clock Out
- Get Time Status
- Get Time Entries
- Create Manual Entry
- Update Time Entry
- Delete Time Entry

### ✅ Approval Workflows (5 endpoints)
- Get Pending Approvals
- Approve Time Entry
- Reject Time Entry
- Bulk Approve Entries
- Get Approval History

### 📊 Analytics (5 endpoints)
- Analytics Overview
- Productivity Metrics
- Attendance Analytics
- Overtime Analytics
- Team Performance

### 📈 Reports (4 endpoints)
- Generate Timesheet
- Attendance Report
- Productivity Report
- Export Reports

### ⚙️ Settings (8 endpoints)
- Get/Update Profile Settings
- Get/Update Notification Settings
- Get/Update Work Preferences
- Get/Update System Settings (Admin)

### 💰 Payroll (5 endpoints)
- Payroll Summary
- Payroll History
- Generate Payroll (Admin)
- Get Pay Rates
- Update Pay Rates (Admin)

### 🔔 Notifications (6 endpoints)
- List Notifications
- Get Unread Count
- Mark as Read
- Mark All as Read
- Delete Notification
- Update Preferences

### 🏢 Core Management (26+ endpoints)
**Users:** List, Create, Get, Update, Delete
**Teams:** List, Create, Assign Manager
**Projects:** List, Create
**Tasks:** List, Create, Update Status
**Schedules:** List, Create, Batch Create
**Working Times:** List, Log Unpaid Overtime

## 🔑 Authentication Flow

### 1. Register a New User
```http
POST {{base_url}}/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "password123",
  "role_id": 1
}
```

### 2. Login
```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Note:** The login endpoint has a test script that automatically saves the JWT token to the environment variable `jwt_token`.

### 3. Use Protected Endpoints
All subsequent requests will automatically include the JWT token in the `Authorization` header as:
```
Authorization: Bearer {{jwt_token}}
```

## 📝 Environment Variables

The environment file includes the following variables:

| Variable | Default Value | Description |
|----------|--------------|-------------|
| `base_url` | `http://localhost:4000/api` | Base API URL |
| `jwt_token` | _(empty)_ | Auto-populated after login |
| `user_id` | `1` | Sample user ID |
| `team_id` | `1` | Sample team ID |
| `project_id` | `1` | Sample project ID |
| `task_id` | `1` | Sample task ID |
| `entry_id` | `uuid-here` | Sample time entry UUID |
| `break_id` | `uuid-here` | Sample break UUID |
| `notification_id` | `1` | Sample notification ID |

## 🎯 Testing Workflow

### Basic Time Tracking Flow

1. **Login** → `POST /auth/login`
2. **Clock In** → `POST /time/clock-in`
3. **Check Status** → `GET /time/status`
4. **Start Break** → `POST /user/breaks/start`
5. **End Break** → `POST /user/breaks/end`
6. **Clock Out** → `POST /time/clock-out`
7. **View Entries** → `GET /time/entries`

### Manager Approval Flow

1. **Login as Manager** → `POST /auth/login`
2. **Get Pending Approvals** → `GET /approvals/pending`
3. **Approve Entry** → `PUT /approvals/:entry_id/approve`
4. **Or Reject Entry** → `PUT /approvals/:entry_id/reject`
5. **View History** → `GET /approvals/history`

### Admin Management Flow

1. **Login as Admin** → `POST /auth/login`
2. **Create User** → `POST /users`
3. **Create Team** → `POST /teams`
4. **Assign Manager** → `PUT /teams/:team_id/assign_manager`
5. **View Analytics** → `GET /analytics/overview`
6. **Generate Payroll** → `POST /payroll/generate`

## 🔧 Customizing Requests

### Using Path Variables
Some endpoints use path variables (e.g., `:user_id`, `:entry_id`). Update these in the request URL or set them in the environment:

```
GET {{base_url}}/users/{{user_id}}
PUT {{base_url}}/time/entries/{{entry_id}}
```

### Query Parameters
Many endpoints support pagination and filtering:

```
GET {{base_url}}/time/entries?page=1&limit=20&start_date=2025-10-01&end_date=2025-10-31
```

### Request Bodies
Update request bodies in the **Body** tab (JSON format):

```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "work_location": "Office"
}
```

## 🐛 Troubleshooting

### Authentication Errors
- Ensure you've logged in and the JWT token is saved
- Check if token has expired (re-login if needed)
- Verify the `Authorization` header includes the Bearer token

### 404 Not Found
- Verify the backend API is running on the correct port
- Check the `base_url` in environment settings
- Ensure the endpoint path is correct

### CORS Errors
- Refer to `CORS_SETUP_GUIDE.md` in the project root
- Ensure backend allows requests from your origin

### Invalid Request Data
- Check request body format (must be valid JSON)
- Verify required fields are included
- Review API documentation for expected data types

## 📖 Additional Documentation

For more details about the API implementation, refer to:
- `BACKEND_API_GUIDE.md` - Backend API implementation details
- `CLEAN_API_GUIDE.md` - Clean API architecture guide
- `CORS_SETUP_GUIDE.md` - CORS configuration guide
- `REALTIME_FEATURES_GUIDE.md` - Real-time features documentation

## 🤝 Contributing

When adding new API endpoints:
1. Add the endpoint to the Postman collection
2. Update this README with endpoint details
3. Test thoroughly before committing
4. Update environment variables if needed

## 📞 Support

For issues or questions about the API:
- Check existing documentation in the project root
- Review the API implementation in the backend service
- Test with sample data provided in the collection

---

**Last Updated:** October 12, 2025  
**API Version:** 1.0  
**Collection Version:** 1.0

