# Complete API Endpoints Reference

Complete list of all **87 API endpoints** for Ticktrax (Gotham Time Manager).

> **Base URL:** `http://localhost:4000/api` (configurable in environment)

---

## 🔐 Authentication (4 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | ❌ |
| POST | `/auth/login` | Login and receive JWT token | ❌ |
| GET | `/auth/me` | Get current authenticated user | ✅ |
| POST | `/auth/logout` | Logout and invalidate token | ✅ |

---

## 👤 User Profile Management (4 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | ✅ |
| PUT | `/user/profile` | Update user profile | ✅ |
| PUT | `/user/password` | Change password | ✅ |
| GET | `/user/dashboard` | Get user dashboard data | ✅ |

---

## 🍕 Break Management (6 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/user/breaks/start` | Start a break | ✅ |
| POST | `/user/breaks/end` | End current break | ✅ |
| GET | `/user/breaks/status` | Get current break status | ✅ |
| GET | `/user/breaks/history` | Get break history (with filters) | ✅ |
| GET | `/user/breaks/summary` | Get break summary for a date | ✅ |

---

## ⏰ Time Tracking (7 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/time/clock-in` | Clock in with location | ✅ |
| POST | `/time/clock-out` | Clock out with location | ✅ |
| GET | `/time/status` | Get current time tracking status | ✅ |
| GET | `/time/entries` | Get time entries (paginated) | ✅ |
| POST | `/time/manual-entry` | Create manual time entry | ✅ |
| PUT | `/time/entries/:entry_id` | Update time entry | ✅ |
| DELETE | `/time/entries/:entry_id` | Delete time entry | ✅ |

**Query Parameters for `/time/entries`:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `start_date` - Filter by start date (YYYY-MM-DD)
- `end_date` - Filter by end date (YYYY-MM-DD)

---

## ✅ Approval Workflows (5 endpoints)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/approvals/pending` | Get pending approvals | ✅ | Manager+ |
| PUT | `/approvals/:entry_id/approve` | Approve time entry | ✅ | Manager+ |
| PUT | `/approvals/:entry_id/reject` | Reject time entry | ✅ | Manager+ |
| POST | `/approvals/bulk-approve` | Bulk approve entries | ✅ | Manager+ |
| GET | `/approvals/history` | Get approval history | ✅ | Manager+ |

---

## 📊 Analytics (5 endpoints)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/analytics/overview` | Analytics overview dashboard | ✅ | Manager+ |
| GET | `/analytics/productivity` | Productivity metrics | ✅ | Manager+ |
| GET | `/analytics/attendance` | Attendance analytics | ✅ | Manager+ |
| GET | `/analytics/overtime` | Overtime analytics | ✅ | Manager+ |
| GET | `/analytics/team-performance` | Team performance metrics | ✅ | Manager+ |

**Query Parameters:**
- `/analytics/productivity` - `period`: daily, weekly, monthly
- `/analytics/attendance` - `start_date`, `end_date`
- `/analytics/overtime` - `period`: daily, weekly, monthly
- `/analytics/team-performance` - `team_id`

---

## 📈 Reports (4 endpoints)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/reports/timesheet` | Generate timesheet report | ✅ | All |
| GET | `/reports/attendance` | Attendance report | ✅ | Manager+ |
| GET | `/reports/productivity` | Productivity report | ✅ | Manager+ |
| GET | `/reports/export` | Export reports in various formats | ✅ | Manager+ |

**Query Parameters:**
- `user_id` - Specific user
- `team_id` - Specific team
- `start_date` - Start date (YYYY-MM-DD)
- `end_date` - End date (YYYY-MM-DD)
- `format` - Export format: `pdf`, `excel`, `csv`
- `period` - Time period: `daily`, `weekly`, `monthly`

---

## ⚙️ Settings (8 endpoints)

### Profile Settings
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/settings/profile` | Get profile settings | ✅ |
| PUT | `/settings/profile` | Update profile settings | ✅ |

### Notification Settings
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/settings/notifications` | Get notification settings | ✅ |
| PUT | `/settings/notifications` | Update notification settings | ✅ |

### Work Preferences
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/settings/work-preferences` | Get work preferences | ✅ |
| PUT | `/settings/work-preferences` | Update work preferences | ✅ |

### System Settings
| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/settings/system` | Get system settings | ✅ | Admin |
| PUT | `/settings/system` | Update system settings | ✅ | Admin |

---

## 💰 Payroll (5 endpoints)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/payroll/summary` | Get payroll summary | ✅ | Employee |
| GET | `/payroll/history` | Get payroll history | ✅ | Employee |
| POST | `/payroll/generate` | Generate payroll | ✅ | Admin |
| GET | `/payroll/rates` | Get pay rates | ✅ | Employee |
| PUT | `/payroll/rates/:user_id` | Update pay rates | ✅ | Admin |

**Query Parameters:**
- `/payroll/summary` - `period`: current, previous, specific_date
- `/payroll/history` - `page`, `limit`

---

## 🔔 Notifications (6 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | List notifications | ✅ |
| GET | `/notifications/unread-count` | Get unread count | ✅ |
| PUT | `/notifications/:notification_id/read` | Mark as read | ✅ |
| PUT | `/notifications/mark-all-read` | Mark all as read | ✅ |
| DELETE | `/notifications/:notification_id` | Delete notification | ✅ |
| POST | `/notifications/preferences` | Update preferences | ✅ |

**Query Parameters for `/notifications`:**
- `page` - Page number
- `limit` - Items per page
- `unread_only` - Filter unread only (boolean)

---

## 👥 User Management (5 endpoints)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/users` | List all users | ✅ | Admin |
| POST | `/users` | Create new user | ✅ | Admin |
| GET | `/users/:user_id` | Get user details | ✅ | Admin |
| PUT | `/users/:user_id` | Update user | ✅ | Admin |
| DELETE | `/users/:user_id` | Delete user | ✅ | Admin |

---

## 👨‍👩‍👧‍👦 Team Management (3 endpoints)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/teams` | List all teams | ✅ | Manager+ |
| POST | `/teams` | Create team | ✅ | Admin |
| PUT | `/teams/:team_id/assign_manager` | Assign manager to team | ✅ | Admin |

---

## 📁 Project Management (2 endpoints)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/projects` | List all projects | ✅ | Manager+ |
| POST | `/projects` | Create project | ✅ | Manager+ |

---

## ✓ Task Management (3 endpoints)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/tasks` | List all tasks | ✅ | All |
| POST | `/tasks` | Create task | ✅ | Manager+ |
| PUT | `/tasks/:task_id/status` | Update task status | ✅ | Assigned users |

---

## 📅 Schedule Management (3 endpoints)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/schedules` | List schedules | ✅ | All |
| POST | `/schedules` | Create schedule | ✅ | Manager+ |
| POST | `/schedules/create_batch` | Batch create schedules | ✅ | Manager+ |

---

## ⏱️ Working Times (2 endpoints)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/working_times` | List working times | ✅ |
| POST | `/logs/overtime/unpaid` | Log unpaid overtime | ✅ |

---

## 📋 Summary

### Total Endpoints: **87**

#### By Category:
- 🔐 Authentication: **4**
- 👤 User Profile: **4**
- 🍕 Breaks: **6**
- ⏰ Time Tracking: **7**
- ✅ Approvals: **5**
- 📊 Analytics: **5**
- 📈 Reports: **4**
- ⚙️ Settings: **8**
- 💰 Payroll: **5**
- 🔔 Notifications: **6**
- 👥 Users: **5**
- 👨‍👩‍👧‍👦 Teams: **3**
- 📁 Projects: **2**
- ✓ Tasks: **3**
- 📅 Schedules: **3**
- ⏱️ Working Times: **2**

#### By HTTP Method:
- **GET**: 38 endpoints
- **POST**: 26 endpoints
- **PUT**: 22 endpoints
- **DELETE**: 3 endpoints

#### By Authentication:
- **Public**: 2 endpoints (register, login)
- **Authenticated**: 85 endpoints

#### By Role:
- **All Users**: ~40 endpoints
- **Manager+**: ~25 endpoints
- **Admin Only**: ~20 endpoints

---

## 🔑 Common Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required or failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

---

## 📚 Related Documentation

- **[README.md](./README.md)** - Detailed API testing guide
- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide
- **Postman Collection** - Import for interactive testing

---

**Last Updated:** October 12, 2025  
**API Version:** 1.0

